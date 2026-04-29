import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import './styles/global.css';

// Pages
import Landing from './pages/Landing';
import { LoginPage, SignupPage } from './pages/Auth';
import AppLayout from './components/AppLayout';
import Home from './pages/Home';
import TestPage from './pages/TestPage';
import WritingPage from './pages/WritingPage';
import ProgressPage from './pages/ProgressPage';
import PDFGeneratorPage from './pages/PDFGeneratorPage';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user, loading, demoMode } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 900, color: '#0D1B2A', marginBottom: 16 }}>
          Scholar<span style={{ color: '#E8B84B' }}>Prep</span>
        </div>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(13,27,42,0.1)', borderTop: '3px solid #0D1B2A', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
  // Allow access in demo mode or if user is logged in
  if (!user && !demoMode) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/pdf-generator" element={<PDFGeneratorPage />} />

      {/* Protected app */}
      <Route path="/app" element={
        <ProtectedRoute>
          <AppLayout>
            <Routes>
              <Route index element={<Home />} />
              <Route path="maths" element={<TestPage subject="mathematics" />} />
              <Route path="reading" element={<TestPage subject="reading" />} />
              <Route path="general" element={<TestPage subject="general" />} />
              <Route path="writing" element={<WritingPage />} />
              <Route path="progress" element={<ProgressPage />} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
