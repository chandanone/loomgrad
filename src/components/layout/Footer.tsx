"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
    return (
        <footer className="py-20 border-t border-zinc-100 bg-white">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <Link href="/" className="text-3xl font-black text-zinc-900 tracking-tighter">
                            Loom<span className="text-blue-600 underline decoration-4 decoration-blue-100 underline-offset-4">Grad</span>
                        </Link>
                        <p className="text-zinc-500 text-sm font-medium">The evolution of technical learning.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-center md:text-left">
                        <div className="space-y-4">
                            <h4 className="font-black text-sm uppercase tracking-widest text-zinc-400">Platform</h4>
                            <ul className="space-y-3 text-sm font-bold">
                                <li><Link href="/courses" className="hover:text-blue-600 transition-colors">Courses</Link></li>
                                <li><Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link></li>
                                <li><Link href="#" className="hover:text-blue-600 transition-colors">Roadmaps</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-black text-sm uppercase tracking-widest text-zinc-400">Resources</h4>
                            <ul className="space-y-3 text-sm font-bold">
                                <li><Link href="#" className="hover:text-blue-600 transition-colors">Docs</Link></li>
                                <li><Link href="#" className="hover:text-blue-600 transition-colors">Blog</Link></li>
                                <li><Link href="#" className="hover:text-blue-600 transition-colors">Community</Link></li>
                            </ul>
                        </div>
                        <div className="hidden md:block space-y-4">
                            <h4 className="font-black text-sm uppercase tracking-widest text-zinc-400">Social</h4>
                            <ul className="space-y-3 text-sm font-bold">
                                <li><Link href="#" className="hover:text-blue-600 transition-colors">Twitter</Link></li>
                                <li><Link href="#" className="hover:text-blue-600 transition-colors">GitHub</Link></li>
                                <li><Link href="#" className="hover:text-blue-600 transition-colors">Discord</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mt-20 pt-10 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-center md:text-left leading-relaxed">
                            © {new Date().getFullYear()} LoomGrad Technical LMS. <span className="block md:inline mt-1 md:mt-0">All Rights Reserved.</span>
                        </span>
                        <div className="flex items-center gap-2 text-sm font-bold text-zinc-500">
                            Crafted with
                            <div className="relative flex items-center justify-center w-4 h-4">
                                <Heart className="w-4 h-4 text-red-500 hover:scale-110 transition-transform" />
                                <motion.div
                                    animate={{
                                        opacity: [0, 1, 0],
                                        scale: [1, 1.2, 1]
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 2,
                                        times: [0, 0.5, 1],
                                        repeatDelay: 1
                                    }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                                </motion.div>
                            </div>
                            by <span className="text-zinc-900 font-black tracking-tight hover:text-blue-600 transition-colors cursor-pointer">CharuAILabs</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        <Link href="#" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
                        <Link href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-blue-600 transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
