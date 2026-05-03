import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function SubscribePage() {
  const navigate = useNavigate();
  const { user, trialDaysLeft, isSubscribed } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if returning from successful Stripe subscription
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('subscribed') === 'true') {
      window.history.replaceState({}, '', '/subscribe');
      navigate('/app?subscribed=true');
    }
  }, []);

  // If already subscribed, redirect to app
  useEffect(() => {
    if (isSubscribed) navigate('/app');
  }, [isSubscribed]);

  const handleSubscribe = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subscription',
          successUrl: `${window.location.origin}/subscribe?subscribed=true`,
          cancelUrl: `${window.location.origin}/subscribe`,
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      window.location.href = data.url;
    } catch (e) {
      setError('Failed to load checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAF6EE', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <a href="/app" style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 900, color: '#0D1B2A', textDecoration: 'none' }}>
            Scholar<span style={{ color: '#E8B84B' }}>Prep</span>
          </a>
          {trialDaysLeft > 0 && (
            <div style={{ marginTop: 16, display: 'inline-block', background: '#FDEAEA', border: '1px solid #E07A5F', borderRadius: 100, padding: '6px 16px', fontSize: 13, fontWeight: 700, color: '#B04030' }}>
              ⏰ Your free trial ends in {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''}
            </div>
          )}
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 900, color: '#0D1B2A', marginTop: 20, marginBottom: 8 }}>
            Upgrade to continue
          </h1>
          <p style={{ color: '#5A6A7A', fontSize: 16, lineHeight: 1.6 }}>
            Keep access to unlimited practice tests, AI analysis, and full exam simulations.
          </p>
        </div>

        {/* Badge sits OUTSIDE the card so it's never clipped */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: -16, position: 'relative', zIndex: 2 }}>
          <div style={{ background: '#E8B84B', color: '#0D1B2A', padding: '6px 20px', borderRadius: 100, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Most popular
          </div>
        </div>

        {/* Plan card — no overflow:hidden so badge isn't clipped */}
        <div style={{ background: '#0D1B2A', borderRadius: 24, padding: '40px 40px 36px', marginBottom: 20, boxShadow: '0 24px 64px rgba(13,27,42,0.25)', position: 'relative' }}>

          <div style={{ textAlign: 'center', marginBottom: 28, marginTop: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Monthly subscription</div>
            <div style={{ fontSize: 56, fontWeight: 900, color: '#E8B84B', lineHeight: 1 }}>$9.99</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>per month · AUD · cancel anytime</div>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 24 }}></div>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {[
              'Unlimited tests from our question bank',
              'Full simulated timed exams (ACER, AAST, Edutest, NAPLAN)',
              'All 4 subjects — Years 1 to 11',
              'AI personalised strengths & weaknesses analysis',
              'Full writing AI feedback & scoring',
              'Progress Report Dashboard',
              'Cancel anytime — no lock-in',
            ].map((f, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.75)', alignItems: 'flex-start' }}>
                <span style={{ color: '#E8B84B', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                {f}
              </li>
            ))}
          </ul>

          {error && (
            <div style={{ background: 'rgba(224,122,95,0.2)', border: '1px solid rgba(224,122,95,0.4)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#F0A898' }}>
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleSubscribe}
            disabled={loading}
            style={{
              width: '100%', padding: '16px 0', borderRadius: 100, fontSize: 17, fontWeight: 700,
              background: '#E8B84B', color: '#0D1B2A', border: 'none', cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s'
            }}
          >
            {loading ? 'Redirecting to checkout...' : 'Subscribe now — $9.99/month →'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            Secure payment via Stripe · Cancel anytime from your account
          </div>
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/app')} style={{ fontSize: 13, color: '#5A6A7A', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            ← Back to app
          </button>
        </div>
      </div>
    </div>
  );
}