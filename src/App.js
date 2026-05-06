import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import './styles/global.css';

import Landing from './pages/Landing';
import { LoginPage, SignupPage } from './pages/Auth';
import AppLayout from './components/AppLayout';
import Home from './pages/Home';
import TestPage from './pages/TestPage';
import WritingPage from './pages/WritingPage';
import ProgressPage from './pages/ProgressPage';
import PDFGeneratorPage from './pages/PDFGeneratorPage';
import SubscribePage from './pages/Subscribe';
import ProfilePage from './pages/ProfilePage';
import SimulatedExamPage from './pages/SimulatedExamPage';

function ProtectedRoute({ children }) {
  const { user, loading, demoMode } = useAuth();
  if (loading) return null;
  if (!user && !demoMode) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/subscribe" element={<ProtectedRoute><SubscribePage /></ProtectedRoute>} />
      <Route path="/pdf-generator" element={<PDFGeneratorPage />} />
      <Route path="/app" element={<ProtectedRoute><AppLayout><Home /></AppLayout></ProtectedRoute>} />
      <Route path="/app/maths" element={<ProtectedRoute><AppLayout><TestPage subject="mathematics" /></AppLayout></ProtectedRoute>} />
      <Route path="/app/reading" element={<ProtectedRoute><AppLayout><TestPage subject="reading" /></AppLayout></ProtectedRoute>} />
      <Route path="/app/general" element={<ProtectedRoute><AppLayout><TestPage subject="general" /></AppLayout></ProtectedRoute>} />
      <Route path="/app/writing" element={<ProtectedRoute><AppLayout><WritingPage /></AppLayout></ProtectedRoute>} />
      <Route path="/app/progress" element={<ProtectedRoute><AppLayout><ProgressPage /></AppLayout></ProtectedRoute>} />
      <Route path="/app/simulated-exam" element={<ProtectedRoute><AppLayout><SimulatedExamPage /></AppLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
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