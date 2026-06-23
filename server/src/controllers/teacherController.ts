import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getTeacherDashboardSummary = async (req: Request, res: Response) => {
  try {
    const { tenantId, id: userId } = req.user!;
    
    // Quick stats: Classes today
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    
    const todayClasses = await prisma.timetablePeriod.findMany({
      where: {
        tenantId,
        teacherId: userId,
        dayOfWeek: dayOfWeek as any
      },
      include: {
        class: true,
        subject: true
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    res.json({
      success: true,
      data: {
        classesToday: todayClasses.length,
        attendancePending: 0, // Placeholder
        marksPending: 0, // Placeholder
        homeworkPending: 0 // Placeholder
      }
    });
  } catch (error) {
    console.error('Error fetching teacher dashboard summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch summary' });
  }
};

export const getTeacherTimetable = async (req: Request, res: Response) => {
  try {
    const { tenantId, id: userId } = req.user!;
    
    const timetable = await prisma.timetablePeriod.findMany({
      where: {
        tenantId,
        teacherId: userId
      },
      include: {
        class: true,
        subject: true
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: timetable
    });
  } catch (error) {
    console.error('Error fetching teacher timetable:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch timetable' });
  }
};

export const getTeacherClasses = async (req: Request, res: Response) => {
  try {
    const { tenantId, id: userId } = req.user!;
    
    const assignedClasses = await prisma.teacherClassAssignment.findMany({
      where: {
        tenantId,
        teacherId: userId
      },
      include: {
        class: {
          include: {
            course: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: assignedClasses
    });
  } catch (error) {
    console.error('Error fetching assigned classes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch classes' });
  }
};
