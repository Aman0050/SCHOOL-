import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db';
import { AppError } from '../errors/AppError';
import { createAuditLog, AuditAction } from '../utils/auditLogger';
import { broadcastCacheInvalidation } from '../lib/socketManager';
import { communicationQueue } from '../workers/communicationQueue';

// Validation Schemas
export const bulkAttendanceSchema = z.object({
  date: z.string(), // ISO String or YYYY-MM-DD
  classId: z.string().uuid().optional().nullable(),
  records: z.array(
    z.object({
      userId: z.string().uuid(),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'HALF_DAY', 'MEDICAL_LEAVE', 'SCHOOL_ACTIVITY', 'HOLIDAY', 'SUSPENDED']),
      remarks: z.string().optional().nullable(),
      mode: z.enum(['MANUAL', 'QR', 'RFID', 'FACE']).default('MANUAL'),
    })
  ),
});

export const getAttendanceQuerySchema = z.object({
  date: z.string().optional(),
  classId: z.string().uuid().optional(),
  role: z.string().optional(),
});

export const getAnalyticsQuerySchema = z.object({
  classId: z.string().uuid().optional(),
  days: z.string().regex(/^\d+$/).optional(),
});

export const getReportQuerySchema = z.object({
  month: z.string().regex(/^\d+$/).optional(),
  year: z.string().regex(/^\d+$/).optional(),
  classId: z.string().uuid().optional(),
});

// Controllers
export const getAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dateQuery = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const classId = req.query.classId as string;
    const roleFilter = (req.query.role as string) || 'STUDENT';

    const targetDate = new Date(dateQuery);
    // Strip time portion to match calendar dates
    targetDate.setUTCHours(0, 0, 0, 0);

    const where: any = {
      tenantId: req.user!.tenantId,
      date: targetDate,
      user: { role: roleFilter },
    };

    if (classId) {
      where.classId = classId;
    }

    const records = await prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        recordedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

export const recordBulkAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, classId, records } = req.body;
    const recordedById = req.user!.id;

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    // Write logs using Prisma transaction
    const savedRecords = await prisma.$transaction(
      records.map((rec: any) =>
        prisma.attendance.upsert({
          where: {
            userId_date_classId: {
              userId: rec.userId,
              date: targetDate,
              classId: classId || null,
            },
          },
          update: {
            status: rec.status,
            remarks: rec.remarks || null,
            mode: rec.mode || 'MANUAL',
            recordedById,
          },
          create: {
            tenantId: req.user!.tenantId,
            userId: rec.userId,
            date: targetDate,
            classId: classId || null,
            status: rec.status,
            remarks: rec.remarks || null,
            mode: rec.mode || 'MANUAL',
            recordedById,
          },
        })
      )
    );

    await createAuditLog({
      tenantId: req.user!.tenantId,
      userId: req.user!.id,
      action: AuditAction.ATTENDANCE_BULK,
      entity: 'Attendance',
      entityId: `bulk-${savedRecords.length}`,
      newValues: { count: savedRecords.length, date: targetDate },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const absentStudentIds = records.filter((r: any) => r.status === 'ABSENT').map((r: any) => r.userId);
    if (absentStudentIds.length > 0) {
      await communicationQueue.add('send-absence-notification', {
        tenantId: req.user!.tenantId,
        studentIds: absentStudentIds,
        date: targetDate,
        markedBy: req.user!.id
      });
    }

    // Emit live activity feed for Attendance Dashboard
    const userName = 'Teacher';
    
    (req as any).io?.to(req.user!.tenantId).emit('activity_feed', {
      type: 'ATTENDANCE',
      text: `Attendance submitted by ${userName} for ${savedRecords.length} students`,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    });

    res.status(200).json({
      success: true,
      message: `Successfully recorded bulk attendance for ${records.length} students`,
    });
    
    // Broadcast real-time invalidation
    broadcastCacheInvalidation(req.user!.tenantId, ['attendance']);
    broadcastCacheInvalidation(req.user!.tenantId, ['studentStats']);
    broadcastCacheInvalidation(req.user!.tenantId, ['dashboard']);
    
  } catch (error) {
    next(error);
  }
};

