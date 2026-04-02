import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

/**
 * Middleware factory for Role-Based Access Control (RBAC).
 * Must be used AFTER the `authenticate` middleware.
 *
 * @param roles - One or more allowed roles (e.g. "ADMIN", "FRIEND")
 * @returns Express middleware that allows or denies access based on user role
 *
 * @example
 * router.get('/admin', authenticate, requireRole('ADMIN'), handler)
 * router.get('/shared', authenticate, requireRole('ADMIN', 'FRIEND'), handler)
 */
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(
        new AppError(
          `Access denied. Required role: ${roles.join(' or ')}`,
          403,
        ),
      );
      return;
    }

    next();
  };
}
