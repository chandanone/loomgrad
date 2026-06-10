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
            const tier = payment.notes?.tier;
            const courseId = payment.notes?.courseId;

            // === DEBUG: log what webhook received ===
            console.log("[Webhook] payment.captured received. notes:", JSON.stringify(payment.notes));
            console.log("[Webhook] Extracted → email:", email, "| tier:", tier, "| courseId:", courseId);

            // Find user by email (case-insensitive)
            const user = await prisma.user.findFirst({
                where: {
                    email: {
                        equals: email,
                        mode: 'insensitive'
                    }
                }
            });

            if (user) {
                let handeled = false;

                // 1. Handle Course Access (One-time purchase)
                if (courseId) {
                    await (prisma.courseAccess as any).upsert({
                        where: {
                            userId_courseId: {
                                userId: user.id,
                                courseId: courseId
                            }
                        },
                        update: {
                            expiresAt: null, // Lifetime access for one-time purchase
                        },
                        create: {
                            userId: user.id,
                            courseId: courseId,
                            expiresAt: null,
                        }
                    });
                    console.log(`[Webhook] Granted access to course ${courseId} for user ${email}`);
                    handeled = true;
                }

                // 2. Handle Subscription
                if (tier) {
                    const activeTier = tier;
                    const durationDays = activeTier === "YEARLY" ? 365 : 30;

                    const currentEndsAt = user.subscriptionEndsAt && user.subscriptionEndsAt > new Date()
                        ? user.subscriptionEndsAt
                        : new Date();

                    const newEndsAt = new Date(currentEndsAt.getTime() + durationDays * 24 * 60 * 60 * 1000);

                    await prisma.$transaction([
                        prisma.user.update({
                            where: { id: user.id },
                            data: {
                                isSubscribed: true,
                                subscriptionTier: activeTier as any,
                                subscriptionEndsAt: newEndsAt,
                            },
                        }),
                        prisma.subscription.create({
                            data: {
                                userId: user.id,
                                plan: activeTier as any,
                                startDate: currentEndsAt,
                                endDate: newEndsAt,
                                razorpayPaymentId: payment.id,
                                razorpayOrderId: payment.order_id,
                                status: "ACTIVE"
                            }
                        })
                    ]);
                    console.log(`[Webhook] Activated ${activeTier} subscription for user ${email}`);
                    handeled = true;
                }

                if (!handeled) {
                    console.warn(`[Webhook] Payment received with no tier or courseId in notes for ${email}. Amount: ${payment.amount}`);
                }
            } else {
                console.error(`[Webhook] User not found for email: ${email}`);
            }
        }

        return NextResponse.json({ status: "ok" });
    } catch (error: any) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
