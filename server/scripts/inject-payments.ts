import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Injecting realistic payment methods data...');

  const tenant = await prisma.tenant.findFirst();
  if (!tenant) throw new Error('No tenant found');
  const tenantId = tenant.id;

  const assignment = await prisma.studentFeeAssignment.findFirst({
    where: { tenantId }
  });
  if (!assignment) throw new Error('No assignment found');

  const methods = ['CREDIT_CARD', 'CASH', 'BANK_TRANSFER'];
  const amounts = [25000, 10000, 15000];

  for (let i = 0; i < methods.length; i++) {
    await prisma.paymentInstallment.create({
      data: {
        tenantId,
        assignmentId: assignment.id,
        amount: amounts[i],
        method: methods[i] as any,
        status: 'SUCCESS',
        transactionId: `TXN-MOCK-${Math.floor(Math.random() * 1000000)}`,
      }
    });
    console.log(`Created ${methods[i]} payment of ₹${amounts[i]}`);
  }

  console.log('Payment method injection complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
