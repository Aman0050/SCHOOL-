import { Request, Response } from 'express';
import { prisma } from '../config/db';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Get all applicants for the Operations Center
export const getApplicants = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.tenantId || 'tenant-1';
    
    const applicants = await prisma.applicant.findMany({
      where: { 
        tenantId,
        stage: { not: 'enrolled' } // Filter out enrolled students
      },
      include: {
        documents: true,
        assessments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(applicants);
  } catch (error) {
    console.error('Error fetching applicants:', error);
    res.status(500).json({ error: 'Failed to fetch applicants' });
  }
};

// Create a new applicant
export const createApplicant = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.tenantId || 'tenant-1';
    
    // Destructure all new fields from the request body
    const { 
      firstName, lastName, middleName, dateOfBirth, gender, bloodGroup, nationality, religion,
      grade, previousSchool, previousClass, transferStatus, 
      email, phone, 
      fatherName, fatherMobile, fatherEmail, fatherOccupation,
      motherName, motherMobile, motherEmail, motherOccupation,
      guardianRelation,
      address, city, state, country, postalCode
    } = req.body;

    if (!firstName || !lastName || !grade) {
      return res.status(400).json({ error: 'First name, last name, and grade are required' });
    }

    // Auto-generate Application Number (e.g. APP-4557BCF4-2026-00001)
    const shortTenant = tenantId.split('-')[0].toUpperCase();
    
    const lastApplicant = await prisma.applicant.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
    
    let nextSeq = 1;
    if (lastApplicant && lastApplicant.applicationNumber) {
      const parts = lastApplicant.applicationNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        nextSeq = lastSeq + 1;
      }
    }

    const year = new Date().getFullYear();
    const sequence = String(nextSeq).padStart(5, '0');
    const applicationNumber = `APP-${shortTenant}-${year}-${sequence}`;

    const newApplicant = await prisma.applicant.create({
      data: {
        tenantId,
        firstName, lastName, middleName, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender, bloodGroup, nationality, religion,
        grade, previousSchool, previousClass, transferStatus,
        applicationNumber,
        email, phone,
        fatherName, fatherMobile, fatherEmail, fatherOccupation,
        motherName, motherMobile, motherEmail, motherOccupation,
        guardianRelation,
        address, city, state, country, postalCode,
        stage: 'new-registrations',
        status: 'NEW_REGISTRATION',
        urgency: (!phone || !email) ? 'high' : 'normal'
      }
    });

    res.status(201).json(newApplicant);
  } catch (error: any) {
    console.error('Error creating applicant:', error);
    res.status(500).json({ error: 'Failed to create applicant', details: error.message || String(error) });
  }
};

