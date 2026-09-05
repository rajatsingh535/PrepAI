const mongoose = require('mongoose');

const dsaProblemSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  slug:        { type: String },
  topic:       { type: String, required: true },
  difficulty:  { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  description: { type: String, required: true },
  testCases:   [{ input: String, expected: String }],
  hints:       [String],
  starterCode: { type: mongoose.Schema.Types.Mixed },
  expectedComplexity: { time: String, space: String },
  userCode:    { type: String, default: '' },
  bruteForceExplanation: { type: String, default: '' },
  optimalExplanation:    { type: String, default: '' },
}, { _id: true });

const dsaEvaluationSchema = new mongoose.Schema({
  problemIndex: { type: Number },
  score:        { type: Number, min: 0, max: 10 },
  verdict:      { type: String },
  technicalEvaluation: {
    bruteForceExplained:     { type: Boolean, default: false },
    optimalApproachExplained: { type: Boolean, default: false },
    correctnessScore:         { type: Number, min: 0, max: 100 },
    timeComplexity:           { type: String },
    spaceComplexity:          { type: String },
    edgeCasesHandled:         { type: Boolean, default: false },
    codeQuality:              { type: String },
  },
  communicationEvaluation: {
    clarityScore:         { type: Number, min: 0, max: 100 },
    paceAndConfidence:    { type: String },
    fillerWordsCount:     { type: Number, default: 0 },
    eyeContactVideoScore: { type: Number, min: 0, max: 100 },
  },
  actionableAdvice: [String],
}, { _id: false });

const dsaSessionSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  topic:        { type: String, required: true },
  difficulty:   { type: String, enum: ['Easy', 'Medium', 'Hard', 'Mixed'], default: 'Medium' },
  language:     { type: String, default: 'python' },
  problems:     [dsaProblemSchema],
  evaluations:  [dsaEvaluationSchema],
  overallScore: { type: Number, default: 0 },
  status:       { type: String, enum: ['started', 'in_progress', 'completed'], default: 'started' },
  startedAt:    { type: Date, default: Date.now },
  completedAt:  { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('DSASession', dsaSessionSchema);
