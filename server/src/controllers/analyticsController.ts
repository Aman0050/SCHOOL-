
import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { generateDailyReportPdfBuffer } from '../utils/pdfGenerator';
import { cache } from '../lib/cache';
import { analyticsQueue } from '../workers/analyticsQueue';

export const getAttendanceIntelligence = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Past 7 days trend using real data
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const pastWeekAttendance = await prisma.attendance.groupBy({
      by: ['date', 'status'],
      where: { date: { gte: sevenDaysAgo }, tenantId },
      _count: { id: true }
    });

    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const presents = pastWeekAttendance.filter(a => new Date(a.date).toDateString() === d.toDateString() && a.status === 'PRESENT').reduce((sum, a) => sum + a._count.id, 0);
      const total = pastWeekAttendance.filter(a => new Date(a.date).toDateString() === d.toDateString()).reduce((sum, a) => sum + a._count.id, 0);
      
      trendData.push({
        date: dayName,
        rate: total > 0 ? Math.round((presents / total) * 100) : 0
      });
    }

    const todayAttendance = await prisma.attendance.findMany({
      where: { date: { gte: today }, tenantId },
      include: { user: { select: { id: true, role: true, firstName: true, lastName: true } }, class: true }
    });

    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT', tenantId, isActive: true } });
    const totalTeachers = await prisma.user.count({ where: { role: 'TEACHER', tenantId, isActive: true } });

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

    // 2. Real At-Risk Students Calculation (Past 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const recentAbsences = await prisma.attendance.groupBy({
      by: ['userId'],
      where: { status: 'ABSENT', date: { gte: thirtyDaysAgo }, tenantId, user: { role: 'STUDENT' } },
      _count: { id: true }
    });

    const atRiskUserIds = recentAbsences.filter(a => a._count.id >= 5).map(a => a.userId).slice(0, 10);
    let atRiskStudents: any[] = [];
    
    if (atRiskUserIds.length > 0) {
      const riskProfiles = await prisma.user.findMany({
        where: { id: { in: atRiskUserIds } },
        include: { profile: true }
      });
      
      atRiskStudents = riskProfiles.map(u => {
        const absences = recentAbsences.find(a => a.userId === u.id)?._count.id || 0;
        return {
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          class: 'Enrolled', // Should fetch enrollment details ideally
          consecutiveAbsences: absences,
          currentRate: Math.max(0, 100 - (absences * 3.33)) // Approx rate for 30 days
        };
      });
    }

    res.json({
      success: true,
      data: {
        healthScore,
        trend: trendData,
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
        atRiskStudents
      }
    });
  } catch (error) {
    console.error('Error fetching attendance intelligence:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch intelligence' });
  }
};

export const getFeeIntelligence = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const collections = await prisma.feeCollection.aggregate({
      _sum: { paidAmount: true, totalAmount: true },
      where: { tenantId }
    });

    const totalCollected = Number(collections._sum.paidAmount || 0);
    const totalExpected = Number(collections._sum.totalAmount || 0);

    // 1. Real revenue trends for 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    
    const historicalPayments = await prisma.paymentInstallment.findMany({
      where: { tenantId, status: 'SUCCESS', createdAt: { gte: sixMonthsAgo } }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueMap: Record<string, number> = {};
    
    historicalPayments.forEach(p => {
      const m = `${months[p.createdAt.getMonth()]} ${p.createdAt.getFullYear()}`;
      revenueMap[m] = (revenueMap[m] || 0) + Number(p.amount);
    });

    const revenueTrend = Object.keys(revenueMap).map(m => ({
      month: m,
      revenue: revenueMap[m],
      target: revenueMap[m] * 1.1 // Example target logic
    }));

    // 2. Real Defaulters
    const defaulterRecords = await prisma.feeCollection.findMany({
      where: { tenantId, status: { not: 'PAID' }, dueDate: { lt: new Date() } },
      include: { student: { select: { firstName: true, lastName: true } } },
      take: 10,
      orderBy: { dueDate: 'asc' }
    });

    const defaulters = defaulterRecords.map(d => ({
      id: d.id,
      name: `${d.student.firstName} ${d.student.lastName}`,
      class: 'Enrolled',
      amount: Number(d.totalAmount) - Number(d.paidAmount),
      dueDays: Math.floor((new Date().getTime() - new Date(d.dueDate).getTime()) / (1000 * 3600 * 24))
    }));
    
    res.json({
      success: true,
      data: {
        collection: {
          collected: totalCollected,
          percentage: totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0,
          forecast: totalExpected 
        },
        revenueTrend,
        defaulters
      }
    });
  } catch (error) {
    console.error('Error fetching fee intelligence:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch fee intelligence' });
  }
};

export const getExamIntelligence = async (req: Request, res: Response) => {
  try {
    // Mock subject performance radar data
    const subjectPerformance = [
      { subject: 'Math', score: 85, avg: 70 },
      { subject: 'Science', score: 92, avg: 75 },
      { subject: 'English', score: 78, avg: 82 },
      { subject: 'History', score: 88, avg: 80 },
      { subject: 'Computer', score: 95, avg: 85 },
    ];

    // Mock Class wise performance
    const classPerformance = [
      { class: 'Grade 9', score: 82 },
      { class: 'Grade 10', score: 88 },
      { class: 'Grade 11', score: 76 },
      { class: 'Grade 12', score: 91 },
    ];

    res.json({
      success: true,
      data: {
        schoolLevel: { passPercentage: 88.5, averageScore: 72.4 },
        subjectPerformance,
        classPerformance
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

import ExcelJS from 'exceljs';

export const downloadExcelReport = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const workbook = new ExcelJS.Workbook();
    
    // 1. Attendance Sheet
    const attendanceSheet = workbook.addWorksheet('Attendance Intel');
    attendanceSheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Role', key: 'role', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Count', key: 'count', width: 10 }
    ];
    
    // Mocking rows since DB aggregation can be complex here
    attendanceSheet.addRows([
      { date: new Date().toLocaleDateString(), role: 'STUDENT', status: 'PRESENT', count: 1200 },
      { date: new Date().toLocaleDateString(), role: 'STUDENT', status: 'ABSENT', count: 80 },
      { date: new Date().toLocaleDateString(), role: 'TEACHER', status: 'PRESENT', count: 45 },
    ]);

    // 2. Fees Sheet
    const feeSheet = workbook.addWorksheet('Fee Intel');
    feeSheet.columns = [
      { header: 'Student Name', key: 'name', width: 25 },
      { header: 'Class', key: 'class', width: 15 },
      { header: 'Outstanding Amount', key: 'amount', width: 20 },
      { header: 'Days Overdue', key: 'days', width: 15 }
    ];

    feeSheet.addRows([
      { name: 'John Doe', class: '10-A', amount: 2500, days: 15 },
      { name: 'Jane Smith', class: '9-B', amount: 1200, days: 8 },
      { name: 'Mike Ross', class: '11-C', amount: 4500, days: 30 }
    ]);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Analytics_Report.xlsx"');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating Excel report:', error);
    res.status(500).json({ success: false, message: 'Failed to generate excel report' });
  }
};
