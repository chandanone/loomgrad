import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Code2, Calculator } from "lucide-react";
import { ChallengeSolver } from "@/components/challenges/ChallengeSolver";
import { auth } from "@/lib/auth";

export default async function ChallengeSolvePage({
    params,
    searchParams
}: {
    params: Promise<{ categorySlug: string; challengeSlug: string }>;
    searchParams: Promise<{ timer?: string }>
}) {
    const { categorySlug, challengeSlug } = await params;
    const { timer } = await searchParams;
    const session = await auth();

    const category = await prisma.challengeCategory.findUnique({
        where: { slug: categorySlug },
    });
    if (!category) notFound();

    const assessmentMode = category.assessmentMode;

    const challenge = await prisma.challenge.findFirst({
        where: {
            categoryId: category.id,
            slug: challengeSlug,
            isPublished: true,
        },
        include: {
            testCases: { orderBy: { orderIndex: "asc" } },
            options: { orderBy: { orderIndex: "asc" } },
            submissions: session?.user?.id ? {
                where: { userId: session.user.id },
                orderBy: { createdAt: 'desc' },
                take: 1
            } : false
        }
    });

    if (!challenge) notFound();

    const allChallenges = await prisma.challenge.findMany({
        where: { categoryId: category.id, isPublished: true },
        orderBy: { orderIndex: 'asc' },
        select: {
            id: true,
            slug: true,
            title: true,
            submissions: session?.user?.id ? {
                where: { userId: session.user.id },
                select: { status: true }
            } : false
        }
    });

    const currentIndex = allChallenges.findIndex(c => c.id === challenge.id);
    const nextChallenge = allChallenges[currentIndex + 1];
    const prevChallenge = allChallenges[currentIndex - 1];

    const nextChallengeUrl = nextChallenge
        ? `/challenges/${categorySlug}/${nextChallenge.slug}`
        : undefined;

    const prevChallengeUrl = prevChallenge
        ? `/challenges/${categorySlug}/${prevChallenge.slug}`
        : undefined;

    return (
        <div className="flex flex-col h-screen bg-white overflow-hidden pt-16">
            {/* Top bar */}
            <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-zinc-200 bg-white/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                    <Link
                        href="/challenges"
                        className="flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                        Challenges
                    </Link>
                    <span className="text-zinc-300">/</span>
                    <Link
                        href={`/challenges/${categorySlug}`}
                        className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                        {category.title}
                    </Link>
                    <span className="text-zinc-300">/</span>
                    <span className="text-sm font-bold text-zinc-900 font-mono">{challenge.title}</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${challenge.type === "MATH"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-blue-50 text-blue-600"
                        }`}>
                        {challenge.type === "MATH" ? <Calculator className="w-3.5 h-3.5" /> : challenge.type === "CODING" ? <Code2 className="w-3.5 h-3.5" /> : <Calculator className="w-3.5 h-3.5" />}
                        {challenge.type === "MATH" ? "Math" : challenge.type === "CODING" ? "Coding" : challenge.type.replace("_", " ")}
                    </div>
                </div>
            </div>

            {/* Solver workspace */}
            <div className="flex-1 min-h-0">
                <ChallengeSolver
                    key={challenge.id}
                    id={challenge.id}
                    title={challenge.title}
                    description={challenge.description}
                    questionType={challenge.questionType}
                    starterCode={challenge.starterCode || `function ${challenge.title || 'solve'}() {\n  // Write your code here\n}\n`}
                    hint={challenge.hint}
                    solution={challenge.solution}
                    testCases={challenge.testCases}
                    options={challenge.options}
                    correctAnswer={challenge.correctAnswer}
                    language={challenge.language}
                    difficultyStars={challenge.difficultyStars}
                    prevChallengeUrl={prevChallengeUrl}
                    nextChallengeUrl={nextChallengeUrl}
                    assessmentMode={assessmentMode}
                    initialTimerLevel={timer}
                    categorySlug={categorySlug}
                    allChallenges={allChallenges.map(c => ({
                        id: c.id,
                        slug: c.slug,
                        title: c.title,
                        isAnswered: (c.submissions as any[])?.length > 0
                    }))}
                    user={{
                        name: session?.user?.name || "John Smith",
                        image: session?.user?.image || null
                    }}
                    initialSubmission={(challenge.submissions as any[])?.[0] ? {
                        submittedCode: (challenge.submissions as any[])[0].code,
                        status: (challenge.submissions as any[])[0].status,
                        passedTests: (challenge.submissions as any[])[0].passedTests,
                        totalTests: (challenge.submissions as any[])[0].totalTests
                    } : null}
                    isReattempt={timer !== undefined}
                />
            </div>
        </div>
    );
}
