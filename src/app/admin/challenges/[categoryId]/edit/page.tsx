import { updateChallengeCategory } from "@/actions/challenges";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditCategoryPage({ params }: { params: Promise<{ categoryId: string }> }) {
    const { categoryId } = await params;
    const category = await prisma.challengeCategory.findUnique({
        where: { id: categoryId }
    });

    if (!category) notFound();

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-2xl mx-auto">
                <Link href="/admin/challenges" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 mb-8 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Challenge Manager
                </Link>
                <h1 className="text-2xl font-bold mb-8">Edit Challenge Category</h1>

                <form
                    action={async (formData) => {
                        "use server";
                        await updateChallengeCategory(categoryId, formData);
                        redirect("/admin/challenges");
                    }}
                    className="space-y-6"
                >
                    <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Title *</label>
                        <input name="title" defaultValue={category.title} required placeholder="e.g. Warmup-1" className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Description *</label>
                        <textarea name="description" defaultValue={category.description} required rows={3} placeholder="Simple warmup problems to get started..." className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-2">Type</label>
                            <select name="type" defaultValue={category.type} className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="CODING">💻 Coding</option>
                                <option value="MATH">🧮 Math</option>
                                <option value="CBSE">🏫 CBSE</option>
                                <option value="ICSE">🏫 ICSE</option>
                                <option value="JAC_BOARD">🏫 JAC Board</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-2">Language</label>
                            <select name="language" defaultValue={category.language} className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="JavaScript">JavaScript</option>
                                <option value="Python">Python</option>
                                <option value="Java">Java</option>
                                <option value="TypeScript">TypeScript</option>
                                <option value="Any">Any (Math)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-2">Class Level</label>
                            <select name="classLevel" defaultValue={category.classLevel || ""} className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">None</option>
                                <option value="Class 1">Class 1</option>
                                <option value="Class 2">Class 2</option>
                                <option value="Class 3">Class 3</option>
                                <option value="Class 4">Class 4</option>
                                <option value="Class 5">Class 5</option>
                                <option value="Class 6">Class 6</option>
                                <option value="Class 7">Class 7</option>
                                <option value="Class 8">Class 8</option>
                                <option value="Class 9">Class 9</option>
                                <option value="Class 10">Class 10</option>
                                <option value="Class 11">Class 11</option>
                                <option value="Class 12">Class 12</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-2">Sub Category</label>
                            <select name="subCategory" defaultValue={category.subCategory || ""} className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">None</option>
                                <option value="Previous Year Question">Previous Year Question</option>
                                <option value="Text Book Exercise">Text Book Exercise</option>
                                <option value="Olympiad">Olympiad</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-2">Difficulty (1-5 Stars)</label>
                            <select name="difficultyStars" defaultValue={category.difficultyStars} className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="1">⭐ 1 – Very Easy</option>
                                <option value="2">⭐⭐ 2 – Easy</option>
                                <option value="3">⭐⭐⭐ 3 – Medium</option>
                                <option value="4">⭐⭐⭐⭐ 4 – Hard</option>
                                <option value="5">⭐⭐⭐⭐⭐ 5 – Expert</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-2">Status</label>
                            <select name="isPublished" defaultValue={category.isPublished ? "true" : "false"} className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="true">✅ Published</option>
                                <option value="false">🚫 Draft</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Help Section (shown at bottom of challenge page)</label>
                        <textarea name="helpText" defaultValue={category.helpText || ""} rows={2} placeholder="Quick tips..." className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Full Instructions (Category Instruction Page)</label>
                        <textarea name="fullInstruction" defaultValue={category.fullInstruction || ""} rows={5} placeholder="Instructions..." className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Assessment Mode</label>
                        <select name="assessmentMode" defaultValue={category.assessmentMode} className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="PRACTICE">🎯 Practice (Instant results for each question)</option>
                            <option value="EXAM">📝 Exam (Results shown after final submission)</option>
                        </select>
                        <p className="text-[10px] text-zinc-400 mt-1">Practice mode is best for learning. Exam mode is best for testing.</p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all"
                        >
                            Save Changes
                        </button>
                        <Link href="/admin/challenges" className="px-6 py-3 border border-zinc-200 rounded-xl font-bold text-zinc-600 hover:bg-zinc-50 transition-all text-center">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
