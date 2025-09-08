import { prisma } from '../lib/prisma'; // relative path (no alias)

async function main() {
  await prisma.assessment.upsert({
    where: { slug: 'demo' },
    update: {},
    create: { slug: 'demo', title: 'Demo Assessment' }
  });
  console.log('Seeded assessment: demo');
}

main()
  .catch((e) => (console.error(e), process.exit(1)))
  .finally(() => prisma.$disconnect());
