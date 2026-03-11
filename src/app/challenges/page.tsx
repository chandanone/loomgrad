import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Code2, Calculator, Star, Trophy, ChevronRight, CheckCircle2, Circle, Zap } from "lucide-react";

export const revalidate = 60;

export default async function ChallengesPage() {
    const session = await auth();

    const categories = await prisma.challengeCategory.findMany({
        where: { isPublished: true },
        orderBy: { orderIndex: "asc" },
        include: {
            challenges: {
                where: { isPublished: true },
                orderBy: { orderIndex: "asc" },
                include: {
                    submissions: session?.user?.id
                        ? {
                            where: { userId: session.user.id },
                            orderBy: { createdAt: "desc" },
                            take: 1,
                        }
                        : false,
                }
            }
        }
    });

    const totalChallenges = categories.reduce((a, c) => a + c.challenges.length, 0);
    const totalSolved = session?.user?.id
        ? categories.reduce((a, c) => a + c.challenges.filter(ch => (ch.submissions as any[])?.[0]?.status === "PASSED").length, 0)
        : 0;

    return (
        <div className="min-h-screen bg-white text-zinc-900">
            {/* Hero */}
            <div className="bg-gradient-to-b from-zinc-50 to-white border-b border-zinc-100 pt-32 pb-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-600/10 rounded-xl">
                            <Code2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-blue-600 font-bold tracking-widest text-xs uppercase">Practice Arena</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 leading-none">
                                Code &<br />
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Math</span>
                                <br />Challenges
                            </h1>
                            <p className="text-zinc-500 text-lg max-w-lg">
                                Solve logic puzzles, write functions, and sharpen algorithmic thinking. Inspired by CodingBat — built for Loomgrad.
                            </p>
                        </div>
                        {session?.user && (
                            <div className="flex items-center gap-6 p-6 bg-white border border-zinc-200 rounded-3xl shadow-sm shrink-0">
                                <div className="text-center">
                                    <div className="text-3xl font-black text-blue-600">{totalSolved}</div>
                                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Solved</div>
                                </div>
                                <div className="w-px h-10 bg-zinc-100" />
                                <div className="text-center">
                                    <div className="text-3xl font-black text-zinc-300">{totalChallenges}</div>
                                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Total</div>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-amber-500 fill-amber-400" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Cards */}
            <div className="max-w-5xl mx-auto px-6 py-16">
                {categories.length === 0 ? (
                    <div className="text-center py-24 border border-zinc-200 rounded-3xl bg-zinc-50">
                        <Trophy className="w-16 h-16 text-zinc-200 mx-auto mb-6" />
                        <h2 className="text-xl font-bold text-zinc-500 mb-2">No challenges yet</h2>
                        <p className="text-zinc-400 text-sm">Check back soon — the admin is building new problems!</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {categories.map((category) => {
                            const solved = (category.challenges as any[]).filter(
                                ch => (ch.submissions as any[])?.[0]?.status === "PASSED"
                            ).length;
                            const total = category.challenges.length;

                            return (
                                <section key={category.id} className="group">
                                    {/* Category Header */}
                                    <div className="flex items-start justify-between mb-6 pb-5 border-b border-zinc-100">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl ${category.type === "MATH"
                                                    ? "bg-amber-50 text-amber-600"
                                                    : "bg-blue-50 text-blue-600"
                                                }`}>
                                                {category.type === "MATH"
                                                    ? <Calculator className="w-6 h-6" />
                                                    : <Code2 className="w-6 h-6" />
                                                }
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1.5">
                                                    <h2 className="text-2xl font-black tracking-tight">{category.title}</h2>
                                                    <div className="flex items-center gap-0.5">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-4 h-4 ${i < category.difficultyStars
                                                                        ? "fill-amber-400 text-amber-400"
                                                                        : "text-zinc-200"
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-zinc-500 text-sm">{category.description}</p>
                                            </div>
                                        </div>
                                        {session?.user && total > 0 && (
                                            <div className="text-right shrink-0 ml-4">
                                                <div className="text-sm font-bold text-zinc-900">{solved} / {total}</div>
                                                <div className="text-xs text-zinc-400 mb-2">completed</div>
                                                <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500 rounded-full transition-all"
                                                        style={{ width: `${total > 0 ? (solved / total) * 100 : 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Problem Grid — CodingBat style */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {category.challenges.map((challenge) => {
                                            const passed = (challenge.submissions as any[])?.[0]?.status === "PASSED";
                                            const attempted = (challenge.submissions as any[])?.length > 0;

                                            return (
                                                <Link
                                                    key={challenge.id}
                                                    href={`/challenges/${category.slug}/${challenge.slug}`}
                                                    className={`group/card relative flex flex-col gap-2 p-4 rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5 ${passed
                                                            ? "bg-green-50 border-green-200 hover:border-green-300"
                                                            : attempted
                                                                ? "bg-amber-50 border-amber-200 hover:border-amber-300"
                                                                : "bg-zinc-50 border-zinc-200 hover:border-blue-300 hover:bg-blue-50/30"
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        {passed ? (
                                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                        ) : attempted ? (
                                                            <Circle className="w-4 h-4 text-amber-400 fill-amber-100" />
                                                        ) : (
                                                            <Circle className="w-4 h-4 text-zinc-300" />
                                                        )}
                                                        <div className="flex items-center gap-0.5">
                                                            {Array.from({ length: challenge.difficultyStars }).map((_, i) => (
                                                                <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <span className="font-bold text-sm leading-tight text-zinc-900 group-hover/card:text-blue-600 transition-colors font-mono">
                                                        {challenge.title}
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </div>

                                    {/* Help section */}
                                    {category.helpText && (
                                        <div className="mt-6 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">💡 Help</p>
                                            <p className="text-sm text-zinc-600 whitespace-pre-line">{category.helpText}</p>
                                        </div>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
