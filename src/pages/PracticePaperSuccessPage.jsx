import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function PracticePaperSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [downloads, setDownloads] = useState([]);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) { setStatus('error'); setError('Missing checkout session.'); return; }
    (async () => {
      try {
        const res = await fetch(`/api/paper-download?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not verify your purchase');
        setDownloads(data.downloads);
        setEmail(data.email);
        setStatus('ready');
      } catch (e) {
        setError(e.message);
        setStatus('error');
      }
    })();
  }, [sessionId]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F7FF 50%, #FFF7ED 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Inter', sans-serif" }}>
      <Helmet><title>Your Practice Papers | ScholarPrep</title></Helmet>
      <div style={{ maxWidth: 520, width: '100%', background: '#fff', borderRadius: 24, padding: 40, textAlign: 'center', boxShadow: '0 8px 40px rgba(67,56,202,0.1)' }}>

        {status === 'loading' && (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
            <div style={{ fontSize: 16, color: '#64748B' }}>Confirming your purchase…</div>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Something went wrong</div>
            <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>{error}</p>
            <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 24 }}>If you were charged, check your email for a copy — or contact support and we'll sort it out right away.</p>
            <Link to="/support" style={{ display: 'inline-block', padding: '11px 24px', borderRadius: 100, fontSize: 14, fontWeight: 700, background: '#4338CA', color: '#fff', textDecoration: 'none' }}>Contact support</Link>
          </>
        )}

        {status === 'ready' && (
          <>
            <div style={{ fontSize: 44, marginBottom: 16 }}>🎉</div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Your practice papers are ready!</div>
            <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, marginBottom: 24 }}>
              We've also emailed a copy to <strong>{email}</strong>. Download links below are valid for 7 days.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {downloads.map((d, i) => (
                <a key={i} href={d.url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px',
                  background: '#F8FAFC', borderRadius: 12, border: '1px solid #E5E7EB', textDecoration: 'none',
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>📄 {d.title}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#4338CA' }}>Download →</span>
                </a>
              ))}
            </div>
            <button onClick={() => navigate('/practice-papers')} style={{ padding: '11px 24px', borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer' }}>
              Back to Practice Papers
            </button>
          </>
        )}
      </div>
    </div>
  );
}
