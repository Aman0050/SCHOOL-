import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../errors/AppError';

const dbRaw = new PrismaClient();

// ==================== PUBLIC MARKETING / CRM ====================

export const submitDemoRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullName, institutionName, email, phoneNumber, studentsCount, campusesCount, contactVia, message } = req.body;

    if (!fullName || !institutionName || !email || !phoneNumber) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Please fill all required fields');
    }

    const demoReq = await dbRaw.demoRequest.create({
      data: {
        fullName,
        institutionName,
        email,
        phoneNumber,
        studentsCount: studentsCount || '0-500',
        campusesCount: campusesCount || '1',
        contactVia: contactVia || 'EMAIL',
        message,
        status: 'NEW',
      }
    });

    res.status(201).json({
      success: true,
      message: 'Demo request submitted successfully. Our team will contact you shortly.',
      data: demoReq
    });
  } catch (error) {
    next(error);
  }
};

export const submitLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { schoolName, contactName, email, phone, source, notes } = req.body;

    if (!schoolName || !contactName || !email) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Please fill all required fields');
    }

    const lead = await dbRaw.lead.create({
      data: {
        schoolName,
        contactName,
        email,
        phone,
        source: source || 'WEBSITE',
        notes,
        status: 'NEW',
      }
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! We have received your information.',
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

export const getLeads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role !== 'SUPER_ADMIN') {
      throw new AppError(403, 'FORBIDDEN', 'Access restricted');
    }

    const leads = await dbRaw.lead.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: leads });
  } catch (error) {
    next(error);
  }
};

export const updateLeadStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role !== 'SUPER_ADMIN') {
      throw new AppError(403, 'FORBIDDEN', 'Access restricted');
    }

    const { id } = req.params;
    const { status } = req.body;

    const lead = await dbRaw.lead.update({
      where: { id },
      data: { status }
    });

    res.json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};
