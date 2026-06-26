import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  const tenantId = '4e5b87fe-3c03-4d75-88e9-ea252150e42a';

  console.log(`Seeding Profile Data for Tenant: ${tenantId}`);

  // 1. Get School and Session
  const school = await prisma.school.findFirst({ where: { tenantId } });
  const session = await prisma.academicSession.findFirst({ where: { tenantId, isActive: true } });

  if (!school || !session) {
    console.error('School or active session not found. Please run base seeders first.');
    return;
  }

  // 2. Get Students
  const students = await prisma.user.findMany({
    where: { tenantId, role: 'STUDENT', isActive: true }
  });

  if (students.length === 0) {
    console.log('No students found. Run student seeder first.');
    return;
  }

  // 3. Setup Basic Fee Structure
  let feeStructure = await prisma.feeStructure.findFirst({ where: { tenantId, name: '2025 Annual Tuition' } });
  if (!feeStructure) {
    feeStructure = await prisma.feeStructure.create({
      data: {
        tenantId,
        name: '2025 Annual Tuition',
        academicYear: session.name,
        totalAmount: 150000, // 1.5 Lakh INR
        isActive: true
      }
    });
    console.log('Created Fee Structure');
  }

  // 4. Generate Data for Each Student
  let feeCount = 0;
  let docCount = 0;
  let parentCount = 0;

  for (const student of students) {
    // --- FEES ---
    const existingFee = await prisma.studentFeeAssignment.findFirst({
        where: { tenantId, studentId: student.id, feeStructureId: feeStructure.id }
    });

    if (!existingFee) {
        // Randomize payment
        const isPaid = Math.random() > 0.5;
        const totalAmount = 150000;
        const paidAmount = isPaid ? totalAmount : Math.floor(Math.random() * 50000);
        const dueAmount = totalAmount - paidAmount;
        const status = isPaid ? 'PAID' : (dueAmount === totalAmount ? 'PENDING' : 'PARTIAL');

        await prisma.studentFeeAssignment.create({
            data: {
                tenantId,
                studentId: student.id,
                feeStructureId: feeStructure.id,
                academicYear: session.name,
                totalAmount,
                paidAmount,
                dueAmount,
                status
            }
        });
        feeCount++;
    }

    // --- DOCUMENTS ---
    const existingDoc = await prisma.studentDocument.findFirst({
        where: { tenantId, studentId: student.id }
    });

    if (!existingDoc) {
        await prisma.studentDocument.createMany({
            data: [
                {
                    tenantId,
                    studentId: student.id,
                    name: 'Birth Certificate.pdf',
                    fileUrl: 'https://example.com/docs/birth-cert.pdf',
                    fileSize: 1540000 // 1.5MB
                },
                {
                    tenantId,
                    studentId: student.id,
                    name: 'Medical Record.png',
                    fileUrl: 'https://example.com/docs/medical.png',
                    fileSize: 840000 // 840KB
                }
            ]
        });
        docCount += 2;
    }

    // --- PARENTS / GUARDIANS ---
    const existingParentRel = await prisma.parentStudent.findFirst({
        where: { tenantId, studentId: student.id }
    });

    if (!existingParentRel) {
        // Create a Parent User
        const fatherEmail = `parent.${student.email}`;
        let fatherUser = await prisma.user.findFirst({ where: { tenantId, email: fatherEmail }});
        
        if (!fatherUser) {
            fatherUser = await prisma.user.create({
                data: {
                    tenantId,
                    email: fatherEmail,
                    passwordHash: 'dummy',
                    firstName: 'David',
                    lastName: student.lastName || 'Smith',
                    role: 'PARENT',
                    isActive: true,
                    profile: {
                        create: {
                            phoneNumber: '+91 98765 43210',
                            address: '123 New Delhi, India'
                        }
                    }
                }
            });
        }

        await prisma.parentStudent.create({
            data: {
                tenantId,
                studentId: student.id,
                parentId: fatherUser.id,
                relationship: 'Father'
            }
        });
        parentCount++;
    }
  }

  console.log(`Successfully generated ${feeCount} fee assignments, ${docCount} documents, and ${parentCount} parent relations!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
