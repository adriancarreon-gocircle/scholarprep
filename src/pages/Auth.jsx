import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { signIn, signUp, resetPasswordForEmail, updateUserPassword } from '../lib/supabase';
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
    else navigate('/app/welcome');
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={labelStyle}>Password</label>
            <Link to="/forgot-password" style={{ fontSize: 12, color: '#4338CA', fontWeight: 600, textDecoration: 'none', fontFamily: 'Inter, sans-serif' }}>
              Forgot password?
            </Link>
          </div>
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

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { demoMode } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (demoMode) { setSent(true); setLoading(false); return; }
    const { error } = await resetPasswordForEmail(email);
    if (error) { setError(error.message); setLoading(false); }
    else { setSent(true); setLoading(false); }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle="Password reset link sent">
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 20px' }}>📧</div>
          <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>
            We've sent a password reset link to:
          </p>
          <div style={{ background: '#EEF2FF', borderRadius: 12, padding: '10px 16px', marginBottom: 20, fontSize: 15, fontWeight: 700, color: '#4338CA', fontFamily: 'Inter, sans-serif' }}>
            {email}
          </div>
          <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.7, marginBottom: 24, fontFamily: 'Inter, sans-serif' }}>
            Click the link in the email to reset your password. Check your spam folder if you don't see it within a minute.
          </p>
          <button onClick={() => navigate('/login')} style={{
            width: '100%', padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 700,
            background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(67,56,202,0.3)',
          }}>
            Back to login
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email and we'll send you a link">
      {error && (
        <div style={{ background: '#FFF1F2', border: '1px solid #FDA4AF', borderRadius: 12, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#BE123C', fontFamily: 'Inter, sans-serif' }}>{error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>Email address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" style={inputStyle}
            onFocus={e => { e.target.style.borderColor = '#4338CA'; e.target.style.boxShadow = '0 0 0 3px rgba(67,56,202,0.08)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(67,56,202,0.15)'; e.target.style.boxShadow = 'none'; }}
            required autoFocus />
        </div>
        <button type="submit" disabled={loading} style={{
          width: '100%', padding: 14, borderRadius: 100, fontSize: 16, fontWeight: 700,
          background: loading ? '#6366F1' : '#4338CA', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(67,56,202,0.3)',
          opacity: loading ? 0.8 : 1,
        }}>
          {loading ? 'Sending...' : 'Send reset link →'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
        <Link to="/login" style={{ color: '#4338CA', fontWeight: 700, textDecoration: 'none' }}>← Back to login</Link>
      </div>
    </AuthLayout>
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  // Supabase puts the recovery token in the URL hash — let the client process it
  // by calling getSession, which reads the hash and establishes a session automatically
  useEffect(() => {
    // onAuthStateChange fires PASSWORD_RECOVERY when the hash token is valid
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    // Also check if we already have a session (page refresh case)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const { error } = await updateUserPassword(password);
    if (error) { setError(error.message); setLoading(false); }
    else { setDone(true); setLoading(false); }
  };

  if (done) {
    return (
      <AuthLayout title="Password updated!" subtitle="You can now log in with your new password">
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 20px' }}>✅</div>
          <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, marginBottom: 24, fontFamily: 'Inter, sans-serif' }}>
            Your password has been changed successfully.
          </p>
          <button onClick={() => navigate('/login')} style={{
            width: '100%', padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 700,
            background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(67,56,202,0.3)',
          }}>
            Log in →
          </button>
        </div>
      </AuthLayout>
    );
  }

  if (!ready) {
    return (
      <AuthLayout title="Verifying link..." subtitle="Please wait a moment">
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔐</div>
          <p style={{ fontSize: 14, color: '#64748B', fontFamily: 'Inter, sans-serif', lineHeight: 1.7 }}>
            Verifying your reset link… if this takes more than a few seconds, try clicking the link in your email again.
          </p>
          <div style={{ marginTop: 20 }}>
            <Link to="/forgot-password" style={{ fontSize: 14, color: '#4338CA', fontWeight: 600, textDecoration: 'none', fontFamily: 'Inter, sans-serif' }}>
              Request a new reset link
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set new password" subtitle="Choose a strong password for your account">
      {error && (
        <div style={{ background: '#FFF1F2', border: '1px solid #FDA4AF', borderRadius: 12, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#BE123C', fontFamily: 'Inter, sans-serif' }}>{error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>New password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="At least 6 characters" style={inputStyle}
            onFocus={e => { e.target.style.borderColor = '#4338CA'; e.target.style.boxShadow = '0 0 0 3px rgba(67,56,202,0.08)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(67,56,202,0.15)'; e.target.style.boxShadow = 'none'; }}
            required autoFocus />
        </div>
        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>Confirm new password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder="Same password again" style={inputStyle}
            onFocus={e => { e.target.style.borderColor = '#4338CA'; e.target.style.boxShadow = '0 0 0 3px rgba(67,56,202,0.08)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(67,56,202,0.15)'; e.target.style.boxShadow = 'none'; }}
            required />
        </div>
        <button type="submit" disabled={loading} style={{
          width: '100%', padding: 14, borderRadius: 100, fontSize: 16, fontWeight: 700,
          background: loading ? '#6366F1' : '#4338CA', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(67,56,202,0.3)',
          opacity: loading ? 0.8 : 1,
        }}>
          {loading ? 'Updating...' : 'Update password →'}
        </button>
      </form>
    </AuthLayout>
  );
}