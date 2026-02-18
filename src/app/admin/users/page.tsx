import { prisma } from "@/lib/prisma";
import {
    User as UserIcon,
    Shield,
    ShieldAlert,
    Mail,
    Calendar,
    Search,
    UserCheck,
    UserX,
    MoreVertical,
    Crown,
    Star
} from "lucide-react";
import { UserActions } from "@/app/admin/users/UserActions";
import { UserSearch } from "@/app/admin/users/UserSearch";

export default async function AdminUsersPage({
    searchParams
}: {
    searchParams: { q?: string }
}) {
    const query = searchParams.q || "";

    const users = await prisma.user.findMany({
        where: query ? {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
            ]
        } : {},
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="min-h-screen bg-white text-zinc-900 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            User Management
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">
                            Monitor student growth and manage administrative privileges.
                        </p>
                    </div>

                    <UserSearch />
                </div>

                <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50/50 border-b border-zinc-200 font-bold text-xs uppercase tracking-wider text-zinc-500">
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Subscription</th>
                                    <th className="px-6 py-4">Joined</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="shrink-0">
                                                    {user.image ? (
                                                        <img src={user.image} className="w-10 h-10 rounded-full bg-zinc-100 object-cover border border-zinc-200" alt="" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 text-sm">
                                                            {(user.name || user.email || "?")[0].toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-zinc-900 truncate">
                                                            {user.name || "Anonymous"}
                                                        </p>
                                                        {user.role === 'ADMIN' && (
                                                            <div className="flex items-center gap-1 bg-blue-50 text-blue-600 text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider border border-blue-100">
                                                                <Shield className="w-3 h-3" />
                                                                Admin
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-2 h-2 rounded-full ${user.role === 'ADMIN' ? 'bg-blue-500' : 'bg-green-500'}`} />
                                                <span className="text-sm font-medium text-zinc-700 capitalize">
                                                    {user.role.toLowerCase()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.isSubscribed ? (
                                                <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg border border-amber-200 w-fit">
                                                    <Crown className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-bold uppercase tracking-tight">
                                                        {user.subscriptionTier}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-zinc-400 px-2 py-1">
                                                    <Star className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-medium">Free Tier</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-zinc-900">{new Date(user.createdAt).toLocaleDateString()}</span>
                                                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-tight">Joined</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <UserActions user={user} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
