import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const tenantId = '4e5b87fe-3c03-4d75-88e9-ea252150e42a';

async function seedAcademics() {
  console.log('Seeding Academic Data for Tenant:', tenantId);

  try {
    // 1. Get all students
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT', tenantId }
    });

    if (students.length === 0) {
      console.log('No students found. Exiting.');
      return;
    }

    const school = await prisma.school.findFirst({ where: { tenantId } });
    if (!school) {
      console.log('No school found.');
      return;
    }

    // 2. Create GradeConfig if not exists
    let gradeConfig = await prisma.gradeConfig.findFirst({ where: { tenantId } });
    if (!gradeConfig) {
      gradeConfig = await prisma.gradeConfig.create({
        data: {
          tenantId,
          name: 'Standard Grading',
          boardType: 'CBSE',
          systemType: 'PERCENTAGE',
          isDefault: true,
          rules: {
            create: [
              { tenantId, label: 'A+', minPercent: 90, maxPercent: 100, gradePoint: 4.0, isPassing: true, sortOrder: 1 },
              { tenantId, label: 'A', minPercent: 80, maxPercent: 89.99, gradePoint: 3.5, isPassing: true, sortOrder: 2 },
              { tenantId, label: 'B', minPercent: 70, maxPercent: 79.99, gradePoint: 3.0, isPassing: true, sortOrder: 3 },
              { tenantId, label: 'C', minPercent: 60, maxPercent: 69.99, gradePoint: 2.5, isPassing: true, sortOrder: 4 },
              { tenantId, label: 'F', minPercent: 0, maxPercent: 59.99, gradePoint: 0, isPassing: false, sortOrder: 5 }
            ]
          }
        }
      });
      console.log('Created GradeConfig');
    }

    // 3. Create Session & Term
    let session = await prisma.academicSession.findFirst({ where: { tenantId } });
    if (!session) {
      session = await prisma.academicSession.create({
        data: {
          tenantId,
          schoolId: school.id,
          name: '2025-2026',
          startDate: new Date('2025-04-01'),
          endDate: new Date('2026-03-31')
        }
      });
    }

    let term = await prisma.examTerm.findFirst({ where: { tenantId, sessionId: session.id } });
    if (!term) {
      term = await prisma.examTerm.create({
        data: {
          tenantId,
          sessionId: session.id,
          name: 'Mid-Term',
          startDate: new Date('2025-09-01'),
          endDate: new Date('2025-09-30'),
          weightagePercent: 50
        }
      });
    }

    // 4. Create Subjects
    const subjectNames = ['Mathematics', 'Science', 'English', 'History'];
    const subjects = [];
    for (const name of subjectNames) {
      let subj = await prisma.examSubject.findFirst({ where: { tenantId, name } });
      if (!subj) {
        subj = await prisma.examSubject.create({
          data: {
            tenantId,
            schoolId: school.id,
            name,
            code: name.substring(0, 3).toUpperCase(),
            theoryMaxMarks: 100,
            theoryPassMarks: 40
          }
        });
      }
      subjects.push(subj);
    }

    // Ensure a class exists
    let cls = await prisma.class.findFirst({ where: { tenantId } });
    if (!cls) {
        let dept = await prisma.department.findFirst({ where: { tenantId } });
        if (!dept) {
            dept = await prisma.department.create({ data: { tenantId, schoolId: school.id, name: 'General' }});
        }
        let course = await prisma.course.findFirst({ where: { tenantId } });
        if (!course) {
            course = await prisma.course.create({ data: { tenantId, departmentId: dept.id, name: 'High School', code: 'HS' }});
        }
        cls = await prisma.class.create({
            data: {
                tenantId,
                schoolId: school.id,
                courseId: course.id,
                name: '10th Grade',
                academicYear: '2025-2026'
            }
        });
        console.log('Created missing Class, Course, Department');
    }

    // 5. Create an Exam
    let exam = await prisma.exam.findFirst({ where: { tenantId, name: 'Mid-Term Examination 2025' } });
    if (!exam) {
      exam = await prisma.exam.create({
        data: {
          tenantId,
          schoolId: school.id,
          sessionId: session.id,
          termId: term.id,
          classId: cls.id,
          name: 'Mid-Term Examination 2025',
          examType: 'HALF_YEARLY',
          status: 'PUBLISHED',
          startDate: new Date('2025-09-10'),
          endDate: new Date('2025-09-20'),
          createdBy: students[0].id
        }
      });
      console.log('Created Exam');
    }

    // 6. Generate Marks and Results for students
    let totalMarksEntries = 0;
    let totalResults = 0;

    for (const student of students) {
      let obtained = 0;
      let totalMax = 0;
      let failedSubjs = 0;

      for (const subj of subjects) {
        const marks = Math.floor(Math.random() * 45) + 50; 
        obtained += marks;
        totalMax += subj.theoryMaxMarks;
        if (marks < subj.theoryPassMarks) failedSubjs++;

        const existingMark = await prisma.marksEntry.findFirst({
            where: { examId: exam.id, subjectId: subj.id, studentId: student.id }
        });
        
        if (!existingMark) {
            await prisma.marksEntry.create({
                data: {
                    tenantId,
                    examId: exam.id,
                    subjectId: subj.id,
                    studentId: student.id,
                    theoryMarks: marks,
                    totalMarks: marks,
                    entryStatus: 'LOCKED',
                    enteredBy: students[0].id
                }
            });
            totalMarksEntries++;
        }
      }

      const percent = (obtained / totalMax) * 100;
      let grade = 'F';
      if (percent >= 90) grade = 'A+';
      else if (percent >= 80) grade = 'A';
      else if (percent >= 70) grade = 'B';
      else if (percent >= 60) grade = 'C';

      const existingResult = await prisma.studentResult.findFirst({
        where: { examId: exam.id, studentId: student.id, subjectId: null }
      });
      if (!existingResult) {
        await prisma.studentResult.create({
            data: {
            tenantId,
            examId: exam.id,
            studentId: student.id,
            gradeConfigId: gradeConfig.id,
            totalMarksObtained: obtained,
            totalMaxMarks: totalMax,
            percentage: percent,
            grade: grade,
            isPassed: failedSubjs === 0,
            failedSubjects: failedSubjs
            }
        });
        totalResults++;
      }
    }

    console.log(`Successfully generated ${totalMarksEntries} marks entries and ${totalResults} results!`);

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAcademics();
