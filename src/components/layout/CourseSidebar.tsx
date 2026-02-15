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

interface Lesson {
    id: string;
    title: string;
    slug: string;
    isFree: boolean;
}

interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
}

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
                className="fixed top-20 left-4 z-30 p-2 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors shadow-lg"
                title={isOpen ? "Hide sidebar" : "Show sidebar"}
            >
                {isOpen ? (
                    <PanelLeftClose className="w-5 h-5 text-zinc-400" />
                ) : (
                    <PanelLeftOpen className="w-5 h-5 text-zinc-400" />
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
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
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
                        className="fixed inset-y-0 left-0 z-20 w-72 bg-zinc-950 border-r border-zinc-900 overflow-y-auto pt-4"
                        style={{ top: "64px" }} // Start below navbar
                    >
                        <nav className="p-4 space-y-8">
                            {modules.map((module) => (
                                <div key={module.id}>
                                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-2 mb-4">
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
                            ${isActive ? 'bg-blue-600/10 text-blue-500' : 'hover:bg-zinc-900 text-zinc-400 hover:text-white'}
                          `}
                                                >
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        {isActive ? (
                                                            <PlayCircle className="w-4 h-4 flex-shrink-0" />
                                                        ) : (
                                                            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-zinc-700" />
                                                        )}
                                                        <span className="text-sm font-medium truncate">{lesson.title}</span>
                                                    </div>
                                                    {isLocked && <Lock className="w-3.5 h-3.5 text-zinc-600" />}
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
