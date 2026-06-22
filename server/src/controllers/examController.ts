import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../config/db';
import { createAuditLog, AuditAction } from '../utils/auditLogger';

// ==================== GRADE ENGINE ====================

function calculateGrade(percentage: number, rules: any[]): { grade: string; gradePoint: number; isPassing: boolean } {
  const sorted = [...rules].sort((a, b) => Number(b.minPercent) - Number(a.minPercent));
  for (const rule of sorted) {
    if (percentage >= Number(rule.minPercent) && percentage <= Number(rule.maxPercent)) {
      return { grade: rule.label, gradePoint: Number(rule.gradePoint), isPassing: rule.isPassing };
    }
  }
  return { grade: 'E', gradePoint: 0, isPassing: false };
}

// ==================== ACADEMIC SESSIONS ====================

export const getSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const sessions = await prisma.academicSession.findMany({
      where: { tenantId },
      include: { terms: true, school: { select: { name: true } } },
      orderBy: { startDate: 'desc' },
    });
    res.json({ success: true, data: sessions });
  } catch (e) { next(e); }
};

export const createSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { schoolId, name, startDate, endDate } = req.body;
    const session = await prisma.academicSession.create({
      data: { tenantId, schoolId, name, startDate: new Date(startDate), endDate: new Date(endDate) },
    });
    
    await createAuditLog({
      tenantId, userId: req.user!.id, action: AuditAction.CREATE,
      entity: 'AcademicSession', entityId: session.id, newValues: session,
      ipAddress: req.ip, userAgent: req.headers['user-agent']
    });
    
    res.status(201).json({ success: true, data: session });
  } catch (e) { next(e); }
};

export const updateSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, isActive } = req.body;
    const session = await prisma.academicSession.update({
      where: { id },
      data: { name, startDate: startDate ? new Date(startDate) : undefined, endDate: endDate ? new Date(endDate) : undefined, isActive },
    });
    res.json({ success: true, data: session });
  } catch (e) { next(e); }
};

// ==================== EXAM TERMS ====================

export const getTerms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { sessionId } = req.query;
    const terms = await prisma.examTerm.findMany({
      where: { tenantId, ...(sessionId ? { sessionId: String(sessionId) } : {}) },
      include: { session: { select: { name: true } } },
      orderBy: { startDate: 'asc' },
    });
    res.json({ success: true, data: terms });
  } catch (e) { next(e); }
};

export const createTerm = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { sessionId, name, startDate, endDate, weightagePercent } = req.body;
    const term = await prisma.examTerm.create({
      data: { tenantId, sessionId, name, startDate: new Date(startDate), endDate: new Date(endDate), weightagePercent: new Prisma.Decimal(weightagePercent || 0) },
    });
    res.status(201).json({ success: true, data: term });
  } catch (e) { next(e); }
};

// ==================== EXAM SUBJECTS ====================

export const getSubjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { classId, boardType } = req.query;
    const subjects = await prisma.examSubject.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(boardType ? { boardType: String(boardType) as any } : {}),
        ...(classId ? { subjectMappings: { some: { classId: String(classId) } } } : {}),
      },
      include: { subjectMappings: { include: { class: { select: { name: true } } } } },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: subjects });
  } catch (e) { next(e); }
};

export const createSubject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { schoolId, code, name, subjectType, theoryMaxMarks, practicalMaxMarks, theoryPassMarks, practicalPassMarks, boardType, isElective, isOptional } = req.body;
    const totalMaxMarks = (theoryMaxMarks || 0) + (practicalMaxMarks || 0);
    const subject = await prisma.examSubject.create({
      data: { tenantId, schoolId, code, name, subjectType: subjectType || 'THEORY', theoryMaxMarks: theoryMaxMarks || 100, practicalMaxMarks: practicalMaxMarks || 0, totalMaxMarks, theoryPassMarks: theoryPassMarks || 33, practicalPassMarks: practicalPassMarks || 0, boardType: boardType || 'CBSE', isElective: isElective || false, isOptional: isOptional || false },
    });
    res.status(201).json({ success: true, data: subject });
  } catch (e) { next(e); }
};

