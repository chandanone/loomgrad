
"use server";

import crypto from "crypto";
import { razorpay } from "@/lib/razorpay";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SubscriptionTier } from "@prisma/client";

export async function createRazorpayOrder(options: {
    tier?: SubscriptionTier;
    courseId?: string;
}) {
    try {
        const session = await auth();
        const { tier, courseId } = options;

        if (!session?.user?.email) {
            return { success: false, error: "You must be logged in to complete this purchase" };
        }

        let amount = 0;
        let description = "";
        let notes: any = { email: session.user.email };

        if (tier) {
            if (tier === SubscriptionTier.MONTHLY) {
                amount = 999 * 100; // ₹999 in paise
                description = "Monthly Subscription";
            } else if (tier === SubscriptionTier.YEARLY) {
                amount = 9999 * 100; // ₹9,999 in paise
                description = "Yearly Subscription";
            } else {
                return { success: false, error: "Invalid subscription tier" };
            }
            notes.tier = tier;
        } else if (courseId) {
            const course = await (prisma.course as any).findUnique({
                where: { id: courseId }
            });

            if (!course) {
                return { success: false, error: "Course not found" };
            }

            if (!course.price || course.price <= 0) {
                return { success: false, error: "This course is free or included in PRO" };
            }

            // Check if user already has access
            const existingAccess = await (prisma.courseAccess as any).findUnique({
                where: {
                    userId_courseId: {
                        userId: session.user.id!,
                        courseId: courseId
                    }
                }
            });

            if (existingAccess && (!existingAccess.expiresAt || existingAccess.expiresAt > new Date())) {
                return { success: false, error: "You already have access to this course" };
            }

            amount = course.price * 100; // price in paise
            description = `Course: ${course.title}`;
            notes.courseId = courseId;
        } else {
            return { success: false, error: "Invalid purchase request" };
        }

        const razorpayOptions = {
            amount: amount,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes: notes,
        };

        // === DEBUG: log the notes going into the order ===
        console.log("[createRazorpayOrder] Creating order with notes:", JSON.stringify(notes));

        const order = await razorpay.orders.create(razorpayOptions);
        return {
            success: true,
            data: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                description: description
            }
        };
    } catch (error: any) {
        console.error("Razorpay order creation error:", error);
        return { success: false, error: error.message || "Failed to create payment order" };
    }
}

export async function verifyPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    tier?: SubscriptionTier;
    courseId?: string;
}) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { success: false, error: "User not authenticated" };
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tier, courseId } = paymentData;

        // === DEBUG: log what verifyPayment received ===
        console.log("[verifyPayment] Called with:", JSON.stringify({ tier, courseId, razorpay_order_id }));

        // Verify signature
        const text = razorpay_order_id + "|" + razorpay_payment_id;
        const generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(text)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return { success: false, error: "Invalid payment signature" };
        }

        // Find user by email (case-insensitive) to be safe
        const dbUser = await prisma.user.findFirst({
            where: {
                email: {
                    equals: session.user.email,
                    mode: 'insensitive'
                }
            }
        });

        if (!dbUser) {
            return { success: false, error: "User record not found" };
        }

        if (tier) {
            console.log("[verifyPayment] >>> Taking SUBSCRIPTION path. tier =", tier);
            const durationDays = tier === SubscriptionTier.YEARLY ? 365 : 30;
            const currentEndsAt = dbUser.subscriptionEndsAt && dbUser.subscriptionEndsAt > new Date()
                ? dbUser.subscriptionEndsAt
                : new Date();

            const newEndsAt = new Date(currentEndsAt.getTime() + durationDays * 24 * 60 * 60 * 1000);

            await prisma.$transaction([
                prisma.user.update({
                    where: { id: dbUser.id },
                    data: {
                        isSubscribed: true,
                        subscriptionTier: tier,
                        subscriptionEndsAt: newEndsAt,
                    },
                }),
                prisma.subscription.create({
                    data: {
                        userId: dbUser.id,
                        plan: tier,
                        startDate: currentEndsAt,
                        endDate: newEndsAt,
                        razorpayPaymentId: razorpay_payment_id,
                        razorpayOrderId: razorpay_order_id,
                        status: "ACTIVE"
                    }
                })
            ]);
        } else if (courseId) {
            console.log("[verifyPayment] >>> Taking COURSE ACCESS path. courseId =", courseId);
            await (prisma.courseAccess as any).upsert({
                where: {
                    userId_courseId: {
                        userId: dbUser.id,
                        courseId: courseId
                    }
                },
                update: {
                    expiresAt: null as any
                },
                create: {
                    userId: dbUser.id,
                    courseId: courseId,
                    expiresAt: null as any
                }
            });
        } else {
            console.warn("[verifyPayment] >>> Neither tier nor courseId was provided! No action taken. paymentData:", JSON.stringify(paymentData));
        }

        return { success: true };
    } catch (error: any) {
        console.error("Payment verification error:", error);
        return { success: false, error: error.message || "Failed to verify payment" };
    }
}
