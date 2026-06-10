import {
    Settings as SettingsIcon,
    Globe,
    Bell,
    Lock,
    Eye,
    Zap,
    Youtube,
    Mail,
    Share2,
    Save,
    LayoutDashboard,
    AlertTriangle,
    CheckCircle2
} from "lucide-react";

export default function AdminSettingsPage() {
    return (
        <div className="min-h-screen bg-white text-zinc-900 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Platform Settings
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">
                            Configure your LMS global preferences and integrations.
                        </p>
                    </div>
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50">
                        <Save className="w-4 h-4" />
                        Save Changes
                    </button>
                </div>

                <div className="space-y-8 pb-20">
                    {/* General Section */}
                    <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-100">
                            <div className="bg-blue-50 p-2.5 rounded-xl">
                                <Globe className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">General Configuration</h2>
                                <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider mt-0.5">Basic Platform Info</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700 ml-1">Platform Name</label>
                                <input
                                    type="text"
                                    defaultValue="LoomGrad"
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700 ml-1">Support Email</label>
                                <input
                                    type="email"
                                    defaultValue="support@loomgrad.com"
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-zinc-700 ml-1">Meta Description</label>
                                <textarea
                                    rows={3}
                                    defaultValue="Premium technical learning platform for developers who want to master real-world coding skills through structured YouTube-based courses."
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Features & Visibility */}
                    <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-100">
                            <div className="bg-purple-50 p-2.5 rounded-xl">
                                <Eye className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Features & Visibility</h2>
                                <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider mt-0.5">Control Application State</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {[
                                {
                                    title: "Maintenance Mode",
                                    desc: "Temporarily disable access to the platform for regular users while you perform updates.",
                                    enabled: false,
                                    icon: AlertTriangle,
                                    color: "text-amber-500"
                                },
                                {
                                    title: "Enable Free Trials",
                                    desc: "Allow new courses to offer 30-day free access automatically.",
                                    enabled: true,
                                    icon: Zap,
                                    color: "text-blue-500"
                                },
                                {
                                    title: "Student Discussion Boards",
                                    desc: "Enable community comments and discussions under lesson videos.",
                                    enabled: true,
                                    icon: Mail,
                                    color: "text-purple-500"
                                }
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center justify-between gap-6 p-4 rounded-2xl hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-100">
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 ${feature.color}`}>
                                            <feature.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-zinc-900">{feature.title}</h3>
                                            <p className="text-sm text-zinc-500 leading-relaxed max-w-md">{feature.desc}</p>
                                        </div>
                                    </div>
                                    <button className={`shrink-0 w-12 h-6 rounded-full relative transition-colors ${feature.enabled ? 'bg-blue-600' : 'bg-zinc-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${feature.enabled ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Integrations Section */}
                    <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-100">
                            <div className="bg-red-50 p-2.5 rounded-xl">
                                <Youtube className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Integrations</h2>
                                <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider mt-0.5">Third-Party Services</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center justify-between p-5 rounded-2xl border border-zinc-200 bg-zinc-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white p-2.5 rounded-xl border border-zinc-200 shadow-sm">
                                        <Youtube className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-zinc-900">YouTube Data API v3</h4>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                            <span className="text-xs font-semibold text-green-600 uppercase tracking-tighter">Connected</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="text-xs font-bold text-zinc-500 hover:text-blue-600 transition-colors px-4 py-2 hover:bg-white rounded-lg border border-transparent hover:border-zinc-200">
                                    Refresh Token
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-5 rounded-2xl border border-zinc-200 bg-zinc-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white p-2.5 rounded-xl border border-zinc-200 shadow-sm">
                                        <Mail className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-zinc-900">Resend (Email)</h4>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                            <span className="text-xs font-semibold text-green-600 uppercase tracking-tighter">Connected</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="text-xs font-bold text-zinc-500 hover:text-blue-600 transition-colors px-4 py-2 hover:bg-white rounded-lg border border-transparent hover:border-zinc-200">
                                    Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
