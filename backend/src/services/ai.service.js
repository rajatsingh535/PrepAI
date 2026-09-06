const nvidia = require('../config/nvidia');
const NVIDIA_MODEL = nvidia.DEFAULT_MODEL;
const { extractContextViaRAG, buildSemanticChunks, createAndStoreEmbeddings, retrieveContextForTopic } = require('./rag.service');
const { optimizeQuery } = require('./optimizer.service');
const SystemPrompt = require('../models/SystemPrompt.model');

const parseAIJSON = (content) => {
  if (!content) return {};
  let cleaned = content.trim();
  cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/gi, '');
  const match = cleaned.match(/({[\s\S]*}|\[[\s\S]*\])/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {}
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    return {};
  }
};

const getActivePrompt = async (category, defaultVal) => {
  try {
    const promptDoc = await SystemPrompt.findOne({ category });
    return promptDoc ? promptDoc.content : defaultVal;
  } catch {
    return defaultVal;
  }
};

const formatPrompt = (template, vars) => {
  return template.replace(/\$\{(\w+)\}/g, (match, key) => {
    return vars[key] !== undefined ? vars[key] : match;
  });
};

/**
 * Generate interview questions using Groq LLM (llama-3.3-70b-versatile)
 * @param {Object} params
 * @param {string} params.jobTitle
 * @param {string} params.jobDescription
 * @param {string} params.experienceLevel
 * @param {string[]} params.questionTypes
 * @param {number} params.numberOfQuestions
 * @param {string|null} params.resumeText
 * @returns {Promise<Array>} Array of question objects
 */
