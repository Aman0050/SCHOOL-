import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  console.log('--- Fee Management Data Audit ---');
  
  // 2. Negative Balances
  const ledgers = await prisma.financialLedger.findMany({
    where: { balance: { lt: 0 } }
  });
  console.log(`Ledgers with negative balances: ${ledgers.length}`);
  
  // 3. Due amount consistency
  const inconsistencies = await prisma.$queryRaw`
    SELECT id, "totalAmount", "discountAmount", "fineAmount", "paidAmount", "dueAmount"
    FROM "StudentFeeAssignment"
    WHERE "dueAmount" != ("totalAmount" - "discountAmount" + "fineAmount" - "paidAmount")
  `;
  console.log(`Assignments with inconsistent dueAmount: ${(inconsistencies as any).length}`);

  // 4. Duplicate payments
  const payments = await prisma.paymentInstallment.findMany({
    where: { 
      transactionId: { not: null },
      status: 'SUCCESS'
    }
  });
  const txIds = payments.map(p => p.transactionId);
  const dupes = txIds.filter((item, index) => txIds.indexOf(item) !== index);
  console.log(`Duplicate payment transactions: ${dupes.length}`);

  console.log('--- Audit Complete ---');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
