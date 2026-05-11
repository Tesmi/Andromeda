import { Router, Request, Response } from 'express';
import { Db, ObjectId } from 'mongodb';
import crypto from 'crypto';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { hashPassword, generateSalt } from '../../utils/crypto';
import { User, AccountType, ApiResponse } from '../../models/interfaces';

const router = Router();

export function registerPublicRoutes(app: Router, client: Db): void {
  // Mount the router
  app.use(router);
  // Original login endpoint (query params)
  router.get('/public/login', async (req: Request, res: Response) => {
    try {
      const userNameOrEmail = req.query.user as string;
      const password = req.query.password as string;
      const fcm = req.query.fcm as string;

      if (!userNameOrEmail || !password) {
        res.json({ status: 'error', msg: 'Invalid username/email or password', data: {} });
        return;
      }

      const user = await client.collection<User>('users').findOne({
        $or: [
          { UserName: userNameOrEmail.trim().toUpperCase() },
          { Email: userNameOrEmail.trim().toLowerCase() },
        ],
      });

      if (!user) {
        res.json({ status: 'error', msg: 'Invalid username/email or password', data: {} });
        return;
      }

      const hashedPassword = hashPassword(password, user.Salt);

      if (hashedPassword === user.Password) {
        const tokenUser = { name: user.UserName, account: user.AccountType };
        const accessToken = generateAccessToken(tokenUser);
        const refreshToken = generateRefreshToken(tokenUser);

        await client.collection('loginTokens').insertOne({
          token: refreshToken,
          UserName: user.UserName,
          FCM: fcm || '',
        });

        res.json({
          status: 'success',
          msg: 'login successfull',
          data: { accessToken, refreshToken, accountType: user.AccountType },
        });
      } else {
        res.json({ status: 'error', msg: 'Invalid password', data: {} });
      }
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Login with token (refresh)
  router.get('/public/loginToken', async (req: Request, res: Response) => {
    try {
      const refreshToken = req.query.token as string;

      if (!refreshToken || refreshToken.trim() === '') {
        res.json({ status: 'error', msg: 'invalid_refresh_token', data: {} });
        return;
      }

      const tokenDoc = await client.collection('loginTokens').findOne({ token: refreshToken });

      if (!tokenDoc) {
        res.json({ status: 'error', msg: 'invalid_refresh_token', data: {} });
        return;
      }

      const user = verifyRefreshToken(refreshToken);

      if (!user) {
        res.json({ status: 'error', msg: 'invalid_refresh_token', data: {} });
        return;
      }

      const accessToken = generateAccessToken({ name: user.name, account: user.account });

      res.json({
        status: 'success',
        msg: 'login successfull',
        data: { accessToken, accountType: user.account },
      });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Logout
  router.get('/public/logout', async (req: Request, res: Response) => {
    const token = req.query.token as string;

    await client.collection('loginTokens').findOneAndDelete({ token });
    res.status(200).send();
  });

  // Flutter-compatible login endpoint (POST, JSON body)
  router.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password, fcm } = req.body;

      if (!email || !password) {
        res.json({ status: 'error', msg: 'Email and password are required', data: {} });
        return;
      }

      const user = await client.collection<User>('users').findOne({
        $or: [
          { UserName: email.trim().toUpperCase() },
          { Email: email.trim().toLowerCase() },
        ],
      });

      if (!user) {
        res.json({ status: 'error', msg: 'Invalid credentials', data: {} });
        return;
      }

      const hashedPassword = hashPassword(password, user.Salt);

      if (hashedPassword === user.Password) {
        const tokenUser = { name: user.UserName, account: user.AccountType };
        const accessToken = generateAccessToken(tokenUser);
        const refreshToken = generateRefreshToken(tokenUser);

        await client.collection('loginTokens').insertOne({
          token: refreshToken,
          UserName: user.UserName,
          FCM: fcm || '',
        });

        res.json({
          status: 'success',
          msg: 'Login successful',
          data: {
            token: accessToken,
            refreshToken,
            user: {
              id: user._id?.toString() || '',
              email: user.Email,
              name: user.UserName,
              role: user.AccountType,
              createdAt: user.createdAt,
            },
          },
        });
      } else {
        res.json({ status: 'error', msg: 'Invalid password', data: {} });
      }
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Register endpoint
  // router.post('/public/registerUser', async (req: Request, res: Response) => {
  //   try {
  //     const { fullname, email, contact, gender, accountType, password, grade, board, teacherKey } = req.body;
  //     console.log(req.body)
  //     if (!fullname || !email || !contact || !gender || !accountType || !password) {
  //       res.json({ status: 'error', msg: 'Registration failed due to missing required fields', data: {} });
  //       return;
  //     }

  //     const emailExists = await client.collection<User>('users').findOne({ Email: email.trim().toLowerCase() });

  //     if (emailExists) {
  //       res.json({ status: 'error', msg: 'Email already exist.', data: {} });
  //       return;
  //     }

  //     const salt = generateSalt();
  //     const hashedPassword = hashPassword(password, salt);
  //     const username = await generateUniqueUsername(fullname, client);

  //     if (username === 'error') {
  //       throw new Error('Unable to create user!');
  //     }

  //     const dateInIST = Date.now() + 19800000;

  //     const userData: Partial<User> = {
  //       FullName: toTitleCase(fullname),
  //       UserName: username,
  //       Email: email.trim().toLowerCase(),
  //       Contact: contact.trim(),
  //       Gender: gender.trim(),
  //       AccountType: accountType.trim() as AccountType,
  //       Password: hashedPassword,
  //       Salt: salt,
  //       CreatedOn: dateInIST,
  //     };

  //     if (accountType === 'teacher') {
  //       if (!teacherKey) {
  //         res.json({ status: 'error', msg: "Teacher's key is invalid", data: {} });
  //         return;
  //       }

  //       const isTokenValid = await client.collection('tokens').findOne({ token: teacherKey.trim(), Status: 'Unused' });

  //       if (!isTokenValid) {
  //         res.json({ status: 'error', msg: "Teacher's key is invalid", data: {} });
  //         return;
  //       }

  //       userData.Key = teacherKey.trim();

  //       const result = await client.collection('users').insertOne(userData);

  //       if (result) {
  //         await client.collection('tokens').updateOne(
  //           { token: teacherKey.trim() },
  //           { $set: { Status: 'Used', UsedBy: username, UsedDate: dateInIST } }
  //         );

  //         res.json({ status: 'success', msg: 'Registration is successfull', data: { username } });
  //         return;
  //       }
  //     } else if (accountType === 'student') {
  //       if (!board || !grade) {
  //         res.json({ status: 'error', msg: 'Registration failed due to invalid grade or board!', data: {} });
  //         return;
  //       }

  //       userData.Board = board;
  //       userData.Grade = grade;

  //       const result = await client.collection('users').insertOne(userData);

  //       if (result) {
  //         res.json({ status: 'success', msg: 'Registration is successfull', data: { username } });
  //         return;
  //       }
  //     } else {
  //       res.json({ status: 'error', msg: 'Registration failed due to invalid account type', data: {} });
  //       return;
  //     }

  //     res.json({ status: 'error', msg: 'Something went wrong', data: {} });
  //   } catch {
  //     res.json({ status: 'error', msg: 'Internal server error, try again later.', data: {} });
  //   }
  // });

  // Flutter-compatible register endpoint
  router.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { fullname, email, contact, gender, accountType, password, grade, board, teacherKey } = req.body;

      if (!fullname || !email || !contact || !gender || !accountType || !password) {
        res.json({ status: 'error', msg: 'All fields are required', data: {} });
        return;
      }

      const emailExists = await client.collection<User>('users').findOne({ Email: email.trim().toLowerCase() });

      if (emailExists) {
        res.json({ status: 'error', msg: 'Email already exists', data: {} });
        return;
      }

      const salt = generateSalt();
      const hashedPassword = hashPassword(password, salt);
      const username = await generateUniqueUsername(fullname, client);

      if (username === 'error') {
        throw new Error('Unable to create user!');
      }

      const dateInIST = Date.now() + 19800000;

      const userData: Partial<User> = {
        FullName: toTitleCase(fullname),
        UserName: username,
        Email: email.trim().toLowerCase(),
        Contact: contact.trim(),
        Gender: gender.trim(),
        AccountType: accountType.trim() as AccountType,
        Password: hashedPassword,
        Salt: salt,
        CreatedOn: dateInIST,
      };

      if (accountType === 'teacher') {
        if (!teacherKey) {
          res.json({ status: 'error', msg: 'Teacher key required', data: {} });
          return;
        }

        const isTokenValid = await client.collection('tokens').findOne({ token: teacherKey.trim(), Status: 'Unused' });

        if (!isTokenValid) {
          res.json({ status: 'error', msg: 'Invalid teacher key', data: {} });
          return;
        }

        userData.Key = teacherKey.trim();
        const result = await client.collection('users').insertOne(userData);

        if (result) {
          await client.collection('tokens').updateOne(
            { token: teacherKey.trim() },
            { $set: { Status: 'Used', UsedBy: username, UsedDate: dateInIST } }
          );

          // Generate tokens for auto-login after registration
          const tokenUser = { name: username, account: accountType.trim() };
          const accessToken = generateAccessToken(tokenUser);
          const refreshToken = generateRefreshToken(tokenUser);

          await client.collection('loginTokens').insertOne({
            token: refreshToken,
            UserName: username,
            FCM: '',
          });

          res.json({
            status: 'success',
            msg: 'Registration successful',
            data: {
              token: accessToken,
              refreshToken,
              user: {
                id: result.insertedId.toString(),
                email: email.trim().toLowerCase(),
                name: username,
                role: accountType.trim(),
                createdAt: dateInIST,
              },
            },
          });
          return;
        }
      } else if (accountType === 'student') {
        if (!board || !grade) {
          res.json({ status: 'error', msg: 'Grade and board are required for students', data: {} });
          return;
        }

        userData.Board = board;
        userData.Grade = grade;
      }

      const result = await client.collection('users').insertOne(userData);

      if (result) {
        // Generate tokens for auto-login after registration
        const tokenUser = { name: username, account: accountType.trim() };
        const accessToken = generateAccessToken(tokenUser);
        const refreshToken = generateRefreshToken(tokenUser);

        await client.collection('loginTokens').insertOne({
          token: refreshToken,
          UserName: username,
          FCM: '',
        });

        res.json({
          status: 'success',
          msg: 'Registration successful',
          data: {
            token: accessToken,
            refreshToken,
            user: {
              id: result.insertedId.toString(),
              email: email.trim().toLowerCase(),
              name: username,
              role: accountType.trim(),
              createdAt: dateInIST,
            },
          },
        });
      } else {
        res.json({ status: 'error', msg: 'Registration failed', data: {} });
      }
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Logout
  router.post('/api/auth/logout', async (req: Request, res: Response) => {
    const token = req.body.token || req.headers.authorization?.split(' ')[1];

    if (token) {
      await client.collection('loginTokens').findOneAndDelete({ token });
    }

    res.json({ status: 'success', msg: 'Logged out successfully', data: {} });
  });

  // Refresh token
  router.post('/api/auth/refresh-token', async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.json({ status: 'error', msg: 'Refresh token required', data: {} });
      return;
    }

    const tokenDoc = await client.collection('loginTokens').findOne({ token: refreshToken });

    if (!tokenDoc) {
      res.json({ status: 'error', msg: 'Invalid refresh token', data: {} });
      return;
    }

    const user = verifyRefreshToken(refreshToken);

    if (!user) {
      res.json({ status: 'error', msg: 'Invalid or expired token', data: {} });
      return;
    }

    const accessToken = generateAccessToken({ name: user.name, account: user.account });

    res.json({
      status: 'success',
      msg: 'Token refreshed',
      data: { token: accessToken },
    });
  });
}

async function generateUniqueUsername(fullname: string, client: Db): Promise<string> {
  let x = 0;
  while (x < 5) {
    const randNum = Math.floor(10 + Math.random() * 90);
    const name = fullname.split(' ')[0].toUpperCase();
    const username = name + randNum;

    const count = await client.collection('users').countDocuments({ UserName: username });

    if (count === 0) {
      return username;
    }
    x++;
  }
  return 'error';
}

function toTitleCase(phrase: string): string {
  return phrase
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default router;