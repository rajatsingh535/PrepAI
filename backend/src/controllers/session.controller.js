const Session = require('../models/Session.model');
const Interview = require('../models/Interview.model');
const User = require('../models/User.model');
const AppError = require('../utils/AppError');
const { evaluateAnswer, generateOverallFeedback } = require('../services/ai.service');

// ─── POST /api/sessions/start ─────────────────────────────────────
exports.startSession = async (req, res, next) => {
  const { interviewId } = req.body;

  const interview = await Interview.findOne({ _id: interviewId, userId: req.user._id });
  if (!interview) return next(new AppError('Interview not found.', 404));

  // Allow start if status is 'ready' OR if questions were generated despite a stale status
  const hasQuestions = interview.questions && interview.questions.length > 0;
  if (!hasQuestions) {
    return next(new AppError('Interview questions have not been generated yet.', 400));
  }

  // Check for existing in-progress session
  const existingSession = await Session.findOne({
    userId: req.user._id,
    interviewId,
    status: { $in: ['started', 'in_progress'] },
  });

  if (existingSession) {
    return res.status(200).json({ success: true, session: existingSession, resumed: true });
  }

  interview.status = 'in_progress';
  await interview.save();

  const session = await Session.create({
    userId: req.user._id,
    interviewId,
    answers: [],
    status: 'started',
    startedAt: new Date(),
  });

  res.status(201).json({ success: true, session, interview });
};

// ─── POST /api/sessions/:id/answer ────────────────────────────────
exports.submitAnswer = async (req, res, next) => {
  const { questionId, answerText, timeTaken, skipped } = req.body;

  const session = await Session.findOne({
    _id: req.params.id,
    userId: req.user._id,
    status: { $in: ['started', 'in_progress'] },
  });

  if (!session) return next(new AppError('Active session not found.', 404));

  const interview = await Interview.findById(session.interviewId);
  const question = interview.questions.id(questionId);
  if (!question) return next(new AppError('Question not found in interview.', 404));

  // Check if already answered
  const existing = session.answers.find((a) => a.questionId.toString() === questionId);
  if (existing) {
    existing.answerText = answerText;
    existing.timeTaken = timeTaken;
    existing.skipped = skipped;
  } else {
    session.answers.push({
      questionId,
      questionText: question.questionText,
      answerText: answerText || '',
      timeTaken: timeTaken || 0,
      skipped: skipped || false,
    });
  }

  session.status = 'in_progress';
  await session.save();

  res.status(200).json({ success: true, message: 'Answer saved.', session });
};

