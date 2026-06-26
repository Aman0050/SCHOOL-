import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({ where: { role: 'STUDENT' }, include: { profile: true } });
  for (const user of users) {
    if (user.profile && !user.profile.avatarUrl) {
      const gender = user.profile.gender === 'Female' ? 'women' : 'men';
      const rand = Math.floor(Math.random() * 99);
      const url = `https://randomuser.me/api/portraits/${gender}/${rand}.jpg`;
      await prisma.profile.update({
        where: { id: user.profile.id },
        data: { avatarUrl: url }
      });
    }
  }
  console.log('Avatars updated');
}

run().catch(console.error).finally(() => prisma.$disconnect());
