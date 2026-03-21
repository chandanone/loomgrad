const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const categories = await prisma.challengeCategory.findMany({
        select: { slug: true, title: true, assessmentMode: true }
    });
    console.log(JSON.stringify(categories, null, 2));
}

main().finally(async () => await prisma.$disconnect());
