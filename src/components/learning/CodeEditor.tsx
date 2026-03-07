"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Play, RotateCcw, Loader2 } from "lucide-react";

// Dynamically import Monaco Editor to avoid SSR issues and DOMExceptions
const Editor = dynamic(() => import("@monaco-editor/react"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-zinc-900 animate-pulse">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-700" />
        </div>
    )
});

interface CodeEditorProps {
    initialCode?: string;
    language?: string;
    onRun?: (code: string) => void;
}

export default function CodeEditor({
    initialCode = "// Write your code here...",
    language = "javascript",
    onRun
}: CodeEditorProps) {
    const [code, setCode] = useState(initialCode);

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] rounded-2xl overflow-hidden border border-zinc-800">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5 px-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                    </div>
                    <span className="text-xs font-mono text-zinc-500 ml-2 uppercase tracking-widest">{language}</span>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setCode(initialCode)}
                        className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
                        title="Reset Code"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onRun?.(code)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-all active:scale-95"
                    >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        RUN CODE
                    </button>
                </div>
            </div>

            {/* Editor Container - using a relative wrapper to prevent Monaco focus/offset errors during layout shifts */}
            <div className="flex-1 relative min-h-0 min-w-0">
                <div className="absolute inset-0">
                    <Editor
                        height="100%"
                        defaultLanguage={language}
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value || "")}
                        options={{
                            fontSize: 14,
                            minimap: { enabled: false },
                            padding: { top: 20 },
                            scrollBeyondLastLine: false,
                            lineNumbers: "on",
                            roundedSelection: true,
                            automaticLayout: true, // Crucial for resizing
                            fontFamily: "var(--font-geist-mono), monospace",
                            smoothScrolling: true,
                            contextmenu: false,
                            scrollbar: {
                                useShadows: false,
                                verticalScrollbarSize: 8,
                                horizontalScrollbarSize: 8,
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
