import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, TrendingUp, ThumbsUp, Target, Lightbulb,
  BookOpen, ChevronDown, ChevronUp, CheckCircle, XCircle,
  RotateCcw, ArrowLeft, Star, Zap, Brain, Award,
  BarChart2, MessageSquare, Clock
} from 'lucide-react';
import { sessionAPI } from '@/services/api';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, Cell, AreaChart, Area, CartesianGrid
} from 'recharts';

const ScoreRing = ({ score, color, size = 96 }) => (
  <div className="relative inline-flex items-center justify-center"
    style={{ width: size, height: size }}>
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={size/2 - 6}
        fill="none" stroke="#1a2a3a" strokeWidth="8" />
      <circle cx={size/2} cy={size/2} r={size/2 - 6}
        fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${2 * Math.PI * (size/2 - 6)}`}
        strokeDashoffset={`${2 * Math.PI * (size/2 - 6) * (1 - score / 100)}`}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 6px ${color}80)`, transition: 'stroke-dashoffset 1s ease' }}
      />
    </svg>
    <span className="absolute text-lg font-display font-bold"
      style={{ color }}>{score}%</span>
  </div>
);

export default function SessionResultPage() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedAnswer, setExpandedAnswer] = useState(null);

  useEffect(() => {
    sessionAPI.getById(id)
      .then(({ data }) => setSession(data.session))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-600/20 flex items-center justify-center">
          <Brain className="w-8 h-8 text-brand-400 animate-pulse" />
        </div>
        <p className="text-slate-400">Loading your results...</p>
      </div>
    </div>
  );

  if (!session) return <p className="text-slate-400 text-center mt-20">Session not found.</p>;

  const score = session.overallScore ?? 0;
  const scoreColor = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  const scoreLabel = score >= 70 ? 'Excellent' : score >= 40 ? 'Good' : 'Needs Work';
  const scoreGradient = score >= 70 ? 'from-emerald-600 to-teal-600' : score >= 40 ? 'from-amber-600 to-orange-600' : 'from-red-600 to-rose-600';

  const categoryScores = {};
  session.answers.forEach((a) => {
    const cat = session.interviewId?.questions?.find(
      (q) => q._id === a.questionId?.toString()
    )?.category || 'other';
    if (!categoryScores[cat]) categoryScores[cat] = { scores: [], name: cat.replace('_', ' ') };
    if (a.aiScore !== null) categoryScores[cat].scores.push(a.aiScore);
  });

  const radarData = Object.values(categoryScores).map((c) => ({
    subject: c.name.charAt(0).toUpperCase() + c.name.slice(1),
    score: c.scores.length ? Math.round((c.scores.reduce((a, b) => a + b, 0) / (c.scores.length * 10)) * 100) : 0,
  }));

  const barData = session.answers.map((a, i) => ({
    name: `Q${i + 1}`, score: a.aiScore ?? 0,
  }));

  const avgTime = session.answers.length
    ? Math.round(session.answers.reduce((s, a) => s + (a.timeTaken || 0), 0) / session.answers.length)
    : 0;

  const answered  = session.answers.filter((a) => !a.skipped).length;
  const skipped   = session.answers.filter((a) =>  a.skipped).length;
  const highScores = session.answers.filter((a) => (a.aiScore ?? 0) >= 7).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      <Link to="/sessions" className="btn-ghost inline-flex">
        <ArrowLeft className="w-4 h-4" /> Back to History
      </Link>

      {/* ── Score Hero ─────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="card p-8 relative overflow-hidden">
        {/* bg glow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${scoreGradient} opacity-5 pointer-events-none`} />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <ScoreRing score={score} color={scoreColor} size={120} />
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
              <Award className="w-5 h-5" style={{ color: scoreColor }} />
              <h2 className="text-2xl font-display font-bold text-white">{scoreLabel}!</h2>
            </div>
            <p className="text-slate-400 mb-4">
              {session.interviewId?.jobTitle} • {session.answers.length} questions answered
            </p>
            {session.overallFeedback && (
              <p className="text-slate-300 text-sm leading-relaxed max-w-xl bg-surface/60 rounded-xl p-4">
                {session.overallFeedback}
              </p>
            )}
            <div className="flex items-center gap-3 mt-5 justify-center md:justify-start">
              <Link to="/interviews/new" className="btn-primary">
                <RotateCcw className="w-4 h-4" /> Practice Again
              </Link>
              <Link to="/dashboard" className="btn-secondary">Dashboard</Link>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3 flex-shrink-0">
            {[
              { label: 'Answered',   value: answered,            icon: CheckCircle, color: 'text-emerald-400' },
              { label: 'Skipped',    value: skipped,             icon: XCircle,     color: 'text-slate-400'  },
              { label: 'High Scores',value: highScores,          icon: Star,        color: 'text-amber-400'  },
              { label: 'Avg Time',   value: `${avgTime}s`,       icon: Clock,       color: 'text-brand-400'  },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="p-3 rounded-xl bg-surface border border-surface-border text-center">
                <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
                <p className="text-lg font-bold text-white">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Strengths & Improvements ──────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="card p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-emerald-400" /> Strengths
          </h3>
          {session.strengths?.length ? (
            <ul className="space-y-2.5">
              {session.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                  </div>
                  {s}
                </li>
              ))}
            </ul>
          ) : <p className="text-slate-500 text-sm">No specific strengths noted.</p>}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="card p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" /> Areas to Improve
          </h3>
          {session.areasForImprovement?.length ? (
            <ul className="space-y-2.5">
              {session.areasForImprovement.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Lightbulb className="w-3 h-3 text-amber-400" />
                  </div>
                  {a}
                </li>
              ))}
            </ul>
          ) : <p className="text-slate-500 text-sm">Keep practicing!</p>}
        </motion.div>
      </div>

      {/* ── Charts ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {radarData.length > 2 && (
          <div className="card p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-brand-400" /> Performance by Category
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1a2a3a" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Radar name="Score" dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="card p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-teal-400" /> Score Per Question
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2a3a" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis domain={[0, 10]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0d1520', border: '1px solid #1a2a3a', borderRadius: '12px' }}
                labelStyle={{ color: '#fff' }} itemStyle={{ color: '#22d3ee' }} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.score >= 7 ? '#10b981' : entry.score >= 4 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Resources ─────────────────────────────────────────── */}
      {session.recommendedResources?.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-400" /> Recommended Resources
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {session.recommendedResources.map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-surface-border">
                <div className="w-7 h-7 bg-brand-600/20 text-brand-400 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                <p className="text-sm text-slate-300">{r}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Q&A Review ────────────────────────────────────────── */}
      <div className="card p-6">
        <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-400" /> Question-by-Question Review
        </h3>
        <div className="space-y-2">
          {session.answers.map((answer, i) => {
            const isExpanded = expandedAnswer === i;
            const s = answer.aiScore ?? 0;
            const clr = s >= 7 ? 'text-emerald-400' : s >= 4 ? 'text-amber-400' : 'text-red-400';
            const bg  = s >= 7 ? 'bg-emerald-500/10 border-emerald-500/20' : s >= 4 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20';
            return (
              <div key={i} className="border border-surface-border rounded-xl overflow-hidden">
                <button onClick={() => setExpandedAnswer(isExpanded ? null : i)}
                  className="w-full flex items-center justify-between p-4 hover:bg-surface-hover transition-colors text-left">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${bg} border ${clr}`}>{i + 1}</div>
                    <p className="text-sm text-white truncate">{answer.questionText}</p>
                    {answer.skipped && <span className="badge-warning badge flex-shrink-0 text-xs">Skipped</span>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    {/* mini score bar */}
                    <div className="hidden sm:flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-surface-border rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${s * 10}%`, background: s >= 7 ? '#10b981' : s >= 4 ? '#f59e0b' : '#ef4444' }} />
                      </div>
                      <span className={`text-sm font-bold ${clr}`}>{s}/10</span>
                    </div>
                    <span className={`sm:hidden text-sm font-bold ${clr}`}>{s}/10</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="border-t border-surface-border p-5 space-y-4 bg-surface">
                      {answer.answerText && (
                        <div>
                          <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-medium">Your Answer</p>
                          <p className="text-slate-300 text-sm leading-relaxed bg-surface-card p-3 rounded-lg border border-surface-border">{answer.answerText}</p>
                        </div>
                      )}
                      {answer.aiFeedback && (
                        <div className="p-4 rounded-xl bg-brand-600/10 border border-brand-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-brand-400" />
                            <p className="text-xs text-brand-400 uppercase tracking-wider font-bold">AI Feedback</p>
                            <span className={`ml-auto badge text-xs ${s >= 7 ? 'badge-success' : s >= 4 ? 'badge-warning' : 'badge-danger'}`}>{s}/10</span>
                          </div>
                          <p className="text-brand-200 text-sm leading-relaxed">{answer.aiFeedback}</p>
                        </div>
                      )}
                      {answer.timeTaken > 0 && (
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Time taken: {answer.timeTaken}s
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
