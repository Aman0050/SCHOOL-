import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { SystemRole } from '@prisma/client';
import { AppError } from '../errors/AppError';
import { tenantStorage } from '../utils/tenantContext';

interface TokenPayload {
  userId: string;
  email: string;
  role: SystemRole;
  tenantId: string;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'UNAUTHORIZED', 'Authorization token is missing or invalid'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('[FATAL SECURITY ERROR] JWT_SECRET is missing from environment variables.');
      process.exit(1);
    }
    const decoded = jwt.verify(token, secret) as TokenPayload;

    // Verify tenant match if tenant context is active
    if (req.tenant && decoded.tenantId !== req.tenant.id) {
      return next(new AppError(403, 'TENANT_MISMATCH', 'User does not belong to this school tenant'));
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      tenantId: decoded.tenantId,
    };

    // Run the remainder of the request in the tenantStorage context.
    // This is the backbone of the Global Auth Architecture: the JWT proves the tenant, 
    // and the backend automatically scopes all DB interactions to it.
    if (decoded.tenantId) {
      tenantStorage.run({ tenantId: decoded.tenantId }, () => {
        next();
      });
    } else {
      next();
    }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError(401, 'TOKEN_EXPIRED', 'Authorization token has expired'));
    }
    return next(new AppError(401, 'INVALID_TOKEN', 'Authorization token is invalid'));
  }
};

export const authorizeRoles = (...allowedRoles: SystemRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Authentication is required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, 'FORBIDDEN', 'Access denied. Insufficient permissions'));
    }

    next();
  };
};
export { SystemRole };
