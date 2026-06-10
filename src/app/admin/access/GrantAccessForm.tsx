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
                <label className="block text-sm font-medium text-zinc-500 mb-2">User Email</label>
                <input
                    name="email"
                    type="email"
                    required
                    placeholder="student@example.com"
                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:border-blue-500 transition-colors"
                />
            </div>

            {/* Course */}
            <div>
                <label className="block text-sm font-medium text-zinc-500 mb-2">Select Course</label>
                <select
                    name="courseId"
                    required
                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2371717a' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25rem' }}
                >
                    <option value="">-- Choose a Course --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
            </div>

            {/* Duration */}
            <div>
                <label className="block text-sm font-medium text-zinc-500 mb-2">Duration (Days)</label>
                <input
                    name="days"
                    type="number"
                    required
                    min="1"
                    defaultValue="30"
                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:border-blue-500 transition-colors"
                />
            </div>

            {/* Submit */}
            <button
                disabled={isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
                {isPending ? <Loader2 className="animate-spin w-5 h-5" /> : "Grant Access"}
            </button>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}
        </form>
    );
}
