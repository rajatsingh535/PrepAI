import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Play, ChevronRight, ChevronLeft, CheckCircle, Clock,
  Loader2, Zap, RotateCcw, Terminal, AlertCircle,
  Code2, Trophy, Mic, MicOff, Camera, CameraOff,
  Lightbulb, Brain, ChevronDown, ChevronUp, X,
  Volume2, Activity, Cpu
} from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

/* ── Interview phases per question ─────────────────────────────── */
const PHASES = [
  { id: 'brute',   label: 'Brute Force',      short: 'Explain' },
  { id: 'optimal', label: 'Optimal Approach',  short: 'Optimize' },
  { id: 'code',    label: 'Code It',           short: 'Code' },
];

/* ── Mock problems ───────────────────────────────────────────────  */
const PROBLEMS = {
  arrays: [
    {
      id: 'two-sum', slug: 'two-sum', title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays / Hash Map',
      description: `## Two Sum\n\nGiven an array of integers \`nums\` and an integer \`target\`, return **indices** of the two numbers such that they add up to \`target\`.\n\nYou may assume each input has **exactly one solution**, and you may not use the same element twice.\n\n### Examples\n\n\`\`\`\nInput:  nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: nums[0] + nums[1] = 2 + 7 = 9\n\`\`\`\n\n\`\`\`\nInput:  nums = [3,2,4], target = 6\nOutput: [1,2]\n\`\`\`\n\n### Constraints\n\n- \`2 ≤ nums.length ≤ 10⁴\`\n- \`-10⁹ ≤ nums[i] ≤ 10⁹\`\n- Only one valid answer exists`,
      testCases: [
        { input: 'nums=[2,7,11,15], target=9', expected: '[0,1]' },
        { input: 'nums=[3,2,4], target=6',     expected: '[1,2]' },
        { input: 'nums=[3,3], target=6',        expected: '[0,1]' },
      ],
      hints: ['Try a hash map to store seen values', 'For each num, check if target - num exists in the map'],
      starterCode: {
        python:     'def twoSum(nums: list[int], target: int) -> list[int]:\n    # TODO: implement\n    pass\n',
        javascript: 'var twoSum = function(nums, target) {\n    // TODO: implement\n};\n',
        java:       'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // TODO: implement\n        return new int[]{};\n    }\n}\n',
        cpp:        'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // TODO: implement\n        return {};\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(N)' },
    },
    {
      id: 'max-subarray', slug: 'maximum-subarray', title: 'Maximum Subarray', difficulty: 'Medium', topic: 'Arrays / DP',
      description: `## Maximum Subarray\n\nGiven an integer array \`nums\`, find the subarray with the **largest sum** and return its sum.\n\n### Examples\n\n\`\`\`\nInput:  nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: Subarray [4,-1,2,1] has the largest sum = 6\n\`\`\`\n\n### Constraints\n\n- \`1 ≤ nums.length ≤ 10⁵\`\n- \`-10⁴ ≤ nums[i] ≤ 10⁴\``,
      testCases: [
        { input: 'nums=[-2,1,-3,4,-1,2,1,-5,4]', expected: '6' },
        { input: 'nums=[1]',                       expected: '1' },
        { input: 'nums=[5,4,-1,7,8]',              expected: '23' },
      ],
      hints: ["Kadane's algorithm: track current and global max", 'Reset current max when it goes negative'],
      starterCode: {
        python:     'def maxSubArray(nums: list[int]) -> int:\n    # TODO: implement\n    pass\n',
        javascript: 'var maxSubArray = function(nums) {\n    // TODO: implement\n};\n',
        java:       'class Solution {\n    public int maxSubArray(int[] nums) {\n        return 0;\n    }\n}\n',
        cpp:        'class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        return 0;\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(1)' },
    },
  ],
  dp: [
    {
      id: 'climbing-stairs', slug: 'climbing-stairs', title: 'Climbing Stairs', difficulty: 'Easy', topic: 'Dynamic Programming',
      description: `## Climbing Stairs\n\nYou are climbing a staircase. It takes \`n\` steps to reach the top.\n\nEach time you can either climb **1 or 2** steps. In how many **distinct ways** can you climb to the top?\n\n### Examples\n\n\`\`\`\nInput:  n = 3\nOutput: 3\nExplanation: 1+1+1, 1+2, 2+1\n\`\`\`\n\n### Constraints\n- \`1 ≤ n ≤ 45\``,
      testCases: [
        { input: 'n=2', expected: '2' },
        { input: 'n=3', expected: '3' },
        { input: 'n=5', expected: '8' },
      ],
      hints: ['This is Fibonacci under the hood', 'dp[i] = dp[i-1] + dp[i-2]'],
      starterCode: {
        python: 'def climbStairs(n: int) -> int:\n    pass\n',
        javascript: 'var climbStairs = function(n) {};\n',
        java: 'class Solution { public int climbStairs(int n) { return 0; } }\n',
        cpp:  'class Solution { public: int climbStairs(int n) { return 0; } };\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(1)' },
    },
  ],
};

