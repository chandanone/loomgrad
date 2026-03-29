"use client";

import { useState, Suspense } from "react";
import { useSession, signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { BookOpen, Github, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

function SignInPageContent() {
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl");

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            if (session.user.role === "ADMIN") {
                router.push("/admin");
            } else if (callbackUrl) {
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
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("Invalid email or password");
                toast.error("Invalid credentials. Please try again.");
                setIsLoading(false);
            } else {
                // Fetch the new session to determine the user's role
                const session = await getSession();

                if (session?.user?.role === "ADMIN") {
                    toast.success("Welcome back, Admin! Redirecting to dashboard...");
                    router.push("/admin");
                } else if (callbackUrl) {
                    toast.success("Signed in successfully!");
                    router.push(callbackUrl);
                } else {
                    toast.success("Signed in successfully!");
                    router.push("/");
                }
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center py-6 px-4 md:pt-16 md:pb-12 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white">
            <div className="w-full max-w-md">
                <div className="bg-white border border-zinc-200 p-6 sm:p-8 rounded-[2rem] shadow-2xl transition-all duration-700 animate-in fade-in slide-in-from-bottom-8">
                    <div className="text-center mb-6 mt-2 md:mt-4">
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Welcome Back</h1>
                        <p className="text-zinc-500 text-sm">Sign in to continue your journey.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <button
                            onClick={() => signIn("google")}
                            className="bg-zinc-50 border border-zinc-200 text-zinc-900 font-medium py-3 rounded-2xl hover:bg-zinc-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
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

                    <div className="relative my-5 md:my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-100"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-zinc-400">
                            <span className="bg-white px-4">Or sign in with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-red-600 text-sm animate-in fade-in zoom-in">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-600 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    placeholder="name@example.com"
                                    className="w-full bg-white border border-zinc-200 rounded-2xl py-2.5 md:py-3 pl-11 pr-4 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-600 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-sm font-medium text-zinc-600">Password</label>
                                <Link href="#" className="text-xs text-blue-600 hover:text-blue-700 transition-colors">Forgot password?</Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    required
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    className="w-full bg-white border border-zinc-200 rounded-2xl py-3 md:py-3.5 pl-11 pr-4 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-600 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            disabled={isLoading}
                            type="submit"
                            className="w-full bg-zinc-900 text-white font-bold py-3.5 rounded-2xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98] shadow-lg shadow-zinc-900/10"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-zinc-500">
                        Don't have an account?{" "}
                        <Link href={`/auth/signup${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`} className="text-blue-600 font-medium hover:text-blue-700 transition-colors">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        }>
            <SignInPageContent />
        </Suspense>
    );
}
