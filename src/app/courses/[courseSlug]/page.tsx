
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayCircle, CheckCircle2, Lock, Clock, BookOpen, Layers } from "lucide-react";
import { RequestAccessButton } from "@/components/course/RequestAccessButton";

interface CoursePageProps {
    params: Promise<{ courseSlug: string }>;
}

export default async function CourseOverviewPage({ params }: CoursePageProps) {
    const { courseSlug } = await params;
    const session = await auth();

    const course = await prisma.course.findUnique({
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
    });

    if (!course) {
        return notFound();
    }

    const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);

    let accessStatus = {
        hasAccess: false,
        expiresAt: null as Date | null,
        isPending: false,
        isRejected: false,
    };

    if (session?.user) {
        const [access, request] = await Promise.all([
            prisma.courseAccess.findUnique({
                where: {
                    userId_courseId: {
                        userId: session.user.id,
                        courseId: course.id,
                    },
                },
            }),
            prisma.courseAccessRequest.findUnique({
                where: {
                    userId_courseId: {
                        userId: session.user.id,
                        courseId: course.id,
                    },
                },
            }),
        ]);

        if (access) {
            accessStatus.hasAccess = true;
            accessStatus.expiresAt = access.expiresAt;
        }

        if (request) {
            if (request.status === "PENDING") accessStatus.isPending = true;
            if (request.status === "REJECTED") accessStatus.isRejected = true;
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
                                <Layers className="w-4 h-4 text-blue-600" />
                                <span>{totalLessons} Lessons</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <span>Self-paced</span>
                            </div>
                        </div>

                        {session?.user && (
                            <div className="mb-8">
                                <RequestAccessButton
                                    courseId={course.id}
                                    hasAccess={accessStatus.hasAccess}
                                    expiresAt={accessStatus.expiresAt}
                                    isPending={accessStatus.isPending}
                                    isRejected={accessStatus.isRejected}
                                />
                            </div>
                        )}
                    </div>

                    <div className="relative aspect-video rounded-3xl overflow-hidden border border-zinc-200 shadow-2xl shadow-blue-500/5 group bg-zinc-100">
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
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-600/40">
                                <PlayCircle className="w-8 h-8 text-white fill-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Syllabus Section */}
            <div className="max-w-4xl mx-auto px-6 py-20">
                <h2 className="text-3xl font-bold mb-10 tracking-tight">Course Syllabus</h2>
                <div className="space-y-8">
                    {course.modules.map((module, mIdx) => (
                        <div key={module.id} className="relative">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-zinc-100 border border-zinc-200 rounded-lg flex items-center justify-center text-xs font-bold text-zinc-500">
                                    {String(mIdx + 1).padStart(2, '0')}
                                </div>
                                <h3 className="text-xl font-bold">{module.title}</h3>
                            </div>

                            <div className="ml-4 pl-8 border-l border-zinc-100 space-y-3">
                                {module.lessons.map((lesson) => (
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
        </div>
    );
}
