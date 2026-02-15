import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Code2, Trophy, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { auth } from "@/lib/auth";

export const revalidate = 60;

export default async function ChallengesPage() {
    const session = await auth();

    const challenges = await prisma.lesson.findMany({
        where: {
            hasCodeChallenge: true,
            module: {
                course: {
                    isPublished: true
                }
            }
        },
        include: {
            module: {
                select: {
                    title: true,
                    course: {
                        select: {
                            title: true,
                            slug: true
                        }
                    }
                }
            },
            submissions: session?.user?.id ? {
                where: {
                    userId: session.user.id
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 1
            } : false
        },
        orderBy: {
            moduleId: 'asc'
        }
    });

    return (
        <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white pt-32 pb-20 px-6 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <header className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-600/10 rounded-lg">
                            <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                        </div>
                        <h2 className="text-blue-600 dark:text-blue-500 font-bold tracking-widest text-xs uppercase">Interactive Labs</h2>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent">
                        Code Challenges
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl">
                        Validate your skills with real-world coding problems. Solve challenges to earn certificates and level up your profile.
                    </p>
                </header>

                {challenges.length === 0 ? (
                    <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-20 text-center">
                        <Trophy className="w-16 h-16 text-zinc-300 dark:text-zinc-800 mx-auto mb-6" />
                        <h3 className="text-xl font-bold mb-2">No challenges available yet</h3>
                        <p className="text-zinc-500 max-w-md mx-auto">
                            We're currently preparing new interactive labs. Check back soon for exciting projects!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {challenges.map((challenge) => {
                            const lastSubmission = challenge.submissions?.[0];
                            const isCompleted = lastSubmission?.status === "PASSED";

                            return (
                                <Link
                                    key={challenge.id}
                                    href={`/courses/${challenge.module.course.slug}?lesson=${challenge.id}`}
                                    className="group flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-3xl hover:border-blue-500/30 transition-all hover:bg-white dark:hover:bg-zinc-900/50 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-none"
                                >
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                                {challenge.module.course.title}
                                            </span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-500 px-2 py-0.5 rounded-full bg-blue-500/10">
                                                {challenge.module.title}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {challenge.title}
                                        </h3>
                                        <p className="text-zinc-600 dark:text-zinc-500 text-sm max-w-xl">
                                            {challenge.description || "Master this technical concept through an interactive coding exercise."}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-8 min-w-fit">
                                        <div className="flex flex-col items-end">
                                            {isCompleted ? (
                                                <div className="flex items-center gap-2 text-green-600 dark:text-green-500 text-sm font-bold">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Completed
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-600 text-sm font-bold">
                                                    <Circle className="w-4 h-4" />
                                                    Not Started
                                                </div>
                                            )}
                                            <span className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                                                {challenge.submissions?.length || 0} attempts
                                            </span>
                                        </div>

                                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 group-hover:text-white transition-all text-zinc-400 dark:text-zinc-500 shadow-sm group-hover:shadow-blue-500/20">
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
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
