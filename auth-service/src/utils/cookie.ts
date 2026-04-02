import { Response } from 'express';
import { env } from '../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
};

/**
 * Sets the access token as an HTTP-only cookie on the response.
 *
 * @param res - Express response object
 * @param token - Signed JWT access token
 */
export function setAccessTokenCookie(res: Response, token: string): void {
  res.cookie('access_token', token, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Sets the refresh token as an HTTP-only cookie on the response.
 *
 * @param res - Express response object
 * @param token - Signed JWT refresh token
 */
export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie('refresh_token', token, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

/**
 * Clears both auth cookies from the response (used during logout).
 *
 * @param res - Express response object
 */
export function clearAuthCookies(res: Response): void {
  res.clearCookie('access_token', COOKIE_OPTIONS);
  res.clearCookie('refresh_token', COOKIE_OPTIONS);
}
