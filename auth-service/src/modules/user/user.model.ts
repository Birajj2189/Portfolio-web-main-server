import { Role, User } from '@prisma/client';
import { prisma } from '../../config/prisma';

export type SafeUser = Omit<User, 'passwordHash'>;

const safeUserSelect = {
  id: true,
  email: true,
  role: true,
  isAdmin: true,
  isActive: true,
  lastSeenAt: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Finds a user by their email address.
 *
 * @param email - The user's email
 * @returns The full user record including passwordHash, or null if not found
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

/**
 * Finds a user by their UUID, excluding the password hash.
 *
 * @param id - The user's UUID
 * @returns Safe user record (no passwordHash), or null if not found
 */
export async function findUserById(id: string): Promise<SafeUser | null> {
  return prisma.user.findUnique({
    where: { id },
    select: safeUserSelect,
  });
}

/**
 * Creates a new user with FRIEND role.
 * Role is never accepted from external input — always forced to FRIEND.
 * isAdmin is always false for signup users.
 *
 * @param email - The user's email address
 * @param passwordHash - Pre-hashed password (bcrypt)
 * @returns The created user record (without passwordHash)
 */
export async function createUser(email: string, passwordHash: string): Promise<SafeUser> {
  return prisma.user.create({
    data: {
      email,
      passwordHash,
      role: Role.FRIEND,
      isAdmin: false,
      isActive: true,
    },
    select: safeUserSelect,
  });
}

/**
 * Updates the user's isActive status.
 *
 * @param id - The user's UUID
 * @param isActive - Whether the user is currently active
 */
export async function setUserActive(id: string, isActive: boolean): Promise<void> {
  await prisma.user.update({
    where: { id },
    data: { isActive },
  });
}

/**
 * Updates the user's lastSeenAt timestamp to now.
 *
 * @param id - The user's UUID
 */
export async function touchLastSeen(id: string): Promise<void> {
  await prisma.user.update({
    where: { id },
    data: { lastSeenAt: new Date() },
  });
}
