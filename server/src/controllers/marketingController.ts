import { Request, Response } from 'express';


import { prisma } from '../config/db';

export const createDemoRequest = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      institutionName,
      email,
      phoneNumber,
      studentsCount,
      campusesCount,
      contactVia,
      message,
    } = req.body;

    // Validate required fields
    if (!fullName || !institutionName || !email || !phoneNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const demoRequest = await prisma.demoRequest.create({
      data: {
        fullName,
        institutionName,
        email,
        phoneNumber,
        studentsCount: studentsCount || '0',
        campusesCount: campusesCount || '1',
        contactVia: contactVia || 'Email',
        message,
      },
    });

    res.status(201).json({
      message: 'Demo request submitted successfully',
      data: demoRequest,
    });
  } catch (error) {
    console.error('Create Demo Request Error:', error);
    res.status(500).json({ error: 'Failed to submit demo request' });
  }
};