const generateInterviewQuestions = async ({
  jobTitle,
  jobDescription,
  experienceLevel,
  numberOfQuestions = 10,
  questionTypes = ['technical', 'behavioral'],
  resumeText = null,
}) => {
  try {
    const optimizedContext = await extractContextViaRAG(resumeText, jobDescription);

    // Distribute questions: ~2/3 technical, ~1/3 behavioral (min 1 each)
    const technicalCount = Math.max(1, Math.round((numberOfQuestions * 2) / 3));
    const behavioralCount = Math.max(1, numberOfQuestions - technicalCount);

    const systemPrompt = `You are an expert technical interviewer and HR specialist.
You create precise, challenging, and role-relevant interview questions based on the provided context.
STRICT RULE: Base questions on the provided context. If context is minimal, generate relevant questions for the job title and experience level.
Always respond with valid JSON only — no extra text, no markdown fences.`;

    const userPrompt = `Generate interview questions for:

Job Title: ${jobTitle}
Experience Level: ${experienceLevel}
Job Description: ${jobDescription || 'General role'}

${optimizedContext ? `Context from candidate resume:\n${optimizedContext}\n` : ''}

Generate:
- ${technicalCount} technical questions (testing practical skills, problem-solving, and domain knowledge)
- ${behavioralCount} behavioral questions (using STAR method format)

Requirements:
- Questions must be relevant to ${jobTitle} at ${experienceLevel} level
- Technical questions should test real-world problem solving and best practices
- Behavioral questions should assess soft skills, teamwork, and leadership
- Each question should have 3-5 expected keywords
- Difficulty should match the experience level

Return structured JSON exactly in this format:
{
  "technical": [
    {
      "questionText": "Clear, specific technical question",
      "difficulty": "easy|medium|hard",
      "expectedKeywords": ["keyword1", "keyword2", "keyword3"]
    }
  ],
  "behavioral": [
    {
      "questionText": "STAR method behavioral question",
      "difficulty": "easy|medium|hard",
      "expectedKeywords": ["teamwork", "leadership", "problem-solving"]
    }
  ]
}`;

    const response = await nvidia.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI model.');

    let parsed = parseAIJSON(content);

    let technicalQs = Array.isArray(parsed.technical) ? parsed.technical : (Array.isArray(parsed.technicalQuestions) ? parsed.technicalQuestions : []);
    let behavioralQs = Array.isArray(parsed.behavioral) ? parsed.behavioral : (Array.isArray(parsed.behavioralQuestions) ? parsed.behavioralQuestions : []);
    
    // Fallback parsing
    if (!technicalQs.length && !behavioralQs.length && Array.isArray(parsed.questions)) {
      parsed.questions.forEach((q, idx) => {
        if (typeof q === 'string') {
          if (idx % 2 === 0) technicalQs.push({ questionText: q, difficulty: 'medium', expectedKeywords: [jobTitle, 'problem solving'] });
          else behavioralQs.push({ questionText: q, difficulty: 'medium', expectedKeywords: ['communication', 'teamwork'] });
        } else if (typeof q === 'object') {
          if (q.category === 'behavioral' || q.type === 'behavioral') behavioralQs.push(q);
          else technicalQs.push(q);
        }
      });
    }

    // Flatten and map to MongoDB question schema format
    const allQuestions = [];
    
    technicalQs.forEach(q => {
      const text = typeof q === 'string' ? q : (q.questionText || q.question || '');
      if (text) {
        allQuestions.push({
          questionText: text,
          category: 'technical',
          difficulty: q.difficulty || 'medium',
          expectedKeywords: Array.isArray(q.expectedKeywords) ? q.expectedKeywords : [jobTitle, 'technical skills'],
        });
      }
    });

    behavioralQs.forEach(q => {
      const text = typeof q === 'string' ? q : (q.questionText || q.question || '');
      if (text) {
        allQuestions.push({
          questionText: text,
          category: 'behavioral',
          difficulty: q.difficulty || 'medium',
          expectedKeywords: Array.isArray(q.expectedKeywords) ? q.expectedKeywords : ['teamwork', 'leadership', 'communication'],
        });
      }
    });

    // Enhanced fallback questions if AI output was empty or insufficient
    if (allQuestions.length < numberOfQuestions) {
      const fallbackTechnical = [
        { questionText: `Explain your experience with ${jobTitle} development and the key technologies you've worked with.`, category: 'technical', difficulty: 'medium', expectedKeywords: [jobTitle, 'experience', 'technology'] },
        { questionText: `Describe a challenging ${jobTitle} project you worked on. What was your approach and how did you solve it?`, category: 'technical', difficulty: 'medium', expectedKeywords: ['problem solving', 'project', 'approach'] },
        { questionText: `What are the most important best practices for ${jobTitle} in your opinion, and why?`, category: 'technical', difficulty: 'medium', expectedKeywords: ['best practices', 'standards', 'quality'] },
      ];
      
      const fallbackBehavioral = [
        { questionText: `Tell me about a time when you had to work under a tight deadline. How did you handle it?`, category: 'behavioral', difficulty: 'medium', expectedKeywords: ['STAR method', 'deadline', 'time management'] },
        { questionText: `Describe a situation where you had to collaborate with a difficult team member. What was the outcome?`, category: 'behavioral', difficulty: 'medium', expectedKeywords: ['teamwork', 'collaboration', 'conflict resolution'] },
      ];

      const needed = numberOfQuestions - allQuestions.length;
      const fallbackPool = [...fallbackTechnical, ...fallbackBehavioral].slice(0, needed);
      allQuestions.push(...fallbackPool);
    }

    // Safety slice: ensure we never return more than the requested number of questions
    const trimmed = allQuestions.slice(0, numberOfQuestions);
    
    if (trimmed.length === 0) {
      throw new Error('Failed to generate any questions. Please try again.');
    }
    
    return trimmed.map((q, i) => ({ ...q, order: i + 1 }));
  } catch (error) {
    console.error('Error in generateInterviewQuestions:', error);
    throw new Error(`Question generation error: ${error.message}`);
  }
};

/**
 * Evaluate a candidate's answer using Groq with enhanced webcam/audio analysis
 */
