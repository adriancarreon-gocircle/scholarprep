import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn, signUp } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const AuthLayout = ({ children, title, subtitle }) => (
  <div style={{
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F7FF 50%, #FFF7ED 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    fontFamily: "'Inter', 'DM Sans', sans-serif",
  }}>
    <div style={{ width: '100%', maxWidth: 460 }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <a href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", fontSize: 28, fontWeight: 900, color: '#0F172A', letterSpacing: -0.5 }}>
            Scholar<span style={{ color: '#4338CA' }}>Prep</span>
          </div>
        </a>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", fontSize: 26, fontWeight: 800, color: '#0F172A', marginTop: 24, marginBottom: 8, letterSpacing: -0.5 }}>{title}</h1>
        <p style={{ color: '#64748B', fontSize: 15, fontFamily: 'Inter, sans-serif' }}>{subtitle}</p>
      </div>

      {/* Card */}
      <div style={{
        background: '#fff', borderRadius: 24, padding: 36,
        border: '1px solid rgba(67,56,202,0.08)',
        boxShadow: '0 8px 40px rgba(67,56,202,0.1), 0 2px 8px rgba(0,0,0,0.04)'
      }}>
        {children}
      </div>
    </div>
  </div>
);

const inputStyle = {
  width: '100%', padding: '12px 16px',
  border: '1.5px solid rgba(67,56,202,0.15)',
  borderRadius: 12, fontSize: 15, outline: 'none',
  fontFamily: 'Inter, DM Sans, sans-serif',
  color: '#0F172A', background: '#fff',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 700,
  color: '#64748B', marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: '0.06em',
  fontFamily: 'Inter, sans-serif',
};

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
    if (demoMode) { setTimeout(() => navigate('/app'), 800); return; }
    const { error } = await signIn(email, password);
    if (error) { setError(error.message); setLoading(false); }
    else navigate('/app');
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue practising">
      {demoMode && (
        <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: 12, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#059669', fontFamily: 'Inter, sans-serif' }}>
          🎯 <strong>Demo mode:</strong> Click Log in to explore the app.
        </div>
      )}
      {error && (
        <div style={{ background: '#FFF1F2', border: '1px solid #FDA4AF', borderRadius: 12, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#BE123C', fontFamily: 'Inter, sans-serif' }}>{error}</div>
      )}
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" style={inputStyle}
            onFocus={e => { e.target.style.borderColor = '#4338CA'; e.target.style.boxShadow = '0 0 0 3px rgba(67,56,202,0.08)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(67,56,202,0.15)'; e.target.style.boxShadow = 'none'; }}
            required={!demoMode} />
        </div>
        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••" style={inputStyle}
            onFocus={e => { e.target.style.borderColor = '#4338CA'; e.target.style.boxShadow = '0 0 0 3px rgba(67,56,202,0.08)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(67,56,202,0.15)'; e.target.style.boxShadow = 'none'; }}
            required={!demoMode} />
        </div>
        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '14px', borderRadius: 100, fontSize: 16, fontWeight: 700,
          background: loading ? '#6366F1' : '#4338CA', color: '#fff', border: 'none', cursor: 'pointer',
          fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
          boxShadow: '0 4px 16px rgba(67,56,202,0.3)',
          opacity: loading ? 0.8 : 1,
        }}>
          {loading ? 'Logging in...' : 'Log in →'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
        Don't have an account?{' '}
        <Link to="/signup" style={{ color: '#4338CA', fontWeight: 700, textDecoration: 'none' }}>Start free trial</Link>
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
    if (demoMode) { setTimeout(() => navigate('/app'), 800); return; }
    const { error } = await signUp(email, password, name);
    if (error) { setError(error.message); setLoading(false); }
    else { setEmailSent(true); setLoading(false); }
  };

  if (emailSent) {
    return (
      <AuthLayout title="Check your email" subtitle="One more step to get started">
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 20px' }}>📧</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>Verify your email</div>
          <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, marginBottom: 10, fontFamily: 'Inter, sans-serif' }}>
            We've sent a verification link to:
          </p>
          <div style={{ background: '#EEF2FF', borderRadius: 12, padding: '10px 16px', marginBottom: 20, fontSize: 15, fontWeight: 700, color: '#4338CA', fontFamily: 'Inter, sans-serif' }}>
            {email}
          </div>
          <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, marginBottom: 24, fontFamily: 'Inter, sans-serif' }}>
            Click the link in the email to confirm your account and start your <strong style={{ color: '#0F172A' }}>7-day free trial</strong>. Check your spam folder if you don't see it within a minute.
          </p>
          <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: 14, padding: '16px 18px', marginBottom: 24, fontSize: 13, color: '#059669', lineHeight: 1.75, textAlign: 'left', fontFamily: 'Inter, sans-serif' }}>
            <strong style={{ display: 'block', marginBottom: 8, color: '#0F172A' }}>What's included in your free trial:</strong>
            ✓ All 4 subjects — Maths, Reading, General Ability & Writing<br />
            ✓ Unlimited questions from our AI question bank<br />
            ✓ Full simulated timed exams — Years 1 to 11<br />
            ✓ AI personalised analysis & progress tracking<br />
            ✓ PDF test generator — just 15¢ per question
          </div>
          <button onClick={() => navigate('/login')} style={{
            width: '100%', padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 700,
            background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(67,56,202,0.3)',
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
        <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: 12, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#059669', fontFamily: 'Inter, sans-serif' }}>
          🎯 <strong>Demo mode:</strong> Click Sign up to explore the full app.
        </div>
      )}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {['7 days free', 'All subjects', 'AI-powered'].map(b => (
          <div key={b} style={{ background: '#EEF2FF', color: '#4338CA', padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>✓ {b}</div>
        ))}
      </div>
      {error && (
        <div style={{ background: '#FFF1F2', border: '1px solid #FDA4AF', borderRadius: 12, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#BE123C', fontFamily: 'Inter, sans-serif' }}>{error}</div>
      )}
      <form onSubmit={handleSignup}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Your name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Sarah" style={inputStyle}
            onFocus={e => { e.target.style.borderColor = '#4338CA'; e.target.style.boxShadow = '0 0 0 3px rgba(67,56,202,0.08)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(67,56,202,0.15)'; e.target.style.boxShadow = 'none'; }}
            required={!demoMode} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" style={inputStyle}
            onFocus={e => { e.target.style.borderColor = '#4338CA'; e.target.style.boxShadow = '0 0 0 3px rgba(67,56,202,0.08)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(67,56,202,0.15)'; e.target.style.boxShadow = 'none'; }}
            required={!demoMode} />
        </div>
        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="At least 6 characters" style={inputStyle}
            onFocus={e => { e.target.style.borderColor = '#4338CA'; e.target.style.boxShadow = '0 0 0 3px rgba(67,56,202,0.08)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(67,56,202,0.15)'; e.target.style.boxShadow = 'none'; }}
            required={!demoMode} />
        </div>
        <button type="submit" disabled={loading} style={{
          width: '100%', padding: 14, borderRadius: 100, fontSize: 16, fontWeight: 700,
          background: loading ? '#6366F1' : '#F97316', color: '#fff', border: 'none', cursor: 'pointer',
          fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
          boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
          opacity: loading ? 0.8 : 1,
        }}>
          {loading ? 'Creating account...' : 'Start free trial →'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>
        By signing up you agree to our Terms of Service.<br />
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#4338CA', fontWeight: 700, textDecoration: 'none' }}>Log in</Link>
      </div>
    </AuthLayout>
  );
}