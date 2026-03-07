"use client";

import { useState, useEffect } from "react";
import VideoPlayer from "@/components/learning/VideoPlayer";
import CodeEditor from "@/components/learning/CodeEditor";
import Whiteboard from "@/components/learning/Whiteboard";
import Paywall from "@/components/learning/Paywall";
import {
    BookOpen,
    FileText,
    Code2,
    Milestone,
    PanelLeftClose,
    PanelLeftOpen,
    PanelRightClose,
    PanelRightOpen,
    Maximize2,
    Edit3,
} from "lucide-react";

interface LessonWorkspaceProps {
    lesson: {
        title: string;
        description: string | null;
        youtubeVideoId: string;
        starterCode: string | null;
    };
    courseThumbnail: string | null;
    showPaywall: boolean;
    isLoggedIn?: boolean;
    courseOffersTrial?: boolean;
    hasSandbox?: boolean;
    hasWhiteboard?: boolean;
}

export default function LessonWorkspace({
    lesson,
    courseThumbnail,
    showPaywall,
    isLoggedIn,
    courseOffersTrial,
    hasSandbox = true,
    hasWhiteboard = false
}: LessonWorkspaceProps) {
    const [showContent, setShowContent] = useState(true);
    const [showSandbox, setShowSandbox] = useState(hasSandbox);
    const [showWhiteboard, setShowWhiteboard] = useState(false);

    // Ensure singleton view on mobile initial load
    useEffect(() => {
        const isMobile = window.innerWidth < 1024;
        if (isMobile) {
            if (showContent && (showSandbox || showWhiteboard)) {
                setShowSandbox(false);
                setShowWhiteboard(false);
            }
        }
    }, []);

    const handleToggle = (panel: 'content' | 'sandbox' | 'whiteboard') => {
        const isMobile = window.innerWidth < 1024;

        if (isMobile) {
            // Mandatory singleton on mobile
            if (panel === 'content') {
                setShowContent(true);
                setShowSandbox(false);
                setShowWhiteboard(false);
            } else if (panel === 'sandbox') {
                setShowContent(false);
                setShowSandbox(true);
                setShowWhiteboard(false);
            } else if (panel === 'whiteboard') {
                setShowContent(false);
                setShowSandbox(false);
                setShowWhiteboard(true);
            }
            return;
        }

        // Standard multi-panel logic for desktop
        if (panel === 'content') {
            if (showContent && !showSandbox && !showWhiteboard) return;
            setShowContent(prev => !prev);
        } else if (panel === 'sandbox') {
            const next = !showSandbox;
            setShowSandbox(next);
            if (!next && !showContent && !showWhiteboard) setShowContent(true);
        } else if (panel === 'whiteboard') {
            const next = !showWhiteboard;
            setShowWhiteboard(next);
            if (!next && !showContent && !showSandbox) setShowContent(true);
        }
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Panel Toggle Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-100 bg-zinc-50 shrink-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleToggle('content')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${showContent
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-white text-zinc-500 border border-zinc-200 hover:text-zinc-700"
                            }`}
                    >
                        {showContent ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">Lesson</span>
                    </button>

                    {hasSandbox && (
                        <button
                            onClick={() => handleToggle('sandbox')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${showSandbox
                                ? "bg-purple-600 text-white shadow-sm"
                                : "bg-white text-zinc-500 border border-zinc-200 hover:text-zinc-700"
                                }`}
                        >
                            {showSandbox ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">Sandbox</span>
                        </button>
                    )}

                    {hasWhiteboard && (
                        <button
                            onClick={() => handleToggle('whiteboard')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${showWhiteboard
                                ? "bg-amber-600 text-white shadow-sm"
                                : "bg-white text-zinc-500 border border-zinc-200 hover:text-zinc-700"
                                }`}
                        >
                            {showWhiteboard ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">Whiteboard</span>
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Focus Mode: show only one at a time */}
                    {showContent && (showSandbox || showWhiteboard) && (
                        <>
                            <button
                                onClick={() => { setShowSandbox(false); setShowWhiteboard(false); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-zinc-500 border border-zinc-200 hover:text-zinc-700 transition-all shadow-sm"
                                title="Focus on Lesson"
                            >
                                <Maximize2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Focus Lesson</span>
                            </button>
                            {hasSandbox && (
                                <button
                                    onClick={() => { setShowContent(false); setShowWhiteboard(false); setShowSandbox(true); }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-zinc-500 border border-zinc-200 hover:text-zinc-700 transition-all shadow-sm"
                                    title="Focus on Sandbox"
                                >
                                    <Maximize2 className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Focus Code</span>
                                </button>
                            )}
                            {hasWhiteboard && (
                                <button
                                    onClick={() => { setShowContent(false); setShowSandbox(false); setShowWhiteboard(true); }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-zinc-500 border border-zinc-200 hover:text-zinc-700 transition-all shadow-sm"
                                    title="Focus on Whiteboard"
                                >
                                    <Maximize2 className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Focus Board</span>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Workspace Panels */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

                {/* Left Side: Video & Content */}
                {showContent && (
                    <div
                        className={`flex flex-col overflow-y-auto bg-white transition-all duration-300 ${showSandbox && showWhiteboard ? "lg:w-1/3 lg:border-r" :
                            (showSandbox || showWhiteboard) ? "lg:w-1/2 lg:border-r" : "w-full"
                            } border-zinc-100 ${(showSandbox || showWhiteboard) ? "h-1/2 lg:h-full border-b lg:border-b-0" : ""}`}
                    >
                        <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
                            {/* Media Section */}
                            <div className="relative">
                                {showPaywall ? (
                                    <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 flex items-center justify-center">
                                        <Paywall isLoggedIn={isLoggedIn} courseOffersTrial={courseOffersTrial} />
                                        <img
                                            src={courseThumbnail || ""}
                                            className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-10"
                                            alt="blurred background"
                                        />
                                    </div>
                                ) : (
                                    <VideoPlayer videoId={lesson.youtubeVideoId} />
                                )}
                            </div>

                            {/* Lesson Info */}
                            <div>
                                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-2">
                                    <Milestone className="w-4 h-4" />
                                    Lesson Module
                                </div>
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 text-zinc-900">{lesson.title}</h1>

                                <div className="flex gap-4 mb-6 lg:mb-8 border-b border-zinc-100">
                                    <button className="pb-3 lg:pb-4 text-sm font-bold border-b-2 border-blue-600 text-zinc-900 flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Notes
                                    </button>
                                    <button className="pb-3 lg:pb-4 text-sm font-bold text-zinc-400 hover:text-zinc-600 transition-colors flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" /> Resources
                                    </button>
                                </div>

                                <div className="prose prose-zinc max-w-none prose-p:text-zinc-600 prose-headings:text-zinc-900 prose-sm lg:prose-base">
                                    {lesson.description || "No specific instructions for this lesson. Watch the video and follow along in the practice editor."}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Center/Right Side: Code Editor */}
                {hasSandbox && showSandbox && (
                    <div
                        className={`flex flex-col transition-all duration-300 ${showContent && showWhiteboard ? "lg:w-1/3" :
                            (showContent || showWhiteboard) ? "lg:w-1/2" : "w-full"
                            } ${showContent || showWhiteboard ? "h-1/2 lg:h-full lg:border-r border-zinc-100" : "h-full"} bg-zinc-50`}
                    >
                        <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
                            <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-widest mb-3 lg:mb-4">
                                <Code2 className="w-4 h-4" />
                                Practice Sandbox
                            </div>
                            <div className="flex-1 bg-zinc-900 rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl border border-zinc-800 min-h-0">
                                <CodeEditor
                                    initialCode={lesson.starterCode || `// Practice: ${lesson.title}\n\nfunction solution() {\n  // Type your code here\n}\n`}
                                    language="javascript"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Right Side: Whiteboard */}
                {hasWhiteboard && showWhiteboard && (
                    <div
                        className={`flex flex-col transition-all duration-300 ${showContent && showSandbox ? "lg:w-1/3" :
                            (showContent || showSandbox) ? "lg:w-1/2" : "w-full"
                            } ${showContent || showSandbox ? "h-1/2 lg:h-full" : "h-full"} bg-zinc-50`}
                    >
                        <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
                            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-widest mb-3 lg:mb-4">
                                <Edit3 className="w-4 h-4" />
                                Visual Whiteboard
                            </div>
                            <div className="flex-1 bg-white rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl border border-zinc-200 min-h-0">
                                <Whiteboard />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
