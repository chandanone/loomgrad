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
                            select: { status: true }
                        }
                        : false,
                }
            }
        }
    });

    const totalChallenges = categories.reduce((a, c) => a + c.challenges.length, 0);
    const totalSolved = session?.user?.id
        ? categories.reduce((a, c) => a + c.challenges.filter(ch => (ch.submissions as any[])?.some(s => s.status === "PASSED")).length, 0)
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {categories.map((category) => {
                            const total = category.challenges.length;
                            const solved = session?.user?.id
                                ? category.challenges.filter(ch => (ch.submissions as any[])?.some(s => s.status === "PASSED")).length
                                : 0;

                            return (
                                <Link
                                    key={category.id}
                                    href={`/challenges/${category.slug}`}
                                    className="group relative flex flex-col p-8 bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-500 overflow-hidden"
                                >
                                    {/* Abstract Background Decoration */}
                                    <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-500 ${category.type === "MATH" ? "bg-amber-600" : "bg-blue-600"}`} />

                                    <div className="flex items-start justify-between mb-8">
                                        <div className={`p-4 rounded-2xl shadow-sm ${category.type === "MATH"
                                            ? "bg-amber-50 text-amber-600"
                                            : "bg-blue-50 text-blue-600"
                                            }`}>
                                            {category.type === "MATH"
                                                ? <Calculator className="w-8 h-8" />
                                                : <Code2 className="w-8 h-8" />
                                            }
                                        </div>
                                        <div className="flex items-center gap-1 bg-zinc-50 px-3 py-1 rounded-full border border-zinc-100">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3 h-3 ${i < category.difficultyStars ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{category.type}</span>
                                            {category.classLevel && (
                                                <span className="text-[10px] font-black uppercase tracking-[0.1em] px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded-md">{category.classLevel}</span>
                                            )}
                                        </div>
                                        <h2 className="text-2xl font-black tracking-tight text-zinc-900 group-hover:text-blue-600 transition-colors mb-2">
                                            {category.title}
                                        </h2>
                                        <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">
                                            {category.description}
                                        </p>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-zinc-50 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Problems</span>
                                                <span className="text-sm font-black text-zinc-900">{total}</span>
                                            </div>
                                            {session?.user && (
                                                <>
                                                    <div className="w-px h-6 bg-zinc-100" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Progress</span>
                                                        <span className="text-sm font-black text-green-600">{Math.round((solved / total) * 100) || 0}%</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="p-2 bg-zinc-50 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
