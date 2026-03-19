import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
    Plus, Code2, Calculator, Eye, EyeOff, Trash2,
    Star, ChevronRight, BookOpen, FlaskConical
} from "lucide-react";
import { toggleCategoryPublished, deleteChallengeCategory } from "@/actions/challenges";

export const revalidate = 0;

export default async function AdminChallengesPage() {
    const categories = await prisma.challengeCategory.findMany({
        orderBy: { orderIndex: "asc" },
        include: {
            _count: { select: { challenges: true } }
        }
    });

    return (
        <div className="min-h-screen bg-white text-zinc-900 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1">Challenge Manager</h1>
                        <p className="text-zinc-500 text-sm">Create and manage standalone coding & math challenge sets.</p>
                    </div>
                    <Link
                        href="/admin/challenges/new"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-200"
                    >
                        <Plus className="w-4 h-4" /> New Category
                    </Link>
                </div>

                {/* Categories */}
                {categories.length === 0 ? (
                    <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-20 text-center">
                        <FlaskConical className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-zinc-700 mb-2">No challenge sets yet</h3>
                        <p className="text-zinc-500 text-sm mb-6">Create your first category to get started (e.g. Warmup-1, Logic Problems).</p>
                        <Link
                            href="/admin/challenges/new"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold"
                        >
                            <Plus className="w-4 h-4" /> Create Category
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                className="bg-white border border-zinc-200 rounded-2xl p-6 hover:border-zinc-300 transition-all shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Type icon */}
                                    <div className={`p-3 rounded-xl ${(cat.type === "MATH" || cat.type === "CBSE" || cat.type === "ICSE" || cat.type === "JAC_BOARD") ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                                        }`}>
                                        {(cat.type === "MATH" || cat.type === "CBSE" || cat.type === "ICSE" || cat.type === "JAC_BOARD")
                                            ? <Calculator className="w-5 h-5" />
                                            : <Code2 className="w-5 h-5" />
                                        }
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-lg leading-tight">{cat.title}</h3>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${cat.isPublished
                                                ? "bg-green-50 text-green-600 border border-green-200"
                                                : "bg-zinc-100 text-zinc-500 border border-zinc-200"
                                                }`}>
                                                {cat.isPublished ? "Published" : "Draft"}
                                            </span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500">
                                                {cat.type}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-zinc-500">
                                            <span>{cat._count.challenges} problems</span>
                                            <span className="flex items-center gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-3.5 h-3.5 ${i < cat.difficultyStars ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`}
                                                    />
                                                ))}
                                            </span>
                                            <span className="font-mono text-xs text-zinc-400">{cat.language}</span>
                                            {cat.classLevel && <span className="text-xs text-zinc-400 bg-zinc-100 px-2 rounded-md">{cat.classLevel}</span>}
                                            {cat.subCategory && <span className="text-xs text-zinc-400 bg-zinc-100 px-2 rounded-md">{cat.subCategory}</span>}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Link
                                            href={`/admin/challenges/${cat.id}`}
                                            className="flex items-center gap-1.5 text-sm font-bold text-zinc-600 border border-zinc-200 px-3 py-2 rounded-xl hover:bg-zinc-50 transition-all"
                                        >
                                            <BookOpen className="w-3.5 h-3.5" /> Problems
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </Link>

                                        <form action={async () => {
                                            "use server";
                                            await toggleCategoryPublished(cat.id, cat.isPublished);
                                        }}>
                                            <button
                                                type="submit"
                                                className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-500 transition-all"
                                                title={cat.isPublished ? "Unpublish" : "Publish"}
                                            >
                                                {cat.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </form>

                                        <Link
                                            href={`/admin/challenges/${cat.id}/edit`}
                                            className="p-2 rounded-xl border border-zinc-200 hover:bg-blue-50 hover:border-blue-200 text-zinc-500 hover:text-blue-600 transition-all"
                                            title="Edit"
                                        >
                                            <Code2 className="w-4 h-4" />
                                        </Link>

                                        <form action={async () => {
                                            "use server";
                                            await deleteChallengeCategory(cat.id);
                                        }}>
                                            <button
                                                type="submit"
                                                className="p-2 rounded-xl border border-zinc-200 hover:bg-red-50 hover:border-red-200 text-zinc-400 hover:text-red-600 transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
