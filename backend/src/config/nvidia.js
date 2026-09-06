const axios = require('axios');
require('dotenv').config();

const API_KEY =
  process.env.REQUESTY_API_KEY ||
  process.env.NVIDIA_NIM_API_KEY ||
  process.env.NVIDIA_API_KEY ||
  '';

const BASE_URL = process.env.LLM_BASE_URL || 'https://router.requesty.ai/v1';
const DEFAULT_MODEL = process.env.LLM_MODEL || process.env.NVIDIA_MODEL || 'google/gemma-4-31b-it';

if (!API_KEY) {
  console.warn('[LLM] Warning: REQUESTY_API_KEY is missing from environment variables.');
}

const extractContent = (message) => {
  if (!message) return '';
  const raw = message.content ?? message.reasoning_content ?? message.reasoning ?? '';
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) {
    return raw.map((part) => (typeof part === 'string' ? part : part?.text || '')).join('');
  }
  return String(raw || '');
};

class LLMClient {
  constructor() {
    this.baseURL = BASE_URL;
    this.model = DEFAULT_MODEL;
    this.apiKey = API_KEY;
  }

  _headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  _prepareMessages(messages, responseFormat) {
    const cloned = (messages || []).map((m) => ({ role: m.role, content: m.content }));
    if (responseFormat && responseFormat.type === 'json_object') {
      const jsonHint = '\n\nIMPORTANT: Respond with valid JSON only. No additional text or markdown.';
      const system = cloned.find((m) => m.role === 'system');
      if (system) system.content += jsonHint;
      else cloned.unshift({ role: 'system', content: `You are a helpful assistant.${jsonHint}` });
    }
    return cloned;
  }

  async createChatCompletion(options) {
    const {
      messages,
      temperature = 0.7,
      max_tokens = 2048,
      stream = false,
      response_format = null,
      model,
    } = options;

    const payload = {
      model: model || this.model,
      messages: this._prepareMessages(messages, response_format),
      temperature,
      max_tokens,
      stream: false,
    };

    try {
      const response = await axios.post(`${this.baseURL}/chat/completions`, payload, {
        headers: this._headers(),
        timeout: 120000,
      });

      const content = extractContent(response.data?.choices?.[0]?.message);
      this.model = payload.model;

      if (stream) {
        return {
          async *[Symbol.asyncIterator]() {
            yield { choices: [{ delta: { content } }] };
          },
        };
      }

      return { choices: [{ message: { content } }] };
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;
      console.error('[LLM] API Error:', {
        model: payload.model,
        status,
        statusText: error.response?.statusText,
        data,
        message: error.message,
      });

      if (status === 401) throw new Error('LLM API key is invalid or expired');
      if (status === 429) throw new Error('LLM API rate limit exceeded');
      if (status === 503) throw new Error('LLM API service unavailable');
      throw new Error(`LLM API error: ${data?.error?.message || data?.message || data?.detail || error.message}`);
    }
  }

  get chat() {
    return {
      completions: {
        create: this.createChatCompletion.bind(this),
      },
    };
  }
}

const llm = new LLMClient();

module.exports = llm;
module.exports.DEFAULT_MODEL = DEFAULT_MODEL;
module.exports.NVIDIA_API_KEY_PRESENT = Boolean(API_KEY);
module.exports.LLM_API_KEY_PRESENT = Boolean(API_KEY);
