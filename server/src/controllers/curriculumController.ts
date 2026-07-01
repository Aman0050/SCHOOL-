import { Request, Response } from 'express';

import { z } from 'zod';
import { AppError } from '../errors/AppError';

import { prisma } from '../config/db';

// Validation Schemas
export const lessonPlanSchema = z.object({
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
  title: z.string().min(2),
  description: z.string(),
  date: z.string().datetime(),
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'COMPLETED']).default('DRAFT'),
  resources: z.array(z.string().url()).optional().default([]),
  teacherId: z.string().uuid().optional()
});

export const getLessonPlans = async (req: Request, res: Response) => {
  const { tenantId, id: userId, role } = req.user!;
  const { classId, subjectId } = req.query;

  const whereClause: any = { tenantId };
  if (classId) whereClause.classId = classId;
  if (subjectId) whereClause.subjectId = subjectId;

  // Teachers can only see their own lesson plans, unless admin
  if (role === 'TEACHER') {
    whereClause.teacherId = userId;
  }

  const lessonPlans = await prisma.lessonPlan.findMany({
    where: whereClause,
    include: {
      class: { select: { id: true, name: true, section: true } },
      subject: { select: { id: true, name: true, code: true } }
    },
    orderBy: { date: 'desc' }
  });

  res.status(200).json({
    status: 'success',
    data: lessonPlans
  });
};

export const createLessonPlan = async (req: Request, res: Response) => {
  const { tenantId, id: userId, role } = req.user!;
  
  const validatedData = lessonPlanSchema.parse(req.body);

  let targetTeacherId = userId;
  
  if (role === 'SCHOOL_ADMIN') {
    if (!validatedData.teacherId) {
      throw new AppError(400, 'BAD_REQUEST', 'teacherId is required when created by an admin');
    }
    targetTeacherId = validatedData.teacherId;
  } else {
    // Validate that the teacher is actually assigned to this class/subject
    const assignment = await prisma.teacherSubjectAssignment.findUnique({
      where: {
        teacherId_classId_subjectId: {
          teacherId: targetTeacherId,
          classId: validatedData.classId,
          subjectId: validatedData.subjectId
        }
      }
    });

    if (!assignment) {
      throw new AppError(403, 'FORBIDDEN', 'You are not assigned to this subject and class');
    }
  }

  const lessonPlan = await prisma.lessonPlan.create({
    data: {
      tenantId,
      teacherId: targetTeacherId,
      classId: validatedData.classId,
      subjectId: validatedData.subjectId,
      title: validatedData.title,
      description: validatedData.description,
      date: new Date(validatedData.date),
      status: validatedData.status,
      resources: validatedData.resources
    }
  });

  res.status(201).json({
    status: 'success',
    data: lessonPlan
  });
};

export const updateLessonPlanStatus = async (req: Request, res: Response) => {
  const { tenantId, id: teacherId, role } = req.user!;
  const { id } = req.params;
  const { status } = req.body;

  if (!['DRAFT', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
    throw new AppError(400, 'BAD_REQUEST', 'Invalid status');
  }

  const existingPlan = await prisma.lessonPlan.findUnique({
    where: { id, tenantId }
  });

  if (!existingPlan) {
    throw new AppError(404, 'NOT_FOUND', 'Lesson plan not found');
  }

  if (role === 'TEACHER' && existingPlan.teacherId !== teacherId) {
    throw new AppError(403, 'FORBIDDEN', 'Unauthorized to update this lesson plan');
  }

  const updatedPlan = await prisma.lessonPlan.update({
    where: { id },
    data: { status }
  });

  // Log activity
  if (status === 'COMPLETED') {
    await prisma.academicActivityFeed.create({
      data: {
        tenantId,
        actorId: teacherId,
        actionType: 'LESSON_COMPLETED',
        entityId: id,
        description: `Completed lesson plan: ${existingPlan.title}`,
      }
    });
  }

  res.status(200).json({
    status: 'success',
    data: updatedPlan
  });
};
