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
    searchParams: Promise<{ timer?: string; reattempt?: string; mode?: string }>
}) {
    const { categorySlug, challengeSlug } = await params;
    const { timer, reattempt, mode } = await searchParams;
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

    const isReview = mode === "review";
    // Determine if this is a re-attempt session
    const isReattempt = !isReview && (reattempt === "true" || timer !== undefined);

    // Build query string to carry session params into navigation URLs
    const queryParts: string[] = [];
    if (timer) queryParts.push(`timer=${encodeURIComponent(timer)}`);
    if (reattempt === "true") queryParts.push(`reattempt=true`);
    if (mode === "review") queryParts.push(`mode=review`);
    const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";

    // Bake the session params into prev/next URLs at the server level
    // This is the most reliable way to preserve them — client-side getNavUrl is a fallback
    const nextChallengeUrl = nextChallenge
        ? `/challenges/${categorySlug}/${nextChallenge.slug}${queryString}`
        : undefined;

    const prevChallengeUrl = prevChallenge
        ? `/challenges/${categorySlug}/${prevChallenge.slug}${queryString}`
        : undefined;

    return (
        <div className="flex flex-col h-screen bg-white overflow-hidden pt-16">

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
                    categoryTitle={category.title}
                    challengeType={challenge.type}
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
                    initialSubmission={
                        // Don't pass old submission during re-attempt — guarantees a clean slate
                        isReattempt ? null :
                        (challenge.submissions as any[])?.[0] ? {
                            submittedCode: (challenge.submissions as any[])[0].code,
                            status: (challenge.submissions as any[])[0].status,
                            passedTests: (challenge.submissions as any[])[0].passedTests,
                            totalTests: (challenge.submissions as any[])[0].totalTests
                        } : null
                    }
                    isReattempt={isReattempt}
                    isReview={isReview}
                />
            </div>
        </div>
    );
}
