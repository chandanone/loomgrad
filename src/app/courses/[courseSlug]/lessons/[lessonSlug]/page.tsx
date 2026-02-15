import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import CourseSidebar from "@/components/layout/CourseSidebar";
import LessonWorkspace from "@/components/learning/LessonWorkspace";

export default async function LessonPage({
    params
}: {
    params: Promise<{ courseSlug: string; lessonSlug: string }>
}) {
    const { courseSlug, lessonSlug } = await params;
    const session = await auth();

    // 1. Fetch Course Data with Modules and Lessons
    const course = await prisma.course.findUnique({
        where: { slug: courseSlug },
        include: {
            modules: {
                include: {
                    lessons: {
                        orderBy: { orderIndex: "asc" },
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            isFree: true,
                        }
                    }
                },
                orderBy: { orderIndex: "asc" },
            }
        }
    });

    if (!course) notFound();

    // 2. Fetch Current Lesson
    const lesson = await prisma.lesson.findFirst({
        where: {
            slug: lessonSlug,
            module: { courseId: course.id }
        }
    });

    if (!lesson) notFound();

    // 3. Check Subscription Status
    const user = session?.user?.email
        ? await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { courseAccess: true }
        })
        : null;

    const isSubscribed = user?.isSubscribed || false;

    // Check for specific course access grant
    const hasCourseAccess = user?.courseAccess?.some((access: any) =>
        access.courseId === course.id && access.expiresAt > new Date()
    );

    const showPaywall = !lesson.isFree && !isSubscribed && !hasCourseAccess;

    return (
        <div className="flex h-screen bg-black text-white pt-16">
            {/* Sidebar */}
            <CourseSidebar modules={course.modules} isSubscribed={isSubscribed} />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Header */}
                <header className="px-4 sm:px-6 lg:px-8 py-3 lg:py-4 border-b border-zinc-900 flex items-center justify-between bg-black/50 backdrop-blur-md sticky top-0 z-30 shrink-0">
                    <div className="flex items-center gap-4 min-w-0">
                        <h2 className="text-xs sm:text-sm font-bold tracking-tight text-zinc-400 capitalize truncate">
                            <span className="hidden sm:inline">{course.title}</span>
                            <span className="sm:hidden">{course.title.length > 20 ? course.title.substring(0, 20) + '...' : course.title}</span>
                            <span className="mx-2 text-zinc-700">/</span>
                            <span className="text-white">{lesson.title}</span>
                        </h2>
                    </div>
                </header>

                {/* Workspace */}
                <LessonWorkspace
                    lesson={{
                        title: lesson.title,
                        description: lesson.description,
                        youtubeVideoId: lesson.youtubeVideoId,
                        starterCode: lesson.starterCode,
                    }}
                    courseThumbnail={course.thumbnail}
                    showPaywall={showPaywall}
                />
            </main>
        </div>
    );
}
