import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, FileText, Sliders, Sparkles, Code2,
  Loader2, ChevronRight, ChevronLeft, Check, Cpu, Brain,
  Crown, Zap, Star, X, ShieldCheck
} from 'lucide-react';
import { interviewAPI, resumeAPI } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const STEPS = ['Mode', 'Job Details', 'Preferences', 'Resume', 'Review'];

const EXPERIENCE_LEVELS = [
  { value: 'entry',     label: 'Entry Level',  sub: '0–2 years' },
  { value: 'mid',       label: 'Mid Level',    sub: '3–5 years' },
  { value: 'senior',    label: 'Senior',       sub: '5–8 years' },
  { value: 'lead',      label: 'Lead / Staff', sub: '8+ years'  },
  { value: 'executive', label: 'Executive',    sub: 'C-Suite'   },
];

const QUESTION_TYPES = [
  { value: 'technical',   label: 'Technical',   color: 'brand' },
  { value: 'behavioral',  label: 'Behavioral',  color: 'violet' },
  { value: 'situational', label: 'Situational', color: 'emerald' },
  { value: 'hr',          label: 'HR',          color: 'amber' },
  { value: 'culture_fit', label: 'Culture Fit', color: 'rose' },
];

const DSA_TOPICS = [
  { value: 'arrays',          label: 'Arrays & Strings',     icon: '[]' },
  { value: 'linked_list',     label: 'Linked Lists',         icon: '↔' },
  { value: 'trees',           label: 'Trees & Graphs',       icon: '🌳' },
  { value: 'dp',              label: 'Dynamic Programming',  icon: '📊' },
  { value: 'sorting',         label: 'Sorting & Searching',  icon: '⬆' },
  { value: 'backtracking',    label: 'Backtracking',         icon: '↩' },
  { value: 'stacks_queues',   label: 'Stacks & Queues',      icon: '📦' },
  { value: 'hashing',         label: 'Hashing',              icon: '#' },
  { value: 'greedy',          label: 'Greedy Algorithms',    icon: '💰' },
  { value: 'bit_manipulation',label: 'Bit Manipulation',     icon: '⊕' },
  { value: 'two_pointers',    label: 'Two Pointers',         icon: '👆' },
  { value: 'sliding_window',  label: 'Sliding Window',       icon: '🪟' },
];

const DSA_LANGS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python',     label: 'Python' },
  { value: 'java',       label: 'Java' },
  { value: 'cpp',        label: 'C++' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy',   label: 'Easy',   color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  { value: 'medium', label: 'Medium', color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30' },
  { value: 'hard',   label: 'Hard',   color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/30' },
];

