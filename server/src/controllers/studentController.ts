import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { AppError } from '../errors/AppError';
import { createAuditLog, AuditAction } from '../utils/auditLogger';
import { cache } from '../lib/cache';

// Validation Schemas
export const studentRegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  admissionNumber: z.string().min(3, 'Admission number must be at least 3 characters'),
  admissionDate: z.string().optional(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  classId: z.string().uuid('Invalid class ID').optional(),
  parentId: z.string().uuid('Invalid parent ID').optional(),
  relationship: z.string().optional(),
});

export const studentUpdateSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'GRADUATED']).optional(),
  classId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  relationship: z.string().optional(),
});

export const bulkImportSchema = z.object({
  students: z.array(
    z.object({
      email: z.string().email(),
      firstName: z.string().min(2),
      lastName: z.string().min(2),
      admissionNumber: z.string().min(3),
      classId: z.string().uuid().optional(),
    })
  ),
});

export const bulkUpdateSchema = z.object({
  studentIds: z.array(z.string().uuid()),
  classId: z.string().uuid(),
});

// Controllers
export const getStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = (req.query.search as string) || '';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const classId = req.query.classId as string;
    const status = req.query.status as string;

    const skip = (page - 1) * limit;

    // Build query filters
    const where: any = {
      role: 'STUDENT',
      tenantId: req.user!.tenantId,
    };

    if (classId) {
      where.enrollments = {
        some: { classId },
      };
    }

    if (status) {
      where.admission = { status };
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { admission: { admissionNumber: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const cacheKey = `tenant:${req.user!.tenantId}:students:pg${page}:l${limit}:s${search}:c${classId}:st${status}`;

    const cachedResult = await cache.remember(cacheKey, 300, async () => {
      const [total, students] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            email: true,
            status: true, // Though 'status' might be on Admission for students or User for generic
            isActive: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true
              }
            },
            admission: {
              select: {
                admissionNumber: true,
                status: true
              }
            },
            enrollments: {
              take: 1,
              select: {
                class: {
                  select: { name: true }
                }
              }
            }
          },
          orderBy: { firstName: 'asc' },
        }),
      ]);
      return { total, students };
    });

    const { total, students } = cachedResult;

    res.status(200).json({
      success: true,
      data: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        students,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const registerStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;

    // Check unique email
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) {
      throw new AppError(409, 'EMAIL_EXISTS', 'Email address is already in use');
    }

    // Check unique admission number in tenant scope
    const existingAdmission = await prisma.admission.findUnique({
      where: { admissionNumber: data.admissionNumber },
    });
    if (existingAdmission) {
      throw new AppError(409, 'DUPLICATE_ADMISSION', 'Admission number already exists in this school');
    }

    // Hash dummy password for initial registration
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('student123', salt);

    // Write all records securely inside a single database transaction (OWASP/ACID compliance)
    const result = await prisma.$transaction(async (tx: any) => {
      const student = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'STUDENT',
          tenantId: req.user!.tenantId,
          profile: {
            create: {
              phoneNumber: data.phoneNumber,
              dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
              gender: data.gender,
              address: data.address,
            },
          },
          admission: {
            create: {
              tenantId: req.user!.tenantId,
              admissionNumber: data.admissionNumber,
              admissionDate: data.admissionDate ? new Date(data.admissionDate) : undefined,
              status: 'ACTIVE',
            },
          },
        },
        include: {
          profile: true,
          admission: true,
        },
      });

      // Class Enrollment Assignment
      if (data.classId) {
        await tx.enrollment.create({
          data: {
            tenantId: req.user!.tenantId,
            classId: data.classId,
            studentId: student.id,
            status: 'ACTIVE',
          },
        });
      }

      // Parent Mapping
      if (data.parentId) {
        await tx.parentStudent.create({
          data: {
            tenantId: req.user!.tenantId,
            parentId: data.parentId,
            studentId: student.id,
            relationship: data.relationship || 'GUARDIAN',
          },
        });
      }

      return student;
    });

    await createAuditLog({
      tenantId: req.user!.tenantId,
      userId: req.user!.id,
      action: AuditAction.CREATE,
      entity: 'User',
      entityId: result.id,
      newValues: result,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({
      success: true,
      data: result,
    });

    // Emit live activity feed for SIS Dashboard
    req.io?.to(`tenant:${req.user!.tenantId}`).emit('activity_feed', {
      type: 'STUDENT',
      text: `New admission registered: ${data.firstName} ${data.lastName}`,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    });
    // Invalidate Cache for Students Directory
    await cache.invalidatePattern(`tenant:${req.user!.tenantId}:students:*`);
    req.io?.to(`tenant:${req.user!.tenantId}`).emit('invalidate_cache', { queryKey: ['students-directory'] });

  } catch (error) {
    next(error);
  }
};

