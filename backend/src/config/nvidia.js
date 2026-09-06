const axios = require('axios');
require('dotenv').config();

const API_KEY =
  process.env.NVIDIA_NIM_API_KEY ||
  process.env.NVIDIA_API_KEY ||
  '';

if (!API_KEY) {
  console.warn('[NVIDIA NIM] Warning: NVIDIA_NIM_API_KEY is missing from environment variables.');
}

const BASE_URL = process.env.NVIDIA_NIM_BASE_URL || 'https://integrate.api.nvidia.com/v1';
const DEFAULT_MODEL = process.env.NVIDIA_MODEL || 'openai/gpt-oss-20b';
const FALLBACK_MODELS = [
  DEFAULT_MODEL,
  'openai/gpt-oss-20b',
  'mistralai/mistral-7b-instruct-v0.3',
  'deepseek-ai/deepseek-coder-6.7b-instruct',
  'ibm/granite-3.0-8b-instruct',
  'google/gemma-3-4b-it',
].filter((m, i, arr) => m && arr.indexOf(m) === i);

class NVIDIAClient {
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
      'User-Agent': 'PrepAI-NIM-Client/1.0',
    };
  }

  _prepareMessages(messages, responseFormat) {
    const cloned = (messages || []).map((m) => ({ ...m, content: m.content }));
    if (responseFormat && responseFormat.type === 'json_object') {
      const jsonHint = '\n\nIMPORTANT: Respond with valid JSON only. No additional text or markdown.';
      const system = cloned.find((m) => m.role === 'system');
      if (system) system.content += jsonHint;
      else cloned.unshift({ role: 'system', content: `You are a helpful assistant.${jsonHint}` });
    }
    return cloned;
  }

  async _post(payload) {
    return axios.post(`${this.baseURL}/chat/completions`, payload, {
      headers: this._headers(),
      timeout: 90000,
    });
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

    const prepared = this._prepareMessages(messages, response_format);
    const modelsToTry = [model, ...FALLBACK_MODELS].filter((m, i, arr) => m && arr.indexOf(m) === i);

    let lastError;
    for (const modelId of modelsToTry) {
      const payload = {
        model: modelId,
        messages: prepared,
        temperature,
        max_tokens,
        stream: false,
        top_p: 0.9,
      };

      try {
        const response = await this._post(payload);
        const content = response.data?.choices?.[0]?.message?.content || '';
        this.model = modelId;

        if (stream) {
          return {
            async *[Symbol.asyncIterator]() {
              yield { choices: [{ delta: { content } }] };
            },
          };
        }

        return {
          choices: [{ message: { content } }],
        };
      } catch (error) {
        lastError = error;
        const status = error.response?.status;
        const data = error.response?.data;
        console.error('[NVIDIA NIM] API Error:', {
          model: modelId,
          status,
          statusText: error.response?.statusText,
          data,
          message: error.message,
        });

        const retryable = status === 404 || status === 400 || status === 410 || status === 422 || status === 403;
        if (!retryable) break;
      }
    }

    const error = lastError;
    if (error?.response?.status === 401) {
      throw new Error('NVIDIA NIM API key is invalid or expired');
    }
    if (error?.response?.status === 429) {
      throw new Error('NVIDIA NIM API rate limit exceeded');
    }
    if (error?.response?.status === 503) {
      throw new Error('NVIDIA NIM API service unavailable');
    }
    throw new Error(`NVIDIA NIM API error: ${error?.response?.data?.message || error?.response?.data?.detail || error?.message}`);
  }

  get chat() {
    return {
      completions: {
        create: this.createChatCompletion.bind(this),
      },
    };
  }
}

const nvidia = new NVIDIAClient();

module.exports = nvidia;
module.exports.DEFAULT_MODEL = DEFAULT_MODEL;
module.exports.NVIDIA_API_KEY_PRESENT = Boolean(API_KEY);
