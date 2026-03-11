"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, Loader2, Terminal, XCircle, ChevronDown, ChevronUp } from "lucide-react";

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
    const [output, setOutput] = useState<{ type: 'log' | 'error', content: string }[]>([]);
    const [showOutput, setShowOutput] = useState(false);
    const outputRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Auto-scroll to bottom of output
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output]);

    // Message listener for iframe output
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Only accept messages from our own window/iframe
            if (event.data.source === 'loomgrad-sandbox') {
                const { type, content } = event.data;
                setOutput(prev => [...prev, { type: type === 'error' ? 'error' : 'log', content }]);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const handleRun = async () => {
        if (language !== "javascript") {
            setOutput([{ type: 'error', content: `Execution for ${language} is not supported in the browser sandbox yet.` }]);
            setShowOutput(true);
            return;
        }

        setShowOutput(true);
        setOutput([]);

        if (onRun) {
            onRun(code);
            return;
        }

        // --- NEW SECURE IFRAME EXECUTION ---
        const runnerHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <script>
                    const originalConsole = {
                        log: console.log,
                        error: console.error,
                        warn: console.warn
                    };

                    function sendToParent(type, args) {
                        const content = args.map(arg => {
                            if (arg === null) return 'null';
                            if (arg === undefined) return 'undefined';
                            if (typeof arg === 'object') {
                                try { return JSON.stringify(arg, null, 2); } 
                                catch (e) { return '[Circular Object]'; }
                            }
                            return String(arg);
                        }).join(' ');
                        
                        window.parent.postMessage({
                            source: 'loomgrad-sandbox',
                            type,
                            content
                        }, '*');
                    }

                    console.log = (...args) => sendToParent('log', args);
                    console.error = (...args) => sendToParent('error', args);
                    console.warn = (...args) => sendToParent('log', ['[WARN]', ...args]);

                    window.onerror = (message, source, lineno, colno, error) => {
                        sendToParent('error', [message]);
                        return true;
                    };

                    window.addEventListener('unhandledrejection', (event) => {
                        sendToParent('error', [event.reason]);
                    });
                </script>
            </head>
            <body>
                <script>
                    (async () => {
                        try {
                            const result = await (async () => {
                                ${code}
                            })();
                            if (result !== undefined) {
                                console.log('Returned:', result);
                            }
                        } catch (err) {
                            console.error(err.stack || err.message || String(err));
                        }
                    })();
                </script>
            </body>
            </html>
        `;

        // If iframe exists, refresh it with new code
        if (iframeRef.current) {
            const blob = new Blob([runnerHtml], { type: 'text/html' });
            iframeRef.current.src = URL.createObjectURL(blob);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] rounded-2xl lg:rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
            {/* Hidden Sandbox Iframe */}
            <iframe
                ref={iframeRef}
                className="hidden"
                sandbox="allow-scripts"
                title="code-sandbox"
            />

            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5 px-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                    </div>
                    <span className="text-[10px] font-bold font-mono text-zinc-500 ml-2 uppercase tracking-[0.2em]">{language}</span>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setCode(initialCode);
                            setOutput([]);
                            setShowOutput(false);
                            if (iframeRef.current) iframeRef.current.src = "about:blank";
                        }}
                        className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors group"
                        title="Reset Code"
                    >
                        <RotateCcw className="w-4 h-4 group-active:rotate-180 transition-transform duration-500" />
                    </button>
                    <button
                        onClick={handleRun}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-[11px] font-bold px-4 py-1.5 rounded-lg transition-all active:scale-95 shadow-lg shadow-green-900/20"
                    >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        RUN CODE
                    </button>
                </div>
            </div>

            {/* Editor Container */}
            <div className="flex-1 relative min-h-0 min-w-0">
                <div className={`absolute inset-0 transition-all duration-300 ${showOutput ? "bottom-1/3" : "bottom-0"}`}>
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
                            automaticLayout: true,
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

                {/* Output Panel */}
                {showOutput && (
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-zinc-950 border-t border-zinc-800 flex flex-col z-10">
                        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <Terminal className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Console Output</span>
                            </div>
                            <button
                                onClick={() => setShowOutput(false)}
                                className="p-1 hover:bg-zinc-800 rounded text-zinc-500 transition-colors"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                        <div
                            ref={outputRef}
                            className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-2 selection:bg-blue-500/30"
                        >
                            {output.length === 0 ? (
                                <div className="text-zinc-600 italic animate-pulse">Running code...</div>
                            ) : (
                                output.map((log, i) => (
                                    <div key={i} className={`flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300`}>
                                        <span className="text-zinc-600 shrink-0 select-none">{i + 1}</span>
                                        <div className={log.type === 'error' ? "text-red-400" : "text-zinc-300 whitespace-pre-wrap"}>
                                            {log.type === 'error' && <XCircle className="w-4 h-4 inline mr-2 -mt-0.5" />}
                                            {log.content}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Toggle Output Button (when hidden) */}
                {!showOutput && output.length > 0 && (
                    <button
                        onClick={() => setShowOutput(true)}
                        className="absolute bottom-4 right-4 flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-zinc-700 transition-all shadow-xl z-20"
                    >
                        <Terminal className="w-3.5 h-3.5" />
                        SHOW OUTPUT ({output.length})
                        <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
}
