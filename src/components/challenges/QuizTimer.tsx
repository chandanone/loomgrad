"use client";

import { useState, useEffect } from "react";
import { Timer } from "lucide-react";

export function QuizTimer({
    categorySlug,
    initialTimerLevel,
    onTimeUp
}: {
    categorySlug: string;
    initialTimerLevel?: string;
    onTimeUp?: () => void;
}) {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    const startTimer = (level: "Easy" | "Moderate" | "Advance") => {
        const minutes = level === "Easy" ? 30 : level === "Moderate" ? 20 : 10;
        const duration = minutes * 60;
        const expiry = Date.now() + (duration * 1000);

        localStorage.setItem(`timer_${categorySlug}`, JSON.stringify({ expiry, level }));

        setTimeLeft(duration);
        setIsTimerRunning(true);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (isTimerRunning && timeLeft !== null && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => (prev !== null ? prev - 1 : 0)), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            setIsTimerRunning(false);
            if (onTimeUp) onTimeUp();
        }
    }, [isTimerRunning, timeLeft]);

    useEffect(() => {
        if (!categorySlug) return;

        const storageKey = `timer_${categorySlug}`;
        const stored = localStorage.getItem(storageKey);

        if (stored) {
            const { expiry } = JSON.parse(stored);
            const remaining = Math.floor((expiry - Date.now()) / 1000);
            if (remaining > 0) {
                setTimeLeft(remaining);
                setIsTimerRunning(true);
            } else {
                setTimeLeft(0);
                setIsTimerRunning(false);
            }
        } else if (initialTimerLevel && (initialTimerLevel === "Easy" || initialTimerLevel === "Moderate" || initialTimerLevel === "Advance")) {
            startTimer(initialTimerLevel as any);
        }
    }, [initialTimerLevel, categorySlug]);

    if (timeLeft === null) return null;

    return (
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black border transition-all ${timeLeft < 60
                ? "bg-red-500 text-white border-red-600 animate-pulse"
                : "bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-100"
            }`}>
            <Timer className="w-4 h-4" /> {formatTime(timeLeft)}
        </div>
    );
}
