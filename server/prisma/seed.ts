import { PrismaClient, SystemRole, AuditAction } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing data
  await prisma.auditLog.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.school.deleteMany({});
  await prisma.tenant.deleteMany({});

  // 2. Create Tenants
  console.log('Creating tenants...');
  const tenant1 = await prisma.tenant.create({
    data: {
      name: 'Greenwood High School',
      subdomain: 'greenwood',
      domain: 'greenwood.school.local',
      isActive: true,
    },
  });

  const tenant2 = await prisma.tenant.create({
    data: {
      name: 'Oakridge Academy',
      subdomain: 'oakridge',
      domain: 'oakridge.school.local',
      isActive: true,
    },
  });

  // 3. Create Schools
  console.log('Creating schools...');
  const school1 = await prisma.school.create({
    data: {
      tenantId: tenant1.id,
      name: 'Greenwood High Main Campus',
      address: '123 Education St, Springfield',
    },
  });

  const school2 = await prisma.school.create({
    data: {
      tenantId: tenant2.id,
      name: 'Oakridge Academy East Campus',
      address: '456 Learning Ave, Metropolis',
    },
  });

  // Hashing standard password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // 4. Create Users for Tenant 1 (Greenwood High)
  console.log('Creating users for Tenant 1...');
  
  // School Admin
  const admin1 = await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      email: 'admin@greenwood.edu',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      role: SystemRole.SCHOOL_ADMIN,
    },
  });
  await prisma.profile.create({
    data: {
      userId: admin1.id,
      phoneNumber: '555-0100',
      address: 'Admin Residence, Springfield',
    },
  });

  // Teacher
  const teacher1 = await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      email: 'john.doe@greenwood.edu',
      passwordHash,
      firstName: 'John',
      lastName: 'Doe',
      role: SystemRole.TEACHER,
    },
  });
  await prisma.profile.create({
    data: {
      userId: teacher1.id,
      phoneNumber: '555-0101',
      address: 'Teacher Residence, Springfield',
    },
  });

  // Student
  const student1 = await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      email: 'student@greenwood.edu',
      passwordHash,
      firstName: 'Alice',
      lastName: 'Smith',
      role: SystemRole.STUDENT,
    },
  });
  await prisma.profile.create({
    data: {
      userId: student1.id,
      phoneNumber: '555-0102',
      address: 'Student Residence, Springfield',
    },
  });

  // 5. Create Academics for Tenant 1
  console.log('Creating academics for Tenant 1...');
  const deptScience = await prisma.department.create({
    data: {
      tenantId: tenant1.id,
      schoolId: school1.id,
      name: 'Science Department',
    },
  });

  const coursePhysics = await prisma.course.create({
    data: {
      tenantId: tenant1.id,
      departmentId: deptScience.id,
      name: 'Introductory Physics',
      code: 'PHY101',
      credits: 4,
    },
  });

  const classPhysicsA = await prisma.class.create({
    data: {
      tenantId: tenant1.id,
      schoolId: school1.id,
      courseId: coursePhysics.id,
      name: 'Grade 10 - Physics A',
      section: 'A',
      academicYear: '2026-2027',
    },
  });

  // Enrollment
  await prisma.enrollment.create({
    data: {
      tenantId: tenant1.id,
      classId: classPhysicsA.id,
      studentId: student1.id,
      status: 'ACTIVE',
    },
  });

  // 6. Create Users for Tenant 2 (Oakridge Academy)
  console.log('Creating users for Tenant 2...');
  
  // School Admin Tenant 2
  const admin2 = await prisma.user.create({
    data: {
      tenantId: tenant2.id,
      email: 'admin@oakridge.edu',
      passwordHash,
      firstName: 'Robert',
      lastName: 'Miller',
      role: SystemRole.SCHOOL_ADMIN,
    },
  });
  await prisma.profile.create({
    data: {
      userId: admin2.id,
      phoneNumber: '555-0200',
    },
  });

  // Teacher Tenant 2
  const teacher2 = await prisma.user.create({
    data: {
      tenantId: tenant2.id,
      email: 'jane.doe@oakridge.edu',
      passwordHash,
      firstName: 'Jane',
      lastName: 'Doe',
      role: SystemRole.TEACHER,
    },
  });
  await prisma.profile.create({
    data: {
      userId: teacher2.id,
      phoneNumber: '555-0201',
    },
  });

  // Student Tenant 2
  const student2 = await prisma.user.create({
    data: {
      tenantId: tenant2.id,
      email: 'student@oakridge.edu',
      passwordHash,
      firstName: 'Bob',
      lastName: 'Jones',
      role: SystemRole.STUDENT,
    },
  });
  await prisma.profile.create({
    data: {
      userId: student2.id,
      phoneNumber: '555-0202',
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
