const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst();
  console.log(course ? course.slug : 'No course found');
  process.exit(0);
}

main();
