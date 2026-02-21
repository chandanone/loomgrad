
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayCircle, CheckCircle2, Lock, Clock, BookOpen, Layers, ArrowRight, IndianRupee } from "lucide-react";
import RazorpayButton from "@/components/payment/RazorpayButton";

interface CoursePageProps {
    params: Promise<{ courseSlug: string }>;
    searchParams: Promise<{ lesson?: string }>;
}

export default async function CourseOverviewPage({ params, searchParams }: CoursePageProps) {
    const { courseSlug } = await params;
    const { lesson: lessonId } = await searchParams;
    const session = await auth();

    const course = await (prisma.course as any).findUnique({
        where: { slug: courseSlug },
        include: {
            modules: {
                orderBy: { orderIndex: "asc" },
                include: {
                    lessons: {
                        orderBy: { orderIndex: "asc" },
                    },
                },
            },
        },
    }) as any;

    if (!course) {
        return notFound();
    }

    // Handle deep link to specific lesson
    if (lessonId) {
        const targetLesson = (course.modules as any[])
            .flatMap((m: any) => m.lessons)
            .find((l: any) => l.id === lessonId);

        if (targetLesson) {
            const { redirect } = await import("next/navigation");
            redirect(`/courses/${courseSlug}/lessons/${targetLesson.slug}`);
        }
    }

    const firstLesson = course.modules[0]?.lessons[0];

    const totalLessons = (course.modules as any[]).reduce((acc: number, mod: any) => acc + mod.lessons.length, 0);

    let accessStatus = {
        hasAccess: false,
        expiresAt: null as Date | null,
        statusLabel: "", // "Trial", "Pro", "Granted"
    };

    if (session?.user) {
        const dbUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { isSubscribed: true, role: true, subscriptionEndsAt: true }
        });

        const isSubscribed = dbUser?.isSubscribed && dbUser.subscriptionEndsAt && dbUser.subscriptionEndsAt > new Date();

        const access = await prisma.courseAccess.findUnique({
            where: {
                userId_courseId: {
                    userId: session.user.id,
                    courseId: course.id,
                },
            },
        });

        const isTrialActive = course.offerFreeTrial &&
            (new Date().getTime() - new Date(course.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000;

        if (dbUser?.role === "ADMIN") {
            accessStatus.hasAccess = true;
            accessStatus.statusLabel = "ADMIN";
        } else if (isSubscribed) {
            accessStatus.hasAccess = true;
            accessStatus.statusLabel = "PRO";
        } else if (access && (access.expiresAt > new Date())) {
            accessStatus.hasAccess = true;
            accessStatus.expiresAt = access.expiresAt;
            accessStatus.statusLabel = "GRANTED";
        } else if (isTrialActive) {
            accessStatus.hasAccess = true;
            accessStatus.statusLabel = "TRIAL";
            const trialEndsAt = new Date(course.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
            accessStatus.expiresAt = trialEndsAt;
        }
    }

    return (
        <div className="min-h-screen bg-white text-zinc-900 pt-32 transition-colors duration-300">
            {/* Hero Section */}
            <div className="relative border-b border-zinc-200 bg-zinc-50">
                <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="bg-blue-600 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white">
                                {course.category}
                            </span>
                            <span className="text-zinc-500 text-xs font-medium uppercase tracking-widest">
                                {course.level} Level
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 leading-tight">
                            {course.title}
                        </h1>
                        <p className="text-zinc-600 text-lg mb-8 leading-relaxed max-w-xl">
                            {course.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500 font-medium mb-8">
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-blue-600" />
                                <span>{course.modules.length} Modules</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <span>{course.duration || "Self-paced"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-blue-600" />
                                <span>{totalLessons} Lessons</span>
                            </div>
                            <div className="flex items-center gap-2 font-bold text-zinc-900">
                                <IndianRupee className="w-4 h-4 text-green-600" />
                                <span>{course.price ? `₹${course.price}` : "Included in PRO"}</span>
                            </div>
                        </div>

                        {!session?.user ? (
                            <Link
                                href="/auth/signin"
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                            >
                                <Lock className="w-5 h-5" />
                                Sign in to Access
                            </Link>
                        ) : (
                            <div className="space-y-4">
                                {accessStatus.hasAccess ? (
                                    <div className="flex flex-col gap-6">
                                        <div className="flex items-center gap-3 px-5 py-3 bg-green-50 text-green-700 border border-green-200 rounded-2xl w-fit">
                                            <CheckCircle2 className="w-5 h-5" />
                                            <div>
                                                <p className="text-sm font-bold">
                                                    {accessStatus.statusLabel} ACCESS ACTIVE
                                                </p>
                                                {accessStatus.expiresAt && (
                                                    <p className="text-[10px] opacity-80 uppercase tracking-widest font-medium">
                                                        Expires: {accessStatus.expiresAt.toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {firstLesson && (
                                            <Link
                                                href={`/courses/${course.slug}/lessons/${firstLesson.slug}`}
                                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 w-fit"
                                            >
                                                Start Learning Now <ArrowRight className="w-5 h-5" />
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="p-6 bg-zinc-100 border border-zinc-200 rounded-3xl flex items-start gap-4 flex-1">
                                                <div className="p-3 bg-white rounded-2xl shadow-sm">
                                                    <Lock className="w-6 h-6 text-zinc-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-zinc-900 mb-1 text-lg">Premium Content</h4>
                                                    <p className="text-zinc-500 text-sm leading-relaxed">
                                                        Unlock this course forever or get elite access to all courses.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4">
                                            {(course as any).price > 0 && (
                                                <RazorpayButton
                                                    courseId={course.id}
                                                    price={(course as any).price}
                                                    label={`Buy Course - ₹${(course as any).price}`}
                                                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                                                />
                                            )}

                                            <Link
                                                href="/pricing"
                                                className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-zinc-900/10 active:scale-95"
                                            >
                                                Get PRO Access <ArrowRight className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="relative aspect-video rounded-3xl overflow-hidden border border-zinc-200 shadow-2xl shadow-blue-500/5 group bg-zinc-100">
                        <div className="absolute top-4 right-4 z-10">
                            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/50 shadow-xl flex items-center gap-2">
                                <IndianRupee className="w-4 h-4 text-zinc-900" />
                                <span className="font-black text-zinc-900">
                                    {course.price ? `₹${course.price}` : "PRO Content"}
                                </span>
                            </div>
                        </div>
                        {course.thumbnail ? (
                            <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-zinc-100 flex items-center justify-center">
                                <PlayCircle className="w-20 h-20 text-zinc-300" />
                            </div>
                        )}
                        {accessStatus.hasAccess && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-600/40">
                                    <PlayCircle className="w-8 h-8 text-white fill-white" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Syllabus Section */}
            <div className="max-w-4xl mx-auto px-6 py-20">
                <h2 className="text-3xl font-bold mb-10 tracking-tight">Course Syllabus</h2>
                <div className="space-y-8">
                    {(course.modules as any[]).map((module: any, mIdx: number) => (
                        <div key={module.id} className="relative">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-zinc-100 border border-zinc-200 rounded-lg flex items-center justify-center text-xs font-bold text-zinc-500">
                                    {String(mIdx + 1).padStart(2, '0')}
                                </div>
                                <h3 className="text-xl font-bold">{module.title}</h3>
                            </div>
                            <div className="ml-4 pl-8 border-l border-zinc-100 space-y-3">
                                {(module.lessons as any[]).map((lesson: any) => (
                                    <Link
                                        key={lesson.id}
                                        href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                                        className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-transparent hover:border-zinc-200 hover:bg-white transition-all group shadow-sm hover:shadow-md"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-blue-600/10 transition-colors">
                                                {lesson.isFree ? (
                                                    <PlayCircle className="w-4 h-4 text-blue-600" />
                                                ) : (
                                                    <Lock className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-600" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold group-hover:text-blue-600 transition-colors">
                                                    {lesson.title}
                                                </h4>
                                                {lesson.isFree && (
                                                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Free Preview</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                                            Start Lesson
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
}
