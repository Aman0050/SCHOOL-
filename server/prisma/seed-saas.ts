import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSaaSPlans() {
  const plans = [
    {
      name: 'Starter',
      tier: 'STARTER' as const,
      priceMonthly: 0,
      priceAnnual: 0,
      maxStudents: 100,
      features: ['Basic Dashboard', 'Max 100 Students', 'Standard Support'],
      isActive: true
    },
    {
      name: 'Professional',
      tier: 'PROFESSIONAL' as const,
      priceMonthly: 49.99,
      priceAnnual: 499.99,
      maxStudents: 500,
      features: ['Advanced Analytics', 'Max 500 Students', 'Priority Support', 'Custom Domain'],
      isActive: true
    },
    {
      name: 'Enterprise',
      tier: 'ENTERPRISE' as const,
      priceMonthly: 199.99,
      priceAnnual: 1999.99,
      maxStudents: 5000,
      features: ['Unlimited Students', '24/7 Dedicated Support', 'White-labeling', 'API Access'],
      isActive: true
    }
  ];

  for (const plan of plans) {
    await prisma.saaSPlan.upsert({
      where: { tier: plan.tier },
      update: plan,
      create: plan
    });
    console.log(`Upserted plan: ${plan.name}`);
  }
}

seedSaaSPlans()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());
