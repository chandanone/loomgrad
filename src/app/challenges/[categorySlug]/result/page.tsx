import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { 
    CheckCircle2, XCircle, Award, ArrowLeft, 
    BarChart3, Clock, Target, ChevronRight
} from "lucide-react";
import { ResetProgressButton } from "@/components/challenges/ResetProgressButton";

export default async function ChallengeResultPage({
    params
}: {
    params: Promise<{ categorySlug: string }>
}) {
    const { categorySlug } = await params;
    const session = await auth();

    if (!session?.user) redirect("/auth/login");

    const category = await prisma.challengeCategory.findUnique({
        where: { slug: categorySlug },
        include: {
            challenges: {
                where: { isPublished: true },
                orderBy: { orderIndex: 'asc' },
                include: {
                    submissions: {
                        where: { userId: session.user.id },
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                }
            }
        }
    });

    if (!category) notFound();

    // Calculate Stats
    const totalQuestions = category.challenges.length;
    const answeredQuestions = category.challenges.filter(c => c.submissions.length > 0).length;
    const passedQuestions = category.challenges.filter(c => 
        c.submissions.length > 0 && c.submissions[0].status === "PASSED"
    ).length;
    const failedQuestions = answeredQuestions - passedQuestions;
    const unattemptedQuestions = totalQuestions - answeredQuestions;
    
    const accuracy = totalQuestions > 0 ? Math.round((passedQuestions / totalQuestions) * 100) : 0;

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-24 pb-16 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between mb-8">
                    <Link 
                        href="/challenges"
                        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors font-bold text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Challenges
                    </Link>
                    <div className="px-4 py-1.5 bg-zinc-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                        Assessment Report
                    </div>
                </div>

                {/* Score Card Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Main Score Card */}
                    <div className="md:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-sm border border-zinc-100 flex flex-col md:flex-row items-center gap-10">
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    fill="transparent"
                                    stroke="#f1f5f9"
                                    strokeWidth="12"
                                />
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    fill="transparent"
                                    stroke={accuracy > 70 ? "#10b981" : accuracy > 40 ? "#f59e0b" : "#ef4444"}
                                    strokeWidth="12"
                                    strokeDasharray={440}
                                    strokeDashoffset={440 - (440 * accuracy) / 100}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black tracking-tighter">{accuracy}%</span>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Accuracy</span>
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-3xl font-black mb-2 tracking-tight">
                                {accuracy >= 80 ? "Outstanding Performance!" : accuracy >= 50 ? "Well Done!" : "Keep Practicing!"}
                            </h2>
                            <p className="text-zinc-500 font-medium leading-relaxed">
                                You completed the <span className="text-zinc-900 font-bold">{category.title}</span> exam. Review your performance breakdown below.
                            </p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <Target className="w-4 h-4 text-zinc-400" />
                                    <span className="text-sm font-bold">{passedQuestions}/{totalQuestions} Correct</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <Clock className="w-4 h-4 text-zinc-400" />
                                    <span className="text-sm font-bold">Exam Mode</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="bg-zinc-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-xl shadow-zinc-200">
                        <BarChart3 className="w-8 h-8 text-blue-400 mb-6" />
                        <div>
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center justify-between text-sm font-bold uppercase tracking-widest text-zinc-400">
                                    <span>Correct</span>
                                    <span className="text-green-400">{passedQuestions}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm font-bold uppercase tracking-widest text-zinc-400">
                                    <span>Incorrect</span>
                                    <span className="text-red-400">{failedQuestions}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm font-bold uppercase tracking-widest text-zinc-400">
                                    <span>Skipped</span>
                                    <span className="text-zinc-500">{unattemptedQuestions}</span>
                                </div>
                            </div>
                            <Link 
                                href={`/challenges/${categorySlug}`}
                                className="w-full py-4 bg-white text-zinc-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-zinc-100 transition-all uppercase tracking-widest"
                            >
                                Re-Attempt <ChevronRight className="w-4 h-4" />
                            </Link>
                            <div className="mt-3">
                                <ResetProgressButton 
                                    categorySlug={categorySlug} 
                                    variant="danger" 
                                    label="Reset & Clear Record" 
                                    redirectTo={`/challenges/${categorySlug}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Question Breakdown */}
                <h3 className="text-xl font-black mb-6 px-2 flex items-center gap-3">
                     <Award className="w-5 h-5 text-amber-500" />
                     Question Breakdown
                </h3>
                <div className="grid grid-cols-1 gap-3">
                    {category.challenges.map((ch, idx) => {
                        const submission = ch.submissions[0];
                        const isCorrect = submission?.status === "PASSED";
                        const isAttempted = !!submission;

                        return (
                            <div 
                                key={ch.id}
                                className="group bg-white hover:bg-zinc-50 border border-zinc-100 rounded-3xl p-5 flex items-center justify-between transition-all"
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm border-2 ${
                                        !isAttempted ? "bg-zinc-50 text-zinc-300 border-zinc-100" :
                                        isCorrect ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"
                                    }`}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-zinc-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-sm">
                                            {ch.title}
                                        </h4>
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                                            {ch.questionType.replace("_", " ")}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {!isAttempted ? (
                                        <div className="flex items-center gap-2 px-4 py-1.5 bg-zinc-50 text-zinc-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            Skipped
                                        </div>
                                    ) : isCorrect ? (
                                        <div className="flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                                        </div>
                                    )}
                                    <Link 
                                        href={`/challenges/${categorySlug}/${ch.slug}`}
                                        className="w-10 h-10 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all shadow-sm"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
