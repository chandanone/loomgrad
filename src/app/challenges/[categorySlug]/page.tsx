import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
    Clock, BookOpen, Target, Settings,
    ArrowRight, Star, ChevronRight, Zap,
    AlertCircle, Timer
} from "lucide-react";
import { auth } from "@/lib/auth";

export default async function CategoryInstructionPage({
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
                select: { id: true, slug: true }
            }
        }
    });

    if (!category) notFound();

    const firstChallenge = category.challenges[0];
    if (!firstChallenge) {
        return (
            <div className="min-h-screen pt-32 pb-16 px-6 text-center">
                <AlertCircle className="w-16 h-16 text-zinc-200 mx-auto mb-6" />
                <h1 className="text-2xl font-bold text-zinc-800">No challenges found</h1>
                <p className="text-zinc-500 mt-2">This category doesn't have any published challenges yet.</p>
                <Link href="/challenges" className="inline-block mt-8 text-blue-600 font-bold hover:underline">
                    Go Back
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-zinc-900 pt-32 pb-16">
            <div className="max-w-4xl mx-auto px-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {category.type}
                            </span>
                            <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`w-3.5 h-3.5 ${i < category.difficultyStars ? "fill-amber-400 text-amber-400" : "text-zinc-100"}`} />
                                ))}
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">{category.title}</h1>
                        <p className="text-zinc-500 text-lg leading-relaxed">{category.description}</p>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-64">
                        <div className="p-5 bg-zinc-50 border border-zinc-100 rounded-3xl">
                            <div className="flex items-center gap-3 mb-1">
                                <BookOpen className="w-4 h-4 text-zinc-400" />
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Questions</span>
                            </div>
                            <div className="text-2xl font-black tracking-tight">{category.challenges.length} Items</div>
                        </div>
                        <div className="p-5 bg-zinc-50 border border-zinc-100 rounded-3xl">
                            <div className="flex items-center gap-3 mb-1">
                                <Target className="w-4 h-4 text-zinc-400" />
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Mode</span>
                            </div>
                            <div className="text-2xl font-black tracking-tight">
                                {category.assessmentMode === "EXAM" ? "Exam Mode" : "Practice Mode"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions Text */}
                <div className="mb-12">
                    <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-xs">?</div>
                        Instructions & Setup
                    </h2>

                    {category.fullInstruction ? (
                        <div className="prose prose-zinc max-w-none bg-zinc-50 border border-zinc-100 p-8 rounded-[2.5rem] whitespace-pre-wrap text-zinc-700 leading-relaxed font-medium">
                            {category.fullInstruction}
                        </div>
                    ) : (
                        <div className="bg-zinc-50 border border-zinc-100 p-8 rounded-[2.5rem] text-zinc-500 italic">
                            No specific instructions provided for this set. You can browse through the challenges and solve them at your own pace.
                        </div>
                    )}
                </div>

                {/* Configuration Section (Client Choice) */}
                <InstructionConfig
                    categorySlug={categorySlug}
                    firstChallengeSlug={firstChallenge.slug}
                    assessmentMode={category.assessmentMode}
                    userName={session?.user?.name}
                />
            </div>
        </div>
    );
}

import { InstructionConfig } from "@/components/challenges/InstructionConfig";
