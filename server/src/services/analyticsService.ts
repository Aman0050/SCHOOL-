import { prisma } from '../config/db';

export const analyticsService = {
  async getExecutiveDashboardMetrics(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const totalStudents = await prisma.user.count({ where: { tenantId, role: 'STUDENT', isActive: true } });
    const totalTeachers = await prisma.user.count({ where: { tenantId, role: 'TEACHER', isActive: true } });
    const totalParents = await prisma.user.count({ where: { tenantId, role: 'PARENT', isActive: true } });
    const totalStaff = await prisma.user.count({ where: { tenantId, role: 'STAFF', isActive: true } });
    const todayAttendance = await prisma.attendance.findMany({ where: { tenantId, date: { gte: today } }, include: { user: { select: { role: true } } } });
    const revenueToday = await prisma.paymentInstallment.aggregate({ _sum: { amount: true }, where: { tenantId, status: 'SUCCESS', createdAt: { gte: today } } });
    const revenueMonth = await prisma.paymentInstallment.aggregate({ _sum: { amount: true }, where: { tenantId, status: 'SUCCESS', createdAt: { gte: firstDayOfMonth } } });
    const pendingFees = await prisma.feeCollection.aggregate({ _sum: { totalAmount: true, paidAmount: true }, where: { tenantId, status: { not: 'PAID' } } });
    const healthScore = await this.getSchoolHealthScore(tenantId);
    const alertData = await this.getSystemAlerts(tenantId);

    const studentPresent = todayAttendance.filter(a => a.user.role === 'STUDENT' && a.status === 'PRESENT').length;
    const teacherPresent = todayAttendance.filter(a => a.user.role === 'TEACHER' && a.status === 'PRESENT').length;

    const pendingApprovalsCount = await prisma.leaveRequest.count({ where: { tenantId, status: 'PENDING' } });

    // Using existing methods to fill remaining dashboard data for backwards compatibility
    const attData = await this.getAttendanceIntelligence(tenantId);
    const feeData = await this.getFeeIntelligence(tenantId);
    
    return {
      overview: {
        students: totalStudents,
        teachers: totalTeachers,
        parents: totalParents,
        staff: totalStaff,
      },
      attendance: {
        studentRate: totalStudents ? (studentPresent / totalStudents) * 100 : 0,
        teacherRate: totalTeachers ? (teacherPresent / totalTeachers) * 100 : 0,
        ...attData
      },
      revenue: {
        today: Number(revenueToday._sum.amount || 0),
        thisMonth: Number(revenueMonth._sum.amount || 0),
        pending: Number((pendingFees._sum.totalAmount || 0) - (pendingFees._sum.paidAmount || 0))
      },
      fees: feeData,
      operations: {
        pendingAdmissions: 0,
        pendingApprovals: pendingApprovalsCount,
        todaysClasses: 0,
        todaysExams: 0,
      },
      health: healthScore,
      alerts: alertData
    };
  },

  async getAttendanceIntelligence(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

    const totalMarked = studentPresent + studentAbsent + studentLate;
    let healthScore = 'Pending';
    
    if (totalMarked > 0) {
      if (studentRate < 70) healthScore = 'Critical';
      else if (studentRate < 85) healthScore = 'Warning';
      else if (studentRate < 95) healthScore = 'Good';
      else healthScore = 'Excellent';
    }

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
          class: 'Enrolled', 
          consecutiveAbsences: absences,
          currentRate: Math.max(0, 100 - (absences * 3.33)) 
        };
      });
    }

    return {
      healthScore,
      trend: trendData,
      students: { total: totalStudents, present: studentPresent, absent: studentAbsent, late: studentLate, rate: studentRate },
      teachers: { total: totalTeachers, present: teacherPresent, absent: teacherAbsent, late: teacherLate, rate: teacherRate },
      atRiskStudents
    };
  },

  async getFeeIntelligence(tenantId: string) {
    const collections = await prisma.feeCollection.aggregate({
      _sum: { paidAmount: true, totalAmount: true },
      where: { tenantId }
    });

    const totalCollected = Number(collections._sum.paidAmount || 0);
    const totalExpected = Number(collections._sum.totalAmount || 0);

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
      target: revenueMap[m] * 1.1 
    }));

    const defaulterRecords = await prisma.feeInstallment.findMany({
      where: { tenantId, isPaid: false, dueDate: { lt: new Date() } },
      include: { assignment: { include: { student: { select: { firstName: true, lastName: true } } } } },
      take: 10,
      orderBy: { dueDate: 'asc' }
    });

    const defaulters = defaulterRecords.map(d => ({
      id: d.id,
      name: `${d.assignment.student.firstName} ${d.assignment.student.lastName}`,
      class: 'Enrolled',
      amount: Number(d.amount) - Number(d.paidAmount),
      dueDays: Math.floor((new Date().getTime() - new Date(d.dueDate).getTime()) / (1000 * 3600 * 24))
    }));
    
    return {
      collection: {
        collected: totalCollected,
        percentage: totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0,
        forecast: totalExpected 
      },
      revenueTrend,
      defaulters
    };
  },

  async getSchoolHealthScore(tenantId: string) {
    const totalStudents = await prisma.user.count({ where: { tenantId, role: 'STUDENT' } });
    const attendanceRecords = await prisma.attendance.count({ where: { tenantId, status: 'PRESENT', user: { role: 'STUDENT' } } });
    // Normalize assuming ~20 school days
    const attendanceScore = totalStudents > 0 ? Math.min((attendanceRecords / (totalStudents * 20)) * 100, 100) : 85;

    const totalTeachers = await prisma.user.count({ where: { tenantId, role: 'TEACHER' } });
    const teacherAttendance = await prisma.attendance.count({ where: { tenantId, status: 'PRESENT', user: { role: 'TEACHER' } } });
    const teacherAttendanceScore = totalTeachers > 0 ? Math.min((teacherAttendance / (totalTeachers * 20)) * 100, 100) : 90;

    const collections = await prisma.feeCollection.aggregate({ _sum: { paidAmount: true, totalAmount: true }, where: { tenantId } });
    const totalCollected = Number(collections._sum.paidAmount || 0);
    const totalExpected = Number(collections._sum.totalAmount || 0);
    const feeScore = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 90;

    const completedLessons = await prisma.lessonPlan.count({ where: { tenantId, status: 'COMPLETED' } });
    const totalLessons = await prisma.lessonPlan.count({ where: { tenantId } });
    const academicScore = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 85;

    const completedHomeworks = await prisma.homeworkSubmission.count({ where: { tenantId, status: 'GRADED' } });
    const totalHomeworks = await prisma.homeworkSubmission.count({ where: { tenantId } });
    const homeworkScore = totalHomeworks > 0 ? (completedHomeworks / totalHomeworks) * 100 : 80;

    // Fixed values for missing modules temporarily
    const admissionsScore = 85;
    const communicationScore = 90;
    const systemScore = 95;

    const overallScore = Math.round(
      (attendanceScore * 0.25) +
      (feeScore * 0.20) +
      (academicScore * 0.20) +
      (admissionsScore * 0.10) +
      (teacherAttendanceScore * 0.10) +
      (homeworkScore * 0.05) +
      (communicationScore * 0.05) +
      (systemScore * 0.05)
    );

    let category = 'EXCELLENT';
    if (overallScore < 70) category = 'CRITICAL';
    else if (overallScore < 85) category = 'NEEDS_ATTENTION';
    else if (overallScore < 95) category = 'GOOD';

    // Basic historical trend mock for now
    const trend = [
      { month: 'Jan', score: Math.max(overallScore - 5, 0) },
      { month: 'Feb', score: Math.max(overallScore - 2, 0) },
      { month: 'Mar', score: overallScore }
    ];

    return {
      overallScore,
      category,
      trend,
      breakdown: {
        attendance: Math.round(attendanceScore),
        fees: Math.round(feeScore),
        academics: Math.round(academicScore),
        admissions: Math.round(admissionsScore),
        teacherAttendance: Math.round(teacherAttendanceScore),
        homework: Math.round(homeworkScore),
        communication: Math.round(communicationScore),
        system: Math.round(systemScore)
      },
      improvementSuggestions: [
        "Follow up on pending fee collections to boost financial health.",
        "Ensure teachers mark daily attendance consistently."
      ],
      riskIndicators: overallScore < 80 ? ["High outstanding fee balance", "Student attendance dropping"] : []
    };
  },

  async getSystemAlerts(tenantId: string) {
    const alerts: any[] = [];
    const recommendations: string[] = [];

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // 1. Pending Submissions Alert
    const pendingClassesCount = await prisma.class.count({
      where: {
        tenantId,
        attendance: { none: { date: today } }
      }
    });

    if (pendingClassesCount > 0) {
      alerts.push({
        id: `pending-att-${Date.now()}`,
        type: 'ATTENDANCE_PENDING',
        severity: 'WARNING',
        message: `${pendingClassesCount} classes have pending attendance for today.`,
        isRead: false
      });
      recommendations.push('Remind teachers to submit daily attendance by 10 AM.');
    }

    // 2. High Absence Alert
    const todayAbsences = await prisma.attendance.count({
      where: { tenantId, date: today, status: 'ABSENT', user: { role: 'STUDENT' } }
    });
    const totalStudents = await prisma.user.count({
      where: { tenantId, role: 'STUDENT', isActive: true }
    });

    if (totalStudents > 0 && (todayAbsences / totalStudents) > 0.1) {
      alerts.push({
        id: `high-absent-${Date.now()}`,
        type: 'ATTENDANCE_SPIKE',
        severity: 'CRITICAL',
        message: `High absence rate detected today (${Math.round((todayAbsences/totalStudents)*100)}%).`,
        isRead: false
      });
      recommendations.push('Check for potential flu outbreaks or transportation issues.');
    }

    // 3. Chronic Absentees
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const chronicAbsentees = await prisma.attendance.groupBy({
      by: ['userId'],
      where: { tenantId, status: 'ABSENT', date: { gte: thirtyDaysAgo }, user: { role: 'STUDENT' } },
      _count: { id: true },
      having: { id: { _count: { gte: 5 } } }
    });

    if (chronicAbsentees.length > 0) {
      alerts.push({
        id: `chronic-${Date.now()}`,
        type: 'AT_RISK_STUDENTS',
        severity: 'WARNING',
        message: `${chronicAbsentees.length} students have 5+ absences in the last 30 days.`,
        isRead: false
      });
      recommendations.push('Schedule parent-teacher meetings for chronic absentees.');
    }

    // 4. High Risk Fee Defaulters
    const highRiskDefaulters = await prisma.feeCollection.count({
      where: { tenantId, status: { not: 'PAID' }, dueDate: { lt: thirtyDaysAgo } }
    });

    if (highRiskDefaulters > 0) {
      alerts.push({
        id: `fee-risk-${Date.now()}`,
        type: 'FEE_DEFAULT_RISK',
        severity: 'CRITICAL',
        message: `${highRiskDefaulters} fee collections are more than 30 days overdue.`,
        isRead: false
      });
      recommendations.push('Send final fee reminders to high-risk defaulters.');
    }

    // 5. Pending Approvals (Leave Requests)
    const pendingApprovals = await prisma.leaveRequest.count({
      where: { tenantId, status: 'PENDING' }
    });

    if (pendingApprovals > 0) {
      alerts.push({
        id: `pending-approvals-${Date.now()}`,
        type: 'APPROVAL_PENDING',
        severity: 'INFO',
        message: `${pendingApprovals} leave requests are awaiting your approval.`,
        isRead: false
      });
      recommendations.push('Review pending leave requests for staff and students.');
    }

    // 6. Missing Teachers (No attendance marked for today)
    const teachersWithoutAttendance = await prisma.user.count({
      where: { tenantId, role: 'TEACHER', isActive: true, attendance: { none: { date: today } } }
    });

    if (teachersWithoutAttendance > 0) {
      alerts.push({
        id: `missing-teachers-${Date.now()}`,
        type: 'TEACHER_MISSING',
        severity: 'WARNING',
        message: `${teachersWithoutAttendance} teachers have not marked their attendance today.`,
        isRead: false
      });
      recommendations.push('Follow up with staff regarding attendance tracking.');
    }

    return { alerts, recommendations };
  }
};
