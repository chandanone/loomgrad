"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Check } from "lucide-react";

interface FancyConfirmProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: "warning" | "danger" | "info";
}

export function FancyConfirm({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "warning"
}: FancyConfirmProps) {
    if (!isOpen) return null;

    const colors = {
        warning: "bg-amber-500",
        danger: "bg-red-500",
        info: "bg-blue-500"
    };

    const textColors = {
        warning: "text-amber-500",
        danger: "text-red-500",
        info: "text-blue-500"
    };

    const borderColors = {
        warning: "border-amber-100",
        danger: "border-red-100",
        info: "border-blue-100"
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-zinc-100"
                >
                    <div className="p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`p-3 rounded-2xl ${colors[type]} bg-opacity-10 ${textColors[type]}`}>
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight text-zinc-900">{title}</h3>
                        </div>

                        <p className="text-zinc-500 font-medium leading-relaxed mb-8">
                            {message}
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={onCancel}
                                className="flex-1 py-4 px-6 rounded-2xl bg-zinc-50 text-zinc-500 font-black text-sm uppercase tracking-widest hover:bg-zinc-100 transition-all active:scale-95"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`flex-1 py-4 px-6 rounded-2xl text-white font-black text-sm uppercase tracking-widest ${colors[type]} hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-${type}-200 flex items-center justify-center gap-2`}
                            >
                                <Check className="w-4 h-4" />
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
