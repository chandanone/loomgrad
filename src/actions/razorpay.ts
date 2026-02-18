
"use server";

import crypto from "crypto";
import { razorpay } from "@/lib/razorpay";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SubscriptionTier } from "@prisma/client";

export async function createRazorpayOrder(tier: SubscriptionTier) {
    const session = await auth();

    if (!session?.user?.email) {
        throw new Error("You must be logged in to subscribe");
    }

    let amount = 0;
    if (tier === SubscriptionTier.MONTHLY) {
        amount = 999 * 100; // ₹999 in paise
    } else if (tier === SubscriptionTier.YEARLY) {
        amount = 9999 * 100; // ₹9,999 in paise
    } else {
        throw new Error("Invalid subscription tier");
    }

    const options = {
        amount: amount,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
            email: session.user.email,
            tier: tier,
        },
    };

    try {
        const order = await razorpay.orders.create(options);
        return {
            id: order.id,
            amount: order.amount,
            currency: order.currency,
        };
    } catch (error) {
        console.error("Razorpay order creation error:", error);
        throw new Error("Failed to create payment order");
    }
}

export async function verifyPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    tier: SubscriptionTier;
}) {
    const session = await auth();
    if (!session?.user?.email) {
        throw new Error("User not authenticated");
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tier } = paymentData;

    // Verify signature
    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(text)
        .digest("hex");

    if (generated_signature === razorpay_signature) {
        const durationDays = tier === SubscriptionTier.YEARLY ? 365 : 30;

        // Find user by email (case-insensitive) to be safe
        const dbUser = await prisma.user.findFirst({
            where: {
                email: {
                    equals: session.user.email,
                    mode: 'insensitive'
                }
            }
        });

        if (dbUser) {
            await prisma.user.update({
                where: { id: dbUser.id },
                data: {
                    isSubscribed: true,
                    subscriptionTier: tier,
                    subscriptionEndsAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
                },
            });
        }

        return { success: true };
    } else {
        throw new Error("Invalid payment signature");
    }
}
