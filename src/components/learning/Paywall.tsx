"use client";

import { motion } from "framer-motion";
import { Lock, Zap, CheckCircle2, LogIn } from "lucide-react";
import Link from "next/link";

interface PaywallProps {
    isLoggedIn?: boolean;
    courseOffersTrial?: boolean;
}

export default function Paywall({ isLoggedIn, courseOffersTrial }: PaywallProps) {
    const showTrialOption = !isLoggedIn && courseOffersTrial;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-20 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xl bg-white/40 rounded-2xl border border-blue-500/10"
        >
            <div className="max-w-md w-full max-h-[95%] overflow-y-auto bg-white border border-zinc-200 p-5 sm:p-8 rounded-3xl shadow-2xl relative">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl" />

                <div className="relative z-10 text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-blue-100">
                        <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                    </div>

                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 tracking-tight text-zinc-900">Unlock Your Potential</h2>
                    <p className="text-zinc-500 mb-6 sm:mb-8 leading-relaxed text-xs sm:text-sm">
                        {showTrialOption
                            ? "Sign in to activate your 30-day free trial or upgrade to Pro for unlimited access to all interactive labs."
                            : "This lesson is part of our premium content. Join LoomGrad Pro to access all courses, interactive labs, and certifications."
                        }
                    </p>

                    <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 text-left">
                        <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-600">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            <span>Full access to 100+ technical courses</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-600">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            <span>Interactive coding environments</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-600">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            <span>Official technical certifications</span>
                        </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                        {showTrialOption && (
                            <Link
                                href="/auth/signin"
                                className="group block w-full bg-white border border-zinc-200 hover:border-blue-500 text-zinc-900 font-bold py-2.5 sm:py-3.5 rounded-xl transition-all active:scale-95 shadow-sm"
                            >
                                <span className="flex items-center justify-center gap-2 text-sm sm:text-base">
                                    <LogIn className="w-4 h-4 text-blue-600" />
                                    30-Day Free Trial
                                </span>
                            </Link>
                        )}

                        <Link
                            href="/pricing"
                            className="group block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 sm:py-3.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-600/20"
                        >
                            <span className="flex items-center justify-center gap-2 text-sm sm:text-base">
                                <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                                Unlock All Courses
                            </span>
                        </Link>
                    </div>

                    <p className="mt-4 sm:mt-6 text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                        Starting at ₹999/mo. Cancel anytime.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
