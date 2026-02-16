import { prisma } from "@/lib/prisma";
import {
    Users,
    BookOpen,
    PlayCircle,
    TrendingUp,
    Clock,
    ShieldCheck,
    ArrowRight
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
    // Fetch basic stats
    const stats = await Promise.all([
        prisma.user.count(),
        prisma.course.count(),
        prisma.lesson.count(),
        prisma.course.count({ where: { isPublished: true } })
    ]);

    const items = [
        {
            label: "Total Students",
            value: stats[0],
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            label: "Total Courses",
            value: stats[1],
            icon: BookOpen,
            color: "text-purple-600",
            bg: "bg-purple-50"
        },
        {
            label: "Total Lessons",
            value: stats[2],
            icon: PlayCircle,
            color: "text-green-600",
            bg: "bg-green-50"
        },
        {
            label: "Published",
            value: stats[3],
            icon: ShieldCheck,
            color: "text-amber-600",
            bg: "bg-amber-50"
        },
    ];

    // Fetch recent users
    const recentUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
            role: true
        }
    });

    return (
        <div className="min-h-screen bg-white text-zinc-900 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
                    <p className="text-zinc-500">Welcome back. Here's a quick overview of your platform performance.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {items.map((item, i) => (
                        <div key={i} className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 hover:border-zinc-300 transition-all">
                            <div className={`${item.bg} ${item.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <p className="text-zinc-500 text-sm font-medium mb-1">{item.label}</p>
                            <h3 className="text-3xl font-bold">{item.value}</h3>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Quick Actions */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-zinc-200 rounded-3xl p-8 flex flex-col items-start gap-6 group hover:border-blue-500/30 transition-all h-full shadow-sm hover:shadow-md">
                            <div className="bg-blue-50 p-4 rounded-2xl">
                                <TrendingUp className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Automate Content</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                                    Import entire YouTube playlists and turn them into structured courses with one click.
                                </p>
                                <Link
                                    href="/admin/import"
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all"
                                >
                                    Open Importer <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white border border-zinc-200 rounded-3xl p-8 flex flex-col items-start gap-6 group hover:border-purple-500/30 transition-all h-full shadow-sm hover:shadow-md">
                            <div className="bg-purple-50 p-4 rounded-2xl">
                                <Clock className="w-8 h-8 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Course Management</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                                    Manage your catalog, publish drafts, update visibility, or prune old content.
                                </p>
                                <Link
                                    href="/admin/courses"
                                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all"
                                >
                                    Manage Catalog <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white border border-zinc-200 rounded-3xl p-8 flex flex-col items-start gap-6 group hover:border-green-500/30 transition-all h-full shadow-sm hover:shadow-md">
                            <div className="bg-green-50 p-4 rounded-2xl">
                                <ShieldCheck className="w-8 h-8 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Access Control</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                                    Manually grant temporary access to specific courses for students without subscriptions.
                                </p>
                                <Link
                                    href="/admin/access"
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all"
                                >
                                    Manage Access <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Recent Users */}
                    <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-600" /> Recent Students
                            </h3>
                            <Link href="/admin/users" className="text-xs text-zinc-500 hover:text-blue-600 transition-colors">
                                View All
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {recentUsers.map(user => (
                                <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 transition-colors">
                                    {user.image ? (
                                        <img src={user.image} alt={user.name || "User"} className="w-10 h-10 rounded-full bg-zinc-100 object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 font-bold">
                                            {(user.name || user.email || "?")[0].toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate text-zinc-900">{user.name || "Anonymous"}</p>
                                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                                    </div>
                                    <div className="text-xs text-zinc-400 text-right">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                            {recentUsers.length === 0 && (
                                <div className="text-center py-8 text-zinc-500 text-sm">
                                    No students yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
