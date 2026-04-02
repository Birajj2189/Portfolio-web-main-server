import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface AccessTokenPayload {
  sub: string;
  role: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  type: 'refresh';
}

/**
 * Signs a JWT access token containing the user's id and role.
 *
 * @param userId - The user's UUID
 * @param role - The user's role (ADMIN | FRIEND)
 * @returns Signed JWT access token string
 */
export function signAccessToken(userId: string, role: string): string {
  const payload: AccessTokenPayload = { sub: userId, role, type: 'access' };
  const options: SignOptions = { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, options);
}

/**
 * Signs a JWT refresh token tied to a specific token record (jti).
 *
 * @param userId - The user's UUID
 * @param jti - The RefreshToken record id from the database (used for revocation)
 * @returns Signed JWT refresh token string
 */
export function signRefreshToken(userId: string, jti: string): string {
  const payload: RefreshTokenPayload = { sub: userId, jti, type: 'refresh' };
  const options: SignOptions = { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, options);
}

/**
 * Verifies and decodes a JWT access token.
 *
 * @param token - The raw JWT string
 * @returns Decoded access token payload
 * @throws {JsonWebTokenError} If the token is invalid or expired
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AccessTokenPayload;
}

/**
 * Verifies and decodes a JWT refresh token.
 *
 * @param token - The raw JWT string
 * @returns Decoded refresh token payload
 * @throws {JsonWebTokenError} If the token is invalid or expired
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
}

/**
 * Converts a duration string (e.g. "7d", "15m") to a future Date.
 *
 * @param duration - Duration string like "7d" or "15m"
 * @returns Date object representing the expiry time
 */
export function durationToDate(duration: string): Date {
  const unit = duration.slice(-1);
  const value = parseInt(duration.slice(0, -1), 10);
  const ms: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return new Date(Date.now() + value * (ms[unit] ?? 86_400_000));
}
