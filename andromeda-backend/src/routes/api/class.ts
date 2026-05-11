import { Router, Request, Response } from 'express';
import { Db, ObjectId } from 'mongodb';
import { authenticate } from '../../middleware/authenticate';
import { Class } from '../../models/interfaces';

const router = Router();

export function registerClassRoutes(app: Router, client: Db): void {
  app.use(router);
  // Get all classes for teacher
  router.get('/api/class/teacher', authenticate, async (req: Request, res: Response) => {
    try {
      const teacherName = req.user?.name;

      if (!teacherName || req.user?.account !== 'teacher') {
        res.json({ status: 'error', msg: 'Teacher access required', data: {} });
        return;
      }

      const classes = await client.collection<Class>('classes').find({ TeacherName: teacherName }).toArray();

      res.json({ status: 'success', msg: 'Classes retrieved', data: { classes } });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Get all classes for student
  router.get('/api/class/student', authenticate, async (req: Request, res: Response) => {
    try {
      const studentName = req.user?.name;

      if (!studentName || req.user?.account !== 'student') {
        res.json({ status: 'error', msg: 'Student access required', data: {} });
        return;
      }

      const classes = await client.collection<Class>('classes').find({ Students: studentName }).toArray();

      res.json({ status: 'success', msg: 'Classes retrieved', data: { classes } });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Get all classes (admin)
  router.get('/api/class/all', authenticate, async (req: Request, res: Response) => {
    try {
      const classes = await client.collection<Class>('classes').find({}).toArray();

      res.json({ status: 'success', msg: 'Classes retrieved', data: { classes } });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Create class (teacher)
  router.post('/api/class/create', authenticate, async (req: Request, res: Response) => {
    try {
      const teacherName = req.user?.name;

      if (!teacherName || req.user?.account !== 'teacher') {
        res.json({ status: 'error', msg: 'Teacher access required', data: {} });
        return;
      }

      const { className, classCode } = req.body;

      if (!className || !classCode) {
        res.json({ status: 'error', msg: 'Class name and code are required', data: {} });
        return;
      }

      const classData: Partial<Class> = {
        ClassName: className,
        ClassCode: classCode,
        TeacherName: teacherName,
        Students: [],
      };

      const result = await client.collection('classes').insertOne(classData);

      if (result) {
        res.json({
          status: 'success',
          msg: 'Class created successfully',
          data: { classId: result.insertedId },
        });
      } else {
        res.json({ status: 'error', msg: 'Failed to create class', data: {} });
      }
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Join class (student)
  router.post('/api/class/join', authenticate, async (req: Request, res: Response) => {
    try {
      const studentName = req.user?.name;

      if (!studentName || req.user?.account !== 'student') {
        res.json({ status: 'error', msg: 'Student access required', data: {} });
        return;
      }

      const { classCode } = req.body;

      if (!classCode) {
        res.json({ status: 'error', msg: 'Class code is required', data: {} });
        return;
      }

      const classItem = await client.collection<Class>('classes').findOne({ ClassCode: classCode });

      if (!classItem) {
        res.json({ status: 'error', msg: 'Class not found', data: {} });
        return;
      }

      const students = classItem.Students || [];

      if (students.includes(studentName)) {
        res.json({ status: 'error', msg: 'Already joined this class', data: {} });
        return;
      }

      students.push(studentName);

      await client.collection('classes').updateOne(
        { ClassCode: classCode },
        { $set: { Students: students } }
      );

      res.json({ status: 'success', msg: 'Joined class successfully', data: {} });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Update class
  router.put('/api/class/update', authenticate, async (req: Request, res: Response) => {
    try {
      const teacherName = req.user?.name;

      if (!teacherName || req.user?.account !== 'teacher') {
        res.json({ status: 'error', msg: 'Teacher access required', data: {} });
        return;
      }

      const { classId, className } = req.body;

      if (!classId || !className) {
        res.json({ status: 'error', msg: 'Class ID and name are required', data: {} });
        return;
      }

      const result = await client.collection('classes').findOneAndUpdate(
        { _id: new ObjectId(classId), TeacherName: teacherName },
        { $set: { ClassName: className } },
        { returnDocument: 'after' }
      );

      if (result) {
        res.json({ status: 'success', msg: 'Class updated successfully', data: { classItem: result } });
      } else {
        res.json({ status: 'error', msg: 'Class not found or unauthorized', data: {} });
      }
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Delete class (admin)
  router.delete('/api/class/delete', authenticate, async (req: Request, res: Response) => {
    try {
      if (req.user?.account !== 'admin') {
        res.json({ status: 'error', msg: 'Admin access required', data: {} });
        return;
      }

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
}

export default router;