import { Request, Response, NextFunction } from 'express';


import { prisma } from '../config/db';

// ==================== PARENT-STUDENT RELATIONS ====================

// Get all children associated with the logged-in parent
export const getMyChildren = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parentId = req.user?.id;
    if (!parentId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const relations: any = await prisma.parentStudent.findMany({
      where: { parentId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profile: true,
            admission: true,
            enrollments: {
              // where: { isActive: true },
              include: { class: true }
            }
          }
        }
      }
    });

    const children = relations.map(r => ({
      id: r.student.id,
      firstName: r.student.firstName,
      lastName: r.student.lastName,
      email: r.student.email,
      avatarUrl: r.student.profile?.avatarUrl,
      admissionNumber: r.student.admission?.admissionNumber,
      relationship: r.relationship,
      currentClass: r.student.enrollments[0]?.class?.name || 'Unassigned',
      currentSection: r.student.enrollments[0]?.class?.section || ''
    }));

    res.json({ success: true, data: children });
  } catch (error) {
    next(error);
  }
};

// ==================== DASHBOARD AGGREGATION ====================

// Get aggregated dashboard data for a specific student
export const getStudentDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parentId = req.user?.id;
    const { studentId } = req.params;

    // Verify ownership
    const isParent = await prisma.parentStudent.findUnique({
      where: { parentId_studentId: { parentId: parentId!, studentId } }
    });

    if (!isParent && req.user?.role !== 'SCHOOL_ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this student' });
    }

    // 1. Attendance Summary (current month)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        userId: studentId as string,
        date: { gte: firstDay }
      }
    });

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(a => a.status === 'PRESENT').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    // 2. Fees Due
    const feeAssignments = await prisma.studentFeeAssignment.findMany({
      where: { studentId, status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } }
    });
    const totalFeesDue = feeAssignments.reduce((sum, f) => sum + Number(f.dueAmount), 0);

    // 3. Pending Homework
    const pendingHomeworks = await prisma.homeworkSubmission.count({
      where: { studentId, status: 'PENDING' }
    });

    // 4. Latest Result
    const latestResult = await prisma.studentResult.findFirst({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      include: { exam: true }
    });

    res.json({
      success: true,
      data: {
        attendancePercentage,
        totalFeesDue,
        pendingHomeworks,
        latestResult: latestResult ? {
          examName: latestResult.exam.name,
          percentage: Number(latestResult.percentage),
          grade: latestResult.grade,
          isPassed: latestResult.isPassed
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};
