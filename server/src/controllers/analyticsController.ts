import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { generateDailyReportPdfBuffer } from '../utils/pdfGenerator';
import { cache } from '../lib/cache';
import { analyticsQueue } from '../workers/analyticsQueue';
import { analyticsService } from '../services/analyticsService';

export const getAttendanceIntelligence = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const cacheKey = `tenant:${tenantId}:attendance`;
    
    let data = await cache.get(cacheKey);
    if (!data) {
      try {
        data = await analyticsService.getAttendanceIntelligence(tenantId);
        // Fire and forget cache update, don't wait for it
        cache.set(cacheKey, data, 300).catch(console.error);
      } catch (err) {
        console.error('Failed to compute attendance intelligence synchronously', err);
        return res.status(500).json({ success: false, message: 'Failed to generate data.' });
      }
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching attendance intelligence:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch intelligence' });
  }
};

export const getFeeIntelligence = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const cacheKey = `tenant:${tenantId}:fees`;

    let data = await cache.get(cacheKey);
    if (!data) {
      try {
        data = await analyticsService.getFeeIntelligence(tenantId);
        cache.set(cacheKey, data, 300).catch(console.error);
      } catch (err) {
        console.error('Failed to compute fee intelligence synchronously', err);
        return res.status(500).json({ success: false, message: 'Failed to generate data.' });
      }
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching fee intelligence:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch fee intelligence' });
  }
};

export const getExamIntelligence = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.user!;

    // Real Subject Performance from MarksEntry
    const marksBySubject = await prisma.marksEntry.groupBy({
      by: ['subjectId'],
      where: { tenantId, entryStatus: 'PUBLISHED', isAbsent: false },
      _avg: { totalMarks: true },
    });

    const subjectDetails = await prisma.examSubject.findMany({
      where: { id: { in: marksBySubject.map(m => m.subjectId) } },
      select: { id: true, name: true }
    });

    const subjectPerformance = marksBySubject.map(m => {
      const subject = subjectDetails.find(s => s.id === m.subjectId);
      return {
        subject: subject?.name || 'Unknown',
        score: Number(m._avg.totalMarks || 0),
        avg: 70 // Static global average for baseline comparison
      };
    }).slice(0, 5); // Limit to top 5 for radar chart

    // Real Class Performance from StudentResult
    const resultsByClass = await prisma.studentResult.groupBy({
      by: ['classId'],
      where: { tenantId },
      _avg: { percentage: true }
    });

    const classDetails = await prisma.class.findMany({
      where: { id: { in: resultsByClass.map(r => r.classId) } },
      select: { id: true, name: true }
    });

    const classPerformance = resultsByClass.map(r => {
      const cls = classDetails.find(c => c.id === r.classId);
      return {
        class: cls?.name || 'Unknown',
        score: Number(r._avg.percentage || 0)
      };
    });

    const overallStats = await prisma.studentResult.aggregate({
      where: { tenantId },
      _avg: { percentage: true }
    });
    
    const passedCount = await prisma.studentResult.count({
      where: { tenantId, resultStatus: 'PASS' }
    });
    
    const totalCount = await prisma.studentResult.count({
      where: { tenantId }
    });

    const passPercentage = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;

    res.json({
      success: true,
      data: {
        schoolLevel: { passPercentage, averageScore: Number(overallStats._avg.percentage || 0) },
        subjectPerformance: subjectPerformance.length > 0 ? subjectPerformance : [{ subject: 'No Data', score: 0, avg: 0 }],
        classPerformance: classPerformance.length > 0 ? classPerformance : [{ class: 'No Data', score: 0 }]
      }
    });
  } catch (error) {
    console.error('Error fetching exam intelligence:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch exam intelligence' });
  }
};

