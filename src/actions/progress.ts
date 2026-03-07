"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateLessonProgress(courseId: string, lessonId: string, isCompleted: boolean = false) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const progress = await prisma.progress.upsert({
            where: {
                userId_lessonId: {
                    userId: session.user.id,
                    lessonId: lessonId,
                },
            },
            update: {
                lastWatchedAt: new Date(),
                isCompleted: isCompleted,
                ...(isCompleted ? { completedAt: new Date() } : {}),
            },
            create: {
                userId: session.user.id,
                courseId: courseId,
                lessonId: lessonId,
                lastWatchedAt: new Date(),
                isCompleted: isCompleted,
                ...(isCompleted ? { completedAt: new Date() } : {}),
            },
        });

        revalidatePath(`/courses/[courseSlug]`, "page");
        return { success: true, progress };
    } catch (error) {
        console.error("Error updating progress:", error);
        return { error: "Failed to update progress" };
    }
}
