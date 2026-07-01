import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany();
  
  if (tenants.length === 0) {
    console.log("No tenants found! Creating one...");
    return;
  }

  const tenant = tenants[0];
  console.log(`Generating subscription for tenant: ${tenant.name}...`);
  
  // create plan
  const plan = await prisma.subscriptionPlan.create({
    data: {
      name: 'PRO',
      priceMonthly: 299,
      priceYearly: 2990,
      maxStudents: 1000,
      features: ['all']
    }
  });

  const sub = await prisma.subscription.upsert({
    where: { tenantId: tenant.id },
    create: {
      tenantId: tenant.id,
      planId: plan.id,
      status: 'ACTIVE',
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    },
    update: {
      planId: plan.id,
      status: 'ACTIVE',
    }
  });

  console.log(`Generating invoices for subscription...`);
  
  await prisma.saaSInvoice.create({
    data: {
      tenantId: tenant.id,
      subscriptionId: sub.id,
      amount: 499.00,
      status: 'PAID',
      paidAt: new Date(),
    }
  });
  
  await prisma.saaSInvoice.create({
    data: {
      tenantId: tenant.id,
      subscriptionId: sub.id,
      amount: 499.00,
      status: 'OPEN',
    }
  });
  
  console.log("Subscription & Invoices generated successfully!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