export const getSchoolHealthScore = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const cacheKey = `tenant:${tenantId}:health-score`;

    let data = await cache.get(cacheKey);
    if (!data) {
      try {
        data = await analyticsService.getSchoolHealthScore(tenantId);
        // Fire and forget cache update, don't wait for it
        cache.set(cacheKey, data, 300).catch(console.error);
      } catch (err) {
        console.error('Failed to compute health score synchronously', err);
        return res.status(500).json({ success: false, message: 'Failed to generate data.' });
      }
    }

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

      const genderGroups = await prisma.profile.groupBy({
        by: ['gender'],
        _count: { _all: true },
        where: { user: { role: 'STUDENT', tenantId }, gender: { not: null } }
      });

      const genderDemographics = genderGroups.map(g => ({
        name: g.gender,
        value: g._count._all
      }));

      res.json({
        success: true,
        data: {
          totalStudents,
          activeStudents,
          newAdmissions,
          inactiveStudents: totalStudents - activeStudents,
          transferRequests: 2, 
          graduatedStudents: 0,
          genderDemographics
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


export const downloadDailyReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.user!;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalStudents = await prisma.user.count({ where: { tenantId, role: 'STUDENT' } });
    const totalTeachers = await prisma.user.count({ where: { tenantId, role: 'TEACHER' } });
    
    const todayAttendance = await prisma.attendance.findMany({
      where: { tenantId, date: { gte: today } },
      include: { user: { select: { role: true } } }
    });

    const studentPresent = todayAttendance.filter((a: any) => a.user.role === 'STUDENT' && a.status === 'PRESENT').length;
    const teacherPresent = todayAttendance.filter((a: any) => a.user.role === 'TEACHER' && a.status === 'PRESENT').length;

    const studentAttendanceRate = totalStudents > 0 ? ((studentPresent / totalStudents) * 100).toFixed(1) : '0.0';
    const staffAttendanceRate = totalTeachers > 0 ? ((teacherPresent / totalTeachers) * 100).toFixed(1) : '0.0';

    const feeCollections = await prisma.feeCollection.aggregate({
      where: { tenantId, createdAt: { gte: today } },
      _sum: { paidAmount: true },
      _count: { id: true }
    });
    
    const health = await analyticsService.getSchoolHealthScore(tenantId);

    const data = {
      healthScore: health.overallScore,
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
    next(error);
  }
};

import ExcelJS from 'exceljs';

export const downloadExcelReport = async (req: Request, res: Response, next: NextFunction) => {
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
    
    // Real DB aggregation for Attendance
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const attendanceStats = await prisma.attendance.groupBy({
      by: ['date', 'status'],
      where: { tenantId, date: { gte: thirtyDaysAgo } },
      _count: { id: true }
    });
    
    const attendanceRows = attendanceStats.map(a => ({
      date: new Date(a.date).toLocaleDateString(),
      role: 'USER', // simplified
      status: a.status,
      count: a._count.id
    }));
    
    attendanceSheet.addRows(attendanceRows.length > 0 ? attendanceRows : [
      { date: new Date().toLocaleDateString(), role: 'No Data', status: '-', count: 0 }
    ]);

    // 2. Fees Sheet
    const feeSheet = workbook.addWorksheet('Fee Intel');
    feeSheet.columns = [
      { header: 'Student Name', key: 'name', width: 25 },
      { header: 'Class', key: 'class', width: 15 },
      { header: 'Outstanding Amount', key: 'amount', width: 20 },
      { header: 'Days Overdue', key: 'days', width: 15 }
    ];

    const defaulters = await prisma.feeInstallment.findMany({
      where: { tenantId, isPaid: false, dueDate: { lt: new Date() } },
      include: { 
        assignment: { 
          include: { 
            student: { 
              select: { 
                firstName: true, 
                lastName: true, 
                enrollments: { include: { class: true } } 
              } 
            } 
          } 
        } 
      },
      take: 50,
      orderBy: { dueDate: 'asc' }
    });
    
    const feeRows = defaulters.map(d => ({
      name: `${d.assignment.student.firstName} ${d.assignment.student.lastName}`,
      class: d.assignment.student.enrollments?.[0]?.class?.name || 'Unassigned',
      amount: Number(d.amount) - Number(d.paidAmount),
      days: Math.floor((new Date().getTime() - new Date(d.dueDate).getTime()) / (1000 * 3600 * 24))
    }));
    
    feeSheet.addRows(feeRows.length > 0 ? feeRows : [
      { name: 'No Defaulters', class: '-', amount: 0, days: 0 }
    ]);

    // Add premium styling to a worksheet
    const applyPremiumStyle = (sheet: ExcelJS.Worksheet, title: string, colCount: number) => {
      // Shift data down by 3 rows
      sheet.spliceRows(1, 0, [], [], []);
      
      // Title
      sheet.mergeCells(1, 1, 1, colCount);
      const titleCell = sheet.getCell(1, 1);
      titleCell.value = 'EDUXENO COMMAND CENTER';
      titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }; // Slate-800
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      sheet.getRow(1).height = 35;

      // Subtitle
      sheet.mergeCells(2, 1, 2, colCount);
      const subCell = sheet.getCell(2, 1);
      subCell.value = `${title} | Generated: ${new Date().toLocaleString()}`;
      subCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF64748B' } };
      subCell.alignment = { horizontal: 'center', vertical: 'middle' };
      sheet.getRow(2).height = 20;
      
      // Style Headers (Now at row 4)
      const headerRow = sheet.getRow(4);
      headerRow.height = 25;
      for (let i = 1; i <= colCount; i++) {
        const cell = headerRow.getCell(i);
        cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }; // Indigo-600
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: {style:'thin', color: {argb:'FFD1D5DB'}},
          left: {style:'thin', color: {argb:'FFD1D5DB'}},
          bottom: {style:'thin', color: {argb:'FFD1D5DB'}},
          right: {style:'thin', color: {argb:'FFD1D5DB'}}
        };
      }

      // Style Data Rows
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber > 4) {
          row.height = 20;
          for (let i = 1; i <= colCount; i++) {
            const cell = row.getCell(i);
            cell.font = { name: 'Arial', size: 10, color: { argb: 'FF334155' } };
            cell.alignment = { vertical: 'middle' };
            cell.border = {
              bottom: {style:'thin', color: {argb:'FFF1F5F9'}},
            };
          }
        }
      });
    };

    applyPremiumStyle(attendanceSheet, 'ATTENDANCE INTELLIGENCE', 4);
    applyPremiumStyle(feeSheet, 'FEE & DEFAULTER INTELLIGENCE', 4);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Analytics_Report.xlsx"');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

export const getDashboardAggregate = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const cacheKey = `tenant:${tenantId}:dashboard:aggregate`;

    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      res.json({ success: true, data: cachedData, source: 'cache' });
      return;
    }

    // Cache Miss: compute synchronously to ensure frontend gets data, but queue subsequent heavy updates
    const aggregatedData = await analyticsService.getExecutiveDashboardMetrics(tenantId);
    await cache.set(cacheKey, aggregatedData, 3600); // 1 hour TTL
    
    res.json({ success: true, data: aggregatedData, source: 'database' });
  } catch (error) {
    console.error('Error in getDashboardAggregate:', error);
    res.status(500).json({ success: false, message: 'Failed to aggregate dashboard data' });
  }
};
