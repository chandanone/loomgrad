
"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
    BookOpen,
    User,
    LogOut,
    ShieldCheck,
    Menu,
    X,
    Youtube,
    Settings,
    LayoutDashboard,
    ChevronRight,
    ArrowRight
} from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    // Close menu when pathname changes
    useEffect(() => {
        setIsMenuOpen(false);
        if (typeof window !== 'undefined') {
            document.body.style.overflow = 'unset';
        }
    }, [pathname]);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMenuOpen]);

    const navLinks = [
        { name: "Courses", href: "/courses" },
        { name: "Challenges", href: "/challenges" },
        { name: "Pricing", href: "/pricing" },
    ];

    const adminLinks = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Manage Courses", href: "/admin/courses", icon: BookOpen },
        { name: "Import YouTube", href: "/admin/import", icon: Youtube },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ];

    return (
        <>
            <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200/50 shadow-sm">
                <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4 md:gap-8">
                        <Link href="/" className="flex items-center gap-2 group shrink-0">
                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-extrabold text-xl tracking-tight text-zinc-900">
                                Loom<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">Grad</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${pathname === link.href
                                        ? "text-blue-600 bg-blue-50"
                                        : "text-zinc-600 hover:text-blue-600 hover:bg-zinc-50"
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {session ? (
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="hidden md:flex items-center gap-4">
                                    {session.user?.role === "ADMIN" && (
                                        <div className="relative group/admin">
                                            <button className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10">
                                                <ShieldCheck className="w-4 h-4 text-blue-400" />
                                                ADMIN
                                            </button>

                                            {/* Admin Dropdown */}
                                            <div className="absolute top-full right-0 pt-2 w-56 opacity-0 translate-y-2 pointer-events-none group-hover/admin:opacity-100 group-hover/admin:translate-y-0 group-hover/admin:pointer-events-auto transition-all z-50">
                                                <div className="bg-white border border-zinc-200 rounded-2xl shadow-xl overflow-hidden p-2">
                                                    <div className="px-3 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Control Panel</div>
                                                    {adminLinks.map((link) => (
                                                        <Link
                                                            key={link.href}
                                                            href={link.href}
                                                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                                                        >
                                                            <link.icon className="w-4 h-4" />
                                                            {link.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="h-6 w-px bg-zinc-200 mx-1" />

                                    <Link href="/profile" className="hover:scale-105 transition-transform">
                                        {session.user?.image ? (
                                            <div className="relative p-0.5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500">
                                                <img
                                                    src={session.user.image}
                                                    className="w-9 h-9 rounded-full border-2 border-white"
                                                    alt="profile"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full border border-zinc-200 bg-white flex items-center justify-center group/profile hover:border-blue-500 transition-colors shadow-sm">
                                                <User className="w-5 h-5 text-zinc-500 group-hover/profile:text-blue-500" />
                                            </div>
                                        )}
                                    </Link>
                                    <button
                                        onClick={() => signOut()}
                                        className="p-2.5 hover:bg-red-50 rounded-xl text-zinc-500 hover:text-red-500 transition-all group"
                                        title="Sign Out"
                                    >
                                        <LogOut className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>

                                {/* Mobile Profile Icon (Directly in Navbar) */}
                                <Link href="/profile" className="md:hidden hover:scale-105 transition-transform">
                                    {session.user?.image ? (
                                        <img
                                            src={session.user.image}
                                            className="w-9 h-9 rounded-full border border-zinc-200"
                                            alt="profile"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full border border-zinc-200 bg-white flex items-center justify-center shadow-sm">
                                            <User className="w-5 h-5 text-zinc-500" />
                                        </div>
                                    )}
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 md:gap-4">
                                <Link
                                    href="/auth/signin"
                                    className="hidden md:block text-sm font-semibold text-zinc-600 hover:text-blue-600 px-4 py-2 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/auth/signin"
                                    className="bg-blue-600 text-white text-[13px] md:text-sm font-bold px-4 md:px-6 py-2 md:py-2.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                                >
                                    <span className="hidden sm:inline">Join Now</span>
                                    <span className="sm:hidden">Join</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 transition-all active:scale-90"
                            aria-label="Toggle Menu"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Portal-like Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-2 right-2 bottom-2 w-[calc(100%-1rem)] max-w-sm bg-white z-[70] md:hidden rounded-3xl shadow-2xl overflow-hidden border border-zinc-100 flex flex-col"
                        >
                            {/* Mobile Menu Header */}
                            <div className="p-6 flex items-center justify-between border-b border-zinc-100">
                                <div className="flex items-center gap-2">
                                    <div className="bg-blue-600 p-1.5 rounded-lg">
                                        <BookOpen className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="font-extrabold text-lg text-zinc-900">LoomGrad</span>
                                </div>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2.5 rounded-xl bg-zinc-50 text-zinc-500 hover:text-zinc-900 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                {/* Profile Section */}
                                {session && (
                                    <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-50 to-white border border-zinc-100 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            {session.user?.image ? (
                                                <img src={session.user.image} className="w-14 h-14 rounded-full border-2 border-white shadow-md" alt="" />
                                            ) : (
                                                <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl ring-4 ring-blue-50">
                                                    {session.user?.name?.[0]?.toUpperCase() || <User />}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-zinc-900 truncate text-lg leading-tight">{session.user?.name}</h4>
                                                <p className="text-zinc-500 text-sm truncate">{session.user?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Main Navigation */}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] px-2 mb-4">Navigations</p>
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${pathname === link.href
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 font-bold"
                                                : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100 font-medium"
                                                }`}
                                        >
                                            <span className="text-base">{link.name}</span>
                                            <ChevronRight className={`w-5 h-5 ${pathname === link.href ? "text-white" : "text-zinc-300"}`} />
                                        </Link>
                                    ))}
                                </div>

                                {/* Admin Section */}
                                {session?.user?.role === "ADMIN" && (
                                    <div className="space-y-2 border-t border-zinc-100 pt-8">
                                        <div className="flex items-center gap-2 px-2 mb-4">
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Administration</p>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {adminLinks.map((link) => (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${pathname === link.href
                                                        ? "bg-zinc-900 text-white font-bold shadow-lg"
                                                        : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                                                        }`}
                                                >
                                                    <link.icon className={`w-5 h-5 ${pathname === link.href ? "text-blue-400" : "text-zinc-400"}`} />
                                                    <span className="text-base">{link.name}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Mobile Footer */}
                            <div className="p-6 border-t border-zinc-100 bg-zinc-50/50">
                                {session ? (
                                    <button
                                        onClick={() => signOut()}
                                        className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-zinc-100 text-red-500 rounded-2xl font-bold transition-all shadow-sm active:scale-95"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Sign Out
                                    </button>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        <Link
                                            href="/auth/signin"
                                            className="flex items-center justify-center py-4 bg-white border border-zinc-100 text-zinc-900 rounded-2xl font-bold transition-all shadow-sm"
                                        >
                                            Log In
                                        </Link>
                                        <Link
                                            href="/auth/signin"
                                            className="flex items-center justify-center py-4 bg-blue-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20"
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
