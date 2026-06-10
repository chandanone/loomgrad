import { prisma } from "@/lib/prisma";
import GrantAccessForm from "./GrantAccessForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AccessPage() {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        redirect("/");
    }

    const courses = await prisma.course.findMany({
        select: { id: true, title: true, slug: true },
        orderBy: { title: 'asc' }
    });

    return (
        <div className="min-h-screen bg-white text-zinc-900 p-8">
            <div className="max-w-xl mx-auto">
                <Link href="/admin" className="flex items-center gap-2 text-zinc-500 mb-8 hover:text-blue-600 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold mb-2">Grant Course Access</h1>
                <p className="text-zinc-500 mb-8">Manually unlock a course for a student for a specific duration.</p>

                <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-8 shadow-sm">
                    <GrantAccessForm courses={courses} />
                </div>
            </div>
        </div>
    );
}
