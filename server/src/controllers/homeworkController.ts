import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==================== HOMEWORK MANAGEMENT ====================

export const getHomeworks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { classId, subjectId, studentId } = req.query;
    
    // Base filter
    let whereClause: any = { tenantId: req.tenantId! };
    if (classId) whereClause.classId = String(classId);
    if (subjectId) whereClause.subjectId = String(subjectId);

    // If studentId is provided, we should only fetch homeworks for their class
    if (studentId) {
      const student = await prisma.user.findUnique({
        where: { id: String(studentId) },
        include: { enrollments: { where: { isActive: true }, select: { classId: true } } }
      });
      if (student?.enrollments?.[0]?.classId) {
        whereClause.classId = student.enrollments[0].classId;
      }
    }

    const homeworks = await prisma.homework.findMany({
      where: whereClause,
      include: {
        subject: { select: { name: true, code: true } },
        teacher: { select: { firstName: true, lastName: true } },
        attachments: true,
        ...(studentId ? {
          submissions: {
            where: { studentId: String(studentId) }
          }
        } : {})
      },
      orderBy: { dueDate: 'asc' }
    });

    res.json({ success: true, data: homeworks });
  } catch (error) {
    next(error);
  }
};

export const createHomework = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { classId, subjectId, title, description, dueDate, attachments } = req.body;
    const teacherId = req.user!.id;

    const homework = await prisma.$transaction(async (tx) => {
      const hw = await tx.homework.create({
        data: {
          tenantId: req.tenantId!,
          classId,
          subjectId,
          teacherId,
          title,
          description,
          dueDate: new Date(dueDate)
        }
      });

      if (attachments && Array.isArray(attachments)) {
        await tx.homeworkAttachment.createMany({
          data: attachments.map(url => ({
            tenantId: req.tenantId!,
            homeworkId: hw.id,
            fileUrl: url,
            fileType: 'FILE'
          }))
        });
      }

      // Automatically create pending submissions for all active students in the class
      const enrollments = await tx.enrollment.findMany({
        where: { classId, isActive: true },
        select: { studentId: true }
      });

      if (enrollments.length > 0) {
        await tx.homeworkSubmission.createMany({
          data: enrollments.map(e => ({
            tenantId: req.tenantId!,
            homeworkId: hw.id,
            studentId: e.studentId,
            status: 'PENDING'
          }))
        });
      }

      return hw;
    });

    res.status(201).json({ success: true, data: homework });
  } catch (error) {
    next(error);
  }
};

// For Parents/Students to submit homework
export const submitHomework = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // homeworkId
    const { studentId, files } = req.body;

    const submission = await prisma.homeworkSubmission.update({
      where: { homeworkId_studentId: { homeworkId: id, studentId } },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        // In a real app, we'd handle file uploads for submissions as well
        feedback: files ? `Submitted with files: ${files.join(', ')}` : undefined
      }
    });

    res.json({ success: true, data: submission });
  } catch (error) {
    next(error);
  }
};
