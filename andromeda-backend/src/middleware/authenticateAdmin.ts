import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import config from '../config';

export function authenticateAdmin(req: Request, res: Response, next: NextFunction): void {
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

  try {
    const decoded = verifyAccessToken(token);

    if (!decoded || decoded.account !== 'admin') {
      res.status(403).json({ status: 'error', msg: 'Admin access required', data: {} });
      return;
    }

    if (token === config.accessTokenAdmin) {
      req.user = decoded;
      next();
      return;
    }

    if (decoded.account === 'admin') {
      req.user = decoded;
      next();
      return;
    }

    res.status(403).json({ status: 'error', msg: 'Admin access required', data: {} });
  } catch {
    res.status(403).json({ status: 'error', msg: 'Invalid token', data: {} });
  }
}