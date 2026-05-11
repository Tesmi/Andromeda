import { Router, Request, Response } from 'express';
import { Db, ObjectId } from 'mongodb';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

export function registerFileRoutes(app: Router, client: Db): void {
  app.use(router);
  // Upload file (teacher)
  app.post('/api/file/upload', authenticate, upload.single('file') as any, async (req: Request, res: Response) => {
    try {
      const teacherName = req.user?.name;

      if (!teacherName || req.user?.account !== 'teacher') {
        res.json({ status: 'error', msg: 'Teacher access required', data: {} });
        return;
      }

      if (!req.file) {
        res.json({ status: 'error', msg: 'No file uploaded', data: {} });
        return;
      }

      const { className } = req.body;

      const fileData = {
        FileName: req.file.originalname,
        FilePath: '/uploads/' + req.file.filename,
        FileSize: req.file.size,
        FileType: req.file.mimetype,
        UploadedBy: teacherName,
        ClassName: className || '',
      };

      const result = await client.collection('files').insertOne(fileData);

      if (result) {
        res.json({
          status: 'success',
          msg: 'File uploaded successfully',
          data: {
            fileId: result.insertedId,
            fileName: req.file.originalname,
            filePath: fileData.FilePath,
          },
        });
      } else {
        res.json({ status: 'error', msg: 'Failed to save file info', data: {} });
      }
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Get all files for teacher
  router.get('/api/file/teacher', authenticate, async (req: Request, res: Response) => {
    try {
      const teacherName = req.user?.name;

      if (!teacherName || req.user?.account !== 'teacher') {
        res.json({ status: 'error', msg: 'Teacher access required', data: {} });
        return;
      }

      const files = await client
        .collection('files')
        .find({ UploadedBy: teacherName })
        .toArray();

      res.json({ status: 'success', msg: 'Files retrieved', data: { files } });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Get all files for student
  router.get('/api/file/student', authenticate, async (req: Request, res: Response) => {
    try {
      if (req.user?.account !== 'student') {
        res.json({ status: 'error', msg: 'Student access required', data: {} });
        return;
      }

      const files = await client.collection('files').find({}).toArray();

      res.json({ status: 'success', msg: 'Files retrieved', data: { files } });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Get all files (admin)
  router.get('/api/file/all', authenticate, async (req: Request, res: Response) => {
    try {
      const files = await client.collection('files').find({}).toArray();

      res.json({ status: 'success', msg: 'Files retrieved', data: { files } });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Download file
  router.get('/api/file/download', authenticate, async (req: Request, res: Response) => {
    try {
      const { fileId } = req.query;

      if (!fileId) {
        res.json({ status: 'error', msg: 'File ID is required', data: {} });
        return;
      }

      const file = await client.collection('files').findOne({ _id: new ObjectId(fileId as string) });

      if (!file) {
        res.json({ status: 'error', msg: 'File not found', data: {} });
        return;
      }

      const filePath = path.join(__dirname, '../../../../public', file.FilePath);

      if (fs.existsSync(filePath)) {
        res.download(filePath, file.FileName);
      } else {
        res.json({ status: 'error', msg: 'File not found on disk', data: {} });
      }
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Delete file
  router.delete('/api/file/delete', authenticate, async (req: Request, res: Response) => {
    try {
      const teacherName = req.user?.name;
      const { fileId } = req.body;

      if (!fileId) {
        res.json({ status: 'error', msg: 'File ID is required', data: {} });
        return;
      }

      const file = await client.collection('files').findOne({ _id: new ObjectId(fileId) });

      if (!file) {
        res.json({ status: 'error', msg: 'File not found', data: {} });
        return;
      }

      // Only allow teacher to delete their own files, or admin to delete any
      if (req.user?.account !== 'admin' && file.UploadedBy !== teacherName) {
        res.json({ status: 'error', msg: 'Unauthorized', data: {} });
        return;
      }

      // Delete from database
      await client.collection('files').deleteOne({ _id: new ObjectId(fileId) });

      // Optionally delete from disk
      const filePath = path.join(__dirname, '../../../../public', file.FilePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.json({ status: 'success', msg: 'File deleted successfully', data: {} });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Get recycle bin files
  router.get('/api/file/recycle-bin', authenticate, async (req: Request, res: Response) => {
    try {
      if (req.user?.account !== 'teacher' && req.user?.account !== 'admin') {
        res.json({ status: 'error', msg: 'Teacher or admin access required', data: {} });
        return;
      }

      const deletedFiles = await client.collection('recycleBin').find({ ContentType: 'file' }).toArray();

      res.json({ status: 'success', msg: 'Recycle bin retrieved', data: { files: deletedFiles } });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });

  // Restore file
  router.post('/api/file/restore', authenticate, async (req: Request, res: Response) => {
    try {
      const { fileId } = req.body;

      if (!fileId) {
        res.json({ status: 'error', msg: 'File ID is required', data: {} });
        return;
      }

      const deletedFile = await client.collection('recycleBin').findOne({
        _id: new ObjectId(fileId),
        ContentType: 'file',
      });

      if (!deletedFile) {
        res.json({ status: 'error', msg: 'File not found in recycle bin', data: {} });
        return;
      }

      // Restore to files collection
      await client.collection('files').insertOne(deletedFile.Content);

      // Remove from recycle bin
      await client.collection('recycleBin').deleteOne({ _id: new ObjectId(fileId) });

      res.json({ status: 'success', msg: 'File restored successfully', data: {} });
    } catch {
      res.json({ status: 'error', msg: 'Internal server error', data: {} });
    }
  });
}

export default router;