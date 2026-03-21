"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { BookOpen, User as UserIcon, Mail, Lock, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { register } from "@/actions/auth";

function SignUpPageContent() {
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl");

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            if (callbackUrl) {
                router.push(callbackUrl);
            } else {
                router.push("/");
            }
        }
    }, [session, status, router, callbackUrl]);

    if (status === "loading" || status === "authenticated") {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    <p className="text-zinc-500 font-medium animate-pulse">Initializing session...</p>
                </div>
            </div>
        );
    }

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
                router.push("/auth/signin" + (callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""));
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white">
            <div className="w-full max-w-md">
                <div className="text-center mb-10 transition-all duration-700 animate-in fade-in slide-in-from-bottom-4">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                        <div className="bg-blue-600 p-2 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-blue-600/20">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-2xl tracking-tighter text-zinc-900">
                            Loom<span className="text-blue-600">Grad</span>
                        </span>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Create Account</h1>
                    <p className="text-zinc-500">Join the elite community of developers.</p>
                </div>

                <div className="bg-white border border-zinc-200 p-8 rounded-3xl shadow-xl transition-all duration-700 animate-in fade-in slide-in-from-bottom-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-red-600 text-sm animate-in fade-in zoom-in">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-600 ml-1">Full Name</label>
                            <div className="relative group">
                                <UserIcon className="absolute left-4 top-3.5 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    required
                                    name="name"
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full bg-white border border-zinc-200 rounded-2xl py-3.5 pl-11 pr-4 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-600 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-600 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    required
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="w-full bg-white border border-zinc-200 rounded-2xl py-3.5 pl-11 pr-4 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-600 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-600 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    required
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-white border border-zinc-200 rounded-2xl py-3.5 pl-11 pr-4 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-600 transition-all"
                                />
                            </div>
                            <p className="text-[10px] text-zinc-400 ml-1">Minimum 8 characters with at least one number.</p>
                        </div>

                        <button
                            disabled={isLoading}
                            type="submit"
                            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50"
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

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest text-zinc-400">
                            <span className="bg-white px-4">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <button
                            onClick={() => signIn("google")}
                            className="bg-zinc-50 border border-zinc-200 text-zinc-900 font-medium py-3.5 rounded-2xl hover:bg-zinc-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                    </div>

                    <p className="mt-8 text-center text-sm text-zinc-500">
                        Already have an account?{" "}
                        <Link href={`/auth/signin${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`} className="text-blue-600 font-medium hover:text-blue-700 transition-colors">Sign in</Link>
                    </p>
                </div>

                <p className="mt-8 text-center text-[11px] text-zinc-500 leading-relaxed px-10">
                    By joining, you agree to LoomGrad's{" "}
                    <Link href="#" className="underline">Terms of Service</Link> and{" "}
                    <Link href="#" className="underline">Privacy Policy</Link>.
                </p>
            </div>
        </div>
    );
}

export default function SignUpPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        }>
            <SignUpPageContent />
        </Suspense>
    );
}
