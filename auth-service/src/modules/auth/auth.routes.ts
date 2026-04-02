import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { signupSchema, loginSchema } from './auth.schema';

const router = Router();

/**
 * Strict rate limiter for login — prevents brute force attacks.
 * 10 attempts per 15 minutes per IP.
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  skipSuccessfulRequests: true,
});

/**
 * General rate limiter for auth endpoints.
 * 20 requests per 15 minutes per IP.
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});

// Public routes
router.post('/signup', authRateLimiter, validate(signupSchema), authController.signup);
router.post('/login', loginRateLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authRateLimiter, authController.refresh);

// Protected routes
router.get('/me', authenticate, authController.me);

// Example protected routes demonstrating RBAC
router.get('/admin-only', authenticate, requireRole('ADMIN'), (_, res) => {
  res.json({ success: true, message: 'Welcome, Admin!' });
});

router.get('/friends', authenticate, requireRole('FRIEND', 'ADMIN'), (_, res) => {
  res.json({ success: true, message: 'Welcome, Friend!' });
});

export default router;