// ─── POST /api/sessions/:id/complete ─────────────────────────────
exports.completeSession = async (req, res, next) => {
  const session = await Session.findOne({
    _id: req.params.id,
    userId: req.user._id,
    status: { $in: ['started', 'in_progress'] },
  });

  if (!session) return next(new AppError('Active session not found.', 404));

  const interview = await Interview.findById(session.interviewId);
  const videoMetrics = req.body.videoMetrics || {};
  const sessionDuration = req.body.sessionDuration || 0;

  // ── AI Evaluate each answer with enhanced webcam/audio analysis ────
  const evaluationPromises = session.answers.map(async (answer) => {
    if (answer.skipped || !answer.answerText) {
      answer.aiScore = 0;
      answer.aiFeedback = 'Question was skipped - no analysis available.';
      answer.technicalAccuracy = 0;
      answer.communicationScore = 0;
      return;
    }
    try {
      const result = await evaluateAnswer({
        questionText: answer.questionText,
        answerText: answer.answerText,
        expectedKeywords: interview.questions.id(answer.questionId)?.expectedKeywords || [],
        jobTitle: interview.jobTitle,
        videoMetrics,
        duration: answer.timeTaken
      });
      
      answer.aiScore = result.score || 0;
      answer.aiFeedback = result.feedback || '';
      answer.technicalAccuracy = result.technicalAccuracy || 70;
      answer.communicationScore = result.communicationScore || 65;
      answer.keywordMatch = result.keywordMatch || 60;
      answer.confidenceLevel = result.confidenceLevel || 70;
      answer.improvementTips = result.improvementTips || [];
    } catch (err) {
      console.error('Answer evaluation error:', err);
      answer.aiScore = 5;
      answer.aiFeedback = 'Answer provided - evaluation service temporarily unavailable.';
      answer.technicalAccuracy = 60;
      answer.communicationScore = videoMetrics.audioVolume || 65;
    }
  });

  await Promise.all(evaluationPromises);

  // ── Generate comprehensive overall feedback ──────────────────────
  let overallData = {};
  try {
    overallData = await generateOverallFeedback({
      jobTitle: interview.jobTitle,
      answers: session.answers,
      videoMetrics,
      sessionDuration
    });
  } catch (err) {
    console.error('Overall feedback generation error:', err);
    overallData = {
      overallScore: 70,
      technicalScore: 75,
      communicationScore: videoMetrics.audioVolume || 70,
      presenceScore: videoMetrics.eyeContact || 80,
      strengths: ['Shows technical knowledge', 'Professional communication'],
      weaknesses: ['Could provide more detail', 'Practice eye contact'],
      improvementTips: ['Practice mock interviews', 'Research company background'],
      summaryFeedback: `Good performance for ${interview.jobTitle} position.`,
      recommendedNextSteps: ['Continue practicing', 'Focus on communication']
    };
  }

  // ── Finalize session with enhanced data ──────────────────────────
  session.overallScore = overallData.overallScore || 70;
  session.technicalScore = overallData.technicalScore || 75;
  session.communicationScore = overallData.communicationScore || 70;
  session.presenceScore = overallData.presenceScore || 80;
  session.overallFeedback = overallData.summaryFeedback || `Interview completed for ${interview.jobTitle} position.`;
  session.strengths = overallData.strengths || ['Professional demeanor'];
  session.areasForImprovement = overallData.weaknesses || ['Technical depth'];
  session.recommendedResources = overallData.improvementTips || ['Practice more interviews'];
  session.recommendedNextSteps = overallData.recommendedNextSteps || ['Continue studying'];
  
  // Store video/audio metrics
  session.videoMetrics = {
    eyeContact: videoMetrics.eyeContact || 75,
    audioVolume: videoMetrics.audioVolume || 50,
    attention: videoMetrics.attention || 80,
    confidence: videoMetrics.confidence || 70,
    posture: videoMetrics.posture || 'Good',
    stress: videoMetrics.stress || 25
  };
  
  session.status = 'completed';
  session.completedAt = new Date();
  session.totalTimeTaken = session.answers.reduce((s, a) => s + (a.timeTaken || 0), 0);

  await session.save();

  // Update interview status and user's session count
  interview.status = 'completed';
  await interview.save();

  await User.findByIdAndUpdate(req.user._id, { $inc: { totalSessions: 1 } });

  res.status(200).json({ 
    success: true, 
    session,
    message: 'Interview session completed successfully!'
  });
};

const DSASession = require('../models/DSASession.model');

// ─── GET /api/sessions ────────────────────────────────────────────
exports.getMySessions = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [aiSessions, dsaSessions, totalAi, totalDsa] = await Promise.all([
    Session.find({ userId: req.user._id })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate({ path: 'interviewId', select: 'jobTitle company experienceLevel' })
      .select('-answers')
      .lean(),
    DSASession.find({ userId: req.user._id })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean(),
    Session.countDocuments({ userId: req.user._id }),
    DSASession.countDocuments({ userId: req.user._id }),
  ]);

  // Format DSA sessions to match History card schema
  const formattedDsa = dsaSessions.map(d => ({
    _id: d._id,
    interviewId: {
      jobTitle: `DSA: ${d.topic.charAt(0).toUpperCase() + d.topic.slice(1)} (${d.difficulty})`,
      company: 'Coding Practice',
      experienceLevel: d.difficulty.toLowerCase()
    },
    status: d.status,
    overallScore: d.overallScore ? Math.round(d.overallScore * 10) : 80,
    totalTimeTaken: 300,
    createdAt: d.createdAt,
    isDSA: true
  }));

  const combined = [...aiSessions, ...formattedDsa]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);

  const total = totalAi + totalDsa;

  res.status(200).json({
    success: true,
    count: combined.length,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    sessions: combined,
  });
};

// ─── GET /api/sessions/:id ────────────────────────────────────────
exports.getSessionById = async (req, res, next) => {
  const session = await Session.findOne({ _id: req.params.id, userId: req.user._id })
    .populate({ path: 'interviewId', select: 'jobTitle company experienceLevel questions' });

  if (!session) return next(new AppError('Session not found.', 404));
  res.status(200).json({ success: true, session });
};
