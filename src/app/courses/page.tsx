// Full schema updated
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Play, BookOpen, Clock, BarChart, CheckCircle2, ShieldCheck, Zap, Lock } from "lucide-react";

export default async function CoursesPage() {
    const session = await auth();

    // Fetch fresh user data if logged in
    const dbUser = session?.user?.id ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, isSubscribed: true, role: true, subscriptionEndsAt: true }
    }) : null;

    const isSubscribed = !!(dbUser?.isSubscribed && dbUser.subscriptionEndsAt && dbUser.subscriptionEndsAt > new Date());

    // Fetch user's course-specific access
    const userAccess = dbUser && session?.user?.id ? await (prisma.courseAccess as any).findMany({
        where: {
            userId: session.user.id,
            OR: [
                { expiresAt: { equals: null } },
                { expiresAt: { gt: new Date() } }
            ]
        },
        select: { courseId: true }
    }) : [];

    const purchaseIds = new Set(userAccess.map((p: any) => p.courseId));

    // Fetch user progress for all courses
    const allProgress = dbUser && session?.user?.id ? await prisma.progress.findMany({
        where: { userId: session.user.id },
        include: { lesson: true },
        orderBy: { lastWatchedAt: "desc" }
    }) : [];

    // Map courseId to last accessed lesson
    const courseLastAccessMap = new Map();
    allProgress.forEach(p => {
        if (!courseLastAccessMap.has(p.courseId)) {
            courseLastAccessMap.set(p.courseId, p.lesson);
        }
    });

    const courses = await prisma.course.findMany({
        where: { isPublished: true },
        include: {
            modules: {
                select: {
                    _count: {
                        select: { lessons: true },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    const coursesWithAccess = courses.map((course: any) => {
        const totalLessons = (course.modules as any[]).reduce((acc, module) => acc + (module._count?.lessons || 0), 0);

        const isTrialActive = !!dbUser && course.offerFreeTrial &&
            (new Date().getTime() - new Date(course.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000;

        const isPurchased = purchaseIds.has(course.id);
        const hasAccess = dbUser?.role === "ADMIN" || isSubscribed || isTrialActive || isPurchased;

        let accessType = null;
        if (dbUser?.role === "ADMIN") accessType = "ADMIN";
        else if (isSubscribed) accessType = "PRO";
        else if (isPurchased) accessType = "PURCHASED";
        else if (isTrialActive) accessType = "TRIAL";

        const lastLesson = courseLastAccessMap.get(course.id);
        const hasProgress = !!lastLesson;

        return {
            ...course,
            totalLessons,
            hasAccess,
            accessType,
            lastLesson,
            hasProgress,
        } as any;
    });

    return (
        <div className="min-h-screen bg-white text-zinc-900 pt-32 pb-20 px-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-5xl font-bold tracking-tight mb-4">Course Catalog</h1>
                    <p className="text-zinc-600 text-lg">Master the most in-demand technical skills with our curated curriculum.</p>
                </header>

                {coursesWithAccess.length === 0 ? (
                    <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-12 text-center">
                        <BookOpen className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">No courses available yet</h2>
                        <p className="text-zinc-500">Check back later or explore our administrative tools to import content.</p>
                        <Link
                            href="/admin/import"
                            className="mt-6 inline-block text-blue-500 hover:text-blue-400 font-medium"
                        >
                            Go to Admin Dashboard →
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {coursesWithAccess.map((course) => (
                            <Link
                                key={course.id}
                                href={`/courses/${course.slug}`}
                                className="group relative bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-500/10"
                            >
                                {/* Thumbnail Container */}
                                <div className="relative aspect-video">
                                    {course.thumbnail ? (
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className={`object-cover w-full h-full transition-all duration-500 ${course.hasAccess ? "group-hover:scale-105" : "grayscale opacity-60"}`}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-200 flex items-center justify-center">
                                            <Play className="w-12 h-12 text-zinc-400" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-100 via-transparent to-transparent opacity-60" />

                                    {/* Access Badges */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        {course.accessType === "PRO" && (
                                            <div className="flex items-center gap-1.5 bg-amber-500 text-[10px] font-black uppercase tracking-[0.1em] px-2.5 py-1 rounded-lg text-white shadow-lg shadow-amber-500/20">
                                                <Zap className="w-3 h-3 fill-white" />
                                                Elite Access
                                            </div>
                                        )}
                                        {course.accessType === "TRIAL" && (
                                            <div className="flex items-center gap-1.5 bg-blue-600 text-[10px] font-black uppercase tracking-[0.1em] px-2.5 py-1 rounded-lg text-white shadow-lg shadow-blue-500/20">
                                                <Clock className="w-3 h-3" />
                                                30-Day Trial
                                            </div>
                                        )}
                                        {course.accessType === "ADMIN" && (
                                            <div className="flex items-center gap-1.5 bg-zinc-900 text-[10px] font-black uppercase tracking-[0.1em] px-2.5 py-1 rounded-lg text-white shadow-lg">
                                                <ShieldCheck className="w-3 h-3" />
                                                Staff Access
                                            </div>
                                        )}
                                        {course.category && (
                                            <div className="w-fit bg-white/90 backdrop-blur-md text-zinc-600 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border border-zinc-200/50">
                                                {course.category}
                                            </div>
                                        )}
                                    </div>

                                    {!course.hasAccess && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/50">
                                                <Lock className="w-6 h-6 text-zinc-400" />
                                            </div>
                                        </div>
                                    )}
                                    {course.hasProgress && course.hasAccess && (
                                        <div className="absolute inset-x-0 bottom-4 px-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                            <div className="flex items-center justify-between gap-3 bg-zinc-900/90 backdrop-blur-lg border border-white/10 p-4 rounded-2xl shadow-2xl">
                                                <div className="min-w-0">
                                                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Resume From</p>
                                                    <p className="text-white text-xs font-bold truncate">{course.lastLesson?.title}</p>
                                                </div>
                                                <div className="bg-blue-600 p-2 rounded-xl group/btn hover:scale-110 transition-transform">
                                                    <Play className="w-4 h-4 text-white fill-white" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {course.title}
                                    </h3>
                                    <p className="text-zinc-600 text-sm mb-6 line-clamp-2 leading-relaxed">
                                        {course.description || "Start your technical journey with this comprehensive guide."}
                                    </p>

                                    <div className="flex items-center justify-between text-[13px] text-zinc-500 font-medium border-t border-zinc-200 pt-4 mb-2">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            <span>{course.duration || "Self-paced"}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-blue-600 font-bold">
                                            <BarChart className="w-4 h-4" />
                                            <span>{course.totalLessons} Lessons</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{course.level}</span>
                                        <span className="text-sm font-black text-zinc-900">
                                            {course.price ? `₹${course.price}` : "PRO Content"}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
