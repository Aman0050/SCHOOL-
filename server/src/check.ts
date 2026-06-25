import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const tenant = await prisma.tenant.findUnique({
        where: { id: '4e5b87fe-3c03-4d75-88e9-ea252150e42a' }
    });
    console.log(tenant);
}

main().catch(console.error).finally(() => prisma.$disconnect());
