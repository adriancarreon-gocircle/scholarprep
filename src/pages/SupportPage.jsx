import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const INPUT_STYLE = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 12,
  border: '1.5px solid #E5E7EB',
  fontSize: 15,
  fontFamily: 'Inter, sans-serif',
  color: '#0F172A',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
  transition: 'border-color 0.15s',
};

const TOPICS = [
  'General question',
  'Billing & subscription',
  'Technical issue',
  'Feature request',
  'Content / question feedback',
  'Other',
];

export default function SupportPage() {
  const navigate = useNavigate();
  const { user } = useAuth() || {};

  const [form, setForm] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState('');

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in your name, email and message.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      setSent(true);
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    }
    setSending(false);
  };

  // Success state
  if (sent) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: 48, maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(67,56,202,0.08)', border: '1px solid rgba(67,56,202,0.08)' }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>✉️</div>
          <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>
            Message sent!
          </div>
          <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.75, marginBottom: 32, fontFamily: 'Inter, sans-serif' }}>
            Thanks for reaching out! We've sent a confirmation to <strong>{form.email}</strong> and will get back to you within 1–2 business days.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setSent(false); setForm(f => ({ ...f, message: '', subject: '' })); }}
              style={{ padding: '11px 24px', borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#F1F5F9', color: '#374151', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              Send another message
            </button>
            <button
              onClick={() => navigate(user ? '/app' : '/')}
              style={{ padding: '11px 24px', borderRadius: 100, fontSize: 14, fontWeight: 700, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              {user ? 'Back to app →' : 'Back to home →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F7FF' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(67,56,202,0.08)', padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💬</div>
        <div>
          <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 800, color: '#0F172A', letterSpacing: -0.3 }}>Contact Support</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>We usually reply within 1–2 business days</div>
        </div>
        <button
          onClick={() => navigate(user ? '/app' : '/')}
          style={{ marginLeft: 'auto', padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
        >
          ← Back
        </button>
      </div>

      <div style={{ maxWidth: 620, margin: '0 auto', padding: '40px 24px' }}>

        {/* Info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 32 }}>
          {[
            { icon: '⚡', title: 'Fast replies', desc: '1–2 business days' },
            { icon: '📧', title: 'Email us directly', desc: 'hello@scholarprep.com.au' },
            { icon: '🇦🇺', title: 'Australian team', desc: 'AEST business hours' },
          ].map((c, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', border: '1px solid rgba(67,56,202,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{c.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 2 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>{c.desc}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 32, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 2px 12px rgba(67,56,202,0.05)' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 24 }}>Send us a message</div>

          {/* Name + Email row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>
                Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                style={{ ...INPUT_STYLE, borderColor: focused === 'name' ? '#4338CA' : '#E5E7EB' }}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused('')}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>
                Email *
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                style={{ ...INPUT_STYLE, borderColor: focused === 'email' ? '#4338CA' : '#E5E7EB' }}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
              />
            </div>
          </div>

          {/* Subject */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>
              Topic
            </label>
            <select
              name="subject"
              value={form.subject}
              onChange={handleChange}
              style={{ ...INPUT_STYLE, borderColor: focused === 'subject' ? '#4338CA' : '#E5E7EB', cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394A3B8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}
              onFocus={() => setFocused('subject')}
              onBlur={() => setFocused('')}
            >
              <option value="">Select a topic...</option>
              {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Message */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>
              Message *
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="How can we help? Please include as much detail as possible..."
              rows={6}
              style={{ ...INPUT_STYLE, resize: 'vertical', minHeight: 140, borderColor: focused === 'message' ? '#4338CA' : '#E5E7EB' }}
              onFocus={() => setFocused('message')}
              onBlur={() => setFocused('')}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginBottom: 16, padding: '12px 16px', background: '#FFF1F2', border: '1px solid #FDA4AF', borderRadius: 10, fontSize: 14, color: '#BE123C', fontFamily: 'Inter, sans-serif' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={sending}
            style={{
              width: '100%', padding: '14px', borderRadius: 100, fontSize: 15, fontWeight: 700,
              background: sending ? '#94A3B8' : '#4338CA', color: '#fff', border: 'none',
              cursor: sending ? 'default' : 'pointer', fontFamily: 'Inter, sans-serif',
              boxShadow: sending ? 'none' : '0 4px 16px rgba(67,56,202,0.25)',
              transition: 'all 0.15s',
            }}
          >
            {sending ? '⏳ Sending...' : 'Send message →'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>
            You'll receive a confirmation email when your message is sent.
          </div>
        </div>
      </div>
    </div>
  );
}
