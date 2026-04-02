import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

/**
 * Global Express error handler.
 * Catches all errors passed via next(error) and returns a consistent JSON shape.
 * Hides stack traces in production.
 */
export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(env.NODE_ENV === 'development' && { stack: error.stack }),
    });
    return;
  }

  // Prisma unique constraint violation
  if ((error as { code?: string }).code === 'P2002') {
    res.status(409).json({
      success: false,
      message: 'A record with this value already exists',
    });
    return;
  }

  console.error('Unhandled error:', error);

  res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    ...(env.NODE_ENV === 'development' && { stack: error.stack }),
  });
}
