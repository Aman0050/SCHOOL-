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
  resetPasswordSchema,
  ssoGoogleLogin,
  ssoMicrosoftLogin
} from '../controllers/authController';
import { authenticate } from '../middlewares/auth';
import { validateBody } from '../middlewares/validation';
import { rateLimiter } from '../middlewares/rateLimiter';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiters for brute-force protection
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 500 : 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
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

// Enterprise SSO Flow
router.post('/sso/google', loginLimiter, ssoGoogleLogin);
router.post('/sso/microsoft', loginLimiter, ssoMicrosoftLogin);

// Forgot/Reset Password endpoints
router.post('/forgot-password', passwordResetLimiter, validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', passwordResetLimiter, validateBody(resetPasswordSchema), resetPassword);

// Session Management & Device Tracking
router.get('/sessions', authenticate, getActiveSessions);
router.delete('/sessions/:id', authenticate, revokeSession);

export default router;
