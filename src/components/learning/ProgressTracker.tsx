"use client";

import { useEffect } from "react";
import { updateLessonProgress } from "@/actions/progress";

interface ProgressTrackerProps {
    courseId: string;
    lessonId: string;
}

export function ProgressTracker({ courseId, lessonId }: ProgressTrackerProps) {
    useEffect(() => {
        const updateProgress = async () => {
            try {
                await updateLessonProgress(courseId, lessonId);
            } catch (error) {
                console.error("Failed to track progress:", error);
            }
        };

        updateProgress();
    }, [courseId, lessonId]);

    return null;
}
