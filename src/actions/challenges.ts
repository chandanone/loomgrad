"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }
    return session;
}

function makeSlug(title: string) {
    return title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "").slice(0, 80);
}

// ─── CATEGORY ACTIONS ────────────────────────────────────────────────────────

export async function createChallengeCategory(formData: FormData) {
    await requireAdmin();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const type = (formData.get("type") as string) || "CODING";
    const difficultyStars = parseInt(formData.get("difficultyStars") as string) || 1;
    const language = (formData.get("language") as string) || "JavaScript";
    const helpText = formData.get("helpText") as string;
    const fullInstruction = formData.get("fullInstruction") as string;
    const assessmentMode = (formData.get("assessmentMode") as string) || "PRACTICE";
    const classLevel = formData.get("classLevel") as string;
    const subCategory = formData.get("subCategory") as string;

    if (!title || !description) throw new Error("Title and description are required.");

    const slug = makeSlug(title);

    // count existing to set orderIndex
    const count = await prisma.challengeCategory.count();

    await prisma.challengeCategory.create({
        data: {
            title,
            slug: `${slug}-${Date.now()}`,
            description,
            type: type as any,
            difficultyStars,
            language,
            helpText: helpText || null,
            fullInstruction: fullInstruction || null,
            assessmentMode: assessmentMode,
            classLevel: classLevel || null,
            subCategory: subCategory || null,
            orderIndex: count,
        }
    });

    revalidatePath("/admin/challenges");
    revalidatePath("/challenges");
}

export async function updateChallengeCategory(categoryId: string, formData: FormData) {
    await requireAdmin();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const type = formData.get("type") as string;
    const difficultyStars = parseInt(formData.get("difficultyStars") as string) || 1;
    const language = formData.get("language") as string;
    const helpText = formData.get("helpText") as string;
    const fullInstruction = formData.get("fullInstruction") as string;
    const assessmentMode = formData.get("assessmentMode") as string;
    const classLevel = formData.get("classLevel") as string;
    const subCategory = formData.get("subCategory") as string;
    const isPublished = formData.get("isPublished") === "true";

    await prisma.challengeCategory.update({
        where: { id: categoryId },
        data: { title, description, type: type as any, difficultyStars, language, helpText, fullInstruction, assessmentMode, classLevel: classLevel || null, subCategory: subCategory || null, isPublished }
    });

    revalidatePath("/admin/challenges");
    revalidatePath("/challenges");
}

export async function deleteChallengeCategory(categoryId: string) {
    await requireAdmin();
    await prisma.challengeCategory.delete({ where: { id: categoryId } });
    revalidatePath("/admin/challenges");
    revalidatePath("/challenges");
}

export async function toggleCategoryPublished(categoryId: string, current: boolean) {
    await requireAdmin();
    await prisma.challengeCategory.update({
        where: { id: categoryId },
        data: { isPublished: !current }
    });
    revalidatePath("/admin/challenges");
    revalidatePath("/challenges");
}

// ─── CHALLENGE ACTIONS ───────────────────────────────────────────────────────

