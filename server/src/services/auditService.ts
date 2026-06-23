import { PrismaClient, AuditAction } from '@prisma/client';
import { Request } from 'express';

const prisma = new PrismaClient();

export const logAudit = async (
  action: AuditAction,
  entity: string,
  entityId: string | null,
  oldValues: any = null,
  newValues: any = null,
  req?: Request
) => {
  try {
    const tenantId = req?.user?.tenantId || req?.tenant?.id;
    if (!tenantId) {
      console.warn('Audit log skipped: No tenantId found in context.');
      return;
    }

    const userId = req?.user?.id || null;
    const ipAddress = req?.ip || req?.headers['x-forwarded-for']?.toString() || null;
    const userAgent = req?.headers['user-agent'] || null;

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action,
        entity,
        entityId,
        oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : null,
        newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : null,
        ipAddress,
        userAgent
      }
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
};