export const getAttendanceAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const classId = req.query.classId as string;
    const daysLimit = parseInt(req.query.days as string) || 7;

    // 1. Get recent trends (last N days)
    const trends = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysLimit);
    startDate.setUTCHours(0, 0, 0, 0);

    const whereClause: any = { tenantId: req.user!.tenantId, date: { gte: startDate } };
    if (classId) whereClause.classId = classId;

    const groupedAttendance = await prisma.attendance.groupBy({
      by: ['date', 'status'],
      where: whereClause,
      _count: { id: true },
    });

    for (let i = daysLimit - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setUTCHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split('T')[0];

      let presentCount = 0;
      let totalCount = 0;

      for (const group of groupedAttendance) {
        if (group.date.toISOString().split('T')[0] === dateStr) {
          if (group.status === 'PRESENT') {
            presentCount += group._count.id;
          }
          totalCount += group._count.id;
        }
      }

      trends.push({
        date: dateStr,
        present: presentCount,
        total: totalCount,
        rate: totalCount > 0 ? parseFloat(((presentCount / totalCount) * 100).toFixed(1)) : 100,
      });
    }

    // 2. Fetch total students enrolled vs present today
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const todayWhere: any = { tenantId: req.user!.tenantId, date: today };
    if (classId) todayWhere.classId = classId;

    const [todayPresent, todayAbsent, todayLate, todayExcused] = await Promise.all([
      prisma.attendance.count({ where: { ...todayWhere, status: 'PRESENT' } }),
      prisma.attendance.count({ where: { ...todayWhere, status: 'ABSENT' } }),
      prisma.attendance.count({ where: { ...todayWhere, status: 'LATE' } }),
      prisma.attendance.count({ where: { ...todayWhere, status: 'EXCUSED' } }),
    ]);

    // 3. Retrieve list of absentees today (for notification dashboard)
    const todayAbsentees = await prisma.attendance.findMany({
      where: { ...todayWhere, status: 'ABSENT' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        today: {
          present: todayPresent,
          absent: todayAbsent,
          late: todayLate,
          excused: todayExcused,
          total: todayPresent + todayAbsent + todayLate + todayExcused,
        },
        trends,
        absentees: todayAbsentees.map((a: any) => a.user),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const classId = req.query.classId as string;

    if (!classId) {
      throw new AppError(400, 'CLASS_ID_REQUIRED', 'Please specify a classroom filter for reports');
    }

    // Get number of days in target month
    const totalDays = new Date(year, month, 0).getDate();

    // Fetch class students
    const students = await prisma.user.findMany({
      where: {
        tenantId: req.user!.tenantId,
        role: 'STUDENT',
        enrollments: {
          some: { classId },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
      orderBy: { firstName: 'asc' },
    });

    // Fetch attendance for the entire month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month - 1, totalDays, 23, 59, 59);

    const logs = await prisma.attendance.findMany({
      where: {
        tenantId: req.user!.tenantId,
        classId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        userId: true,
        date: true,
        status: true,
      },
    });

    // Map logs to student records
    const report = students.map((s: any) => {
      const studentLogs = logs.filter((log: any) => log.userId === s.id);
      
      const attendanceGrid: { [day: number]: string } = {};
      // Populate day columns
      for (let day = 1; day <= totalDays; day++) {
        const matchingLog = studentLogs.find((l: any) => new Date(l.date).getDate() === day);
        attendanceGrid[day] = matchingLog ? matchingLog.status : '-';
      }

      const presentCount = studentLogs.filter((l: any) => l.status === 'PRESENT').length;
      const absentCount = studentLogs.filter((l: any) => l.status === 'ABSENT').length;
      
      return {
        student: s,
        grid: attendanceGrid,
        stats: {
          present: presentCount,
          absent: absentCount,
          percentage: studentLogs.length > 0 ? Math.round((presentCount / studentLogs.length) * 100) : null,
        },
      };
    });

    res.status(200).json({
      success: true,
      data: {
        report,
        totalDays,
        month,
        year,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSubmissionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const classes = await prisma.class.findMany({
      where: { tenantId: req.user!.tenantId },
      include: {
        attendance: {
          where: { date: today },
          take: 1
        },
        _count: {
          select: { enrollments: true }
        }
      }
    });

    const statusList = classes.map(c => ({
      classId: c.id,
      className: c.name,
      studentCount: c._count.enrollments,
      submitted: c.attendance.length > 0,
      submittedAt: c.attendance.length > 0 ? c.attendance[0].createdAt : null,
    }));

    res.status(200).json({ success: true, data: statusList });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceAlerts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const classes = await prisma.class.findMany({
      where: { tenantId },
      include: {
        attendance: {
          where: { date: today },
          take: 1
        }
      }
    });
    
    const pendingClassList = classes.filter(c => c.attendance.length === 0);
    const pendingClasses = pendingClassList.length;

    const alerts = [];
    if (pendingClasses > 0) {
      let classNamesText = '';
      if (pendingClasses === 1) {
        classNamesText = pendingClassList[0].name;
      } else if (pendingClasses === 2) {
        classNamesText = `${pendingClassList[0].name} and ${pendingClassList[1].name}`;
      } else {
        classNamesText = `${pendingClassList[0].name} and ${pendingClasses - 1} others`;
      }

      alerts.push({
        id: 'pending-attendance',
        type: 'WARNING',
        message: `${classNamesText} ${pendingClasses === 1 ? 'has' : 'have'} pending attendance for today.`
      });
    }

    res.status(200).json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
};