export const mapSubjectToClass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { classId, subjectId, isElective, isOptional } = req.body;
    const mapping = await prisma.examSubjectMapping.upsert({
      where: { classId_subjectId: { classId, subjectId } },
      create: { tenantId, classId, subjectId, isElective: isElective || false, isOptional: isOptional || false },
      update: { isElective: isElective || false, isOptional: isOptional || false },
    });
    res.json({ success: true, data: mapping });
  } catch (e) { next(e); }
};

// ==================== EXAMS ====================

export const getExams = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { sessionId, classId, status, examType } = req.query;
    const exams = await prisma.exam.findMany({
      where: {
        tenantId,
        ...(sessionId ? { sessionId: String(sessionId) } : {}),
        ...(classId ? { classId: String(classId) } : {}),
        ...(status ? { status: String(status) as any } : {}),
        ...(examType ? { examType: String(examType) as any } : {}),
      },
      include: {
        session: { select: { name: true } },
        term: { select: { name: true } },
        class: { select: { name: true, section: true } },
        schedules: { include: { subject: { select: { name: true, code: true } } } },
        _count: { select: { marksEntries: true, studentResults: true } },
      },
      orderBy: { startDate: 'desc' },
    });
    res.json({ success: true, data: exams });
  } catch (e) { next(e); }
};

export const createExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { schoolId, sessionId, termId, classId, name, examType, startDate, endDate, weightage, passingCriteria, boardType, gradeSystem, remarks, subjects } = req.body;
    const exam = await prisma.$transaction(async (tx) => {
      const e = await tx.exam.create({
        data: {
          tenantId, schoolId, sessionId, termId: termId || null, classId, name, examType, startDate: new Date(startDate), endDate: new Date(endDate),
          weightage: new Prisma.Decimal(weightage || 100),
          passingCriteria: new Prisma.Decimal(passingCriteria || 33),
          boardType: boardType || 'CBSE',
          gradeSystem: gradeSystem || 'PERCENTAGE',
          remarks,
          createdBy: req.user!.id,
        },
      });
      if (subjects && subjects.length > 0) {
        await tx.examSubjectSchedule.createMany({
          data: subjects.map((s: any) => ({
            tenantId, examId: e.id, subjectId: s.subjectId,
            examDate: new Date(s.examDate),
            startTime: s.startTime,
            endTime: s.endTime,
            maxMarks: s.maxMarks || 100,
            passingMarks: s.passingMarks || 33,
            practicalMaxMarks: s.practicalMaxMarks || 0,
          })),
        });
      }
      return tx.exam.findUnique({ where: { id: e.id }, include: { schedules: { include: { subject: true } }, session: true, class: true } });
    });
    
    await createAuditLog({
      tenantId, userId: req.user!.id, action: AuditAction.CREATE,
      entity: 'Exam', entityId: exam?.id, newValues: exam,
      ipAddress: req.ip, userAgent: req.headers['user-agent']
    });
    
    res.status(201).json({ success: true, data: exam });
  } catch (e) { next(e); }
};

export const getExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        session: true, term: true,
        class: { select: { name: true, section: true } },
        schedules: { include: { subject: true } },
        _count: { select: { marksEntries: true, studentResults: true, reportCards: true } },
      },
    });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.json({ success: true, data: exam });
  } catch (e) { next(e); }
};

export const updateExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, status, startDate, endDate, weightage, remarks } = req.body;
    const exam = await prisma.exam.update({
      where: { id },
      data: {
        name,
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        weightage: weightage ? new Prisma.Decimal(weightage) : undefined,
        remarks,
      },
    });
    res.json({ success: true, data: exam });
  } catch (e) { next(e); }
};

export const publishExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const exam = await prisma.exam.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date(), publishedBy: req.user!.id },
    });
    await prisma.reportCard.updateMany({
      where: { examId: id },
      data: { isPublished: true, publishedAt: new Date() },
    });
    
    await createAuditLog({
      tenantId: req.user!.tenantId, userId: req.user!.id, action: AuditAction.RESULT_PUBLISH,
      entity: 'Exam', entityId: exam.id, newValues: { status: 'PUBLISHED' },
      ipAddress: req.ip, userAgent: req.headers['user-agent']
    });
    
    res.json({ success: true, data: exam });
  } catch (e) { next(e); }
};

// ==================== MARKS ENTRY ====================