const evaluateAnswer = async ({ questionText, answerText, expectedKeywords, jobTitle, videoMetrics, duration }) => {
  const defaultPrompt = `You are a professional technical interviewer with expertise in evaluating candidates.

INTERVIEW CONTEXT:
Job Title: \${jobTitle}
Question: \${questionText}
Expected Keywords: \${expectedKeywordsText}
Candidate's Answer: \${answerText}
Answer Duration: \${duration || 'N/A'} seconds

REAL-TIME WEBCAM & AUDIO ANALYSIS:
- Eye Contact Score: \${videoMetrics?.eyeContact || 75}% (camera-based facial tracking)
- Voice Clarity/Volume: \${videoMetrics?.audioVolume || 50}% (Web Audio API analysis)  
- Speaking Confidence: \${videoMetrics?.confidence || 70}% (audio pitch + volume patterns)
- Facial Attention: \${videoMetrics?.attention || 80}% (face detection + eye tracking)
- Posture Assessment: \${videoMetrics?.posture || 'Good'} (motion analysis)
- Stress Indicators: \${videoMetrics?.stress || 20}% (micro-movement detection)

EVALUATION INSTRUCTIONS:
1. Analyze the answer's technical accuracy and completeness
2. Check for presence of expected keywords and concepts
3. Evaluate communication clarity based on audio metrics
4. Factor in webcam-based confidence and engagement metrics
5. Provide constructive, actionable feedback

Return valid JSON exactly in this format:
{
  "score": <number 1-10>,
  "feedback": "<detailed evaluation covering technical accuracy, communication quality, and areas for improvement>",
  "keywordMatch": <number 0-100>,
  "technicalAccuracy": <number 0-100>,
  "communicationScore": <number 0-100>,
  "confidenceLevel": <number 0-100>,
  "improvementTips": ["tip 1", "tip 2", "tip 3"]
}`;

  const rawTemplate = await getActivePrompt('interview_evaluator', defaultPrompt);
  const prompt = formatPrompt(rawTemplate, {
    jobTitle,
    questionText,
    expectedKeywordsText: expectedKeywords.join(', '),
    answerText: answerText || '(No answer provided - candidate remained silent)',
    duration: duration || 0,
    videoMetrics: videoMetrics || {}
  });

  try {
    const response = await nvidia.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    const evaluation = parseAIJSON(content);
    
    // Ensure all required fields are present
    return {
      score: evaluation.score || 5,
      feedback: evaluation.feedback || 'Answer provided shows understanding of the topic.',
      keywordMatch: evaluation.keywordMatch || 60,
      technicalAccuracy: evaluation.technicalAccuracy || 70,
      communicationScore: evaluation.communicationScore || videoMetrics?.audioVolume || 65,
      confidenceLevel: evaluation.confidenceLevel || videoMetrics?.confidence || 70,
      improvementTips: evaluation.improvementTips || ['Practice explaining concepts clearly', 'Use more specific examples']
    };
  } catch (error) {
    console.error('Groq evaluation error:', error);
    
    // Fallback evaluation based on video/audio metrics
    return {
      score: 6,
      feedback: `Answer provided for ${questionText}. Consider elaborating with specific examples and technical details.`,
      keywordMatch: 60,
      technicalAccuracy: 70,
      communicationScore: videoMetrics?.audioVolume || 65,
      confidenceLevel: videoMetrics?.confidence || 70,
      improvementTips: ['Speak more clearly', 'Maintain better eye contact', 'Provide more detailed explanations']
    };
  }
};

/**
 * Generate overall session feedback with detailed webcam/audio analysis
 */
