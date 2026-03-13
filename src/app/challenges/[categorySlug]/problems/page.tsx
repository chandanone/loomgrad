import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { ArrowLeft, Code2, Calculator, Star, CheckCircle2, Circle } from "lucide-react";

export const revalidate = 60;

export default async function CategoryProblemsPage({
    params
}: {
    params: Promise<{ categorySlug: string }>
}) {
    const { categorySlug } = await params;
    const session = await auth();

    const category = await prisma.challengeCategory.findUnique({
        where: { slug: categorySlug, isPublished: true },
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

    if (!category) notFound();

    const total = category.challenges.length;
    const solved = session?.user?.id
        ? category.challenges.filter(ch => (ch.submissions as any[])?.some(s => s.status === "PASSED")).length
        : 0;

    return (
        <div className="min-h-screen bg-white text-zinc-900 pt-24 pb-16">
            <div className="max-w-5xl mx-auto px-6">
                {/* Back Link */}
                <Link href={`/challenges/${categorySlug}`} className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Instructions
                </Link>

                {/* Category Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-zinc-100">
                    <div className="flex items-center gap-6">
                        <div className={`p-5 rounded-3xl ${category.type === "MATH"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-blue-50 text-blue-600"
                            }`}>
                            {category.type === "MATH"
                                ? <Calculator className="w-10 h-10" />
                                : <Code2 className="w-10 h-10" />
                            }
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-black tracking-tight">{category.title}</h1>
                                <div className="flex items-center gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${i < category.difficultyStars
                                                ? "fill-amber-400 text-amber-400"
                                                : "text-zinc-200"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-zinc-500 text-lg max-w-xl">{category.description}</p>
                        </div>
                    </div>
                    {session?.user && total > 0 && (
                        <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100 shrink-0">
                            <div className="flex items-center justify-between gap-12 mb-2">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Progress</span>
                                <span className="text-sm font-black text-zinc-900">{solved} / {total}</span>
                            </div>
                            <div className="w-48 h-2 bg-zinc-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 rounded-full transition-all"
                                    style={{ width: `${(solved / total) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Problems Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {category.challenges.map((challenge) => {
                        const passed = (challenge.submissions as any[])?.some(s => s.status === "PASSED");
                        const attempted = (challenge.submissions as any[])?.length > 0;

                        return (
                            <Link
                                key={challenge.id}
                                href={`/challenges/${category.slug}/${challenge.slug}`}
                                className={`group flex flex-col gap-3 p-6 rounded-3xl border-2 transition-all hover:shadow-xl hover:-translate-y-1 ${passed
                                    ? "bg-green-50 border-green-200 hover:border-green-400"
                                    : attempted
                                        ? "bg-amber-50 border-amber-200 hover:border-amber-400"
                                        : "bg-white border-zinc-100 hover:border-blue-400"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    {passed ? (
                                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    ) : attempted ? (
                                        <Circle className="w-6 h-6 text-amber-400 fill-amber-50" />
                                    ) : (
                                        <Circle className="w-6 h-6 text-zinc-200" />
                                    )}
                                    <div className="flex items-center gap-0.5">
                                        {Array.from({ length: challenge.difficultyStars }).map((_, i) => (
                                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                </div>
                                <h3 className="font-black text-lg leading-tight group-hover:text-blue-600 transition-colors font-mono">
                                    {challenge.title}
                                </h3>
                                <p className="text-xs text-zinc-400 line-clamp-2">
                                    {challenge.description}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
