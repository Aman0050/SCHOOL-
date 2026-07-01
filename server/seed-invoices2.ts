import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany();
  const tenant = tenants[0];

  const plan = await prisma.subscriptionPlan.create({
    data: { name: 'PRO_SEED', priceMonthly: 299, priceYearly: 2990, maxStudents: 1000, features: [] }
  });

  const sub = await prisma.subscription.upsert({
    where: { tenantId: tenant.id },
    create: { tenantId: tenant.id, planId: plan.id, status: 'ACTIVE', endDate: new Date() },
    update: { planId: plan.id }
  });

  await prisma.saaSInvoice.create({
    data: { tenantId: tenant.id, subscriptionId: sub.id, amount: 299, status: 'PAID' }
  });

  console.log("Seeded!");
}
main().catch(console.error);
