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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    // Explicitly scope to tenant if not SuperAdmin
    if (req.user?.role !== 'SUPER_ADMIN') {
      where.tenantId = req.user!.tenantId;
    }

    const [total, schools] = await Promise.all([
      prisma.school.count({ where }),
      prisma.school.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { tenant: true }, // Include tenant for context
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        schools,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
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
