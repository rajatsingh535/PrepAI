# PrepAI Project Documentation

## Project Overview
PrepAI is an AI-powered interview preparation platform that helps candidates practice mock interviews, solve DSA problems, and receive AI-driven feedback with webcam/audio analysis.

## Complete Project Structure

### Root Directory Structure
```
PrepAI-main/
├── backend/                 # Node.js + Express backend
├── frontend/                # React + Vite frontend
├── readme/                  # Additional documentation
├── .gitignore              # Git ignore rules
├── IMPLEMENTATION_SUMMARY.md  # Project implementation summary
├── package.json             # Root workspace scripts
├── package-lock.json        # Lock file for root dependencies
├── README.md               # Main project README
├── STATUS_REPORT.md        # Project status report
└── TEST_API_CREDENTIALS.md # API credential testing documentation
```

## Backend Structure (`backend/`)

### Root Files
- **`package.json`** - Backend dependencies and scripts (dev, start, test)
- **`package-lock.json`** - Lock file for backend dependencies
- **`.env`** - Environment variables (MONGODB_URI, JWT secrets, API keys)
- **`.env.example`** - Environment template
- **`.gitignore`** - Backend-specific git ignore rules

### `src/` - Source Code Directory

#### **`app.js`** - Express application configuration
- Main Express app setup
- Middleware configuration (CORS, helmet, compression, rate limiting)
- Request logging setup
- Error handling middleware

#### **`server.js`** - Server entry point
- Database connection initialization
- Redis client setup
- HTTP server creation
- Socket.io integration
- Graceful shutdown handling

#### **`socket.js`** - WebSocket/Socket.io configuration
- Real-time communication for live interviews
- Webcam/audio metric streaming
- Session status updates

### Configuration Files (`src/config/`)
- **`cloudinary.js`** - Cloudinary image upload configuration
- **`db.js`** - MongoDB connection and configuration
- **`groq.js`** - Groq AI API configuration
- **`logger.js`** - Winston logging setup
- **`nvidia.js`** - NVIDIA AI service configuration
- **`redis.js`** - Redis client configuration

### Controllers (`src/controllers/`)
- **`admin.controller.js`** - Admin dashboard management
- **`adminAnalytics.controller.js`** - Admin analytics and reporting
- **`adminAuth.controller.js`** - Admin authentication
- **`adminJob.controller.js`** - Admin job management
- **`adminLog.controller.js`** - Admin log viewing
- **`adminPayment.controller.js`** - Admin payment processing
- **`adminPlan.controller.js`** - Admin subscription plan management
- **`adminPrompt.controller.js`** - Admin AI prompt management
- **`adminScraper.controller.js`** - Admin job scraper control
- **`adminSettings.controller.js`** - Admin system settings
- **`adminTemplate.controller.js`** - Admin interview template management
- **`auth.controller.js`** - User authentication (register, login, logout, refresh)
- **`dsa.controller.js`** - DSA problem solving and evaluation
- **`interview.controller.js`** - Interview session management
- **`jobs.controller.js`** - Job listing and search
- **`resume.controller.js`** - Resume upload and parsing
- **`session.controller.js`** - Interview session handling
- **`user.controller.js`** - User profile management

### Data Files (`src/data/`)
- **`dsa_questions.json`** - DSA problem database
- **`merged_problems.json`** - Combined DSA problem set

### Middleware (`src/middleware/`)
- **`adminAuth.middleware.js`** - Admin authentication protection
- **`auth.middleware.js`** - User authentication protection
- **`errorHandler.js`** - Global error handling
- **`index.js`** - Middleware exports
- **`rbac.js`** - Role-based access control
- **`requestLogger.js`** - Request logging middleware
- **`upload.middleware.js`** - File upload handling
- **`validate.js`** - Request validation

### Models (`src/models/`)
- **`AuditLog.model.js`** - System audit logging
- **`DSASession.model.js`** - DSA session tracking
- **`Interview.model.js`** - Interview session data
- **`InterviewTemplate.model.js`** - Interview templates
- **`Job.model.js`** - Job listings
- **`Plan.model.js`** - Subscription plans
- **`Resume.model.js`** - User resumes
- **`ScraperConfig.model.js`** - Job scraper configuration
- **`ScraperLog.model.js`** - Scraper activity logs
- **`Session.model.js`** - Interview sessions
- **`SystemPrompt.model.js`** - AI prompt templates
- **`SystemSetting.model.js`** - System settings
- **`Transaction.model.js`** - Payment transactions
- **`User.model.js`** - User accounts
- **`WebhookLog.model.js`** - Webhook activity logs

### Routes (`src/routes/`)
- **`admin.routes.js`** - Admin API endpoints
- **`auth.routes.js`** - Authentication routes
- **`dsa.routes.js`** - DSA problem routes
- **`interview.routes.js`** - Interview management routes
- **`jobs.routes.js`** - Job search routes
- **`resume.routes.js`** - Resume handling routes
- **`session.routes.js`** - Session management routes
- **`user.routes.js`** - User profile routes

### Services (`src/services/`)
- **`ai.service.js`** - AI interview question generation and evaluation
- **`jobSyncService.js`** - Job data synchronization
- **`optimizer.service.js`** - Query optimization
- **`rag.service.js`** - Retrieval-Augmented Generation service

