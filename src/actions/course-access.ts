
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function requestCourseAccess(courseId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Check if user already has access
    const existingAccess = await prisma.courseAccess.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingAccess) {
      if (existingAccess.expiresAt > new Date()) {
        return { error: "You already have active access to this course." };
      }
      // If expired, maybe allow re-request? For now, let's block or handle separately.
      return { error: "Your access has expired. Please subscribe to continue." };
    }

    // Check if there is already a pending request
    const existingRequest = await prisma.courseAccessRequest.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingRequest) {
      if (existingRequest.status === "PENDING") {
        return { error: "You already have a pending request." };
      }
      if (existingRequest.status === "APPROVED") {
          // Should have been caught by existingAccess check, but maybe data sync issue or manual DB edit.
          return { error: "Request already approved." };
      }
      if (existingRequest.status === "REJECTED") {
         return { error: "Your request was previously rejected." }; 
      }
    }

    // Create request
    await prisma.courseAccessRequest.create({
      data: {
        userId,
        courseId,
        status: "PENDING",
      },
    });

    revalidatePath(`/courses`); // Revalidate course pages or dashboard
    return { success: true };
  } catch (error) {
    console.error("Error requesting access:", error);
    return { error: "Something went wrong" };
  }
}

export async function approveAccessRequest(requestId: string) {
    try {
        const session = await auth();
        // Check if admin
        if (session?.user?.role !== "ADMIN") {
            return { error: "Unauthorized" };
        }

        const request = await prisma.courseAccessRequest.findUnique({
            where: { id: requestId },
        });

        if (!request) {
            return { error: "Request not found" };
        }

        if (request.status !== "PENDING") {
            return { error: "Request is not pending" };
        }

        // Grant 30 days access
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await prisma.$transaction([
            prisma.courseAccessRequest.update({
                where: { id: requestId },
                data: { status: "APPROVED" },
            }),
            prisma.courseAccess.create({
                data: {
                    userId: request.userId,
                    courseId: request.courseId,
                    expiresAt,
                },
            }),
        ]);

        revalidatePath("/admin/requests");
        return { success: true };
    } catch (error) {
         console.error("Error approving request:", error);
         return { error: "Something went wrong" };
    }
}

export async function rejectAccessRequest(requestId: string) {
    try {
        const session = await auth();
        // Check if admin
        if (session?.user?.role !== "ADMIN") {
            return { error: "Unauthorized" };
        }

        await prisma.courseAccessRequest.update({
            where: { id: requestId },
            data: { status: "REJECTED" },
        });

        revalidatePath("/admin/requests");
        return { success: true };
    } catch (error) {
        console.error("Error rejecting request:", error);
        return { error: "Something went wrong" };
    }
}
