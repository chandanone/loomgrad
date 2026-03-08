"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getPlaylistMetadata, getPlaylistVideos } from "@/lib/youtube";
import { revalidatePath } from "next/cache";

export async function importYouTubePlaylist(playlistId: string, offerFreeTrial: boolean = false) {
    try {
        // 0. Check if course already exists
        const existingCourse = await prisma.course.findUnique({
            where: { youtubePlaylistId: playlistId },
        });

        if (existingCourse) {
            throw new Error("course with this id already exist, pls try with some other playlistid");
        }

        // 1. Fetch metadata and videos
        const metadata = await getPlaylistMetadata(playlistId);
        const videos = await getPlaylistVideos(playlistId);

        if (!videos.length) {
            throw new Error("No videos found in this playlist.");
        }

        // 2. Create Course
        const slug = metadata.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

        const course = await prisma.course.create({
            data: {
                title: metadata.title,
                description: metadata.description,
                thumbnail: metadata.thumbnail,
                youtubePlaylistId: playlistId,
                slug: `${slug}-${Date.now()}`,
                isPublished: false,
                offerFreeTrial: offerFreeTrial,
            },
        });

        // 3. Create Default Module
        const module = await prisma.module.create({
            data: {
                courseId: course.id,
                title: "Main Course Content",
                orderIndex: 0,
            },
        });

        // 4. Create Lessons
        await prisma.lesson.createMany({
            data: videos.map((video, index) => ({
                moduleId: module.id,
                title: video.title,
                slug: video.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "") + `-${index}`,
                youtubeVideoId: video.videoId,
                description: video.description,
                orderIndex: index,
                isFree: index === 0, // First video is free
            })),
        });

        revalidatePath("/admin/import");
        revalidatePath("/courses");

        return { success: true, courseId: course.id };
    } catch (error: any) {
        console.error("Failed to import playlist:", error);
        return { success: false, error: error.message || "An unknown error occurred" };
    }
}

export async function updateCourseStatus(courseId: string, isPublished: boolean) {
    try {
        await prisma.course.update({
            where: { id: courseId },
            data: { isPublished },
        });

        revalidatePath("/admin/courses");
        revalidatePath("/courses");
        revalidatePath(`/courses/${courseId}`);

        return { success: true };
    } catch (error: any) {
        console.error("Failed to update course status:", error);
        return { success: false, error: error.message || "Failed to update course status" };
    }
}

export async function deleteCourse(courseId: string) {
    try {
        // Prisma cascade delete will handle modules and lessons since they are defined with onDelete: Cascade
        await prisma.course.delete({
            where: { id: courseId },
        });

        revalidatePath("/admin/courses");
        revalidatePath("/courses");

        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete course:", error);
        return { success: false, error: error.message || "Failed to delete course" };
    }
}

export async function grantUserAccess(userEmail: string, courseId: string, durationDays: number) {
    try {
        const user = await prisma.user.findUnique({
            where: { email: userEmail },
        });

        if (!user) {
            return { success: false, error: "User not found with this email" };
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);

        await prisma.courseAccess.upsert({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId: courseId,
                },
            },
            create: {
                userId: user.id,
                courseId: courseId,
                expiresAt: expiresAt,
            },
            update: {
                expiresAt: expiresAt,
            },
        });

        revalidatePath(`/courses/${courseId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to grant access:", error);
        return { success: false, error: error.message || "Failed to grant access" };
    }
}

export async function updateUserRole(userId: string, role: 'ADMIN' | 'STUDENT') {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role }
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update user role:", error);
        return { success: false, error: "Failed to update user role" };
    }
}

export async function deleteUser(userId: string) {
    try {
        await prisma.user.delete({
            where: { id: userId }
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete user:", error);
        return { success: false, error: "Failed to delete user" };
    }
}
// --- New Course Management Actions ---

export async function updateCourseDetails(courseId: string, data: {
    title?: string;
    description?: string;
    price?: number;
    duration?: string;
    level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    category?: string;
    offerFreeTrial?: boolean;
    hasSandbox?: boolean;
    hasWhiteboard?: boolean;
}) {
    try {
        await prisma.course.update({
            where: { id: courseId },
            data
        });

        revalidatePath("/admin/courses");
        revalidatePath(`/admin/courses/${courseId}`);
        revalidatePath("/courses");
        revalidatePath(`/courses/${courseId}`);

        return { success: true };
    } catch (error: any) {
        console.error("Failed to update course details:", error);
        return { success: false, error: "Failed to update course details" };
    }
}

export async function createModule(courseId: string, title: string, orderIndex: number) {
    try {
        const module = await prisma.module.create({
            data: {
                courseId,
                title,
                orderIndex,
            }
        });

        revalidatePath(`/admin/courses/${courseId}`);
        return { success: true, module };
    } catch (error: any) {
        console.error("Failed to create module:", error);
        return { success: false, error: "Failed to create module" };
    }
}

export async function updateModule(moduleId: string, title: string) {
    try {
        const module = await prisma.module.update({
            where: { id: moduleId },
            data: { title }
        });

        revalidatePath(`/admin/courses/${module.courseId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Failed to update module" };
    }
}

export async function deleteModule(moduleId: string) {
    try {
        const module = await prisma.module.findUnique({ where: { id: moduleId } });
        if (!module) return { success: false, error: "Module not found" };

        await prisma.module.delete({ where: { id: moduleId } });

        revalidatePath(`/admin/courses/${module.courseId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Failed to delete module" };
    }
}

export async function deleteLesson(lessonId: string) {
    try {
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { module: true }
        });
        if (!lesson) return { success: false, error: "Lesson not found" };

        await prisma.lesson.delete({ where: { id: lessonId } });

        revalidatePath(`/admin/courses/${lesson.module.courseId}`);
        revalidatePath(`/courses/${lesson.module.courseId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Failed to delete lesson" };
    }
}

/**
 * Rearranges lessons by updating their module and order index.
 * items: Array of { lessonId, moduleId, orderIndex }
 */
export async function rearrangeLessons(courseId: string, items: { lessonId: string, moduleId: string, orderIndex: number }[]) {
    try {
        await prisma.$transaction(
            items.map(item =>
                prisma.lesson.update({
                    where: { id: item.lessonId },
                    data: {
                        moduleId: item.moduleId,
                        orderIndex: item.orderIndex
                    }
                })
            )
        );

        revalidatePath(`/admin/courses/${courseId}`);
        revalidatePath(`/courses/${courseId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to rearrange lessons:", error);
        return { success: false, error: "Failed to rearrange lessons" };
    }
}

/**
 * Rearranges modules by updating their order index.
 * items: Array of { moduleId, orderIndex }
 */
export async function rearrangeModules(courseId: string, items: { moduleId: string, orderIndex: number }[]) {
    try {
        await prisma.$transaction(
            items.map(item =>
                prisma.module.update({
                    where: { id: item.moduleId },
                    data: {
                        orderIndex: item.orderIndex
                    }
                })
            )
        );

        revalidatePath(`/admin/courses/${courseId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to rearrange modules:", error);
        return { success: false, error: "Failed to rearrange modules" };
    }
}

export async function updateLessonNotes(lessonId: string, description: string) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const lesson = await prisma.lesson.update({
            where: { id: lessonId },
            data: { description },
            include: { module: { include: { course: true } } }
        });

        revalidatePath(`/courses/${lesson.module.course.slug}/lessons/${lesson.slug}`);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update lesson notes:", error);
        return { success: false, error: error.message || "Failed to update lesson notes" };
    }
}
