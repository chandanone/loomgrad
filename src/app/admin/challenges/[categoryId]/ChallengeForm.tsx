"use client";

import { useState } from "react";
import { Plus, Trash2, CheckCircle, Circle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type QuestionType = "CODING" | "MCQ_SINGLE" | "MCQ_MULTI" | "FILL_BLANK";

interface TestCase { input: string; expectedOutput: string; }
interface MCQOption { text: string; isCorrect: boolean; }

interface ChallengeFormProps {
    categoryId: string;
    defaultValues?: {
        title?: string;
        description?: string;
        type?: string;          // ChallengeType (CODING | MATH)
        questionType?: QuestionType;
        difficultyStars?: number;
        starterCode?: string;
        solution?: string;
        hint?: string;
        correctAnswer?: string;
        isPublished?: boolean;
        language?: string;
        testCases?: TestCase[];
        options?: MCQOption[];
    };
    action: (formData: FormData) => Promise<void>;
    submitLabel?: string;
}

export function ChallengeForm({
    categoryId,
    defaultValues = {},
    action,
    submitLabel = "Save",
}: ChallengeFormProps) {
    const [questionType, setQuestionType] = useState<QuestionType>(
        defaultValues.questionType || "CODING"
    );
    const [testCases, setTestCases] = useState<TestCase[]>(
        defaultValues.testCases?.length ? defaultValues.testCases : [{ input: "", expectedOutput: "" }]
    );
    const [options, setOptions] = useState<MCQOption[]>(
        defaultValues.options?.length
            ? defaultValues.options
            : [{ text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }]
    );

    // ─── MCQ helpers ──────────────────────────────────────────────────────────
    const addOption = () => setOptions(p => [...p, { text: "", isCorrect: false }]);
    const removeOption = (i: number) => setOptions(p => p.filter((_, idx) => idx !== i));
    const updateOptionText = (i: number, text: string) =>
        setOptions(p => p.map((o, idx) => idx === i ? { ...o, text } : o));

    const toggleSingleCorrect = (i: number) =>
        setOptions(p => p.map((o, idx) => ({ ...o, isCorrect: idx === i })));

    const toggleMultiCorrect = (i: number) =>
        setOptions(p => p.map((o, idx) => idx === i ? { ...o, isCorrect: !o.isCorrect } : o));

    // ─── Test case helpers ────────────────────────────────────────────────────
    const addTestCase = () => setTestCases(p => [...p, { input: "", expectedOutput: "" }]);
    const removeTestCase = (i: number) => setTestCases(p => p.filter((_, idx) => idx !== i));
    const updateTestCase = (i: number, field: keyof TestCase, value: string) =>
        setTestCases(p => p.map((tc, idx) => idx === i ? { ...tc, [field]: value } : tc));

    const QUESTION_TYPES: { value: QuestionType; label: string; desc: string }[] = [
        { value: "CODING", label: "💻 Coding", desc: "Write a function" },
        { value: "MCQ_SINGLE", label: "🔘 MCQ Single", desc: "One correct answer" },
        { value: "MCQ_MULTI", label: "☑️ MCQ Multi", desc: "Multiple correct answers" },
        { value: "FILL_BLANK", label: "✏️ Fill in Blank", desc: "Type the answer" },
    ];

    return (
        <form
            action={async (fd: FormData) => {
                fd.set("questionType", questionType);
                fd.set("testCases", JSON.stringify(questionType === "CODING" ? testCases : []));
                fd.set("options", JSON.stringify(questionType.startsWith("MCQ") ? options : []));
                await action(fd);
            }}
            className="space-y-6"
        >
            <input type="hidden" name="categoryId" value={categoryId} />

            {/* Title */}
            <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">Problem Title *</label>
                <input
                    name="title" required defaultValue={defaultValues.title}
                    placeholder="e.g. sleepIn / What is 2+2?"
                    className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">Description *</label>
                <textarea
                    name="description" required defaultValue={defaultValues.description}
                    rows={4} placeholder="Describe the problem clearly..."
                    className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
            </div>

            {/* Question Type Selector */}
            <div>
                <label className="block text-sm font-bold text-zinc-700 mb-3">Question Type *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {QUESTION_TYPES.map(qt => (
                        <button
                            key={qt.value}
                            type="button"
                            onClick={() => setQuestionType(qt.value)}
                            className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all text-center ${questionType === qt.value
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                                }`}
                        >
                            <span className="text-xl">{qt.label.split(" ")[0]}</span>
                            <span className="text-xs font-bold">{qt.label.split(" ").slice(1).join(" ")}</span>
                            <span className="text-[10px] text-zinc-400">{qt.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Shared Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">Challenge Type</label>
                    <select name="type" defaultValue={defaultValues.type || "CODING"} className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="CODING">💻 Coding</option>
                        <option value="MATH">🧮 Math</option>
                        <option value="CBSE">🏫 CBSE</option>
                        <option value="ICSE">🏫 ICSE</option>
                        <option value="JAC_BOARD">🏫 JAC Board</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">Difficulty</label>
                    <select name="difficultyStars" defaultValue={defaultValues.difficultyStars || 1} className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="1">⭐ 1 – Very Easy</option>
                        <option value="2">⭐⭐ 2 – Easy</option>
                        <option value="3">⭐⭐⭐ 3 – Medium</option>
                        <option value="4">⭐⭐⭐⭐ 4 – Hard</option>
                        <option value="5">⭐⭐⭐⭐⭐ 5 – Expert</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">Status</label>
                    <select name="isPublished" defaultValue={defaultValues.isPublished !== false ? "true" : "false"} className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="true">✅ Live</option>
                        <option value="false">🚫 Draft</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">Language (Sandbox)</label>
                    <select name="language" defaultValue={defaultValues.language || "JavaScript"} className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="JavaScript">JavaScript</option>
                        <option value="Python">Python</option>
                        <option value="Java">Java</option>
                        <option value="TypeScript">TypeScript</option>
                    </select>
                </div>
            </div>

            {/* Hint (shared) */}
            <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">Hint <span className="text-zinc-400 font-normal">(shown to students)</span></label>
                <input name="hint" defaultValue={defaultValues.hint} placeholder="Optional hint..." className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* ── CODING fields ─────────────────────────────────────────── */}
            {questionType === "CODING" && (
                <div className="space-y-6 p-5 bg-zinc-50 border border-zinc-200 rounded-2xl">
                    <h3 className="text-sm font-bold text-zinc-700 uppercase tracking-widest">💻 Coding Settings</h3>

                    <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Starter Code</label>
                        <textarea name="starterCode" defaultValue={defaultValues.starterCode} rows={6}
                            placeholder={"function sleepIn(weekday, vacation) {\n  // Write your code here\n}"}
                            className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Sample Solution</label>
                        <textarea name="solution" defaultValue={defaultValues.solution} rows={5}
                            placeholder={"function sleepIn(weekday, vacation) {\n  return !weekday || vacation;\n}"}
                            className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white" />
                    </div>

                    {/* Test Cases */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-bold text-zinc-700">Test Cases</label>
                            <button type="button" onClick={addTestCase} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
                                <Plus className="w-3.5 h-3.5" /> Add Test Case
                            </button>
                        </div>
                        <div className="space-y-3">
                            {testCases.map((tc, i) => (
                                <div key={i} className="flex gap-3 items-start p-3 bg-white border border-zinc-200 rounded-xl">
                                    <span className="text-xs font-bold text-zinc-400 mt-2.5 w-4 shrink-0">{i + 1}</span>
                                    <div className="flex-1 grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Input</label>
                                            <input value={tc.input} onChange={e => updateTestCase(i, "input", e.target.value)}
                                                placeholder="false, false"
                                                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm font-mono bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Expected Output</label>
                                            <input value={tc.expectedOutput} onChange={e => updateTestCase(i, "expectedOutput", e.target.value)}
                                                placeholder="true"
                                                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm font-mono bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    </div>
                                    {testCases.length > 1 && (
                                        <button type="button" onClick={() => removeTestCase(i)} className="mt-6 p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── MCQ fields ────────────────────────────────────────────── */}
            {(questionType === "MCQ_SINGLE" || questionType === "MCQ_MULTI") && (
                <div className="space-y-4 p-5 bg-zinc-50 border border-zinc-200 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-zinc-700 uppercase tracking-widest">
                            {questionType === "MCQ_SINGLE" ? "🔘 Answer Options (pick ONE correct)" : "☑️ Answer Options (pick ALL correct)"}
                        </h3>
                        <button type="button" onClick={addOption} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
                            <Plus className="w-3.5 h-3.5" /> Add Option
                        </button>
                    </div>

                    <p className="text-xs text-zinc-500">
                        {questionType === "MCQ_SINGLE"
                            ? "Click the circle icon to mark the single correct answer."
                            : "Click the checkbox icons to mark all correct answers."}
                    </p>

                    <div className="space-y-2">
                        {options.map((opt, i) => (
                            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${opt.isCorrect ? "border-green-400 bg-green-50" : "border-zinc-200 bg-white"
                                }`}>
                                {/* Correct toggle */}
                                <button
                                    type="button"
                                    onClick={() => questionType === "MCQ_SINGLE" ? toggleSingleCorrect(i) : toggleMultiCorrect(i)}
                                    className="shrink-0"
                                    title="Mark as correct"
                                >
                                    {opt.isCorrect
                                        ? <CheckCircle className="w-5 h-5 text-green-500" />
                                        : <Circle className="w-5 h-5 text-zinc-300 hover:text-green-400 transition-colors" />
                                    }
                                </button>

                                {/* Option label */}
                                <span className="text-xs font-bold text-zinc-400 w-5 shrink-0">
                                    {String.fromCharCode(65 + i)}
                                </span>

                                <input
                                    value={opt.text}
                                    onChange={e => updateOptionText(i, e.target.value)}
                                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                    className={`flex-1 bg-transparent text-sm font-medium focus:outline-none placeholder:text-zinc-300 ${opt.isCorrect ? "text-green-700" : "text-zinc-800"}`}
                                />

                                {options.length > 2 && (
                                    <button type="button" onClick={() => removeOption(i)} className="p-1 text-zinc-300 hover:text-red-500 transition-colors shrink-0">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Solution explanation for MCQ */}
                    <div className="mt-4">
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Solution Explanation <span className="text-zinc-400 font-normal">(shown after answering)</span></label>
                        <textarea name="solution" defaultValue={defaultValues.solution} rows={3}
                            placeholder="Explain why the correct answer(s) are right..."
                            className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white" />
                    </div>
                </div>
            )}

            {/* ── FILL_BLANK fields ────────────────────────────────────── */}
            {questionType === "FILL_BLANK" && (
                <div className="space-y-4 p-5 bg-zinc-50 border border-zinc-200 rounded-2xl">
                    <h3 className="text-sm font-bold text-zinc-700 uppercase tracking-widest">✏️ Fill in the Blank</h3>
                    <p className="text-xs text-zinc-500">
                        In the description, use <code className="bg-zinc-200 px-1 rounded">___</code> to denote the blank. The student will type in their answer.
                    </p>

                    <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Correct Answer *</label>
                        <input
                            name="correctAnswer"
                            defaultValue={defaultValues.correctAnswer}
                            required
                            placeholder="e.g. recursion"
                            className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                        <p className="text-xs text-zinc-400 mt-1.5">Comparison is case-insensitive and trims whitespace.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Solution Explanation</label>
                        <textarea name="solution" defaultValue={defaultValues.solution} rows={3}
                            placeholder="Explain the correct answer..."
                            className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white" />
                    </div>
                </div>
            )}

            {/* Submit */}
            <div className="pt-4">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all">
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}