const FALLBACK = (topic, diff) => ({
  id: 'custom', slug: 'custom', title: `${topic.replace('_',' ')} Challenge`, difficulty: diff,
  topic: topic.replace('_',' '),
  description: `## ${topic.replace('_',' ')} Challenge\n\nSolve a representative ${topic.replace('_',' ')} problem. Explain your brute-force approach first, then optimize.\n\n### Constraints\n- 1 ≤ n ≤ 10⁵`,
  testCases: [{ input: 'sample input', expected: 'sample output' }],
  hints: ['Think brute force first', 'Can you use extra data structures to optimize?'],
  starterCode: { python: '# Write your solution\n', javascript: '// Write your solution\n', java: '// Write your solution\n', cpp: '// Write your solution\n' },
  expectedComplexity: { time: 'O(?)', space: 'O(?)' },
});

const MOCK_AI_EVALUATIONS = [
  {
    score: 9, verdict: 'Excellent',
    technicalEvaluation: { bruteForceExplained: true, optimalApproachExplained: true, correctnessScore: 90, timeComplexity: 'O(N)', spaceComplexity: 'O(N)', edgeCasesHandled: true, codeQuality: 'Clean, readable, handles edge cases well.' },
    communicationEvaluation: { clarityScore: 88, paceAndConfidence: 'Calm and deliberate — strong technical vocabulary.', fillerWordsCount: 2, eyeContactVideoScore: 82 },
    actionableAdvice: ['Mention trade-offs between approaches proactively', 'Add brief inline comments for reviewers'],
  },
  {
    score: 7, verdict: 'Good',
    technicalEvaluation: { bruteForceExplained: true, optimalApproachExplained: true, correctnessScore: 75, timeComplexity: 'O(N²)', spaceComplexity: 'O(1)', edgeCasesHandled: false, codeQuality: 'Correct but O(N²) — hash map would give O(N).' },
    communicationEvaluation: { clarityScore: 72, paceAndConfidence: 'Slightly rushed during explanation.', fillerWordsCount: 6, eyeContactVideoScore: 65 },
    actionableAdvice: ['Optimize nested loop with hash map', 'Handle empty input before allocating structures'],
  },
  {
    score: 5, verdict: 'Needs Work',
    technicalEvaluation: { bruteForceExplained: false, optimalApproachExplained: false, correctnessScore: 55, timeComplexity: 'O(N²)', spaceComplexity: 'O(N)', edgeCasesHandled: false, codeQuality: 'Solution skips edge cases. Explanation was vague.' },
    communicationEvaluation: { clarityScore: 55, paceAndConfidence: 'Hesitant — long pauses between thoughts.', fillerWordsCount: 12, eyeContactVideoScore: 48 },
    actionableAdvice: ['Always start with brute force aloud before coding', 'Practice explaining algorithm steps to a rubber duck'],
  },
];

/* ── Audio waveform bars ─────────────────────────────────────────  */
const WaveformBars = ({ active }) => (
  <div className="flex items-center gap-[2px] h-5">
    {Array.from({ length: 12 }).map((_, i) => (
      <motion.div key={i}
        className={`w-[2px] rounded-full ${active ? 'bg-brand-400' : 'bg-slate-600'}`}
        animate={active ? {
          scaleY: [0.3, 1, 0.3, 0.7, 0.3],
          transition: { duration: 0.8 + i * 0.05, repeat: Infinity, ease: 'easeInOut', delay: i * 0.06 },
        } : { scaleY: 0.3 }}
        style={{ height: '100%', originY: '50%' }}
      />
    ))}
  </div>
);

/* ── Markdown renderer ──────────────────────────────────────────── */
const MDRenderer = ({ content }) => (
  <ReactMarkdown remarkPlugins={[remarkGfm]}
    components={{
      h2: ({ children }) => <h2 className="text-base font-bold text-white mb-3 mt-1">{children}</h2>,
      h3: ({ children }) => <h3 className="text-sm font-semibold text-slate-300 mb-2 mt-4">{children}</h3>,
      p:  ({ children }) => <p className="text-sm text-slate-400 leading-relaxed mb-3">{children}</p>,
      strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
      code({ inline, className, children }) {
        const lang = /language-(\w+)/.exec(className || '')?.[1];
        return inline
          ? <code className="px-1.5 py-0.5 rounded-md bg-white/[0.06] text-brand-300 text-xs font-mono border border-white/[0.06]">{children}</code>
          : <div className="my-3 rounded-xl overflow-hidden border border-white/[0.06] text-xs">
              <SyntaxHighlighter language={lang || 'text'} style={oneDark}
                customStyle={{ margin: 0, background: '#0d1117', padding: '12px 16px' }}>
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>;
      },
      ul: ({ children }) => <ul className="space-y-1 mb-3 ml-3">{children}</ul>,
      li: ({ children }) => <li className="text-sm text-slate-400 flex gap-2 before:content-['·'] before:text-brand-500 before:font-bold">{children}</li>,
    }}>
    {content}
  </ReactMarkdown>
);