export const getMarksForExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: examId } = req.params;
    const { subjectId } = req.query;
    const marks = await prisma.marksEntry.findMany({
      where: { examId, ...(subjectId ? { subjectId: String(subjectId) } : {}) },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, admission: true } },
        subject: { select: { name: true, code: true, theoryMaxMarks: true, practicalMaxMarks: true } },
        enteredByUser: { select: { firstName: true, lastName: true } },
      },
      orderBy: [{ subject: { name: 'asc' } }, { student: { firstName: 'asc' } }],
    });
    res.json({ success: true, data: marks });
  } catch (e) { next(e); }
};

export const saveMarksEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { id: examId } = req.params;
    const { subjectId, studentId, theoryMarks, practicalMarks, isAbsent, remarks, entryStatus } = req.body;

    const schedule = await prisma.examSubjectSchedule.findFirst({ where: { examId, subjectId } });
    const maxTheory = schedule?.maxMarks || 100;
    const maxPractical = schedule?.practicalMaxMarks || 0;

    if (!isAbsent) {
      if (theoryMarks !== undefined && theoryMarks !== null && (theoryMarks < 0 || theoryMarks > maxTheory)) {
        return res.status(400).json({ success: false, message: `Theory marks must be 0-${maxTheory}` });
      }
      if (practicalMarks !== undefined && practicalMarks !== null && (practicalMarks < 0 || practicalMarks > maxPractical)) {
        return res.status(400).json({ success: false, message: `Practical marks must be 0-${maxPractical}` });
      }
    }

    const totalMarks = isAbsent ? 0 : ((theoryMarks || 0) + (practicalMarks || 0));

    const entry = await prisma.marksEntry.upsert({
      where: { examId_subjectId_studentId: { examId, subjectId, studentId } },
      create: {
        tenantId, examId, subjectId, studentId,
        theoryMarks: isAbsent ? null : (theoryMarks !== undefined ? new Prisma.Decimal(theoryMarks) : null),
        practicalMarks: isAbsent ? null : (practicalMarks !== undefined ? new Prisma.Decimal(practicalMarks) : null),
        totalMarks: new Prisma.Decimal(totalMarks),
        isAbsent: isAbsent || false,
        remarks,
        entryStatus: entryStatus || 'DRAFT',
        enteredBy: req.user!.id,
      },
      update: {
        theoryMarks: isAbsent ? null : (theoryMarks !== undefined ? new Prisma.Decimal(theoryMarks) : undefined),
        practicalMarks: isAbsent ? null : (practicalMarks !== undefined ? new Prisma.Decimal(practicalMarks) : undefined),
        totalMarks: new Prisma.Decimal(totalMarks),
        isAbsent: isAbsent || false,
        remarks,
        entryStatus: entryStatus || 'DRAFT',
        enteredBy: req.user!.id,
      },
    });
    res.json({ success: true, data: entry });
  } catch (e) { next(e); }
};

export const bulkSaveMarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { id: examId } = req.params;
    const { entries } = req.body; 

    const results = await prisma.$transaction(
      entries.map((e: any) => {
        const totalMarks = e.isAbsent ? 0 : ((e.theoryMarks || 0) + (e.practicalMarks || 0));
        return prisma.marksEntry.upsert({
          where: { examId_subjectId_studentId: { examId, subjectId: e.subjectId, studentId: e.studentId } },
          create: {
            tenantId, examId, subjectId: e.subjectId, studentId: e.studentId,
            theoryMarks: e.isAbsent ? null : (e.theoryMarks != null ? new Prisma.Decimal(e.theoryMarks) : null),
            practicalMarks: e.isAbsent ? null : (e.practicalMarks != null ? new Prisma.Decimal(e.practicalMarks) : null),
            totalMarks: new Prisma.Decimal(totalMarks),
            isAbsent: e.isAbsent || false,
            remarks: e.remarks,
            entryStatus: 'DRAFT',
            enteredBy: req.user!.id,
          },
          update: {
            theoryMarks: e.isAbsent ? null : (e.theoryMarks != null ? new Prisma.Decimal(e.theoryMarks) : undefined),
            practicalMarks: e.isAbsent ? null : (e.practicalMarks != null ? new Prisma.Decimal(e.practicalMarks) : undefined),
            totalMarks: new Prisma.Decimal(totalMarks),
            isAbsent: e.isAbsent || false,
            remarks: e.remarks,
            entryStatus: 'DRAFT',
            enteredBy: req.user!.id,
          },
        });
      })
    );
    res.json({ success: true, data: { saved: results.length } });
  } catch (e) { next(e); }
};

