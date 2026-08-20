import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

function StatCard({ label, value, sub, color = '#4338CA' }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 900, color, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6, fontFamily: 'Inter, sans-serif' }}>{sub}</div>}
    </div>
  );
}

function SignupTrendChart({ data }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100, marginTop: 12 }}>
      {data.map((d) => (
        <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div title={`${d.date}: ${d.count}`} style={{
            width: '100%', background: d.count > 0 ? '#4338CA' : '#E5E7EB',
            borderRadius: 4, height: Math.max(4, (d.count / max) * 80),
          }} />
          <div style={{ fontSize: 9, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>{d.date.slice(8, 10)}</div>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) { navigate('/'); return; }

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch('/api/admin-stats', {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load stats');
        setStats(data);
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    })();
  }, [user, isAdmin, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: '#94A3B8' }}>
        Loading dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
          <div style={{ color: '#BE123C', marginBottom: 12 }}>{error}</div>
          <button onClick={() => navigate('/')} style={{ padding: '10px 20px', borderRadius: 100, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer' }}>Back home</button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#F5F7FF', fontFamily: "'Inter', 'DM Sans', sans-serif" }}>
      <Helmet><title>Admin Dashboard | ScholarPrep</title></Helmet>

      <div style={{ background: '#fff', borderBottom: '1px solid rgba(67,56,202,0.08)', padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📊</div>
        <div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 800, color: '#0F172A' }}>Admin Dashboard</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>User activity & signups</div>
        </div>
        <button onClick={() => navigate('/admin/paper-builder')} style={{ marginLeft: 'auto', padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer' }}>📄 Paper Builder</button>
        <button onClick={() => navigate('/app')} style={{ padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer' }}>← Back to app</button>
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 32 }}>
          <StatCard label="Total Users" value={stats.totalUsers} />
          <StatCard label="Subscribed" value={stats.subscribedCount} color="#059669" />
          <StatCard label="Trial Active" value={stats.trialActiveCount} color="#F97316" />
          <StatCard label="Trial Expired" value={stats.trialExpiredCount} color="#DC2626" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 32 }}>
          <StatCard label="New Signups (7d)" value={stats.newSignups7d} />
          <StatCard label="New Signups (30d)" value={stats.newSignups30d} />
          <StatCard label="Active Logins (7d)" value={stats.activeLastLogin7d} sub="Users who logged in this week" />
          <StatCard label="Never Logged In" value={stats.neverLoggedIn} sub="Signed up but never returned" color="#94A3B8" />
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid rgba(67,56,202,0.08)', marginBottom: 32 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Signups — last 14 days</div>
          <SignupTrendChart data={stats.signupsByDay} />
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid rgba(67,56,202,0.08)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Recent signups</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#94A3B8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '8px 12px 8px 0' }}>Email</th>
                  <th style={{ padding: '8px 12px' }}>Signed up</th>
                  <th style={{ padding: '8px 12px' }}>Last login</th>
                  <th style={{ padding: '8px 12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSignups.map((u, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '10px 12px 10px 0', color: '#0F172A', fontWeight: 600 }}>{u.email}</td>
                    <td style={{ padding: '10px 12px', color: '#64748B' }}>{new Date(u.createdAt).toLocaleDateString('en-AU')}</td>
                    <td style={{ padding: '10px 12px', color: '#64748B' }}>{u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleDateString('en-AU') : '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      {u.subscribed ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '3px 10px', borderRadius: 100 }}>Subscribed</span>
                      ) : u.trialActive ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#F97316', background: '#FFF7ED', padding: '3px 10px', borderRadius: 100 }}>Trial</span>
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', background: '#F1F5F9', padding: '3px 10px', borderRadius: 100 }}>Expired</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}