export async function createChallenge(categoryId: string, formData: FormData) {
    await requireAdmin();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const type = (formData.get("type") as string) || "CODING";
    const questionType = (formData.get("questionType") as string) || "CODING";
    const language = (formData.get("language") as string) || "JavaScript";
    const difficultyStars = parseInt(formData.get("difficultyStars") as string) || 1;
    const starterCode = formData.get("starterCode") as string;
    const solution = formData.get("solution") as string;
    const hint = formData.get("hint") as string;
    const correctAnswer = formData.get("correctAnswer") as string;

    if (!title || !description) throw new Error("Title and description are required.");

    const count = await prisma.challenge.count({ where: { categoryId } });
    const slug = makeSlug(title);

    const challenge = await prisma.challenge.create({
        data: {
            categoryId,
            title,
            slug: `${slug}-${count}`,
            description,
            type: type as any,
            questionType: questionType as any,
            difficultyStars,
            starterCode: starterCode || null,
            solution: solution || null,
            hint: hint || null,
            correctAnswer: correctAnswer || null,
            language,
            orderIndex: count,
        }
    });

    // Parse test cases from JSON string
    const testCasesRaw = formData.get("testCases") as string;
    if (testCasesRaw) {
        try {
            const testCases: { input: string; expectedOutput: string }[] = JSON.parse(testCasesRaw);
            if (testCases.length > 0) {
                await prisma.challengeTestCase.createMany({
                    data: testCases.map((tc, i) => ({
                        challengeId: challenge.id,
                        input: tc.input,
                        expectedOutput: tc.expectedOutput,
                        orderIndex: i,
                    }))
                });
            }
        } catch { /* skip bad JSON */ }
    }

    // Parse options from JSON string
    const optionsRaw = formData.get("options") as string;
    if (optionsRaw) {
        try {
            const options: { text: string; isCorrect: boolean }[] = JSON.parse(optionsRaw);
            if (options.length > 0) {
                await prisma.challengeOption.createMany({
                    data: options.map((opt, i) => ({
                        challengeId: challenge.id,
                        text: opt.text,
                        isCorrect: !!opt.isCorrect,
                        orderIndex: i,
                    }))
                });
            }
        } catch { /* skip bad JSON */ }
    }

    revalidatePath(`/admin/challenges/${categoryId}`);
    revalidatePath("/challenges");
}

export async function updateChallenge(challengeId: string, categoryId: string, formData: FormData) {
    await requireAdmin();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const type = formData.get("type") as string;
    const questionType = formData.get("questionType") as string;
    const difficultyStars = parseInt(formData.get("difficultyStars") as string) || 1;
    const starterCode = formData.get("starterCode") as string;
    const solution = formData.get("solution") as string;
    const hint = formData.get("hint") as string;
    const correctAnswer = formData.get("correctAnswer") as string;
    const language = (formData.get("language") as string) || "JavaScript";
    const isPublished = formData.get("isPublished") === "true";

    await prisma.challenge.update({
        where: { id: challengeId },
        data: { title, description, type: type as any, questionType: questionType as any, difficultyStars, starterCode, solution, hint, correctAnswer, language, isPublished }
    });

    // Replace test cases
    const testCasesRaw = formData.get("testCases") as string;
    if (testCasesRaw) {
        try {
            const testCases: { input: string; expectedOutput: string }[] = JSON.parse(testCasesRaw);
            await prisma.challengeTestCase.deleteMany({ where: { challengeId } });
            if (testCases.length > 0) {
                await prisma.challengeTestCase.createMany({
                    data: testCases.map((tc, i) => ({
                        challengeId,
                        input: tc.input,
                        expectedOutput: tc.expectedOutput,
                        orderIndex: i,
                    }))
                });
            }
        } catch { /* skip */ }
    }

    // Replace options
    const optionsRaw = formData.get("options") as string;
    if (optionsRaw) {
        try {
            const options: { text: string; isCorrect: boolean }[] = JSON.parse(optionsRaw);
            await prisma.challengeOption.deleteMany({ where: { challengeId } });
            if (options.length > 0) {
                await prisma.challengeOption.createMany({
                    data: options.map((opt, i) => ({
                        challengeId,
                        text: opt.text,
                        isCorrect: !!opt.isCorrect,
                        orderIndex: i,
                    }))
                });
            }
        } catch { /* skip */ }
    }

    revalidatePath(`/admin/challenges/${categoryId}`);
    revalidatePath("/challenges");
}

export async function deleteChallenge(challengeId: string, categoryId: string) {
    await requireAdmin();
    await prisma.challenge.delete({ where: { id: challengeId } });
    revalidatePath(`/admin/challenges/${categoryId}`);
    revalidatePath("/challenges");
}

export async function submitChallengeResult(
    challengeId: string,
    status: "PASSED" | "FAILED",
    code: string,
    passedTests: number = 0,
    totalTests: number = 0
) {
    const session = await auth();
    if (!session?.user?.id) return; // Ignore if not logged in

    const userId = session.user.id;

    await prisma.challengeSubmission.create({
        data: {
            userId,
            challengeId,
            status,
            code: code || "",
            passedTests,
            totalTests,
        }
    });

    revalidatePath("/challenges");
}
