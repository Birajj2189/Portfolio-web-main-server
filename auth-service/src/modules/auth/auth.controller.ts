import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { setAccessTokenCookie, setRefreshTokenCookie, clearAuthCookies } from '../../utils/cookie';

/**
 * POST /auth/signup
 * Creates a new user account with FRIEND role.
 */
export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const { user, tokens } = await authService.signup(email, password);

    setAccessTokenCookie(res, tokens.accessToken);
    setRefreshTokenCookie(res, tokens.refreshToken);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/login
 * Authenticates a user and issues access + refresh tokens via cookies.
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const { user, tokens } = await authService.login(email, password);

    setAccessTokenCookie(res, tokens.accessToken);
    setRefreshTokenCookie(res, tokens.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/logout
 * Revokes the refresh token and clears auth cookies.
 */
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies?.refresh_token as string | undefined;
    await authService.logout(refreshToken);
    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/refresh
 * Rotates the refresh token and issues a new access token.
 */
export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies?.refresh_token as string | undefined;

    if (!refreshToken) {
      res.status(401).json({ success: false, message: 'No refresh token provided' });
      return;
    }

    const tokens = await authService.refreshTokens(refreshToken);
    setAccessTokenCookie(res, tokens.accessToken);
    setRefreshTokenCookie(res, tokens.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Tokens refreshed successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /auth/me
 * Returns the currently authenticated user's profile.
 * Protected by authenticate middleware.
 */
export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.status(200).json({
      success: true,
      data: { user: req.user },
    });
  } catch (error) {
    next(error);
  }
}
