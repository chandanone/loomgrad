
import { prisma } from "@/lib/prisma";
import {
    FileText,
    Search,
    Download,
    Calendar,
    User as UserIcon,
    Crown,
    BookOpen,
    Filter,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { SubscriptionTier } from "@prisma/client";

interface MISPageProps {
    searchParams: Promise<{
        q?: string;
        course?: string;
        tier?: string;
        from?: string;
        to?: string;
    }>;
}

export default async function MISReportPage({ searchParams }: MISPageProps) {
    const filters = await searchParams;
    const query = filters.q || "";
    const courseQuery = filters.course || "";
    const tierQuery = filters.tier || "";
    const fromDate = filters.from ? new Date(filters.from) : undefined;
    const toDate = filters.to ? new Date(filters.to) : undefined;

    // Fetch Subscriptions (Global Plans)
    const subscriptions = await (prisma as any).subscription.findMany({
        where: {
            user: query ? {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                ]
            } : undefined,
            plan: tierQuery ? tierQuery as SubscriptionTier : undefined,
            createdAt: {
                gte: fromDate,
                lte: toDate
            }
        },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
    });

    // Fetch Course Access (Specific Course Grants)
    const courseAccess = await prisma.courseAccess.findMany({
        where: {
            user: query ? {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                ]
            } : undefined,
            course: courseQuery ? {
                title: { contains: courseQuery, mode: 'insensitive' }
            } : undefined,
            createdAt: {
                gte: fromDate,
                lte: toDate
            }
        },
        include: { user: true, course: true },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="min-h-screen bg-white text-zinc-900 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <Link href="/admin/users" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1 mb-2">
                            <ArrowLeft className="w-4 h-4" /> Back to Users
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <FileText className="w-8 h-8 text-blue-600" />
                            MIS & Sales Report
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">Detailed analysis of subscriptions and course access events.</p>
                    </div>

                    <button className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-zinc-200">
                        <Download className="w-4 h-4" />
                        Export to CSV
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 mb-8">
                    <form className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                            <input
                                name="q"
                                defaultValue={query}
                                placeholder="Student Name/Email"
                                className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div className="relative">
                            <BookOpen className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                            <input
                                name="course"
                                defaultValue={courseQuery}
                                placeholder="Course Title"
                                className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div className="relative">
                            <Crown className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                            <select
                                name="tier"
                                defaultValue={tierQuery}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
                            >
                                <option value="">All Tiers</option>
                                <option value="MONTHLY">Monthly</option>
                                <option value="YEARLY">Yearly</option>
                                <option value="FREE">Free (Trial)</option>
                            </select>
                        </div>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                            <input
                                name="from"
                                type="date"
                                defaultValue={filters.from}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <button type="submit" className="bg-blue-600 text-white font-bold py-2 rounded-xl hover:bg-blue-700 transition-all text-sm">
                            Apply Filters
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-1 gap-12">
                    {/* Global Subscriptions Table */}
                    <section>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Crown className="w-5 h-5 text-amber-500" />
                            Global Plan Subscriptions ({subscriptions.length})
                        </h3>
                        <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-zinc-50 border-b border-zinc-200 font-bold text-[10px] uppercase tracking-wider text-zinc-500">
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">Plan</th>
                                        <th className="px-6 py-4">Validity</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Join Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {(subscriptions as any[]).map((sub: any) => (
                                        <tr key={sub.id} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-bold">
                                                        {(sub.user.name || "?")[0]}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-sm truncate">{sub.user.name}</p>
                                                        <p className="text-[10px] text-zinc-400 truncate">{sub.user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-zinc-900">{sub.plan}</span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-zinc-600">
                                                {new Date(sub.startDate).toLocaleDateString()} - {new Date(sub.endDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-green-50 text-green-600">
                                                    {sub.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-xs text-zinc-500">
                                                {new Date(sub.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {subscriptions.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 italic text-sm">No global subscriptions found matching filters.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Course Access Table */}
                    <section>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-500" />
                            Specific Course Access ({courseAccess.length})
                        </h3>
                        <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-zinc-50 border-b border-zinc-200 font-bold text-[10px] uppercase tracking-wider text-zinc-500">
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">Course</th>
                                        <th className="px-6 py-4">Expires</th>
                                        <th className="px-6 py-4 text-right">Granted On</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {(courseAccess as any[]).map((access: any) => (
                                        <tr key={access.id} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 text-xs font-bold">
                                                        {(access.user.name || "?")[0]}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-sm truncate">{access.user.name}</p>
                                                        <p className="text-[10px] text-zinc-400 truncate">{access.user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-zinc-900 truncate max-w-[200px]">{access.course.title}</p>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-zinc-600">
                                                {new Date(access.expiresAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right text-xs text-zinc-500">
                                                {new Date(access.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {courseAccess.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 italic text-sm">No course access events found matching filters.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
