import { prisma } from '../config/db';

export const analyticsService = {
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

    let healthScore = 'Excellent';
    if (studentRate < 70) healthScore = 'Critical';
    else if (studentRate < 85) healthScore = 'Warning';
    else if (studentRate < 95) healthScore = 'Good';

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
    const attendanceRecords = await prisma.attendance.count({ where: { tenantId, status: 'PRESENT' } });
    const attendanceScore = totalStudents > 0 ? Math.min((attendanceRecords / (totalStudents * 5)) * 100, 100) : 85;

    const completedLessons = await prisma.lessonPlan.count({ where: { tenantId, status: 'COMPLETED' } });
    const totalLessons = await prisma.lessonPlan.count({ where: { tenantId } });
    const academicScore = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 90;

    const completedHomeworks = await prisma.homeworkSubmission.count({ where: { tenantId, status: 'GRADED' } });
    const totalHomeworks = await prisma.homeworkSubmission.count({ where: { tenantId } });
    const homeworkScore = totalHomeworks > 0 ? (completedHomeworks / totalHomeworks) * 100 : 80;

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
        engagement: 82 
      }
    };
  },

  async getSystemAlerts(tenantId: string) {
    return {
      alerts: [
        { id: '1', type: 'ATTENDANCE', severity: 'CRITICAL', message: 'Class 9-B attendance dropped by 15% this week.', isRead: false },
      ],
      recommendations: []
    };
  }
};
