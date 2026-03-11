import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const categories = [
        {
            title: "Warmup-1",
            slug: "warmup-1",
            description: "Simple warmup problems to get started with JavaScript logic.",
            stars: 1,
            language: "JavaScript",
            problems: [
                {
                    title: "sleepIn",
                    slug: "sleep-in",
                    description: "The parameter weekday is true if it is a weekday, and the parameter vacation is true if we are on vacation. We sleep in if it is not a weekday or we're on vacation. Return true if we sleep in.",
                    starterCode: "function sleepIn(weekday, vacation) {\n  // Write your code here\n}\n",
                    testCases: [
                        { input: "false, false", output: "true" },
                        { input: "true, false", output: "false" },
                        { input: "false, true", output: "true" },
                        { input: "true, true", output: "true" }
                    ],
                    hint: "Use logical OR (||) and logical NOT (!) operator.",
                    solution: "function sleepIn(weekday, vacation) {\n  return !weekday || vacation;\n}"
                },
                {
                    title: "monkeyTrouble",
                    slug: "monkey-trouble",
                    description: "We have two monkeys, a and b, and the parameters aSmile and bSmile indicate if each is smiling. We are in trouble if they are both smiling or if neither of them is smiling. Return true if we are in trouble.",
                    starterCode: "function monkeyTrouble(aSmile, bSmile) {\n  // Write your code here\n}\n",
                    testCases: [
                        { input: "true, true", output: "true" },
                        { input: "false, false", output: "true" },
                        { input: "true, false", output: "false" },
                        { input: "false, true", output: "false" }
                    ],
                    hint: "The monkeys are smiling if (aSmile && bSmile) or not smiling if (!aSmile && !bSmile).",
                    solution: "function monkeyTrouble(aSmile, bSmile) {\n  return (aSmile && bSmile) || (!aSmile && !bSmile);\n}"
                },
                {
                    title: "sumDouble",
                    slug: "sum-double",
                    description: "Given two int values, return their sum. Unless the two values are the same, then return double their sum.",
                    starterCode: "function sumDouble(a, b) {\n  // Write your code here\n}\n",
                    testCases: [
                        { input: "1, 2", output: "3" },
                        { input: "3, 2", output: "5" },
                        { input: "2, 2", output: "8" }
                    ],
                    hint: "Use an if-statement to check if a equals b.",
                    solution: "function sumDouble(a, b) {\n  let sum = a + b;\n  if (a === b) sum = sum * 2;\n  return sum;\n}"
                }
            ]
        },
        {
            title: "Warmup-2",
            slug: "warmup-2",
            description: "Medium difficulty loops and logic.",
            stars: 2,
            language: "JavaScript",
            problems: [
                {
                    title: "stringTimes",
                    slug: "string-times",
                    description: "Given a string and a non-negative int n, return a larger string that is n copies of the original string.",
                    starterCode: "function stringTimes(str, n) {\n  // Write your code here\n}\n",
                    testCases: [
                        { input: "'Hi', 2", output: "'HiHi'" },
                        { input: "'Hi', 3", output: "'HiHiHi'" },
                        { input: "'Hi', 1", output: "'Hi'" }
                    ],
                    hint: "You can use a loop or the repeat() method.",
                    solution: "function stringTimes(str, n) {\n  return str.repeat(n);\n}"
                }
            ]
        }
    ];

    for (const cat of categories) {
        const course = await prisma.course.upsert({
            where: { slug: cat.slug },
            create: {
                title: cat.title,
                slug: cat.slug,
                description: cat.description,
                difficultyStars: cat.stars,
                isPublished: true,
                isChallengeSet: true,
                language: cat.language,
                category: "Independent Challenges"
            },
            update: {
                isChallengeSet: true,
                difficultyStars: cat.stars,
                isPublished: true
            }
        });

        const module = await prisma.module.upsert({
            where: {
                courseId_orderIndex: {
                    courseId: course.id,
                    orderIndex: 0
                }
            },
            create: {
                courseId: course.id,
                title: cat.title + " Problems",
                orderIndex: 0
            },
            update: {}
        });

        for (let i = 0; i < cat.problems.length; i++) {
            const p = cat.problems[i];
            const lesson = await prisma.lesson.upsert({
                where: {
                    moduleId_slug: {
                        moduleId: module.id,
                        slug: p.slug
                    }
                },
                create: {
                    moduleId: module.id,
                    title: p.title,
                    slug: p.slug,
                    description: p.description,
                    orderIndex: i,
                    hasCodeChallenge: true,
                    starterCode: p.starterCode,
                    hint: p.hint,
                    solution: p.solution,
                    youtubeVideoId: "none",
                },
                update: {
                    description: p.description,
                    starterCode: p.starterCode,
                    hint: p.hint,
                    solution: p.solution,
                }
            });

            // Add test cases
            for (let j = 0; j < p.testCases.length; j++) {
                const tc = p.testCases[j];
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
                        expectedOutput: tc.output,
                        orderIndex: j
                    },
                    update: {
                        input: tc.input,
                        expectedOutput: tc.output
                    }
                });
            }
        }
    }

    console.log("Successfully seeded independent challenges!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
