import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy, ClipboardList, TrendingUp, Star, Plus,
  ChevronRight, Clock, Building2, Code2,
  Briefcase, ArrowUpRight, Activity
} from 'lucide-react';
import { userAPI } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] },
});

function StatCard({ icon: Icon, label, value, sub, accent, delay = 0 }) {
  return (
    <motion.div {...fadeUp(delay)} className="card p-5 group hover:border-white/[0.1] transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon className="w-4 h-4" />
        </div>
        <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
      </div>
      <p className="text-2xl font-bold text-white tracking-tight mb-0.5">{value}</p>
      <p className="text-xs font-medium text-slate-300">{label}</p>
      {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getDashboard()
      .then(({ data }) => setStats(data.data || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const userName = user?.name?.split(' ')[0] || "Guest";

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight">
            Good day, <span className="gradient-text">{userName}</span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Here's your practice overview</p>
        </div>
        <Link to="/interviews/new" className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> New session
        </Link>
      </motion.div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard icon={ClipboardList} label="Total Sessions" value={loading ? '—' : stats?.totalSessions ?? 0} sub="All time" accent="bg-brand-500/10 text-brand-400" delay={0.05} />
        <StatCard icon={Trophy} label="Completed" value={loading ? '—' : stats?.completedSessions ?? 0} sub="Finished" accent="bg-emerald-500/10 text-emerald-400" delay={0.1} />
        <StatCard icon={TrendingUp} label="Avg. Score" value={loading ? '—' : `${stats?.averageScore ?? 0}/10`} sub="Out of 10" accent="bg-violet-500/10 text-violet-400" delay={0.15} />
        <StatCard icon={Star} label="Best Score" value={loading ? '—' : `${stats?.bestScore ?? 0}/10`} sub="Personal best" accent="bg-amber-500/10 text-amber-400" delay={0.2} />
      </div>

      <motion.div {...fadeUp(0.2)} className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-white">Recent Sessions</p>
          <Link to="/sessions" className="btn-ghost text-xs text-slate-500">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {!stats?.recentSessions?.length ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-3">
              <Activity className="w-6 h-6 text-brand-400" />
            </div>
            <p className="text-sm text-slate-400 mb-1">No sessions yet</p>
            <p className="text-xs text-slate-600 mb-4">Complete your first mock interview to see results here</p>
            <Link to="/interviews/new" className="btn-primary text-sm inline-flex">Start practicing</Link>
          </div>
        ) : (
          <div className="space-y-1">
            {stats.recentSessions.map((session) => {
              const s = session.overallScore ?? 0;
              const sClr = s >= 7 ? 'text-emerald-400' : s >= 4 ? 'text-amber-400' : 'text-red-400';
              return (
                <Link key={session._id} to={`/sessions/${session._id}/results`}
                  className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/[0.04] transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-brand-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-brand-300 transition-colors">
                        {session.interviewId?.jobTitle || 'Interview'}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(session.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${sClr}`}>{s}/10</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-brand-400 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </motion.div>

      <motion.div {...fadeUp(0.25)}>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Quick actions</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { to: '/interviews/new', icon: Plus, label: 'New Interview', desc: 'AI mock session', from: 'from-brand-600', to2: 'to-cyan-600' },
            { to: '/dsa-session', icon: Code2, label: 'DSA Practice', desc: 'LeetCode-style', from: 'from-emerald-600', to2: 'to-teal-600' },
            { to: '/resumes', icon: ClipboardList, label: 'Upload Resume', desc: 'Better questions', from: 'from-violet-600', to2: 'to-purple-600' },
            { to: '/jobs', icon: Briefcase, label: 'Browse Jobs', desc: 'Find opportunities', from: 'from-amber-600', to2: 'to-orange-600' },
          ].map(({ to, icon: Icon, label, desc, from, to2 }) => (
            <Link key={to} to={to}
              className="card p-4 flex items-center gap-3 hover:border-white/[0.1] transition-all group">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${from} ${to2} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-brand transition-shadow`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white group-hover:text-brand-300 transition-colors truncate">{label}</p>
                <p className="text-xs text-slate-500 truncate">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
