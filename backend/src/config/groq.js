const Groq = require('groq-sdk');
require('dotenv').config();

if (!process.env.GROQ_API_KEY) {
  console.warn('[GROQ] Warning: GROQ_API_KEY is missing from environment variables.');
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const DEFAULT_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

module.exports = groq;
module.exports.DEFAULT_MODEL = DEFAULT_MODEL;

