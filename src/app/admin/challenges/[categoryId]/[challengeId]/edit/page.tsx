import { updateChallenge } from "@/actions/challenges";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ChallengeForm } from "../../ChallengeForm";

export default async function EditChallengePage({ params }: { params: Promise<{ categoryId: string; challengeId: string }> }) {
    const { categoryId, challengeId } = await params;

    const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId },
        include: {
            testCases: { orderBy: { orderIndex: "asc" } },
            options: { orderBy: { orderIndex: "asc" } }
        }
    });
    if (!challenge) notFound();

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-2xl mx-auto">
                <Link href={`/admin/challenges/${categoryId}`} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 mb-8 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Problems
                </Link>
                <h1 className="text-2xl font-bold mb-8">Edit: <span className="text-blue-600">{challenge.title}</span></h1>

                <ChallengeForm
                    categoryId={categoryId}
                    defaultValues={{
                        title: challenge.title,
                        description: challenge.description,
                        type: challenge.type,
                        questionType: challenge.questionType as any,
                        difficultyStars: challenge.difficultyStars,
                        language: challenge.language,
                        starterCode: challenge.starterCode || "",
                        solution: challenge.solution || "",
                        hint: challenge.hint || "",
                        correctAnswer: challenge.correctAnswer || "",
                        isPublished: challenge.isPublished,
                        testCases: challenge.testCases,
                        options: challenge.options
                    }}
                    action={async (formData) => {
                        "use server";
                        await updateChallenge(challengeId, categoryId, formData);
                        redirect(`/admin/challenges/${categoryId}`);
                    }}
                    submitLabel="Save Changes"
                />
            </div>
        </div>
    );
}
