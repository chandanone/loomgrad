
import { Check, Zap, Rocket, Star } from "lucide-react";
import Link from "next/link";

const tiers = [
    {
        name: "Free",
        price: "₹0",
        description: "Start your journey with our fundamental courses.",
        features: [
            "Access to all free courses",
            "Public community access",
            "Basic certificate of completion",
            "Standard support"
        ],
        buttonText: "Get Started",
        href: "/api/auth/signin",
        highlight: false,
        icon: Star
    },
    {
        name: "Monthly",
        price: "₹999",
        period: "/month",
        description: "Perfect for students staying committed to learning.",
        features: [
            "Access to all premium courses",
            "Interactive code challenges",
            "Priority community support",
            "Advanced certificates",
            "Expert Q&A sessions"
        ],
        buttonText: "Subscribe Now",
        href: "/checkout?plan=monthly",
        highlight: true,
        icon: Zap
    },
    {
        name: "Yearly",
        price: "₹9,999",
        period: "/year",
        description: "Best value for dedicated learners and professionals.",
        features: [
            "Standard Monthly features",
            "Get 2 months free (save 17%)",
            "Offline access to materials",
            "1-on-1 mentorship session",
            "Exclusive early access to courses"
        ],
        buttonText: "Go Annual",
        href: "/checkout?plan=yearly",
        highlight: false,
        icon: Rocket
    }
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-white text-zinc-900 pt-32 pb-20 px-6 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-blue-600 font-bold tracking-widest text-xs uppercase mb-4">Investment in Yourself</h2>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-zinc-900 to-zinc-500 bg-clip-text text-transparent">
                        Choose Your Learning Path
                    </h1>
                    <p className="text-zinc-600 text-lg max-w-2xl mx-auto">
                        Unlock premium content, interactive coding labs, and industry-recognized certificates with a plan that fits your goals.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {tiers.map((tier) => (
                        <div
                            key={tier.name}
                            className={`relative flex flex-col p-8 rounded-3xl border transition-all duration-300 ${tier.highlight
                                ? "bg-zinc-50 border-blue-500/50 shadow-2xl shadow-blue-500/10 scale-105 z-10"
                                : "bg-white border-zinc-200 hover:border-zinc-300"
                                }`}
                        >
                            {tier.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest leading-none">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${tier.highlight ? "bg-blue-600/10 text-blue-500 shadow-inner" : "bg-zinc-100 text-zinc-500"
                                    }`}>
                                    <tier.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                                <div className="flex items-baseline gap-1 focus-within:ring-2">
                                    <span className="text-4xl font-bold">{tier.price}</span>
                                    {tier.period && <span className="text-zinc-500 text-sm font-medium">{tier.period}</span>}
                                </div>
                                <p className="text-zinc-500 text-sm mt-4 leading-relaxed">
                                    {tier.description}
                                </p>
                            </div>

                            <ul className="space-y-4 mb-10 flex-grow">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm text-zinc-600">
                                        <div className={`mt-0.5 rounded-full p-0.5 ${tier.highlight ? "bg-blue-500/20 text-blue-500" : "bg-zinc-100 text-zinc-400"
                                            }`}>
                                            <Check className="w-3 h-3" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`w-full py-4 rounded-xl font-bold text-sm transition-all active:scale-95 ${tier.highlight
                                    ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20"
                                    : "bg-zinc-900 text-white hover:bg-black"
                                    }`}
                            >
                                {tier.buttonText}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-20 p-10 rounded-3xl bg-zinc-50 border border-zinc-200 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h4 className="text-xl font-bold mb-2">Need a custom plan for your team?</h4>
                        <p className="text-zinc-600 text-sm">We offer enterprise solutions for organizations and universities.</p>
                    </div>
                    <Link
                        href="mailto:business@loomgrad.com"
                        className="px-8 py-4 bg-white text-zinc-900 border border-zinc-200 rounded-xl font-bold text-sm hover:bg-zinc-50 transition-all"
                    >
                        Contact Sales
                    </Link>
                </div>
            </div>
        </div>
    );
}
