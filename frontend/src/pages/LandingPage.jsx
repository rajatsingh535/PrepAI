import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, ArrowRight, CheckCircle, Code2, Brain, BarChart3,
  ChevronRight, Star, Users, Trophy, Cpu,
  FileText, MessageSquare, Mic
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
});

const STATS = [
  { value: '50K+', label: 'Questions generated' },
  { value: '12K+', label: 'Mock sessions' },
  { value: '87%',  label: 'Success rate' },
  { value: '4.9★', label: 'User rating' },
];

const FEATURES = [
  {
    icon: Brain,
    title: 'Resume-Aware AI',
    desc: 'Upload your resume — every question is grounded in your actual experience, not generic templates.',
    gradient: 'from-white/10 to-white/5',
    border: 'hover:border-white/20',
  },
  {
    icon: Code2,
    title: 'DSA Coding Arena',
    desc: 'LeetCode-style problems with Monaco editor, live execution, step-by-step brute-force → optimal coaching.',
    gradient: 'from-white/10 to-white/5',
    border: 'hover:border-white/20',
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    desc: 'Radar charts across 4 pillars: correctness, communication, edge cases, and speed. Know exactly where to improve.',
    gradient: 'from-white/10 to-white/5',
    border: 'hover:border-white/20',
  },
  {
    icon: Mic,
    title: 'Voice + Facial AI',
    desc: 'Real-time webcam analysis scores your confidence, eye contact, and communication clarity as you answer.',
    gradient: 'from-white/10 to-white/5',
    border: 'hover:border-white/20',
  },
];

const STEPS = [
  { n: '01', title: 'Set up your interview', desc: 'Paste a job description, pick DSA or behavioral mode, link your resume.' },
  { n: '02', title: 'Practice with AI coach', desc: 'Answer questions aloud or type. AI adapts difficulty based on your responses.' },
  { n: '03', title: 'Get a scorecard', desc: 'Receive structured JSON-grade feedback across 4 dimensions. Track progress over time.' },
];

