import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db';
import { AppError } from '../errors/AppError';
import { createAuditLog, AuditAction } from '../utils/auditLogger';

// Validation Schemas
export const departmentSchema = z.object({
  schoolId: z.string().uuid('Invalid school ID'),
  name: z.string().min(2, 'Department name must be at least 2 characters'),
});

export const courseSchema = z.object({
  departmentId: z.string().uuid('Invalid department ID'),
  name: z.string().min(2, 'Course name must be at least 2 characters'),
  code: z.string().min(2, 'Course code must be at least 2 characters'),
  credits: z.number().int().min(1).max(10).default(3),
});

export const classSchema = z.object({
  schoolId: z.string().uuid('Invalid school ID'),
  courseId: z.string().uuid('Invalid course ID'),
  name: z.string().min(2, 'Class name must be at least 2 characters'),
  section: z.string().optional(),
  academicYear: z.string().min(4, 'Academic year is required'),
});

export const enrollmentSchema = z.object({
  classId: z.string().uuid('Invalid class ID'),
  studentId: z.string().uuid('Invalid student ID'),
  status: z.enum(['ACTIVE', 'COMPLETED', 'DROPPED']).default('ACTIVE'),
});

// Departments Controllers
export const getDepartments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const departments = await prisma.department.findMany({
      include: { school: true },
      orderBy: { name: 'asc' },
    });
    res.status(200).json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { schoolId, name } = req.body;

    // Verify school exists in current tenant
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) {
      throw new AppError(404, 'SCHOOL_NOT_FOUND', 'School does not exist in this tenant');
    }

    const department = await prisma.department.create({
      data: {
        tenantId: req.user!.tenantId,
        schoolId,
        name,
      },
    });

    await createAuditLog({
      tenantId: req.user!.tenantId,
      userId: req.user!.id,
      action: AuditAction.CREATE,
      entity: 'Department',
      entityId: department.id,
      newValues: department,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

// Courses Controllers
export const getCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courses = await prisma.course.findMany({
      include: { department: true },
      orderBy: { name: 'asc' },
    });
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { departmentId, name, code, credits } = req.body;

    const department = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!department) {
      throw new AppError(404, 'DEPARTMENT_NOT_FOUND', 'Department does not exist in this tenant');
    }

    const course = await prisma.course.create({
      data: {
        tenantId: req.user!.tenantId,
        departmentId,
        name,
        code,
        credits,
      },
    });

    await createAuditLog({
      tenantId: req.user!.tenantId,
      userId: req.user!.id,
      action: AuditAction.CREATE,
      entity: 'Course',
      entityId: course.id,
      newValues: course,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

// Classes Controllers
export const getClasses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const classes = await prisma.class.findMany({
      where: { tenantId: req.user!.tenantId },
      include: { school: true, course: true },
      orderBy: { name: 'asc' },
    });
    res.status(200).json({ success: true, data: classes });
  } catch (error) {
    next(error);
  }
};

export const getTeachers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teachers = await prisma.user.findMany({
      where: { 
        tenantId: req.user!.tenantId,
        role: 'TEACHER',
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
      orderBy: { firstName: 'asc' },
    });
    res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    next(error);
  }
};

export const createClass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { schoolId, courseId, name, section, academicYear } = req.body;

    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!school || !course) {
      throw new AppError(404, 'DEPENDENCY_NOT_FOUND', 'Associated School or Course not found in this tenant');
    }

    const newClass = await prisma.class.create({
      data: {
        tenantId: req.user!.tenantId,
        schoolId,
        courseId,
        name,
        section,
        academicYear,
      },
    });

    await createAuditLog({
      tenantId: req.user!.tenantId,
      userId: req.user!.id,
      action: AuditAction.CREATE,
      entity: 'Class',
      entityId: newClass.id,
      newValues: newClass,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ success: true, data: newClass });
  } catch (error) {
    next(error);
  }
};

// Enrollments Controllers
export const getEnrollments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        class: {
          include: { course: true },
        },
      },
      orderBy: { id: 'desc' },
    });
    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    next(error);
  }
};

export const createEnrollment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { classId, studentId, status } = req.body;

    const classRecord = await prisma.class.findUnique({ where: { id: classId } });
    if (!classRecord) {
      throw new AppError(404, 'CLASS_NOT_FOUND', 'Class not found in this tenant');
    }

    const studentRecord = await prisma.user.findUnique({ where: { id: studentId } });
    if (!studentRecord || studentRecord.role !== 'STUDENT') {
      throw new AppError(404, 'STUDENT_NOT_FOUND', 'Student user not found in this tenant');
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        classId,
        studentId,
        status,
      },
    });

    await createAuditLog({
      tenantId: req.user!.tenantId,
      userId: req.user!.id,
      action: AuditAction.CREATE,
      entity: 'Enrollment',
      entityId: enrollment.id,
      newValues: enrollment,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    next(error);
  }
};

// Audit Logs Controller (Tenant Level Audit Logs)
export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to recent 100 entries
    });
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};
