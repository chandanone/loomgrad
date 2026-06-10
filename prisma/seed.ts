import { PrismaClient, CourseLevel, UserRole, SubscriptionTier } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');

  const hashedAdminPassword = await bcrypt.hash('admin123', 10);

  // 1. Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@loomgrad.com' },
    update: {
      password: hashedAdminPassword
    },
    create: {
      email: 'admin@loomgrad.com',
      name: 'LoomGrad Admin',
      password: hashedAdminPassword,
      role: UserRole.ADMIN,
    },
  });
  console.log(`✅ Created admin user: ${admin.email}`);

  // 2. Create a Sample Course
  const course = await prisma.course.upsert({
    where: { slug: 'typescript-masterclass' },
    update: {},
    create: {
      title: 'TypeScript Masterclass',
      slug: 'typescript-masterclass',
      description: 'Master TypeScript from scratch with real-world projects and advanced patterns.',
      thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&auto=format&fit=crop&q=60',
      youtubePlaylistId: 'PLL6WvT_8r6hX_m4b1A5Z5B9lQKv-m7-2F', // Placeholder
      category: 'Web Development',
      level: CourseLevel.INTERMEDIATE,
      language: 'TypeScript',
      isPublished: true,
      modules: {
        create: [
          {
            title: 'Introduction to TypeScript',
            description: 'Getting started with TS and setting up the environment.',
            orderIndex: 0,
            lessons: {
              create: [
                {
                  title: 'Why TypeScript?',
                  slug: 'why-typescript',
                  youtubeVideoId: 'dQw4w9WgXcQ', // Placeholder
                  orderIndex: 0,
                  isFree: true,
                  description: 'Learn the benefits of static typing and why companies use TS.',
                },
                {
                  title: 'Installation & Setup',
                  slug: 'setup',
                  youtubeVideoId: 'dQw4w9WgXcQ',
                  orderIndex: 1,
                  isFree: false,
                  hasCodeChallenge: true,
                  starterCode: 'const greeting: string = "Hello LoomGrad";\nconsole.log(greeting);',
                }
              ]
            }
          },
          {
            title: 'Advanced Types',
            description: 'Generics, Union Types, and more.',
            orderIndex: 1,
            lessons: {
              create: [
                {
                  title: 'Generics deep dive',
                  slug: 'generics-deep-dive',
                  youtubeVideoId: 'dQw4w9WgXcQ',
                  orderIndex: 0,
                  isFree: false,
                }
              ]
            }
          }
        ]
      }
    },
  });
  console.log(`✅ Created course: ${course.title}`);

  console.log('🌳 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
