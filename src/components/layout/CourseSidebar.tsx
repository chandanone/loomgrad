"use client";

import { useState, useEffect } from "react";
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

    // Responsive behavior: Close sidebar on mobile when navigating
    useEffect(() => {
        const checkMobile = () => {
            if (window.innerWidth < 1024) {
                setIsOpen(false);
            }
        };

        checkMobile();
        // Also close when pathname changes (user clicked a lesson)
        if (window.innerWidth < 1024) {
            setIsOpen(false);
        }
    }, [pathname]);

    return (
        <>
            {/* Toggle Button — repositioned to header area to avoid overlap */}
            <motion.button
                initial={false}
                animate={{
                    left: isOpen ? "18.5rem" : "0rem",
                }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    fixed top-[4.7rem] md:top-[5.7rem] z-[50] 
                    flex items-center gap-1.5 p-1.5 md:p-2
                    bg-white/95 backdrop-blur-xl 
                    border border-zinc-200/50 
                    rounded-r-xl shadow-[4px_0_24px_rgba(0,0,0,0.08)] 
                    hover:shadow-[4px_0_32px_rgba(0,0,0,0.12)] 
                    transition-all group border-l-0
                `}
                title={isOpen ? "Hide syllabus" : "Show syllabus"}
            >
                <div className="relative w-4 h-4 md:w-5 md:h-5">
                    <motion.div
                        animate={{
                            rotate: isOpen ? 0 : 180,
                            opacity: isOpen ? 1 : 0,
                            scale: isOpen ? 1 : 0.5
                        }}
                        className="absolute inset-0 flex items-center justify-center text-zinc-400"
                    >
                        <PanelLeftClose className="w-5 h-5 group-hover:text-zinc-900 transition-colors" />
                    </motion.div>
                    <motion.div
                        animate={{
                            rotate: isOpen ? -180 : 0,
                            opacity: isOpen ? 0 : 1,
                            scale: isOpen ? 0.5 : 1
                        }}
                        className="absolute inset-0 flex items-center justify-center text-blue-600"
                    >
                        <PanelLeftOpen className="w-4 h-4 md:w-5 md:h-5" />
                    </motion.div>
                </div>

                <AnimatePresence mode="wait">
                    {!isOpen && (
                        <motion.span
                            initial={{ width: 0, opacity: 0, x: -10 }}
                            animate={{ width: "auto", opacity: 1, x: 0 }}
                            exit={{ width: 0, opacity: 0, x: -10 }}
                            className="text-[9px] md:text-[10px] font-bold text-zinc-600 uppercase tracking-widest overflow-hidden whitespace-nowrap pr-2"
                        >
                            Syllabus
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Backdrop on mobile when sidebar is open */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
                        style={{ top: "var(--navbar-height, 64px)" }} // Respect navbar height
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.aside
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-zinc-100 overflow-y-auto pt-6 shadow-2xl lg:shadow-none"
                        style={{ top: "var(--navbar-height, 64px)" }} // Start below navbar
                    >
                        <div className="px-6 mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-zinc-900">Course Syllabus</h2>
                                <p className="text-xs text-zinc-500 mt-0.5">Track your progress</p>
                            </div>
                        </div>
                        <nav className="px-4 pb-12 space-y-8">
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
                            group flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200
                            ${isActive
                                                            ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]'
                                                            : 'hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900'}
                          `}
                                                >
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className={`
                                                            w-8 h-8 rounded-xl flex items-center justify-center transition-colors
                                                            ${isActive ? 'bg-white/20' : 'bg-zinc-100 group-hover:bg-white'}
                                                        `}>
                                                            {isActive ? (
                                                                <PlayCircle className="w-4 h-4 flex-shrink-0" />
                                                            ) : (
                                                                <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${lesson.isCompleted ? 'text-green-500' : 'text-zinc-400'}`} />
                                                            )}
                                                        </div>
                                                        <span className={`text-[13px] font-semibold truncate ${isActive ? 'text-white' : 'text-zinc-700'}`}>
                                                            {lesson.title}
                                                        </span>
                                                    </div>
                                                    {isLocked && (
                                                        <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20' : 'bg-zinc-50'}`}>
                                                            <Lock className={`w-3 h-3 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                                                        </div>
                                                    )}
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
                <div className="hidden lg:block w-80 shrink-0" />
            )}
        </>
    );
}
