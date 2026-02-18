"use server";

import { prisma } from "@/lib/prisma";
import { getPlaylistMetadata, getPlaylistVideos } from "@/lib/youtube";
import { revalidatePath } from "next/cache";

export async function importYouTubePlaylist(playlistId: string, offerFreeTrial: boolean = false) {
    try {
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