const TESTIMONIALS = [
  { name: 'Aarav S.', role: 'SDE-2 @ Google', text: 'PrepAI helped me nail two rounds at Google. The DSA workspace feels exactly like a real interview.', avatar: 'A' },
  { name: 'Priya M.', role: 'Frontend @ Atlassian', text: 'The facial analysis caught that I was rushing. Once I slowed down, my confidence score jumped 20 points.', avatar: 'P' },
  { name: 'Rohan K.', role: 'Backend @ Stripe', text: 'Better than any mock interview service I\'ve paid for. The radar chart breakdown is incredibly actionable.', avatar: 'R' },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-surface overflow-x-hidden">

      {/* ── Navbar ──────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 flex items-center">
        <div className="absolute inset-0 bg-surface/80 backdrop-blur-xl border-b border-white/[0.06]" />
        <nav className="relative w-full max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white tracking-tight">PrepAI</span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {['Features', 'Pricing', 'Blog'].map((item) => (
              <button key={item} className="btn-ghost text-slate-400 text-sm">{item}</button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary text-sm py-2 px-4">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm text-slate-400">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Get started <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-14">
        {/* Ambient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="orb w-[700px] h-[400px] bg-white/[0.03] top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.015]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)', backgroundSize: '80px 80px' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-32 text-center">

          <motion.h1 {...fadeUp(0.08)}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6">
            The AI interviewer<br />
            <span className="gradient-text">that actually coaches</span>
          </motion.h1>

          <motion.p {...fadeUp(0.16)}
            className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your resume, select DSA or behavioral mode, and practice with an AI that
            evaluates your code, voice, and facial confidence in real-time.
          </motion.p>

          <motion.div {...fadeUp(0.22)} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link to="/register"
              className="btn-primary text-base px-7 py-3 group">
              Start practicing free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-7 py-3">
              Sign in
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div {...fadeUp(0.3)}
            className="inline-grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.03]">
            {STATS.map(({ value, label }) => (
              <div key={label} className="px-8 py-5 bg-slate-900/40 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </motion.div>

          {/* Mock IDE preview */}
          <motion.div {...fadeUp(0.38)} className="mt-20 max-w-4xl mx-auto">
            <div className="card p-1 shadow-[0_0_80px_rgba(255,255,255,0.04)]">
              {/* IDE chrome */}
              <div className="rounded-xl overflow-hidden bg-[#0d1117] border border-white/[0.04]">
                {/* Title bar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] bg-[#161b22]">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/70" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                    </div>
                    <span className="text-slate-500 text-xs ml-2 font-mono">PrepAI — Two Sum · Easy</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 font-mono">00:12:34</span>
                    <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      Live
                    </span>
                  </div>
                </div>
                {/* Split view */}
                <div className="grid grid-cols-2 divide-x divide-white/[0.05] h-52 text-left">
                  {/* Problem panel */}
                  <div className="p-4 text-xs font-mono text-slate-400 overflow-hidden space-y-2">
                    <p className="text-slate-300 font-semibold text-sm">Two Sum</p>
                    <p className="text-slate-500">Given an array of integers <span className="text-zinc-300">nums</span> and integer <span className="text-zinc-300">target</span>...</p>
                    <div className="mt-3 p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] space-y-1">
                      <p className="text-slate-500">Input: <span className="text-emerald-400">[2,7,11,15]</span>, target=<span className="text-amber-400">9</span></p>
                      <p className="text-slate-500">Output: <span className="text-emerald-400">[0,1]</span></p>
                    </div>
                  </div>
                  {/* Code panel */}
                  <div className="p-4 text-xs font-mono overflow-hidden">
                    {[
                      { ln: '1', code: 'def twoSum(nums, target):',    color: 'text-zinc-200' },
                      { ln: '2', code: '    seen = {}',                 color: 'text-slate-300' },
                      { ln: '3', code: '    for i, num in enumerate(nums):', color: 'text-zinc-400' },
                      { ln: '4', code: '        complement = target - num', color: 'text-slate-300' },
                      { ln: '5', code: '        if complement in seen:', color: 'text-zinc-400' },
                      { ln: '6', code: '            return [seen[complement], i]', color: 'text-emerald-400' },
                    ].map(({ ln, code, color }) => (
                      <div key={ln} className="flex gap-4">
                        <span className="text-slate-600 select-none w-4 text-right">{ln}</span>
                        <span className={color}>{code}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium mb-3">Platform features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Built for serious candidates
            </h2>
            <p className="text-slate-400 mt-3 max-w-lg mx-auto">
              Every feature designed to close the gap between practice and the real thing.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc, gradient, border }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className={`card p-6 group cursor-default transition-all duration-300 ${border}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 border border-white/[0.08]`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Three steps to interview-ready</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map(({ n, title, desc }, i) => (
              <motion.div key={n}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="relative text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-sm font-bold text-zinc-300 font-mono">{n}</span>
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(100%-12px)] w-6 h-px bg-gradient-to-r from-white/20 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white tracking-tight">Trusted by candidates everywhere</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map(({ name, role, text, avatar }, i) => (
              <motion.div key={name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="card p-6 space-y-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">"{text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{name}</p>
                    <p className="text-xs text-slate-500">{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center card p-12">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
              Ready to level up?
            </h2>
            <p className="text-slate-400 mb-8">
              Join thousands of engineers preparing smarter with AI-powered interviews.
            </p>
            <Link to="/register" className="btn-primary text-base px-8 py-3 inline-flex group">
              Get started for free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <p className="text-slate-600 text-xs mt-4">No credit card required</p>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-white/[0.06] flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <span className="text-sm font-medium text-slate-400">PrepAI</span>
          </div>
          <p className="text-xs text-slate-600">© 2026 PrepAI. Built with MERN + Groq AI.</p>
        </div>
      </footer>
    </div>
  );
}
