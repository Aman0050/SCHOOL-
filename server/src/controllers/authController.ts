import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../config/db';
import { AppError } from '../errors/AppError';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokens';
import { createAuditLog, AuditAction } from '../utils/auditLogger';
import { parseUserAgent } from '../utils/userAgent';

const dbRaw = new PrismaClient(); // raw db client for cross-tenant operations like authentication bypass context

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.tenant) {
      throw new AppError(400, 'TENANT_CONTEXT_REQUIRED', 'Please login via your school subdomain');
    }

    const { email, password } = req.body;

    // Use raw DB client to resolve the user first, verifying tenant membership manually,
    // to allow granular control over lockout status updates without tenant filter interference.
    const user = await dbRaw.user.findFirst({
      where: {
        email,
        tenantId: req.tenant.id,
      },
    });

    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    if (!user.isActive) {
      throw new AppError(401, 'ACCOUNT_DEACTIVATED', 'Your account has been deactivated');
    }

    if (['TEACHER', 'STUDENT', 'PARENT'].includes(user.role)) {
      throw new AppError(403, 'UNAUTHORIZED_ROLE', 'Access to the platform is currently restricted to administrators and staff.');
    }

    // Check Account Lockout status
    const now = new Date();
    if (user.lockoutUntil && user.lockoutUntil > now) {
      const minutesLeft = Math.ceil((user.lockoutUntil.getTime() - now.getTime()) / 60000);
      throw new AppError(
        423,
        'ACCOUNT_LOCKED',
        `Account is temporarily locked due to excessive failed attempts. Please try again in ${minutesLeft} minutes.`
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      // Increment login attempts
      const attempts = user.loginAttempts + 1;
      const mustLock = attempts >= MAX_LOGIN_ATTEMPTS;
      const lockoutUntil = mustLock ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null;

      await dbRaw.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: attempts,
          ...(mustLock && { lockoutUntil }),
        },
      });

      if (mustLock) {
        throw new AppError(
          423,
          'ACCOUNT_LOCKED',
          'Too many failed attempts. Your account has been locked for 15 minutes.'
        );
      }

      throw new AppError(
        401,
        'INVALID_CREDENTIALS',
        `Invalid email or password. ${MAX_LOGIN_ATTEMPTS - attempts} attempts remaining.`
      );
    }

    // Reset login attempts on success
    await dbRaw.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockoutUntil: null,
      },
    });

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Session Management and Device Tracking
    const userAgentStr = req.headers['user-agent'] || '';
    const { deviceType, osName, browserName } = parseUserAgent(userAgentStr);

    const session = await dbRaw.session.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        token: refreshToken,
        deviceType,
        osName,
        browserName,
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Set refresh token in httpOnly secure cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Write audit log
    await createAuditLog({
      tenantId: user.tenantId,
      userId: user.id,
      action: AuditAction.LOGIN,
      entity: 'User',
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: userAgentStr,
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    // Resolve user globally to identify tenant context
    const user = await dbRaw.user.findUnique({
      where: { email },
    });

    if (!user) {
      // To prevent account enumeration attacks (OWASP), return standard success response
      res.status(200).json({
        success: true,
        data: { message: 'If the email matches an active account, a password reset link will be sent.' },
      });
      return;
    }

    // Generate secure cryptographically random reset token
    const rawResetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawResetToken).digest('hex');

    // Invalidate existing reset tokens for safety
    await dbRaw.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Save token hash
    await dbRaw.passwordResetToken.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        tokenHash,
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour expiration
      },
    });

    // Log request
    await createAuditLog({
      tenantId: user.tenantId,
      userId: user.id,
      action: AuditAction.PASSWORD_RESET_REQUEST,
      entity: 'User',
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Print to console in dev mode so the developer can copy-paste it
    console.log(`====================================================`);
    console.log(`🔑 PASSWORD RESET REQUESTED FOR: ${email}`);
    console.log(`👉 Raw Reset Token: ${rawResetToken}`);
    console.log(`👉 API Token Param: ?token=${rawResetToken}`);
    console.log(`====================================================`);

    res.status(200).json({
      success: true,
      data: {
        message: 'If the email matches an active account, a password reset link will be sent.',
        ...(process.env.NODE_ENV === 'development' && { dev_token: rawResetToken }),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;

    // Hash incoming token for comparison
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetTokenRecord = await dbRaw.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetTokenRecord || resetTokenRecord.expiresAt < new Date()) {
      throw new AppError(400, 'INVALID_RESET_TOKEN', 'Reset token is invalid or has expired');
    }

    const user = resetTokenRecord.user;

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Update password and reset lockouts
    await dbRaw.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        loginAttempts: 0,
        lockoutUntil: null,
      },
    });

    // Clean up reset token
    await dbRaw.passwordResetToken.delete({
      where: { id: resetTokenRecord.id },
    });

    // Invalidate all active sessions for this user for security
    await dbRaw.session.updateMany({
      where: { userId: user.id },
      data: { isValid: false },
    });

    // Log password change
    await createAuditLog({
      tenantId: user.tenantId,
      userId: user.id,
      action: AuditAction.PASSWORD_RESET,
      entity: 'User',
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({
      success: true,
      data: {
        message: 'Password reset successful. All active sessions have been signed out. Please login.',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new AppError(401, 'REFRESH_TOKEN_REQUIRED', 'Refresh token is missing');
    }

    const decoded = verifyRefreshToken(refreshToken);

    // Verify session is active in database (Session Management check!)
    const activeSession = await dbRaw.session.findUnique({
      where: { token: refreshToken },
    });

    if (!activeSession || !activeSession.isValid || activeSession.expiresAt < new Date()) {
      throw new AppError(401, 'INVALID_SESSION', 'Session has expired or been revoked');
    }

    const user = await dbRaw.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      throw new AppError(401, 'USER_INACTIVE', 'User profile deactivated or deleted');
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Invalidate old session and create a new session (Refresh Token Rotation!)
    await dbRaw.session.delete({ where: { id: activeSession.id } });

    const userAgentStr = req.headers['user-agent'] || '';
    const { deviceType, osName, browserName } = parseUserAgent(userAgentStr);

    await dbRaw.session.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        token: newRefreshToken,
        deviceType,
        osName,
        browserName,
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken,
      },
    });
  } catch (error) {
    next(new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or has expired'));
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      // Revoke session from DB
      await dbRaw.session.deleteMany({
        where: { token: refreshToken },
      });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    if (req.user) {
      await createAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: AuditAction.LOGOUT,
        entity: 'User',
        entityId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
    }

    res.status(200).json({
      success: true,
      data: {
        message: 'Logged out successfully',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User profile not found');
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
          profile: user.profile,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Device Tracking: Fetch all active sessions for the user
export const getActiveSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
    }

    const sessions = await dbRaw.session.findMany({
      where: {
        userId: req.user.id,
        isValid: true,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        deviceType: true,
        osName: true,
        browserName: true,
        ipAddress: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

// Invalidate Session (Remote logout a specific device)
export const revokeSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
    }

    const { id } = req.params;

    const session = await dbRaw.session.findUnique({
      where: { id },
    });

    if (!session || session.userId !== req.user.id) {
      throw new AppError(404, 'SESSION_NOT_FOUND', 'Active device session not found');
    }

    await dbRaw.session.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      data: { message: 'Session successfully revoked' },
    });
  } catch (error) {
    next(error);
  }
};
