import React, { Suspense, lazy } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import './styles/global.css';

// Eager: needed for first paint / SEO-critical public pages
import Landing from './pages/Landing';
import { LoginPage, SignupPage, ForgotPasswordPage, ResetPasswordPage } from './pages/Auth';
import AppLayout from './components/AppLayout';

// Lazy-loaded: only fetched when the user navigates to these routes,
// keeping the initial bundle small for faster first load / better Core Web Vitals.
const Home = lazy(() => import('./pages/Home'));
const TestPage = lazy(() => import('./pages/TestPage'));
const WritingPage = lazy(() => import('./pages/WritingPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const PDFGeneratorPage = lazy(() => import('./pages/PDFGeneratorPage'));
const SubscribePage = lazy(() => import('./pages/Subscribe'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SimulatedExamPage = lazy(() => import('./pages/SimulatedExamPage'));
const CustomTestPage = lazy(() => import('./pages/CustomTestPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const HandwritingFeedbackPage = lazy(() => import('./pages/HandwritingFeedbackPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const WelcomePage = lazy(() => import('./pages/WelcomePage'));
const EnglishPage = lazy(() => import('./pages/EnglishPage'));
const ExamLandingPage = lazy(() => import('./pages/ExamLandingPage'));

function PageLoader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #E5E7EB', borderTopColor: '#4338CA', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading, demoMode } = useAuth();
  if (loading) return null;
  if (!user && !demoMode) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/subscribe" element={<ProtectedRoute><SubscribePage /></ProtectedRoute>} />
        <Route path="/pdf-generator" element={<PDFGeneratorPage />} />
        <Route path="/app" element={<ProtectedRoute><AppLayout><Home /></AppLayout></ProtectedRoute>} />
        <Route path="/app/welcome" element={<ProtectedRoute><AppLayout><WelcomePage /></AppLayout></ProtectedRoute>} />
        <Route path="/app/maths" element={<ProtectedRoute><AppLayout><TestPage subject="mathematics" /></AppLayout></ProtectedRoute>} />
        <Route path="/app/reading" element={<ProtectedRoute><AppLayout><TestPage subject="reading" /></AppLayout></ProtectedRoute>} />
        <Route path="/app/general" element={<ProtectedRoute><AppLayout><TestPage subject="general" /></AppLayout></ProtectedRoute>} />
        <Route path="/app/english" element={<ProtectedRoute><AppLayout><EnglishPage /></AppLayout></ProtectedRoute>} />
        <Route path="/app/writing" element={<ProtectedRoute><AppLayout><WritingPage /></AppLayout></ProtectedRoute>} />
        <Route path="/app/progress" element={<ProtectedRoute><AppLayout><ProgressPage /></AppLayout></ProtectedRoute>} />
        <Route path="/app/simulated-exam" element={<ProtectedRoute><AppLayout><SimulatedExamPage /></AppLayout></ProtectedRoute>} />
        <Route path="/app/custom-test" element={<ProtectedRoute><AppLayout><CustomTestPage /></AppLayout></ProtectedRoute>} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/app/writing/photo-feedback" element={<ProtectedRoute><AppLayout><HandwritingFeedbackPage /></AppLayout></ProtectedRoute>} />
        <Route path="/app/help" element={<ProtectedRoute><AppLayout><HelpPage /></AppLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
        <Route path="/exams/:slug" element={<ExamLandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  );
}