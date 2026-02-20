import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      userId: string;
      email: string;
    };

    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
