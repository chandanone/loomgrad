import { createChallenge } from "@/actions/challenges";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ChallengeForm } from "../ChallengeForm";

export default async function NewChallengePage({ params }: { params: Promise<{ categoryId: string }> }) {
    const { categoryId } = await params;
    const category = await prisma.challengeCategory.findUnique({ where: { id: categoryId } });
    if (!category) notFound();

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-2xl mx-auto">
                <Link href={`/admin/challenges/${categoryId}`} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 mb-8 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to {category.title}
                </Link>
                <h1 className="text-2xl font-bold mb-8">Add Problem to <span className="text-blue-600">{category.title}</span></h1>

                <ChallengeForm
                    categoryId={categoryId}
                    action={async (formData) => {
                        "use server";
                        await createChallenge(categoryId, formData);
                        redirect(`/admin/challenges/${categoryId}`);
                    }}
                    submitLabel="Create Problem"
                />
            </div>
        </div>
    );
}
