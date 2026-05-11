import { Router, Request, Response } from 'express';
import { Db, ObjectId } from 'mongodb';
import { authenticateAdmin } from '../../middleware/authenticateAdmin';

const router = Router();

export function registerAdminRoutes(app: Router, client: Db): void {
  app.use(router);
  // Get dashboard data
  router.get('/admin/dashboard', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const userCount = await client.collection('users').countDocuments({});
      const classCount = await client.collection('classes').countDocuments({});
      const fileCount = await client.collection('files').countDocuments({});
      const notificationCount = await client.collection('notifications').countDocuments({});

      const studentCount = await client.collection('users').countDocuments({ AccountType: 'student' });
      const teacherCount = await client.collection('users').countDocuments({ AccountType: 'teacher' });

      res.json({
        status: 'success',
        msg: 'Dashboard data retrieved',
        data: {
          totalUsers: userCount,
          totalClasses: classCount,
          totalFiles: fileCount,
          totalNotifications: notificationCount,
          totalStudents: studentCount,
          totalTeachers: teacherCount,
        },
      });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Generate teacher token
  router.post('/admin/generate-token', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const { token } = req.body;

      if (!token) {
        res.json({ status: 'error', msg: 'Token is required', data: {} });
        return;
      }

      const tokenData = {
        token,
        Status: 'Unused',
        CreatedAt: Date.now(),
      };

      const result = await client.collection('tokens').insertOne(tokenData);

      if (result) {
        res.json({ status: 'success', msg: 'Token generated successfully', data: {} });
      } else {
        res.json({ status: 'error', msg: 'Failed to generate token', data: {} });
      }
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Get all tokens
  router.get('/admin/tokens', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const tokens = await client.collection('tokens').find({}).toArray();

      res.json({ status: 'success', msg: 'Tokens retrieved', data: { tokens } });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Delete token
  router.delete('/admin/token/delete', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const { tokenId } = req.body;

      if (!tokenId) {
        res.json({ status: 'error', msg: 'Token ID is required', data: {} });
        return;
      }

      await client.collection('tokens').deleteOne({ _id: new ObjectId(tokenId) });

      res.json({ status: 'success', msg: 'Token deleted successfully', data: {} });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Get all users (admin)
  router.get('/admin/users', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const users = await client.collection('users').find({}).toArray();

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

  // Delete user (admin)
  router.delete('/admin/user/delete', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        res.json({ status: 'error', msg: 'User ID is required', data: {} });
        return;
      }

      await client.collection('users').deleteOne({ _id: new ObjectId(userId) });
      await client.collection('loginTokens').deleteMany({ UserName: userId });

      res.json({ status: 'success', msg: 'User deleted successfully', data: {} });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Get all classes (admin)
  router.get('/admin/classes', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const classes = await client.collection('classes').find({}).toArray();

      res.json({ status: 'success', msg: 'Classes retrieved', data: { classes } });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Delete class (admin)
  router.delete('/admin/class/delete', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const { classId } = req.body;

      if (!classId) {
        res.json({ status: 'error', msg: 'Class ID is required', data: {} });
        return;
      }

      await client.collection('classes').deleteOne({ _id: new ObjectId(classId) });

      res.json({ status: 'success', msg: 'Class deleted successfully', data: {} });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Get all files (admin)
  router.get('/admin/files', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const files = await client.collection('files').find({}).toArray();

      res.json({ status: 'success', msg: 'Files retrieved', data: { files } });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Delete file (admin)
  router.delete('/admin/file/delete', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const { fileId } = req.body;

      if (!fileId) {
        res.json({ status: 'error', msg: 'File ID is required', data: {} });
        return;
      }

      await client.collection('files').deleteOne({ _id: new ObjectId(fileId) });

      res.json({ status: 'success', msg: 'File deleted successfully', data: {} });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Get recycle bin data (admin)
  router.get('/admin/recycle-bin', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const recycleData = await client.collection('recycleBin').find({}).toArray();

      res.json({ status: 'success', msg: 'Recycle bin data retrieved', data: { items: recycleData } });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Delete from recycle bin (admin)
  router.delete('/admin/recycle/delete', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const { itemId } = req.body;

      if (!itemId) {
        res.json({ status: 'error', msg: 'Item ID is required', data: {} });
        return;
      }

      await client.collection('recycleBin').deleteOne({ _id: new ObjectId(itemId) });

      res.json({ status: 'success', msg: 'Item deleted from recycle bin', data: {} });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Get all notifications (admin)
  router.get('/admin/notifications', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const notifications = await client.collection('notifications').find({}).toArray();

      res.json({ status: 'success', msg: 'Notifications retrieved', data: { notifications } });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Delete notification (admin)
  router.delete('/admin/notification/delete', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const { notificationId } = req.body;

      if (!notificationId) {
        res.json({ status: 'error', msg: 'Notification ID is required', data: {} });
        return;
      }

      await client.collection('notifications').deleteOne({ _id: new ObjectId(notificationId) });

      res.json({ status: 'success', msg: 'Notification deleted successfully', data: {} });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });
}

export default router;