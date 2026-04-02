import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hashes a plain-text password using bcrypt.
 *
 * @param password - The plain-text password to hash
 * @returns The bcrypt hash string
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a plain-text password against a bcrypt hash.
 *
 * @param password - The plain-text password from the request
 * @param hash - The stored bcrypt hash
 * @returns `true` if the password matches, `false` otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
