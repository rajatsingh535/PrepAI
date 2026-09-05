import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';
import {
  Trophy, ClipboardList, TrendingUp, Star, Plus,
  ChevronRight, Clock, Building2, Code2,
  Briefcase, ArrowUpRight, Activity, FileText, Zap
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

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1f2e] border border-white/[0.08] rounded-xl px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  );
};

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

  const userName = user?.name?.split(' ')[0] || 'Guest';

  // Prepare chart data
  const trendData = (stats.scoreTrend || []).map(s => ({
    date: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: s.overallScore || 0,
    label: s.interviewId?.jobTitle || 'Session',
  }));

  const categoryData = (stats.categoryBreakdown || []).map(c => ({
    category: (c._id || 'other').charAt(0).toUpperCase() + (c._id || 'other').slice(1),
    avgScore: parseFloat((c.avgScore || 0).toFixed(1)),
    count: c.count || 0,
  }));

  const dsaData = (stats.dsaTopicStats || []).map(d => ({
    topic: (d._id || '').charAt(0).toUpperCase() + (d._id || '').slice(1),
    score: d.avgScore || 0,
    count: d.count || 0,
  }));

  // Activity calendar (last 28 days)
  const activityMap = {};
  (stats.weeklyActivity || []).forEach(a => { activityMap[a._id] = a.count; });
  const activityDays = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    activityDays.push({ date: key, count: activityMap[key] || 0, day: d.getDate() });
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
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

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-6 gap-3">
        <StatCard icon={ClipboardList} label="Total Sessions" value={loading ? '—' : stats?.totalSessions ?? 0} sub="AI + DSA" accent="bg-brand-500/10 text-brand-400" delay={0.05} />
        <StatCard icon={Trophy} label="Completed" value={loading ? '—' : stats?.completedSessions ?? 0} sub="Finished" accent="bg-emerald-500/10 text-emerald-400" delay={0.08} />
        <StatCard icon={TrendingUp} label="Avg. Score" value={loading ? '—' : `${stats?.averageScore ?? 0}/10`} sub="Out of 10" accent="bg-violet-500/10 text-violet-400" delay={0.11} />
        <StatCard icon={Star} label="Best Score" value={loading ? '—' : `${stats?.bestScore ?? 0}/10`} sub="Personal best" accent="bg-amber-500/10 text-amber-400" delay={0.14} />
        <StatCard icon={Code2} label="DSA Sessions" value={loading ? '—' : stats?.totalDSA ?? 0} sub={`${stats?.completedDSA ?? 0} completed`} accent="bg-cyan-500/10 text-cyan-400" delay={0.17} />
        <StatCard icon={FileText} label="Resumes" value={loading ? '—' : stats?.resumeCount ?? 0} sub="Uploaded" accent="bg-rose-500/10 text-rose-400" delay={0.2} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Score Trend */}
        <motion.div {...fadeUp(0.15)} className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              <p className="text-sm font-medium text-white">Score Trend</p>
            </div>
            <span className="text-xs text-slate-500">Last {trendData.length} sessions</span>
          </div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4, fill: '#06b6d4', strokeWidth: 2, stroke: '#0a0f1a' }} activeDot={{ r: 6 }} name="Score" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-slate-600 text-sm">
              <p>Complete sessions to see your score trend</p>
            </div>
          )}
        </motion.div>

        {/* Category Breakdown */}
        <motion.div {...fadeUp(0.18)} className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-violet-400" />
            <p className="text-sm font-medium text-white">Category Performance</p>
          </div>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="category" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgScore" fill="url(#barGradient)" radius={[6, 6, 0, 0]} name="Avg Score" />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6d28d9" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-slate-600 text-sm">
              <p>Complete sessions to see category breakdown</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Activity + DSA row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Activity Calendar */}
        <motion.div {...fadeUp(0.22)} className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-emerald-400" />
            <p className="text-sm font-medium text-white">Practice Activity</p>
            <span className="text-xs text-slate-500 ml-auto">Last 28 days</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {activityDays.map((d, i) => (
              <div key={i} title={`${d.date}: ${d.count} session${d.count !== 1 ? 's' : ''}`}
                className={`aspect-square rounded-md flex items-center justify-center text-[9px] font-medium transition-colors ${
                  d.count >= 3 ? 'bg-emerald-500/40 text-emerald-300'
                  : d.count >= 2 ? 'bg-emerald-500/25 text-emerald-400'
                  : d.count >= 1 ? 'bg-emerald-500/15 text-emerald-500'
                  : 'bg-white/[0.03] text-slate-700'
                }`}>
                {d.day}
              </div>
            ))}
          </div>
        </motion.div>

        {/* DSA Topic Stats */}
        <motion.div {...fadeUp(0.24)} className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <p className="text-sm font-medium text-white">DSA Performance</p>
          </div>
          {dsaData.length > 0 ? (
            <div className="space-y-3">
              {dsaData.map((d, i) => {
                const pct = Math.min(100, d.score);
                const clr = pct >= 70 ? 'from-emerald-500 to-teal-500' : pct >= 40 ? 'from-amber-500 to-orange-500' : 'from-red-500 to-rose-500';
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">{d.topic}</span>
                      <span className="text-white font-semibold">{Math.round(pct)}% · {d.count} sessions</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <motion.div className={`h-full rounded-full bg-gradient-to-r ${clr}`}
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 * i }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-slate-600 text-sm">
              <div className="text-center">
                <Code2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>Start DSA practice to track performance</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Sessions */}
      <motion.div {...fadeUp(0.26)} className="card p-5">
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

      {/* Quick Actions */}
      <motion.div {...fadeUp(0.28)}>
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
