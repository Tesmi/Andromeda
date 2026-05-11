import { Router, Request, Response } from 'express';
import { Db } from 'mongodb';
import { authenticate } from '../../middleware/authenticate';
import { User, AccountType } from '../../models/interfaces';
import { hashPassword, generateSalt } from '../../utils/crypto';

const router = Router();

export function registerUserRoutes(app: Router, client: Db): void {
  app.use(router);
  // Get user profile
  router.get('/api/user/profile', authenticate, async (req: Request, res: Response) => {
    try {
      const username = req.user?.name;

      if (!username) {
        res.json({ status: 'error', msg: 'User not found', data: {} });
        return;
      }

      const user = await client.collection<User>('users').findOne({ UserName: username });

      if (!user) {
        res.json({ status: 'error', msg: 'User not found', data: {} });
        return;
      }

      res.json({
        status: 'success',
        msg: 'User profile retrieved',
        data: {
          id: user._id?.toString() || '',
          email: user.Email,
          name: user.UserName,
          role: user.AccountType,
          phone: user.Contact || '',
          profileImage: user.ProfilePic || '',
          createdAt: user.createdAt,
        },
      });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Update profile
  router.put('/api/user/update-profile', authenticate, async (req: Request, res: Response) => {
    try {
      const username = req.user?.name;
      const { fullname, phone, profileImage } = req.body;

      if (!username) {
        res.json({ status: 'error', msg: 'User not found', data: {} });
        return;
      }

      const updateData: Partial<User> = {};

      if (fullname) updateData.FullName = fullname;
      if (phone) updateData.Contact = phone;
      if (profileImage) updateData.ProfilePic = profileImage;

      const result = await client.collection<User>('users').findOneAndUpdate(
        { UserName: username },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      if (result) {
        res.json({
          status: 'success',
          msg: 'Profile updated successfully',
          data: {
            name: result.UserName,
            email: result.Email,
            phone: result.Contact,
            profileImage: result.ProfilePic,
          },
        });
      } else {
        res.json({ status: 'error', msg: 'Failed to update profile', data: {} });
      }
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Change password
  router.post('/api/auth/change-password', authenticate, async (req: Request, res: Response) => {
    try {
      const username = req.user?.name;
      const { currentPassword, newPassword } = req.body;

      if (!username || !currentPassword || !newPassword) {
        res.json({ status: 'error', msg: 'All fields are required', data: {} });
        return;
      }

      const user = await client.collection<User>('users').findOne({ UserName: username });

      if (!user) {
        res.json({ status: 'error', msg: 'User not found', data: {} });
        return;
      }

      const hashedCurrentPassword = hashPassword(currentPassword, user.Salt);

      if (hashedCurrentPassword !== user.Password) {
        res.json({ status: 'error', msg: 'Current password is incorrect', data: {} });
        return;
      }

      const newSalt = generateSalt();
      const newHashedPassword = hashPassword(newPassword, newSalt);

      await client.collection<User>('users').updateOne(
        { UserName: username },
        { $set: { Password: newHashedPassword, Salt: newSalt } }
      );

      res.json({ status: 'success', msg: 'Password changed successfully', data: {} });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Delete account
  router.delete('/api/user/delete', authenticate, async (req: Request, res: Response) => {
    try {
      const username = req.user?.name;

      if (!username) {
        res.json({ status: 'error', msg: 'User not found', data: {} });
        return;
      }

      await client.collection('users').deleteOne({ UserName: username });
      await client.collection('loginTokens').deleteMany({ UserName: username });

      res.json({ status: 'success', msg: 'Account deleted successfully', data: {} });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Get all users (admin)
  router.get('/api/user/all', authenticate, async (req: Request, res: Response) => {
    try {
      if (req.user?.account !== 'admin') {
        res.json({ status: 'error', msg: 'Admin access required', data: {} });
        return;
      }

      const users = await client.collection<User>('users').find({}).toArray();

      const userList = users.map((u) => ({
        id: u._id?.toString() || '',
        username: u.UserName,
        email: u.Email,
        accountType: u.AccountType,
        createdAt: u.createdAt,
      }));

      res.json({ status: 'success', msg: 'Users retrieved', data: { users: userList } });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Forgot password (public)
  router.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
    try {
      const { email, newPassword } = req.body;

      if (!email || !newPassword) {
        res.json({ status: 'error', msg: 'Email and new password are required', data: {} });
        return;
      }

      const user = await client.collection<User>('users').findOne({ Email: email.trim().toLowerCase() });

      if (!user) {
        res.json({ status: 'error', msg: 'Email not found', data: {} });
        return;
      }

      const newSalt = generateSalt();
      const newHashedPassword = hashPassword(newPassword, newSalt);

      await client.collection<User>('users').updateOne(
        { Email: email.trim().toLowerCase() },
        { $set: { Password: newHashedPassword, Salt: newSalt } }
      );

      res.json({ status: 'success', msg: 'Password reset successfully', data: {} });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });
}

export default router;