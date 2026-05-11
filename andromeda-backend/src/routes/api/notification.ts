import { Router, Request, Response } from 'express';
import { Db, ObjectId } from 'mongodb';
import { authenticate } from '../../middleware/authenticate';
import { Notification } from '../../models/interfaces';

const router = Router();

export function registerNotificationRoutes(app: Router, client: Db): void {
  app.use(router);
  // Get all notifications for teacher
  router.get('/api/notification/teacher', authenticate, async (req: Request, res: Response) => {
    try {
      const teacherName = req.user?.name;

      if (!teacherName || req.user?.account !== 'teacher') {
        res.json({ status: 'error', msg: 'Teacher access required', data: {} });
        return;
      }

      const notifications = await client
        .collection<Notification>('notifications')
        .find({ CreatedBy: teacherName })
        .toArray();

      res.json({ status: 'success', msg: 'Notifications retrieved', data: { notifications } });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Get all notifications for student
  router.get('/api/notification/student', authenticate, async (req: Request, res: Response) => {
    try {
      const studentName = req.user?.name;

      if (!studentName || req.user?.account !== 'student') {
        res.json({ status: 'error', msg: 'Student access required', data: {} });
        return;
      }

      const notifications = await client
        .collection<Notification>('notifications')
        .find({ CreatedFor: studentName })
        .toArray();

      res.json({ status: 'success', msg: 'Notifications retrieved', data: { notifications } });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Get all notifications (admin)
  router.get('/api/notification/all', authenticate, async (req: Request, res: Response) => {
    try {
      const notifications = await client.collection<Notification>('notifications').find({}).toArray();

      res.json({ status: 'success', msg: 'Notifications retrieved', data: { notifications } });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Create notification (teacher)
  router.post('/api/notification/create', authenticate, async (req: Request, res: Response) => {
    try {
      const teacherName = req.user?.name;

      if (!teacherName || req.user?.account !== 'teacher') {
        res.json({ status: 'error', msg: 'Teacher access required', data: {} });
        return;
      }

      const { title, description, className, createdFor } = req.body;

      if (!title || !description) {
        res.json({ status: 'error', msg: 'Title and description are required', data: {} });
        return;
      }

      const notificationData: Partial<Notification> = {
        Title: title,
        Description: description,
        CreatedBy: teacherName,
        ClassName: className || '',
        CreatedFor: createdFor || '',
        IsRead: false,
      };

      const result = await client.collection('notifications').insertOne(notificationData);

      if (result) {
        res.json({
          status: 'success',
          msg: 'Notification created successfully',
          data: { notificationId: result.insertedId },
        });
      } else {
        res.json({ status: 'error', msg: 'Failed to create notification', data: {} });
      }
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Mark notification as read
  router.post('/api/notification/read', authenticate, async (req: Request, res: Response) => {
    try {
      const { notificationId } = req.body;

      if (!notificationId) {
        res.json({ status: 'error', msg: 'Notification ID is required', data: {} });
        return;
      }

      await client.collection('notifications').updateOne(
        { _id: new ObjectId(notificationId) },
        { $set: { IsRead: true } }
      );

      res.json({ status: 'success', msg: 'Notification marked as read', data: {} });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Delete notification (teacher)
  router.delete('/api/notification/delete', authenticate, async (req: Request, res: Response) => {
    try {
      const teacherName = req.user?.name;

      if (!teacherName || req.user?.account !== 'teacher') {
        res.json({ status: 'error', msg: 'Teacher access required', data: {} });
        return;
      }

      const { notificationId } = req.body;

      if (!notificationId) {
        res.json({ status: 'error', msg: 'Notification ID is required', data: {} });
        return;
      }

      await client.collection('notifications').deleteOne({
        _id: new ObjectId(notificationId),
        CreatedBy: teacherName,
      });

      res.json({ status: 'success', msg: 'Notification deleted successfully', data: {} });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Delete notification (admin)
  router.delete('/admin/notification/delete', authenticate, async (req: Request, res: Response) => {
    try {
      if (req.user?.account !== 'admin') {
        res.json({ status: 'error', msg: 'Admin access required', data: {} });
        return;
      }

      const { notificationId } = req.body;

      if (!notificationId) {
        res.json({ status: 'error', msg: 'Notification ID is required', data: {} });
        return;
      }

      await client.collection('notifications').deleteOne({
        _id: new ObjectId(notificationId),
      });

      res.json({ status: 'success', msg: 'Notification deleted successfully', data: {} });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });
}

export default router;