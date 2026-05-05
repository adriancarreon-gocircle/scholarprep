import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isSubscribed, trialDaysLeft } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSaveName = async () => {
    setSaving(true);
    setError('');
    setSaveSuccess(false);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name }
      });
      if (error) throw error;
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      setError('Failed to save name. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    setError('');
    try {
      const customerId = user?.user_metadata?.stripe_customer_id;
      if (!customerId) {
        setError('No subscription found. Please subscribe first.');
        setPortalLoading(false);
        return;
      }

      const response = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          returnUrl: `${window.location.origin}/profile`,
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      window.location.href = data.url;
    } catch (e) {
      setError('Failed to open subscription portal. Please try again.');
      setPortalLoading(false);
    }
  };

  const subscribedAt = user?.user_metadata?.subscribed_at
    ? new Date(user.user_metadata.subscribed_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  // Estimate next billing date (roughly 30 days after subscription start)
  const nextBilling = user?.user_metadata?.subscribed_at
    ? (() => {
        const start = new Date(user.user_metadata.subscribed_at);
        const next = new Date(start);
        const now = new Date();
        while (next <= now) next.setMonth(next.getMonth() + 1);
        return next.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
      })()
    : null;

  return (
    <div>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(13,27,42,0.08)', padding: '20px 32px' }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 900, color: '#0D1B2A' }}>👤 My Account</div>
        <div style={{ fontSize: 14, color: '#5A6A7A', marginTop: 2 }}>Manage your profile and subscription</div>
      </div>

      <div style={{ padding: 32, maxWidth: 640 }}>
        {error && (
          <div style={{ background: '#FDEAEA', border: '1px solid #E07A5F', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#B04030' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Subscription status */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 20, border: '1px solid rgba(13,27,42,0.08)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>Subscription</div>

          {isSubscribed ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: '#E8F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>✅</div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#0D1B2A' }}>Active Subscription</div>
                  <div style={{ fontSize: 13, color: '#2D6A4F', fontWeight: 600 }}>$9.99/month · ScholarPrep Unlimited</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {subscribedAt && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '10px 0', borderBottom: '1px solid rgba(13,27,42,0.06)' }}>
                    <span style={{ color: '#5A6A7A' }}>Subscribed on</span>
                    <span style={{ fontWeight: 600, color: '#0D1B2A' }}>{subscribedAt}</span>
                  </div>
                )}
                {nextBilling && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '10px 0', borderBottom: '1px solid rgba(13,27,42,0.06)' }}>
                    <span style={{ color: '#5A6A7A' }}>Next billing date</span>
                    <span style={{ fontWeight: 600, color: '#0D1B2A' }}>{nextBilling}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '10px 0' }}>
                  <span style={{ color: '#5A6A7A' }}>Plan</span>
                  <span style={{ fontWeight: 600, color: '#0D1B2A' }}>Unlimited · All subjects · Years 1–11</span>
                </div>
              </div>

              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                style={{
                  width: '100%', padding: '12px 0', borderRadius: 100, fontSize: 14, fontWeight: 700,
                  background: '#0D1B2A', color: '#fff', border: 'none', cursor: portalLoading ? 'default' : 'pointer',
                  opacity: portalLoading ? 0.7 : 1
                }}
              >
                {portalLoading ? 'Opening portal...' : '⚙️ Manage subscription → (cancel, update payment, view invoices)'}
              </button>
              <div style={{ fontSize: 12, color: '#5A6A7A', textAlign: 'center', marginTop: 8 }}>
                You'll be taken to Stripe's secure billing portal
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: '#FEF3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⏰</div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#0D1B2A' }}>Free Trial</div>
                  <div style={{ fontSize: 13, color: '#A07010', fontWeight: 600 }}>{trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} remaining</div>
                </div>
              </div>
              <div style={{ fontSize: 14, color: '#5A6A7A', marginBottom: 20, lineHeight: 1.6 }}>
                Your free trial gives you full access to all subjects, AI analysis, and the question bank. Upgrade to keep access after your trial ends.
              </div>
              <button
                onClick={() => navigate('/subscribe')}
                style={{ width: '100%', padding: '12px 0', borderRadius: 100, fontSize: 14, fontWeight: 700, background: '#E8B84B', color: '#0D1B2A', border: 'none', cursor: 'pointer' }}
              >
                Upgrade to $9.99/month →
              </button>
            </>
          )}
        </div>

        {/* Profile details */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 20, border: '1px solid rgba(13,27,42,0.08)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 20 }}>Profile details</div>

          {/* Name */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#5A6A7A', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ flex: 1, padding: '11px 16px', border: '1.5px solid rgba(13,27,42,0.12)', borderRadius: 10, fontSize: 15, outline: 'none', fontFamily: 'inherit' }}
                placeholder="Your name"
              />
              <button
                onClick={handleSaveName}
                disabled={saving}
                style={{ padding: '11px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700, background: '#0D1B2A', color: '#fff', border: 'none', cursor: 'pointer', opacity: saving ? 0.7 : 1, whiteSpace: 'nowrap' }}
              >
                {saving ? 'Saving...' : saveSuccess ? '✓ Saved!' : 'Save'}
              </button>
            </div>
          </div>

          {/* Email (read only) */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#5A6A7A', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
            <div style={{ padding: '11px 16px', border: '1.5px solid rgba(13,27,42,0.06)', borderRadius: 10, fontSize: 15, color: '#5A6A7A', background: '#FAF6EE' }}>
              {user?.email}
            </div>
            <div style={{ fontSize: 12, color: '#9AA5B0', marginTop: 4 }}>Email cannot be changed</div>
          </div>
        </div>

        {/* Account info */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid rgba(13,27,42,0.08)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>Account info</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '8px 0', borderBottom: '1px solid rgba(13,27,42,0.06)' }}>
              <span style={{ color: '#5A6A7A' }}>Member since</span>
              <span style={{ fontWeight: 600, color: '#0D1B2A' }}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '8px 0' }}>
              <span style={{ color: '#5A6A7A' }}>Account status</span>
              <span style={{ fontWeight: 600, color: isSubscribed ? '#2D6A4F' : '#A07010' }}>
                {isSubscribed ? '✅ Subscribed' : `⏰ Trial (${trialDaysLeft} days left)`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
