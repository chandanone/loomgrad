
"use client";

import { useState } from "react";
import {
    Save,
    Plus,
    Trash2,
    ChevronUp,
    ChevronDown,
    GripVertical,
    Settings,
    Layout,
    Video,
    Clock,
    IndianRupee,
    Loader2,
    X
} from "lucide-react";
import {
    updateCourseDetails,
    createModule,
    updateModule,
    deleteModule,
    deleteLesson,
    rearrangeLessons,
    rearrangeModules
} from "@/actions/admin";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ModuleWithLessons {
    id: string;
    title: string;
    orderIndex: number;
    lessons: {
        id: string;
        title: string;
        orderIndex: number;
        youtubeVideoId: string;
    }[];
}

interface CourseEditorProps {
    course: {
        id: string;
        title: string;
        description: string;
        price: number | null;
        duration: string | null;
        level: string;
        isPublished: boolean;
        offerFreeTrial: boolean;
        modules: ModuleWithLessons[];
    };
}

export default function CourseEditor({ course: initialCourse }: CourseEditorProps) {
    const [activeTab, setActiveTab] = useState<"general" | "curriculum">("general");
    const [isSaving, setIsSaving] = useState(false);
    const [course, setCourse] = useState(initialCourse);
    const router = useRouter();

    // --- General Info Handlers ---
    const handleGeneralSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);

        try {
            const res = await updateCourseDetails(course.id, {
                title: formData.get("title") as string,
                description: formData.get("description") as string,
                price: parseFloat(formData.get("price") as string) || 0,
                duration: formData.get("duration") as string,
                level: formData.get("level") as any,
                offerFreeTrial: formData.get("offerFreeTrial") === "on",
            });

            if (res.success) {
                toast.success("Course details updated!");
                router.refresh();
            } else {
                toast.error(res.error);
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setIsSaving(false);
        }
    };

    // --- Module Handlers ---
    const handleAddModule = async () => {
        const title = prompt("Enter Module Title:");
        if (!title) return;

        try {
            const res = await createModule(course.id, title, course.modules.length);
            if (res.success && res.module) {
                setCourse({
                    ...course,
                    modules: [...course.modules, { ...res.module, lessons: [] }]
                });
                toast.success("Module created!");
            }
        } catch (err) {
            toast.error("Failed to create module");
        }
    };

    const handleUpdateModule = async (moduleId: string, oldTitle: string) => {
        const title = prompt("Update Module Title:", oldTitle);
        if (!title || title === oldTitle) return;

        try {
            const res = await updateModule(moduleId, title);
            if (res.success) {
                setCourse({
                    ...course,
                    modules: course.modules.map(m => m.id === moduleId ? { ...m, title } : m)
                });
                toast.success("Module updated!");
            }
        } catch (err) {
            toast.error("Failed to update module");
        }
    };

    const handleDeleteModule = async (moduleId: string) => {
        if (!confirm("Are you sure? All lessons in this module will be deleted too.")) return;

        try {
            const res = await deleteModule(moduleId);
            if (res.success) {
                setCourse({
                    ...course,
                    modules: course.modules.filter(m => m.id !== moduleId)
                });
                toast.success("Module deleted");
            }
        } catch (err) {
            toast.error("Failed to delete module");
        }
    };

    // --- Lesson Handlers ---
    const handleDeleteLesson = async (lessonId: string, moduleId: string) => {
        if (!confirm("Are you sure you want to remove this video from the course?")) return;

        try {
            const res = await deleteLesson(lessonId);
            if (res.success) {
                setCourse({
                    ...course,
                    modules: course.modules.map(m =>
                        m.id === moduleId
                            ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) }
                            : m
                    )
                });
                toast.success("Video removed from course");
            }
        } catch (err) {
            toast.error("Failed to remove video");
        }
    };

    const moveLesson = async (lessonId: string, fromModuleId: string, direction: 'up' | 'down') => {
        const module = course.modules.find(m => m.id === fromModuleId);
        if (!module) return;

        const lessonIndex = module.lessons.findIndex(l => l.id === lessonId);
        if (direction === 'up' && lessonIndex === 0) return;
        if (direction === 'down' && lessonIndex === module.lessons.length - 1) return;

        const newLessons = [...module.lessons];
        const targetIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;

        // Swap
        [newLessons[lessonIndex], newLessons[targetIndex]] = [newLessons[targetIndex], newLessons[lessonIndex]];

        // Update orderIndex
        const updatedLessons = newLessons.map((l, i) => ({ ...l, orderIndex: i }));

        // Optimistic update
        setCourse({
            ...course,
            modules: course.modules.map(m => m.id === fromModuleId ? { ...m, lessons: updatedLessons } : m)
        });

        try {
            const res = await rearrangeLessons(course.id, updatedLessons.map(l => ({
                lessonId: l.id,
                moduleId: fromModuleId,
                orderIndex: l.orderIndex
            })));
            if (!res.success) toast.error("Failed to save order");
        } catch (err) {
            toast.error("Failed to rearrange");
        }
    };

    const moveModule = async (moduleId: string, direction: 'up' | 'down') => {
        const moduleIndex = course.modules.findIndex(m => m.id === moduleId);
        if (direction === 'up' && moduleIndex === 0) return;
        if (direction === 'down' && moduleIndex === course.modules.length - 1) return;

        const newModules = [...course.modules];
        const targetIndex = direction === 'up' ? moduleIndex - 1 : moduleIndex + 1;

        // Swap
        [newModules[moduleIndex], newModules[targetIndex]] = [newModules[targetIndex], newModules[moduleIndex]];

        // Update orderIndex
        const updatedModules = newModules.map((m, i) => ({ ...m, orderIndex: i }));

        // Optimistic update
        setCourse({
            ...course,
            modules: updatedModules
        });

        try {
            const res = await rearrangeModules(course.id, updatedModules.map(m => ({
                moduleId: m.id,
                orderIndex: m.orderIndex
            })));
            if (!res.success) toast.error("Failed to save module order");
        } catch (err) {
            toast.error("Failed to rearrange modules");
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">{course.title}</h1>
                    <p className="text-zinc-500">Course Management Dashboard</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab("general")}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${activeTab === "general" ? "bg-zinc-900 text-white" : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                            }`}
                    >
                        <Settings className="w-4 h-4" />
                        General Settings
                    </button>
                    <button
                        onClick={() => setActiveTab("curriculum")}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${activeTab === "curriculum" ? "bg-zinc-900 text-white" : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                            }`}
                    >
                        <Layout className="w-4 h-4" />
                        Curriculum
                    </button>
                </div>
            </div>

            {activeTab === "general" ? (
                <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
                    <form onSubmit={handleGeneralSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700 ml-1 uppercase tracking-widest">Course Name</label>
                                <input
                                    name="title"
                                    defaultValue={course.title}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-3.5 focus:border-blue-600 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700 ml-1 uppercase tracking-widest">Duration (e.g. 12h 30m)</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input
                                        name="duration"
                                        defaultValue={course.duration || ""}
                                        placeholder="e.g. 10 hours"
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-12 pr-5 py-3.5 focus:border-blue-600 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700 ml-1 uppercase tracking-widest">Course Fee (₹)</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input
                                        name="price"
                                        type="number"
                                        defaultValue={course.price || 0}
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-12 pr-5 py-3.5 focus:border-blue-600 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700 ml-1 uppercase tracking-widest">Difficulty Level</label>
                                <select
                                    name="level"
                                    defaultValue={course.level}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-3.5 focus:border-blue-600 outline-none transition-all appearance-none"
                                >
                                    <option value="BEGINNER">Beginner</option>
                                    <option value="INTERMEDIATE">Intermediate</option>
                                    <option value="ADVANCED">Advanced</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-zinc-700 ml-1 uppercase tracking-widest">Description</label>
                            <textarea
                                name="description"
                                defaultValue={course.description}
                                rows={6}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-3.5 focus:border-blue-600 outline-none transition-all resize-none"
                            />
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                            <input
                                type="checkbox"
                                name="offerFreeTrial"
                                id="offerFreeTrial"
                                defaultChecked={course.offerFreeTrial}
                                className="w-5 h-5 accent-blue-600 rounded"
                            />
                            <label htmlFor="offerFreeTrial" className="text-sm font-bold text-blue-700">
                                Offer 30-Day Free Trial upon subscription/login
                            </label>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                disabled={isSaving}
                                type="submit"
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <button
                            onClick={handleAddModule}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                        >
                            <Plus className="w-4 h-4" />
                            New Module
                        </button>
                    </div>

                    <div className="space-y-8">
                        {course.modules.sort((a, b) => a.orderIndex - b.orderIndex).map((module, mIdx) => (
                            <div key={module.id} className="bg-zinc-50 border border-zinc-200 rounded-3xl overflow-hidden">
                                <div className="bg-white border-b border-zinc-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-zinc-100 rounded-lg">
                                            <GripVertical className="w-5 h-5 text-zinc-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                                                {module.title}
                                                <button onClick={() => handleUpdateModule(module.id, module.title)} className="p-1 hover:bg-zinc-100 rounded transition-colors">
                                                    <Settings className="w-3.5 h-3.5 text-zinc-400" />
                                                </button>
                                            </h3>
                                            <p className="text-xs text-zinc-500">{module.lessons.length} Videos</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => moveModule(module.id, 'up')}
                                            disabled={mIdx === 0}
                                            className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg disabled:opacity-0 transition-all"
                                            title="Move Module Up"
                                        >
                                            <ChevronUp className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => moveModule(module.id, 'down')}
                                            disabled={mIdx === course.modules.length - 1}
                                            className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg disabled:opacity-0 transition-all"
                                            title="Move Module Down"
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                        <div className="w-px h-6 bg-zinc-200 mx-2" />
                                        <button
                                            onClick={() => handleDeleteModule(module.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 space-y-2">
                                    {module.lessons.sort((a, b) => a.orderIndex - b.orderIndex).map((lesson, idx) => (
                                        <div key={lesson.id} className="bg-white border border-zinc-100 rounded-2xl p-4 flex items-center justify-between gap-4 group">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-xs font-bold text-zinc-400 border border-zinc-100">
                                                    {idx + 1}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-sm text-zinc-900 truncate">{lesson.title}</p>
                                                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                                                        <Video className="w-3 h-3" />
                                                        {lesson.youtubeVideoId}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => moveLesson(lesson.id, module.id, 'up')}
                                                    disabled={idx === 0}
                                                    className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg disabled:opacity-0 transition-all"
                                                >
                                                    <ChevronUp className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => moveLesson(lesson.id, module.id, 'down')}
                                                    disabled={idx === module.lessons.length - 1}
                                                    className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg disabled:opacity-0 transition-all"
                                                >
                                                    <ChevronDown className="w-4 h-4" />
                                                </button>
                                                <div className="w-px h-4 bg-zinc-100 mx-1" />
                                                <button
                                                    onClick={() => handleDeleteLesson(lesson.id, module.id)}
                                                    className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {module.lessons.length === 0 && (
                                        <div className="py-8 text-center border-2 border-dashed border-zinc-200 rounded-2xl">
                                            <p className="text-zinc-400 text-sm">No videos in this module.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

