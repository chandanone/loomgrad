
"use client";

import { useState, useEffect } from "react";
import { createRazorpayOrder, verifyPayment } from "@/actions/razorpay";
import { SubscriptionTier } from "@prisma/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface RazorpayButtonProps {
    tier: SubscriptionTier;
    label: string;
    className?: string;
}

export default function RazorpayButton({ tier, label, className }: RazorpayButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePayment = async () => {
        setIsLoading(true);
        try {
            const result = await createRazorpayOrder(tier);

            if (!result.success || !result.data) {
                toast.error(result.error || "Failed to initiate payment");
                return;
            }

            const { data: order } = result;

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use public key here
                amount: order.amount,
                currency: order.currency,
                name: "LoomGrad",
                description: `Subscription for ${tier} plan`,
                order_id: order.id,
                handler: async function (response: any) {
                    try {
                        const verifyResult = await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            tier: tier
                        });

                        if (verifyResult.success) {
                            toast.success("Payment Successful! Your subscription is now active.");
                            // Redirect to profile since dashboard doesn't exist
                            window.location.href = "/profile?success=true";
                        } else {
                            toast.error(verifyResult.error || "Payment verification failed.");
                        }
                    } catch (error) {
                        console.error("Verification failed:", error);
                        toast.error("Payment was successful but verification failed. It may take a few minutes to activate.");
                        window.location.href = "/profile?error=verification";
                    }
                },
                prefill: {
                    name: "", // Can be fetched from session if needed
                    email: "",
                },
                theme: {
                    color: "#2563eb",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", function (response: any) {
                toast.error("Payment failed. Please try again.");
                console.error("Payment failed:", response.error);
            });
            rzp.open();
        } catch (error: any) {
            toast.error(error.message || "Failed to initiate payment");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={isLoading}
            className={className}
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                </>
            ) : (
                label
            )}
        </button>
    );
}
