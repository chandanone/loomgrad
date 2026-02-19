"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Cpu,
  GraduationCap,
  Zap,
  Play,
  Terminal,
  Box,
  Sparkles,
  Search,
  CheckCircle2,
  Users,
  Lock,
  Heart
} from "lucide-react";
import { useRef } from "react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

export default function LandingPage() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  return (
    <div className="bg-white text-zinc-900 selection:bg-blue-500 selection:text-white transition-colors duration-300 overflow-x-hidden">
      {/* Dynamic Navigation Background */}
      <div className="fixed top-0 inset-x-0 h-20 bg-white/80 backdrop-blur-md z-[40] border-b border-zinc-100" />

      {/* Hero Section */}
      <section ref={targetRef} className="relative min-h-[95vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Advanced Background Effects */}
        <motion.div style={{ y: backgroundY }} className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] opacity-60 animate-pulse" />
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] opacity-40 animate-bounce" style={{ animationDuration: '10s' }} />

          {/* Animated Mesh Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        </motion.div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ scale: textScale }}
          >
            <motion.div variants={itemVariants} className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold tracking-widest text-blue-600 uppercase bg-blue-50 border border-blue-200 rounded-full shadow-sm">
                <Sparkles className="w-3.5 h-3.5 fill-blue-600" />
                V2.0: The Future of LMS
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-6xl md:text-9xl font-black tracking-tight mb-8 leading-[0.9]"
            >
              Learn to Code <br />
              <span className="relative">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Differently.
                </span>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="absolute -bottom-2 left-0 right-0 h-2 bg-blue-100 -z-10 origin-left"
                />
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-500 mb-12 leading-relaxed"
            >
              Elite technical training with <strong>integrated coding labs</strong>, auto-YouTube syncing,
              and a premium learning experience designed for 10x developers.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/courses"
                className="group relative px-10 py-5 bg-zinc-900 text-white font-black rounded-2xl overflow-hidden shadow-2xl transition-all hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center gap-3">
                  Browse Courses <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <Link
                href="/pricing"
                className="flex items-center gap-2 px-10 py-5 bg-white text-zinc-900 font-black rounded-2xl border-2 border-zinc-100 hover:border-blue-500/30 hover:bg-zinc-50 transition-all shadow-lg active:scale-95"
              >
                <Zap className="w-5 h-5 text-blue-600 fill-blue-600" />
                Go Pro
              </Link>
            </motion.div>

            {/* Floating Tech Stack Icons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="mt-24 flex items-center justify-center gap-8 md:gap-16 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all"
            >
              <div className="flex flex-col items-center gap-2">
                <Code2 className="w-8 h-8" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Compiler</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Terminal className="w-8 h-8" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Realtime</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Box className="w-8 h-8" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Sandboxed</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Users className="w-8 h-8" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Collaborative</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Experience Section - Mock IDE */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-zinc-800"
          >
            <div className="bg-zinc-800/50 px-6 py-4 border-b border-zinc-700/50 flex items-center gap-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900/50 rounded-lg border border-white/5">
                <Terminal className="w-3 h-3 text-zinc-400" />
                <span className="text-xs font-mono text-zinc-400 tracking-tight">interactive-lab.ts</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 border-r border-zinc-800/50">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">
                  <Play className="w-3 h-3 fill-current" />
                  Live Preview
                </div>
                <h3 className="text-3xl font-black text-white mb-6">Learn by Doing.</h3>
                <p className="text-zinc-500 mb-8 leading-relaxed">
                  Don't just watch videos. Every lesson comes with a pre-configured <strong>Next-Gen Editor</strong>.
                  Write code, run tests, and master syntax in a pro-grade environment.
                </p>
                <div className="space-y-4">
                  {[
                    "Zero-config setup",
                    "Real-time syntax validation",
                    "Integrated terminal access",
                    "Collaborative debugging"
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-3 text-zinc-300 text-sm font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative aspect-square md:aspect-auto bg-zinc-950 p-8 flex items-center justify-center group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <pre className="text-xs md:text-sm font-mono text-blue-300 leading-relaxed shadow-lg">
                  <code className="block">
                    {`async function loomgrad_pro() {
  const learner = await User.find(id);
  
  // Unlock premium labs
  await learner.access({
    tier: "ELITE",
    duration: "30_DAYS",
    status: "READY_TO_SHIP"
  });

  return "🚀 Ready to build the future";
}`}
                  </code>
                </pre>

                {/* Floating Decoration */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-10 right-10 bg-blue-600 text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-md"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">Access Granted</div>
                    <div className="text-sm font-black">Elite Member</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-24 bg-zinc-50 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="text-4xl md:text-6xl font-black mb-6 tracking-tight"
            >
              The Modern Learner's Toolset
            </motion.h2>
            <p className="text-zinc-500 max-w-xl mx-auto text-lg">Engineered for deep technical mastery and rapid career progression.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-[800px] md:h-[600px]">
            {/* Bento Card 1 - Interactive Labs */}
            <motion.div
              whileHover={{ y: -5, scale: 1.01 }}
              className="md:col-span-2 md:row-span-2 group relative p-12 bg-white border border-zinc-200 rounded-[2.5rem] overflow-hidden hover:border-blue-500/30 transition-all shadow-sm flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-20 transition-opacity rotate-12 scale-150">
                <Code2 className="w-48 h-48 text-blue-500" />
              </div>
              <div>
                <div className="p-4 bg-blue-500/10 rounded-2xl w-fit mb-8">
                  <Code2 className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-4xl font-black mb-4">Interactive <br /> Labs</h3>
                <p className="text-zinc-500 text-lg max-w-xs leading-relaxed">Practice in real-time with our integrated Monaco Editor. No setup required.</p>
              </div>
              <div className="pt-8 flex items-center gap-2 font-bold text-blue-600 group-hover:gap-4 transition-all">
                Learn more <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>

            {/* Bento Card 2 - Auto Import */}
            <motion.div
              whileHover={{ y: -5 }}
              className="md:col-span-2 group relative p-10 bg-white border border-zinc-200 rounded-[2rem] overflow-hidden hover:border-purple-500/30 transition-all shadow-sm flex items-center justify-between"
            >
              <div className="relative z-10 pr-6">
                <div className="p-3 bg-purple-500/10 rounded-xl w-fit mb-4">
                  <Zap className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-2xl font-black mb-2 tracking-tight">Auto-YouTube Import</h3>
                <p className="text-zinc-500 text-sm max-w-xs">Admins sync entire playlists as structured courses instantly.</p>
              </div>
              <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center shrink-0 border border-purple-100">
                <Play className="w-8 h-8 text-purple-600 fill-purple-600/20" />
              </div>
            </motion.div>

            {/* Bento Card 3 - Smart Tracking */}
            <motion.div
              whileHover={{ y: -5 }}
              className="group relative p-10 bg-white border border-zinc-200 rounded-[2rem] overflow-hidden hover:border-emerald-500/30 transition-all shadow-sm"
            >
              <div className="p-3 bg-emerald-500/10 rounded-xl w-fit mb-6">
                <Cpu className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tight">Smart Tracking</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">Precision progress for every lesson.</p>
            </motion.div>

            {/* Bento Card 4 - Premium UI */}
            <motion.div
              whileHover={{ y: -5 }}
              className="group relative p-10 bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden transition-all shadow-2xl"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <GraduationCap className="w-24 h-24 text-white" />
              </div>
              <div className="p-3 bg-white/10 rounded-xl w-fit mb-6">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tight text-white italic">Elite Experience</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">Distraction-free mastery.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Courses Preview */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Curated for Mastery.</h2>
              <p className="text-zinc-500 text-lg">Deep dive into specific technologies with our community's most-loved technical masterclasses.</p>
            </div>
            <Link href="/courses" className="group flex items-center gap-2 font-black text-blue-600 hover:gap-4 transition-all">
              Explore Entire Catalog <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Next.js 15 Deep Dive", level: "Advanced", icon: <Box className="w-6 h-6" />, color: "from-zinc-900 to-zinc-700" },
              { title: "Distributed Systems with Go", level: "Expert", icon: <Cpu className="w-6 h-6" />, color: "from-blue-600 to-indigo-600" },
              { title: "Fullstack Auth Patterns", level: "Intermediate", icon: <Lock className="w-6 h-6" />, color: "from-purple-600 to-pink-600" },
            ].map((course, idx) => (
              <motion.div
                key={course.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative bg-zinc-50 border border-zinc-100 rounded-[2.5rem] overflow-hidden p-8 hover:shadow-2xl hover:shadow-blue-500/10 transition-all cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
                  {course.icon}
                </div>
                <div className="mb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {course.level}
                  </span>
                </div>
                <h3 className="text-2xl font-black mb-4 group-hover:text-blue-600 transition-colors">{course.title}</h3>
                <p className="text-zinc-500 text-sm mb-8 line-clamp-2">Master the latest architectural patterns and industry best practices in this comprehensive guide.</p>

                <div className="pt-6 border-t border-zinc-200 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-zinc-200" />
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                      +8k
                    </div>
                  </div>
                  <div className="text-xs font-black uppercase text-zinc-400">Join 8,400+ students</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-white flex justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="container mx-auto px-6 max-w-5xl bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(37,99,235,0.4)]"
        >
          {/* Background Highlight */}
          <div className="absolute top-0 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-[100px]" />

          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">
            Ready to become <br />
            a master developer?
          </h2>
          <p className="text-blue-50 text-xl mb-12 max-w-2xl mx-auto font-medium">
            Join 1,000+ developers shipping production-ready applications through LoomGrad.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="px-12 py-5 bg-white text-blue-600 font-black rounded-2xl hover:bg-blue-50 transition-all shadow-xl active:scale-95 text-lg"
            >
              Start Free Trial
            </Link>
            <Link
              href="/pricing"
              className="px-12 py-5 bg-blue-700 text-white font-black rounded-2xl border-2 border-blue-500/50 hover:bg-blue-600 transition-all active:scale-95 text-lg"
            >
              View Pricing
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-zinc-100 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="text-3xl font-black text-zinc-900 tracking-tighter">
                Loom<span className="text-blue-600 underline decoration-4 decoration-blue-100 underline-offset-4">Grad</span>
              </div>
              <p className="text-zinc-500 text-sm font-medium">The evolution of technical learning.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-center md:text-left">
              <div className="space-y-4">
                <h4 className="font-black text-sm uppercase tracking-widest text-zinc-400">Platform</h4>
                <ul className="space-y-3 text-sm font-bold">
                  <li><Link href="/courses" className="hover:text-blue-600 transition-colors">Courses</Link></li>
                  <li><Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link></li>
                  <li><Link href="#" className="hover:text-blue-600 transition-colors">Roadmaps</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-black text-sm uppercase tracking-widest text-zinc-400">Resources</h4>
                <ul className="space-y-3 text-sm font-bold">
                  <li><Link href="#" className="hover:text-blue-600 transition-colors">Docs</Link></li>
                  <li><Link href="#" className="hover:text-blue-600 transition-colors">Blog</Link></li>
                  <li><Link href="#" className="hover:text-blue-600 transition-colors">Community</Link></li>
                </ul>
              </div>
              <div className="hidden md:block space-y-4">
                <h4 className="font-black text-sm uppercase tracking-widest text-zinc-400">Social</h4>
                <ul className="space-y-3 text-sm font-bold">
                  <li><Link href="#" className="hover:text-blue-600 transition-colors">Twitter</Link></li>
                  <li><Link href="#" className="hover:text-blue-600 transition-colors">GitHub</Link></li>
                  <li><Link href="#" className="hover:text-blue-600 transition-colors">Discord</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-20 pt-10 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start gap-4">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                © {new Date().getFullYear()} LoomGrad Technical LMS. All Rights Reserved.
              </span>
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-500">
                Crafted with
                <div className="relative flex items-center justify-center w-4 h-4">
                  <Heart className="w-4 h-4 text-red-500 hover:scale-110 transition-transform" />
                  <motion.div
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      times: [0, 0.5, 1],
                      repeatDelay: 1
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  </motion.div>
                </div>
                by <span className="text-zinc-900 font-black tracking-tight hover:text-blue-600 transition-colors cursor-pointer">ChandooAILabs</span>
              </div>
            </div>

            <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              <Link href="#" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
