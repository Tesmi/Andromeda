import { Router, Request, Response } from 'express';
import { Db, ObjectId } from 'mongodb';
import { authenticate } from '../../middleware/authenticate';
import { Schedule } from '../../models/interfaces';

const router = Router();

export function registerScheduleRoutes(app: Router, client: Db): void {
  app.use(router);
  // Get all schedules for teacher
  router.get('/api/schedule/teacher', authenticate, async (req: Request, res: Response) => {
    try {
      const teacherName = req.user?.name;

      if (!teacherName || req.user?.account !== 'teacher') {
        res.json({ status: 'error', msg: 'Teacher access required', data: {} });
        return;
      }

      const schedules = await client
        .collection<Schedule>('classes')
        .find({ TeacherName: teacherName })
        .toArray();

      res.json({ status: 'success', msg: 'Schedules retrieved', data: { schedules } });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Get all schedules
  router.get('/api/schedule/all', authenticate, async (req: Request, res: Response) => {
    try {
      const schedules = await client.collection('schedules').find({}).toArray();

      res.json({ status: 'success', msg: 'Schedules retrieved', data: { schedules } });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Create schedule (teacher)
  router.post('/api/schedule/create', authenticate, async (req: Request, res: Response) => {
    try {
      const teacherName = req.user?.name;

      if (!teacherName || req.user?.account !== 'teacher') {
        res.json({ status: 'error', msg: 'Teacher access required', data: {} });
        return;
      }

      const { className, start, end, topic } = req.body;

      if (!className || !start || !end || !topic) {
        res.json({ status: 'error', msg: 'All fields are required', data: {} });
        return;
      }

      const scheduleData = {
        ClassName: className,
        Start: start,
        End: end,
        Topic: topic,
        TeacherName: teacherName,
      };

      const result = await client.collection('schedules').insertOne(scheduleData);

      if (result) {
        res.json({
          status: 'success',
          msg: 'Schedule created successfully',
          data: { scheduleId: result.insertedId },
        });
      } else {
        res.json({ status: 'error', msg: 'Failed to create schedule', data: {} });
      }
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Update schedule
  router.put('/api/schedule/update', authenticate, async (req: Request, res: Response) => {
    try {
      const teacherName = req.user?.name;

      if (!teacherName || req.user?.account !== 'teacher') {
        res.json({ status: 'error', msg: 'Teacher access required', data: {} });
        return;
      }

      const { scheduleId, className, start, end, topic } = req.body;

      if (!scheduleId) {
        res.json({ status: 'error', msg: 'Schedule ID is required', data: {} });
        return;
      }

      const updateData: Partial<Schedule> = {};

      if (className) updateData.ClassName = className;
      if (start) updateData.Start = start;
      if (end) updateData.End = end;
      if (topic) updateData.Topic = topic;

      const result = await client.collection('schedules').findOneAndUpdate(
        { _id: new ObjectId(scheduleId), TeacherName: teacherName },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      if (result) {
        res.json({ status: 'success', msg: 'Schedule updated successfully', data: { schedule: result } });
      } else {
        res.json({ status: 'error', msg: 'Schedule not found or unauthorized', data: {} });
      }
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Delete schedule
  router.delete('/api/schedule/delete', authenticate, async (req: Request, res: Response) => {
    try {
      const teacherName = req.user?.name;

      if (!teacherName || req.user?.account !== 'teacher') {
        res.json({ status: 'error', msg: 'Teacher access required', data: {} });
        return;
      }

      const { scheduleId } = req.body;

      if (!scheduleId) {
        res.json({ status: 'error', msg: 'Schedule ID is required', data: {} });
        return;
      }

      await client.collection('schedules').deleteOne({
        _id: new ObjectId(scheduleId),
        TeacherName: teacherName,
      });

      res.json({ status: 'success', msg: 'Schedule deleted successfully', data: {} });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });
}

export default router;