
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
    LayoutDashboard
} from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    // Close menu when pathname changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

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
        <nav className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-xl border-b border-zinc-200 transition-all duration-300">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-blue-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tighter text-zinc-900">
                            Loom<span className="text-blue-500">Grad</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-medium transition-colors ${pathname === link.href
                                    ? "text-blue-600"
                                    : "text-zinc-500 hover:text-blue-600"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {session ? (
                        <div className="hidden md:flex items-center gap-4">
                            {session.user?.role === "ADMIN" && (
                                <div className="relative group/admin">
                                    <button className="flex items-center gap-2 bg-zinc-100 text-zinc-600 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-bold hover:bg-zinc-200 transition-all">
                                        <ShieldCheck className="w-4 h-4 text-blue-500" />
                                        ADMIN
                                    </button>

                                    {/* Admin Dropdown */}
                                    <div className="absolute top-full right-0 pt-2 w-48 opacity-0 translate-y-2 pointer-events-none group-hover/admin:opacity-100 group-hover/admin:translate-y-0 group-hover/admin:pointer-events-auto transition-all z-50">
                                        <div className="bg-white border border-zinc-200 rounded-xl shadow-2xl overflow-hidden">
                                            <div className="p-2 space-y-1">
                                                {adminLinks.map((link) => (
                                                    <Link
                                                        key={link.href}
                                                        href={link.href}
                                                        className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-blue-600 rounded-lg transition-colors"
                                                    >
                                                        <link.icon className="w-4 h-4" />
                                                        {link.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="h-4 w-px bg-zinc-200 mx-1" />

                            <Link href="/profile" className="hover:scale-110 transition-transform">
                                {session.user?.image ? (
                                    <img
                                        src={session.user.image}
                                        className="w-9 h-9 rounded-full border border-zinc-200 hover:border-blue-500 transition-colors"
                                        alt="profile"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full border border-zinc-200 bg-zinc-100 flex items-center justify-center group/profile hover:border-blue-500 transition-colors">
                                        <User className="w-5 h-5 text-zinc-500 group-hover/profile:text-blue-500" />
                                    </div>
                                )}
                            </Link>
                            <button
                                onClick={() => signOut()}
                                className="p-2.5 hover:bg-red-50 rounded-xl text-zinc-500 hover:text-red-500 transition-all active:scale-95"
                                title="Sign Out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/auth/signin"
                            className="hidden md:flex bg-blue-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-blue-600/20"
                        >
                            Sign In
                        </Link>
                    )}

                    {/* Mobile Menu Toggle (Always Visible on Mobile) */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2.5 rounded-xl hover:bg-zinc-100 text-zinc-600 transition-all"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden animate-in fade-in duration-300"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={`fixed top-0 bottom-0 right-0 w-[280px] bg-white z-[70] md:hidden border-l border-zinc-200 shadow-2xl transition-transform duration-300 ease-out transform ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="flex flex-col h-full">
                    <div className="p-6 flex items-center justify-between border-b border-zinc-200">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-blue-600 p-1 rounded-lg">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-lg">LoomGrad</span>
                        </Link>
                        <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full hover:bg-zinc-100">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
                        {/* Session User Info */}
                        {session && (
                            <div className="flex items-center gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                                <div className="shrink-0">
                                    {session.user?.image ? (
                                        <img src={session.user.image} className="w-12 h-12 rounded-full border-2 border-white" alt="" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl uppercase">
                                            {session.user?.name?.[0] || <User />}
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-zinc-900 truncate">{session.user?.name}</p>
                                    <p className="text-xs text-zinc-500 truncate">{session.user?.email}</p>
                                </div>
                            </div>
                        )}

                        {/* Main Links */}
                        <div className="space-y-1 text-sm">
                            <p className="text-[10px] font-bold text-zinc-400 px-2 uppercase tracking-widest mb-4">Navigation</p>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === link.href
                                        ? "bg-blue-500/10 text-blue-600 font-bold"
                                        : "text-zinc-600 hover:bg-zinc-50"
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {/* Admin Links (Mobile) */}
                        {session?.user?.role === "ADMIN" && (
                            <div className="space-y-1 text-sm">
                                <p className="text-[10px] font-bold text-blue-500 px-2 uppercase tracking-widest mb-4">Administrative</p>
                                {adminLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === link.href
                                            ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20"
                                            : "text-zinc-600 hover:bg-zinc-50"
                                            }`}
                                    >
                                        <link.icon className="w-5 h-5 flex-shrink-0" />
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-zinc-200">
                        {session ? (
                            <button
                                onClick={() => signOut()}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl font-bold transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </button>
                        ) : (
                            <Link
                                href="/auth/signin"
                                className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
