
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
    User as UserIcon,
    Mail,
    Calendar,
    Shield,
    Crown,
    History,
    Zap,
    CheckCircle2,
    Clock,
    ArrowLeft,
    CreditCard
} from "lucide-react";

export default async function UserDetailPage({
    params
}: {
    params: Promise<{ userId: string }>
}) {
    const { userId } = await params;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            subscriptions: {
                orderBy: { createdAt: 'desc' }
            },
            courseAccess: {
                include: {
                    course: true
                },
                orderBy: { expiresAt: 'desc' }
            }
        } as any
    }) as any;

    if (!user) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-white text-zinc-900 p-8">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/admin/users"
                    className="inline-flex items-center gap-2 text-zinc-500 hover:text-blue-600 transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Users
                </Link>

                <div className="flex flex-col md:flex-row items-start gap-8 mb-12">
                    <div className="shrink-0">
                        {user.image ? (
                            <img src={user.image} className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-xl" alt="" />
                        ) : (
                            <div className="w-24 h-24 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 text-3xl shadow-inner">
                                {(user.name || user.email || "?")[0].toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold tracking-tight">{user.name || "Anonymous User"}</h1>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${user.role === 'ADMIN' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                }`}>
                                {user.role}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-6 text-sm text-zinc-500 font-medium">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {user.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Joined {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                ID: {user.id}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Subscription History */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <Crown className="w-5 h-5 text-amber-600" />
                            </div>
                            <h2 className="text-xl font-bold">Subscription History</h2>
                        </div>

                        <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-zinc-50 border-b border-zinc-200 font-bold text-[10px] uppercase tracking-wider text-zinc-500">
                                        <th className="px-6 py-4">Plan</th>
                                        <th className="px-6 py-4">Date Range</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Payment ID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {(user.subscriptions as any[])?.length > 0 ? (
                                        (user.subscriptions as any[]).map((sub: any) => (
                                            <tr key={sub.id} className="text-sm">
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-zinc-900">{sub.plan}</span>
                                                </td>
                                                <td className="px-6 py-4 text-zinc-600">
                                                    {new Date(sub.startDate).toLocaleDateString()} - {new Date(sub.endDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-zinc-600">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${sub.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                                        }`}>
                                                        {sub.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-zinc-400 font-mono text-[10px]">
                                                    {sub.razorpayPaymentId || "ADMIN_GRANTED"}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 italic">
                                                No subscription history found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Specific Course Access */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Zap className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold">Specific Course Access</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(user.courseAccess as any[])?.length > 0 ? (
                                (user.courseAccess as any[]).map((access: any) => (
                                    <div key={access.id} className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between">
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-sm truncate">{access.course.title}</h4>
                                            <p className="text-xs text-zinc-500">Expires: {new Date(access.expiresAt).toLocaleDateString()}</p>
                                        </div>
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 p-8 bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl text-center text-zinc-500 text-sm">
                                    No specific course overrides.
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
