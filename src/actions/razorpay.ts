
"use server";

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
}) {
    // This is optional if you rely on webhooks, but good for immediate feedback
    // However, for security, updating the database should ideally happen in the webhook
    // or through server-side verification with the secret key.

    // In this implementation, we will let the webhook handle the database update
    // for maximum reliability, but we could add verification here too.
    return { success: true };
}
