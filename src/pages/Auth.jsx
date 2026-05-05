import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn, signUp } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const AuthLayout = ({ children, title, subtitle }) => (
  <div style={{ minHeight: '100vh', background: '#FAF6EE', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
    <div style={{ width: '100%', maxWidth: 440 }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <a href="/" style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 900, color: '#0D1B2A', textDecoration: 'none' }}>
          Scholar<span style={{ color: '#E8B84B' }}>Prep</span>
        </a>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 900, color: '#0D1B2A', marginTop: 24, marginBottom: 8 }}>{title}</h1>
        <p style={{ color: '#5A6A7A', fontSize: 15 }}>{subtitle}</p>
      </div>
      <div style={{ background: '#fff', borderRadius: 20, padding: 36, border: '1px solid rgba(13,27,42,0.08)', boxShadow: '0 8px 32px rgba(13,27,42,0.08)' }}>
        {children}
      </div>
    </div>
  </div>
);

export function LoginPage() {
  const navigate = useNavigate();
  const { demoMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (demoMode) {
      setTimeout(() => navigate('/app'), 800);
      return;
    }

    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/app');
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue practising">
      {demoMode && (
        <div style={{ background: '#E8F5EE', border: '1px solid #52B788', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#2D6A4F' }}>
          🎯 <strong>Demo mode:</strong> Supabase not connected yet. Click Log in to explore the app.
        </div>
      )}
      {error && <div style={{ background: '#FDEAEA', border: '1px solid #E07A5F', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#B04030' }}>{error}</div>}
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#5A6A7A', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
            style={{ width: '100%', padding: '12px 16px', border: '1.5px solid rgba(13,27,42,0.12)', borderRadius: 10, fontSize: 15, outline: 'none', fontFamily: 'inherit' }} required={!demoMode} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#5A6A7A', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
            style={{ width: '100%', padding: '12px 16px', border: '1.5px solid rgba(13,27,42,0.12)', borderRadius: 10, fontSize: 15, outline: 'none', fontFamily: 'inherit' }} required={!demoMode} />
        </div>
        <button type="submit" disabled={loading} style={{
          width: '100%', padding: 14, borderRadius: 100, fontSize: 16, fontWeight: 700,
          background: '#0D1B2A', color: '#fff', border: 'none', cursor: 'pointer',
          opacity: loading ? 0.7 : 1
        }}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#5A6A7A' }}>
        Don't have an account? <Link to="/signup" style={{ color: '#0D1B2A', fontWeight: 700 }}>Start free trial</Link>
      </div>
    </AuthLayout>
  );
}

export function SignupPage() {
  const navigate = useNavigate();
  const { demoMode } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);

    if (demoMode) {
      setTimeout(() => navigate('/app'), 800);
      return;
    }

    const { error } = await signUp(email, password, name);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Show email verification message instead of redirecting
      setEmailSent(true);
      setLoading(false);
    }
  };

  // Show email sent confirmation screen
  if (emailSent) {
    return (
      <AuthLayout title="Check your email" subtitle="One more step to get started">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📧</div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 900, color: '#0D1B2A', marginBottom: 12 }}>
            Verify your email
          </div>
          <p style={{ fontSize: 15, color: '#5A6A7A', lineHeight: 1.7, marginBottom: 8 }}>
            We've sent a verification link to:
          </p>
          <div style={{ background: '#FAF6EE', borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 15, fontWeight: 700, color: '#0D1B2A' }}>
            {email}
          </div>
          <p style={{ fontSize: 14, color: '#5A6A7A', lineHeight: 1.7, marginBottom: 24 }}>
            Click the link in the email to confirm your account and start your <strong>7-day free trial</strong>. Check your spam folder if you don't see it within a minute.
          </p>
          <div style={{ background: '#E8F5EE', border: '1px solid #A8DCC0', borderRadius: 12, padding: '14px 18px', marginBottom: 24, fontSize: 13, color: '#2D6A4F', lineHeight: 1.6, textAlign: 'left' }}>
            <strong>What's included in your free trial:</strong><br />
            ✓ All 4 subjects — Maths, Reading, General Ability & Writing<br />
            ✓ Unlimited questions from our AI question bank<br />
            ✓ Full simulated timed exams — Years 1 to 11<br />
            ✓ AI personalised analysis & progress tracking<br />
            ✓ PDF test generator — just 15¢ per question
          </div>
          <button onClick={() => navigate('/login')} style={{
            width: '100%', padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 700,
            background: '#0D1B2A', color: '#fff', border: 'none', cursor: 'pointer'
          }}>
            Go to login →
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Start your free trial" subtitle="7 days free — no credit card required">
      {demoMode && (
        <div style={{ background: '#E8F5EE', border: '1px solid #52B788', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#2D6A4F' }}>
          🎯 <strong>Demo mode:</strong> Click Sign up to explore the full app.
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['7 days free', 'All subjects', 'AI-powered'].map(b => (
          <div key={b} style={{ background: '#E8F5EE', color: '#2D6A4F', padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700 }}>✓ {b}</div>
        ))}
      </div>
      {error && <div style={{ background: '#FDEAEA', border: '1px solid #E07A5F', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#B04030' }}>{error}</div>}
      <form onSubmit={handleSignup}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#5A6A7A', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sarah"
            style={{ width: '100%', padding: '12px 16px', border: '1.5px solid rgba(13,27,42,0.12)', borderRadius: 10, fontSize: 15, outline: 'none', fontFamily: 'inherit' }} required={!demoMode} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#5A6A7A', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
            style={{ width: '100%', padding: '12px 16px', border: '1.5px solid rgba(13,27,42,0.12)', borderRadius: 10, fontSize: 15, outline: 'none', fontFamily: 'inherit' }} required={!demoMode} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#5A6A7A', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters"
            style={{ width: '100%', padding: '12px 16px', border: '1.5px solid rgba(13,27,42,0.12)', borderRadius: 10, fontSize: 15, outline: 'none', fontFamily: 'inherit' }} required={!demoMode} />
        </div>
        <button type="submit" disabled={loading} style={{
          width: '100%', padding: 14, borderRadius: 100, fontSize: 16, fontWeight: 700,
          background: '#E8B84B', color: '#0D1B2A', border: 'none', cursor: 'pointer',
          opacity: loading ? 0.7 : 1
        }}>
          {loading ? 'Creating account...' : 'Start free trial →'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#5A6A7A' }}>
        By signing up you agree to our Terms of Service.<br />
        Already have an account? <Link to="/login" style={{ color: '#0D1B2A', fontWeight: 700 }}>Log in</Link>
      </div>
    </AuthLayout>
  );
}