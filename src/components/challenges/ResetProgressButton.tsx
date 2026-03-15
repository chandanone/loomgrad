"use client";

import { useTransition } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { resetCategorySubmissions } from "@/actions/challenges";
import { useRouter } from "next/navigation";
import { useFancyConfirm } from "../ui/ConfirmProvider";

interface ResetProgressButtonProps {
    categorySlug: string;
    variant?: "outline" | "ghost" | "danger" | "minimal";
    label?: string;
    redirectTo?: string;
}

export function ResetProgressButton({ 
    categorySlug, 
    variant = "outline", 
    label = "Reset Progress",
    redirectTo
}: ResetProgressButtonProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { confirm: fancyConfirm } = useFancyConfirm();

    const handleReset = async () => {
        const ok = await fancyConfirm({
            title: "Clear All Records?",
            message: "Are you sure you want to clear ALL your previous attempts and records for this challenge? This action cannot be undone.",
            type: "danger"
        });

        if (ok) {
            startTransition(async () => {
                await resetCategorySubmissions(categorySlug);
                if (redirectTo) {
                    router.push(redirectTo);
                } else {
                    router.refresh();
                    window.location.reload(); // Hard reload to clear local states
                }
            });
        }
    };

    if (variant === "minimal") {
        return (
            <button
                onClick={handleReset}
                disabled={isPending}
                className="text-red-600 font-bold hover:underline py-2 text-sm flex items-center gap-2"
            >
                <RotateCcw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
                {label}
            </button>
        );
    }

    if (variant === "danger") {
        return (
            <button
                onClick={handleReset}
                disabled={isPending}
                className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-all uppercase tracking-widest border border-red-100"
            >
                <Trash2 className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
                {label}
            </button>
        );
    }

    return (
        <button
            onClick={handleReset}
            disabled={isPending}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all active:scale-95 ${
                variant === "outline" 
                ? "bg-white text-red-600 border-2 border-red-100 hover:border-red-600" 
                : "text-zinc-500 hover:text-red-600"
            }`}
        >
            <RotateCcw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
            {label}
        </button>
    );
}
