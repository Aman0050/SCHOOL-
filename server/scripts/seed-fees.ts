import { PrismaClient, FeeStatus, PaymentMethod, PaymentStatus, IntervalType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Fee Management Data...');

  // 1. Get Greenwood tenant
  const tenant = await prisma.tenant.findFirst({
    where: { subdomain: 'greenwood' }
  });

  if (!tenant) {
    console.error('Tenant not found. Please run the main seed first.');
    process.exit(1);
  }

  // 2. Get students and class
  const classObj = await prisma.class.findFirst({
    where: { tenantId: tenant.id }
  });

  const students = await prisma.user.findMany({
    where: { tenantId: tenant.id, role: 'STUDENT' }
  });

  if (!classObj || students.length === 0) {
    console.error('No class or students found.');
    process.exit(1);
  }

  // 3. Clear existing fee data for safety
  await prisma.feeCollection.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.studentFeeAssignment.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.feeStructure.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.feeCategory.deleteMany({ where: { tenantId: tenant.id } });

  // 4. Create Fee Categories
  console.log('Creating Fee Categories...');
  const tuitionCategory = await prisma.feeCategory.create({
    data: {
      tenantId: tenant.id,
      name: 'Tuition Fee',
      description: 'Standard academic tuition fee',
    }
  });

  const transportCategory = await prisma.feeCategory.create({
    data: {
      tenantId: tenant.id,
      name: 'Transport Fee',
      description: 'School bus facility fee',
    }
  });

  // 5. Create Fee Structure
  console.log('Creating Fee Structure...');
  const structure = await prisma.feeStructure.create({
    data: {
      tenantId: tenant.id,
      name: 'Annual Fee 2026-2027',
      classId: classObj.id,
      academicYear: '2026-2027',
      totalAmount: 60000,
      items: {
        create: [
          {
            tenantId: tenant.id,
            feeCategoryId: tuitionCategory.id,
            amount: 50000,
          },
          {
            tenantId: tenant.id,
            feeCategoryId: transportCategory.id,
            amount: 10000,
            isOptional: true
          }
        ]
      }
    }
  });

  // 6. Assign fees to students
  console.log('Assigning fees to students...');
  for (const student of students) {
    // Assign structure
    const assignment = await prisma.studentFeeAssignment.create({
      data: {
        tenantId: tenant.id,
        studentId: student.id,
        feeStructureId: structure.id,
        academicYear: '2026-2027',
        totalAmount: 60000,
        dueAmount: 60000, // Initially all due
        status: FeeStatus.PENDING
      }
    });

    // Let's make some payments
    console.log(`Processing payment for student ${student.firstName}...`);
    
    // Simulate a partial payment for one student, full for another
    const amountToPay = Math.random() > 0.5 ? 60000 : 30000;
    
    const collection = await prisma.feeCollection.create({
      data: {
        tenantId: tenant.id,
        assignmentId: assignment.id,
        studentId: student.id,
        receiptNumber: `RCP-${Math.floor(Math.random() * 10000)}`,
        totalAmount: amountToPay,
        paidAmount: amountToPay,
        status: FeeStatus.PAID,
        collectedBy: student.id, // Admin id technically, just using student.id to pass foreign key
        payments: {
          create: {
            tenantId: tenant.id,
            amount: amountToPay,
            method: PaymentMethod.UPI,
            status: PaymentStatus.SUCCESS
          }
        }
      }
    });

    // Update assignment
    await prisma.studentFeeAssignment.update({
      where: { id: assignment.id },
      data: {
        paidAmount: amountToPay,
        dueAmount: 60000 - amountToPay,
        status: amountToPay === 60000 ? FeeStatus.PAID : FeeStatus.PARTIAL
      }
    });
    
    // Ledger Entry
    await prisma.financialLedger.create({
      data: {
        tenantId: tenant.id,
        studentId: student.id,
        referenceType: 'FEE_COLLECTION',
        referenceId: collection.id,
        description: `Fee payment received`,
        type: 'CREDIT',
        amount: amountToPay,
        balance: 60000 - amountToPay,
        createdBy: student.id
      }
    });
  }

  console.log('Fee data seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding fees:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
