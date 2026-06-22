import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db';
import { AppError } from '../errors/AppError';
import { createAuditLog, AuditAction } from '../utils/auditLogger';

export const schoolSchema = z.object({
  name: z.string().min(2, 'School name must be at least 2 characters long'),
  address: z.string().optional(),
});

export const getSchools = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schools = await prisma.school.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({
      success: true,
      data: schools,
    });
  } catch (error) {
    next(error);
  }
};

export const createSchool = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, address } = req.body;

    const school = await prisma.school.create({
      data: {
        name,
        address,
      },
    });

    await createAuditLog({
      tenantId: req.user!.tenantId,
      userId: req.user!.id,
      action: AuditAction.CREATE,
      entity: 'School',
      entityId: school.id,
      newValues: school,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({
      success: true,
      data: school,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSchool = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, address } = req.body;

    // Verify school exists and is in the active tenant scope
    const existing = await prisma.school.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError(404, 'SCHOOL_NOT_FOUND', 'School profile not found');
    }

    const updated = await prisma.school.update({
      where: { id },
      data: {
        name,
        address,
      },
    });

    await createAuditLog({
      tenantId: req.user!.tenantId,
      userId: req.user!.id,
      action: AuditAction.UPDATE,
      entity: 'School',
      entityId: id,
      oldValues: existing,
      newValues: updated,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