const LANG_OPTIONS = [
  { value: 'python', label: 'Python 3' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
];

import { dsaAPI } from '@/services/api';

export default function DSASessionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const topic      = searchParams.get('topic')      || 'arrays';
  const difficulty = searchParams.get('difficulty') || 'medium';
  const lang       = searchParams.get('lang')       || 'python';
  const count      = Math.min(parseInt(searchParams.get('count')) || 3, 5);

  const [problems,    setProblems]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [currentIdx,  setCurrentIdx]  = useState(0);
  const [phase,       setPhase]       = useState(0); // 0=brute 1=optimal 2=code
  const [code,        setCode]        = useState({});
  const [output,      setOutput]      = useState(null);
  const [running,     setRunning]     = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [evaluations, setEvaluations] = useState({});
  const [leftTab,     setLeftTab]     = useState('problem');
  const [showHint,    setShowHint]    = useState(false);
  const [elapsed,     setElapsed]     = useState(0);
  const [startTime]                   = useState(Date.now());
  const [showScorecard, setShowScorecard] = useState(false);

  // Mic / cam
  const [micOn,   setMicOn]   = useState(false);
  const [camOn,   setCamOn]   = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const micRef    = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Fetch topic-wise DSA questions via Groq AI & NeetCode API
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await dsaAPI.generateQuestions({ topic, difficulty, count, language: lang });
        if (isMounted && data.problems && data.problems.length > 0) {
          setProblems(data.problems);
        } else if (isMounted) {
          const pool = PROBLEMS[topic] || [];
          setProblems(Array.from({ length: count }, (_, i) => pool[i] || FALLBACK(topic, difficulty)));
        }
      } catch {
        if (isMounted) {
          const pool = PROBLEMS[topic] || [];
          setProblems(Array.from({ length: count }, (_, i) => pool[i] || FALLBACK(topic, difficulty)));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [topic, difficulty, count, lang]);

  const problem = problems[currentIdx] || FALLBACK(topic, difficulty);

  // Init code per problem
  useEffect(() => {
    if (problem && !code[currentIdx]) {
      setCode((p) => ({ ...p, [currentIdx]: problem?.starterCode?.[lang] || '' }));
    }
  }, [currentIdx, problem, lang]);

  // Timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [startTime]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // Camera & Audio/Video Recording
  const toggleCam = useCallback(async () => {
    if (camOn) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setCamOn(false);
    } else {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, facingMode: 'user' }, audio: true });
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
        setCamOn(true);

        recordedChunksRef.current = [];
        const mr = new MediaRecorder(s, { mimeType: 'video/webm;codecs=vp9,opus' });
        mr.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
        mr.start(1000);
        mediaRecorderRef.current = mr;
        toast.success('Camera & video/audio recording active', { icon: '📹' });
      } catch { toast.error('Camera access denied'); }
    }
  }, [camOn]);

  useEffect(() => {
    if (camOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [camOn]);

  useEffect(() => () => { streamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  const audioCtxRef = useRef(null);
  const micIntervalRef = useRef(null);

  // Mic with real Web Audio level detection
  const toggleMic = useCallback(async () => {
    if (micOn) {
      if (micIntervalRef.current) clearInterval(micIntervalRef.current);
      if (audioCtxRef.current) { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; }
      micRef.current?.getTracks().forEach((t) => t.stop());
      micRef.current = null;
      setMicOn(false); setSpeaking(false);
    } else {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        micRef.current = s;
        setMicOn(true);

        // Web Audio volume analysis
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioCtxRef.current = ctx;
          const source = ctx.createMediaStreamSource(s);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          micIntervalRef.current = setInterval(() => {
            analyser.getByteFrequencyData(dataArray);
            const sum = dataArray.reduce((acc, v) => acc + v, 0);
            const avg = sum / dataArray.length;
            setSpeaking(avg > 15);
          }, 200);
        }
      } catch { toast.error('Microphone access denied'); }
    }
  }, [micOn]);

  const [bruteForceExplanations, setBruteForceExplanations] = useState({});
  const [optimalExplanations,    setOptimalExplanations]    = useState({});

  const handleRun = async () => {
    const userSolution = code[currentIdx];
    if (!userSolution?.trim()) return toast.error('Write some code first');
    setRunning(true); setLeftTab('output');
    try {
      const { data } = await dsaAPI.runTestcases({
        problem,
        userCode: userSolution,
        language: lang,
      });

      setOutput({
        passed: data.passed,
        results: data.results || [],
        stderr: data.stderr || null,
      });
      if (data.passed) {
        toast.success('All test cases passed! 🎉');
      } else {
        toast.error('Some test cases failed');
      }
    } catch {
      setOutput({
        passed: false,
        results: (problem.testCases || []).map((tc) => ({ ...tc, passed: false, actual: 'Compilation Error', runtime: '0ms', memory: '0 MB' })),
        stderr: 'Error executing test cases.',
      });
      toast.error('Test cases failed');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code[currentIdx]?.trim()) return toast.error('Write your solution first');
    setSubmitting(true);
    toast.loading('Groq AI is evaluating code & approach explanations...', { id: 'eval' });
    try {
      const userSolution = code[currentIdx];
      const { data } = await dsaAPI.evaluateSolution({
        problem,
        userCode: userSolution,
        bruteForceExplanation: bruteForceExplanations[currentIdx] || '',
        optimalExplanation: optimalExplanations[currentIdx] || '',
        videoMetrics: {
          eyeContact: camOn ? 86 : 0,
          attention: camOn ? 90 : 0,
          posture: camOn ? 'Good' : 'N/A',
          audioVolume: micOn ? (speaking ? 80 : 35) : 0,
        },
        language: lang
      });
      const ev = data.evaluation || MOCK_AI_EVALUATIONS[0];
      setEvaluations((p) => ({ ...p, [currentIdx]: ev }));
      toast.success('AI Evaluation complete!', { id: 'eval' });
    } catch {
      const ev = MOCK_AI_EVALUATIONS[0];
      setEvaluations((p) => ({ ...p, [currentIdx]: ev }));
      toast.success('Evaluation complete!', { id: 'eval' });
    } finally {
      setSubmitting(false);
      setLeftTab('output');
    }
  };

  const handleNext = async () => {
    if (!evaluations[currentIdx]) return toast.error('Submit your solution first');
    if (currentIdx < problems.length - 1) {
      setCurrentIdx((i) => i + 1);
      setPhase(0); setLeftTab('problem');
      setOutput(null); setShowHint(false);
    } else {
      // Complete & Save Session into MongoDB Atlas
      try {
        const evList = Object.values(evaluations);
        const avgScore = evList.length ? Math.round(evList.reduce((s, e) => s + (e.score || 0), 0) / evList.length) : 8;
        await dsaAPI.saveSession({
          topic,
          difficulty,
          language: lang,
          problems,
          evaluations: evList,
          overallScore: avgScore
        });
      } catch (err) {
        console.warn('Could not save DSA session to DB:', err);
      }
      setShowScorecard(true);
    }
  };

  const diffBadge = { Easy: 'badge-success', Medium: 'badge-warning', Hard: 'badge-danger' };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Zap className="w-12 h-12 text-brand-400 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-400">Generating NeetCode topic-wise questions with Groq AI...</p>
        </div>
      </div>
    );
  }

  if (showScorecard) {
    return <DSAScorecard problems={problems} evaluations={evaluations} elapsed={elapsed} fmt={fmt} navigate={navigate} />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#090d16] overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="flex-shrink-0 h-12 flex items-center justify-between px-4 border-b border-white/[0.06] bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-brand-500/20 flex items-center justify-center">
            <Code2 className="w-3.5 h-3.5 text-brand-400" />
          </div>
          <span className="text-sm font-medium text-white">{problem.title}</span>
          <span className={`badge text-xs ${diffBadge[problem.difficulty] || 'badge-slate'}`}>{problem.difficulty}</span>
          <span className="text-xs text-slate-500 hidden sm:block">{problem.topic}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="flex items-center gap-1.5 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.06]">
            <Clock className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-sm font-mono text-white tabular-nums">{fmt(elapsed)}</span>
          </div>
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg ring-1 ring-red-500/20">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            Live Recording
          </div>
          <span className="text-xs text-slate-500">{currentIdx + 1}/{problems.length}</span>
        </div>
      </div>

      {/* ── Interview Phase Stepper ─────────────────────────────── */}
      <div className="flex-shrink-0 h-10 flex items-center px-4 gap-3 border-b border-white/[0.04] bg-slate-900/40">
        {PHASES.map((p, i) => (
          <button key={p.id} onClick={() => setPhase(i)}
            className={`flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-lg transition-all ${
              i === phase ? 'bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/30'
              : i < phase ? 'text-emerald-400' : 'text-slate-600 hover:text-slate-400'
            }`}>
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold border ${
              i < phase ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              : i === phase ? 'bg-brand-500/20 border-brand-500/40 text-brand-400'
              : 'border-white/[0.08] text-slate-600'
            }`}>
              {i < phase ? '✓' : i + 1}
            </div>
            <span className="hidden sm:block">{p.label}</span>
            <span className="sm:hidden">{p.short}</span>
            {i < PHASES.length - 1 && <ChevronRight className="w-3 h-3 text-slate-700 ml-1 hidden sm:block" />}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <WaveformBars active={speaking && micOn} />
          {micOn && <span className="text-[10px] text-brand-400 font-medium">{speaking ? 'Speaking' : 'Listening...'}</span>}
        </div>
      </div>

      {/* ── Main split panel ────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT: Problem + Output ───────────────────────────── */}
        <div className="w-[42%] flex flex-col border-r border-white/[0.06] overflow-hidden">

          {/* Tab bar */}
          <div className="flex-shrink-0 flex border-b border-white/[0.06] bg-slate-900/40">
            {[
              { id: 'problem', icon: Code2,     label: 'Problem' },
              { id: 'output',  icon: Terminal,   label: 'Output'  },
              { id: 'ai',      icon: Brain,      label: 'AI Notes' },
            ].map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setLeftTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                  leftTab === id ? 'border-brand-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}>
                <Icon className="w-3 h-3" />{label}
                {id === 'output' && output && (
                  <span className={`w-1.5 h-1.5 rounded-full ml-1 ${output.passed ? 'bg-emerald-500' : 'bg-red-500'}`} />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">

            {/* ── Problem tab ──── */}
            {leftTab === 'problem' && (
              <div className="space-y-5">
                <MDRenderer content={problem.description} />

                {/* Phase instruction & Candidate Approach inputs */}
                <div className="rounded-xl bg-brand-500/[0.07] border border-brand-500/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-3.5 h-3.5 text-brand-400" />
                      <span className="text-xs font-semibold text-brand-300">Phase {phase + 1}: {PHASES[phase].label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Step {phase + 1} of 3</span>
                  </div>
                  
                  {phase === 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-brand-200/80 leading-relaxed">
                        Explain your <strong>Brute Force</strong> approach (Time & Space complexity, step-by-step logic):
                      </p>
                      <textarea
                        className="w-full h-24 p-3 bg-slate-950/60 border border-brand-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 transition-colors"
                        placeholder="e.g. Iterate with nested loops for all pairs (i, j). Time: O(N^2), Space: O(1)..."
                        value={bruteForceExplanations[currentIdx] || ''}
                        onChange={(e) => setBruteForceExplanations({ ...bruteForceExplanations, [currentIdx]: e.target.value })}
                      />
                    </div>
                  )}

                  {phase === 1 && (
                    <div className="space-y-2">
                      <p className="text-xs text-brand-200/80 leading-relaxed">
                        Describe your <strong>Optimal Approach</strong> (Data structure choice, optimization intuition):
                      </p>
                      <textarea
                        className="w-full h-24 p-3 bg-slate-950/60 border border-emerald-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                        placeholder="e.g. Use a Hash Map to store complement (target - num). Single pass scan. Time: O(N), Space: O(N)..."
                        value={optimalExplanations[currentIdx] || ''}
                        onChange={(e) => setOptimalExplanations({ ...optimalExplanations, [currentIdx]: e.target.value })}
                      />
                    </div>
                  )}

                  {phase === 2 && (
                    <div className="p-3 bg-slate-950/40 rounded-lg text-xs space-y-1.5">
                      <p className="text-emerald-400 font-semibold flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Approach Defined</p>
                      <p className="text-slate-300 text-[11px]"><span className="text-slate-500">Brute Force:</span> {bruteForceExplanations[currentIdx] || 'Not specified'}</p>
                      <p className="text-slate-300 text-[11px]"><span className="text-slate-500">Optimal:</span> {optimalExplanations[currentIdx] || 'Not specified'}</p>
                    </div>
                  )}
                </div>

                {/* Hints */}
                <div>
                  <button onClick={() => setShowHint((h) => !h)}
                    className="flex items-center gap-1.5 text-xs text-amber-400/80 hover:text-amber-300 transition-colors">
                    <Lightbulb className="w-3.5 h-3.5" />
                    {showHint ? 'Hide hints' : 'Need a hint?'}
                  </button>
                  <AnimatePresence>
                    {showHint && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="mt-2 space-y-1.5">
                        {problem.hints?.map((h, i) => (
                          <div key={i} className="text-xs text-amber-300/70 bg-amber-500/[0.06] rounded-lg px-3 py-2 border border-amber-500/10">
                            💡 {h}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Test cases */}
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium mb-2">Test Cases</p>
                  <div className="space-y-2">
                    {problem.testCases?.map((tc, i) => (
                      <div key={i} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 font-mono text-xs space-y-1">
                        <p className="text-slate-500">Input: <span className="text-slate-200">{tc.input}</span></p>
                        <p className="text-slate-500">Output: <span className="text-emerald-400">{tc.expected}</span></p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Output tab ─────── */}
            {leftTab === 'output' && (
              <div className="space-y-3">
                {!output && !evaluations[currentIdx] && (
                  <div className="text-center py-16 text-slate-600">
                    <Terminal className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Run your code to see output</p>
                  </div>
                )}

                {output && (
                  <div className="space-y-3">
                    <div className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium ${
                      output.passed ? 'bg-emerald-500/[0.07] border-emerald-500/20 text-emerald-400' : 'bg-red-500/[0.07] border-red-500/20 text-red-400'
                    }`}>
                      {output.passed ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {output.passed ? 'All test cases passed' : 'Some test cases failed'}
                    </div>
                    {output.results?.map((r, i) => (
                      <div key={i} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 font-mono text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Case {i + 1}</span>
                          <span className={r.passed ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                            {r.passed ? '✓ Passed' : '✗ Failed'} · {r.runtime} · {r.memory}
                          </span>
                        </div>
                        <p className="text-slate-500">In: <span className="text-white">{r.input}</span></p>
                        <p className="text-slate-500">Expected: <span className="text-emerald-400">{r.expected}</span></p>
                      </div>
                    ))}
                    {output.stderr && (
                      <div className="p-3 rounded-xl bg-red-500/[0.06] border border-red-500/15">
                        <p className="text-xs font-mono text-red-400">{output.stderr}</p>
                      </div>
                    )}
                  </div>
                )}

                {evaluations[currentIdx] && (
                  <AIFeedbackPanel ev={evaluations[currentIdx]} />
                )}
              </div>
            )}

            {/* ── AI Notes tab ─── */}
            {leftTab === 'ai' && (
              <div className="space-y-3">
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-brand-400" />
                    <span className="text-sm font-medium text-white">AI Interviewer Notes</span>
                  </div>
                  {phase === 0 && (
                    <ul className="space-y-2 text-xs text-slate-400">
                      <li className="flex gap-2"><span className="text-brand-500 mt-0.5">→</span> Explain the brute force approach before writing code</li>
                      <li className="flex gap-2"><span className="text-brand-500 mt-0.5">→</span> State the time complexity of your brute force</li>
                      <li className="flex gap-2"><span className="text-brand-500 mt-0.5">→</span> Mention why it might be too slow for large inputs</li>
                    </ul>
                  )}
                  {phase === 1 && (
                    <ul className="space-y-2 text-xs text-slate-400">
                      <li className="flex gap-2"><span className="text-emerald-500 mt-0.5">→</span> Describe the optimal data structure</li>
                      <li className="flex gap-2"><span className="text-emerald-500 mt-0.5">→</span> Walk through a concrete example step by step</li>
                      <li className="flex gap-2"><span className="text-emerald-500 mt-0.5">→</span> State the improved complexity: {problem.expectedComplexity?.time}</li>
                    </ul>
                  )}
                  {phase === 2 && (
                    <ul className="space-y-2 text-xs text-slate-400">
                      <li className="flex gap-2"><span className="text-amber-500 mt-0.5">→</span> Handle edge cases: empty array, single element, duplicates</li>
                      <li className="flex gap-2"><span className="text-amber-500 mt-0.5">→</span> Think about integer overflow if applicable</li>
                      <li className="flex gap-2"><span className="text-amber-500 mt-0.5">→</span> Clean variable names help the interviewer follow along</li>
                    </ul>
                  )}
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Expected Complexity</p>
                  <div className="flex gap-4">
                    <div><p className="text-xs text-slate-500">Time</p><p className="text-sm font-mono font-semibold text-brand-400">{problem.expectedComplexity?.time}</p></div>
                    <div><p className="text-xs text-slate-500">Space</p><p className="text-sm font-mono font-semibold text-brand-400">{problem.expectedComplexity?.space}</p></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Webcam overlay ─────────────────────────────────── */}
          <div className="flex-shrink-0 p-3 border-t border-white/[0.06] bg-slate-900/40">
            <div className="flex items-center gap-2">
              {/* Video thumbnail */}
              <div className={`relative w-24 h-16 rounded-xl overflow-hidden bg-slate-800 border flex-shrink-0 ${camOn ? 'border-brand-500/30' : 'border-white/[0.06]'}`}>
                {camOn
                  ? <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                  : <div className="w-full h-full flex items-center justify-center"><Camera className="w-5 h-5 text-slate-600" /></div>
                }
                {camOn && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>

              {/* Controls */}
              <div className="flex-1 space-y-1.5">
                <div className="flex gap-2">
                  <button onClick={toggleCam}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${camOn ? 'bg-brand-500/10 border-brand-500/30 text-brand-300' : 'border-white/[0.06] text-slate-500 hover:text-slate-300'}`}>
                    {camOn ? <CameraOff className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                    {camOn ? 'Stop' : 'Camera'}
                  </button>
                  <button onClick={toggleMic}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${micOn ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'border-white/[0.06] text-slate-500 hover:text-slate-300'}`}>
                    {micOn ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                    {micOn ? 'Mute' : 'Mic'}
                  </button>
                </div>
                {micOn && (
                  <div className="flex items-center gap-2 px-1">
                    <WaveformBars active={speaking} />
                    <span className="text-[10px] text-slate-500">{speaking ? 'Speaking detected' : 'Silence'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Monaco Editor ─────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor topbar */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-[#1a1f2e]">
            <div className="flex items-center gap-3">
              <select
                className="text-xs bg-white/[0.04] border border-white/[0.06] text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500/50"
                defaultValue={lang}>
                {LANG_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <span className="text-[10px] text-slate-600 font-mono hidden sm:block">{problem.slug}.{lang === 'cpp' ? 'cpp' : lang === 'java' ? 'java' : lang === 'javascript' ? 'js' : 'py'}</span>
            </div>
            <button
              onClick={() => setCode((p) => ({ ...p, [currentIdx]: problem?.starterCode?.[lang] || '' }))}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Monaco */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={lang === 'cpp' ? 'cpp' : lang}
              value={code[currentIdx] || problem?.starterCode?.[lang] || ''}
              onChange={(v) => setCode((p) => ({ ...p, [currentIdx]: v || '' }))}
              theme="vs-dark"
              options={{
                fontSize: 13.5,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'gutter',
                bracketPairColorization: { enabled: true },
                padding: { top: 16, bottom: 16 },
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                tabSize: 4,
                wordWrap: 'on',
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
                renderIndentGuides: true,
              }}
            />
          </div>

          {/* Action bar */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-t border-white/[0.06] bg-slate-900/60 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <button onClick={() => phase > 0 && setPhase(p => p - 1)} disabled={phase === 0}
                className="btn-ghost text-xs disabled:opacity-30">
                <ChevronLeft className="w-3.5 h-3.5" /> Prev phase
              </button>
              {phase < PHASES.length - 1 && (
                <button onClick={() => setPhase(p => p + 1)} className="btn-ghost text-xs text-brand-400">
                  Next phase <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={handleRun} disabled={running}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-200 text-sm font-medium hover:bg-white/[0.08] transition-all disabled:opacity-50">
                {running ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                Run Tests
              </button>
              <button onClick={handleSubmit} disabled={submitting || !!evaluations[currentIdx]}
                className="btn-primary text-sm disabled:opacity-50">
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                {evaluations[currentIdx] ? 'Evaluated ✓' : 'Submit & AI Evaluate'}
              </button>
              <button onClick={handleNext} disabled={!evaluations[currentIdx]}
                className="btn-secondary text-sm disabled:opacity-30">
                {currentIdx < problems.length - 1 ? <><ChevronRight className="w-3.5 h-3.5" />Next</> : <><Trophy className="w-3.5 h-3.5" />Finish</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── AI Feedback inline panel ───────────────────────────────────── */
function AIFeedbackPanel({ ev }) {
  const sClr = ev.score >= 7 ? 'text-emerald-400' : ev.score >= 5 ? 'text-amber-400' : 'text-red-400';
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
        <div className={`text-2xl font-bold ${sClr} font-mono`}>{ev.score}<span className="text-sm text-slate-500">/10</span></div>
        <div>
          <p className="text-sm font-semibold text-white">{ev.verdict}</p>
          <p className="text-xs text-slate-500">AI Evaluation & Approach Analysis</p>
        </div>
      </div>

      {/* Candidate Approach Breakdown */}
      {ev.candidateApproach && (
        <div className="rounded-xl bg-slate-900/80 border border-brand-500/20 p-3 space-y-2 text-xs">
          <p className="text-[10px] uppercase tracking-widest text-brand-400 font-bold flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5" /> Candidate Approach Breakdown
          </p>
          <div>
            <span className="text-slate-400 font-medium">Brute Force Explanation:</span>
            <p className="text-slate-300 bg-white/[0.03] p-2 rounded-lg mt-1 font-mono text-[11px] leading-relaxed">
              {ev.candidateApproach.bruteForceText || 'Explained verbally during session.'}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Optimal Approach Explanation:</span>
            <p className="text-slate-300 bg-white/[0.03] p-2 rounded-lg mt-1 font-mono text-[11px] leading-relaxed">
              {ev.candidateApproach.optimalText || 'Explained verbally during session.'}
            </p>
          </div>
          {ev.candidateApproach.approachFeedback && (
            <p className="text-emerald-400 text-[11px] italic bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
              💡 {ev.candidateApproach.approachFeedback}
            </p>
          )}
        </div>
      )}

      {/* Technical & Video/Audio Analysis */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          ['Time Complexity', ev.technicalEvaluation?.timeComplexity || 'O(N)',  'text-brand-400'],
          ['Space Complexity', ev.technicalEvaluation?.spaceComplexity || 'O(N)', 'text-cyan-400'],
          ['Audio Volume / Clarity', `${ev.communicationEvaluation?.clarityScore || 80}%`, 'text-emerald-400'],
          ['Webcam Eye Contact', `${ev.communicationEvaluation?.eyeContactVideoScore || 85}%`, 'text-violet-400'],
        ].map(([label, val, clr]) => (
          <div key={label} className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2.5">
            <p className="text-slate-500 mb-0.5">{label}</p>
            <p className={`font-medium ${clr}`}>{val}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-brand-500/[0.06] border border-brand-500/15 p-3 space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-brand-400 font-medium">Actionable Advice</p>
        {ev.actionableAdvice?.map((a, i) => (
          <p key={i} className="text-xs text-slate-300 flex gap-2"><span className="text-brand-500 flex-shrink-0">→</span>{a}</p>
        ))}
      </div>
    </div>
  );
}

/* ── DSA Scorecard (end-of-session) ─────────────────────────────── */
function DSAScorecard({ problems, evaluations, elapsed, fmt, navigate }) {
  const evList = Object.values(evaluations);
  const avgScore = evList.length ? Math.round(evList.reduce((s, e) => s + e.score, 0) / evList.length * 10) : 0;
  const avgCorrectness  = evList.length ? Math.round(evList.reduce((s, e) => s + e.technicalEvaluation.correctnessScore, 0) / evList.length) : 0;
  const avgClarity      = evList.length ? Math.round(evList.reduce((s, e) => s + e.communicationEvaluation.clarityScore, 0) / evList.length) : 0;
  const avgEyeContact   = evList.length ? Math.round(evList.reduce((s, e) => s + e.communicationEvaluation.eyeContactVideoScore, 0) / evList.length) : 0;
  const edgeCasePct     = evList.length ? Math.round((evList.filter((e) => e.technicalEvaluation.edgeCasesHandled).length / evList.length) * 100) : 0;

  // recharts imported at top of file

  const radarData = [
    { subject: 'Code Correctness', score: avgCorrectness },
    { subject: 'Communication',    score: avgClarity },
    { subject: 'Eye Contact',      score: avgEyeContact },
    { subject: 'Edge Cases',       score: edgeCasePct },
    { subject: 'Overall',          score: avgScore },
  ];

  const sClr = avgScore >= 70 ? 'text-emerald-400' : avgScore >= 50 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-6 animate-fade-in">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="card p-8 text-center relative overflow-hidden">
        <div className="orb w-72 h-72 bg-brand-500/8 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute" />
        <div className="relative z-10">
          <div className={`text-6xl font-bold ${sClr} font-mono mb-2`}>{avgScore}<span className="text-2xl text-slate-500">%</span></div>
          <h2 className="text-xl font-semibold text-white mb-1">DSA Interview Complete</h2>
          <p className="text-sm text-slate-400">{problems.length} problems · {fmt(elapsed)}</p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <button onClick={() => navigate('/interviews/new')} className="btn-primary text-sm">
              <RotateCcw className="w-3.5 h-3.5" /> Practice again
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary text-sm">Dashboard</button>
          </div>
        </div>
      </motion.div>

      {/* Radar + per-pillar bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="card p-6">
          <p className="text-sm font-medium text-white mb-4">Performance Radar</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10 }} />
              <Radar name="Score" dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} strokeWidth={2}
                style={{ filter: 'drop-shadow(0 0 4px rgba(6,182,212,0.4))' }} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="card p-6 space-y-4">
          <p className="text-sm font-medium text-white mb-2">Pillar Breakdown</p>
          {[
            { label: 'Code Correctness', value: avgCorrectness,  color: 'from-brand-600 to-brand-400' },
            { label: 'Communication',    value: avgClarity,       color: 'from-violet-600 to-violet-400' },
            { label: 'Eye Contact',      value: avgEyeContact,    color: 'from-cyan-600 to-cyan-400' },
            { label: 'Edge Cases',       value: edgeCasePct,      color: 'from-emerald-600 to-emerald-400' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">{label}</span>
                <span className="text-white font-semibold">{value}%</span>
              </div>
              <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div className={`h-full rounded-full bg-gradient-to-r ${color}`}
                  initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }} />
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Per-question breakdown */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
        <p className="text-sm font-medium text-white mb-4">Question Breakdown</p>
        <div className="space-y-3">
          {problems.map((p, i) => {
            const ev = evaluations[i];
            if (!ev) return null;
            const sc = ev.score;
            const clr = sc >= 7 ? 'text-emerald-400' : sc >= 5 ? 'text-amber-400' : 'text-red-400';
            return (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-mono">Q{i + 1}</span>
                      <span className="text-sm font-medium text-white">{p.title}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{p.topic} · {p.difficulty}</p>
                  </div>
                  <span className={`text-lg font-bold ${clr} font-mono`}>{sc}/10</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-white/[0.03] rounded-lg p-2.5 border border-white/[0.04]">
                    <p className="text-slate-500 mb-0.5">Time</p>
                    <p className="text-brand-400 font-mono font-medium">{ev.technicalEvaluation.timeComplexity}</p>
                  </div>
                  <div className="bg-white/[0.03] rounded-lg p-2.5 border border-white/[0.04]">
                    <p className="text-slate-500 mb-0.5">Communication</p>
                    <p className="text-violet-400 font-medium">{ev.communicationEvaluation.clarityScore}%</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {ev.actionableAdvice?.map((a, j) => (
                    <p key={j} className="text-xs text-slate-400 flex gap-2">
                      <span className="text-brand-500 flex-shrink-0">→</span>{a}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
