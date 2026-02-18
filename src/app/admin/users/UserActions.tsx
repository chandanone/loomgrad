"use client";

import { useState } from "react";
import { User } from "@prisma/client";
import {
    MoreVertical,
    Shield,
    ShieldOff,
    Trash2,
    Loader2,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { updateUserRole, deleteUser } from "@/actions/admin";
import { useSession } from "next-auth/react";

// User management actions component
interface UserActionsProps {
    user: User;
}

export function UserActions({ user }: UserActionsProps) {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Prevent self-modifying
    const isSelf = session?.user?.email === user.email;

    const handleRoleUpdate = async () => {
        if (isSelf) return;
        setIsLoading(true);
        setError(null);
        try {
            const newRole = user.role === 'ADMIN' ? 'STUDENT' : 'ADMIN';
            const res = await updateUserRole(user.id, newRole);
            if (!res.success) {
                setError(res.error || "Failed to update role");
            } else {
                setIsOpen(false);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (isSelf || !confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        setIsLoading(true);
        setError(null);
        try {
            const res = await deleteUser(user.id);
            if (!res.success) {
                setError(res.error || "Failed to delete user");
            } else {
                setIsOpen(false);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                disabled={isLoading}
            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                ) : (
                    <MoreVertical className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600" />
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in duration-100 origin-top-right">
                        <div className="p-1 space-y-0.5">
                            {!isSelf && (
                                <button
                                    onClick={handleRoleUpdate}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-blue-600 rounded-lg transition-colors text-left"
                                >
                                    {user.role === 'ADMIN' ? (
                                        <>
                                            <ShieldOff className="w-4 h-4 text-zinc-400" />
                                            Downgrade Role
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="w-4 h-4 text-blue-500" />
                                            Make Admin
                                        </>
                                    )}
                                </button>
                            )}

                            {!isSelf && (
                                <button
                                    onClick={handleDelete}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left font-medium"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete User
                                </button>
                            )}

                            {isSelf && (
                                <div className="px-3 py-2 text-xs text-zinc-400 italic">
                                    You cannot modify yourself
                                </div>
                            )}

                            {error && (
                                <div className="px-3 py-2 text-xs text-red-500 bg-red-50 rounded-lg flex items-center gap-2 mt-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
