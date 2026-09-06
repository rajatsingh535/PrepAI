# PrepAI

Built by [Rajat Singh](https://github.com/rajatsingh535).

PrepAI is a MERN interview practice platform. Candidates generate role-specific mock interviews, practice DSA problems, and receive AI scoring. **Question generation and answer analysis use NVIDIA NIM** (`https://integrate.api.nvidia.com/v1`), not Groq.

## Quick start

1. Copy `backend/.env.example` to `backend/.env` and fill in MongoDB, JWT, and `NVIDIA_NIM_API_KEY`.
2. Copy `frontend/.env.example` to `frontend/.env` if you need a custom API URL.
3. From the repo root:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

4. Run backend (`npm run dev` in `backend`) and frontend (`npm run dev` in `frontend`).
5. Open `http://localhost:5173`.

Get an NVIDIA key from [build.nvidia.com](https://build.nvidia.com). Never commit `.env` files or API keys.

## Architecture

```
PrepAI-main/
├── backend/                 Node + Express API, Socket.io, MongoDB
├── frontend/                React (Vite) SPA
├── package.json             Root workspace scripts
└── README.md                This file
```

AI interview questions, session feedback, DSA problem generation, and code evaluation all go through `backend/src/config/nvidia.js`.

AI mock interviews (`/interviews/:id/session`) and DSA interviews (`/dsa-session`) have a **Light / Dark** toggle in the session header.

---

## Backend file map (`backend/`)

| File | Role |
|---|---|
| `package.json` | Backend dependencies and `dev` / `start` scripts. |
| `.env.example` | Template for secrets. Copy to `.env`. |
| `test-apis.js` | Optional local API smoke tests. |
| `src/server.js` | Process entry: loads env, DB, Redis, HTTP server, Socket.io. |
| `src/app.js` | Express app: CORS, helmet, routes, error handler. |
| `src/socket.js` | Live interviewer follow-ups via NVIDIA NIM. |

### Config (`backend/src/config/`)

| File | Role |
|---|---|
| `nvidia.js` | NVIDIA NIM OpenAI-compatible client used for all LLM calls. |
| `groq.js` | Legacy Groq client (not used for interviews). |
| `db.js` | MongoDB / Mongoose connection. |
| `redis.js` | Optional Redis cache. |
| `logger.js` | Winston logger. |
| `cloudinary.js` | File/resume cloud storage. |

### Routes (`backend/src/routes/`)

| File | Role |
|---|---|
| `auth.routes.js` | Register, login, refresh, password reset. |
| `user.routes.js` | Profile and account. |
| `interview.routes.js` | Create interviews and generate questions. |
| `session.routes.js` | Start session, save answers, complete + AI analysis. |
| `dsa.routes.js` | DSA questions, run tests, evaluate, save session. |
| `resume.routes.js` | Resume upload and parse. |
| `jobs.routes.js` | Job search and recommendations. |
| `admin.routes.js` | Admin dashboard APIs. |

### Controllers (`backend/src/controllers/`)

| File | Role |
|---|---|
| `auth.controller.js` | Auth business logic. |
| `user.controller.js` | User profile updates. |
| `interview.controller.js` | Interview CRUD + NVIDIA question generation. |
| `session.controller.js` | Session lifecycle + NVIDIA answer/session analysis. |
| `dsa.controller.js` | DSA generation, judge simulation, NVIDIA evaluation. |
| `resume.controller.js` | Resume parse/store. |
| `jobs.controller.js` | Job listing and search. |
| `admin.controller.js` | Admin overview. |
| `adminAuth.controller.js` | Admin login. |
| `adminJob.controller.js` | Admin job moderation. |
| `adminSettings.controller.js` | System settings. |
| `adminPrompt.controller.js` | Editable system prompts. |
| `adminPayment.controller.js` | Payments. |
| `adminPlan.controller.js` | Subscription plans. |
| `adminScraper.controller.js` | Job scraper controls. |
| `adminAnalytics.controller.js` | Analytics. |
| `adminLog.controller.js` | Audit logs. |
| `adminTemplate.controller.js` | Interview templates. |

### Services (`backend/src/services/`)

| File | Role |
|---|---|
| `ai.service.js` | Interview question generation, per-answer eval, overall feedback (NVIDIA). |
| `optimizer.service.js` | Query rewrite for RAG search (NVIDIA). |
| `rag.service.js` | Chunking, embeddings, retrieve resume/JD context. |
| `chunking.service.js` | Text split helpers. |
| `adzuna.service.js` / `adzunaService.js` | Adzuna job API. |
| `serpapi.service.js` | Optional Google jobs via SerpAPI. |
| `jobSearchService.js` | Combined job search. |
| `jobMatchService.js` | Resume-to-job matching. |
| `jobSyncService.js` / `jobSyncScheduler.js` | Periodic job ingest. |
| `jobCleanupService.js` | Stale job cleanup. |
| `jobDeduplicator.js` | Dedup listings. |
| `postgresJobService.js` | Optional Postgres job store. |

### Models (`backend/src/models/`)

| File | Role |
|---|---|
| `User.model.js` | Users. |
| `Interview.model.js` | Interview config + generated questions. |
| `Session.model.js` | Mock interview attempts and scores. |
| `DSASession.model.js` | DSA practice sessions. |
| `Resume.model.js` | Uploaded resumes. |
| `Job.model.js` | Cached jobs. |
| `Plan.model.js` | Billing plans. |
| `Transaction.model.js` | Payments. |
| `InterviewTemplate.model.js` | Reusable interview templates. |
| `SystemPrompt.model.js` | Admin-editable LLM prompts. |
| `SystemSetting.model.js` | App settings. |
| `AuditLog.model.js` / `WebhookLog.model.js` / `ScraperLog.model.js` | Logs. |
| `ScraperConfig.model.js` | Scraper config. |

### Middleware & utils (`backend/src/middleware/`, `backend/src/utils/`)

| File | Role |
|---|---|
| `auth.middleware.js` | JWT for users. |
| `adminAuth.middleware.js` | JWT for admins. |
| `rbac.js` | Permission checks. |
| `errorHandler.js` | Central errors. |
| `upload.middleware.js` | Multer uploads. |
| `validate.js` | express-validator wrappers. |
| `requestLogger.js` | HTTP logging. |
| `jwt.utils.js` | Sign/verify tokens. |
| `AppError.js` | Typed HTTP errors. |
| `queryParser.js` | Job search query parse (NVIDIA fallback). |
| `scoringEngine.js` | Job match scores. |
| `pagination.js` / `responseFormatter.js` | API helpers. |
| `normalizer.js` / `jobNormalizer.js` / `deduplicator.js` | Job data cleanup. |
| `adzunaClient.js` / `adzunaCache.js` / `jobsCache.js` | Jobs HTTP + cache. |

### Data (`backend/src/data/`)

| File | Role |
|---|---|
| `dsa_questions.json` | Built-in DSA problem bank. |
| `merged_problems.json` | Larger LeetCode-style problem dump (optional). |

---

## Frontend file map (`frontend/`)

| File | Role |
|---|---|
| `package.json` | Vite + React dependencies. |
| `index.html` | SPA shell. |
| `vite.config.js` | Vite + `@` alias. |
| `tailwind.config.js` | Theme tokens. |
| `src/main.jsx` | React mount, QueryClient, providers. |
| `src/App.jsx` | All routes (auth, dashboard, admin, interviews, DSA). |
| `src/index.css` | Global styles + interview light/dark overrides. |

### Pages (`frontend/src/pages/`)

| File | Role |
|---|---|
| `LandingPage.jsx` | Marketing home. |
| `Jobs.jsx` / `RecommendedJobs.jsx` | Job board. |
| `auth/LoginPage.jsx` | Login. |
| `auth/RegisterPage.jsx` | Signup. |
| `auth/ForgotPasswordPage.jsx` | Password reset. |
| `dashboard/DashboardPage.jsx` | User home. |
| `interview/NewInterviewPage.jsx` | Create AI mock interview. |
| `interview/InterviewListPage.jsx` | Saved interviews. |
| `interview/InterviewSessionPage.jsx` | Live Q&A + cam metrics + **theme toggle**. |
| `interview/DSASessionPage.jsx` | DSA editor, tests, NVIDIA eval + **theme toggle**. |
| `interview/SessionResultPage.jsx` | Post-interview scores. |
| `session/SessionHistoryPage.jsx` | Past sessions. |
| `resume/ResumesPage.jsx` | Resume manager. |
| `profile/ProfilePage.jsx` | Account. |
| `pricing/PricingPage.jsx` | Plans. |
| `admin/*` | Admin console pages. |

### Layouts, context, services (`frontend/src/`)

| File | Role |
|---|---|
| `layouts/DashboardLayout.jsx` | User sidebar + topbar. |
| `layouts/AuthLayout.jsx` | Auth screens. |
| `layouts/AdminLayout.jsx` | Admin chrome. |
| `context/AppContext.jsx` | Sidebar, loading, **light/dark theme**. |
| `context/AuthContext.jsx` | Legacy auth context. |
| `context/AdminAuthContext.jsx` | Admin session. |
| `store/authStore.js` | Zustand user auth. |
| `services/api.js` | Axios API client. |
| `services/interview.service.js` | Interview HTTP helpers. |
| `services/admin.service.js` | Admin HTTP helpers. |
| `components/common/ThemeToggle.jsx` | Light/Dark button used on interview + DSA. |
| `components/navigation/Sidebar.jsx` / `Topbar.jsx` | App navigation. |
| `components/jobs/*` | Job cards, search, drawers. |
| `hooks/*` | Auth, fetch, localStorage helpers. |
| `constants/routes.js` | Path constants. |

---

## Environment variables (backend)

| Name | Purpose |
|---|---|
| `NVIDIA_NIM_API_KEY` | NVIDIA NIM key (`nvapi-...`). Required for questions and analysis. |
| `NVIDIA_MODEL` | Optional model id. Default `openai/gpt-oss-20b`. |
| `MONGO_URI` / `MONGODB_URI` | MongoDB connection string. |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Auth tokens. |
| `CLIENT_URL` | Frontend origin for CORS (default `http://localhost:5173`). |
| `PORT` | API port (default `5000`). |

---

## License / contributing

This is a personal interview-prep project. Fork, clone, set your own keys, and keep secrets out of git.
