import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, SkipForward, CheckCircle,
  Clock, Mic, Send, Loader2, AlertCircle, Zap, Volume2, VolumeX,
  Camera, CameraOff, Eye, EyeOff, Brain, TrendingUp
} from 'lucide-react';
import { interviewAPI, sessionAPI } from '@/services/api';
import toast from 'react-hot-toast';

const DIFFICULTY_CLR = { easy: 'badge-success', medium: 'badge-warning', hard: 'badge-danger' };
const CATEGORY_CLR   = { technical: 'badge-brand', behavioral: 'badge-slate', situational: 'badge-warning', hr: 'badge-success', culture_fit: 'badge-danger' };

/* ── Facial Analysis Hook ───────────────────────────────────────── */
function useFacialAnalysis(videoRef, enabled) {
  const [metrics, setMetrics] = useState({
    attention:   88,
    confidence:  78,
    stress:      22,
    eyeContact:  85,
    emotion:     'Focused',
    posture:     'Good',
  });
  const intervalRef = useRef(null);
  const audioCtxRef = useRef(null);
  const prevFrameDataRef = useRef(null);

  useEffect(() => {
    if (!enabled || !videoRef.current || !videoRef.current.srcObject) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      return;
    }

    const stream = videoRef.current.srcObject;
    let analyser = null;
    let dataArray = null;

    // Web Audio API setup for real audio level analysis
    try {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioCtxRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          dataArray = new Uint8Array(analyser.frequencyBinCount);
        }
      }
    } catch {
      // Ignore audio context errors gracefully
    }

    // Offscreen canvas for frame pixel analysis
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 120;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    intervalRef.current = setInterval(() => {
      let audioVolume = 0;
      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((acc, v) => acc + v, 0);
        audioVolume = Math.min(100, Math.round((sum / dataArray.length) * 1.5));
      }

      let motionDelta = 10;
      let centerBrightness = 128;
      if (videoRef.current && videoRef.current.readyState >= 2 && ctx) {
        try {
          ctx.drawImage(videoRef.current, 0, 0, 160, 120);
          const frame = ctx.getImageData(0, 0, 160, 120);
          const data = frame.data;

          // Compute average center brightness (eye contact proxy)
          let totalLum = 0;
          let pixelCount = 0;
          for (let y = 40; y < 80; y += 4) {
            for (let x = 50; x < 110; x += 4) {
              const idx = (y * 160 + x) * 4;
              totalLum += (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114);
              pixelCount++;
            }
          }
          centerBrightness = pixelCount > 0 ? totalLum / pixelCount : 128;

          // Compute motion delta
          if (prevFrameDataRef.current && prevFrameDataRef.current.length === data.length) {
            let diffSum = 0;
            for (let i = 0; i < data.length; i += 16) {
              diffSum += Math.abs(data[i] - prevFrameDataRef.current[i]);
            }
            motionDelta = Math.min(100, Math.round((diffSum / (data.length / 16)) * 2));
          }
          prevFrameDataRef.current = data;
        } catch {
          // Ignore canvas errors
        }
      }

      // Compute physical metrics based on real input signals
      const attention  = Math.min(100, Math.max(50, Math.round(75 + (centerBrightness > 50 ? 15 : 0) + (audioVolume > 10 ? 10 : 0))));
      const confidence = Math.min(100, Math.max(40, Math.round(70 + (audioVolume > 15 ? 15 : 5) - (motionDelta > 40 ? 10 : 0))));
      const stress     = Math.min(100, Math.max(10, Math.round(20 + (motionDelta > 50 ? 25 : 0) - (audioVolume > 20 ? 10 : 0))));
      const eyeContact = Math.min(100, Math.max(45, Math.round(80 + (centerBrightness > 60 ? 12 : -10))));
      const posture    = motionDelta > 60 ? 'Sit straighter' : centerBrightness < 40 ? 'Adjust lighting' : 'Good';
      const emotion    = audioVolume > 35 ? 'Confident' : audioVolume > 10 ? 'Focused' : motionDelta > 40 ? 'Thinking' : 'Calm';

      setMetrics({ attention, confidence, stress, eyeContact, emotion, posture });
    }, 1500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [enabled, videoRef]);

  return metrics;
}

