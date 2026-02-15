"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, User as UserIcon, Mail, Lock, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { register } from "@/actions/auth";

export default function SignUpPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        try {
            const res = await register(formData);

            if (res.error) {
                setError(res.error);
                toast.error(res.error);
            } else {
                toast.success("Account created successfully! Please sign in.");
                router.push("/auth/signin");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black">
            <div className="w-full max-w-md">
                <div className="text-center mb-10 transition-all duration-700 animate-in fade-in slide-in-from-bottom-4">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                        <div className="bg-blue-600 p-2 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-blue-600/20">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-2xl tracking-tighter text-white">
                            Loom<span className="text-blue-500">Grad</span>
                        </span>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create Account</h1>
                    <p className="text-zinc-500">Join the elite community of developers.</p>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl shadow-2xl transition-all duration-700 animate-in fade-in slide-in-from-bottom-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500 text-sm animate-in fade-in zoom-in">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400 ml-1">Full Name</label>
                            <div className="relative group">
                                <UserIcon className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    required
                                    name="name"
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    required
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    required
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <p className="text-[10px] text-zinc-600 ml-1">Minimum 8 characters with at least one number.</p>
                        </div>

                        <button
                            disabled={isLoading}
                            type="submit"
                            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-500 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-zinc-500">
                        Already have an account?{" "}
                        <Link href="/auth/signin" className="text-blue-500 font-medium hover:text-blue-400 transition-colors">Sign in</Link>
                    </p>
                </div>

                <p className="mt-8 text-center text-[11px] text-zinc-600 leading-relaxed px-10">
                    By joining, you agree to LoomGrad's{" "}
                    <Link href="#" className="underline">Terms of Service</Link> and{" "}
                    <Link href="#" className="underline">Privacy Policy</Link>.
                </p>
            </div>
        </div>
    );
}
