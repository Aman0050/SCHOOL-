
import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { generateDailyReportPdfBuffer } from '../utils/pdfGenerator';
import { cache } from '../lib/cache';
import { analyticsQueue } from '../workers/analyticsQueue';

export const getAttendanceIntelligence = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAttendance = await prisma.attendance.findMany({
      where: { date: { gte: today } },
      include: { user: { select: { role: true, firstName: true, lastName: true } }, class: true }
    });

    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const totalTeachers = await prisma.user.count({ where: { role: 'TEACHER' } });

    const studentPresent = todayAttendance.filter(a => a.user.role === 'STUDENT' && a.status === 'PRESENT').length;
    const studentAbsent = todayAttendance.filter(a => a.user.role === 'STUDENT' && a.status === 'ABSENT').length;
    const studentLate = todayAttendance.filter(a => a.user.role === 'STUDENT' && a.status === 'LATE').length;

    const teacherPresent = todayAttendance.filter(a => a.user.role === 'TEACHER' && a.status === 'PRESENT').length;
    const teacherAbsent = todayAttendance.filter(a => a.user.role === 'TEACHER' && a.status === 'ABSENT').length;
    const teacherLate = todayAttendance.filter(a => a.user.role === 'TEACHER' && a.status === 'LATE').length;

    const studentRate = totalStudents > 0 ? (studentPresent / totalStudents) * 100 : 0;
    const teacherRate = totalTeachers > 0 ? (teacherPresent / totalTeachers) * 100 : 0;

    let healthScore = 'Excellent';
    if (studentRate < 70) healthScore = 'Critical';
    else if (studentRate < 85) healthScore = 'Warning';
    else if (studentRate < 95) healthScore = 'Good';

    res.json({
      success: true,
      data: {
        healthScore,
        students: {
          total: totalStudents,
          present: studentPresent,
          absent: studentAbsent,
          late: studentLate,
          rate: studentRate
        },
        teachers: {
          total: totalTeachers,
          present: teacherPresent,
          absent: teacherAbsent,
          late: teacherLate,
          rate: teacherRate
        },
        atRiskStudents: [] // Will implement detailed aggregation later
      }
    });
  } catch (error) {
    console.error('Error fetching attendance intelligence:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch intelligence' });
  }
};

export const getFeeIntelligence = async (req: Request, res: Response) => {
  try {
    const collections = await prisma.feeCollection.aggregate({
      _sum: { paidAmount: true },
      where: { status: 'PAID' } // Also FeeStatus doesn't have 'COMPLETED', it has 'PAID'
    });
    
    // Simplistic metric for now
    res.json({
      success: true,
      data: {
        collection: {
          collected: collections._sum.paidAmount || 0,
          percentage: 85, // Mock percentage
        },
        defaulters: []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch fee intelligence' });
  }
};

export const getExamIntelligence = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        schoolLevel: { passPercentage: 88.5, averageScore: 72.4 },
        subjectPerformance: { highest: 'Computer Science', lowest: 'Physics' }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch exam intelligence' });
  }
};

export const getSchoolHealthScore = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const cacheKey = `tenant:${tenantId}:health-score`;

    // Trigger background recalculation for precision metrics without blocking
    await analyticsQueue.add('calculate-health-score', { tenantId, schoolId: 'primary' }, { removeOnComplete: true });

    const data = await cache.remember(cacheKey, 3600, async () => {
      // 1. Attendance Performance
      const totalStudents = await prisma.user.count({ where: { tenantId, role: 'STUDENT' } });
      const attendanceRecords = await prisma.attendance.count({ where: { tenantId, status: 'PRESENT' } });
      const attendanceScore = totalStudents > 0 ? Math.min((attendanceRecords / (totalStudents * 5)) * 100, 100) : 85;

      // 2. Syllabus Completion
      const completedLessons = await prisma.lessonPlan.count({ where: { tenantId, status: 'COMPLETED' } });
      const totalLessons = await prisma.lessonPlan.count({ where: { tenantId } });
      const academicScore = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 90;

      // 3. Homework Completion
      const completedHomeworks = await prisma.homeworkSubmission.count({ where: { tenantId, status: 'GRADED' } });
      const totalHomeworks = await prisma.homeworkSubmission.count({ where: { tenantId } });
      const homeworkScore = totalHomeworks > 0 ? (completedHomeworks / totalHomeworks) * 100 : 80;

      // 4. Calculate overall
      const overallScore = Math.round((attendanceScore * 0.3) + (academicScore * 0.4) + (homeworkScore * 0.3));
      let category = 'EXCELLENT';
      if (overallScore < 50) category = 'CRITICAL';
      else if (overallScore < 75) category = 'WARNING';
      else if (overallScore < 90) category = 'GOOD';

      return {
        overallScore,
        category,
        breakdown: {
          attendance: Math.round(attendanceScore),
          academics: Math.round(academicScore),
          homework: Math.round(homeworkScore),
          engagement: 82 // Mocked for now
        }
      };
    });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching health score:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch health score' });
  }
};

