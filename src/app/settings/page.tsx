import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Settings, User, Bell, Shield, CreditCard } from "lucide-react";

export default async function SettingsPage() {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin");
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white pt-32 pb-20 px-6 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-4 flex items-center gap-3">
                        <Settings className="w-8 h-8 text-blue-500" />
                        Account Settings
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400">Manage your profile, preferences, and subscriptions.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Sidebar Nav */}
                    <div className="space-y-2">
                        <button className="w-full flex items-center gap-3 px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl font-bold text-sm">
                            <User className="w-4 h-4" />
                            General
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl font-bold text-sm transition-all">
                            <Bell className="w-4 h-4" />
                            Notifications
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl font-bold text-sm transition-all">
                            <Shield className="w-4 h-4" />
                            Security
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl font-bold text-sm transition-all">
                            <CreditCard className="w-4 h-4" />
                            Billing
                        </button>
                    </div>

                    {/* Content Panel */}
                    <div className="md:col-span-3 space-y-8">
                        <section className="p-8 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
                            <h2 className="text-xl font-bold mb-6">Profile Information</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        defaultValue={session.user?.name || ""}
                                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 transition-colors outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        defaultValue={session.user?.email || ""}
                                        disabled
                                        className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-500 cursor-not-allowed"
                                    />
                                </div>
                                <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
                                    Save Changes
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
