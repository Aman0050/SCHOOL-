import { Router } from 'express';
import {
  login,
  refresh,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  getActiveSessions,
  revokeSession,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../controllers/authController';
import { authenticate } from '../middlewares/auth';
import { validateBody } from '../middlewares/validation';
import { rateLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Rate limiters for brute-force protection
const loginLimiter = rateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message: 'Too many login attempts. Please try again after 1 minute.',
  keyPrefix: 'login'
});

const passwordResetLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  message: 'Too many password reset requests. Please try again after 15 minutes.',
  keyPrefix: 'reset'
});

// Authentication endpoints
router.post('/login', loginLimiter, validateBody(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

// Forgot/Reset Password endpoints
router.post('/forgot-password', passwordResetLimiter, validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', passwordResetLimiter, validateBody(resetPasswordSchema), resetPassword);

// Session Management & Device Tracking
router.get('/sessions', authenticate, getActiveSessions);
router.delete('/sessions/:id', authenticate, revokeSession);

export default router;
