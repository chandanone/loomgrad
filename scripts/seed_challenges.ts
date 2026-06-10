import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const courseSlug = "javascript-warmup-1";

    // 1. Create or Find Course
    let course = await prisma.course.findUnique({
        where: { slug: courseSlug }
    });

    if (!course) {
        course = await prisma.course.create({
            data: {
                title: "JavaScript Warmup-1",
                slug: courseSlug,
                description: "Simple warmup problems to get started with JavaScript logic.",
                isPublished: true,
                hasSandbox: true,
                level: "BEGINNER",
                youtubePlaylistId: "warmup1-placeholder-" + Date.now(),
            }
        });
    }

    // 2. Create Module
    const module = await prisma.module.upsert({
        where: {
            courseId_orderIndex: {
                courseId: course.id,
                orderIndex: 0
            }
        },
        create: {
            courseId: course.id,
            title: "Warmup Logic",
            orderIndex: 0,
        },
        update: {
            title: "Warmup Logic"
        }
    });

    // 3. Define Challenges
    const challenges = [
        {
            title: "sleepIn",
            slug: "sleep-in",
            description: "The parameter weekday is true if it is a weekday, and the parameter vacation is true if we are on vacation. We sleep in if it is not a weekday or we're on vacation. Return true if we sleep in.",
            starterCode: "function sleepIn(weekday, vacation) {\n  // Write your code here\n}\n",
            testCases: [
                { input: "false, false", expectedOutput: "true" },
                { input: "true, false", expectedOutput: "false" },
                { input: "false, true", expectedOutput: "true" },
                { input: "true, true", expectedOutput: "true" }
            ]
        },
        {
            title: "monkeyTrouble",
            slug: "monkey-trouble",
            description: "We have two monkeys, a and b, and the parameters aSmile and bSmile indicate if each is smiling. We are in trouble if they are both smiling or if neither of them is smiling. Return true if we are in trouble.",
            starterCode: "function monkeyTrouble(aSmile, bSmile) {\n  // Write your code here\n}\n",
            testCases: [
                { input: "true, true", expectedOutput: "true" },
                { input: "false, false", expectedOutput: "true" },
                { input: "true, false", expectedOutput: "false" },
                { input: "false, true", expectedOutput: "false" }
            ]
        },
        {
            title: "sumDouble",
            slug: "sum-double",
            description: "Given two int values, return their sum. Unless the two values are the same, then return double their sum.",
            starterCode: "function sumDouble(a, b) {\n  // Write your code here\n}\n",
            testCases: [
                { input: "1, 2", expectedOutput: "3" },
                { input: "3, 2", expectedOutput: "5" },
                { input: "2, 2", expectedOutput: "8" },
                { input: "0, 0", expectedOutput: "0" }
            ]
        },
        {
            title: "diff21",
            slug: "diff-21",
            description: "Given an int n, return the absolute difference between n and 21, except return double the absolute difference if n is over 21.",
            starterCode: "function diff21(n) {\n  // Write your code here\n}\n",
            testCases: [
                { input: "19", expectedOutput: "2" },
                { input: "10", expectedOutput: "11" },
                { input: "21", expectedOutput: "0" },
                { input: "22", expectedOutput: "2" },
                { input: "25", expectedOutput: "8" }
            ]
        }
    ];

    for (let i = 0; i < challenges.length; i++) {
        const c = challenges[i];
        const lesson = await prisma.lesson.upsert({
            where: {
                moduleId_slug: {
                    moduleId: module.id,
                    slug: c.slug
                }
            },
            create: {
                moduleId: module.id,
                title: c.title,
                slug: c.slug,
                description: c.description,
                orderIndex: i,
                hasCodeChallenge: true,
                starterCode: c.starterCode,
                youtubeVideoId: "placeholder", // Required field
            },
            update: {
                description: c.description,
                hasCodeChallenge: true,
                starterCode: c.starterCode,
            }
        });

        // Add test cases
        for (let j = 0; j < c.testCases.length; j++) {
            const tc = c.testCases[j];
            await prisma.testCase.upsert({
                where: {
                    lessonId_orderIndex: {
                        lessonId: lesson.id,
                        orderIndex: j
                    }
                },
                create: {
                    lessonId: lesson.id,
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    orderIndex: j,
                },
                update: {
                    input: tc.input,
                    expectedOutput: tc.expectedOutput
                }
            });
        }
    }

    console.log("Successfully seeded challenges!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
