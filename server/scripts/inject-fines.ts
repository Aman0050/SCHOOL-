import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Injecting realistic defaulter and fine data...');

  // 1. Find a tenant
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) throw new Error('No tenant found');
  const tenantId = tenant.id;

  // 2. Find a student
  const student = await prisma.user.findFirst({
    where: { tenantId, role: 'STUDENT' }
  });
  if (!student) throw new Error('No student found');

  // 3. Find a fee structure
  const feeStructure = await prisma.feeStructure.findFirst({
    where: { tenantId }
  });
  if (!feeStructure) throw new Error('No fee structure found');

  // 4. Create an overdue fee assignment
  const assignment = await prisma.studentFeeAssignment.create({
    data: {
      tenantId,
      studentId: student.id,
      feeStructureId: feeStructure.id,
      academicYear: '2027-2028',
      totalAmount: 15000,
      dueAmount: 15000,
      paidAmount: 0,
      status: 'OVERDUE',
    }
  });
  console.log('Created OVERDUE assignment:', assignment.id);

  // 2b. Find an admin user
  const admin = await prisma.user.findFirst({
    where: { tenantId, role: 'ACCOUNTANT' }
  });
  if (!admin) throw new Error('No admin found');

  // 5. Create a pending fine
  const fine = await prisma.fineRecord.create({
    data: {
      tenantId,
      studentId: student.id,
      assignmentId: assignment.id,
      type: 'LATE_PAYMENT',
      amount: 500,
      reason: 'Late Payment Penalty',
      isPaid: false,
      createdBy: admin.id
    }
  });
  console.log('Created unpaid fine:', fine.id);

  // 6. Create a partial payment assignment
  const assignment2 = await prisma.studentFeeAssignment.create({
    data: {
      tenantId,
      studentId: student.id,
      feeStructureId: feeStructure.id,
      academicYear: '2028-2029',
      totalAmount: 20000,
      dueAmount: 5000,
      paidAmount: 15000,
      status: 'PARTIAL',
    }
  });
  console.log('Created PARTIAL assignment:', assignment2.id);

  console.log('Data injection complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
