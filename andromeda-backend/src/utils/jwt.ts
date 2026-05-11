import jwt from 'jsonwebtoken';
import config from '../config';
import { JwtUser, AccountType } from '../models/interfaces';

export function generateAccessToken(user: { name: string; account: AccountType }): string {
  return jwt.sign(user, config.accessTokenSecret, { expiresIn: '1h' });
}

export function generateRefreshToken(user: { name: string; account: AccountType }): string {
  return jwt.sign(user, config.refreshTokenSecret, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): JwtUser | null {
  try {
    return jwt.verify(token, config.accessTokenSecret) as JwtUser;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): JwtUser | null {
  try {
    return jwt.verify(token, config.refreshTokenSecret) as JwtUser;
  } catch {
    return null;
  }
}