"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
    Play, RotateCcw, Loader2, Terminal, XCircle,
    ChevronDown, ChevronUp, CheckCircle2, Lightbulb, BookOpen, Star, CheckSquare, Circle,
    ChevronLeft, ChevronRight, Timer, User, Info, HelpCircle, Menu, MoreVertical, Calculator, Code2
} from "lucide-react";
import Link from "next/link";
import { submitChallengeResult, clearChallengeSubmission, resetCategorySubmissions } from "@/actions/challenges";
import { toast } from "sonner";
import { QuizTimer } from "./QuizTimer";
import { useFancyConfirm } from "../ui/ConfirmProvider";

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
    prevChallengeUrl?: string;
    nextChallengeUrl?: string;
    assessmentMode?: string;
    initialTimerLevel?: string;
    categorySlug: string;
    categoryTitle: string;
    challengeType: string;
    allChallenges?: { id: string; slug: string; title: string; isAnswered: boolean }[];
    user?: { name: string; image: string | null };
    initialSubmission?: { submittedCode: string; status: string; passedTests: number; totalTests: number } | null;
    isReattempt?: boolean;
}

export function ChallengeSolver({
    id, title, description, questionType, starterCode, hint, solution, testCases, options = [], correctAnswer, language, difficultyStars, prevChallengeUrl, nextChallengeUrl, assessmentMode = "PRACTICE", initialTimerLevel, categorySlug, categoryTitle, challengeType, allChallenges = [], user = { name: "Guest", image: null }, initialSubmission, isReattempt = false
}: ChallengeSolverProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Shared State: ALWAYS initialize to fresh state for new attempt
    const [showHint, setShowHint] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const [allPassed, setAllPassed] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [passedTests, setPassedTests] = useState(0);
    const [totalTests, setTotalTests] = useState(0);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState<"English" | "Hindi">("English");
    const { confirm: fancyConfirm } = useFancyConfirm();

    // Coding State: Reset to starter code
    const [code, setCode] = useState(starterCode);
    const [output, setOutput] = useState<{ type: "log" | "error" | "test"; content: any }[]>([]);
    const [showOutput, setShowOutput] = useState(false);
    const outputRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
    const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
    const [visited, setVisited] = useState<Set<string>>(new Set());

    useEffect(() => {
        const savedReview = localStorage.getItem(`review_${categorySlug}`);
        if (savedReview) setMarkedForReview(new Set<string>(JSON.parse(savedReview)));

        const savedVisited = localStorage.getItem(`visited_${categorySlug}`);
        const visitedSet = new Set<string>(savedVisited ? JSON.parse(savedVisited) : []);
        visitedSet.add(id);
        setVisited(visitedSet);
        localStorage.setItem(`visited_${categorySlug}`, JSON.stringify(Array.from(visitedSet)));
    }, [categorySlug, id]);

    useEffect(() => {
        localStorage.setItem(`review_${categorySlug}`, JSON.stringify(Array.from(markedForReview)));
    }, [markedForReview, categorySlug]);

    // Fill Blank State: Always start empty
    const [fillAnswer, setFillAnswer] = useState("");

    useEffect(() => {
        if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }, [output]);

    useEffect(() => {
        if (assessmentMode !== "EXAM" || isSubmitted) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = "Are you sure you want to leave? Your progress will not be saved.";
            return e.returnValue;
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [assessmentMode, isSubmitted]);

    const handleExit = async (e: React.MouseEvent, href: string) => {
        if (assessmentMode === "EXAM" && !isSubmitted) {
            e.preventDefault();
            const ok = await fancyConfirm({
                title: "Incomplete Exam",
                message: "Your exam is still in progress. Are you sure you want to leave? Progress will not be saved.",
                type: "warning"
            });
            if (ok) startTransition(() => router.push(href));
            return;
        }
        startTransition(() => {
            router.push(href);
        });
    };

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
                    const pCount = content.filter((r: any) => r.passed).length;
                    const tCount = content.length;
                    setAllPassed(passed);
                    setPassedTests(pCount);
                    setTotalTests(tCount);
                    setIsSubmitted(true);

                    // Save result to server
                    submitChallengeResult(id, passed ? "PASSED" : "FAILED", code, pCount, tCount);

                    if (assessmentMode === "EXAM") {
                        // In exam mode, we might just hide the instant feedback banner
                    }
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
    const handleSubmitQuiz = async (shouldNavigate: boolean | React.MouseEvent = true) => {
        setIsSubmitted(true);
        const navigate = typeof shouldNavigate === "boolean" ? shouldNavigate : true;
        let passed = false;
        let submittedCode = "";
        let pCount = passedTests;
        let tCount = totalTests;

        if (questionType === "MCQ_SINGLE" || questionType === "MCQ_MULTI") {
            const correctIds = new Set(options.filter(o => o.isCorrect).map(o => o.id));
            passed =
                correctIds.size === selectedOptions.size &&
                [...correctIds].every(id => selectedOptions.has(id));
            submittedCode = Array.from(selectedOptions).join(",");
            pCount = passed ? 1 : 0;
            tCount = 1;
        } else if (questionType === "FILL_BLANK") {
            const normalizedInput = fillAnswer.trim().toLowerCase();
            const normalizedExpected = (correctAnswer || "").trim().toLowerCase();
            passed = normalizedInput === normalizedExpected;
            submittedCode = fillAnswer;
            pCount = passed ? 1 : 0;
            tCount = 1;
        } else if (questionType === "CODING") {
            passed = allPassed;
            submittedCode = code;
            // Use current passedTests/totalTests from state
        }

        setAllPassed(passed);
        setPassedTests(pCount);
        setTotalTests(tCount);

        // Save result to server
        await submitChallengeResult(id, passed ? "PASSED" : "FAILED", submittedCode, pCount, tCount);

        // Auto-navigate to next if exists and allowed
        if (navigate && nextChallengeUrl) {
            startTransition(() => {
                router.push(nextChallengeUrl);
            });
        }
    };

    const handleSubmitExam = async (isAuto = false) => {
        // If it's a quiz, submit the current question first but DON'T navigate
        if (questionType !== "CODING") {
            await handleSubmitQuiz(false);
        }

        const proceed = () => {
            router.push(`/challenges/${categorySlug}/result`);
        };

        if (isAuto) {
            proceed();
        } else {
            const ok = await fancyConfirm({
                title: "Finish Exam?",
                message: "Are you sure you want to submit the exam for final evaluation?",
                type: "info"
            });
            if (ok) proceed();
        }
    };

    const handleReset = async () => {
        const ok = await fancyConfirm({
            title: "Reset Question?",
            message: "Reset current question? This will clear your response and history for this challenge.",
            type: "warning"
        });

        if (ok) {
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
            await clearChallengeSubmission(id);
            router.refresh();
        }
    };

    const handleFullTestReset = async () => {
        const ok = await fancyConfirm({
            title: "Hard Reset",
            message: "WARNING: Are you sure you want to reset the ENTIRE test? All progress for this segment will be permanently deleted.",
            type: "danger"
        });

        if (ok) {
            await resetCategorySubmissions(categorySlug);
            window.location.reload();
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

    const toggleMarkForReview = () => {
        const newSet = new Set(markedForReview);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setMarkedForReview(newSet);
    };

    const handleClearResponse = () => {
        setSelectedOptions(new Set());
        setFillAnswer("");
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
        <div className="flex flex-col h-full bg-[#f5f5f5] overflow-hidden">
            {/* Nav Bar (Formerly in page.tsx) */}
            <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-zinc-200 bg-white z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={(e) => handleExit(e, "/challenges")}
                        className="flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                        Challenges
                    </button>
                    <span className="text-zinc-300">/</span>
                    <button
                        onClick={(e) => handleExit(e, `/challenges/${categorySlug}`)}
                        className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                        {categoryTitle}
                    </button>
                    <span className="text-zinc-300">/</span>
                    <span className="text-sm font-bold text-zinc-900 font-mono">{title}</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${challengeType === "MATH"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-blue-50 text-blue-600"
                        }`}>
                        {challengeType === "MATH" ? <Calculator className="w-3.5 h-3.5" /> : challengeType === "CODING" ? <Code2 className="w-3.5 h-3.5" /> : <Calculator className="w-3.5 h-3.5" />}
                        {challengeType === "MATH" ? "Math" : challengeType === "CODING" ? "Coding" : challengeType.replace("_", " ")}
                    </div>
                </div>
            </div>

            {questionType === "CODING" && (
                <iframe ref={iframeRef} className="hidden" sandbox="allow-scripts" title="challenge-sandbox" />
            )}

            {/* Desktop Top Bar (Exam Info) */}
            <div className="hidden md:flex bg-[#2a2a2a] text-white px-4 py-2 items-center justify-between text-sm shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-zinc-400">Language:</span>
                        <select 
                            value={currentLanguage}
                            onChange={(e) => setCurrentLanguage(e.target.value as any)}
                            className="bg-zinc-800 border-none text-xs rounded px-2 py-0.5 outline-none"
                        >
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                        </select>
                    </div>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors font-bold text-xs">
                    <Info className="w-3.5 h-3.5" /> Instructions
                </button>
            </div>

            {/* Mobile Top Bar */}
            <div className="md:hidden bg-[#1a2d4c] text-white px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 text-sm font-medium">
                    <span className="flex items-center gap-1">General Awareness <ChevronDown className="w-3 h-3" /></span>
                    <select 
                        value={currentLanguage}
                        onChange={(e) => setCurrentLanguage(e.target.value as any)}
                        className="bg-white/10 text-white text-[10px] rounded px-1.5 py-0.5 outline-none border border-white/20"
                    >
                        <option className="text-black" value="English">EN</option>
                        <option className="text-black" value="Hindi">HI</option>
                    </select>
                </div>
                <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-1">
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Timer Bar */}
            <div className="md:hidden bg-[#4b77be] text-white px-4 py-1.5 flex items-center justify-end font-bold text-xs shrink-0">
                <div className="flex items-center gap-2 bg-[#1a2d4c] px-3 py-1 rounded">
                    <span className="text-[10px] text-zinc-300">Time Left :</span>
                    <QuizTimer 
                        categorySlug={categorySlug} 
                        initialTimerLevel={initialTimerLevel} 
                        onTimeUp={() => {
                            toast.error("Time is up! Your exam will be submitted automatically.", {
                                duration: 5000,
                                position: "top-center"
                            });
                            handleSubmitExam(true);
                        }}
                    />
                </div>
            </div>

            {/* Mobile Question Palette (Horizontal Scroll) */}
            <div className="md:hidden bg-[#f0f0f0] border-b border-zinc-300 py-2 px-1 flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-hide shrink-0">
                {allChallenges.map((ch, idx) => {
                    const isCurrent = ch.id === id;
                    const isAnswered = ch.isAnswered;
                    const isMarked = markedForReview.has(ch.id);

                    let bgClass = "bg-white";
                    let textClass = "text-zinc-600";
                    let shapeClass = "rounded";

                    if (isCurrent || (isAnswered && !isMarked)) {
                        // Current or Answered
                        if (isAnswered) {
                            bgClass = "bg-[#44a024]";
                            textClass = "text-white";
                            shapeClass = "rounded-tl-lg rounded-br-lg";
                        } else {
                            bgClass = "bg-[#ee4b2b]";
                            textClass = "text-white";
                            shapeClass = "rounded";
                        }
                    } else if (isAnswered && isMarked) {
                        bgClass = "bg-[#6a5acd]";
                        textClass = "text-white";
                        shapeClass = "rounded-full relative after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-2 after:h-2 after:bg-green-500 after:border after:border-white after:rounded-sm";
                    } else if (isMarked) {
                        bgClass = "bg-[#6a5acd]";
                        textClass = "text-white";
                        shapeClass = "rounded-full";
                    } else if (visited.has(ch.id)) {
                        bgClass = "bg-[#ee4b2b]";
                        textClass = "text-white";
                        shapeClass = "rounded";
                    }

                    return (
                        <button
                            key={ch.id}
                            onClick={() => {
                                startTransition(() => {
                                    router.push(`/challenges/${categorySlug}/${ch.slug}`);
                                });
                            }}
                            className={`min-w-[44px] h-10 flex items-center justify-center text-sm font-bold border border-zinc-300 mx-1 transition-all ${bgClass} ${textClass} ${shapeClass} ${isCurrent ? "z-10 shadow-md" : ""}`}
                        >
                            {idx + 1}
                        </button>
                    );
                })}
                <div className="min-w-[44px] h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg mx-1 ml-auto">
                    <Info className="w-5 h-5" />
                </div>
            </div>

            {/* Main Layout Area */}
            <div className="flex flex-1 min-h-0">
                {/* Left Section: Question Content */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden">
                    {/* Section Header (Desktop) */}
                    <div className="hidden md:flex bg-[#f0f0f0] border-b border-zinc-300 px-4 py-2 items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <button className="bg-[#007ba1] text-white px-4 py-1.5 text-xs font-bold rounded-t-md -mb-2 border-b-2 border-white">
                                {assessmentMode === "EXAM" ? "General Awareness" : title}
                            </button>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-bold text-zinc-700">
                            <div className="flex items-center gap-2">
                                <Timer className="w-4 h-4 text-zinc-400" />
                                <span>Time Left: </span>
                                <QuizTimer 
                                    categorySlug={categorySlug} 
                                    initialTimerLevel={initialTimerLevel} 
                                    onTimeUp={() => {
                                        toast.error("Time is up! Your exam will be submitted automatically.", {
                                            duration: 5000,
                                            position: "top-center"
                                        });
                                        handleSubmitExam(true);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Question Header (Responsive) */}
                    <div className="bg-[#4b77be] md:bg-[#4b77be] text-white md:text-white px-4 py-2 text-xs font-bold flex justify-between items-center shrink-0 border-b md:border-none border-zinc-300">
                        <span className="hidden md:inline">Question Type: Multiple Choice Question</span>
                        <span className="md:hidden text-zinc-900 bg-white px-2 py-0.5 rounded border border-zinc-300">Question No. {allChallenges.findIndex(c => c.id === id) + 1}</span>
                        <div className="flex items-center gap-2">
                            <span className="hidden md:inline">View in:</span>
                            <select 
                                value={currentLanguage}
                                onChange={(e) => setCurrentLanguage(e.target.value as any)}
                                className="bg-white text-zinc-900 border border-zinc-300 rounded text-[10px] px-1 py-0.5 outline-none font-normal"
                            >
                                <option value="English">English</option>
                                <option value="Hindi">Hindi</option>
                            </select>
                        </div>
                    </div>

                    {/* Question Text & Options */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-start gap-4 mb-8">
                                <span className="hidden md:block text-lg font-bold text-zinc-800 pt-0.5 whitespace-nowrap">
                                    Question No. {allChallenges.findIndex(c => c.id === id) + 1}
                                </span>
                                <div className="flex-1">
                                    <div className="text-base md:text-lg text-zinc-900 mb-8 whitespace-pre-wrap leading-relaxed">
                                        {formattedDescription()}
                                    </div>

                                    {/* MCQ Options */}
                                    {questionType.startsWith("MCQ") && (
                                        <div className="space-y-4">
                                            {options.map((opt, i) => {
                                                const isSelected = selectedOptions.has(opt.id);
                                                return (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => toggleOption(opt.id)}
                                                        disabled={isSubmitted}
                                                        className="w-full flex items-center gap-3 p-2 group text-left hover:bg-zinc-50 transition-colors"
                                                    >
                                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-blue-600" : "border-zinc-400"}`}>
                                                            {isSelected && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                                                        </div>
                                                        <span className="text-zinc-800 text-sm font-medium">{opt.text}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Coding Editor (if needed) */}
                                    {questionType === "CODING" && (
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center justify-between bg-zinc-900 px-4 py-2 rounded-t-lg">
                                                <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">{language}</span>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={handleReset} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400">
                                                        <RotateCcw className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={handleRunCode} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded transition-all">
                                                        <Play className="w-3 h-3 fill-current" /> RUN
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="h-[400px] border border-zinc-800 rounded-b-lg overflow-hidden">
                                                 <Editor
                                                    height="100%"
                                                    defaultLanguage={language.toLowerCase() === "javascript" ? "javascript" : "typescript"}
                                                    theme="vs-dark"
                                                    value={code}
                                                    onChange={(v) => setCode(v || "")}
                                                    options={{ fontSize: 13, minimap: { enabled: false }, padding: { top: 12 }, lineNumbersMinChars: 3 }}
                                                />
                                            </div>
                                            
                                            {/* Sandbox Output Preview */}
                                            {showOutput && (
                                                <div className="mt-4 bg-zinc-900 rounded-lg overflow-hidden border border-zinc-700">
                                                    <div className="bg-zinc-800 px-4 py-2 flex items-center justify-between">
                                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Output</span>
                                                        <button onClick={() => setShowOutput(false)} className="text-zinc-500 hover:text-white">
                                                            <ChevronDown className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <div ref={outputRef} className="p-4 font-mono text-xs text-zinc-300 max-h-48 overflow-y-auto bg-zinc-950 space-y-1">
                                                        {output.length === 0 ? "Running..." : output.map((log, i) => {
                                                            if (log.type === "test") {
                                                                const results = log.content as any[];
                                                                return (
                                                                    <div key={i} className="space-y-1 py-1 border-b border-zinc-800 last:border-0">
                                                                        {results.map((r, ri) => (
                                                                            <div key={ri} className={r.passed ? "text-green-400" : "text-red-400"}>
                                                                                {r.passed ? "✓" : "✗"} Test {ri + 1}: {r.passed ? "Passed" : `Failed (Expected ${r.expected}, got ${r.actual})`}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                );
                                                            }
                                                            return <div key={i} className={log.type === "error" ? "text-red-400" : ""}>{String(log.content)}</div>;
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Footer Action Bar */}
                    <div className="md:hidden border-t border-zinc-300 bg-[#f0f0f0] p-3 flex flex-col gap-2 shrink-0">
                        <div className="flex gap-2">
                            <button
                                onClick={handleClearResponse}
                                className="flex-1 py-2 bg-white border border-zinc-300 text-zinc-700 text-xs font-bold rounded shadow-sm"
                            >
                                Clear Response
                            </button>
                            <button
                                onClick={toggleMarkForReview}
                                className="flex-1 py-2 bg-white border border-zinc-300 text-zinc-700 text-xs font-bold rounded shadow-sm"
                            >
                                Mark for Review & Next
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleSubmitExam(false)}
                                className="flex-1 py-3 bg-[#87b1f5] hover:bg-[#6c9ef2] text-white text-sm font-bold rounded shadow-inner"
                            >
                                Submit
                            </button>
                            <button
                                onClick={handleSubmitQuiz}
                                className="flex-1 py-3 bg-[#44a024] hover:bg-[#3d8c20] text-white text-sm font-bold rounded shadow-inner"
                            >
                                Save & Next
                            </button>
                        </div>
                    </div>

                    {/* Desktop Bottom Action Bar */}
                    <div className="hidden md:flex border-t border-zinc-200 p-4 bg-white items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    toggleMarkForReview();
                                    if (nextChallengeUrl) {
                                        startTransition(() => {
                                            router.push(nextChallengeUrl);
                                        });
                                    }
                                }}
                                className="px-6 py-2.5 bg-white border border-zinc-300 text-zinc-700 text-sm font-medium hover:bg-zinc-50 transition-colors shadow-sm rounded disabled:opacity-50"
                                disabled={isPending}
                            >
                                Mark for Review & Next
                            </button>
                            <button
                                onClick={handleClearResponse}
                                className="px-6 py-2.5 bg-white border border-zinc-300 text-zinc-700 text-sm font-medium hover:bg-zinc-50 transition-colors shadow-sm rounded"
                            >
                                Clear Response
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            {prevChallengeUrl && (
                                <Link href={prevChallengeUrl} className="px-6 py-2.5 bg-white border border-zinc-300 text-zinc-700 text-sm font-medium hover:bg-zinc-50 transition-colors shadow-sm rounded">
                                    Previous
                                </Link>
                            )}
                            <button
                                onClick={handleSubmitQuiz}
                                className="px-8 py-2.5 bg-[#007ba1] hover:bg-[#005a76] text-white text-sm font-bold transition-colors shadow-md rounded"
                            >
                                Save & Next
                            </button>
                        </div>
                    </div>
                </div>

                {/* Desktop Right Section: Palette & Profile */}
                <div className="hidden md:flex w-[300px] lg:w-[320px] bg-[#f9f9f9] border-l border-zinc-300 flex-col shrink-0">
                    {/* User Profile */}
                    <div className="p-4 flex items-center gap-4 bg-white border-b border-zinc-200">
                        {user.image ? (
                            <img src={user.image} alt={user.name} className="w-16 h-20 object-cover rounded shadow-sm bg-zinc-100" />
                        ) : (
                            <div className="w-16 h-20 bg-zinc-100 rounded flex items-center justify-center border border-zinc-200 shadow-sm">
                                <User className="w-8 h-8 text-zinc-300" />
                            </div>
                        )}
                        <div>
                            <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Candidate</span>
                            <h3 className="font-bold text-zinc-900 leading-tight">{user.name}</h3>
                        </div>
                    </div>

                    {/* Status Legend */}
                    <div className="p-4 border-b border-zinc-200">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-bold">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-[#44a024] text-white flex items-center justify-center rounded-tl-xl rounded-br-xl">
                                    {allChallenges.filter(c => c.isAnswered && !markedForReview.has(c.id)).length}
                                </div>
                                <span className="text-zinc-600">Answered</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-[#ee4b2b] text-white flex items-center justify-center rounded-tr-xl rounded-bl-xl">
                                    {allChallenges.filter(c => !c.isAnswered && visited.has(c.id) && !markedForReview.has(c.id)).length}
                                </div>
                                <span className="text-zinc-600">Not Answered</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-[#e5e7eb] text-zinc-600 flex items-center justify-center">
                                    {allChallenges.filter(c => !visited.has(c.id)).length}
                                </div>
                                <span className="text-zinc-600">Not Visited</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-[#6a5acd] text-white flex items-center justify-center rounded-full">
                                    {markedForReview.size}
                                </div>
                                <span className="text-zinc-600">Marked for Review</span>
                            </div>
                            <div className="flex items-center gap-2 col-span-2">
                                <div className="relative w-6 h-6 bg-[#6a5acd] text-white flex items-center justify-center rounded-full">
                                    {allChallenges.filter(c => c.isAnswered && markedForReview.has(c.id)).length}
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border border-white rounded-sm" />
                                </div>
                                <span className="text-zinc-600">Answered & Marked for Review</span>
                            </div>
                        </div>
                    </div>

                    {/* Question Palette Section */}
                    <div className="bg-[#007ba1] text-white px-4 py-1.5 text-xs font-bold shrink-0">
                        General Awareness
                    </div>
                    <div className="bg-[#f2f8fc] border-y border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-700 shrink-0">
                        Choose a Question
                    </div>

                    {/* Palette Grid */}
                    <div className="flex-1 overflow-y-auto p-4 bg-white">
                        <div className="grid grid-cols-4 gap-3">
                            {allChallenges.map((ch, idx) => {
                                const isCurrent = ch.id === id;
                                const isAnswered = ch.isAnswered;
                                const isMarked = markedForReview.has(ch.id);

                                // Determine color coding (Simplified for now)
                                let bgClass = "bg-[#e5e7eb]";
                                let textClass = "text-zinc-600";
                                let shapeClass = "";

                                if (isAnswered && isMarked) {
                                  bgClass = "bg-[#6a5acd]";
                                  textClass = "text-white";
                                  shapeClass = "rounded-full relative after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-2 after:h-2 after:bg-green-500 after:border after:border-white after:rounded-sm";
                                } else if (isMarked) {
                                  bgClass = "bg-[#6a5acd]";
                                  textClass = "text-white";
                                  shapeClass = "rounded-full";
                                } else if (isAnswered) {
                                  bgClass = "bg-[#44a024]";
                                  textClass = "text-white";
                                  shapeClass = "rounded-tl-xl rounded-br-xl";
                                } else if (visited.has(ch.id)) {
                                  bgClass = "bg-[#ee4b2b]";
                                  textClass = "text-white";
                                  shapeClass = "rounded-tr-xl rounded-bl-xl";
                                }

                                return (
                                    <button
                                        key={ch.id}
                                        onClick={() => {
                                            startTransition(() => {
                                                router.push(`/challenges/${categorySlug}/${ch.slug}`);
                                            });
                                        }}
                                        className={`w-10 h-10 flex items-center justify-center text-xs font-bold transition-all hover:scale-105 ${bgClass} ${textClass} ${shapeClass} ${isCurrent ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="p-4 bg-[#f2f8fc] border-t border-zinc-300 shrink-0">
                        <button 
                            onClick={() => handleSubmitExam(false)}
                            className="w-full bg-[#5bc0de] hover:bg-[#31b0d5] text-white font-bold py-2.5 rounded shadow-sm transition-colors text-sm"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
            {/* Mobile Sidebar/Drawer Backdrop */}
            {showMobileMenu && (
                <div 
                    className="fixed inset-0 bg-black/50 z-[100] md:hidden"
                    onClick={() => setShowMobileMenu(false)}
                />
            )}

            {/* Mobile Sidebar/Drawer */}
            <div className={`fixed top-0 right-0 h-full w-[280px] bg-white z-[101] shadow-2xl transition-transform duration-300 md:hidden ${showMobileMenu ? "translate-x-0" : "translate-x-full"}`}>
                <div className="flex flex-col h-full">
                    <div className="p-4 bg-[#1a2d4c] text-white flex items-center justify-between">
                        <span className="font-bold">Palette</span>
                        <button onClick={() => setShowMobileMenu(false)} className="p-1 hover:bg-white/10 rounded">
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                    
                    {/* Reuse Palette Content */}
                    <div className="flex-1 overflow-y-auto flex flex-col">
                        {/* User Profile */}
                        <div className="p-4 flex items-center gap-4 bg-white border-b border-zinc-200">
                            {user.image ? (
                                <img src={user.image} alt={user.name} className="w-16 h-20 object-cover rounded shadow-sm bg-zinc-100" />
                            ) : (
                                <div className="w-16 h-20 bg-zinc-100 rounded flex items-center justify-center border border-zinc-200 shadow-sm">
                                    <User className="w-8 h-8 text-zinc-300" />
                                </div>
                            )}
                            <div>
                                <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Candidate</span>
                                <h3 className="font-bold text-zinc-900 leading-tight">{user.name}</h3>
                            </div>
                        </div>

                        {/* Status Legend */}
                        <div className="p-4 border-b border-zinc-200">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-bold">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-[#44a024] text-white flex items-center justify-center rounded-tl-xl rounded-br-xl">
                                        {allChallenges.filter(c => c.isAnswered && !markedForReview.has(c.id)).length}
                                    </div>
                                    <span className="text-zinc-600">Answered</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-[#ee4b2b] text-white flex items-center justify-center rounded-tr-xl rounded-bl-xl">
                                        {allChallenges.filter(c => !c.isAnswered && visited.has(c.id) && !markedForReview.has(c.id)).length}
                                    </div>
                                    <span className="text-zinc-600">Not Answered</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-[#e5e7eb] text-zinc-600 flex items-center justify-center">
                                        {allChallenges.filter(c => !visited.has(c.id)).length}
                                    </div>
                                    <span className="text-zinc-600">Not Visited</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-[#6a5acd] text-white flex items-center justify-center rounded-full">
                                        {markedForReview.size}
                                    </div>
                                    <span className="text-zinc-600">Marked for Review</span>
                                </div>
                                <div className="flex items-center gap-2 col-span-2">
                                    <div className="relative w-6 h-6 bg-[#6a5acd] text-white flex items-center justify-center rounded-full">
                                        {allChallenges.filter(c => c.isAnswered && markedForReview.has(c.id)).length}
                                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border border-white rounded-sm" />
                                    </div>
                                    <span className="text-zinc-600">Answered & Marked for Review</span>
                                </div>
                            </div>
                        </div>

                        {/* Question Palette Section */}
                        <div className="bg-[#007ba1] text-white px-4 py-1.5 text-xs font-bold">
                            General Awareness
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 bg-white">
                            <div className="grid grid-cols-4 gap-3">
                                {allChallenges.map((ch, idx) => {
                                    const isCurrent = ch.id === id;
                                    const isAnswered = ch.isAnswered;
                                    const isMarked = markedForReview.has(ch.id);

                                    let bgClass = "bg-[#e5e7eb]";
                                    let textClass = "text-zinc-600";
                                    let shapeClass = "";

                                    if (isAnswered && isMarked) {
                                      bgClass = "bg-[#6a5acd]";
                                      textClass = "text-white";
                                      shapeClass = "rounded-full relative after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-2 after:h-2 after:bg-green-500 after:border after:border-white after:rounded-sm";
                                    } else if (isMarked) {
                                      bgClass = "bg-[#6a5acd]";
                                      textClass = "text-white";
                                      shapeClass = "rounded-full";
                                    } else if (isAnswered) {
                                      bgClass = "bg-[#44a024]";
                                      textClass = "text-white";
                                      shapeClass = "rounded-tl-xl rounded-br-xl";
                                    } else if (visited.has(ch.id)) {
                                      bgClass = "bg-[#ee4b2b]";
                                      textClass = "text-white";
                                      shapeClass = "rounded-tr-xl rounded-bl-xl";
                                    }

                                    return (
                                        <button
                                            key={ch.id}
                                            onClick={() => {
                                                setShowMobileMenu(false);
                                                startTransition(() => {
                                                    router.push(`/challenges/${categorySlug}/${ch.slug}`);
                                                });
                                            }}
                                            className={`w-10 h-10 flex items-center justify-center text-xs font-bold transition-all hover:scale-105 ${bgClass} ${textClass} ${shapeClass} ${isCurrent ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
                                        >
                                            {idx + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Mobile Submit */}
                        <div className="p-4 bg-zinc-50 border-t border-zinc-200 mt-auto shrink-0">
                            <button 
                                onClick={() => handleSubmitExam(false)}
                                className="w-full bg-[#5bc0de] text-white font-bold py-3 rounded shadow-sm text-sm"
                            >
                                Final Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
