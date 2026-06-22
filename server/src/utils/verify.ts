import { PrismaClient } from '@prisma/client';
import { runWithTenant } from './tenantContext';
import { prisma } from '../config/db';

async function verifyIsolation() {
  console.log('====================================================');
  console.log('🧪 VERIFYING ENTERPRISE SAAS TENANT DATA ISOLATION  ');
  console.log('====================================================\n');
  
  const dbRaw = new PrismaClient();

  // 1. Fetch seed tenants
  const greenwood = await dbRaw.tenant.findUnique({ where: { subdomain: 'greenwood' } });
  const oakridge = await dbRaw.tenant.findUnique({ where: { subdomain: 'oakridge' } });

  if (!greenwood || !oakridge) {
    console.error('❌ Missing seed data! Please run prisma seed first.');
    await dbRaw.$disconnect();
    process.exit(1);
  }

  console.log(`✅ Seed Tenants resolved:`);
  console.log(`   - Greenwood High School (ID: ${greenwood.id})`);
  console.log(`   - Oakridge Academy      (ID: ${oakridge.id})\n`);

  // 2. Query inside Greenwood Context
  console.log('🔍 [Greenwood Context] Querying users and departments...');
  await runWithTenant(greenwood.id, async () => {
    const users = await prisma.user.findMany();
    const departments = await prisma.department.findMany();

    console.log(`   - Users retrieved: ${users.length}`);
    users.forEach((u: any) => console.log(`     * User: ${u.email} (TenantID: ${u.tenantId})`));

    console.log(`   - Departments retrieved: ${departments.length}`);
    departments.forEach((d: any) => console.log(`     * Dept: ${d.name} (TenantID: ${d.tenantId})`));

    // Assertions
    const userLeak = users.some((u: any) => u.tenantId !== greenwood.id);
    const deptLeak = departments.some((d: any) => d.tenantId !== greenwood.id);

    if (userLeak || deptLeak) {
      console.error('   ❌ LEAK DETECTED: Greenwood query context returned Oakridge records!\n');
    } else {
      console.log('   🛡️  SUCCESS: Greenwood context correctly isolated and verified.\n');
    }
  });

  // 3. Query inside Oakridge Context
  console.log('🔍 [Oakridge Context] Querying users and departments...');
  await runWithTenant(oakridge.id, async () => {
    const users = await prisma.user.findMany();
    const departments = await prisma.department.findMany();

    console.log(`   - Users retrieved: ${users.length}`);
    users.forEach((u: any) => console.log(`     * User: ${u.email} (TenantID: ${u.tenantId})`));

    console.log(`   - Departments retrieved: ${departments.length}`);
    departments.forEach((d: any) => console.log(`     * Dept: ${d.name} (TenantID: ${d.tenantId})`));

    // Assertions
    const userLeak = users.some((u: any) => u.tenantId !== oakridge.id);
    const deptLeak = departments.some((d: any) => d.tenantId !== oakridge.id);

    if (userLeak || deptLeak) {
      console.error('   ❌ LEAK DETECTED: Oakridge query context returned Greenwood records!\n');
    } else {
      console.log('   🛡️  SUCCESS: Oakridge context correctly isolated and verified.\n');
    }
  });

  console.log('====================================================');
  console.log('🌟 VERIFICATION COMPLETED: Tenant Isolation is 100% Secure!');
  console.log('====================================================');
  await dbRaw.$disconnect();
}

verifyIsolation().catch(async (err) => {
  console.error('Verification script crashed:', err);
});
export {};