// Update an applicant's stage (when dragged on the board)
export const updateApplicantStage = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.tenantId || 'tenant-1';
    const { id } = req.params;
    const { stage, status } = req.body;

    // Check if it belongs to tenant
    const existing = await prisma.applicant.findFirst({
      where: { id, tenantId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    const dataToUpdate: any = { stage };
    if (status) {
      dataToUpdate.status = status;
    }

    const updated = await prisma.applicant.update({
      where: { id },
      data: dataToUpdate
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating applicant stage:', error);
    res.status(500).json({ error: 'Failed to update applicant stage' });
  }
};

// Enroll a student from the applicant pipeline
export const enrollApplicant = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.tenantId || 'tenant-1';
    const { id } = req.params;

    // 1. Fetch Applicant
    const applicant = await prisma.applicant.findFirst({
      where: { id, tenantId }
    });

    if (!applicant) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    if (applicant.stage === 'enrolled') {
      return res.status(400).json({ error: 'Applicant is already enrolled' });
    }

    // 2. Prepare Data
    const emailToUse = applicant.email || `student_${Date.now()}@school.edu`;
    const defaultPassword = 'Welcome123!';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    const admissionNumber = `ADM-${crypto.randomInt(10000, 99999)}`;

    // 3. Execute Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create Student User
      const newStudent = await tx.user.create({
        data: {
          tenantId,
          firstName: applicant.firstName,
          lastName: applicant.lastName,
          email: emailToUse.toLowerCase(),
          passwordHash,
          role: 'STUDENT',
          isActive: true
        }
      });

      // Create Parent User if details exist
      let newParent = null;
      if (applicant.fatherName || applicant.motherName) {
        const parentEmail = applicant.fatherEmail || applicant.motherEmail || `parent_${Date.now()}@school.edu`;
        const parentName = applicant.fatherName || applicant.motherName || 'Parent';
        newParent = await tx.user.create({
          data: {
            tenantId,
            firstName: parentName.split(' ')[0],
            lastName: parentName.split(' ').slice(1).join(' ') || 'Parent',
            email: parentEmail.toLowerCase(),
            passwordHash,
            role: 'PARENT',
            isActive: true
          }
        });

        // Create ParentStudent Relation
        await tx.parentStudent.create({
          data: {
            tenantId,
            parentId: newParent.id,
            studentId: newStudent.id,
            relationship: applicant.fatherName ? 'FATHER' : 'MOTHER'
          }
        });
      }

      // Create Admission record
      const newAdmission = await tx.admission.create({
        data: {
          tenantId,
          studentId: newStudent.id,
          admissionNumber,
          status: 'ACTIVE'
        }
      });

      // Create Profile for phone
      await tx.profile.create({
        data: {
          userId: newStudent.id,
          phoneNumber: applicant.phone || null
        }
      });

      // Update Applicant stage to 'enrolled'
      const updatedApplicant = await tx.applicant.update({
        where: { id: applicant.id },
        data: { stage: 'enrolled', status: 'Enrolled' }
      });

      return { newStudent, newParent, newAdmission, updatedApplicant };
    });

    res.status(201).json({
      message: 'Student enrolled successfully',
      data: {
        admissionNumber: result.newAdmission.admissionNumber,
        studentId: result.newStudent.id,
        email: result.newStudent.email,
        parentId: result.newParent?.id
      }
    });

    // Invalidate student stats and directory cache so dashboard updates instantly
    const io = (req as any).io;
    if (io && tenantId) {
      io.to(`tenant:${tenantId}`).emit('invalidate_cache', { queryKey: ['studentStats'] });
      io.to(`tenant:${tenantId}`).emit('invalidate_cache', { queryKey: ['students-directory'] });
    }
  } catch (error) {
    console.error('Error enrolling applicant:', error);
    res.status(500).json({ error: 'Failed to enroll student. They may already exist.' });
  }
};

// Document Verification
export const updateDocumentStatus = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.tenantId || 'tenant-1';
    const { id, docId } = req.params;
    const { status, remarks } = req.body;

    const doc = await prisma.applicantDocument.update({
      where: { id: docId, tenantId, applicantId: id },
      data: { status, remarks, verifiedBy: (req as any).user?.id }
    });

    res.json(doc);
  } catch (error) {
    console.error('Error updating document status:', error);
    res.status(500).json({ error: 'Failed to update document status' });
  }
};

// Assessment Result Entry
export const addAssessmentResult = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.tenantId || 'tenant-1';
    const { id } = req.params;
    const { assessmentType, date, score, remarks, decision } = req.body;

    const assessment = await prisma.applicantAssessment.create({
      data: {
        tenantId,
        applicantId: id,
        assessmentType,
        date: new Date(date),
        score,
        remarks,
        decision,
        evaluator: (req as any).user?.id,
        status: 'Completed'
      }
    });

    // Also update applicant stage automatically to assessment-completed
    await prisma.applicant.update({
      where: { id, tenantId },
      data: { status: 'Assessment Completed', stage: 'assessment-interview' }
    });

    res.status(201).json(assessment);
  } catch (error) {
    console.error('Error adding assessment result:', error);
    res.status(500).json({ error: 'Failed to add assessment result' });
  }
};

// Upload a document file for an applicant
export const uploadApplicantDocument = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.tenantId || 'tenant-1';
    const { id } = req.params;
    const { type, name } = req.body;
    const file = (req as any).file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify applicant belongs to tenant
    const applicant = await prisma.applicant.findFirst({ where: { id, tenantId } });
    if (!applicant) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    const fileUrl = `/uploads/applicant-docs/${file.filename}`;

    const doc = await prisma.applicantDocument.create({
      data: {
        tenantId,
        applicantId: id,
        type: type || 'Other',
        name: name || file.originalname,
        fileUrl,
        status: 'Pending'
      }
    });

    res.status(201).json(doc);
  } catch (error) {
    console.error('Error uploading applicant document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};