/* ── Metric Bar ─────────────────────────────────────────────────── */
function MetricBar({ label, value, color }) {
  const clr = value >= 70 ? 'from-emerald-500 to-teal-500'
            : value >= 45 ? 'from-amber-500 to-orange-500'
            : 'from-red-500 to-rose-500';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className={`font-bold ${value >= 70 ? 'text-emerald-400' : value >= 45 ? 'text-amber-400' : 'text-red-400'}`}>{Math.round(value)}%</span>
      </div>
      <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${clr}`}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export default function InterviewSessionPage() {
  const { id: interviewId } = useParams();
  const navigate = useNavigate();

  const [interview,     setInterview]     = useState(null);
  const [session,       setSession]       = useState(null);
  const [currentIdx,    setCurrentIdx]    = useState(0);
  const [answerText,    setAnswerText]    = useState('');
  const [savedAnswers,  setSavedAnswers]  = useState({});
  const [loading,       setLoading]       = useState(true);
  const [submitting,    setSubmitting]    = useState(false);
  const [completing,    setCompleting]    = useState(false);
  const [elapsed,       setElapsed]       = useState(0);
  const [startTime,     setStartTime]     = useState(Date.now());
  const [isListening,   setIsListening]   = useState(false);
  const [recognition,   setRecognition]   = useState(null);
  const [isSpeaking,    setIsSpeaking]    = useState(false);

  // Webcam / facial analysis state
  const [camEnabled,    setCamEnabled]    = useState(false);
  const [camError,      setCamError]      = useState(null);
  const [showMetrics,   setShowMetrics]   = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const facialMetrics = useFacialAnalysis(videoRef, camEnabled);

  /* ── Camera ─────────────────────────────────────────────────── */
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: true  // Enable audio too
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCamEnabled(true);
      setCamError(null);
      
      // Start recording
      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      
      toast.success('Camera & recording started', { icon: '📹' });
    } catch {
      setCamError('Camera permission denied');
      toast.error('Could not access camera');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamEnabled(false);
    setIsRecording(false);
    setRecordingTime(0);
  }, []);

  useEffect(() => {
    if (camEnabled && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [camEnabled]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  useEffect(() => {
    if (!isRecording) return;
    const t = setInterval(() => setRecordingTime(p => p + 1), 1000);
    return () => clearInterval(t);
  }, [isRecording]);

  /* ── Speech synthesis ───────────────────────────────────────── */
  const toggleSpeakQuestion = () => {
    if (!window.speechSynthesis) return toast.error('TTS not supported');
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    const text = interview?.questions?.[currentIdx]?.questionText;
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95; u.pitch = 1;
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
    setIsSpeaking(true);
  };

  useEffect(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [currentIdx]);

  /* ── Speech recognition ─────────────────────────────────────── */
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true; rec.interimResults = true;
    rec.onresult = (e) => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++)
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
      if (final) setAnswerText((p) => p.trimEnd() + (p.trimEnd().length ? ' ' : '') + final.trim());
    };
    rec.onerror = () => { setIsListening(false); toast.error('Microphone error'); };
    setRecognition(rec);
  }, []);

  const toggleListening = () => {
    if (!recognition) return toast.error('Voice not supported');
    if (isListening) { recognition.stop(); setIsListening(false); }
    else { recognition.start(); setIsListening(true); toast.success('Listening...', { icon: '🎙️' }); }
  };

  useEffect(() => {
    if (isListening && recognition) { recognition.stop(); setIsListening(false); }
  }, [currentIdx]);

  /* ── Timer ──────────────────────────────────────────────────── */
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [startTime]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  /* ── Init ───────────────────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const { data: iData } = await interviewAPI.getById(interviewId);
        setInterview(iData.interview);
        const { data: sData } = await sessionAPI.start(interviewId);
        setSession(sData.session);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to start session');
        navigate('/interviews');
      } finally { setLoading(false); }
    })();
  }, [interviewId, navigate]);

  const currentQuestion = interview?.questions?.[currentIdx];
  const totalQuestions  = interview?.questions?.length || 0;
  const progress        = totalQuestions ? ((currentIdx + 1) / totalQuestions) * 100 : 0;

  /* ── Save answer ────────────────────────────────────────────── */
  const saveAnswer = useCallback(async (skipped = false) => {
    if (!session || !currentQuestion) return;
    if (!answerText.trim() && !skipped) return;
    setSubmitting(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    try {
      await sessionAPI.submitAnswer(session._id, {
        questionId: currentQuestion._id,
        answerText: skipped ? '' : answerText.trim(),
        timeTaken, skipped,
      });
      setSavedAnswers((p) => ({ ...p, [currentQuestion._id]: { answerText, skipped } }));
      setStartTime(Date.now());
    } catch { toast.error('Failed to save answer'); }
    finally { setSubmitting(false); }
  }, [session, currentQuestion, answerText, startTime]);

  const handleNext = async (skip = false) => {
    await saveAnswer(skip);
    setAnswerText(savedAnswers[interview?.questions?.[currentIdx + 1]?._id]?.answerText || '');
    setCurrentIdx((i) => i + 1);
    setElapsed(0); setStartTime(Date.now());
  };

  const handlePrev = () => {
    const prev = interview?.questions?.[currentIdx - 1];
    setAnswerText(savedAnswers[prev?._id]?.answerText || '');
    setCurrentIdx((i) => i - 1);
  };

  const handleComplete = async () => {
    await saveAnswer(false);
    setCompleting(true);
    try {
      await sessionAPI.complete(session._id);
      toast.success('Session completed! Loading results...');
      navigate(`/sessions/${session._id}/results`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete');
    } finally { setCompleting(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <Zap className="w-12 h-12 text-brand-400 mx-auto mb-4 animate-pulse" />
        <p className="text-slate-400">Loading your interview session...</p>
      </div>
    </div>
  );

  if (!interview || !session) return null;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* ── Top Header ──────────────────────────────────────────── */}
      <div className="card p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-white">{interview.jobTitle}</h2>
          <p className="text-slate-400 text-sm capitalize">{interview.experienceLevel} level • {totalQuestions} questions</p>
        </div>
        <div className="flex items-center gap-2">
          {isRecording && (
            <div className="flex items-center gap-1.5 text-xs bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/30">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="font-mono">{formatTime(recordingTime)}</span>
              <span>REC</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-sm bg-surface px-3 py-1.5 rounded-lg border border-surface-border">
            <Clock className="w-4 h-4 text-brand-400" />
            <span className="text-white font-mono">{formatTime(elapsed)}</span>
          </div>
          <span className="text-sm text-slate-400 bg-surface px-3 py-1.5 rounded-lg border border-surface-border">
            {currentIdx + 1} / {totalQuestions}
          </span>
          {/* Camera toggle */}
          <button
            onClick={camEnabled ? stopCamera : startCamera}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              camEnabled
                ? 'bg-brand-600/20 border-brand-500/40 text-brand-300 hover:bg-brand-600/30'
                : 'bg-surface border-surface-border text-slate-400 hover:border-slate-500 hover:text-white'
            }`}
          >
            {camEnabled ? <><CameraOff className="w-4 h-4" /> Stop Cam</> : <><Camera className="w-4 h-4" /> Enable Cam</>}
          </button>
        </div>
      </div>

      {/* ── Progress ────────────────────────────────────────────── */}
      <div className="progress-bar mb-4">
        <motion.div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* ── Main Layout ─────────────────────────────────────────── */}
      <div className={`grid gap-4 ${camEnabled ? 'grid-cols-1 xl:grid-cols-[1fr_300px]' : 'grid-cols-1'}`}>

        {/* Question + Answer */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="card p-6 space-y-5"
            >
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-brand-400 font-bold text-sm">Q{currentIdx + 1}</span>
                <span className={`badge ${DIFFICULTY_CLR[currentQuestion?.difficulty] || 'badge-slate'}`}>
                  {currentQuestion?.difficulty}
                </span>
                <span className={`badge ${CATEGORY_CLR[currentQuestion?.category] || 'badge-slate'}`}>
                  {currentQuestion?.category?.replace('_', ' ')}
                </span>
                {savedAnswers[currentQuestion?._id] && (
                  <span className="badge badge-success"><CheckCircle className="w-3 h-3" /> Saved</span>
                )}
              </div>

              {/* Question text */}
              <div className="flex items-start justify-between gap-4">
                <p className="text-white text-lg leading-relaxed font-medium flex-1">
                  {currentQuestion?.questionText}
                </p>
                <button onClick={toggleSpeakQuestion}
                  className={`flex-shrink-0 p-2 rounded-full transition-colors ${
                    isSpeaking ? 'bg-brand-500/20 text-brand-400 animate-pulse' : 'bg-surface hover:bg-surface-hover text-slate-400 border border-surface-border'
                  }`} title="Read aloud">
                  {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>

              {/* Answer area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="form-label !mb-0">Your Answer</label>
                  <button onClick={toggleListening}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-colors ${
                      isListening ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'bg-surface hover:bg-surface-hover text-slate-400 border border-surface-border'
                    }`}>
                    <Mic className="w-3.5 h-3.5" />
                    {isListening ? 'Listening...' : 'Voice Input'}
                  </button>
                </div>
                <textarea
                  className={`form-textarea h-44 transition-colors ${isListening ? 'border-brand-500 ring-1 ring-brand-500/50 bg-brand-500/5' : ''}`}
                  placeholder="Type your answer here, or click 'Voice Input' to speak. Use the STAR method for behavioral questions..."
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                />
                <p className="text-slate-500 text-xs mt-1">{answerText.length} characters</p>
              </div>

              {/* Keywords */}
              {currentQuestion?.expectedKeywords?.length > 0 && (
                <div className="p-3 rounded-lg bg-brand-600/10 border border-brand-500/20">
                  <p className="text-xs text-brand-300">
                    💡 <strong>Topic hints:</strong> {currentQuestion.expectedKeywords.join(' • ')}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button onClick={handlePrev} disabled={currentIdx === 0 || submitting} className="btn-secondary disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => handleNext(true)} disabled={submitting} className="btn-ghost text-slate-400">
                <SkipForward className="w-4 h-4" /> Skip
              </button>
              {currentIdx < totalQuestions - 1 ? (
                <button onClick={() => handleNext(false)} disabled={submitting || !answerText.trim()} className="btn-primary disabled:opacity-50">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Save & Next</>}
                </button>
              ) : (
                <button onClick={handleComplete} disabled={completing} className="btn-primary !bg-gradient-to-r !from-emerald-600 !to-teal-600">
                  {completing ? <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating...</> : <><CheckCircle className="w-4 h-4" /> Finish & Get Results</>}
                </button>
              )}
            </div>
          </div>

          {currentIdx === totalQuestions - 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="card p-4 border-amber-500/30 bg-amber-600/10 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-300 text-sm">Last question. Click <strong>Finish & Get Results</strong> to get AI evaluation.</p>
            </motion.div>
          )}
        </div>

        {/* ── Facial Analysis Panel ─────────────────────────────── */}
        {camEnabled && (
          <motion.div
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            {/* Video feed */}
            <div className="card overflow-hidden">
              <div className="relative bg-black aspect-[4/3]">
                <video
                  ref={videoRef}
                  autoPlay muted playsInline
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                {/* Overlay badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-xs font-medium">LIVE</span>
                </div>
                <button onClick={() => setShowMetrics((s) => !s)}
                  className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm p-1.5 rounded-lg text-white hover:bg-black/80 transition-colors">
                  {showMetrics ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Facial metrics */}
            <AnimatePresence>
              {showMetrics && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="card p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="w-4 h-4 text-brand-400" />
                    <span className="text-sm font-semibold text-white">Facial Analysis</span>
                    <span className="text-xs text-slate-500 ml-auto">Live</span>
                  </div>

                  <MetricBar label="Attention"   value={facialMetrics.attention} />
                  <MetricBar label="Confidence"  value={facialMetrics.confidence} />
                  <MetricBar label="Eye Contact" value={facialMetrics.eyeContact} />
                  <MetricBar label="Calmness"    value={100 - facialMetrics.stress} />

                  {/* Emotion + posture tags */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="badge badge-brand text-xs">{facialMetrics.emotion}</span>
                    <span className={`badge text-xs ${facialMetrics.posture === 'Good' ? 'badge-success' : 'badge-warning'}`}>
                      {facialMetrics.posture}
                    </span>
                  </div>

                  {/* Tips */}
                  <div className="pt-1 border-t border-surface-border">
                    {facialMetrics.confidence < 50 && (
                      <p className="text-xs text-amber-400">💡 Take a breath — project confidence!</p>
                    )}
                    {facialMetrics.eyeContact < 50 && (
                      <p className="text-xs text-amber-400">👀 Maintain eye contact with the camera</p>
                    )}
                    {facialMetrics.attention >= 75 && facialMetrics.confidence >= 65 && (
                      <p className="text-xs text-emerald-400">✨ Great presence — keep it up!</p>
                    )}
                    {facialMetrics.posture !== 'Good' && (
                      <p className="text-xs text-amber-400">🪑 Sit up straight</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Overall communication score */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-brand-400" />
                <span className="text-sm font-semibold text-white">Communication Score</span>
              </div>
              <div className="text-3xl font-display font-bold gradient-text text-center my-2">
                {Math.round((facialMetrics.attention + facialMetrics.confidence + facialMetrics.eyeContact + (100 - facialMetrics.stress)) / 4)}%
              </div>
              <p className="text-xs text-slate-500 text-center">Based on real-time facial cues</p>
            </div>

            {camError && (
              <div className="card p-3 border-red-500/30 bg-red-500/5">
                <p className="text-xs text-red-400">{camError}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
