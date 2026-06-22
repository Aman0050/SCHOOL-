import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db';
import { AppError } from '../errors/AppError';
import { createAuditLog, AuditAction } from '../utils/auditLogger';

// Validation Schemas
export const bulkAttendanceSchema = z.object({
  date: z.string(), // ISO String or YYYY-MM-DD
  classId: z.string().uuid().optional(),
  records: z.array(
    z.object({
      userId: z.string().uuid(),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
      remarks: z.string().optional(),
      mode: z.enum(['MANUAL', 'QR', 'RFID', 'FACE']).default('MANUAL'),
    })
  ),
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
              classId: classId || '',
            },
          },
          update: {
            status: rec.status,
            remarks: rec.remarks || null,
            mode: rec.mode || 'MANUAL',
            recordedById,
          },
          create: {
            userId: rec.userId,
            date: targetDate,
            classId: classId || '',
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
      action: AuditAction.CREATE,
      entity: 'Attendance',
      entityId: `bulk-${savedRecords.length}`,
      newValues: { count: savedRecords.length, date: targetDate },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Emit live activity feed for Attendance Dashboard
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { profile: true }
    });
    const userName = user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : 'Teacher';
    
    req.io?.to(req.user!.tenantId).emit('activity_feed', {
      type: 'ATTENDANCE',
      text: `Attendance submitted by ${userName} for ${savedRecords.length} students`,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    });

    res.status(200).json({
      success: true,
      data: {
        message: `Successfully recorded ${savedRecords.length} attendance logs.`,
      },
    });
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
    for (let i = daysLimit - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setUTCHours(0, 0, 0, 0);

      const whereClause: any = { date };
      if (classId) whereClause.classId = classId;

      const [presentCount, totalCount] = await Promise.all([
        prisma.attendance.count({
          where: { ...whereClause, status: 'PRESENT' },
        }),
        prisma.attendance.count({
          where: whereClause,
        }),
      ]);

      trends.push({
        date: date.toISOString().split('T')[0],
        present: presentCount,
        total: totalCount,
        rate: totalCount > 0 ? parseFloat(((presentCount / totalCount) * 100).toFixed(1)) : 100,
      });
    }

    // 2. Fetch total students enrolled vs present today
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const todayWhere: any = { date: today };
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
          percentage: studentLogs.length > 0 ? Math.round((presentCount / studentLogs.length) * 100) : 100,
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