export const lockMarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: examId } = req.params;
    const { subjectId } = req.body;
    await prisma.marksEntry.updateMany({
      where: { examId, ...(subjectId ? { subjectId } : {}), entryStatus: 'SUBMITTED' },
      data: { entryStatus: 'LOCKED', verifiedBy: req.user!.id, verifiedAt: new Date() },
    });
    res.json({ success: true, message: 'Marks locked successfully' });
  } catch (e) { next(e); }
};

export const submitMarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: examId } = req.params;
    const { subjectId } = req.body;
    await prisma.marksEntry.updateMany({
      where: { examId, ...(subjectId ? { subjectId } : {}), entryStatus: 'DRAFT' },
      data: { entryStatus: 'SUBMITTED' },
    });
    res.json({ success: true, message: 'Marks submitted for verification' });
  } catch (e) { next(e); }
};

// ==================== GRADE CONFIG ====================

export const getGradeConfigs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const configs = await prisma.gradeConfig.findMany({
      where: { tenantId },
      include: { rules: { orderBy: { minPercent: 'desc' } } },
    });
    res.json({ success: true, data: configs });
  } catch (e) { next(e); }
};

export const createGradeConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { name, boardType, systemType, rules, isDefault } = req.body;
    const config = await prisma.$transaction(async (tx) => {
      const c = await tx.gradeConfig.create({
        data: { tenantId, name, boardType: boardType || 'CBSE', systemType: systemType || 'PERCENTAGE', isDefault: isDefault || false },
      });
      if (rules && rules.length > 0) {
        await tx.gradeRule.createMany({
          data: rules.map((r: any, i: number) => ({
            tenantId, configId: c.id, label: r.label,
            minPercent: new Prisma.Decimal(r.minPercent),
            maxPercent: new Prisma.Decimal(r.maxPercent),
            gradePoint: new Prisma.Decimal(r.gradePoint || 0),
            description: r.description, isPassing: r.isPassing !== false, sortOrder: i,
          })),
        });
      }
      return tx.gradeConfig.findUnique({ where: { id: c.id }, include: { rules: { orderBy: { minPercent: 'desc' } } } });
    });
    res.status(201).json({ success: true, data: config });
  } catch (e) { next(e); }
};

// ==================== RESULT COMPUTATION ====================