const generateOverallFeedback = async ({ jobTitle, answers, videoMetrics, sessionDuration }) => {
  const summary = answers
    .map((a, i) => `Q${i + 1}: ${a.questionText}\nScore: ${a.aiScore}/10\nAnswer: ${a.answerText?.slice(0, 150)}...`)
    .join('\n\n');

  const videoSummary = videoMetrics ? `
COMPREHENSIVE WEBCAM & AUDIO ANALYSIS:
- Average Eye Contact: ${videoMetrics.eyeContact || 85}% (camera-based facial tracking)
- Voice Clarity Level: ${videoMetrics.audioVolume || 50}% (Web Audio API frequency analysis)
- Facial Attention Score: ${videoMetrics.attention || 88}% (face detection algorithms)
- Posture Quality: ${videoMetrics.posture || 'Good'} (motion delta analysis)
- Confidence Indicators: ${videoMetrics.confidence || 75}% (voice patterns + facial cues)
- Stress Levels: ${videoMetrics.stress || 20}% (micro-movement detection)
- Speaking Time: ${videoMetrics.speakingTime || 60}% of total session
- Silence Periods: ${videoMetrics.silenceTime || 40}% of total session
` : 'Video/Audio Analysis: Standard metrics (no webcam/mic detected)';

  const defaultPrompt = `You are a senior technical interviewer providing comprehensive interview feedback.

INTERVIEW SESSION ANALYSIS:
Job Title: \${jobTitle}
Total Duration: \${sessionDuration || 'N/A'} minutes
Interview Performance Summary:
\${summary}

\${videoSummary}

EVALUATION REQUIREMENTS:
1. Provide an overall score (1-100) based on technical accuracy + communication quality
2. Identify 3 key strengths from both answers and physical presentation
3. Highlight 3 areas for improvement (technical knowledge, communication, presence)
4. Give 3 specific, actionable improvement tips
5. Factor in webcam/audio metrics for communication assessment

Respond with valid JSON exactly in this format:
{
  "overallScore": <number 1-100>,
  "technicalScore": <number 1-100>,
  "communicationScore": <number 1-100>,
  "presenceScore": <number 1-100>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["area 1", "area 2", "area 3"],
  "improvementTips": ["actionable tip 1", "actionable tip 2", "actionable tip 3"],
  "summaryFeedback": "<2-3 sentences overall assessment>",
  "recommendedNextSteps": ["next step 1", "next step 2"]
}`;

  const rawTemplate = await getActivePrompt('feedback_report', defaultPrompt);
  const prompt = formatPrompt(rawTemplate, { 
    jobTitle, 
    summary, 
    videoSummary,
    sessionDuration: sessionDuration || 'Unknown'
  });

  try {
    const response = await nvidia.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 1536,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    const feedback = parseAIJSON(content);
    
    return {
      overallScore: feedback.overallScore || 70,
      technicalScore: feedback.technicalScore || 75,
      communicationScore: feedback.communicationScore || videoMetrics?.audioVolume || 70,
      presenceScore: feedback.presenceScore || videoMetrics?.eyeContact || 80,
      strengths: feedback.strengths || ['Shows technical knowledge', 'Communicates clearly', 'Professional demeanor'],
      weaknesses: feedback.weaknesses || ['Could elaborate more', 'Practice eye contact', 'Speak with more confidence'],
      improvementTips: feedback.improvementTips || ['Practice STAR method', 'Research company background', 'Mock interview practice'],
      summaryFeedback: feedback.summaryFeedback || `Good performance for ${jobTitle} position with room for improvement in technical depth and communication.`,
      recommendedNextSteps: feedback.recommendedNextSteps || ['Practice more technical questions', 'Work on presentation skills']
    };
  } catch (error) {
    console.error('Groq feedback generation error:', error);
    
    return {
      overallScore: 70,
      technicalScore: 75,
      communicationScore: videoMetrics?.audioVolume || 70,
      presenceScore: videoMetrics?.eyeContact || 80,
      strengths: ['Professional communication', 'Technical understanding', 'Good engagement'],
      weaknesses: ['Could provide more examples', 'Maintain better eye contact', 'Speak more confidently'],
      improvementTips: ['Practice with mock interviews', 'Research role-specific topics', 'Work on presentation skills'],
      summaryFeedback: `Solid interview performance for ${jobTitle}. Continue practicing to build confidence and technical depth.`,
      recommendedNextSteps: ['Review technical concepts', 'Practice behavioral questions']
    };
  }
};

/**
 * Parse Resume & Job Description into structured JSON
 * @param {string} resumeText - Raw extracted resume text
 * @param {string} jdText     - Job description text
 * @returns {Promise<Object>} Structured { resume, jobDescription } object
 */
const parseResumeAndJD = async (resumeText, jdText) => {
  const defaultPrompt = `You are an expert resume and job description parser.

Extract structured data in strict JSON format.

From Resume:
- name
- skills (array)
- experience (array of objects: role, company, duration, tech)
- projects (array: title, tech stack, description)
- education

From Job Description:
- role
- required_skills (array)
- preferred_skills (array)
- responsibilities (array)

Rules:
- Do not hallucinate
- If missing, return empty array or null
- Keep output strictly JSON`;

  const systemPrompt = await getActivePrompt('resume_parser', defaultPrompt);

  const userPrompt = `Input:
RESUME:
${resumeText || 'Not provided'}

JOB_DESCRIPTION:
${jdText || 'Not provided'}`;

  const response = await nvidia.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.2,
    max_tokens: 2048,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No response from AI parser.');

  try {
    return JSON.parse(content);
  } catch {
    throw new Error('AI parser returned invalid JSON.');
  }
};

