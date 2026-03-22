const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const category = await prisma.challengeCategory.findUnique({
        where: { slug: 'java-warm-1-basics' },
        select: { assessmentMode: true }
    });
    console.log(JSON.stringify(category));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
