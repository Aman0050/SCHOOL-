import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const sa = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (sa) {
    console.log('Super Admin exists:', sa.email);
  } else {
    console.log('No Super Admin found. Creating one...');
    const t = await prisma.tenant.findFirst();
    if (!t) return console.log('No tenant found to attach SA');
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('superpassword123', salt);
    
    const newSa = await prisma.user.create({
      data: {
        tenantId: t.id,
        email: 'superadmin@edusphere.com',
        passwordHash,
        firstName: 'System',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
      }
    });
    console.log('Created Super Admin:', newSa.email, 'superpassword123');
  }
}

main().finally(() => prisma.$disconnect());
