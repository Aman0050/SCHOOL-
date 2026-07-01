import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { z } from 'zod';

export const createHolidaySchema = z.object({
  name: z.string(),
  date: z.string(),
  type: z.enum(['NATIONAL', 'SCHOOL', 'EXAM_HOLIDAY', 'HALF_DAY']).default('SCHOOL'),
  description: z.string().optional()
});

export const getHolidays = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const holidays = await prisma.holiday.findMany({
      where: { tenantId: req.user!.tenantId },
      orderBy: { date: 'asc' }
    });
    res.status(200).json({ success: true, data: holidays });
  } catch (error) { next(error); }
};

export const createHoliday = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, date, type, description } = req.body;
    
    const school = await prisma.school.findFirst({ where: { tenantId: req.user!.tenantId } });

    const holiday = await prisma.holiday.create({
      data: {
        tenantId: req.user!.tenantId,
        schoolId: school!.id,
        name,
        date: new Date(date),
        type,
        description
      }
    });

    res.status(201).json({ success: true, data: holiday });
  } catch (error) { next(error); }
};

export const deleteHoliday = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    await prisma.holiday.delete({
      where: { id, tenantId: req.user!.tenantId }
    });

    res.status(200).json({ success: true, message: 'Holiday deleted successfully' });
  } catch (error) { next(error); }
};
