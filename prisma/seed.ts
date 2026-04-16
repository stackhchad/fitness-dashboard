import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const USER_ID = process.env.DEFAULT_USER_ID ?? 'user_default';

async function main() {
  // Ensure default user exists
  await prisma.user.upsert({
    where:  { id: USER_ID },
    update: {},
    create: { id: USER_ID, email: 'user@example.com', name: 'Athlete' },
  });
  console.log('Seeded default user:', USER_ID);
}

main().catch(console.error).finally(() => prisma.$disconnect());
