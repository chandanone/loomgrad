"use client";

import { updateCourseStatus, deleteCourse } from "@/actions/admin";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    Trash2,
    Eye,
    EyeOff,
    ExternalLink,
    Loader2
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface CourseActionsProps {
    courseId: string;
    isPublished: boolean;
    slug: string;
}

export default function CourseActions({ courseId, isPublished, slug }: CourseActionsProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleToggleStatus = async () => {
        setLoading(true);
        try {
            const result = await updateCourseStatus(courseId, !isPublished);
            if (result.success) {
                toast.success(isPublished ? "Course unpublished" : "Course published!");
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;

        setLoading(true);
        try {
            const result = await deleteCourse(courseId);
            if (result.success) {
                toast.success("Course deleted successfully");
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Link
                href={`/courses/${slug}`}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                title="View Course"
            >
                <ExternalLink className="w-5 h-5" />
            </Link>

            <button
                onClick={handleToggleStatus}
                disabled={loading}
                className={`p-2.5 rounded-xl transition-colors ${isPublished
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-yellow-500'
                        : 'bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 border border-blue-500/20'
                    }`}
                title={isPublished ? "Unpublish" : "Publish"}
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isPublished ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />)}
            </button>

            <button
                onClick={handleDelete}
                disabled={loading}
                className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-colors"
                title="Delete Course"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
            </button>
        </div>
    );
}
