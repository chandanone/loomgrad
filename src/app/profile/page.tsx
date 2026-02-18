
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
    User as UserIcon,
    Mail,
    Calendar,
    Shield,
    Award,
    BookOpen,
    CheckCircle2,
    Clock,
    LayoutDashboard,
    ExternalLink,
    Zap
} from "lucide-react";
import Link from "next/link";

export default async function ProfilePage({
    searchParams
}: {
    searchParams: Promise<{ success?: string }>
}) {
    const { success } = await searchParams;
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/auth/signin");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            progress: {
                include: {
                    course: true,
                    lesson: true
                },
                orderBy: {
                    lastWatchedAt: 'desc'
                }
            },
            certificates: true,
            codeSubmissions: {
                orderBy: {
                    createdAt: 'desc'
                },
                take: 5
            }
        }
    });

    if (!user) {
        redirect("/auth/signin");
    }

    // Calculate stats
    const publishedCoursesCount = await prisma.course.count({ where: { isPublished: true } });
    const startedCoursesCount = new Set(user.progress.map(p => p.courseId)).size;

    // If Pro/Admin, they are technically "enrolled" (have access) to all published courses
    const enrolledCoursesCount = (user.isSubscribed || user.role === "ADMIN")
        ? publishedCoursesCount
        : startedCoursesCount;

    const completedLessons = user.progress.filter(p => p.isCompleted).length;

    // Group progress by course for the "Continue Learning" section
    const courseProgressMap = new Map();
    user.progress.forEach(p => {
        if (!courseProgressMap.has(p.courseId)) {
            courseProgressMap.set(p.courseId, {
                course: p.course,
                lastLesson: p.lesson,
                lastWatched: p.lastWatchedAt,
                completedCount: 0
            });
        }
        if (p.isCompleted) {
            const current = courseProgressMap.get(p.courseId);
            current.completedCount += 1;
        }
    });

    const activeCourses = Array.from(courseProgressMap.values())
        .sort((a, b) => b.lastWatched.getTime() - a.lastWatched.getTime())
        .slice(0, 3);

    return (
        <div className="min-h-screen bg-white text-zinc-900 pt-32 pb-20 px-6 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                {success === "true" && (
                    <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-green-500 p-1 rounded-full">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-green-800 font-bold text-sm">Payment Successful!</p>
                            <p className="text-green-600 text-xs">Your PRO subscription has been activated. Welcome to the elite tier!</p>
                        </div>
                    </div>
                )}
                {/* Header / Profile Card */}
                <div className="relative mb-12 bg-zinc-50 border border-zinc-200 rounded-3xl p-8 md:p-12 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -mr-32 -mt-32" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-2xl flex items-center justify-center bg-zinc-100">
                                {user.image ? (
                                    <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-12 h-12 text-zinc-400" />
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg">
                                <Shield className="w-4 h-4" />
                            </div>
                        </div>

                        <div className="flex-grow text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
                                <h1 className="text-3xl font-bold tracking-tight">{user.name || "Learner"}</h1>
                                <span className={`w-fit mx-auto md:mx-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${user.role === "ADMIN" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                                    }`}>
                                    {user.role}
                                </span>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-zinc-500 font-medium">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                                </div>
                                {user.isSubscribed && (
                                    <div className="flex items-center gap-2 text-amber-500">
                                        <Zap className="w-4 h-4 fill-amber-500" />
                                        <span>PRO Member ({user.subscriptionTier})</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                href="/settings"
                                className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-zinc-900/10"
                            >
                                Edit Profile
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="p-6 bg-white border border-zinc-200 rounded-2xl flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <BookOpen className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                {(user.isSubscribed || user.role === "ADMIN") ? "Unlocked" : "Enrolled"}
                            </p>
                            <h3 className="text-xl font-bold">{enrolledCoursesCount} Courses</h3>
                        </div>
                    </div>
                    <div className="p-6 bg-white border border-zinc-200 rounded-2xl flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 rounded-xl">
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Completed</p>
                            <h3 className="text-xl font-bold">{completedLessons} Lessons</h3>
                        </div>
                    </div>
                    <div className="p-6 bg-white border border-zinc-200 rounded-2xl flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl">
                            <Award className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Certificates</p>
                            <h3 className="text-xl font-bold">{user.certificates.length} Earned</h3>
                        </div>
                    </div>
                    <div className="p-6 bg-white border border-zinc-200 rounded-2xl flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl">
                            <LayoutDashboard className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Challenges</p>
                            <h3 className="text-xl font-bold">{user.codeSubmissions.length} Solved</h3>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content: Active Courses */}
                    <div className="lg:col-span-2 space-y-8">
                        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                            <Clock className="w-6 h-6 text-blue-500" />
                            Continue Learning
                        </h2>

                        {activeCourses.length > 0 ? (
                            <div className="space-y-4">
                                {activeCourses.map((item) => (
                                    <Link
                                        key={item.course.id}
                                        href={`/courses/${item.course.slug}`}
                                        className="group block p-6 bg-white border border-zinc-200 rounded-2xl hover:border-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-500/5"
                                    >
                                        <div className="flex flex-col md:flex-row items-center gap-6">
                                            <div className="w-full md:w-40 aspect-video rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0">
                                                {item.course.thumbnail ? (
                                                    <img src={item.course.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <BookOpen className="w-8 h-8 text-zinc-300" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className="text-lg font-bold mb-1 group-hover:text-blue-500 transition-colors">{item.course.title}</h3>
                                                <p className="text-sm text-zinc-500 mb-4 line-clamp-1">Last lesson: {item.lastLesson.title}</p>

                                                <div className="flex items-center gap-4">
                                                    <div className="flex-grow h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-600 rounded-full"
                                                            style={{ width: `${Math.min(100, (item.completedCount / 10) * 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                                                        {item.completedCount} lessons done
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <ExternalLink className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center bg-zinc-50 border border-dashed border-zinc-200 rounded-3xl">
                                <BookOpen className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                                <h3 className="font-bold text-lg mb-2">No active courses</h3>
                                <p className="text-zinc-500 mb-6 text-sm">Explore our catalog and start your learning journey today!</p>
                                <Link href="/courses" className="text-blue-500 font-bold text-sm hover:underline">Browse Courses →</Link>
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Recent Activity / Achievements */}
                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                            <Zap className="w-6 h-6 text-amber-500" />
                            Recent Challenges
                        </h2>

                        <div className="space-y-4">
                            {user.codeSubmissions.length > 0 ? (
                                user.codeSubmissions.map((sub) => (
                                    <div
                                        key={sub.id}
                                        className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${sub.status === "PASSED" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                                }`}>
                                                {sub.status}
                                            </span>
                                            <span className="text-[10px] text-zinc-500 font-medium">
                                                {new Date(sub.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold truncate">Submission #{sub.id.slice(-6)}</h4>
                                        <p className="text-[11px] text-zinc-500 mt-1">{sub.passedTests}/{sub.totalTests} tests passed</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-zinc-500 text-sm italic">No recent code submissions found.</p>
                            )}
                        </div>

                        {/* Subscription Info mini-card */}
                        <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl text-white shadow-xl shadow-blue-500/20">
                            <h3 className="font-bold mb-2 flex items-center gap-2 text-lg">
                                <Zap className="w-5 h-5 fill-white" />
                                {user.isSubscribed ? "Enjoying PRO" : "Upgrade to PRO"}
                            </h3>
                            <p className="text-blue-100 text-xs mb-6 leading-relaxed">
                                {user.isSubscribed
                                    ? `Your ${user.subscriptionTier} plan is active. Unlimited access to all labs and courses unlocked.`
                                    : "Get unlimited access to advanced code challenges, priority support, and expert-led labs."}
                            </p>
                            {!user.isSubscribed && (
                                <Link
                                    href="/pricing"
                                    className="block w-full text-center py-2.5 bg-white text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors"
                                >
                                    View Plans
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
