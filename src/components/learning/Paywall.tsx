"use client";

import { motion } from "framer-motion";
import { Lock, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Paywall() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-20 flex items-center justify-center p-6 backdrop-blur-xl bg-black/60 rounded-2xl border border-blue-500/20"
        >
            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl p-8" />

                <div className="relative z-10 text-center">
                    <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
                        <Lock className="w-8 h-8 text-blue-500" />
                    </div>

                    <h2 className="text-3xl font-bold mb-4 tracking-tight">Unlock Your Potential</h2>
                    <p className="text-zinc-400 mb-8 leading-relaxed">
                        This lesson is part of our premium content. Join LoomGrad Pro to access all courses, interactive labs, and certifications.
                    </p>

                    <div className="space-y-4 mb-8 text-left">
                        <div className="flex items-center gap-3 text-sm text-zinc-300">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span>Full access to 50+ masterclasses</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-zinc-300">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span>Interactive coding environments</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-zinc-300">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span>Official technical certifications</span>
                        </div>
                    </div>

                    <Link
                        href="/billing"
                        className="group block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <Zap className="w-5 h-5 fill-current" />
                            Unlock All Courses
                        </span>
                    </Link>

                    <p className="mt-4 text-[11px] text-zinc-500 uppercase tracking-widest font-bold">
                        Starting at $19/mo. Cancel anytime.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
