import type { RequestHandler } from 'express';
import type { Role } from '../types/auth';

export const authorize = (roles: Role[]): RequestHandler => {
  return (req, res, next) => {
    const user = req.user;

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return next();
  };
};
