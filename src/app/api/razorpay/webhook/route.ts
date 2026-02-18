import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get("x-razorpay-signature");

        if (!signature) {
            return NextResponse.json({ error: "No signature" }, { status: 400 });
        }

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
            .update(body)
            .digest("hex");

        if (signature !== expectedSignature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const event = JSON.parse(body);

        // Handle different event types
        if (event.event === "payment.captured") {
            const payment = event.payload.payment.entity;

            // Extract from notes (most reliable as we set these in createRazorpayOrder)
            const email = payment.notes?.email || payment.email;
            const tier = payment.notes?.tier || "MONTHLY";

            const durationDays = tier === "YEARLY" ? 365 : 30;

            await prisma.user.update({
                where: { email },
                data: {
                    isSubscribed: true,
                    subscriptionTier: tier as any,
                    subscriptionEndsAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
                },
            });
        }

        return NextResponse.json({ status: "ok" });
    } catch (error: any) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
