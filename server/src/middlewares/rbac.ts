import { Request, Response, NextFunction } from 'express';
import { SystemRole } from '@prisma/client';
import { AppError } from '../errors/AppError';
import { prisma } from '../config/db';

export type Permission = 
  | 'VIEW_FEES' | 'EDIT_FEES' | 'DELETE_FEES'
  | 'VIEW_ACADEMICS' | 'EDIT_ACADEMICS' 
  | 'VIEW_COMMUNICATION' | 'EDIT_COMMUNICATION'
  | 'VIEW_SECURITY' | 'EDIT_SECURITY';

// Matrix of Roles to Permissions
const rolePermissions: Record<SystemRole, Permission[]> = {
  SUPER_ADMIN: ['VIEW_FEES', 'EDIT_FEES', 'DELETE_FEES', 'VIEW_ACADEMICS', 'EDIT_ACADEMICS', 'VIEW_COMMUNICATION', 'EDIT_COMMUNICATION', 'VIEW_SECURITY', 'EDIT_SECURITY'],
  PLATFORM_OWNER: ['VIEW_FEES', 'EDIT_FEES', 'DELETE_FEES', 'VIEW_ACADEMICS', 'EDIT_ACADEMICS', 'VIEW_COMMUNICATION', 'EDIT_COMMUNICATION', 'VIEW_SECURITY', 'EDIT_SECURITY'],
  SCHOOL_ADMIN: ['VIEW_FEES', 'EDIT_FEES', 'VIEW_ACADEMICS', 'EDIT_ACADEMICS', 'VIEW_COMMUNICATION', 'EDIT_COMMUNICATION', 'VIEW_SECURITY'],
  FINANCE: ['VIEW_FEES', 'EDIT_FEES'],
  TEACHER: ['VIEW_ACADEMICS', 'EDIT_ACADEMICS'],
  STUDENT: [],
  PARENT: [],
  STAFF: [],
  ACCOUNTANT: ['VIEW_FEES', 'EDIT_FEES'],
  SUPPORT_AGENT: []
};

export const requirePermission = (permission: Permission) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Authentication is required'));
    }

    const userPermissions = rolePermissions[req.user.role as SystemRole] || [];

    if (!userPermissions.includes(permission)) {
      // Log this as a security event
      await prisma.securityEvent.create({
        data: {
          tenantId: req.user.tenantId,
          userId: req.user.id,
          eventType: 'PERMISSION_DENIED',
          severity: 'MEDIUM',
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          metadata: { requestedPermission: permission, path: req.originalUrl }
        }
      });

      return next(new AppError(403, 'FORBIDDEN', `Access denied. Requires permission: ${permission}`));
    }

    next();
  };
};
