import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayCircle, CheckCircle2, Lock, Clock, BookOpen, Layers } from "lucide-react";

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

    return (
        <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white pt-32 transition-colors duration-300">
            {/* Hero Section */}
            <div className="relative border-b border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950/50">
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
                        <p className="text-zinc-600 dark:text-zinc-400 text-lg mb-8 leading-relaxed max-w-xl">
                            {course.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500 font-medium">
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                                <span>{course.modules.length} Modules</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                                <span>{totalLessons} Lessons</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                                <span>Self-paced</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative aspect-video rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-blue-500/5 group bg-zinc-100 dark:bg-zinc-900">
                        {course.thumbnail ? (
                            <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                                <PlayCircle className="w-20 h-20 text-zinc-300 dark:text-zinc-800" />
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
                                <div className="flex-shrink-0 w-8 h-8 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center justify-center text-xs font-bold text-zinc-500">
                                    {String(mIdx + 1).padStart(2, '0')}
                                </div>
                                <h3 className="text-xl font-bold">{module.title}</h3>
                            </div>

                            <div className="ml-4 pl-8 border-l border-zinc-100 dark:border-zinc-900 space-y-3">
                                {module.lessons.map((lesson) => (
                                    <Link
                                        key={lesson.id}
                                        href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                                        className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900/50 transition-all group shadow-sm hover:shadow-md dark:shadow-none"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center group-hover:bg-blue-600/10 transition-colors">
                                                {lesson.isFree ? (
                                                    <PlayCircle className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                                                ) : (
                                                    <Lock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 group-hover:text-blue-600 dark:group-hover:text-blue-500" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold group-hover:text-blue-600 dark:group-hover:text-white transition-colors">
                                                    {lesson.title}
                                                </h4>
                                                {lesson.isFree && (
                                                    <span className="text-[10px] text-blue-600 dark:text-blue-500 font-bold uppercase tracking-widest">Free Preview</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-widest group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors">
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