/**
 * Generate specialized technical questions using RAG context
 * @param {Object} params
 * @param {string} params.retrievedChunks - Raw context from RAG
 * @param {Object} params.parsedResumeData - Structured resume JSON
 * @param {Object} params.parsedJdData - Structured job description JSON
 * @returns {Promise<string>} Numbered list of questions
 */
const generateSeniorTechnicalQuestions = async ({
  retrievedChunks,
  parsedResumeData,
  parsedJdData,
}) => {
  const systemPrompt = `You are a senior technical interviewer.

Generate interview questions using ONLY the provided context.

Rules:
- Do NOT use outside knowledge
- Questions must map directly to skills/projects in context
- Avoid generic questions
- Cover:
  - Core skills
  - Project-based questions
  - Problem-solving
- Difficulty: mixed (easy → hard)
- Max 5 questions`;

  const userPrompt = `Context:
${retrievedChunks}

Candidate Profile:
${JSON.stringify(parsedResumeData, null, 2)}

Job Requirements:
${JSON.stringify(parsedJdData, null, 2)}

Output:
Numbered list of questions.`;

  const response = await nvidia.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.6,
    max_tokens: 1024,
  });

  return response.choices[0]?.message?.content?.trim() || 'Failed to generate questions.';
};

/**
 * Strict technical evaluation of a candidate's answer using RAG context
 * @param {Object} params
 * @param {string} params.retrievedChunks - Raw context from RAG
 * @param {string} params.question - The question being answered
 * @param {string} params.answer - The candidate's answer
 * @returns {Promise<Object>} Evaluation JSON
 */
const evaluateStrictAnswer = async ({ retrievedChunks, question, answer }) => {
  const systemPrompt = `You are a strict technical interviewer.

Evaluate the candidate's answer using ONLY the given context.

Rules:
- Be strict, not generous
- Tie feedback directly to expected concepts in context
- No generic statements
- Penalize vague answers
- Always return valid JSON`;

  const userPrompt = `Context:
${retrievedChunks}

Question:
${question}

Candidate Answer:
${answer}

Return JSON exactly as:
{
  "score": (0-10),
  "correctness": "low | medium | high",
  "strengths": [],
  "weaknesses": [],
  "missed_concepts": [],
  "improvement_suggestions": []
}`;

  const response = await nvidia.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.2,
    max_tokens: 1024,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  try {
    return JSON.parse(content || '{}');
  } catch {
    throw new Error('AI evaluation returned invalid JSON.');
  }
};

/**
 * Generate a follow-up question based on the previous interaction
 * @param {Object} params
 * @param {string} params.retrievedChunks - Raw context from RAG
 * @param {string} params.question - The question previously asked
 * @param {string} params.answer - The candidate's answer
 * @returns {Promise<string>} Single follow-up question
 */
const generateFollowUpQuestion = async ({ retrievedChunks, question, answer }) => {
  const systemPrompt = `You are a technical interviewer.

Generate a follow-up question based on the previous interaction.

Rules:
- Focus on weak areas or gaps
- Increase depth of evaluation
- Do NOT repeat the same concept
- Keep it precise`;

  const userPrompt = `Context:
${retrievedChunks}

Previous Question:
${question}

Candidate Answer:
${answer}

Output:
Single follow-up question.`;

  const response = await nvidia.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.5,
    max_tokens: 512,
  });

  return response.choices[0]?.message?.content?.trim() || 'No follow-up generated.';
};

/**
 * Generate a comprehensive final evaluation report
 * @param {Array} allEvaluations - Array of individual answer evaluations
 * @returns {Promise<Object>} Structured report JSON
 */