export default function NewInterviewPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState(null); // 'interview' | 'dsa'
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState(['technical', 'behavioral']);
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [dsaTopic, setDsaTopic] = useState('arrays');
  const [dsaDifficulty, setDsaDifficulty] = useState('medium');
  const [dsaLang, setDsaLang] = useState('python');
  const [dsaCount, setDsaCount] = useState(3);
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { user, updateUser } = useAuthStore();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: { numberOfQuestions: 5 },
  });

  const jobTitle       = watch('jobTitle');
  const jobDescription = watch('jobDescription');
  const company        = watch('company');
  const numberOfQuestions = watch('numberOfQuestions');

  useEffect(() => {
    resumeAPI.getAll().then(({ data }) => setResumes(data.resumes || []));
  }, []);

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.length > 1 ? prev.filter((t) => t !== type) : prev
        : [...prev, type]
    );
  };

  // DSA mode — go straight to DSA session with topic
  const handleDSAStart = () => {
    navigate(`/dsa-session?topic=${dsaTopic}&difficulty=${dsaDifficulty}&lang=${dsaLang}&count=${dsaCount}`);
  };

  const onSubmit = async (formData) => {
    setIsCreating(true);
    try {
      const { data: createData } = await interviewAPI.create({
        ...formData,
        experienceLevel,
        questionTypes: selectedTypes,
        resumeId: selectedResume,
      });
      const interviewId = createData.interview._id;
      setIsGenerating(true);
      toast.loading('AI is generating your questions...', { id: 'gen' });
      await interviewAPI.generateQuestions(interviewId);
      toast.success(`Questions ready! Let's go 🚀`, { id: 'gen' });
      navigate(`/interviews/${interviewId}/session`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create interview', { id: 'gen' });
    } finally {
      setIsCreating(false);
      setIsGenerating(false);
    }
  };

  const canProceed = () => {
    if (mode === 'dsa') return true;
    if (step === 1) return jobTitle?.trim().length > 0 && jobDescription?.trim().length >= 50;
    return true;
  };

  // Steps for interview mode (skip index 0 which is mode selection)
  const interviewSteps = STEPS.slice(1);
  const currentInterviewStep = step - 1; // offset by 1

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">

      {/* ── Mode Selection (step 0) ─────────────────────────────── */}
      {step === 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-display font-bold text-white mb-2">Choose Interview Mode</h2>
            <p className="text-slate-400 text-sm">What kind of practice session do you want?</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            {/* AI Interview Card */}
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => { setMode('interview'); setStep(1); }}
              className="card p-7 text-left border-2 border-transparent hover:border-brand-500 hover:shadow-brand transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-cyan-600 flex items-center justify-center mb-5 shadow-brand group-hover:shadow-glow transition-shadow">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-2">AI Mock Interview</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Upload resume, paste job description — get personalized technical & behavioral questions with detailed AI feedback.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {['Technical','Behavioral','Situational','HR'].map(t => (
                  <span key={t} className="badge badge-brand text-xs">{t}</span>
                ))}
              </div>
            </motion.button>

            {/* DSA Card */}
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => { setMode('dsa'); setStep(0.5); }}
              className="card p-7 text-left border-2 border-transparent hover:border-emerald-500/60 hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center mb-5 shadow-card group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-shadow">
                <Code2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-2">DSA Interview</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                LeetCode-style problems with a live code editor, real execution, and AI feedback on your solution approach.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {['Arrays','DP','Trees','Graphs'].map(t => (
                  <span key={t} className="badge badge-success text-xs">{t}</span>
                ))}
              </div>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* ── DSA Config (step 0.5) ───────────────────────────────── */}
      {step === 0.5 && (
        <motion.div key="dsa-config"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setStep(0)} className="btn-ghost p-2">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-600/20 rounded-xl"><Code2 className="w-5 h-5 text-emerald-400" /></div>
              <h3 className="text-xl font-display font-bold text-white">DSA Interview Setup</h3>
            </div>
          </div>

          {/* Topic */}
          <div className="card p-6">
            <label className="form-label mb-3">Select Topic</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DSA_TOPICS.map(({ value, label, icon }) => (
                <button key={value} type="button"
                  onClick={() => setDsaTopic(value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    dsaTopic === value
                      ? 'border-emerald-500 bg-emerald-500/10 text-white'
                      : 'border-surface-border bg-surface hover:border-slate-500 text-slate-400'
                  }`}
                >
                  <span className="text-lg mr-2">{icon}</span>
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty + Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-6">
              <label className="form-label mb-3">Difficulty</label>
              <div className="space-y-2">
                {DIFFICULTY_OPTIONS.map(({ value, label, color, bg }) => (
                  <button key={value} type="button"
                    onClick={() => setDsaDifficulty(value)}
                    className={`w-full p-3 rounded-xl border text-left font-medium text-sm transition-all ${
                      dsaDifficulty === value ? `${bg} ${color}` : 'border-surface-border text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <label className="form-label mb-3">Language</label>
              <div className="space-y-2">
                {DSA_LANGS.map(({ value, label }) => (
                  <button key={value} type="button"
                    onClick={() => setDsaLang(value)}
                    className={`w-full p-3 rounded-xl border text-left font-medium text-sm transition-all ${
                      dsaLang === value
                        ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                        : 'border-surface-border text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Problem count */}
          <div className="card p-6">
            <label className="form-label">
              Number of Problems: <span className="text-emerald-400 font-bold">{dsaCount}</span>
            </label>
            <input type="range" min="1" max="5" step="1"
              value={dsaCount} onChange={(e) => setDsaCount(Number(e.target.value))}
              className="w-full accent-emerald-500 mt-2" />
            <div className="flex justify-between text-xs text-slate-500 mt-1"><span>1</span><span>5</span></div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleDSAStart}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-base shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2"
          >
            <Cpu className="w-5 h-5" /> Start DSA Interview
          </motion.button>
        </motion.div>
      )}

      {/* ── Interview Mode Steps ────────────────────────────────── */}
      {mode === 'interview' && step >= 1 && (
        <>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {interviewSteps.map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300
                  ${i < currentInterviewStep ? 'bg-emerald-500 text-white' : i === currentInterviewStep ? 'bg-brand-500 text-white shadow-glow' : 'bg-surface-border text-slate-500'}`}>
                  {i < currentInterviewStep ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i === currentInterviewStep ? 'text-white' : 'text-slate-500'}`}>{label}</span>
                {i < interviewSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full ${i < currentInterviewStep ? 'bg-emerald-500' : 'bg-surface-border'}`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">

              {/* Step 1: Job Details */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card p-8 space-y-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-brand-600/20 rounded-xl"><Briefcase className="w-5 h-5 text-brand-400" /></div>
                    <h3 className="text-xl font-display font-bold text-white">Job Details</h3>
                  </div>
                  <div>
                    <label className="form-label">Job Title *</label>
                    <input type="text" className="form-input" placeholder="e.g. Senior React Developer"
                      {...register('jobTitle', { required: 'Job title is required' })} />
                    {errors.jobTitle && <p className="form-error">{errors.jobTitle.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">Company (optional)</label>
                    <input type="text" className="form-input" placeholder="e.g. Google, Microsoft..."
                      {...register('company')} />
                  </div>
                  <div>
                    <label className="form-label">
                      Job Description *
                      <span className="text-slate-500 font-normal ml-2 text-xs">({jobDescription?.length ?? 0}/5000)</span>
                    </label>
                    <textarea className="form-textarea h-40" placeholder="Paste the full job description here..."
                      {...register('jobDescription', {
                        required: 'Job description is required',
                        minLength: { value: 50, message: 'At least 50 characters' },
                      })} />
                    {errors.jobDescription && <p className="form-error">{errors.jobDescription.message}</p>}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Preferences */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-violet-600/20 rounded-xl"><Sliders className="w-5 h-5 text-violet-400" /></div>
                    <h3 className="text-xl font-display font-bold text-white">Preferences</h3>
                  </div>
                  <div>
                    <label className="form-label">Experience Level</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {EXPERIENCE_LEVELS.map(({ value, label, sub }) => (
                        <button key={value} type="button" onClick={() => setExperienceLevel(value)}
                          className={`p-3 rounded-xl border text-left transition-all ${experienceLevel === value ? 'border-brand-500 bg-brand-600/20 text-white' : 'border-surface-border bg-surface hover:border-slate-500 text-slate-400'}`}>
                          <p className="text-sm font-semibold">{label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Question Types</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {QUESTION_TYPES.map(({ value, label }) => (
                        <button key={value} type="button" onClick={() => toggleType(value)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${selectedTypes.includes(value) ? 'bg-brand-600/30 border-brand-500 text-brand-300' : 'border-surface-border text-slate-400 hover:border-slate-500'}`}>
                          {selectedTypes.includes(value) && <Check className="w-3 h-3 inline mr-1" />}
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center">
                      <label className="form-label mb-0">Questions: <span className="text-brand-400 font-bold">{numberOfQuestions}</span></label>
                      {!user?.isPremium && (
                        <span className="text-xs text-amber-400 flex items-center gap-1">
                          <Crown className="w-3 h-3" /> &gt;5 requires Premium
                        </span>
                      )}
                    </div>
                    <input type="range" min="3" max="20" step="1" className="w-full accent-brand-500 mt-2"
                      value={numberOfQuestions}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val > 5 && !user?.isPremium) {
                          setShowPremiumModal(true);
                          setValue('numberOfQuestions', 5);
                        } else {
                          setValue('numberOfQuestions', val);
                        }
                      }} />
                    <div className="flex justify-between text-xs text-slate-500 mt-1"><span>3</span><span>20</span></div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Resume */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card p-8 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-600/20 rounded-xl"><FileText className="w-5 h-5 text-emerald-400" /></div>
                    <h3 className="text-xl font-display font-bold text-white">Select Resume <span className="text-slate-500 text-sm font-normal">(optional)</span></h3>
                  </div>
                  <p className="text-slate-400 text-sm">Linking a resume helps AI generate more personalized questions.</p>
                  <div className="space-y-2">
                    <button type="button" onClick={() => setSelectedResume(null)}
                      className={`w-full p-4 rounded-xl border text-left transition-all ${!selectedResume ? 'border-brand-500 bg-brand-600/20' : 'border-surface-border bg-surface hover:border-slate-500'}`}>
                      <p className="text-sm font-medium text-white">No resume — generic questions</p>
                    </button>
                    {resumes.map((r) => (
                      <button key={r._id} type="button" onClick={() => setSelectedResume(r._id)}
                        className={`w-full p-4 rounded-xl border text-left transition-all ${selectedResume === r._id ? 'border-brand-500 bg-brand-600/20' : 'border-surface-border bg-surface hover:border-slate-500'}`}>
                        <div className="flex items-center gap-3">
                          <FileText className={`w-5 h-5 ${selectedResume === r._id ? 'text-brand-400' : 'text-slate-500'}`} />
                          <div>
                            <p className="text-sm font-medium text-white">{r.originalName}</p>
                            <p className="text-xs text-slate-500">{r.parseStatus === 'parsed' ? '✅ Parsed' : '⏳ Pending'}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card p-8 space-y-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-600/20 rounded-xl"><Sparkles className="w-5 h-5 text-amber-400" /></div>
                    <h3 className="text-xl font-display font-bold text-white">Review & Generate</h3>
                  </div>
                  {[
                    { label: 'Job Title', value: jobTitle },
                    { label: 'Company', value: company || 'Not specified' },
                    { label: 'Experience', value: EXPERIENCE_LEVELS.find((l) => l.value === experienceLevel)?.label },
                    { label: 'Question Types', value: selectedTypes.join(', ') },
                    { label: 'Questions', value: numberOfQuestions },
                    { label: 'Resume', value: resumes.find((r) => r._id === selectedResume)?.originalName || 'None' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-start py-3 border-b border-surface-border last:border-0">
                      <span className="text-slate-400 text-sm">{label}</span>
                      <span className="text-white text-sm font-medium text-right max-w-xs">{value}</span>
                    </div>
                  ))}
                  <div className="p-4 rounded-xl bg-brand-600/10 border border-brand-500/30">
                    <p className="text-brand-300 text-sm">🤖 AI will generate <strong>{numberOfQuestions}</strong> personalized questions using Groq (Llama-3). Takes 5–15 seconds.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button type="button" onClick={() => step === 1 ? setStep(0) : setStep((s) => s - 1)}
                className="btn-secondary">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              {step < 4 ? (
                <button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}
                  className="btn-primary disabled:opacity-50">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="submit" disabled={isCreating || isGenerating} className="btn-primary">
                  {isCreating || isGenerating
                    ? <><Loader2 className="w-4 h-4 animate-spin" />{isGenerating ? 'Generating...' : 'Creating...'}</>
                    : <><Sparkles className="w-4 h-4" /> Generate & Start</>}
                </button>
              )}
            </div>
          </form>
        </>
      )}
      {/* ── Premium Upgrade Modal ─────────────────────────────────────── */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={() => setShowPremiumModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Crown className="w-8 h-8 text-white" />
              </div>

              <div>
                <span className="badge badge-warning text-xs mb-2">PrepAI Pro Feature</span>
                <h3 className="text-2xl font-display font-bold text-white">Unlock &gt;5 Questions</h3>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                  Selecting more than 5 questions per session requires a PrepAI Premium subscription.
                </p>
              </div>

              <div className="card p-4 bg-slate-950/60 border-slate-800 space-y-2 text-left text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Generate up to 20 AI questions per interview</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Unlimited DSA Coding & Neetcode 150 practice</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Real-time voice & video facial presence scoring</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    updateUser({ isPremium: true });
                    setShowPremiumModal(false);
                    setValue('numberOfQuestions', 10);
                    toast.success('👑 Premium Activated! You can now select up to 20 questions.');
                  }}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all shadow-glow flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" /> Upgrade to Pro ($19/mo)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowPremiumModal(false);
                    setValue('numberOfQuestions', 5);
                  }}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition-colors"
                >
                  Keep 5 Questions (Free)
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
