import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Progress dashboard mock data
  const topics = [
    { name: 'Number operations', pct: 71, grade: 'B', status: 'Above average', statusColor: '#059669', feedback: 'Good work — slightly above average. A few more targeted sessions will consolidate this further.' },
    { name: 'Fractions & decimals', pct: 57, grade: 'C+', status: 'At average', statusColor: '#F97316', feedback: 'On track with the national average. Regular practice will push you above the benchmark.' },
    { name: 'Percentages', pct: 73, grade: 'B', status: 'Above average', statusColor: '#059669', feedback: 'Good work — slightly above average. A few more targeted sessions will consolidate this further.' },
    { name: 'Geometry', pct: 59, grade: 'C+', status: 'Below average', statusColor: '#EF4444', feedback: 'Below average. Focus here — complete 2–3 short targeted tests on Geometry to lift your score.' },
    { name: 'Measurement', pct: 75, grade: 'B+', status: 'Above average', statusColor: '#059669', feedback: 'Good work — slightly above average. A few more targeted sessions will consolidate this further.' },
    { name: 'Word problems', pct: 61, grade: 'C+', status: 'At average', statusColor: '#F97316', feedback: 'On track with the national average. Regular practice will push you above the benchmark.' },
  ];

  const getBandColor = (pct) => {
    if (pct < 40) return '#EF4444';
    if (pct < 60) return '#F97316';
    if (pct < 80) return '#10B981';
    return '#059669';
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }

        @keyframes float2 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }

        .fade-1 { animation: fadeUp 0.7s ease both; }
        .fade-2 { animation: fadeUp 0.7s 0.1s ease both; }
        .fade-3 { animation: fadeUp 0.7s 0.2s ease both; }
        .fade-4 { animation: fadeUp 0.7s 0.3s ease both; }

        .nav-link { font-size: 14px; font-weight: 500; color: #6B7280; text-decoration: none; transition: color 0.15s; font-family: 'Inter', sans-serif; }
        .nav-link:hover { color: #111827; }

        .cta-primary {
          display: inline-flex; align-items: center; gap: 6px;
          background: #4338CA; color: #fff;
          padding: 13px 26px; border-radius: 100px;
          font-size: 15px; font-weight: 600; font-family: 'Inter', sans-serif;
          border: none; cursor: pointer;
          box-shadow: 0 4px 20px rgba(67,56,202,0.3); transition: all 0.2s;
        }
        .cta-primary:hover { background: #3730A3; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(67,56,202,0.4); }

        .cta-secondary {
          display: inline-flex; align-items: center;
          background: transparent; color: #374151;
          padding: 13px 26px; border-radius: 100px;
          font-size: 15px; font-weight: 600; font-family: 'Inter', sans-serif;
          border: 1.5px solid #E5E7EB; cursor: pointer; transition: all 0.2s;
        }
        .cta-secondary:hover { border-color: #9CA3AF; background: #F9FAFB; }

        .cta-orange {
          display: inline-flex; align-items: center; gap: 6px;
          background: #F97316; color: #fff;
          padding: 16px 40px; border-radius: 100px;
          font-size: 17px; font-weight: 700; font-family: 'Inter', sans-serif;
          border: none; cursor: pointer;
          box-shadow: 0 4px 20px rgba(249,115,22,0.35); transition: all 0.2s;
        }
        .cta-orange:hover { background: #EA6C0C; transform: translateY(-2px); }

        .feature-row {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 80px; align-items: center;
          padding: 80px 0; border-bottom: 1px solid #F3F4F6;
        }
        .feature-row:last-child { border-bottom: none; }

        .pricing-card { background: #fff; border-radius: 24px; padding: 36px; border: 1px solid #E5E7EB; transition: box-shadow 0.2s; }
        .pricing-card:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.08); }

        .check-item { display: flex; gap: 10px; font-size: 14px; color: #4B5563; font-family: 'Inter', sans-serif; align-items: flex-start; }

        .mesh-gradient {
          background:
            radial-gradient(ellipse at 20% 50%, rgba(167,139,250,0.15) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 60% 80%, rgba(249,115,22,0.08) 0%, transparent 50%),
            #F9FAFB;
        }

        /* Band chart */
        .band-track {
          display: grid; grid-template-columns: 1fr 1fr 1fr 1fr;
          height: 20px; border-radius: 6px; overflow: hidden; position: relative;
        }
        .band-seg { display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 600; color: rgba(255,255,255,0.8); font-family: 'Inter', sans-serif; }

        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-screenshot { display: none !important; }
          .feature-row { grid-template-columns: 1fr !important; gap: 40px !important; padding: 60px 0 !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .nav-links-d { display: none !important; }
          .nav-cta-d { display: none !important; }
          .nav-burger { display: flex !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .dashboard-mockup { transform: none !important; }
          .dash-topic-grid { grid-template-columns: 1fr 80px !important; }
          .dash-feedback { display: none !important; }
          .dash-header-score { display: none !important; }
          .dash-header-feedback { display: none !important; }
        }
        @media (min-width: 769px) { .nav-burger { display: none !important; } }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 60,
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 900, color: '#111827', letterSpacing: -0.5 }}>
          Scholar<span style={{ color: '#4338CA' }}>Prep</span>
        </div>
        <div className="nav-links-d" style={{ display: 'flex', gap: 32 }}>
          {['Features', 'Subjects', 'Pricing'].map(l => <a key={l} href={`#${l.toLowerCase()}`} className="nav-link">{l}</a>)}
        </div>
        <div className="nav-cta-d" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', fontSize: 14, fontWeight: 600, color: '#6B7280', cursor: 'pointer', padding: '8px 14px', fontFamily: 'Inter, sans-serif' }}>Log in</button>
          <button onClick={() => navigate('/signup')} className="cta-primary" style={{ padding: '10px 20px', fontSize: 14 }}>Start free trial</button>
        </div>
        <button className="nav-burger" onClick={() => setMenuOpen(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'none', flexDirection: 'column', gap: 5, padding: 4 }}>
          {[0, 1, 2].map(i => <span key={i} style={{ display: 'block', width: 22, height: 2, background: '#111827', borderRadius: 2 }} />)}
        </button>
      </nav>

      {menuOpen && (
        <div style={{ position: 'fixed', top: 60, left: 0, right: 0, zIndex: 99, background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          {['Features', 'Subjects', 'Pricing'].map(l => <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)} style={{ fontSize: 16, fontWeight: 600, color: '#111827', textDecoration: 'none' }}>{l}</a>)}
          <button onClick={() => navigate('/signup')} className="cta-primary" style={{ justifyContent: 'center' }}>Start free trial</button>
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{ paddingTop: 100, paddingBottom: 0, background: '#fff', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 40px' }}>
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'flex-end' }}>

            <div style={{ paddingBottom: 80 }}>
              <div className="fade-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F5F3FF', border: '1px solid #DDD6FE', color: '#4338CA', padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, marginBottom: 32, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Inter, sans-serif' }}>
                ✦ Trusted by Australian families
              </div>
              <h1 className="fade-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(36px, 5vw, 66px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: -2, color: '#111827', marginBottom: 24 }}>
                The exam prep for every<br />
                <span style={{ background: 'linear-gradient(135deg, #4338CA, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Australian student.</span>
              </h1>
              <p className="fade-3" style={{ fontSize: 17, lineHeight: 1.75, color: '#6B7280', marginBottom: 40, maxWidth: 460, fontFamily: 'Inter, sans-serif' }}>
                Prepare for ACER, AAST, Edutest, NAPLAN and selective entry high schools with fresh practice questions, personalised feedback and full simulated exams — for Years 1 to 11.
              </p>
              <div className="fade-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
                <button onClick={() => navigate('/signup')} className="cta-primary" style={{ padding: '15px 32px', fontSize: 16 }}>Start free — 7 days →</button>
                <button onClick={() => navigate('/login')} className="cta-secondary" style={{ padding: '15px 24px', fontSize: 15 }}>Log in</button>
              </div>
              <div className="fade-4" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13, color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>
                {['No credit card required', 'Full access for 7 days', 'Cancel anytime'].map(t => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ color: '#10B981', fontWeight: 700 }}>✓</span> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* App mockup */}
            <div className="hero-screenshot" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
              <div style={{ position: 'absolute', top: 40, left: -10, zIndex: 3, background: '#fff', borderRadius: 16, padding: '12px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 10, animation: 'float2 5s ease-in-out infinite', border: '1px solid #F3F4F6' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📈</div>
                <div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>Progress this week</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#10B981', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>+18% improvement</div>
                </div>
              </div>
              <div style={{ position: 'absolute', top: 60, right: -20, zIndex: 3, background: '#fff', borderRadius: 16, padding: '12px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 10, animation: 'float2 5s 1.5s ease-in-out infinite', border: '1px solid #F3F4F6' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏆</div>
                <div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>Last score</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#4338CA', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>92% · Maths</div>
                </div>
              </div>
              <div style={{ background: '#fff', borderRadius: '24px 24px 0 0', boxShadow: '0 0 0 1px #F3F4F6, 0 40px 100px rgba(0,0,0,0.12)', overflow: 'hidden', width: '100%', maxWidth: 480 }}>
                <div style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['#FF5F57', '#FFBD2E', '#28CA41'].map((c, i) => <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
                  </div>
                  <div style={{ flex: 1, background: '#fff', borderRadius: 8, padding: '5px 12px', fontSize: 12, color: '#9CA3AF', fontFamily: 'Inter, sans-serif', border: '1px solid #E5E7EB', marginLeft: 8 }}>scholarprep.com.au/app/maths</div>
                </div>
                <div style={{ padding: 20, background: '#F5F7FF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>Question 3 of 10 · Mathematics</div>
                    <div style={{ background: '#EEF2FF', color: '#4338CA', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>⏱ 14:22</div>
                  </div>
                  <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2, marginBottom: 16, overflow: 'hidden' }}>
                    <div style={{ width: '30%', height: '100%', background: '#4338CA', borderRadius: 2 }} />
                  </div>
                  <div style={{ background: '#fff', borderRadius: 14, padding: 16, fontSize: 14, color: '#111827', lineHeight: 1.65, marginBottom: 12, fontFamily: 'Inter, sans-serif', fontWeight: 500, border: '1px solid rgba(67,56,202,0.07)' }}>
                    Adam's car travels at 70 km/h. How far has it traveled from 9am to 3:30pm?
                  </div>
                  {[{ l: 'A', t: '225 km', s: false }, { l: 'B', t: '455 km', s: true }, { l: 'C', t: '570 km', s: false }, { l: 'D', t: '630 km', s: false }].map(o => (
                    <div key={o.l} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 10, marginBottom: 6, background: o.s ? '#ECFDF5' : '#fff', border: `1.5px solid ${o.s ? '#6EE7B7' : '#E5E7EB'}`, fontSize: 13, color: o.s ? '#059669' : '#4B5563', fontFamily: 'Inter, sans-serif' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, background: o.s ? '#059669' : '#F3F4F6', color: o.s ? '#fff' : '#6B7280' }}>{o.l}</div>
                      <span style={{ fontWeight: o.s ? 600 : 400 }}>{o.t}</span>
                      {o.s && <span style={{ marginLeft: 'auto' }}>✓</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EXAMS BAR ── */}
      <div style={{ background: '#111827', padding: '16px 40px', display: 'flex', alignItems: 'center', gap: 20, overflowX: 'auto' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>Prepares you for</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['ACER', 'AAST', 'Edutest', 'NAPLAN', 'Selective Entry'].map(t => (
            <div key={t} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>{t}</div>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <section style={{ background: '#fff', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 40px' }}>
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              { n: 'Years 1–11', l: 'All year levels covered' },
              { n: '4 Subjects', l: 'Maths, Reading, GA & Writing' },
              { n: 'Unlimited', l: 'Fresh questions every session' },
              { n: '$9.99/mo', l: 'Less than one tutoring hour' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '32px 24px', borderRight: i < 3 ? '1px solid #F3F4F6' : 'none' }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: 900, color: '#111827', letterSpacing: -1, marginBottom: 4 }}>{s.n}</div>
                <div style={{ fontSize: 13, color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SELECTIVE SCHOOLS ── */}
      <div style={{ background: '#F9FAFB', padding: '18px 40px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>Selective entry prep for</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['Melbourne High', "Mac.Robertson Girls'", 'Suzanne Cory', 'North Sydney Boys', 'North Sydney Girls', 'James Ruse Agricultural', 'Normanhurst Boys'].map(s => (
              <div key={s} style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, color: '#4338CA', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>{s}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PROGRESS DASHBOARD FEATURE — Large mockup ── */}
      <section style={{ background: '#F9FAFB', padding: '96px 40px 0' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>

          {/* Text above */}
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: '#EEF2FF', color: '#4338CA', padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>
              Progress Report Dashboard
            </div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900, letterSpacing: -1.5, color: '#111827', marginBottom: 16, lineHeight: 1.1 }}>
              Know exactly where your child<br />stands — and what to do next.
            </h2>
            <p style={{ fontSize: 17, color: '#6B7280', lineHeight: 1.75, maxWidth: 560, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
              Our Progress Report Dashboard gives you more detailed insight than any teacher or tutor.
              See every topic scored, graded, and benchmarked against the national average — with specific recommendations for improvement.
            </p>
          </div>

          {/* 3 callout badges above dashboard */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
            {[
              { icon: '📊', label: 'Topic-by-topic breakdown' },
              { icon: '🎯', label: 'vs National average' },
              { icon: '💬', label: 'Specific improvement tips' },
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E5E7EB', padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, color: '#374151', fontFamily: 'Inter, sans-serif', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <span>{b.icon}</span> {b.label}
              </div>
            ))}
          </div>

          {/* ── LARGE DASHBOARD MOCKUP ── */}
          <div className="dashboard-mockup" style={{ background: '#fff', borderRadius: '24px 24px 0 0', boxShadow: '0 0 0 1px #E5E7EB, 0 -8px 60px rgba(67,56,202,0.1)', overflow: 'hidden' }}>

            {/* Browser chrome */}
            <div style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#FF5F57', '#FFBD2E', '#28CA41'].map((c, i) => <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
              </div>
              <div style={{ flex: 1, background: '#fff', borderRadius: 8, padding: '5px 16px', fontSize: 13, color: '#9CA3AF', fontFamily: 'Inter, sans-serif', border: '1px solid #E5E7EB', marginLeft: 12, maxWidth: 340 }}>
                scholarprep.com.au/app/progress
              </div>
            </div>

            {/* Dashboard content */}
            <div style={{ padding: '28px 32px', background: '#F5F7FF' }}>

              {/* Page title */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Progress Report Dashboard</h3>
                <p style={{ fontSize: 13, color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>Track your strengths and weaknesses across all subjects and topics</p>
              </div>

              {/* Subject header card */}
              <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', marginBottom: 4, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🔢</div>
                  <div>
                    <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 18, fontWeight: 800, color: '#111827' }}>Mathematics</div>
                    <div style={{ fontSize: 13, color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>2 sessions · 10 questions attempted</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 32, fontWeight: 900, color: '#059669', lineHeight: 1 }}>70%</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#059669', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>B</div>
                  <div style={{ fontSize: 12, color: '#059669', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>↑ +6% vs national avg (64%)</div>
                </div>
              </div>

              {/* Column headers */}
              <div className="dash-topic-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 100px 1fr', gap: 0, padding: '10px 16px', background: '#F9FAFB', borderLeft: '1px solid #E5E7EB', borderRight: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  Topic
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, textTransform: 'none', letterSpacing: 0, fontSize: 10 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4338CA', display: 'inline-block' }}></span> Score
                    <span style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid #9CA3AF', display: 'inline-block', marginLeft: 4 }}></span> Avg
                  </span>
                </div>
                <div className="dash-header-score" style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>Score</div>
                <div className="dash-feedback dash-header-feedback" style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif' }}>Feedback</div>
              </div>

              {/* Topic rows */}
              {topics.map((t, i) => {
                const nationalAvg = 64;
                const studentPos = `${t.pct}%`;
                const nationalPos = `${nationalAvg}%`;
                return (
                  <div key={i} className="dash-topic-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 100px 1fr', gap: 0, padding: '14px 16px', background: '#fff', borderLeft: '1px solid #E5E7EB', borderRight: '1px solid #E5E7EB', borderBottom: '1px solid #F3F4F6', alignItems: 'center' }}>

                    {/* Band chart */}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 10, fontFamily: 'Inter, sans-serif' }}>{t.name}</div>
                      <div style={{ position: 'relative', marginBottom: 4 }}>
                        {/* Band track */}
                        <div style={{ display: 'flex', height: 18, borderRadius: 5, overflow: 'hidden' }}>
                          <div style={{ flex: 1, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#EF4444', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Below</div>
                          <div style={{ flex: 1, background: '#FEF9C3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#A16207', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Developing</div>
                          <div style={{ flex: 1, background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#059669', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Proficient</div>
                          <div style={{ flex: 1, background: '#BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#065F46', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Advanced</div>
                        </div>
                        {/* National avg marker */}
                        <div style={{ position: 'absolute', top: -3, left: nationalPos, transform: 'translateX(-50%)', width: 14, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2.5px solid #9CA3AF', background: '#fff' }} />
                        </div>
                        {/* Student score marker */}
                        <div style={{ position: 'absolute', top: -3, left: studentPos, transform: 'translateX(-50%)', width: 14, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: 14, height: 14, borderRadius: '50%', background: getBandColor(t.pct), boxShadow: `0 0 0 2px white, 0 0 0 3px ${getBandColor(t.pct)}` }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9CA3AF', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>
                        <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                      </div>
                    </div>

                    {/* Score + grade */}
                    <div style={{ textAlign: 'center', padding: '0 12px' }}>
                      <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 900, color: getBandColor(t.pct), lineHeight: 1 }}>{t.pct}%</div>
                      <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 16, fontWeight: 800, color: getBandColor(t.pct) }}>{t.grade}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: t.statusColor, fontFamily: 'Inter, sans-serif', marginTop: 2 }}>{t.status}</div>
                    </div>

                    {/* Feedback */}
                    <div className="dash-feedback" style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, fontFamily: 'Inter, sans-serif', paddingLeft: 8 }}>{t.feedback}</div>
                  </div>
                );
              })}

              {/* AI Analysis banner */}
              <div style={{ background: '#1E293B', borderLeft: '1px solid #334155', borderRight: '1px solid #334155', borderBottom: '1px solid #334155', borderRadius: '0 0 16px 16px', padding: '18px 24px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#4338CA', marginBottom: 8, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  📊 Analysis — Mathematics
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>
                  Performing at or just above the national average. <strong style={{ color: '#fff' }}>Strengths:</strong> Number operations, Percentages, Measurement.
                  <strong style={{ color: '#FCD34D' }}> Focus needed:</strong> Geometry and Fractions & decimals — complete 2–3 short targeted tests to lift these scores.
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ background: '#fff', padding: '0 40px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ paddingTop: 96, paddingBottom: 64, textAlign: 'center', borderBottom: '1px solid #F3F4F6' }}>
            <div style={{ display: 'inline-block', background: '#F5F3FF', color: '#4338CA', padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>Features</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(30px, 4vw, 54px)', fontWeight: 900, letterSpacing: -1.5, color: '#111827', marginBottom: 16, lineHeight: 1.1 }}>
              Everything your child needs.<br />Nothing they don't.
            </h2>
            <p style={{ fontSize: 17, color: '#6B7280', lineHeight: 1.75, maxWidth: 520, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
              Unlike printed workbooks, ScholarPrep generates new questions every session — so your child never runs out of practice.
            </p>
          </div>

          {[
            {
              icon: '🔢', accent: '#4338CA', bg: '#EEF2FF',
              label: 'Unlimited Question Bank',
              title: 'Never run out of practice questions.',
              desc: 'Fresh, curriculum-aligned questions generated every single session. No two tests are ever the same — so your child always has something new to work on, no matter how much they practise.',
              visual: (
                <div style={{ background: '#F5F7FF', borderRadius: 20, padding: 24, border: '1px solid #E0E7FF' }}>
                  {['Mathematics · Year 6', 'Reading · Year 5', 'General Ability · Year 7', 'Writing · Year 6'].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fff', borderRadius: 12, marginBottom: 8, border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: ['#4338CA', '#059669', '#F97316', '#F43F5E'][i], flexShrink: 0 }} />
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', fontFamily: 'Inter, sans-serif', flex: 1 }}>{s}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>∞ questions</div>
                    </div>
                  ))}
                  <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#4338CA', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Fresh questions generated every session ✦</div>
                </div>
              )
            },
            {
              icon: '🎯', accent: '#7C3AED', bg: '#F5F3FF', reverse: true,
              label: 'Full Simulated Exams',
              title: 'Sit the real exam — before exam day.',
              desc: 'ScholarPrep replicates the exact conditions of the real test centre — timed sections, scheduled breaks, and multiple papers in one sitting. So on exam day, your child already knows exactly what to expect.',
              visual: (
                <div style={{ background: '#F5F3FF', borderRadius: 20, padding: 24, border: '1px solid #DDD6FE' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#7C3AED', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif' }}>ACER Selective Entrance Exam</div>
                  {[
                    { time: '60 min', label: 'Maths & Quantitative Reasoning', type: 'exam', color: '#4338CA' },
                    { time: '20 min', label: 'Break', type: 'break' },
                    { time: '55 min', label: 'Reading & Verbal Reasoning', type: 'exam', color: '#059669' },
                    { time: '5 min', label: 'Break', type: 'break' },
                    { time: '40 min', label: 'Writing', type: 'exam', color: '#7C3AED' },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 14px', background: s.type === 'break' ? 'transparent' : '#fff', borderRadius: 10, marginBottom: 6, border: s.type === 'break' ? '1px dashed #DDD6FE' : '1px solid #E5E7EB', boxShadow: s.type === 'break' ? 'none' : '0 1px 3px rgba(0,0,0,0.04)' }}>
                      <div style={{ minWidth: 52, fontSize: 13, fontWeight: 800, color: s.type === 'break' ? '#C4B5FD' : s.color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.time}</div>
                      <div style={{ fontSize: 13, color: s.type === 'break' ? '#A78BFA' : '#374151', fontStyle: s.type === 'break' ? 'italic' : 'normal', fontFamily: 'Inter, sans-serif' }}>{s.label}</div>
                      {s.type === 'exam' && <div style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: s.color, background: `${s.color}15`, padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>Timed</div>}
                    </div>
                  ))}
                </div>
              )
            },
            {
              icon: '📄', accent: '#F97316', bg: '#FFF7ED',
              label: 'PDF Test Generator',
              title: 'Print a professional exam in seconds.',
              desc: 'Generate a polished, exam-style PDF for any subject and year level — complete with answer key and full explanations. Perfect for tutors, classrooms, or offline practice. Just 15¢ per question, no subscription needed.',
              visual: (
                <div style={{ background: '#FFF7ED', borderRadius: 20, padding: 24, border: '1px solid #FED7AA' }}>
                  <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #E5E7EB', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 15, fontWeight: 800, color: '#111827' }}>ScholarPrep</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>scholarprep.com.au</div>
                    </div>
                    <div style={{ borderTop: '2px solid #111827', paddingTop: 12, marginBottom: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', fontFamily: 'Inter, sans-serif' }}>Mathematics Practice Test</div>
                      <div style={{ fontSize: 11, color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>Year 5 Level · 20 Questions</div>
                    </div>
                    {['Name: ___________________', 'Date: ___________________', 'Score: _______ / 20'].map((f, i) => (
                      <div key={i} style={{ fontSize: 12, color: '#374151', padding: '5px 0', borderBottom: '1px solid #F3F4F6', fontFamily: 'Inter, sans-serif' }}>{f}</div>
                    ))}
                    <div style={{ marginTop: 12, fontSize: 11, color: '#9CA3AF', fontFamily: 'Inter, sans-serif', fontStyle: 'italic' }}>Answer key & explanations on last page</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                    <div style={{ fontSize: 13, color: '#92400E', fontFamily: 'Inter, sans-serif' }}>20 questions × 15¢</div>
                    <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 900, color: '#F97316' }}>$3.00</div>
                  </div>
                </div>
              )
            },
          ].map((f, i) => (
            <div key={i} className="feature-row">
              <div style={{ order: f.reverse ? 2 : 1 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: f.bg, color: f.accent, padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>
                  <span>{f.icon}</span> {f.label}
                </div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 900, letterSpacing: -1, color: '#111827', marginBottom: 16, lineHeight: 1.2 }}>{f.title}</h3>
                <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.8, fontFamily: 'Inter, sans-serif', maxWidth: 440 }}>{f.desc}</p>
              </div>
              <div style={{ order: f.reverse ? 1 : 2 }}>{f.visual}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: '#F9FAFB', padding: '96px 40px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', background: '#EEF2FF', color: '#4338CA', padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>How it works</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, letterSpacing: -1, color: '#111827', lineHeight: 1.15 }}>Up and practising in 60 seconds.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
            {[
              { n: '01', t: 'Create an account', d: 'Sign up with your email. Start your 7-day free trial instantly — no credit card required.' },
              { n: '02', t: 'Choose your exam', d: 'Select your target exam, subject, and year level. Quick practice or full simulated sitting — your choice.' },
              { n: '03', t: 'Questions generated', d: 'Fresh questions from our unlimited question bank every time. No two tests are ever the same.' },
              { n: '04', t: 'Review & improve', d: 'Instant scores, topic-by-topic breakdown, and progress tracked across every session.' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 800, color: '#D1D5DB', letterSpacing: 1, marginBottom: 20 }}>{s.n}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 10, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.t}</div>
                <div style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.75, fontFamily: 'Inter, sans-serif' }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUBJECTS ── */}
      <section id="subjects" style={{ background: '#fff', padding: '96px 40px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', background: '#F5F3FF', color: '#7C3AED', padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>What's covered</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, letterSpacing: -1, color: '#111827', lineHeight: 1.15 }}>All four sections. Nothing left out.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {[
              { icon: '🔢', title: 'Mathematics', desc: 'Word problems, fractions, decimals, geometry, time, money and more — Years 1–11.', tags: ['Number & algebra', 'Measurement', 'Word problems', 'Geometry'], bg: '#EEF2FF', accent: '#4338CA' },
              { icon: '📖', title: 'Reading Comprehension', desc: 'Passages with inference, vocabulary, main idea and comprehension questions.', tags: ['Inference', 'Vocabulary', 'Main idea', "Author's purpose"], bg: '#ECFDF5', accent: '#059669' },
              { icon: '🧩', title: 'General Ability', desc: 'Verbal and non-verbal reasoning, pattern recognition, analogies and logical thinking.', tags: ['Verbal reasoning', 'Patterns', 'Analogies', 'Sequences'], bg: '#FFF7ED', accent: '#F97316' },
              { icon: '✏️', title: 'Writing', desc: 'Narrative and persuasive prompts with detailed marking feedback and scored criteria.', tags: ['Narrative', 'Persuasive', 'Detailed feedback', 'Scored criteria'], bg: '#FFF1F2', accent: '#F43F5E' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 18 }}>{s.icon}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 8, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.title}</div>
                <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.75, marginBottom: 16, fontFamily: 'Inter, sans-serif' }}>{s.desc}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {s.tags.map(t => <span key={t} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: s.bg, color: s.accent, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ background: '#F9FAFB', padding: '96px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', background: '#EEF2FF', color: '#4338CA', padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>Simple pricing</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, letterSpacing: -1, color: '#111827', marginBottom: 12, lineHeight: 1.15 }}>Start free. Subscribe when ready.</h2>
            <p style={{ fontSize: 16, color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>No lock-in contracts. Cancel anytime.</p>
          </div>
          <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'start' }}>

            <div className="pricing-card">
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>Free trial</div>
              <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 800, color: '#111827' }}>7-Day Trial</div>
              <div style={{ fontSize: 52, fontWeight: 900, color: '#111827', lineHeight: 1, margin: '14px 0 4px', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: -2 }}>$0</div>
              <div style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 28, fontFamily: 'Inter, sans-serif' }}>Full access for 7 days</div>
              <div style={{ height: 1, background: '#F3F4F6', marginBottom: 24 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {['All 4 subjects unlocked', 'Unlimited question bank', 'Writing feedback', 'Progress Report Dashboard', 'Years 1–11 difficulty', 'No credit card needed'].map(f => (
                  <div key={f} className="check-item"><span style={{ color: '#10B981', fontWeight: 700, flexShrink: 0 }}>✓</span>{f}</div>
                ))}
              </div>
              <button onClick={() => navigate('/signup')} style={{ width: '100%', padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 700, border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.target.style.borderColor = '#4338CA'; e.target.style.color = '#4338CA'; }}
                onMouseLeave={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.color = '#374151'; }}>
                Create free account
              </button>
            </div>

            <div style={{ background: 'linear-gradient(160deg, #3730A3, #4338CA 50%, #6366F1)', borderRadius: 24, padding: 36, position: 'relative', boxShadow: '0 24px 64px rgba(67,56,202,0.3)' }}>
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#F97316', color: '#fff', padding: '5px 18px', borderRadius: 100, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>Most popular</div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>Monthly subscription</div>
              <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 800, color: '#fff' }}>Unlimited</div>
              <div style={{ fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1, margin: '14px 0 4px', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: -2 }}>$9.99</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 28, fontFamily: 'Inter, sans-serif' }}>per month · cancel anytime</div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', marginBottom: 24 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {['Unlimited tests & question bank', 'Full simulated timed exams', 'All 4 subjects · Years 1–11', 'Progress Report Dashboard', 'Writing feedback & scored criteria', 'Detailed progress tracking', 'ACER, AAST, Edutest & NAPLAN'].map(f => (
                  <div key={f} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif', alignItems: 'flex-start' }}>
                    <span style={{ color: '#A5B4FC', fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/signup')} style={{ width: '100%', padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 700, border: 'none', background: '#fff', color: '#4338CA', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
                onMouseEnter={e => e.target.style.background = '#F5F3FF'}
                onMouseLeave={e => e.target.style.background = '#fff'}>
                Start 7-day free trial →
              </button>
            </div>

            <div className="pricing-card">
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>One-off purchase</div>
              <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 800, color: '#111827' }}>PDF Test</div>
              <div style={{ fontSize: 52, fontWeight: 900, color: '#111827', lineHeight: 1, margin: '14px 0 4px', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: -2 }}>15¢</div>
              <div style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 28, fontFamily: 'Inter, sans-serif' }}>per question · no subscription</div>
              <div style={{ height: 1, background: '#F3F4F6', marginBottom: 24 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {['Choose subject & year level', '10 to 100 questions', 'Professional exam-style PDF', 'Answer key at the back', 'Pay once, download instantly', 'Great for tutors & classrooms'].map(f => (
                  <div key={f} className="check-item"><span style={{ color: '#10B981', fontWeight: 700, flexShrink: 0 }}>✓</span>{f}</div>
                ))}
              </div>
              <button onClick={() => navigate('/pdf-generator')} style={{ width: '100%', padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 700, border: 'none', background: '#111827', color: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
                onMouseEnter={e => e.target.style.background = '#1F2937'}
                onMouseLeave={e => e.target.style.background = '#111827'}>
                Generate a PDF test
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mesh-gradient" style={{ padding: '120px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 900, letterSpacing: -2, color: '#111827', marginBottom: 20, lineHeight: 1.08 }}>
            Your child's exam success<br />
            <span style={{ background: 'linear-gradient(135deg, #4338CA, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>starts here.</span>
          </h2>
          <p style={{ fontSize: 17, color: '#6B7280', lineHeight: 1.75, marginBottom: 44, fontFamily: 'Inter, sans-serif' }}>7 days free. No credit card. Cancel anytime.</p>
          <button onClick={() => navigate('/signup')} className="cta-orange">Start free trial — 7 days free →</button>
          <div style={{ marginTop: 20, fontSize: 13, color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>No credit card required · Instant access · Cancel anytime</div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#111827', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '32px 40px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>
              Scholar<span style={{ color: '#818CF8' }}>Prep</span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
              © 2026 ScholarPrep — a Go Circle Pty Ltd company. Built for Australian primary and secondary school families.
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: 'Inter, sans-serif' }}>ACER · AAST · Edutest · NAPLAN</div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20 }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', lineHeight: 1.7, fontFamily: 'Inter, sans-serif', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
              ScholarPrep is an independent educational platform and is not affiliated with, endorsed by, or associated with ACARA, the NSW Department of Education, the Victorian Department of Education, or any government body. NAPLAN is a registered trademark of ACARA. ACER, AAST and Edutest are independent testing organisations. Selective entry programs are administered by state education departments. All practice questions on this platform are independently created and are not sourced from or based on official exam papers. ScholarPrep provides practice materials for educational purposes only and does not guarantee exam outcomes, scores, or placement results.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}