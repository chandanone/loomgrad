"use client";

import { useTransition, useState } from "react";
import { grantUserAccess } from "@/actions/admin";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function GrantAccessForm({ courses }: { courses: { id: string, title: string }[] }) {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = (formData: FormData) => {
        const email = formData.get("email") as string;
        const courseId = formData.get("courseId") as string;
        const days = parseInt(formData.get("days") as string);

        setMessage(null);

        startTransition(async () => {
            const result = await grantUserAccess(email, courseId, days);
            if (result.success) {
                setMessage({ type: 'success', text: "Access granted successfully!" });
                (document.getElementById("grant-form") as HTMLFormElement)?.reset();
            } else {
                setMessage({ type: 'error', text: result.error || "Something went wrong" });
            }
        });
    };

    return (
        <form id="grant-form" action={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">User Email</label>
                <input
                    name="email"
                    type="email"
                    required
                    placeholder="student@example.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
            </div>

            {/* Course */}
            <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Select Course</label>
                <select
                    name="courseId"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                    <option value="">-- Choose a Course --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
            </div>

            {/* Duration */}
            <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Duration (Days)</label>
                <input
                    name="days"
                    type="number"
                    required
                    min="1"
                    defaultValue="30"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
            </div>

            {/* Submit */}
            <button
                disabled={isPending}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
                {isPending ? <Loader2 className="animate-spin w-5 h-5" /> : "Grant Access"}
            </button>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}
        </form>
    );
}
