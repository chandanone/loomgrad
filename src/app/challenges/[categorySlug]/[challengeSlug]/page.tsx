import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Code2, Calculator } from "lucide-react";
import { ChallengeSolver } from "@/components/challenges/ChallengeSolver";

export default async function ChallengeSolvePage({
    params
}: {
    params: Promise<{ categorySlug: string; challengeSlug: string }>
}) {
    const { categorySlug, challengeSlug } = await params;

    const category = await prisma.challengeCategory.findUnique({
        where: { slug: categorySlug },
    });
    if (!category) notFound();

    const challenge = await prisma.challenge.findFirst({
        where: {
            categoryId: category.id,
            slug: challengeSlug,
            isPublished: true,
        },
        include: {
            testCases: { orderBy: { orderIndex: "asc" } },
            options: { orderBy: { orderIndex: "asc" } }
        }
    });

    if (!challenge) notFound();

    return (
        <div className="flex flex-col h-screen bg-white overflow-hidden pt-16">
            {/* Top bar */}
            <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-zinc-200 bg-white/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                    <Link
                        href="/challenges"
                        className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Challenges
                    </Link>
                    <span className="text-zinc-300">/</span>
                    <span className="text-sm font-bold text-zinc-500">{category.title}</span>
                    <span className="text-zinc-300">/</span>
                    <span className="text-sm font-bold text-zinc-900 font-mono">{challenge.title}</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${challenge.type === "MATH"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-blue-50 text-blue-600"
                        }`}>
                        {challenge.type === "MATH"
                            ? <Calculator className="w-3.5 h-3.5" />
                            : <Code2 className="w-3.5 h-3.5" />
                        }
                        {challenge.type === "MATH" ? "Math" : "Coding"}
                    </div>
                </div>
            </div>

            {/* Solver workspace */}
            <div className="flex-1 min-h-0">
                <ChallengeSolver
                    title={challenge.title}
                    description={challenge.description}
                    questionType={challenge.questionType}
                    starterCode={challenge.starterCode || `function ${challenge.title || 'solve'}() {\n  // Write your code here\n}\n`}
                    hint={challenge.hint}
                    solution={challenge.solution}
                    testCases={challenge.testCases}
                    options={challenge.options}
                    correctAnswer={challenge.correctAnswer}
                    language={category.language}
                    difficultyStars={challenge.difficultyStars}
                />
            </div>
        </div>
    );
}
