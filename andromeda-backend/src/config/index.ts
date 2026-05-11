import dotenv from 'dotenv';

dotenv.config();

export const config = {
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || 'your-access-token-secret',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret',
  accessTokenAdmin: process.env.ACCESS_TOKEN_ADMIN || 'your-admin-token-secret',
  email: process.env.EMAIL || 'aglofficial29@gmail.com',
  emailPassword: process.env.EMAIL_PASSWORD || 'ybfdxbaaqhskjhwb',
  dbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=false',
  dropboxToken: process.env.DROPBOX_TOKEN || '',
  port: parseInt(process.env.PORT || '5000', 10),
};

export default config;