import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ status: 'error', msg: 'No authorization token provided', data: {} });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ status: 'error', msg: 'Invalid authorization format', data: {} });
    return;
  }

  const user = verifyAccessToken(token);

  if (!user) {
    res.status(403).json({ status: 'error', msg: 'Invalid or expired token', data: {} });
    return;
  }

  req.user = user;
  next();
}