import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// TEMPORARY DEBUG ROUTE - Remove before going to production
export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            courseAccess: {
                include: { course: { select: { title: true, id: true } } }
            },
            subscriptions: {
                orderBy: { createdAt: "desc" },
                take: 5
            }
        }
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
        user: {
            id: user.id,
            email: user.email,
            isSubscribed: user.isSubscribed,
            subscriptionTier: user.subscriptionTier,
            subscriptionEndsAt: user.subscriptionEndsAt,
            role: user.role,
        },
        courseAccess: user.courseAccess.map((a: any) => ({
            courseId: a.courseId,
            courseTitle: a.course?.title,
            expiresAt: a.expiresAt,
            isLifetime: a.expiresAt === null,
            isActive: a.expiresAt === null || a.expiresAt > new Date(),
        })),
        recentSubscriptions: user.subscriptions.map((s: any) => ({
            plan: s.plan,
            status: s.status,
            startDate: s.startDate,
            endDate: s.endDate,
            razorpayOrderId: s.razorpayOrderId,
            razorpayPaymentId: s.razorpayPaymentId,
        }))
    });
}

// Reset subscription status (for testing only)
export async function DELETE(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Safety: only allow in development
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
    }

    await prisma.user.update({
        where: { email: session.user.email },
        data: {
            isSubscribed: false,
            subscriptionTier: "FREE",
            subscriptionEndsAt: null,
        }
    });

    await prisma.subscription.deleteMany({
        where: { user: { email: session.user.email } }
    });

    return NextResponse.json({ message: "Subscription reset to FREE. CourseAccess records were NOT touched." });
}