export const computeResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { id: examId } = req.params;
    const { gradeConfigId } = req.body;

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { schedules: { include: { subject: true } } },
    });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    let gradeConfig = null;
    if (gradeConfigId) {
      gradeConfig = await prisma.gradeConfig.findUnique({ where: { id: gradeConfigId }, include: { rules: true } });
    } else {
      gradeConfig = await prisma.gradeConfig.findFirst({ where: { tenantId, isDefault: true }, include: { rules: true } });
    }

    const allMarks = await prisma.marksEntry.findMany({
      where: { examId, entryStatus: { in: ['SUBMITTED', 'LOCKED', 'VERIFIED'] } },
    });

    const byStudent: Record<string, typeof allMarks> = {};
    for (const m of allMarks) {
      if (!byStudent[m.studentId]) byStudent[m.studentId] = [];
      byStudent[m.studentId].push(m);
    }

    const results = [];
    for (const [studentId, marks] of Object.entries(byStudent)) {
      const totalObtained = marks.reduce((s, m) => s + Number(m.totalMarks || 0), 0);
      const totalMax = exam.schedules.reduce((s, sc) => s + sc.maxMarks + sc.practicalMaxMarks, 0);
      const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
      const failedSubjects = marks.filter(m => {
        const sch = exam.schedules.find(s => s.subjectId === m.subjectId);
        if (!sch) return false;
        const passing = sch.passingMarks;
        return Number(m.totalMarks || 0) < passing && !m.isAbsent;
      }).length;
      const absentCount = marks.filter(m => m.isAbsent).length;
      const isPassed = failedSubjects === 0 && absentCount === 0 && percentage >= Number(exam.passingCriteria);

      let grade = null, gradePoint = null, cgpa = null;
      if (gradeConfig) {
        const g = calculateGrade(percentage, gradeConfig.rules);
        grade = g.grade;
        gradePoint = g.gradePoint;
        const subjectGradePoints = marks.map(m => {
          const sch = exam.schedules.find(s => s.subjectId === m.subjectId);
          const maxM = sch ? (sch.maxMarks + sch.practicalMaxMarks) : 100;
          const subPct = maxM > 0 ? (Number(m.totalMarks || 0) / maxM) * 100 : 0;
          return calculateGrade(subPct, gradeConfig!.rules).gradePoint;
        });
        cgpa = subjectGradePoints.length > 0 ? subjectGradePoints.reduce((a, b) => a + b, 0) / subjectGradePoints.length : 0;
      }

      // Check if result already exists to do a create or update
      // Since subjectId is null for aggregate results, we need to find it first because prisma unique constraint might be tricky with null
      const existingResult = await prisma.studentResult.findFirst({
        where: { examId, studentId, subjectId: null }
      });
      
      let result;
      const dataToSave = {
          gradeConfigId: gradeConfigId || null,
          totalMarksObtained: new Prisma.Decimal(totalObtained),
          totalMaxMarks: new Prisma.Decimal(totalMax),
          percentage: new Prisma.Decimal(percentage.toFixed(2)),
          grade, gradePoint: gradePoint ? new Prisma.Decimal(gradePoint) : null,
          cgpa: cgpa !== null ? new Prisma.Decimal(cgpa.toFixed(2)) : null,
          isPassed, isAbsent: absentCount > 0, failedSubjects, computedAt: new Date()
      };
      
      if (existingResult) {
        result = await prisma.studentResult.update({
          where: { id: existingResult.id },
          data: dataToSave
        });
      } else {
        result = await prisma.studentResult.create({
          data: {
            ...dataToSave,
            tenantId, examId, studentId, subjectId: null
          }
        });
      }
      
      results.push(result);
    }

    // Compute rankings
    const sortedResults = results.sort((a, b) => Number(b.percentage) - Number(a.percentage));
    let rank = 1;
    for (let i = 0; i < sortedResults.length; i++) {
      if (i > 0 && Number(sortedResults[i].percentage) < Number(sortedResults[i - 1].percentage)) {
        rank = i + 1;
      }
      await prisma.studentResult.update({
        where: { id: sortedResults[i].id },
        data: { classRank: rank },
      });
      
      const existingRank = await prisma.studentRanking.findFirst({
        where: { examId, studentId: sortedResults[i].studentId, subjectId: null }
      });
      
      if (existingRank) {
        await prisma.studentRanking.update({
          where: { id: existingRank.id },
          data: { classRank: rank, percentage: sortedResults[i].percentage, computedAt: new Date() }
        });
      } else {
        await prisma.studentRanking.create({
          data: {
            tenantId, examId, studentId: sortedResults[i].studentId, subjectId: null, classId: exam.classId,
            classRank: rank, percentage: sortedResults[i].percentage, rankBasis: 'PERCENTAGE',
          }
        });
      }
    }

    // Generate report cards
    for (const r of results) {
      const existingRc = await prisma.reportCard.findFirst({
        where: { examId, studentId: r.studentId }
      });
      
      if (existingRc) {
        await prisma.reportCard.update({
          where: { id: existingRc.id },
          data: { status: 'COMPLETED', generatedAt: new Date() }
        });
      } else {
        await prisma.reportCard.create({
          data: {
            tenantId, examId, studentId: r.studentId,
            status: 'COMPLETED',
            accessCode: `RC-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          }
        });
      }
    }

    await prisma.exam.update({ where: { id: examId }, data: { status: 'COMPLETED' } });
    res.json({ success: true, data: { computed: results.length, message: `Results computed for ${results.length} students` } });
  } catch (e) { next(e); }
};

// ==================== RESULTS ====================

export const getResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: examId } = req.params;
    const results = await prisma.studentResult.findMany({
      where: { examId, subjectId: null },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, admission: true } },
      },
      orderBy: { classRank: 'asc' },
    });
    res.json({ success: true, data: results });
  } catch (e) { next(e); }
};

export const getReportCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: examId, studentId } = req.params;
    const [exam, marks, result, ranking, attendance] = await Promise.all([
      prisma.exam.findUnique({
        where: { id: examId },
        include: { session: true, term: true, class: { include: { school: true } }, schedules: { include: { subject: true } } },
      }),
      prisma.marksEntry.findMany({
        where: { examId, studentId },
        include: { subject: true },
      }),
      prisma.studentResult.findFirst({ where: { examId, studentId, subjectId: null } }),
      prisma.studentRanking.findFirst({ where: { examId, studentId, subjectId: null } }),
      prisma.attendance.count({ where: { userId: studentId, status: 'PRESENT' } }),
    ]);
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: { profile: true, admission: true, parentRelations: { include: { parent: { select: { firstName: true, lastName: true } } } } },
    });
    res.json({ success: true, data: { exam, student, marks, result, ranking, attendance } });
  } catch (e) { next(e); }
};

export const getRankings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: examId } = req.params;
    const rankings = await prisma.studentRanking.findMany({
      where: { examId, subjectId: null },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, admission: true } },
      },
      orderBy: { classRank: 'asc' },
    });
    res.json({ success: true, data: rankings });
  } catch (e) { next(e); }
};

// ==================== ANALYTICS ====================

export const getAnalyticsOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { sessionId, classId } = req.query;

    const [exams, totalStudents, passedStudents, results] = await Promise.all([
      prisma.exam.findMany({ where: { tenantId, ...(sessionId ? { sessionId: String(sessionId) } : {}), ...(classId ? { classId: String(classId) } : {}) }, select: { id: true, name: true, examType: true } }),
      prisma.studentResult.count({ where: { tenantId, subjectId: null, ...(sessionId ? { exam: { sessionId: String(sessionId) } } : {}) } }),
      prisma.studentResult.count({ where: { tenantId, subjectId: null, isPassed: true, ...(sessionId ? { exam: { sessionId: String(sessionId) } } : {}) } }),
      prisma.studentResult.findMany({
        where: { tenantId, subjectId: null, ...(sessionId ? { exam: { sessionId: String(sessionId) } } : {}) },
        select: { percentage: true, grade: true, isPassed: true, examId: true },
      }),
    ]);

    const passPercent = totalStudents > 0 ? (passedStudents / totalStudents) * 100 : 0;
    const avgPercentage = results.length > 0 ? results.reduce((s, r) => s + Number(r.percentage), 0) / results.length : 0;
    const gradeDistribution = results.reduce((acc: Record<string, number>, r) => { if (r.grade) acc[r.grade] = (acc[r.grade] || 0) + 1; return acc; }, {});

    res.json({
      success: true,
      data: {
        totalExams: exams.length, totalStudents, passedStudents,
        failedStudents: totalStudents - passedStudents,
        passPercent: passPercent.toFixed(1),
        avgPercentage: avgPercentage.toFixed(1),
        gradeDistribution,
        exams,
      },
    });
  } catch (e) { next(e); }
};

export const getStudentAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId } = req.params;
    const results = await prisma.studentResult.findMany({
      where: { studentId, subjectId: null },
      include: { exam: { select: { name: true, examType: true, startDate: true, session: { select: { name: true } } } } },
      orderBy: { createdAt: 'asc' },
    });
    const marks = await prisma.marksEntry.findMany({
      where: { studentId },
      include: { subject: { select: { name: true, code: true } }, exam: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const bySubject: Record<string, number[]> = {};
    for (const m of marks) {
      const key = m.subject.name;
      if (!bySubject[key]) bySubject[key] = [];
      const pct = m.totalMarks ? Number(m.totalMarks) : 0;
      bySubject[key].push(pct);
    }
    const subjectAvg = Object.entries(bySubject).map(([sub, vals]) => ({ subject: sub, avg: vals.reduce((a, b) => a + b, 0) / vals.length }));
    const weakSubjects = subjectAvg.filter(s => s.avg < 50).sort((a, b) => a.avg - b.avg);
    const strongSubjects = subjectAvg.filter(s => s.avg >= 75).sort((a, b) => b.avg - a.avg);

    res.json({ success: true, data: { results, marks, weakSubjects, strongSubjects, subjectAvg } });
  } catch (e) { next(e); }
};

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const [totalExams, publishedExams, pendingMarks, totalResults] = await Promise.all([
      prisma.exam.count({ where: { tenantId } }),
      prisma.exam.count({ where: { tenantId, status: 'PUBLISHED' } }),
      prisma.marksEntry.count({ where: { tenantId, entryStatus: 'DRAFT' } }),
      prisma.studentResult.count({ where: { tenantId, subjectId: null } }),
    ]);
    res.json({ success: true, data: { totalExams, publishedExams, pendingMarks, totalResults } });
  } catch (e) { next(e); }
};
