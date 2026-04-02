import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { hashPassword, verifyPassword } from '../../utils/hash';
import {
  signAccessToken,
  signRefreshToken,
  durationToDate,
  verifyRefreshToken,
} from '../../utils/jwt';
import {
  createUser,
  findUserByEmail,
  findUserById,
  setUserActive,
  SafeUser,
} from '../user/user.model';
import { env } from '../../config/env';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult {
  user: SafeUser;
  tokens: AuthTokens;
}

/**
 * Registers a new user with FRIEND role.
 * Throws a generic error if the email is already in use (no user enumeration).
 *
 * @param email - New user's email
 * @param password - Plain-text password (will be hashed)
 * @returns Created user and auth tokens
 * @throws {AppError} 409 if email is already registered
 */
export async function signup(email: string, password: string): Promise<AuthResult> {
  const existing = await findUserByEmail(email);

  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser(email, passwordHash);
  const tokens = await generateAndStoreTokens(user.id, user.role);

  return { user, tokens };
}

/**
 * Authenticates a user with email and password.
 * Sets isActive=true on successful login.
 * Returns a generic error for invalid credentials to prevent user enumeration.
 *
 * @param email - The user's email
 * @param password - Plain-text password to verify
 * @returns Authenticated user and auth tokens
 * @throws {AppError} 401 for any invalid credential combination
 */
export async function login(email: string, password: string): Promise<AuthResult> {
  const user = await findUserByEmail(email);

  // Always run bcrypt even if user not found to prevent timing attacks
  const dummyHash = '$2a$12$dummy.hash.to.prevent.timing.attacks.xxxxxxxxxxxxxx';
  const isValid = await verifyPassword(password, user?.passwordHash ?? dummyHash);

  if (!user || !isValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Mark user as active on login
  await setUserActive(user.id, true);

  const safeUser = await findUserById(user.id);
  const tokens = await generateAndStoreTokens(user.id, user.role);

  return { user: safeUser!, tokens };
}

/**
 * Revokes a refresh token, clears user session, and sets isActive=false.
 * Silent no-op if the token is already invalid (idempotent logout).
 *
 * @param refreshToken - The refresh token from the cookie
 */
export async function logout(refreshToken: string | undefined): Promise<void> {
  if (!refreshToken) return;

  try {
    const payload = verifyRefreshToken(refreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { id: payload.jti },
    });

    if (storedToken) {
      // Revoke the token and mark user as inactive
      await prisma.$transaction([
        prisma.refreshToken.update({
          where: { id: payload.jti },
          data: { revokedAt: new Date() },
        }),
        prisma.user.update({
          where: { id: storedToken.userId },
          data: { isActive: false },
        }),
      ]);
    }
  } catch {
    // Token is invalid or expired — silently ignore, logout succeeds
  }
}

/**
 * Rotates a refresh token: revokes the old one and issues new access + refresh tokens.
 * Implements refresh token rotation for security.
 *
 * @param refreshToken - The current refresh token from cookie
 * @returns New access and refresh tokens
 * @throws {AppError} 401 if the token is invalid, expired, or already revoked
 */
export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { id: payload.jti },
    include: { user: true },
  });

  if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
    throw new AppError('Refresh token has been revoked or expired', 401);
  }

  // Rotate: revoke old, issue new
  await prisma.refreshToken.update({
    where: { id: payload.jti },
    data: { revokedAt: new Date() },
  });

  return generateAndStoreTokens(storedToken.user.id, storedToken.user.role);
}

/**
 * Creates a new access + refresh token pair and persists the refresh token in the DB.
 *
 * @param userId - The user's UUID
 * @param role - The user's role
 * @returns Access and refresh token strings
 */
async function generateAndStoreTokens(userId: string, role: string): Promise<AuthTokens> {
  const dbRefreshToken = await prisma.refreshToken.create({
    data: {
      userId,
      token: crypto.randomUUID(),
      expiresAt: durationToDate(env.REFRESH_TOKEN_EXPIRES_IN),
    },
  });

  const accessToken = signAccessToken(userId, role);
  const refreshToken = signRefreshToken(userId, dbRefreshToken.id);

  return { accessToken, refreshToken };
}