const generateFinalEvaluationReport = async (allEvaluations) => {
  const systemPrompt = `You are a senior interviewer.

Generate a final evaluation report based on the provided session data.

Rules:
- Be decisive
- No vague feedback
- Base everything on evaluation data
- Always return valid JSON`;

  const userPrompt = `Evaluation Data:
${JSON.stringify(allEvaluations, null, 2)}

Return JSON exactly as:
{
  "overall_score": (0-10),
  "skill_breakdown": [
    { "skill": "", "score": 0-10 }
  ],
  "key_strengths": [],
  "key_weaknesses": [],
  "hire_decision": "yes | no | borderline",
  "improvement_plan": [
    "step 1",
    "step 2"
  ]
}`;

  const response = await nvidia.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 2048,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  try {
    return JSON.parse(content || '{}');
  } catch {
    throw new Error('AI report generator returned invalid JSON.');
  }
};

/**
 * Validate whether a model response is grounded in the provided context
 * @param {Object} params
 * @param {string} params.retrievedChunks - Context used for grounding
 * @param {string} params.modelOutput - Output to be validated
 * @returns {Promise<Object>} Grounding validation result
 */
const validateGrounding = async ({ retrievedChunks, modelOutput }) => {
  const systemPrompt = `You are a validation system.

Check whether the response is fully supported by the context.

Return JSON exactly as:
{
  "grounded": true|false,
  "unsupported_claims": [],
  "reason": ""
}`;

  const userPrompt = `Context:
${retrievedChunks}

Response:
${modelOutput}`;

  const response = await nvidia.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.1,
    max_tokens: 1024,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  try {
    return JSON.parse(content || '{}');
  } catch {
    throw new Error('AI validator returned invalid JSON.');
  }
};

/**
 * ── 6-STEP ORCHESTRATOR ──
 * Topic-based Dynamic Question Generator
 *
 * 1. Query Rewrite  (topic name -> technical goal string)
 * 2. Embed & Retrieve (Pinecone-like search on internal vectorStore)
 * 3. Retrieve top 5
 * 4. Format context
 * 5. Pass into Senior Technical Question Generator
 * 6. Generate questions
 */
const generateTopicQuestions = async ({ resumeText, jobDescription, topic, parsedResumeData, parsedJdData }) => {
  // Step 1: Prepare Vector Store
  const chunks      = buildSemanticChunks(resumeText, jobDescription);
  const vectorStore = await createAndStoreEmbeddings(chunks);

  // Step 2, 3 & 4: Retrieval & Format Context
  const context = await retrieveContextForTopic(vectorStore, topic);

  // Step 5 & 6: Generation (using our existing grounded generator logic)
  return generateSeniorTechnicalQuestions({
    retrievedChunks: context,
    parsedResumeData,
    parsedJdData,
  });
};

const generateQuestionsDirect = async (jobTitle, jobDescription) => {
  if (!jobTitle || !jobDescription) {
    throw new Error('Job title and job description are required.');
  }

  const systemPrompt = `You are a professional AI Technical Recruiter.
Generate 5 targeted, highly role-relevant interview questions (3 technical, 2 behavioral) based specifically on the provided Job Title and Job Description.
Always respond with a valid JSON object containing a "questions" key pointing to an array of question strings. Format:
{
  "questions": [
    "Question 1...",
    "Question 2...",
    "Question 3...",
    "Question 4...",
    "Question 5..."
  ]
}`;

  const userPrompt = `Job Title: ${jobTitle}
Job Description:
${jobDescription}`;

  const response = await nvidia.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Failed to generate questions.');

  try {
    const parsed = JSON.parse(content);
    return parsed.questions || [];
  } catch (err) {
    console.error('Failed to parse direct questions JSON from NVIDIA NIM:', err);
    throw new Error('Failed to parse questions response.');
  }
};

module.exports = {
  generateInterviewQuestions,
  evaluateAnswer,
  generateOverallFeedback,
  parseResumeAndJD,
  optimizeQuery,
  generateSeniorTechnicalQuestions,
  evaluateStrictAnswer,
  generateFollowUpQuestion,
  generateFinalEvaluationReport,
  validateGrounding,
  generateTopicQuestions,
  generateQuestionsDirect,
};







