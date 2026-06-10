"use client";

import { updateCourseStatus, deleteCourse } from "@/actions/admin";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    Trash2,
    Eye,
    EyeOff,
    ExternalLink,
    Loader2,
    Settings
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
                className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors"
                title="View Course"
            >
                <ExternalLink className="w-5 h-5" />
            </Link>

            <Link
                href={`/admin/courses/${courseId}`}
                className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 transition-colors"
                title="Edit Course"
            >
                <Settings className="w-5 h-5" />
            </Link>

            <button
                onClick={handleToggleStatus}
                disabled={loading}
                className={`p-2.5 rounded-xl transition-colors ${isPublished
                    ? 'bg-zinc-100 hover:bg-zinc-200 text-amber-600'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100'
                    }`}
                title={isPublished ? "Unpublish" : "Publish"}
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isPublished ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />)}
            </button>

            <button
                onClick={handleDelete}
                disabled={loading}
                className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 transition-colors"
                title="Delete Course"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
            </button>
        </div>
    );
}
