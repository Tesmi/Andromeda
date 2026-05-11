import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { MongoClient, Db, ObjectId } from 'mongodb';
import cron from 'node-cron';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config';
import { registerPublicRoutes } from './routes/public/auth';
import { registerUserRoutes } from './routes/api/user';
import { registerClassRoutes } from './routes/api/class';
import { registerNotificationRoutes } from './routes/api/notification';
import { registerScheduleRoutes } from './routes/api/schedule';
import { registerFileRoutes } from './routes/api/file';
import { registerAdminRoutes } from './routes/admin/admin';

const app: Express = express();
let db: Db;

// Middleware
app.use(express.static('public'));
app.use(express.static('profile'));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Security and logging middleware
app.use(helmet());
app.use(morgan('dev'));

// MongoDB connection
const client = new MongoClient(config.dbUri);

async function connectToDatabase(): Promise<Db> {
  try {
    await client.connect();
    const database = client.db('main');
    console.log('Connected to MongoDB');
    return database;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Cron job for cleaning up scheduled classes
cron.schedule('*/30 * * * *', async () => {
  if (!db) return;
  try {
    const currentUTCTime = Date.now().toString();
    await db.collection('classes').deleteMany({
      End: { $lt: currentUTCTime },
    });
    console.log('Cleaned up expired scheduled classes');
  } catch (error) {
    console.error('Error cleaning up scheduled classes:', error);
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', msg: 'Internal server error', data: {} });
});

// Start server
async function startServer(): Promise<void> {
  db = await connectToDatabase();

  // Register routes with database connection
  registerPublicRoutes(app, db);
  registerUserRoutes(app, db);
  registerClassRoutes(app, db);
  registerNotificationRoutes(app, db);
  registerScheduleRoutes(app, db);
  registerFileRoutes(app, db);
  registerAdminRoutes(app, db);

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({ status: 'success', msg: 'Andromeda Backend API', data: {} });
  });

  // Terms and conditions
  app.get('/terms_and_conditions', (req, res) => {
    res.sendFile('public/terms_and_conditions.html', { root: __dirname + '/..' });
  });

  // Privacy policy
  app.get('/privacy_policy', (req, res) => {
    res.sendFile('public/privacy_policy.html', { root: __dirname + '/..' });
  });

  app.listen(config.port, () => {
    console.log(`Server started on port ${config.port}`);
  });
}

startServer().catch(console.error);

export default app;
export { ObjectId };