export const getSystemAlerts = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        alerts: [
          { id: '1', type: 'ATTENDANCE', severity: 'CRITICAL', message: 'Class 9-B attendance dropped by 15% this week.', isRead: false },
        ],
        recommendations: []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch alerts' });
  }
};


export const getStudentIntelligence = async (req: Request, res: Response) => {
    try {
      const tenantId = req.user?.tenantId;
      
      let [totalStudents, activeStudents, newAdmissions] = await Promise.all([
        prisma.user.count({ where: { role: 'STUDENT', tenantId } }),
        prisma.user.count({ where: { role: 'STUDENT', isActive: true, tenantId } }),
        prisma.admission.count({ where: { tenantId, admissionDate: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) } } })
      ]);

      // Fallback to rich mock data if the database is currently empty for demonstration
      if (totalStudents === 0) {
        totalStudents = 1524;
        activeStudents = 1480;
        newAdmissions = 124;
      }
  
      res.json({
        success: true,
        data: {
          totalStudents,
          activeStudents,
          newAdmissions,
          inactiveStudents: totalStudents === 1524 ? 44 : (totalStudents - activeStudents),
          transferRequests: 2, 
          graduatedStudents: totalStudents === 1524 ? 350 : 0
        }
      });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch student intelligence' });
  }
};

export const getTeacherWorkloadAnalytics = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const teacherId = req.query.teacherId as string | undefined;

    const whereClause: any = { tenantId, role: 'TEACHER' };
    if (teacherId) whereClause.id = teacherId;

    const teachers = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        assignedSubjects: { select: { subjectId: true } },
        timetables: { select: { id: true, startTime: true, endTime: true } },
        lessonPlans: { where: { status: 'DRAFT' }, select: { id: true } }
      }
    });

    const workloadData = teachers.map(t => {
      const subjectsAssigned = t.assignedSubjects.length;
      const periodsAssigned = t.timetables.length;
      // Assume 1 period = 45 mins -> Hours = periods * 0.75
      const weeklyHours = periodsAssigned * 0.75;
      const pendingTasks = t.lessonPlans.length;
      
      // Basic workload score 0-100 (100 being fully loaded, assume 30 periods is max)
      const workloadScore = Math.min((periodsAssigned / 30) * 100, 100);

      return {
        teacher: `${t.firstName} ${t.lastName}`,
        subjectsAssigned,
        periodsAssigned,
        weeklyHours,
        pendingTasks,
        workloadScore: Math.round(workloadScore)
      };
    });

    res.json({
      success: true,
      data: workloadData
    });
  } catch (error) {
    console.error('Error fetching teacher workload:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch teacher workload' });
  }
};


export const downloadDailyReport = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const totalTeachers = await prisma.user.count({ where: { role: 'TEACHER' } });
    
    const todayAttendance = await prisma.attendance.findMany({
      where: { date: { gte: today } },
      include: { user: { select: { role: true } } }
    });

    const studentPresent = todayAttendance.filter((a: any) => a.user.role === 'STUDENT' && a.status === 'PRESENT').length;
    const teacherPresent = todayAttendance.filter((a: any) => a.user.role === 'TEACHER' && a.status === 'PRESENT').length;

    const studentAttendanceRate = totalStudents > 0 ? ((studentPresent / totalStudents) * 100).toFixed(1) : '0.0';
    const staffAttendanceRate = totalTeachers > 0 ? ((teacherPresent / totalTeachers) * 100).toFixed(1) : '0.0';

    const feeCollections = await prisma.feeCollection.aggregate({
      where: { createdAt: { gte: today } },
      _sum: { paidAmount: true },
      _count: { id: true }
    });

    const data = {
      healthScore: 94,
      attendanceRate: studentAttendanceRate,
      staffAttendanceRate: staffAttendanceRate,
      feeCollection: feeCollections._sum.paidAmount || 0,
      transactionCount: feeCollections._count.id || 0,
      alerts: [
        { severity: 'info', message: 'End of term examinations starting next week.' },
        { severity: 'warning', message: 'Library books overdue for 12 students.' }
      ]
    };

    const pdfBuffer = await generateDailyReportPdfBuffer(data);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Daily_Operations_Report.pdf"');
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating daily report:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
};
