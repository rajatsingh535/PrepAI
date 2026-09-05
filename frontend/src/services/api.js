import api from '@/lib/axios';

// ── Auth ───────────────────────────────────────────────────────────
export const authAPI = {
  getMe: () => api.get('/auth/me'),
};

// ── User ───────────────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
  getDashboard: () => api.get('/users/dashboard'),
};

// ── Resume ─────────────────────────────────────────────────────────
export const resumeAPI = {
  upload: (formData) =>
    api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: () => api.get('/resumes'),
  delete: (id) => api.delete(`/resumes/${id}`),
  setDefault: (id) => api.patch(`/resumes/${id}/default`),
  parse: (id, jobDescription = '') =>
    api.post(`/resumes/${id}/parse`, { jobDescription }),
};

// ── Interview ──────────────────────────────────────────────────────
export const interviewAPI = {
  create: (data) => api.post('/interviews', data),
  generateQuestions: (id) => api.post(`/interviews/${id}/generate`),
  getAll: (params) => api.get('/interviews', { params }),
  getById: (id) => api.get(`/interviews/${id}`),
  delete: (id) => api.delete(`/interviews/${id}`),
};

// ── Session ────────────────────────────────────────────────────────
export const sessionAPI = {
  start: (interviewId) => api.post('/sessions/start', { interviewId }),
  submitAnswer: (sessionId, data) => api.post(`/sessions/${sessionId}/answer`, data),
  complete: (sessionId, data) => api.post(`/sessions/${sessionId}/complete`, data),
  getAll: (params) => api.get('/sessions', { params }),
  getById: (id) => api.get(`/sessions/${id}`),
};

// ── Jobs ───────────────────────────────────────────────────────────
export const jobsAPI = {
  // Database active jobs endpoint (paginated, filtered)
  getJobs: (params) => api.get('/jobs', { params }),
  // Adzuna live search (kept for backward compatibility)
  search: (params) => api.get('/jobs/search', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  getCategories: () => api.get('/jobs/categories'),
  getRecommended: () => api.get('/jobs/recommended'),
  generateQuestionsDirect: (data) => api.post('/jobs/generate-questions', data),
};

// ── DSA Interview ──────────────────────────────────────────────────
export const dsaAPI = {
  generateQuestions: (data) => api.post('/dsa/generate', data),
  evaluateSolution: (data) => api.post('/dsa/evaluate', data),
  runTestcases: (data) => api.post('/dsa/run-testcases', data),
  saveSession: (data) => api.post('/dsa/session', data),
  getSessions: () => api.get('/dsa/sessions'),
};

