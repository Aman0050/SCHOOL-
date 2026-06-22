import { AuditAction } from '@prisma/client';
import { prisma } from '../config/db';

interface AuditLogPayload {
  tenantId: string;
  userId?: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
}

export const createAuditLog = async (payload: AuditLogPayload) => {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: payload.tenantId,
        userId: payload.userId,
        action: payload.action,
        entity: payload.entity,
        entityId: payload.entityId,
        oldValues: payload.oldValues || undefined,
        newValues: payload.newValues || undefined,
        ipAddress: payload.ipAddress,
        userAgent: payload.userAgent,
      },
    });
  } catch (err) {
    console.error('Failed to create audit log:', err);
  }
};

export { AuditAction };
