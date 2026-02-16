"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Menu,
    X,
    PlayCircle,
    CheckCircle2,
    Lock,
    ChevronRight,
    BookOpen,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";

interface SidebarProps {
    modules: any[];
    isSubscribed: boolean;
}

export default function CourseSidebar({ modules, isSubscribed }: SidebarProps) {
    const [isOpen, setIsOpen] = useState(true);
    const pathname = usePathname();
    const params = useParams();

    return (
        <>
            {/* Toggle Button — visible on all screens */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-20 left-4 z-30 p-2 bg-white/80 backdrop-blur-sm border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors shadow-lg"
                title={isOpen ? "Hide sidebar" : "Show sidebar"}
            >
                {isOpen ? (
                    <PanelLeftClose className="w-5 h-5 text-zinc-500" />
                ) : (
                    <PanelLeftOpen className="w-5 h-5 text-zinc-500" />
                )}
            </button>

            {/* Backdrop on mobile when sidebar is open */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/5 z-30 lg:hidden"
                        style={{ top: "64px" }} // Respect navbar height
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.aside
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-y-0 left-0 z-20 w-72 bg-zinc-50 border-r border-zinc-100 overflow-y-auto pt-4 shadow-sm"
                        style={{ top: "64px" }} // Start below navbar
                    >
                        <nav className="p-4 space-y-8">
                            {modules.map((module) => (
                                <div key={module.id}>
                                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2 mb-4">
                                        {module.title}
                                    </h3>
                                    <div className="space-y-1">
                                        {module.lessons.map((lesson: any) => {
                                            const isActive = pathname.includes(lesson.slug);
                                            const isLocked = !lesson.isFree && !isSubscribed;

                                            return (
                                                <Link
                                                    key={lesson.id}
                                                    href={`/courses/${params.courseSlug}/lessons/${lesson.slug}`}
                                                    className={`
                            group flex items-center justify-between p-3 rounded-xl transition-all
                            ${isActive ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-zinc-200/50 text-zinc-500 hover:text-zinc-900'}
                          `}
                                                >
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        {isActive ? (
                                                            <PlayCircle className="w-4 h-4 flex-shrink-0" />
                                                        ) : (
                                                            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-zinc-300" />
                                                        )}
                                                        <span className="text-sm font-medium truncate">{lesson.title}</span>
                                                    </div>
                                                    {isLocked && <Lock className={`w-3.5 h-3.5 ${isActive ? 'text-white/70' : 'text-zinc-300'}`} />}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </nav>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Spacer — pushes main content on desktop when sidebar is open */}
            {isOpen && (
                <div className="hidden lg:block w-72 shrink-0" />
            )}
        </>
    );
}
