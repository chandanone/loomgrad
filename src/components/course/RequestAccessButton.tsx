
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { requestCourseAccess } from "@/actions/course-access";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface RequestAccessButtonProps {
    courseId: string;
    isPending: boolean;
    isRejected: boolean;
    hasAccess: boolean;
    expiresAt?: Date | null;
}

export function RequestAccessButton({
    courseId,
    isPending,
    isRejected,
    hasAccess,
    expiresAt,
}: RequestAccessButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleRequest = async () => {
        setLoading(true);
        try {
            if (hasAccess) {
                toast.info("You already have access!");
                return;
            }
            if (isPending) {
                toast.info("Request already pending approval.");
                return;
            }

            const result = await requestCourseAccess(courseId);
            if (result.error) {
                toast.error(result.error);
                return;
            }

            toast.success("Access request sent successfully! Pending admin approval.");
            window.location.reload(); // Quick way to show pending state
        } catch (error) {
            toast.error("Failed to request access.");
        } finally {
            setLoading(false);
        }
    };

    if (hasAccess) {
        if (expiresAt && new Date(expiresAt) > new Date()) {
            const daysRemaining = Math.ceil((new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return (
                <div className="flex flex-col items-center gap-2">
                    <Button variant="outline" className="w-full bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20" disabled>
                        Access Granted ({daysRemaining}d left)
                    </Button>
                </div>
            );
        } else {
            return (
                <div className="flex flex-col items-center gap-2">
                    <Button variant="destructive" className="w-full" asChild>
                        <a href="/pricing">Subscribe to Continue</a>
                    </Button>
                    <span className="text-xs text-red-500 font-medium">Free Access Expired</span>
                </div>
            );
        }
    }

    if (isPending) {
        return (
            <Button variant="secondary" className="w-full" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Request Pending...
            </Button>
        );
    }

    if (isRejected) {
        return (
            <Button variant="destructive" className="w-full" disabled>
                Request Rejected
            </Button>
        )
    }

    return (
        <Button onClick={handleRequest} disabled={loading || isPending} className="w-full">
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Requesting...
                </>
            ) : (
                "Request 30 Days Free Access"
            )}
        </Button>
    );
}
