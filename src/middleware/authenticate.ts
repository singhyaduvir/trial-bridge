import type { RequestHandler } from 'express';
import { verifyAccessToken } from '../services/authService';

export const authenticate: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or malformed' });
    }

    const token = authHeader.slice(7).trim();
    req.user = verifyAccessToken(token);

    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }
};
