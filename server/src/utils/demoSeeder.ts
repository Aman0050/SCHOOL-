import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const seedDemoSchool = async (tenantId: string, schoolId: string) => {
  try {
    console.log(`[DemoSeeder] Seeding dummy data for tenant ${tenantId}...`);

    // 1. Create a demo Academic Session
    const session = await prisma.academicSession.create({
      data: {
        tenantId,
        schoolId,
        name: 'Demo Session 2026-27',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2027-03-31'),
        isActive: true,
      }
    });

    // 2. Create Departments & Courses
    const dept = await prisma.department.create({
      data: { tenantId, schoolId, name: 'General Studies' }
    });
    
    const course = await prisma.course.create({
      data: { tenantId, departmentId: dept.id, name: 'Primary Education', code: 'PRI' }
    });

    // 3. Create a Demo Class
    const classObj = await prisma.class.create({
      data: {
        tenantId,
        schoolId,
        courseId: course.id,
        name: 'Class 5',
        section: 'A',
        academicYear: '2026',
      }
    });

    // 4. Create dummy subjects
    const subjects = ['Mathematics', 'Science', 'English'].map(name => ({
      tenantId,
      schoolId,
      code: name.substring(0, 3).toUpperCase(),
      name,
    }));
    await prisma.examSubject.createMany({ data: subjects });

    console.log(`[DemoSeeder] Successfully seeded basic structure for tenant ${tenantId}`);
  } catch (error) {
    console.error(`[DemoSeeder] Error seeding demo data:`, error);
  }
};
