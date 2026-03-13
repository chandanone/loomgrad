import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
    Plus, ArrowLeft, Trash2, Star,
    CheckCircle2, Circle, Eye, EyeOff, Edit3
} from "lucide-react";
import { deleteChallenge, toggleCategoryPublished } from "@/actions/challenges";
import { BulkUploadExcel } from "@/components/admin/BulkUploadExcel";

export const revalidate = 0;

export default async function CategoryProblemsPage({ params }: { params: Promise<{ categoryId: string }> }) {
    const { categoryId } = await params;

    const category = await prisma.challengeCategory.findUnique({
        where: { id: categoryId },
        include: {
            challenges: {
                orderBy: { orderIndex: "asc" },
                include: { _count: { select: { testCases: true } } }
            }
        }
    });

    if (!category) notFound();

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <Link href="/admin/challenges" className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold">{category.title}</h1>
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${category.isPublished ? "bg-green-50 text-green-600 border-green-200" : "bg-zinc-100 text-zinc-500 border-zinc-200"
                                }`}>
                                {category.isPublished ? "Published" : "Draft"}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < category.difficultyStars ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`} />
                            ))}
                            <span className="text-sm text-zinc-400 ml-1">{category.challenges.length} problems</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <form action={async () => {
                            "use server";
                            await toggleCategoryPublished(categoryId, category.isPublished);
                        }}>
                            <button type="submit" className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 text-zinc-600 transition-all">
                                {category.isPublished ? <><EyeOff className="w-4 h-4" /> Unpublish</> : <><Eye className="w-4 h-4" /> Publish</>}
                            </button>
                        </form>
                        <Link
                            href={`/admin/challenges/${categoryId}/edit`}
                            className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 text-zinc-600 transition-all"
                        >
                            <Edit3 className="w-4 h-4" /> Edit
                        </Link>
                        <BulkUploadExcel categoryId={categoryId} />
                        <Link
                            href={`/admin/challenges/${categoryId}/new`}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
                        >
                            <Plus className="w-4 h-4" /> Add Problem
                        </Link>
                    </div>
                </div>

                {/* Help text preview */}
                {category.helpText && (
                    <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800">
                        <p className="font-bold mb-1">Help Section Preview:</p>
                        <p className="text-xs line-clamp-2 text-amber-600 font-mono">{category.helpText}</p>
                    </div>
                )}

                {/* Problems */}
                {category.challenges.length === 0 ? (
                    <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-16 text-center">
                        <h3 className="font-bold text-zinc-700 mb-2">No problems yet</h3>
                        <p className="text-zinc-500 text-sm mb-6">Add your first challenge to this category.</p>
                        <Link href={`/admin/challenges/${categoryId}/new`} className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm">
                            <Plus className="w-4 h-4" /> Add First Problem
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {category.challenges.map((ch, idx) => (
                            <div key={ch.id} className="flex items-center gap-4 p-5 bg-white border border-zinc-200 rounded-2xl hover:border-zinc-300 transition-all group">
                                <span className="text-sm font-bold text-zinc-300 w-6 text-center">{idx + 1}</span>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className="font-bold text-zinc-900">{ch.title}</h3>
                                        <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${ch.isPublished ? "bg-green-50 text-green-600" : "bg-zinc-100 text-zinc-400"
                                            }`}>
                                            {ch.isPublished ? "live" : "draft"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                                        <span className="flex items-center gap-0.5">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} className={`w-3 h-3 ${i < ch.difficultyStars ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`} />
                                            ))}
                                        </span>
                                        <span>{ch._count.testCases} test cases</span>
                                        <span className="text-zinc-300">·</span>
                                        <span className="line-clamp-1 text-zinc-400">{ch.description.slice(0, 80)}...</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link
                                        href={`/admin/challenges/${categoryId}/${ch.id}/edit`}
                                        className="text-xs font-bold text-zinc-500 border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50 transition-all"
                                    >
                                        Edit
                                    </Link>
                                    <form action={async () => {
                                        "use server";
                                        await deleteChallenge(ch.id, categoryId);
                                    }}>
                                        <button type="submit" className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-all">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
