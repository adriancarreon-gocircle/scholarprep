import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PRACTICE_PAPER_LEVELS } from '../data/practicePapers';

export default function PracticePapersPage() {
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState('');

  const handleBuy = async (kind, levelSlug, paperId) => {
    setError('');
    setLoadingId(paperId || `${levelSlug}-bundle`);
    try {
      const res = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: kind === 'bundle' ? 'practice-paper-bundle' : 'practice-paper',
          levelSlug,
          paperId,
          successUrl: `${window.location.origin}/practice-papers/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/practice-papers`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      window.location.href = data.url;
    } catch (e) {
      setError(e.message);
      setLoadingId(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter', 'DM Sans', sans-serif" }}>
      <Helmet>
        <title>Printable Practice Test Papers | ScholarPrep</title>
        <meta name="description" content="Full-length printable practice exam papers for Australian selective entry preparation — Reading, English, Maths and General Ability in one booklet, with a complete answer key." />
        <meta property="og:title" content="Printable Practice Test Papers | ScholarPrep" />
        <meta property="og:url" content="https://scholarprep.com.au/practice-papers" />
        <link rel="canonical" href="https://scholarprep.com.au/practice-papers" />
      </Helmet>

      <nav style={{ background: '#fff', borderBottom: '1px solid #F3F4F6', padding: '14px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 900, color: '#0F172A' }}>Scholar<span style={{ color: '#4338CA' }}>Prep</span></span>
        </Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/login" style={{ fontSize: 14, color: '#64748B', textDecoration: 'none', fontWeight: 600 }}>Log in</Link>
          <Link to="/signup" style={{ fontSize: 14, fontWeight: 700, color: '#fff', background: '#4338CA', padding: '8px 20px', borderRadius: 100, textDecoration: 'none' }}>Start free trial</Link>
        </div>
      </nav>

      <header style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #fff 100%)', padding: '64px 40px 48px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📘</div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(30px, 5vw, 42px)', fontWeight: 900, color: '#0F172A', letterSpacing: -1, marginBottom: 14 }}>Printable Practice Test Papers</h1>
          <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>
            Full-length exam booklets — Reading, English, Mathematics and General Ability in one paper, with a cover page, contents, and a complete worked answer key. No subscription needed.
          </p>
        </div>
      </header>

      {error && (
        <div style={{ maxWidth: 800, margin: '20px auto 0', padding: '12px 20px', background: '#FFF1F2', border: '1px solid #FDA4AF', borderRadius: 12, color: '#BE123C', fontSize: 14 }}>{error}</div>
      )}

      {PRACTICE_PAPER_LEVELS.map(level => (
        <section key={level.level} style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 40px' }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 26, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>{level.label}</h2>
            <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6, maxWidth: 640 }}>{level.description}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
            {level.papers.map(paper => (
              <div key={paper.id} style={{
                background: '#fff', borderRadius: 16, padding: 22, border: '1px solid rgba(67,56,202,0.1)',
                boxShadow: '0 2px 10px rgba(67,56,202,0.05)', display: 'flex', flexDirection: 'column',
                opacity: paper.available ? 1 : 0.6,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#4338CA', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{paper.examStyle}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{paper.title}</div>
                <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 16 }}>{paper.questionCount} questions · 4 subjects</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', marginBottom: 16, marginTop: 'auto', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>${paper.price.toFixed(2)}</div>
                {paper.available ? (
                  <button
                    onClick={() => handleBuy('single', level.level, paper.id)}
                    disabled={loadingId === paper.id}
                    style={{ padding: '10px 16px', borderRadius: 100, fontSize: 14, fontWeight: 700, background: '#4338CA', color: '#fff', border: 'none', cursor: loadingId === paper.id ? 'default' : 'pointer' }}
                  >
                    {loadingId === paper.id ? 'Loading…' : 'Buy now →'}
                  </button>
                ) : (
                  <div style={{ padding: '10px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700, background: '#F1F5F9', color: '#94A3B8', textAlign: 'center' }}>
                    Coming soon
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #4338CA 0%, #3730A3 100%)', borderRadius: 20, padding: '28px 32px',
            display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Best value</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Get all 5 {level.label} papers</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Save ${(level.papers.reduce((s, p) => s + p.price, 0) - level.bundlePrice).toFixed(2)} compared to buying individually</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>${level.bundlePrice.toFixed(2)}</div>
              <button
                onClick={() => handleBuy('bundle', level.level, null)}
                disabled={loadingId === `${level.level}-bundle`}
                style={{ padding: '12px 24px', borderRadius: 100, fontSize: 14, fontWeight: 700, background: '#fff', color: '#4338CA', border: 'none', cursor: 'pointer' }}
              >
                {loadingId === `${level.level}-bundle` ? 'Loading…' : 'Buy bundle →'}
              </button>
            </div>
          </div>
        </section>
      ))}

      <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 40px 64px', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7 }}>
          Prefer unlimited practice instead? Check out our <Link to="/signup" style={{ color: '#4338CA', fontWeight: 600 }}>monthly subscription</Link> or our <Link to="/pdf-generator" style={{ color: '#4338CA', fontWeight: 600 }}>pay-per-question PDF generator</Link>.
        </p>
      </section>

      <footer style={{ background: '#F8FAFC', borderTop: '1px solid #F3F4F6', padding: '32px 40px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#94A3B8' }}>© {new Date().getFullYear()} Go Circle Pty Ltd · <Link to="/" style={{ color: '#94A3B8' }}>scholarprep.com.au</Link></p>
      </footer>
    </div>
  );
}
