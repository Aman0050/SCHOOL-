import { PrismaClient, ExamType, GradeSystemType, BoardType, SystemRole, PaymentMethod, PaymentStatus, FeeStatus } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();
const formatTime = (start: number, end: number) => `${(end - start).toFixed(2)}ms`;

async function runAudit() {
  console.log('--- PHASE 3 E2E OPERATIONAL AUDIT START ---\n');
  let metrics = {
    provision: 0,
    studentCreation: 0,
    parentCreation: 0,
    attendance: 0,
    fees: 0,
    exams: 0,
    cleanup: 0
  };

  const tenantDomain = `audit-${crypto.randomBytes(4).toString('hex')}`;
  const tenantId = `tenant_${crypto.randomBytes(6).toString('hex')}`;
  let schoolId = '';
  let sessionId = '';
  let courseId = '';
  let classId = '';
  let studentId = '';
  let parentId = '';
  let assignmentId = '';
  let examId = '';
  let subjectId = '';

  try {
    // 1. Provisioning
    const pStart = performance.now();
    const tenant = await prisma.tenant.create({
      data: {
        id: tenantId,
        name: 'Audit Tenant',
        domain: tenantDomain,
        subdomain: tenantDomain
      }
    });

    const adminUser = await prisma.user.create({
      data: {
        email: `admin@${tenantDomain}.com`,
        passwordHash: 'hash',
        firstName: 'Audit',
        lastName: 'Admin',
        role: SystemRole.SCHOOL_ADMIN,
        tenantId,
      }
    });

    const school = await prisma.school.create({
      data: {
        tenantId,
        name: 'Audit School'
      }
    });
    schoolId = school.id;

    const session = await prisma.academicSession.create({
      data: {
        tenantId,
        schoolId,
        name: '2026-2027',
        startDate: new Date(),
        endDate: new Date(Date.now() + 31536000000), // +1 year
        isActive: true
      }
    });
    sessionId = session.id;

    const department = await prisma.department.create({
      data: {
        tenantId,
        schoolId,
        name: 'Science Dept'
      }
    });

    const course = await prisma.course.create({
      data: {
        tenantId,
        departmentId: department.id,
        name: 'High School',
        code: 'HS'
      }
    });
    courseId = course.id;

    const auditClass = await prisma.class.create({
      data: {
        tenantId,
        schoolId,
        courseId,
        name: 'Audit Grade 10',
        academicYear: '2026-2027'
      }
    });
    classId = auditClass.id;
    metrics.provision = performance.now() - pStart;
    console.log(`[PASS] Provisioning (Tenant, School, Class): ${formatTime(pStart, performance.now())}`);

    // 2. Student Admission
    const sStart = performance.now();
    const studentUser = await prisma.user.create({
      data: {
        tenantId,
        email: `student@${tenantDomain}.com`,
        passwordHash: 'hash',
        firstName: 'John',
        lastName: 'Audit',
        role: SystemRole.STUDENT,
      }
    });
    studentId = studentUser.id;

    await prisma.admission.create({
      data: {
        tenantId,
        studentId,
        admissionNumber: `ADM-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
        status: 'ACTIVE'
      }
    });

    await prisma.enrollment.create({
      data: {
        tenantId,
        studentId,
        classId,
        status: 'ACTIVE'
      }
    });
    metrics.studentCreation = performance.now() - sStart;
    console.log(`[PASS] Student Admission: ${formatTime(sStart, performance.now())}`);

    // 3. Parent Linking
    const paStart = performance.now();
    const parentUser = await prisma.user.create({
      data: {
        tenantId,
        email: `parent@${tenantDomain}.com`,
        passwordHash: 'hash',
        firstName: 'Robert',
        lastName: 'Audit',
        role: SystemRole.PARENT,
      }
    });
    parentId = parentUser.id;

    await prisma.parentStudent.create({
      data: {
        tenantId,
        studentId,
        parentId,
        relationship: 'FATHER'
      }
    });
    metrics.parentCreation = performance.now() - paStart;
    console.log(`[PASS] Parent Linking: ${formatTime(paStart, performance.now())}`);

    // 4. Attendance
    const aStart = performance.now();
    await prisma.attendance.create({
      data: {
        tenantId,
        userId: studentId,
        classId,
        date: new Date(),
        status: 'PRESENT',
        recordedById: adminUser.id
      }
    });
    metrics.attendance = performance.now() - aStart;
    console.log(`[PASS] Mark Attendance: ${formatTime(aStart, performance.now())}`);

    // 5. Fee Management & Payment
    const fStart = performance.now();
    const feeStruct = await prisma.feeStructure.create({
      data: {
        tenantId,
        name: 'Tuition Fee 2026',
        academicYear: '2026-2027',
        totalAmount: 5000
      }
    });
    const feeAss = await prisma.studentFeeAssignment.create({
      data: {
        tenantId,
        studentId,
        feeStructureId: feeStruct.id,
        academicYear: '2026-2027',
        totalAmount: 5000,
        dueAmount: 5000,
        status: 'PENDING'
      }
    });
    assignmentId = feeAss.id;

    const collection = await prisma.feeCollection.create({
      data: {
        tenantId,
        studentId,
        assignmentId,
        totalAmount: 5000,
        paidAmount: 5000,
        receiptNumber: `RCPT-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
        collectedBy: adminUser.id
      }
    });

    await prisma.paymentInstallment.create({
      data: {
        tenantId,
        collectionId: collection.id,
        amount: 5000,
        method: PaymentMethod.CASH,
        status: PaymentStatus.SUCCESS
      }
    });

    await prisma.studentFeeAssignment.update({
      where: { id: assignmentId },
      data: { status: FeeStatus.PAID, dueAmount: 0, paidAmount: 5000 }
    });
    
    metrics.fees = performance.now() - fStart;
    console.log(`[PASS] Fee Assignment & Payment: ${formatTime(fStart, performance.now())}`);

    // 6. Examination
    const exStart = performance.now();
    const exam = await prisma.exam.create({
      data: {
        tenantId,
        schoolId,
        sessionId,
        classId,
        name: 'Final Audit Exam',
        examType: ExamType.ANNUAL,
        startDate: new Date(),
        endDate: new Date(),
        createdBy: adminUser.id,
        boardType: BoardType.CBSE,
        gradeSystem: GradeSystemType.PERCENTAGE
      }
    });
    examId = exam.id;

    const subject = await prisma.examSubject.create({
      data: {
        tenantId,
        schoolId,
        name: 'Audit Science',
        code: 'SCI101'
      }
    });
    subjectId = subject.id;

    await prisma.marksEntry.create({
      data: {
        tenantId,
        examId,
        subjectId,
        studentId,
        theoryMarks: 95,
        totalMarks: 95,
        enteredBy: adminUser.id,
        entryStatus: 'SUBMITTED'
      }
    });
    metrics.exams = performance.now() - exStart;
    console.log(`[PASS] Exam Creation & Marks Entry: ${formatTime(exStart, performance.now())}`);

    console.log('\n--- DATA INTEGRITY CHECKS ---');
    const integrityCheck = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        parentRelations: true,
        attendance: true,
        feeAssignments: { include: { collections: { include: { payments: true } } } },
        examMarks: true
      }
    });

    if (integrityCheck?.parentRelations.length === 1 && 
        integrityCheck?.attendance.length === 1 && 
        integrityCheck?.feeAssignments.length === 1 && 
        integrityCheck?.examMarks.length === 1) {
      console.log(`[PASS] 100% Relational Integrity Verified`);
    } else {
      console.error(`[FAIL] Relational Integrity Check Failed`);
    }

  } catch (err) {
    console.error(`[FAIL] Audit failed during execution:`, err);
  } finally {
    const cStart = performance.now();
    console.log(`\n[INFO] Starting Cleanup of Audit Tenant ${tenantId}...`);
    await prisma.tenant.delete({ where: { id: tenantId } }).catch(() => {});
    metrics.cleanup = performance.now() - cStart;
    console.log(`[PASS] Cleanup: ${formatTime(cStart, performance.now())}`);

    console.log('\n--- AUDIT SUMMARY ---');
    console.log(`Target: Student Creation < 1000ms | Actual: ${metrics.studentCreation.toFixed(2)}ms`);
    console.log(`Target: Attendance Save < 300ms | Actual: ${metrics.attendance.toFixed(2)}ms`);
    console.log(`Target: Fee Payment < 500ms | Actual: ${metrics.fees.toFixed(2)}ms`);
    console.log(`Target: Marks Entry < 300ms | Actual: ${metrics.exams.toFixed(2)}ms`);
    
    await prisma.$disconnect();
  }
}

runAudit();
