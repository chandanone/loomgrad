import { createChallengeCategory } from "@/actions/challenges";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewCategoryPage() {
    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-2xl mx-auto">
                <Link href="/admin/challenges" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 mb-8 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Challenge Manager
                </Link>
                <h1 className="text-2xl font-bold mb-8">Create Challenge Category</h1>

                <form
                    action={async (formData) => {
                        "use server";
                        await createChallengeCategory(formData);
                        redirect("/admin/challenges");
                    }}
                    className="space-y-6"
                >
                    <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Title *</label>
                        <input name="title" required placeholder="e.g. Warmup-1" className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Description *</label>
                        <textarea name="description" required rows={3} placeholder="Simple warmup problems to get started..." className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-2">Type</label>
                            <select name="type" className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="CODING">💻 Coding</option>
                                <option value="MATH">🧮 Math</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-2">Language</label>
                            <select name="language" className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="JavaScript">JavaScript</option>
                                <option value="Python">Python</option>
                                <option value="Java">Java</option>
                                <option value="TypeScript">TypeScript</option>
                                <option value="Any">Any (Math)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Difficulty (1-5 Stars)</label>
                        <select name="difficultyStars" className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="1">⭐ 1 – Very Easy</option>
                            <option value="2">⭐⭐ 2 – Easy</option>
                            <option value="3">⭐⭐⭐ 3 – Medium</option>
                            <option value="4">⭐⭐⭐⭐ 4 – Hard</option>
                            <option value="5">⭐⭐⭐⭐⭐ 5 – Expert</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Help Section (shown at bottom of challenge page)</label>
                        <textarea name="helpText" rows={4} placeholder="### Help Resources&#10;- Use loops for iteration&#10;- Refer to MDN docs..." className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-none" />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all"
                        >
                            Create Category
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
