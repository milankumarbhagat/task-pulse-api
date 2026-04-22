import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.$executeRaw`UPDATE "Task" SET status = 'TODO' WHERE status = 'PENDING'`;
  console.log(`Updated ${count} tasks from PENDING to TODO.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
