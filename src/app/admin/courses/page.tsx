import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
    Trash2,
    Eye,
    EyeOff,
    Plus,
    Youtube,
    Video,
    LayoutGrid,
    Search
} from "lucide-react";
import { updateCourseStatus, deleteCourse } from "@/actions/admin";
import { toast } from "sonner";
import { revalidatePath } from "next/cache";

export default async function AdminCoursesPage() {
    const courses = await prisma.course.findMany({
        include: {
            _count: {
                select: { modules: true }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Course Management
                        </h1>
                        <p className="text-zinc-400 text-sm mt-1">Manage your imported YouTube courses and their visibility.</p>
                    </div>
                    <Link
                        href="/admin/import"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 w-fit"
                    >
                        <Plus className="w-4 h-4" />
                        Import New Course
                    </Link>
                </div>

                {courses.length === 0 ? (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-16 text-center backdrop-blur-sm">
                        <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Video className="w-10 h-10 text-zinc-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                        <p className="text-zinc-500 max-w-sm mx-auto mb-8">
                            You haven't imported any courses yet. Start by fetching a playlist from YouTube.
                        </p>
                        <Link
                            href="/admin/import"
                            className="text-blue-500 hover:text-blue-400 font-medium"
                        >
                            Take me to Import →
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                className="group bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-6 transition-all"
                            >
                                {/* Thumbnail */}
                                <div className="w-full md:w-48 aspect-video rounded-xl overflow-hidden bg-zinc-800 shrink-0 relative">
                                    {course.thumbnail ? (
                                        <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Youtube className="w-8 h-8 text-zinc-700" />
                                        </div>
                                    )}
                                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${course.isPublished ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                                        {course.isPublished ? 'Published' : 'Draft'}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 text-center md:text-left">
                                    <h3 className="text-lg font-bold text-white mb-1 truncate">{course.title}</h3>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-zinc-400">
                                        <span className="flex items-center gap-1.5 leading-none">
                                            <LayoutGrid className="w-4 h-4" />
                                            {course._count.modules} Modules
                                        </span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 hidden md:block" />
                                        <span className="leading-none">Created: {new Date(course.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <CourseActions
                                        courseId={course.id}
                                        isPublished={course.isPublished}
                                        slug={course.slug}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Simple Client component for actions to avoid making the whole page "use client"
import CourseActions from "./CourseActions";
