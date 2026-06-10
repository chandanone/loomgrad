"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Timer, Zap } from "lucide-react";
import { ResetProgressButton } from "./ResetProgressButton";

export function InstructionConfig({
    categorySlug,
    firstChallengeSlug,
    assessmentMode,
    userName,
    hasSubmissions,
    lastSubmissionDate
}: {
    categorySlug: string;
    firstChallengeSlug: string;
    assessmentMode: string;
    userName?: string | null;
    hasSubmissions?: boolean;
    lastSubmissionDate?: string | null;
}) {
    const [timerLevel, setTimerLevel] = useState<"Easy" | "Moderate" | "Advance" | "None">("None");
    const pathname = usePathname();

    const timerDuration = {
        "Easy": 30,
        "Moderate": 20,
        "Advance": 10,
        "None": 0
    };

    return (
        <div className="space-y-12">
            <div className="flex justify-center">
                <div className="w-full max-w-lg p-8 bg-amber-50/50 border border-amber-100 rounded-[2.5rem]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-500 text-white rounded-xl">
                            <Timer className="w-5 h-5" />
                        </div>
                        <h3 className="font-black text-lg">Time Management</h3>
                    </div>
                    <p className="text-sm text-zinc-600 mb-6 font-medium">
                        Select a timer level for this session. The timer will start as soon as you begin.
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {["None", "Easy", "Moderate", "Advance"].map(level => (
                            <button
                                key={level}
                                onClick={() => setTimerLevel(level as any)}
                                className={`px-4 py-2 text-xs font-black rounded-xl border transition-all active:scale-95 ${timerLevel === level
                                    ? "bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-200"
                                    : "bg-white text-zinc-600 border-zinc-100 hover:border-amber-400"
                                    }`}
                            >
                                {level === "None" ? "No Timer" : level}
                            </button>
                        ))}
                    </div>
                    {timerLevel !== "None" && (
                        <p className="text-[10px] font-bold text-amber-600 mt-3 uppercase tracking-widest pl-1">
                            Duration: {timerDuration[timerLevel as keyof typeof timerDuration]} Minutes
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center gap-4">
                {!userName ? (
                    <Link
                        href={`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`}
                        className="group flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-full text-lg font-black hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-200"
                    >
                        LOGIN TO START <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </Link>
                ) : (
                    <Link
                        href={`/challenges/${categorySlug}/${firstChallengeSlug}?${new URLSearchParams({
                            ...(timerLevel !== "None" ? { timer: timerLevel } : {}),
                            ...(hasSubmissions ? { reattempt: "true" } : {})
                        }).toString()}`}
                        onClick={() => {
                            // Clear previous markers for fresh run
                            localStorage.removeItem(`visited_${categorySlug}`);
                            localStorage.removeItem(`review_${categorySlug}`);
                            localStorage.removeItem(`session_answered_${categorySlug}`);
                            localStorage.removeItem(`time_taken_${categorySlug}`);
                            localStorage.setItem(`start_time_${categorySlug}`, Date.now().toString());
                            
                            if (timerLevel !== "None") {
                                const minutes = timerLevel === "Easy" ? 30 : timerLevel === "Moderate" ? 20 : 10;
                                const expiry = Date.now() + (minutes * 60 * 1000);
                                localStorage.setItem(`timer_${categorySlug}`, JSON.stringify({ expiry, level: timerLevel }));
                            } else {
                                localStorage.removeItem(`timer_${categorySlug}`);
                            }
                        }}
                        className="group flex items-center gap-3 bg-zinc-900 text-white px-10 py-5 rounded-full text-lg font-black hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-zinc-200"
                    >
                        {hasSubmissions ? "RE-ATTEMPT CHALLENGE" : "START CHALLENGE"} <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </Link>
                )}

                {hasSubmissions && userName && (
                    <div className="flex flex-col items-center gap-2">
                        <Link
                            href={`/challenges/${categorySlug}/result`}
                            className="text-blue-600 font-bold hover:underline py-1 text-sm flex flex-col items-center"
                        >
                            <span>View Previous Result</span>
                            {lastSubmissionDate && (
                                <span suppressHydrationWarning className="text-[10px] text-zinc-400 font-medium">
                                    Last attempt: {new Date(lastSubmissionDate).toLocaleString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            )}
                        </Link>
                        <ResetProgressButton 
                            categorySlug={categorySlug} 
                            variant="minimal" 
                            label="Clear Past Record & Reset" 
                        />
                    </div>
                )}

                <p className="text-zinc-400 text-xs font-bold mt-2 uppercase tracking-widest text-center">
                    {userName ? `Good luck, ${userName}!` : "Please login to track your progress"}
                </p>
            </div>
        </div>
    );
}
