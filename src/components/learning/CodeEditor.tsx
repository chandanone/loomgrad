"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, Loader2, Terminal, XCircle, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";

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
    testCases?: {
        input: string;
        expectedOutput: string;
    }[];
}

export default function CodeEditor({
    initialCode = "// Write your code here...",
    language = "javascript",
    onRun,
    testCases
}: CodeEditorProps) {
    const [code, setCode] = useState(initialCode);
    const [output, setOutput] = useState<{ type: 'log' | 'error' | 'test', content: any }[]>([]);
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
                setOutput(prev => [...prev, { type: type === 'error' ? 'error' : (type === 'test' ? 'test' : 'log'), content }]);
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
        const cleanCode = code.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "");
        const functionName = cleanCode.match(/function\s+(\w+)/)?.[1] || "";

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

                    function sendToParent(type, content) {
                        window.parent.postMessage({
                            source: 'loomgrad-sandbox',
                            type,
                            content
                        }, '*');
                    }

                    function formatArg(arg) {
                        if (arg === null) return 'null';
                        if (arg === undefined) return 'undefined';
                        if (typeof arg === 'object') {
                            try { return JSON.stringify(arg); } 
                            catch (e) { return '[Circular]'; }
                        }
                        return String(arg);
                    }

                    console.log = (...args) => sendToParent('log', args.map(formatArg).join(' '));
                    console.error = (...args) => sendToParent('error', args.map(formatArg).join(' '));
                    console.warn = (...args) => sendToParent('log', '[WARN] ' + args.map(formatArg).join(' '));

                    window.onerror = (message) => {
                        sendToParent('error', message);
                        return true;
                    };
                </script>
            </head>
            <body>
                <script>
                    ${code}
                </script>
                <script>
                    (async () => {
                        try {
                            const functionName = '${functionName}';
                            const tests = ${JSON.stringify(testCases || [])};
                            
                            // Find the function in the global scope
                            const target = window[functionName];

                            if (tests.length > 0 && typeof target === 'function') {
                                const results = [];
                                for (const test of tests) {
                                    try {
                                        const args = eval('[' + test.input + ']');
                                        const actual = target(...args);
                                        const expected = eval(test.expectedOutput);
                                        
                                        results.push({
                                            input: test.input,
                                            expected: test.expectedOutput,
                                            actual: formatArg(actual),
                                            passed: JSON.stringify(actual) === JSON.stringify(expected)
                                        });
                                    } catch (e) {
                                        results.push({
                                            input: test.input,
                                            expected: test.expectedOutput,
                                            actual: 'Error: ' + e.message,
                                            passed: false
                                        });
                                    }
                                }
                                sendToParent('test', results);
                            } else if (tests.length > 0) {
                                if (!functionName) {
                                    console.error("No function detected. Please use: function name() { ... }");
                                } else {
                                    console.error("Function '" + functionName + "' not found. Make sure it's defined at the top level.");
                                }
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
                                <div className="space-y-4">
                                    {/* Normal Logs */}
                                    {output.filter(o => o.type !== 'test').map((log, i) => (
                                        <div key={i} className={`flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300`}>
                                            <span className="text-zinc-600 shrink-0 select-none text-[10px] w-4">{i + 1}</span>
                                            <div className={log.type === 'error' ? "text-red-400" : "text-zinc-300 whitespace-pre-wrap"}>
                                                {log.type === 'error' && <XCircle className="w-4 h-4 inline mr-2 -mt-0.5" />}
                                                {log.content}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Test Results */}
                                    {output.map((o, idx) => o.type === 'test' && (
                                        <div key={`test-${idx}`} className="mt-4 border border-zinc-800 rounded-xl overflow-hidden animate-in zoom-in-95 duration-500">
                                            <div className="bg-zinc-900/80 px-4 py-2 border-b border-zinc-800 flex justify-between items-center">
                                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Test Suite Results</span>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
                                                    {o.content.filter((r: any) => r.passed).length} / {o.content.length} Passed
                                                </span>
                                            </div>
                                            <div className="p-0 overflow-x-auto">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="text-[10px] uppercase text-zinc-500 border-b border-zinc-800">
                                                            <th className="px-4 py-2 font-bold">Input</th>
                                                            <th className="px-4 py-2 font-bold">Expected</th>
                                                            <th className="px-4 py-2 font-bold">Actual</th>
                                                            <th className="px-4 py-2 font-bold text-center">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-[11px] font-mono">
                                                        {o.content.map((res: any, i: number) => (
                                                            <tr key={i} className="border-b border-zinc-900/50 hover:bg-zinc-900/30 transition-colors">
                                                                <td className="px-4 py-2 text-zinc-400">({res.input})</td>
                                                                <td className="px-4 py-2 text-blue-400">{res.expected}</td>
                                                                <td className={`px-4 py-2 ${res.passed ? "text-green-400" : "text-red-400"}`}>{res.actual}</td>
                                                                <td className="px-4 py-2 text-center">
                                                                    {res.passed ? (
                                                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mx-auto" />
                                                                    ) : (
                                                                        <XCircle className="w-3.5 h-3.5 text-red-500 mx-auto" />
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
