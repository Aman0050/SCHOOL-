import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AppError } from '../errors/AppError';

const prisma = new PrismaClient();

// Validation Schemas
export const timetableSaveSchema = z.object({
  schoolId: z.string().uuid(),
  classId: z.string().uuid(),
  periods: z.array(z.object({
    id: z.string().optional(),
    dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
    startTime: z.string(),
    endTime: z.string(),
    subjectId: z.string().uuid().optional().nullable(),
    teacherId: z.string().uuid().optional().nullable(),
    room: z.string().optional().nullable(),
    isBreak: z.boolean().default(false)
  }))
});

export const getTimetable = async (req: Request, res: Response) => {
  const { tenantId } = req.user!;
  const { classId } = req.query;

  if (!classId) {
    throw new AppError(400, 'BAD_REQUEST', 'Class ID is required');
  }

  const timetable = await prisma.timetablePeriod.findMany({
    where: {
      tenantId,
      classId: classId as string,
    },
    include: {
      subject: true,
      teacher: {
        select: { id: true, firstName: true, lastName: true }
      }
    },
    orderBy: [
      { dayOfWeek: 'asc' },
      { startTime: 'asc' }
    ]
  });

  res.status(200).json({
    status: 'success',
    data: timetable
  });
};

export const saveTimetable = async (req: Request, res: Response) => {
  const { tenantId } = req.user!;
  const data = req.body;

  // 1. Validate Input
  const validatedData = timetableSaveSchema.parse(data);

  // 2. Conflict Detection Engine
  const conflicts = [];
  
  for (const period of validatedData.periods) {
    if (!period.isBreak && period.teacherId) {
      // Check if teacher is double booked
      const teacherConflict = await prisma.timetablePeriod.findFirst({
        where: {
          tenantId,
          teacherId: period.teacherId,
          dayOfWeek: period.dayOfWeek,
          id: period.id ? { not: period.id } : undefined,
          OR: [
            {
              startTime: { lte: period.startTime },
              endTime: { gt: period.startTime }
            },
            {
              startTime: { lt: period.endTime },
              endTime: { gte: period.endTime }
            }
          ]
        },
        include: { class: true }
      });

      if (teacherConflict) {
        conflicts.push(`Teacher is already booked for class ${teacherConflict.class.name} on ${period.dayOfWeek} at ${period.startTime}`);
      }
    }

    if (!period.isBreak && period.room) {
      // Check room double booking
      const roomConflict = await prisma.timetablePeriod.findFirst({
        where: {
          tenantId,
          room: period.room,
          dayOfWeek: period.dayOfWeek,
          id: period.id ? { not: period.id } : undefined,
          OR: [
            {
              startTime: { lte: period.startTime },
              endTime: { gt: period.startTime }
            },
            {
              startTime: { lt: period.endTime },
              endTime: { gte: period.endTime }
            }
          ]
        },
        include: { class: true }
      });

      if (roomConflict) {
        conflicts.push(`Room ${period.room} is already booked for class ${roomConflict.class.name} on ${period.dayOfWeek} at ${period.startTime}`);
      }
    }
  }

  // If there are conflicts, return them and prevent save
  if (conflicts.length > 0) {
    return res.status(409).json({
      status: 'error',
      message: 'Timetable conflicts detected',
      conflicts
    });
  }

  // 3. Save Timetable Periods (Upsert/Delete)
  await prisma.$transaction(async (tx) => {
    // Delete existing periods for this class that are NOT in the incoming payload
    const incomingIds = validatedData.periods.map(p => p.id).filter(id => id);
    if (incomingIds.length > 0) {
      await tx.timetablePeriod.deleteMany({
        where: {
          tenantId,
          classId: validatedData.classId,
          id: { notIn: incomingIds as string[] }
        }
      });
    } else {
      await tx.timetablePeriod.deleteMany({
        where: { tenantId, classId: validatedData.classId }
      });
    }

    // Upsert periods
    for (const period of validatedData.periods) {
      if (period.id) {
        await tx.timetablePeriod.update({
          where: { id: period.id },
          data: {
            dayOfWeek: period.dayOfWeek,
            startTime: period.startTime,
            endTime: period.endTime,
            subjectId: period.subjectId,
            teacherId: period.teacherId,
            room: period.room,
            isBreak: period.isBreak
          }
        });
      } else {
        await tx.timetablePeriod.create({
          data: {
            tenantId,
            schoolId: validatedData.schoolId,
            classId: validatedData.classId,
            dayOfWeek: period.dayOfWeek,
            startTime: period.startTime,
            endTime: period.endTime,
            subjectId: period.subjectId,
            teacherId: period.teacherId,
            room: period.room,
            isBreak: period.isBreak
          }
        });
      }
    }
  });

  res.status(200).json({
    status: 'success',
    message: 'Timetable saved successfully'
  });
};