### Scripts (`src/scripts/`)
- **`seedAdmin.js`** - Admin user seeding script

### Utils (`src/utils/`)
- **`AppError.js`** - Custom error class
- **`jwt.utils.js`** - JWT token utilities
- **`responseFormatter.js`** - API response formatting

### Logs Directory (`logs/`)
- **`combined.log`** - Combined application logs
- **`error.log`** - Error logs only

## Frontend Structure (`frontend/`)

### Root Files
- **`package.json`** - Frontend dependencies and scripts
- **`package-lock.json`** - Lock file for frontend dependencies
- **`.env`** - Frontend environment variables
- **`.env.example`** - Frontend environment template
- **`index.html`** - Main HTML entry point
- **`vite.config.js`** - Vite build configuration
- **`tailwind.config.js`** - Tailwind CSS configuration
- **`postcss.config.js`** - PostCSS configuration
- **`vercel.json`** - Vercel deployment configuration

### `src/` - Source Code Directory

#### **`App.jsx`** - Main React application component
- Root application component
- Route configuration
- Layout management

#### **`main.jsx`** - Application entry point
- React DOM rendering
- Provider setup (Auth, Theme, etc.)

#### **`index.css`** - Global CSS styles
- Tailwind directives
- Custom global styles

### Components (`src/components/`)
React UI components organized by feature area:
- Authentication components
- Interview components
- DSA components
- Dashboard components
- Admin components
- Common UI components

### Constants (`src/constants/`)
- API endpoint constants
- Application configuration
- Theme constants
- Feature flags

### Context (`src/context/`)
React Context providers:
- Authentication context
- Theme context
- Notification context
- User data context

### Hooks (`src/hooks/`)
Custom React hooks:
- **`useApi.js`** - API call hook with loading/error states
- **`useDebounce.js`** - Debounced value hook
- **`useFetch.js`** - Data fetching hook
- **`useJobs.js`** - Job search hook

### Layouts (`src/layouts/`)
Application layout components:
- Main layout
- Dashboard layout
- Admin layout
- Auth layout

### Lib (`src/lib/`)
Library and utility configurations:
- **`axios.js`** - Configured Axios instance with token handling
- **`adminAxios.js`** - Admin-specific Axios instance
- HTTP interceptors for token refresh

### Pages (`src/pages/`)
React page components:
- Home page
- Login/Register pages
- Dashboard pages
- Interview pages
- DSA practice pages
- Admin pages
- Profile pages

### Services (`src/services/`)
API service functions:
- **`admin.service.js`** - Admin API calls
- **`auth.service.js`** - Authentication API calls
- **`jobs.service.js`** - Job search API calls
- **`interview.service.js`** - Interview API calls
- **`dsa.service.js`** - DSA API calls

### Store (`src/store/`)
State management (Zustand):
- **`authStore.js`** - Authentication state
- **`themeStore.js`** - Theme state
- **`userStore.js`** - User data state
- **`interviewStore.js`** - Interview state

### Utils (`src/utils/`)
Utility functions:
- **`index.js`** - Utility exports (formatDate, truncate, etc.)
- **`useDebounce.js`** - Debounce utility (hook and function)
- Date formatting helpers
- String manipulation utilities
- Score calculation helpers

## Additional Documentation (`readme/`)
Contains supplementary documentation files:
- Setup guides
- API documentation
- Deployment guides
- Feature specifications

## Key Features

### Backend Features:
1. **AI Interview Generation** - Uses NVIDIA/Groq AI for question generation
2. **DSA Problem Solving** - Local DSA database with AI evaluation
3. **Webcam/Audio Analysis** - Real-time metric tracking during interviews
4. **Job Scraping** - Automated job listing aggregation
5. **Payment Processing** - Subscription and payment handling
6. **Admin Dashboard** - Comprehensive admin interface

### Frontend Features:
1. **Interactive Interviews** - Real-time interview sessions with webcam
2. **DSA Practice** - Coding interface with test case evaluation
3. **Job Search** - Filterable job listings
4. **Progress Tracking** - Session history and performance analytics
5. **Admin Interface** - Full-featured admin dashboard
6. **Responsive Design** - Mobile-friendly interface

## Technology Stack

### Backend:
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Redis** - Caching and session storage
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Cloudinary** - File storage

### Frontend:
- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication

### AI/ML:
- **NVIDIA AI** - Question generation
- **Groq AI** - Answer evaluation
- **WebRTC** - Webcam/audio capture
- **Web Audio API** - Audio analysis

## Development Setup

1. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure environment variables
   npm run dev
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Configure environment variables
   npm run dev
   ```

3. **Root Scripts:**
   ```bash
   npm run install:all  # Install both backend and frontend
   npm run dev          # Start both servers concurrently
   ```

## Deployment

The project supports deployment to:
- **Vercel** - Frontend deployment
- **Render/Railway** - Backend deployment
- **MongoDB Atlas** - Database hosting
- **Cloudinary** - Media storage

## Maintenance

### Logging:
- Application logs in `backend/logs/`
- Winston logger for structured logging
- Error tracking and monitoring

### Monitoring:
- Performance metrics
- User activity tracking
- System health checks

### Backup:
- Database backups
- Media file backups
- Configuration backups

This documentation provides a complete overview of the PrepAI project structure, helping developers understand the codebase organization and locate specific functionality.