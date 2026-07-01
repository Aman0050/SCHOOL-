import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { z } from 'zod';
import { createAuditLog, AuditAction } from '../utils/auditLogger';

export const createLeaveSchema = z.object({
  userId: z.string().uuid(),
  fromDate: z.string(),
  toDate: z.string(),
  reason: z.string(),
});

export const getLeaves = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leaves = await prisma.leaveRequest.findMany({
      where: { tenantId: req.user!.tenantId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, role: true } },
        approver: { select: { id: true, firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: leaves });
  } catch (error) { next(error); }
};

export const createLeave = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, fromDate, toDate, reason } = req.body;
    
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { enrollments: true } });
    if (!user) throw new Error("User not found");
    const school = await prisma.school.findFirst({ where: { tenantId: req.user!.tenantId } });

    const leave = await prisma.leaveRequest.create({
      data: {
        tenantId: req.user!.tenantId,
        schoolId: school!.id,
        userId,
        classId: user.enrollments?.[0]?.classId || null,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        reason,
        status: 'PENDING'
      }
    });

    res.status(201).json({ success: true, data: leave });
  } catch (error) { next(error); }
};

export const updateLeaveStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const leave = await prisma.leaveRequest.update({
      where: { id, tenantId: req.user!.tenantId },
      data: {
        status,
        approvedBy: req.user!.id,
        approvedAt: new Date()
      }
    });

    await createAuditLog({
      tenantId: req.user!.tenantId,
      userId: req.user!.id,
      action: status === 'APPROVED' ? AuditAction.LEAVE_APPROVED : AuditAction.LEAVE_REJECTED,
      entity: 'LeaveRequest',
      entityId: leave.id,
      newValues: { status },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({ success: true, data: leave });
  } catch (error) { next(error); }
};
