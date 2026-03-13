"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Timer, Zap } from "lucide-react";

export function InstructionConfig({
    categorySlug,
    firstChallengeSlug,
    assessmentMode,
    userName
}: {
    categorySlug: string;
    firstChallengeSlug: string;
    assessmentMode: string;
    userName?: string | null;
}) {
    const [timerLevel, setTimerLevel] = useState<"Easy" | "Moderate" | "Advance" | "None">("None");

    const timerDuration = {
        "Easy": 30,
        "Moderate": 20,
        "Advance": 10,
        "None": 0
    };

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-blue-50/50 border border-blue-100 rounded-[2.5rem]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-600 text-white rounded-xl">
                            <Zap className="w-5 h-5" />
                        </div>
                        <h3 className="font-black text-lg">Result Settings</h3>
                    </div>
                    <p className="text-sm text-zinc-600 mb-6 font-medium">
                        {assessmentMode === "EXAM"
                            ? "This set is in Exam Mode. Results will be shown after your final submission."
                            : "This set is in Practice Mode. You will get instant feedback after every attempt."}
                    </p>
                    <div className="flex items-center gap-3 p-3 bg-white border border-zinc-100 rounded-2xl">
                        <div className="w-4 h-4 rounded-full border-2 border-blue-600 flex items-center justify-center">
                            <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-tight">
                            {assessmentMode === "EXAM" ? "Exam Mode Active" : "Practice Mode Active"}
                        </span>
                    </div>
                </div>

                <div className="p-8 bg-amber-50/50 border border-amber-100 rounded-[2.5rem]">
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

            <div className="flex flex-col items-center">
                <Link
                    href={`/challenges/${categorySlug}/${firstChallengeSlug}${timerLevel !== "None" ? `?timer=${timerLevel}` : ""}`}
                    onClick={() => {
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
                    START CHALLENGE <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
                <p className="text-zinc-400 text-xs font-bold mt-6 uppercase tracking-widest">
                    Good luck, {userName || "Player"}!
                </p>
            </div>
        </div>
    );
}
