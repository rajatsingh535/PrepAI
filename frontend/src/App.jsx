import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { useAdminAuth } from '@/context';

import ErrorBoundary from '@/components/admin/ErrorBoundary';
import SuspenseLoader from '@/components/admin/SuspenseLoader';

import AuthLayout      from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import AdminLayout     from '@/layouts/AdminLayout';

import LandingPage          from '@/pages/LandingPage';
import LoginPage            from '@/pages/auth/LoginPage';
import RegisterPage         from '@/pages/auth/RegisterPage';
import ForgotPasswordPage    from '@/pages/auth/ForgotPasswordPage';
import DashboardPage        from '@/pages/dashboard/DashboardPage';
import NewInterviewPage     from '@/pages/interview/NewInterviewPage';
import InterviewListPage    from '@/pages/interview/InterviewListPage';
import InterviewSessionPage from '@/pages/interview/InterviewSessionPage';
import SessionResultPage    from '@/pages/interview/SessionResultPage';
import DSASessionPage       from '@/pages/interview/DSASessionPage';
import SessionHistoryPage   from '@/pages/session/SessionHistoryPage';
import ResumesPage          from '@/pages/resume/ResumesPage';
import ProfilePage          from '@/pages/profile/ProfilePage';
import Jobs                 from '@/pages/Jobs';

const AdminLoginPage       = lazy(() => import('@/pages/admin/AdminLoginPage'));
const AdminDashboardPage   = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminUsersPage       = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminInterviewsPage  = lazy(() => import('@/pages/admin/AdminInterviewsPage'));
const AdminSessionsPage    = lazy(() => import('@/pages/admin/AdminSessionsPage'));
const AdminResumesPage     = lazy(() => import('@/pages/admin/AdminResumesPage'));
const AdminJobsPage        = lazy(() => import('@/pages/admin/AdminJobsPage'));
const AdminAtsPage         = lazy(() => import('@/pages/admin/AdminAtsPage'));
const AdminSubscriptionPage = lazy(() => import('@/pages/admin/AdminSubscriptionPage'));
const AdminPaymentsPage    = lazy(() => import('@/pages/admin/AdminPaymentsPage'));
const AdminAnalyticsPage   = lazy(() => import('@/pages/admin/AdminAnalyticsPage'));
const AdminSettingsPage    = lazy(() => import('@/pages/admin/AdminSettingsPage'));
const AdminScraperPage     = lazy(() => import('@/pages/admin/AdminScraperPage'));
const AdminPromptsPage     = lazy(() => import('@/pages/admin/AdminPromptsPage'));
const AdminLogsPage        = lazy(() => import('@/pages/admin/AdminLogsPage'));
import RecommendedJobs     from '@/pages/RecommendedJobs';

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return children;
  return <Navigate to="/dashboard" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAdminAuthenticated, isLoading } = useAdminAuth();
  if (isLoading) return null;
  if (!isAdminAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
};

const AdminPermissionRoute = ({ permission, children }) => {
  const { hasPermission, isLoading } = useAdminAuth();
  if (isLoading) return null;
  if (!hasPermission(permission)) {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

const AdminGuestRoute = ({ children }) => {
  const { isAdminAuthenticated, isLoading } = useAdminAuth();
  if (isLoading) return null;
  if (isAdminAuthenticated) return <Navigate to="/admin" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
      </Route>

      <Route path="/admin/login" element={
        <ErrorBoundary>
          <Suspense fallback={<SuspenseLoader />}>
            <AdminGuestRoute><AdminLoginPage /></AdminGuestRoute>
          </Suspense>
        </ErrorBoundary>
      } />

      <Route element={
        <AdminRoute>
          <ErrorBoundary>
            <Suspense fallback={<SuspenseLoader />}>
              <AdminLayout />
            </Suspense>
          </ErrorBoundary>
        </AdminRoute>
      }>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/jobs" element={<AdminJobsPage />} />
        <Route path="/admin/interviews" element={<AdminInterviewsPage />} />
        <Route path="/admin/resumes" element={<AdminResumesPage />} />
        <Route path="/admin/sessions" element={<AdminSessionsPage />} />
        <Route path="/admin/ats" element={<AdminAtsPage />} />
        <Route path="/admin/subscription" element={<AdminPermissionRoute permission="view:settings"><AdminSubscriptionPage /></AdminPermissionRoute>} />
        <Route path="/admin/payments" element={<AdminPermissionRoute permission="view:payments"><AdminPaymentsPage /></AdminPermissionRoute>} />
        <Route path="/admin/analytics" element={<AdminPermissionRoute permission="view:analytics"><AdminAnalyticsPage /></AdminPermissionRoute>} />
        <Route path="/admin/settings" element={<AdminPermissionRoute permission="view:settings"><AdminSettingsPage /></AdminPermissionRoute>} />
        <Route path="/admin/scraper" element={<AdminPermissionRoute permission="view:scraper"><AdminScraperPage /></AdminPermissionRoute>} />
        <Route path="/admin/prompts" element={<AdminPermissionRoute permission="view:prompts"><AdminPromptsPage /></AdminPermissionRoute>} />
        <Route path="/admin/logs" element={<AdminPermissionRoute permission="view:logs"><AdminLogsPage /></AdminPermissionRoute>} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/interviews" element={<InterviewListPage />} />
        <Route path="/interviews/new" element={<NewInterviewPage />} />
        <Route path="/interviews/:id/session" element={<InterviewSessionPage />} />
        <Route path="/dsa-session" element={<DSASessionPage />} />
        <Route path="/sessions/:id/results" element={<SessionResultPage />} />
        <Route path="/sessions" element={<SessionHistoryPage />} />
        <Route path="/resumes" element={<ResumesPage />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/recommended" element={<RecommendedJobs />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
