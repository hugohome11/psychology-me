import { prisma } from '../lib/prisma';

async function main() {
  const u = await prisma.user.upsert({
    where: { email: 'founder@psychology.me' },
    update: {},
    create: { email: 'founder@psychology.me', name: 'Dr. Miloš Kankaraš' }
  });
  console.log('Seeded user id:', u.id);
}

main().catch((e)=> (console.error(e), process.exit(1))).finally(()=> prisma.$disconnect());
