
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CourseEditor from "./CourseEditor";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function CourseEditPage({
    params
}: {
    params: Promise<{ courseId: string }>
}) {
    const { courseId } = await params;

    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            modules: {
                include: {
                    lessons: {
                        orderBy: { orderIndex: 'asc' }
                    }
                },
                orderBy: { orderIndex: 'asc' }
            }
        }
    });

    if (!course) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-zinc-50/50">
            <div className="bg-white border-b border-zinc-200 py-4">
                <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center gap-4">
                    <Link
                        href="/admin/courses"
                        className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-500"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="h-6 w-px bg-zinc-200" />
                    <nav className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                        <Link href="/admin" className="hover:text-zinc-900">Admin</Link>
                        <span>/</span>
                        <Link href="/admin/courses" className="hover:text-zinc-900">Courses</Link>
                        <span>/</span>
                        <span className="text-zinc-900 truncate max-w-[200px]">{course.title}</span>
                    </nav>
                </div>
            </div>

            <CourseEditor course={course as any} />
        </div>
    );
}
