
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { approveAccessRequest, rejectAccessRequest } from "@/actions/course-access";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface RequestActionsProps {
    requestId: string;
}

export function RequestActions({ requestId }: RequestActionsProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleApprove = async () => {
        setLoading(true);
        try {
            const result = await approveAccessRequest(requestId);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Request approved.");
                router.refresh();
            }
        } catch (error) {
            toast.error("Failed to approve request.");
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        setLoading(true);
        try {
            const result = await rejectAccessRequest(requestId);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Request rejected.");
                router.refresh();
            }
        } catch (error) {
            toast.error("Failed to reject request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-end gap-2">
            <Button
                size="sm"
                variant="default"
                className="bg-green-600 hover:bg-green-700 text-white h-8"
                onClick={handleApprove}
                disabled={loading}
            >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                <span className="ml-2 sr-only lg:not-sr-only lg:ml-1">Approve</span>
            </Button>
            <Button
                size="sm"
                variant="destructive"
                className="h-8"
                onClick={handleReject}
                disabled={loading}
            >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                <span className="ml-2 sr-only lg:not-sr-only lg:ml-1">Reject</span>
            </Button>
        </div>
    );
}
