"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
    Play, RotateCcw, Loader2, Terminal, XCircle,
    ChevronDown, ChevronUp, CheckCircle2, Lightbulb, BookOpen, Star, CheckSquare, Circle
} from "lucide-react";
import { submitChallengeResult } from "@/actions/challenges";

const Editor = dynamic(() => import("@monaco-editor/react"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-zinc-900 animate-pulse">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-700" />
        </div>
    )
});

type QuestionType = "CODING" | "MCQ_SINGLE" | "MCQ_MULTI" | "FILL_BLANK";

interface TestCase { input: string; expectedOutput: string; }
interface MCQOption { id: string; text: string; isCorrect: boolean; }

interface ChallengeSolverProps {
    id: string;
    title: string;
    description: string;
    questionType: QuestionType;
    starterCode: string;
    hint?: string | null;
    solution?: string | null;
    testCases: TestCase[];
    options?: MCQOption[];
    correctAnswer?: string | null;
    language: string;
    difficultyStars: number;
}

export function ChallengeSolver({
    id, title, description, questionType, starterCode, hint, solution, testCases, options = [], correctAnswer, language, difficultyStars,
}: ChallengeSolverProps) {
    // Shared State
    const [showHint, setShowHint] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const [allPassed, setAllPassed] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Coding State
    const [code, setCode] = useState(starterCode);
    const [output, setOutput] = useState<{ type: "log" | "error" | "test"; content: any }[]>([]);
    const [showOutput, setShowOutput] = useState(false);
    const outputRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // MCQ State
    const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());

    // Fill Blank State
    const [fillAnswer, setFillAnswer] = useState("");

    useEffect(() => {
        if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }, [output]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.source === "loomgrad-sandbox") {
                const { type, content } = event.data;
                setOutput(prev => [...prev, {
                    type: type === "error" ? "error" : type === "test" ? "test" : "log",
                    content
                }]);
                if (type === "test") {
                    const passed = content.every((r: any) => r.passed);
                    const passedCount = content.filter((r: any) => r.passed).length;
                    const totalCount = content.length;
                    setAllPassed(passed);
                    setIsSubmitted(true);

                    // Save result to server
                    submitChallengeResult(id, passed ? "PASSED" : "FAILED", code, passedCount, totalCount);
                }
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [id, code]);

    // ─── CODING: Run Test Cases ───────────────────────────────────────────
    const handleRunCode = () => {
        setOutput([]);
        setShowOutput(true);
        setAllPassed(false);
        setIsSubmitted(false);

        const cleanCode = code.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "");
        const functionName = cleanCode.match(/function\s+(\w+)/)?.[1] || "";

        const html = `<!DOCTYPE html><html><head><script>
            function sendToParent(type, content) { window.parent.postMessage({ source: 'loomgrad-sandbox', type, content }, '*'); }
            function fmt(arg) {
                if (arg === null) return 'null';
                if (arg === undefined) return 'undefined';
                if (typeof arg === 'object') { try { return JSON.stringify(arg); } catch(e) { return '[Circular]'; } }
                return String(arg);
            }
            console.log = (...a) => sendToParent('log', a.map(fmt).join(' '));
            console.error = (...a) => sendToParent('error', a.map(fmt).join(' '));
            window.onerror = (msg) => { sendToParent('error', msg); return true; };
        </script></head><body>
        <script>${code}</script>
        <script>(async () => {
            try {
                const fn = '${functionName}';
                const tests = ${JSON.stringify(testCases)};
                const target = window[fn];
                if (tests.length > 0 && typeof target === 'function') {
                    const results = [];
                    for (const t of tests) {
                        try {
                            const args = eval('[' + t.input + ']');
                            const actual = target(...args);
                            const expected = eval(t.expectedOutput);
                            results.push({ input: t.input, expected: t.expectedOutput, actual: fmt(actual), passed: JSON.stringify(actual) === JSON.stringify(expected) });
                        } catch(e) {
                            results.push({ input: t.input, expected: t.expectedOutput, actual: 'Error: ' + e.message, passed: false });
                        }
                    }
                    sendToParent('test', results);
                } else if (!fn) {
                    console.error('No function found. Use: function name() {...}');
                } else {
                    console.error('Function ' + fn + ' not found in global scope.');
                }
            } catch(err) {
                console.error(err.message || String(err));
            }
        })();</script></body></html>`;

        if (iframeRef.current) {
            const blob = new Blob([html], { type: "text/html" });
            iframeRef.current.src = URL.createObjectURL(blob);
        }
    };

    // ─── NON-CODING: Validate Answer ──────────────────────────────────────
    const handleSubmitQuiz = () => {
        setIsSubmitted(true);
        let passed = false;
        let submittedCode = "";

        if (questionType === "MCQ_SINGLE" || questionType === "MCQ_MULTI") {
            const correctIds = new Set(options.filter(o => o.isCorrect).map(o => o.id));
            passed =
                correctIds.size === selectedOptions.size &&
                [...correctIds].every(id => selectedOptions.has(id));
            submittedCode = Array.from(selectedOptions).join(",");
        } else if (questionType === "FILL_BLANK") {
            const normalizedInput = fillAnswer.trim().toLowerCase();
            const normalizedExpected = (correctAnswer || "").trim().toLowerCase();
            passed = normalizedInput === normalizedExpected;
            submittedCode = fillAnswer;
        }

        setAllPassed(passed);

        // Save result to server
        submitChallengeResult(id, passed ? "PASSED" : "FAILED", submittedCode, passed ? 1 : 0, 1);
    };

    const handleReset = () => {
        setIsSubmitted(false);
        setAllPassed(false);
        setShowOutput(false);
        if (questionType === "CODING") {
            setCode(starterCode);
            setOutput([]);
            if (iframeRef.current) iframeRef.current.src = "about:blank";
        } else {
            setSelectedOptions(new Set());
            setFillAnswer("");
        }
    };

    const toggleOption = (id: string) => {
        if (isSubmitted) return;
        const newSet = new Set(selectedOptions);
        if (questionType === "MCQ_SINGLE") {
            newSet.clear();
            newSet.add(id);
        } else {
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
        }
        setSelectedOptions(newSet);
    };

    // Derived State
    const testResults = output.find(o => o.type === "test");
    const passedCount = testResults ? (testResults.content as any[]).filter((r: any) => r.passed).length : 0;
    const totalCount = testCases.length;

    // Helper to format Fill in Blank description
    const formattedDescription = () => {
        if (questionType === "FILL_BLANK" && fillAnswer) {
            return description.replace(/___/g, `[ ${fillAnswer} ]`);
        }
        return description;
    };

    return (
        <div className="flex flex-col lg:flex-row h-full min-h-0 gap-0">
            {questionType === "CODING" && (
                <iframe ref={iframeRef} className="hidden" sandbox="allow-scripts" title="challenge-sandbox" />
            )}

            {/* left Panel: Problem Description */}
            <div className="w-full lg:w-[420px] shrink-0 flex flex-col border-r border-zinc-200 overflow-y-auto bg-white">
                <div className="p-6 border-b border-zinc-100">
                    <div className="flex items-center gap-2 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < difficultyStars ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`} />
                        ))}
                    </div>
                    <h1 className="text-2xl font-black tracking-tight font-mono mb-4 text-zinc-900">{title}</h1>
                    <p className="text-zinc-600 text-sm leading-relaxed whitespace-pre-wrap">{formattedDescription()}</p>
                </div>

                {/* Test Cases preview (Coding only) */}
                {questionType === "CODING" && (
                    <div className="p-6 border-b border-zinc-100">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Test Cases</h3>
                        <div className="space-y-2">
                            {testCases.slice(0, 4).map((tc, i) => (
                                <div key={i} className="flex items-center gap-3 font-mono text-xs">
                                    <span className="text-zinc-400 shrink-0">→</span>
                                    <span className="text-zinc-600 truncate">{title}({tc.input})</span>
                                    <span className="text-zinc-400">→</span>
                                    <span className="text-blue-600 font-bold shrink-0">{tc.expectedOutput}</span>
                                </div>
                            ))}
                            {testCases.length > 4 && (
                                <p className="text-xs text-zinc-400 italic">+ {testCases.length - 4} more test cases</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Result Banner */}
                {isSubmitted && (
                    <div className={`mx-6 mt-4 p-4 rounded-xl border ${allPassed
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-red-50 border-red-200 text-red-700"
                        }`}>
                        <div className="flex items-center gap-2 font-bold text-sm">
                            {allPassed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            {allPassed
                                ? "Correct! 🎉"
                                : (questionType === "CODING" ? `${passedCount} / ${totalCount} tests passed` : "Incorrect. Try again!")}
                        </div>
                    </div>
                )}

                {/* Hint */}
                {hint && (
                    <div className="p-6 border-t border-zinc-100 mt-auto">
                        <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors mb-3">
                            <Lightbulb className="w-4 h-4" /> {showHint ? "Hide Hint" : "Show Hint"}
                        </button>
                        {showHint && (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 leading-relaxed">
                                {hint}
                            </div>
                        )}
                    </div>
                )}

                {/* Solution */}
                {solution && isSubmitted && allPassed && (
                    <div className="p-6 border-t border-zinc-100">
                        <button onClick={() => setShowSolution(!showSolution)} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors mb-3">
                            <BookOpen className="w-4 h-4" /> {showSolution ? "Hide Solution" : "View Explanation"}
                        </button>
                        {showSolution && (
                            <pre className="p-4 bg-zinc-50 border border-zinc-200 text-zinc-700 whitespace-pre-wrap rounded-xl text-sm overflow-x-auto">
                                {solution}
                            </pre>
                        )}
                    </div>
                )}
            </div>

            {/* Right panel: Editor OR Quiz Interface */}
            <div className="flex-1 flex flex-col bg-zinc-50 min-h-0 relative">

                {/* Main Right Content */}
                {questionType === "CODING" ? (
                    <div className="flex flex-col h-full bg-[#1e1e1e]">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800 shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold text-zinc-500 ml-2 uppercase tracking-widest">{language}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={handleReset} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors">
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                                <button onClick={handleRunCode} className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-[11px] font-bold px-4 py-1.5 rounded-lg transition-all active:scale-95">
                                    <Play className="w-3.5 h-3.5 fill-current" /> RUN CODE
                                </button>
                            </div>
                        </div>

                        {/* Editor */}
                        <div className={`flex-1 min-h-0 relative transition-all duration-300 ${showOutput ? "h-[60%]" : "h-full"}`}>
                            <div className={`absolute inset-0 ${showOutput ? "bottom-0" : ""}`}>
                                <Editor
                                    height="100%"
                                    defaultLanguage={language.toLowerCase() === "javascript" ? "javascript" : "typescript"}
                                    theme="vs-dark"
                                    value={code}
                                    onChange={(v) => setCode(v || "")}
                                    options={{ fontSize: 14, minimap: { enabled: false }, padding: { top: 16 } }}
                                />
                            </div>
                        </div>

                        {/* Output Panel */}
                        {showOutput && (
                            <div className="h-[40%] min-h-[160px] bg-zinc-950 border-t border-zinc-800 flex flex-col">
                                <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800 shrink-0">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <Terminal className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Output</span>
                                        {testResults && (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${allPassed ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"}`}>
                                                {passedCount}/{totalCount}
                                            </span>
                                        )}
                                    </div>
                                    <button onClick={() => setShowOutput(false)} className="p-1 hover:bg-zinc-800 rounded text-zinc-500">
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                </div>
                                <div ref={outputRef} className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm">
                                    {/* (Render logs and test Results table here... same as before) */}
                                    {output.length === 0 ? (
                                        <div className="text-zinc-600 italic animate-pulse">Running code...</div>
                                    ) : (
                                        <>
                                            {output.filter(o => o.type !== "test").map((log, i) => (
                                                <div key={i} className="flex gap-3">
                                                    <span className="text-zinc-600 text-[10px] w-4 shrink-0">{i + 1}</span>
                                                    <div className={log.type === "error" ? "text-red-400" : "text-zinc-300 whitespace-pre-wrap"}>
                                                        {log.type === "error" && <XCircle className="w-4 h-4 inline mr-2 -mt-0.5" />}
                                                        {log.content}
                                                    </div>
                                                </div>
                                            ))}
                                            {testResults && (
                                                <div className="border border-zinc-800 rounded-xl overflow-hidden mt-4">
                                                    <table className="w-full text-left bg-zinc-900/50">
                                                        <thead>
                                                            <tr className="text-[10px] uppercase text-zinc-500 border-b border-zinc-800">
                                                                <th className="px-4 py-2">Input</th>
                                                                <th className="px-4 py-2">Expected</th>
                                                                <th className="px-4 py-2">Actual</th>
                                                                <th className="px-4 py-2 text-center">✓</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="text-[11px]">
                                                            {(testResults.content as any[]).map((res: any, i: number) => (
                                                                <tr key={i} className="border-b border-zinc-900/50 hover:bg-zinc-900/30">
                                                                    <td className="px-4 py-1.5 text-zinc-400">({res.input})</td>
                                                                    <td className="px-4 py-1.5 text-blue-400">{res.expected}</td>
                                                                    <td className={`px-4 py-1.5 ${res.passed ? "text-green-400" : "text-red-400"}`}>{res.actual}</td>
                                                                    <td className="px-4 py-1.5 text-center">
                                                                        {res.passed ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mx-auto" /> : <XCircle className="w-3.5 h-3.5 text-red-500 mx-auto" />}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                        {!showOutput && output.length > 0 && (
                            <button onClick={() => setShowOutput(true)} className="absolute bottom-4 right-4 flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-zinc-700 z-20">
                                <Terminal className="w-3.5 h-3.5" /> {allPassed ? "✅ Passed" : "Results"} <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                ) : (
                    /* ── QUIZ INTERFACE (MCQ / Fill Blank) ── */
                    <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
                        <div className="max-w-2xl mx-auto space-y-8">

                            {/* MCQ */}
                            {questionType.startsWith("MCQ") && (
                                <div className="space-y-3">
                                    {options.map((opt, i) => {
                                        const isSelected = selectedOptions.has(opt.id);
                                        let stateClass = "border-zinc-200 hover:bg-white bg-zinc-50";
                                        let icon = questionType === "MCQ_SINGLE" ? <Circle className="w-5 h-5 text-zinc-300" /> : <CheckSquare className="w-5 h-5 text-zinc-300" />;

                                        if (isSelected) {
                                            stateClass = "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20";
                                            icon = questionType === "MCQ_SINGLE" ? <CheckCircle2 className="w-5 h-5 text-blue-600 fill-blue-100" /> : <CheckSquare className="w-5 h-5 text-blue-600 fill-blue-100" />;
                                        }

                                        // Show correct/incorrect after submit
                                        if (isSubmitted) {
                                            if (opt.isCorrect) {
                                                stateClass = "border-green-500 bg-green-50";
                                                icon = <CheckCircle2 className="w-5 h-5 text-green-600" />;
                                            } else if (isSelected && !opt.isCorrect) {
                                                stateClass = "border-red-500 bg-red-50";
                                                icon = <XCircle className="w-5 h-5 text-red-500" />;
                                            } else {
                                                stateClass = "border-zinc-200 bg-transparent opacity-50";
                                            }
                                        }

                                        return (
                                            <button
                                                key={opt.id}
                                                onClick={() => toggleOption(opt.id)}
                                                disabled={isSubmitted}
                                                className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left group ${stateClass}`}
                                            >
                                                <div className="shrink-0">{icon}</div>
                                                <span className="font-bold text-zinc-800 flex-1">{opt.text}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* FILL BLANK */}
                            {questionType === "FILL_BLANK" && (
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest block text-center">Type your answer</label>
                                    <input
                                        type="text"
                                        value={fillAnswer}
                                        onChange={(e) => setFillAnswer(e.target.value)}
                                        disabled={isSubmitted}
                                        placeholder="Your answer..."
                                        className={`w-full max-w-sm mx-auto block text-center border-b-2 bg-transparent text-2xl font-bold py-3 focus:outline-none transition-colors ${isSubmitted
                                            ? (allPassed ? "border-green-500 text-green-700" : "border-red-500 text-red-600")
                                            : "border-zinc-300 focus:border-blue-500 text-zinc-900"
                                            }`}
                                    />
                                    {isSubmitted && !allPassed && correctAnswer && (
                                        <div className="text-center text-sm text-green-600 font-bold mt-4 bg-green-50 py-2 rounded-xl">
                                            Correct answer: {correctAnswer}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="pt-8 flex justify-center gap-4">
                                {isSubmitted ? (
                                    <button onClick={handleReset} className="flex items-center gap-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-bold px-6 py-3 rounded-xl transition-all">
                                        <RotateCcw className="w-4 h-4" /> Try Again
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmitQuiz}
                                        disabled={fillAnswer.length === 0 && selectedOptions.size === 0}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-sm"
                                    >
                                        Submit Answer
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
