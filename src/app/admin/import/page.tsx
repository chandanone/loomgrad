"use client";

import { useState } from "react";
import { importYouTubePlaylist } from "@/actions/admin";
import { useRouter } from "next/navigation";
import { Loader2, Send, Youtube } from "lucide-react";
import { toast } from "sonner";

export default function AdminImportPage() {
    const [playlistId, setPlaylistId] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!playlistId) return;

        setLoading(true);
        try {
            const result = await importYouTubePlaylist(playlistId);
            if (result.success) {
                toast.success("Playlist imported successfully!");
                setPlaylistId("");
                router.push("/admin/courses");
            } else {
                toast.error(result.error || "Failed to import playlist");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                        Admin: One-Click Course Import
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Enter a YouTube Playlist ID to automatically generate a full course with modules and lessons.
                    </p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm">
                    <form onSubmit={handleImport} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="playlistId" className="text-sm font-medium text-gray-300">
                                YouTube Playlist ID
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-red-500">
                                    <Youtube className="w-5 h-5" />
                                </div>
                                <input
                                    id="playlistId"
                                    type="text"
                                    placeholder="e.g. PLu0W_uo75pR7e786TC-vR_k8"
                                    value={playlistId}
                                    onChange={(e) => setPlaylistId(e.target.value)}
                                    className="w-full bg-black border border-zinc-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !playlistId}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Importing Lessons...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Start Automation
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 space-y-4">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">How it works</h3>
                        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <li className="bg-zinc-900/80 p-4 rounded-lg border border-zinc-800">
                                <span className="block text-blue-500 font-bold mb-1">01</span>
                                <p className="text-xs text-gray-400">Fetches metadata and all video items from your playlist.</p>
                            </li>
                            <li className="bg-zinc-900/80 p-4 rounded-lg border border-zinc-800">
                                <span className="block text-purple-500 font-bold mb-1">02</span>
                                <p className="text-xs text-gray-400">Auto-generates modules and maps videos to lessons.</p>
                            </li>
                            <li className="bg-zinc-900/80 p-4 rounded-lg border border-zinc-800">
                                <span className="block text-green-500 font-bold mb-1">03</span>
                                <p className="text-xs text-gray-400">Sets the first lesson to free & blurs others for students.</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
