
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Play, BookOpen, Clock, BarChart } from "lucide-react";

export const revalidate = 60; // Revalidate every minute

export default async function CoursesPage() {
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

    const coursesWithLessonCount = courses.map((course) => ({
        ...course,
        totalLessons: course.modules.reduce((acc, module) => acc + module._count.lessons, 0),
    }));

    return (
        <div className="min-h-screen bg-white text-zinc-900 pt-32 pb-20 px-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-5xl font-bold tracking-tight mb-4">Course Catalog</h1>
                    <p className="text-zinc-600 text-lg">Master the most in-demand technical skills with our curated curriculum.</p>
                </header>

                {courses.length === 0 ? (
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
                        {coursesWithLessonCount.map((course) => (
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
                                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-200 flex items-center justify-center">
                                            <Play className="w-12 h-12 text-zinc-400" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-100 via-transparent to-transparent opacity-60" />

                                    {/* Category Badge */}
                                    {course.category && (
                                        <div className="absolute top-4 left-4 bg-blue-600 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white">
                                            {course.category}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {course.title}
                                    </h3>
                                    <p className="text-zinc-600 text-sm mb-6 line-clamp-2">
                                        {course.description || "Start your technical journey with this comprehensive guide."}
                                    </p>

                                    <div className="flex items-center justify-between text-[13px] text-zinc-500 font-medium border-t border-zinc-200 pt-4">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            <span>{course.level}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <BarChart className="w-4 h-4" />
                                            <span>{course.totalLessons} Lessons</span>
                                        </div>
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
