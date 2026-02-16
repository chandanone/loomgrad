
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Code2, Cpu, Globe, GraduationCap, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="bg-white text-zinc-900 selection:bg-blue-500 selection:text-white transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Spotlight Effect Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] opacity-50" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] opacity-30" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium tracking-wider text-blue-600 uppercase bg-blue-600/5 border border-blue-600/10 rounded-full">
              The Evolution of Technical Learning
            </span>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8">
              Master the Code with <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                LoomGrad
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-600 mb-10 leading-relaxed">
              Experience the utility of interactive coding labs merged with premium course management.
              The ultimate platform for modern developers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/courses"
                className="group relative px-8 py-4 bg-zinc-900 text-white font-bold rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 group-hover:text-white flex items-center gap-2">
                  Explore Courses <ArrowRight className="w-5 h-5" />
                </span>
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 bg-white text-zinc-900 font-bold rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-all active:scale-95"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-24 bg-zinc-50 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose LoomGrad?</h2>
            <p className="text-zinc-600">Engineered for deep learning and technical mastery.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1 */}
            <div className="md:col-span-2 group relative p-8 bg-white border border-zinc-200 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-all">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                <Code2 className="w-32 h-32 text-blue-500" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-end min-h-[200px]">
                <div className="p-3 bg-blue-500/10 rounded-xl w-fit mb-4">
                  <Code2 className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Interactive Labs</h3>
                <p className="text-zinc-600 max-w-md">Practice in real-time with our integrated Monaco Editor. Run tests, debug, and master syntax without leaving the browser.</p>
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="group relative p-8 bg-white border border-zinc-200 rounded-3xl overflow-hidden hover:border-purple-500/50 transition-all">
              <div className="relative z-10">
                <div className="p-3 bg-purple-500/10 rounded-xl w-fit mb-4">
                  <Zap className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Auto-Import</h3>
                <p className="text-zinc-600">Admins can import entire YouTube playlists as structured courses with one click.</p>
              </div>
            </div>

            {/* Bento Card 3 */}
            <div className="group relative p-8 bg-white border border-zinc-200 rounded-3xl overflow-hidden hover:border-green-500/50 transition-all">
              <div className="relative z-10">
                <div className="p-3 bg-green-500/10 rounded-xl w-fit mb-4">
                  <Cpu className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Smart Tracking</h3>
                <p className="text-zinc-600">Precision progress tracking for every lesson and coding challenge.</p>
              </div>
            </div>

            {/* Bento Card 4 */}
            <div className="md:col-span-2 group relative p-8 bg-white border border-zinc-200 rounded-3xl overflow-hidden hover:border-pink-500/50 transition-all">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                <GraduationCap className="w-32 h-32 text-pink-500" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-end min-h-[200px]">
                <div className="p-3 bg-pink-500/10 rounded-xl w-fit mb-4">
                  <GraduationCap className="w-6 h-6 text-pink-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Premium Experience</h3>
                <p className="text-zinc-600 max-w-md">A distractions-free learning environment with high-end animations and micro-interactions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-200 bg-white">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-2xl font-bold text-zinc-900 tracking-tighter">
            Loom<span className="text-blue-500">Grad</span>
          </div>
          <p className="text-zinc-500 text-sm">© 2024 LoomGrad Technical LMS. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-zinc-400 hover:text-blue-500 transition-colors">Twitter</Link>
            <Link href="#" className="text-zinc-400 hover:text-blue-500 transition-colors">GitHub</Link>
            <Link href="#" className="text-zinc-400 hover:text-blue-500 transition-colors">Discord</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
