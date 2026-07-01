import { prisma } from '../config/db';
import { getOrSetCache } from '../config/redis';

export const dashboardService = {
  async getDashboardOverview(tenantId: string) {
    const cacheKey = `dashboard_overview_${tenantId}`;
    return getOrSetCache(cacheKey, 300, async () => {
      const [kpis, healthScore, operations, activityFeed, upcomingEvents] = await Promise.all([
        this.getExecutiveKpis(tenantId),
        this.getSchoolHealthScore(tenantId),
        this.getOperations(tenantId),
        this.getActivityFeed(tenantId),
        this.getUpcomingEvents(tenantId)
      ]);
      return {
        executiveKpis: kpis,
        healthScore,
        operations,
        activityFeed,
        upcomingEvents
      };
    });
  },

  async getExecutiveKpis(tenantId: string) {
    return getOrSetCache(`dashboard_kpis_${tenantId}`, 120, async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalStudents,
      totalTeachers,
      todayAttendance,
      activeAdmissions,
      revenueMonth,
      pendingFees,
      libraryIssued,
      activeRoutes,
      lowStock,
      openTickets,
      classes,
      totalParents,
      activeParents
    ] = await Promise.all([
      prisma.user.count({ where: { tenantId, role: 'STUDENT', isActive: true } }),
      prisma.user.count({ where: { tenantId, role: 'TEACHER', isActive: true } }),
      prisma.attendance.findMany({ where: { tenantId, date: { gte: today } } }),
      prisma.admission.count({ where: { tenantId, status: 'ACTIVE' } }),
      prisma.paymentInstallment.aggregate({ _sum: { amount: true }, where: { tenantId, status: 'SUCCESS', createdAt: { gte: firstDayOfMonth } } }),
      prisma.feeCollection.aggregate({ _sum: { totalAmount: true, paidAmount: true }, where: { tenantId, status: { not: 'PAID' } } }),
      prisma.libraryTransaction.count({ where: { tenantId, status: 'ISSUED' } }),
      prisma.transportRoute.count({ where: { tenantId } }),
      prisma.inventoryItem.count({ where: { tenantId, status: 'LOW_STOCK' } }),
      prisma.supportTicket.count({ where: { tenantId, status: 'OPEN' } }),
      prisma.class.count({ where: { tenantId } }),
      prisma.user.count({ where: { tenantId, role: 'PARENT', isActive: true } }),
      prisma.session.groupBy({ by: ['userId'], where: { tenantId, createdAt: { gte: firstDayOfMonth } } })
    ]);

    const studentPresent = todayAttendance.filter(a => a.status === 'PRESENT').length;
    const overallAttendance = totalStudents > 0 ? (studentPresent / totalStudents) * 100 : 0;
    const feesOutstanding = Number((pendingFees._sum.totalAmount || 0) - (pendingFees._sum.paidAmount || 0));
    const timetableConflicts = 0;
    const systemHealth = '100%';
    const avgClassSize = classes > 0 ? Math.round(totalStudents / classes) : 0;
    const parentEngagement = totalParents > 0 ? Math.min(100, Math.round((activeParents.length / totalParents) * 100)) : 0;

    return {
      kpis: [
        { id: 'students', label: 'Total Students', value: totalStudents, trend: '+2%', trendUp: true },
        { id: 'teachers', label: 'Total Teachers', value: totalTeachers, trend: '+0%', trendUp: true },
        { id: 'attendance', label: 'Overall Attendance', value: `${overallAttendance.toFixed(1)}%`, trend: '+1.2%', trendUp: true },
        { id: 'admissions', label: 'Active Admissions', value: activeAdmissions, trend: '+5%', trendUp: true },
        { id: 'revenue', label: 'Fees Collected (Month)', value: `$${Number(revenueMonth._sum.amount || 0).toLocaleString()}`, trend: '+12%', trendUp: true },
        { id: 'outstanding', label: 'Fees Outstanding', value: `$${feesOutstanding.toLocaleString()}`, trend: '-3%', trendUp: false }
      ]
    };
    });
  },

  async getSchoolHealthScore(tenantId: string) {
    return getOrSetCache(`dashboard_health_${tenantId}`, 120, async () => {
    const [
      totalStudents,
      attendanceRecords,
      collections,
      completedLessons,
      totalLessons,
      activeAdmissions,
      totalAdmissions,
      recentLogs
    ] = await Promise.all([
      prisma.user.count({ where: { tenantId, role: 'STUDENT', isActive: true } }),
      prisma.attendance.count({ where: { tenantId, status: 'PRESENT', user: { role: 'STUDENT' } } }),
      prisma.feeCollection.aggregate({ _sum: { paidAmount: true, totalAmount: true }, where: { tenantId } }),
      prisma.lessonPlan.count({ where: { tenantId, status: 'COMPLETED' } }),
      prisma.lessonPlan.count({ where: { tenantId } }),
      prisma.admission.count({ where: { tenantId, status: 'ACTIVE' } }),
      prisma.admission.count({ where: { tenantId } }),
      prisma.communicationLog.count({ where: { tenantId, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } })
    ]);

    const attendanceScore = totalStudents > 0 ? Math.min((attendanceRecords / (totalStudents * 20)) * 100, 100) : 100;
    const totalCollected = Number(collections._sum.paidAmount || 0);
    const totalExpected = Number(collections._sum.totalAmount || 0);
    const feeScore = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 100;
    const academicScore = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 100;
    const admissionsScore = totalAdmissions > 0 ? (activeAdmissions / totalAdmissions) * 100 : 100;
    const communicationScore = recentLogs > 100 ? 100 : Math.min((recentLogs / 100) * 100, 100);
    const systemScore = 100;

    const overallScore = Math.round(
      (attendanceScore * 0.30) +
      (feeScore * 0.25) +
      (academicScore * 0.20) +
      (admissionsScore * 0.10) +
      (communicationScore * 0.10) +
      (systemScore * 0.05)
    );

    let category = 'EXCELLENT';
    if (overallScore < 70) category = 'CRITICAL';
    else if (overallScore < 85) category = 'NEEDS_ATTENTION';
    else if (overallScore < 95) category = 'GOOD';

    return {
      overallScore,
      category,
      breakdown: [
        { name: 'Attendance', score: Math.round(attendanceScore), weight: 30 },
        { name: 'Fees', score: Math.round(feeScore), weight: 25 },
        { name: 'Academics', score: Math.round(academicScore), weight: 20 },
        { name: 'Admissions', score: Math.round(admissionsScore), weight: 10 },
        { name: 'Comms', score: Math.round(communicationScore), weight: 10 },
        { name: 'System', score: Math.round(systemScore), weight: 5 }
      ],
      rootCauses: [
        ...(attendanceScore < 85 ? [{ type: 'warning', message: 'Student attendance is below 85% threshold' }] : []),
        ...(feeScore < 85 ? [{ type: 'danger', message: 'Significant fee defaults detected this month' }] : []),
        ...(academicScore < 80 ? [{ type: 'warning', message: 'Lesson plan completion is lagging' }] : [])
      ]
    };
    });
  },

  async getOperations(tenantId: string) {
    return getOrSetCache(`dashboard_ops_${tenantId}`, 60, async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pendingLeaves, pendingAdmissions, overdueFees, openTickets] = await Promise.all([
      prisma.leaveRequest.findMany({
        where: { tenantId, status: 'PENDING' },
        include: { user: { select: { firstName: true, lastName: true, role: true } } },
        take: 5,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.applicant.findMany({
        where: { tenantId, status: 'Pending Review' },
        take: 5,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.feeInstallment.findMany({
        where: { tenantId, isPaid: false, dueDate: { lt: today } },
        include: { assignment: { include: { student: { select: { firstName: true, lastName: true } } } } },
        take: 3,
        orderBy: { dueDate: 'asc' }
      }),
      prisma.supportTicket.findMany({
        where: { tenantId, status: 'OPEN' },
        include: { assignedTo: { select: { firstName: true, lastName: true } } },
        take: 3,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const operations = [];

    pendingLeaves.forEach(leave => {
      operations.push({
        id: `leave_${leave.id}`,
        title: `Pending Leave: ${leave.user.firstName} ${leave.user.lastName} (${leave.user.role})`,
        priority: 'Medium',
        assignedTo: 'HR / Principal',
        action: 'Review',
        link: '/leaves'
      });
    });

    pendingAdmissions.forEach(admission => {
      operations.push({
        id: `admin_${admission.id}`,
        title: `New Admission: ${admission.firstName} ${admission.lastName}`,
        priority: admission.urgency === 'high' ? 'High' : 'Medium',
        assignedTo: 'Admissions Desk',
        action: 'Process',
        link: '/admissions'
      });
    });

    overdueFees.forEach(fee => {
      operations.push({
        id: `fee_${fee.id}`,
        title: `Overdue Fee: ${fee.assignment.student.firstName} ${fee.assignment.student.lastName} ($${Number(fee.amount) - Number(fee.paidAmount)})`,
        priority: 'High',
        assignedTo: 'Finance',
        action: 'Notify',
        link: '/fees'
      });
    });

    openTickets.forEach(ticket => {
      operations.push({
        id: `ticket_${ticket.id}`,
        title: `Support Ticket: ${ticket.title}`,
        priority: ticket.priority === 'CRITICAL' ? 'High' : (ticket.priority === 'HIGH' ? 'High' : 'Medium'),
        assignedTo: ticket.assignedTo ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}` : 'Unassigned',
        action: 'Resolve',
        link: '/support'
      });
    });

    return operations;
    });
  },

  async getActivityFeed(tenantId: string) {
    return getOrSetCache(`dashboard_activity_${tenantId}`, 60, async () => {
    const logs = await prisma.auditLog.findMany({
      where: { tenantId },
      include: { user: { select: { firstName: true, lastName: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return logs.map(log => {
      let icon = 'Activity';
      if (log.entity === 'PAYMENT' || log.entity === 'FEE') icon = 'CreditCard';
      else if (log.entity === 'ADMISSION') icon = 'UserPlus';
      else if (log.entity === 'ATTENDANCE') icon = 'Clock';
      else if (log.entity === 'EXAM') icon = 'GraduationCap';
      else if (log.entity === 'LIBRARY') icon = 'BookOpen';
      
      return {
        id: log.id,
        user: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System',
        role: log.user?.role || 'SYSTEM',
        action: log.action,
        entity: log.entity,
        message: `Performed ${log.action} on ${log.entity}`,
        time: log.createdAt,
        icon
      };
    });
    });
  },

  async getUpcomingEvents(tenantId: string) {
    return getOrSetCache(`dashboard_events_${tenantId}`, 300, async () => {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);

    const [notices, holidays, exams] = await Promise.all([
      prisma.notice.findMany({
        where: { tenantId, type: 'EVENT', publishDate: { gte: today, lte: nextMonth } },
        take: 3,
        orderBy: { publishDate: 'asc' }
      }),
      prisma.holiday.findMany({
        where: { tenantId, startDate: { gte: today, lte: nextMonth } },
        take: 3,
        orderBy: { startDate: 'asc' }
      }),
      prisma.exam.findMany({
        where: { tenantId, startDate: { gte: today, lte: nextMonth } },
        take: 3,
        orderBy: { startDate: 'asc' }
      })
    ]);

    const events = [];

    notices.forEach(notice => {
      events.push({
        id: `notice_${notice.id}`,
        title: notice.title,
        type: 'Event',
        date: notice.publishDate,
        color: 'indigo'
      });
    });

    holidays.forEach(holiday => {
      events.push({
        id: `holiday_${holiday.id}`,
        title: holiday.name,
        type: 'Holiday',
        date: holiday.startDate,
        color: 'emerald'
      });
    });

    exams.forEach(exam => {
      events.push({
        id: `exam_${exam.id}`,
        title: exam.name,
        type: 'Examination',
        date: exam.startDate,
        color: 'rose'
      });
    });

    events.sort((a, b) => a.date.getTime() - b.date.getTime());

    return events.slice(0, 5);
    });
  }
};