export const getStudentDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const student = await prisma.user.findFirst({
      where: { id, role: 'STUDENT' },
      include: {
        profile: true,
        admission: true,
        documents: true,
        enrollments: {
          include: {
            class: { include: { course: true } },
          },
        },
        parentRelations: {
          include: { parent: { include: { profile: true } } },
        },
        attendance: {
          take: 30,
          orderBy: { date: 'desc' }
        },
        feeAssignments: {
          include: {
            feeStructure: true,
            collections: true
          }
        }
      },
    });

    if (!student) {
      throw new AppError(404, 'STUDENT_NOT_FOUND', 'Student profile not found');
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const student = await prisma.user.findFirst({
      where: { id, role: 'STUDENT' },
    });

    if (!student) {
      throw new AppError(404, 'STUDENT_NOT_FOUND', 'Student profile not found');
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const updatedUser = await tx.user.update({
        where: { id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          profile: {
            update: {
              phoneNumber: data.phoneNumber,
              dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
              gender: data.gender,
              address: data.address,
            },
          },
          admission: data.status ? {
            update: {
              status: data.status,
            },
          } : undefined,
        },
        include: {
          profile: true,
          admission: true,
        },
      });

      // Update enrollment
      if (data.classId) {
        // Invalidate old enrollment, insert new
        await tx.enrollment.deleteMany({ where: { studentId: id } });
        await tx.enrollment.create({
          data: {
            classId: data.classId,
            studentId: id,
            status: 'ACTIVE',
          },
        });
      }

      // Update parent relation
      if (data.parentId) {
        await tx.parentStudent.deleteMany({ where: { studentId: id } });
        await tx.parentStudent.create({
          data: {
            parentId: data.parentId,
            studentId: id,
            relationship: data.relationship || 'GUARDIAN',
          },
        });
      }

      return updatedUser;
    });

    await createAuditLog({
      tenantId: req.user!.tenantId,
      userId: req.user!.id,
      action: AuditAction.UPDATE,
      entity: 'User',
      entityId: id,
      newValues: result,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Bulk Import Students (using a robust database transaction)
export const bulkImportStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { students } = req.body;
    const tenantId = req.user!.tenantId;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('student123', salt);

    const imported = await prisma.$transaction(async (tx: any) => {
      const records = [];

      for (const item of students) {
        // Validate duplicates inside transaction
        const dupEmail = await tx.user.findUnique({ where: { email: item.email } });
        const dupAdm = await tx.admission.findUnique({ where: { admissionNumber: item.admissionNumber } });

        if (dupEmail || dupAdm) {
          throw new AppError(
            409,
            'BULK_IMPORT_CONFLICT',
            `Conflict found: Email '${item.email}' or Admission '${item.admissionNumber}' already registered.`
          );
        }

        const student = await tx.user.create({
          data: {
            email: item.email,
            passwordHash,
            firstName: item.firstName,
            lastName: item.lastName,
            role: 'STUDENT',
            profile: { create: {} },
            admission: {
              create: {
                admissionNumber: item.admissionNumber,
                status: 'ACTIVE',
              },
            },
          },
        });

        if (item.classId) {
          await tx.enrollment.create({
            data: {
              classId: item.classId,
              studentId: student.id,
              status: 'ACTIVE',
            },
          });
        }

        records.push(student);
      }

      return records;
    });

    await createAuditLog({
      tenantId,
      userId: req.user!.id,
      action: AuditAction.CREATE,
      entity: 'User',
      entityId: `bulk-import-${imported.length}`,
      newValues: { count: imported.length },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({
      success: true,
      data: {
        message: `Successfully imported ${imported.length} student profiles.`,
        count: imported.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Bulk Update Students (e.g. promoting classes in bulk)
export const bulkUpdateClass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentIds, classId } = req.body;

    const targetClass = await prisma.class.findUnique({ where: { id: classId } });
    if (!targetClass) {
      throw new AppError(404, 'CLASS_NOT_FOUND', 'Target class not found');
    }

    const updated = await prisma.$transaction(async (tx: any) => {
      await tx.enrollment.deleteMany({
        where: {
          studentId: { in: studentIds },
        },
      });

      const enrollments = studentIds.map((sid: string) => ({
        classId,
        studentId: sid,
        status: 'ACTIVE',
      }));

      return tx.enrollment.createMany({
        data: enrollments,
      });
    });

    await createAuditLog({
      tenantId: req.user!.tenantId,
      userId: req.user!.id,
      action: AuditAction.UPDATE,
      entity: 'Enrollment',
      entityId: `bulk-update-${studentIds.length}`,
      newValues: { studentIds, classId },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({
      success: true,
      data: {
        message: `Successfully re-assigned ${studentIds.length} students to class ${targetClass.name}.`,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Search Parents Helper
export const getParents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = (req.query.search as string) || '';

    const parents = await prisma.user.findMany({
      where: {
        role: 'PARENT',
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
      take: 20,
    });

    res.status(200).json({
      success: true,
      data: parents,
    });
  } catch (error) {
    next(error);
  }
};
