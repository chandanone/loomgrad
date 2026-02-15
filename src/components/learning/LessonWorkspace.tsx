"use client";

import { useState } from "react";
import VideoPlayer from "@/components/learning/VideoPlayer";
import CodeEditor from "@/components/learning/CodeEditor";
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
}

export default function LessonWorkspace({ lesson, courseThumbnail, showPaywall }: LessonWorkspaceProps) {
    const [showContent, setShowContent] = useState(true);
    const [showSandbox, setShowSandbox] = useState(true);

    const toggleContent = () => {
        // Don't allow hiding if sandbox is already hidden
        if (showContent && !showSandbox) return;
        setShowContent(prev => !prev);
    };

    const toggleSandbox = () => {
        // Don't allow hiding if content is already hidden
        if (showSandbox && !showContent) return;
        setShowSandbox(prev => !prev);
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Panel Toggle Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-900 bg-zinc-950/50 shrink-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleContent}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${showContent
                            ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                            : "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300"
                            }`}
                    >
                        {showContent ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">Lesson</span>
                    </button>

                    <button
                        onClick={toggleSandbox}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${showSandbox
                            ? "bg-purple-600/10 text-purple-400 border border-purple-500/20"
                            : "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300"
                            }`}
                    >
                        {showSandbox ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">Sandbox</span>
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {/* Focus Mode: show only one at a time */}
                    {showContent && showSandbox && (
                        <>
                            <button
                                onClick={() => setShowSandbox(false)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300 transition-all"
                                title="Focus on Lesson"
                            >
                                <Maximize2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Focus Lesson</span>
                            </button>
                            <button
                                onClick={() => setShowContent(false)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300 transition-all"
                                title="Focus on Sandbox"
                            >
                                <Maximize2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Focus Code</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Workspace Panels */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

                {/* Left Side: Video & Content */}
                {showContent && (
                    <div
                        className={`flex flex-col overflow-y-auto bg-zinc-950/30 ${showSandbox ? "lg:w-1/2 lg:border-r border-zinc-900" : "w-full"
                            } ${!showSandbox ? "" : "h-1/2 lg:h-full border-b lg:border-b-0 border-zinc-900"}`}
                    >
                        <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
                            {/* Media Section */}
                            <div className="relative">
                                {showPaywall ? (
                                    <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center">
                                        <Paywall />
                                        <img
                                            src={courseThumbnail || ""}
                                            className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-20"
                                            alt="blurred background"
                                        />
                                    </div>
                                ) : (
                                    <VideoPlayer videoId={lesson.youtubeVideoId} />
                                )}
                            </div>

                            {/* Lesson Info */}
                            <div>
                                <div className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest mb-2">
                                    <Milestone className="w-4 h-4" />
                                    Lesson Module
                                </div>
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4">{lesson.title}</h1>

                                <div className="flex gap-4 mb-6 lg:mb-8 border-b border-zinc-900">
                                    <button className="pb-3 lg:pb-4 text-sm font-bold border-b-2 border-blue-500 text-white flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Notes
                                    </button>
                                    <button className="pb-3 lg:pb-4 text-sm font-bold text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" /> Resources
                                    </button>
                                </div>

                                <div className="prose prose-invert max-w-none prose-p:text-zinc-400 prose-headings:text-white prose-sm lg:prose-base">
                                    {lesson.description || "No specific instructions for this lesson. Watch the video and follow along in the practice editor."}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Right Side: Code Editor */}
                {showSandbox && (
                    <div
                        className={`flex flex-col ${showContent ? "lg:w-1/2" : "w-full"
                            } ${showContent ? "h-1/2 lg:h-full" : "h-full"}`}
                    >
                        <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
                            <div className="flex items-center gap-2 text-purple-500 font-bold text-xs uppercase tracking-widest mb-3 lg:mb-4">
                                <Code2 className="w-4 h-4" />
                                Practice Sandbox
                            </div>
                            <div className="flex-1 bg-zinc-900 rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 min-h-0">
                                <CodeEditor
                                    initialCode={lesson.starterCode || `// Practice: ${lesson.title}\n\nfunction solution() {\n  // Type your code here\n}\n`}
                                    language="javascript"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
