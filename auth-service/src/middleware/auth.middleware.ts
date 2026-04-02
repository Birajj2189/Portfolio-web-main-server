import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { findUserById, touchLastSeen } from '../modules/user/user.model';
import { AppError } from '../utils/AppError';

// Augment Express Request to include the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        isAdmin: boolean;
        isActive: boolean;
      };
    }
  }
}

/**
 * Middleware that authenticates a request using the JWT access token.
 * Reads the token from the HTTP-only cookie or Authorization header,
 * verifies it, attaches the user to req.user, and updates lastSeenAt.
 *
 * @throws {AppError} 401 if no token, invalid token, or user not found
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Support both cookie and Authorization header (Bearer token)
    const token =
      req.cookies?.access_token ??
      req.headers.authorization?.replace(/^Bearer\s+/i, '');

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const payload = verifyAccessToken(token);

    if (payload.type !== 'access') {
      throw new AppError('Invalid token type', 401);
    }

    const user = await findUserById(payload.sub);

    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      isActive: user.isActive,
    };

    // Fire-and-forget: update lastSeenAt without blocking the request
    touchLastSeen(user.id).catch(() => {});

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    // JWT errors (expired, malformed, etc.)
    next(new AppError('Invalid or expired token', 401));
  }
}
