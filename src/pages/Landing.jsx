import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ fontFamily: "'Inter', 'DM Sans', sans-serif", background: '#F5F7FF', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Google Fonts — Plus Jakarta Sans + Inter */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        .landing-h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; }
        .landing-h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; }
        .landing-body { font-family: 'Inter', sans-serif; }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .hero-float { animation: float 5s ease-in-out infinite; }
        .fade-up-1 { animation: fadeUp 0.6s ease both; }
        .fade-up-2 { animation: fadeUp 0.6s 0.1s ease both; }
        .fade-up-3 { animation: fadeUp 0.6s 0.2s ease both; }
        .fade-up-4 { animation: fadeUp 0.6s 0.3s ease both; }

        .pill-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 100px;
          font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 600;
          cursor: pointer; border: none; transition: all 0.2s;
          text-decoration: none;
        }
        .pill-btn:hover { transform: translateY(-2px); }
        .pill-btn:active { transform: scale(0.98); }

        .btn-indigo {
          background: #4338CA; color: #fff;
          box-shadow: 0 4px 20px rgba(67,56,202,0.35);
        }
        .btn-indigo:hover { background: #3730A3; box-shadow: 0 8px 28px rgba(67,56,202,0.45); }

        .btn-ghost {
          background: rgba(255,255,255,0.7); color: #0F172A;
          border: 1.5px solid rgba(67,56,202,0.15);
          backdrop-filter: blur(8px);
        }
        .btn-ghost:hover { background: #fff; border-color: rgba(67,56,202,0.3); }

        .btn-orange {
          background: #F97316; color: #fff;
          box-shadow: 0 4px 20px rgba(249,115,22,0.35);
        }
        .btn-orange:hover { background: #EA6C0C; box-shadow: 0 8px 28px rgba(249,115,22,0.45); }

        .feature-card {
          background: #fff;
          border-radius: 20px;
          padding: 28px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 2px 12px rgba(67,56,202,0.06);
          transition: all 0.25s;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(67,56,202,0.12);
          border-color: rgba(67,56,202,0.12);
        }

        .subject-card {
          background: #fff;
          border-radius: 20px;
          padding: 24px 28px;
          border: 1px solid rgba(0,0,0,0.05);
          display: flex; gap: 18px; align-items: flex-start;
          box-shadow: 0 2px 12px rgba(67,56,202,0.06);
          transition: all 0.25s;
        }
        .subject-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 28px rgba(67,56,202,0.1);
        }

        .pricing-card {
          background: #fff;
          border-radius: 24px;
          padding: 32px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 2px 16px rgba(67,56,202,0.06);
        }
        .pricing-featured {
          background: linear-gradient(145deg, #4338CA, #6366F1);
          border: none;
          box-shadow: 0 24px 64px rgba(67,56,202,0.3);
        }

        .school-chip {
          background: #fff;
          border: 1px solid rgba(67,56,202,0.15);
          padding: 5px 14px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          color: #4338CA;
          white-space: nowrap;
        }

        .exam-chip {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.18);
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 700;
          color: #fff;
          white-space: nowrap;
        }

        .step-number {
          width: 48px; height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4338CA, #6366F1);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 20px; font-weight: 800;
          color: #fff;
          margin-bottom: 18px;
          box-shadow: 0 4px 16px rgba(67,56,202,0.3);
          flex-shrink: 0;
        }

        .gradient-text {
          background: linear-gradient(135deg, #4338CA, #F97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .section-label {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: #4338CA; margin-bottom: 16px;
        }
        .section-label::before {
          content: '';
          display: block; width: 20px; height: 2px;
          background: #4338CA; border-radius: 2px;
        }

        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hero-visual { display: none !important; }
          .nav-links { display: none !important; }
          .nav-cta { display: none !important; }
          .nav-burger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-burger { display: none !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 64,
        background: 'rgba(245,247,255,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(67,56,202,0.08)',
      }}>
        {/* Logo */}
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 900, color: '#0F172A', letterSpacing: -0.5 }}>
          Scholar<span style={{ color: '#4338CA' }}>Prep</span>
        </div>

        {/* Desktop links */}
        <div className="nav-links" style={{ display: 'flex', gap: 36 }}>
          {['Features', 'Subjects', 'Pricing'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ fontSize: 14, fontWeight: 500, color: '#64748B', transition: 'color 0.15s' }}
              onMouseEnter={e => e.target.style.color = '#4338CA'}
              onMouseLeave={e => e.target.style.color = '#64748B'}
            >{l}</a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="nav-cta" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', fontSize: 14, fontWeight: 600, color: '#64748B', cursor: 'pointer', padding: '8px 16px', borderRadius: 100 }}>Log in</button>
          <button onClick={() => navigate('/signup')} className="pill-btn btn-indigo" style={{ padding: '10px 22px', fontSize: 14 }}>Start free trial</button>
        </div>

        {/* Mobile burger */}
        <button className="nav-burger" onClick={() => setMenuOpen(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'none', flexDirection: 'column', gap: 5 }}>
          {[0, 1, 2].map(i => <span key={i} style={{ display: 'block', width: 22, height: 2, background: '#0F172A', borderRadius: 2 }} />)}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99,
          background: '#fff', borderBottom: '1px solid rgba(67,56,202,0.08)',
          padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16,
          boxShadow: '0 8px 32px rgba(67,56,202,0.1)'
        }}>
          {['Features', 'Subjects', 'Pricing'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)}
              style={{ fontSize: 16, fontWeight: 600, color: '#0F172A' }}>{l}</a>
          ))}
          <button onClick={() => navigate('/signup')} className="pill-btn btn-indigo" style={{ width: '100%', justifyContent: 'center' }}>Start free trial</button>
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh', paddingTop: 64, paddingBottom: 80,
        background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F7FF 40%, #FFF7ED 100%)',
        display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background blobs */}
        <div style={{ position: 'absolute', top: -120, right: -80, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -60, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', width: '100%' }}>
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>

            {/* Left */}
            <div>
              <div className="fade-up-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EEF2FF', border: '1px solid rgba(67,56,202,0.2)', color: '#4338CA', padding: '6px 16px', borderRadius: 100, fontSize: 12, fontWeight: 700, marginBottom: 28, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                ✦ Trusted by Australian families
              </div>

              <h1 className="landing-h1 fade-up-2" style={{
                fontSize: 'clamp(38px, 5vw, 68px)', lineHeight: 1.08, letterSpacing: -2,
                color: '#0F172A', marginBottom: 24
              }}>
                Ace the exam.<br />
                <span className="gradient-text">Every single time.</span>
              </h1>

              <p className="fade-up-3" style={{ fontSize: 17, lineHeight: 1.75, color: '#64748B', marginBottom: 36, maxWidth: 480, fontFamily: 'Inter, sans-serif' }}>
                AI-powered exam preparation for ACER, AAST, Edutest and NAPLAN.
                Fresh questions every session, personalised AI feedback, and full simulated exams — for Years 1 to 11.
              </p>

              <div className="fade-up-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
                <button onClick={() => navigate('/signup')} className="pill-btn btn-indigo">
                  Start 7-day free trial →
                </button>
                <button onClick={() => navigate('/login')} className="pill-btn btn-ghost">
                  Log in
                </button>
              </div>

              <div className="fade-up-4" style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#94A3B8' }}>
                {['No credit card required', 'Full access for 7 days', 'Cancel anytime'].map(t => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ color: '#059669', fontWeight: 700 }}>✓</span> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — hero card */}
            <div className="hero-visual" style={{ position: 'relative' }}>
              {/* Floating badge */}
              <div className="hero-float" style={{
                position: 'absolute', top: -20, right: -10, zIndex: 2,
                background: '#fff', borderRadius: 16, padding: '12px 18px',
                boxShadow: '0 8px 32px rgba(67,56,202,0.15)',
                display: 'flex', alignItems: 'center', gap: 10,
                animation: 'float 5s ease-in-out infinite',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏆</div>
                <div>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Last score</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>92% · Maths</div>
                </div>
              </div>

              {/* Second badge */}
              <div style={{
                position: 'absolute', bottom: 40, left: -20, zIndex: 2,
                background: '#fff', borderRadius: 16, padding: '12px 18px',
                boxShadow: '0 8px 32px rgba(67,56,202,0.15)',
                display: 'flex', alignItems: 'center', gap: 10,
                animation: 'float 5s 2s ease-in-out infinite',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📈</div>
                <div>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>This week</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#059669', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>+14% improvement</div>
                </div>
              </div>

              {/* Main card */}
              <div style={{ background: '#fff', borderRadius: 28, padding: 28, boxShadow: '0 32px 80px rgba(67,56,202,0.15)', border: '1px solid rgba(67,56,202,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif' }}>Mathematics · Year 5</span>
                  <span style={{ background: '#ECFDF5', color: '#059669', padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700 }}>✓ Correct</span>
                </div>
                <div style={{ background: '#F8F9FF', borderRadius: 14, padding: 16, fontSize: 14, fontWeight: 500, color: '#0F172A', lineHeight: 1.65, marginBottom: 14, fontFamily: 'Inter, sans-serif', border: '1px solid rgba(67,56,202,0.06)' }}>
                  Adam's car travels at 70 km/h. How far has it traveled from 9am to 3:30pm?
                </div>
                {[{ l: 'A', t: '225 km', s: false }, { l: 'B', t: '455 km', s: true }, { l: 'C', t: '570 km', s: false }, { l: 'D', t: '630 km', s: false }].map(o => (
                  <div key={o.l} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px',
                    borderRadius: 10, marginBottom: 6,
                    background: o.s ? '#ECFDF5' : '#F8F9FF',
                    border: `1.5px solid ${o.s ? '#6EE7B7' : 'rgba(67,56,202,0.06)'}`,
                    fontSize: 13, color: o.s ? '#059669' : '#64748B', fontFamily: 'Inter, sans-serif',
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, flexShrink: 0,
                      background: o.s ? '#059669' : 'rgba(67,56,202,0.08)',
                      color: o.s ? '#fff' : '#64748B',
                    }}>{o.l}</div>
                    {o.t}
                  </div>
                ))}
                <div style={{ marginTop: 12, padding: '12px 16px', background: '#EEF2FF', borderRadius: 12, fontSize: 12, color: '#4338CA', lineHeight: 1.65, fontFamily: 'Inter, sans-serif', border: '1px solid rgba(67,56,202,0.12)' }}>
                  <strong>AI Explanation:</strong> 9am to 3:30pm = 6.5 hours. 70 × 6.5 = <strong>455 km ✓</strong>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── EXAM BAR ── */}
      <div style={{
        background: '#0F172A', padding: '18px 24px',
        display: 'flex', alignItems: 'center', gap: 20, overflowX: 'auto',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>Prepares you for</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap' }}>
          {['ACER', 'AAST', 'Edutest', 'NAPLAN', 'Selective Entry'].map(t => (
            <div key={t} className="exam-chip">{t}</div>
          ))}
        </div>
      </div>

      {/* ── SELECTIVE SCHOOLS ── */}
      <div style={{ background: '#fff', padding: '24px 24px', borderBottom: '1px solid rgba(67,56,202,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4338CA', marginBottom: 10, fontFamily: 'Inter, sans-serif' }}>
            Selective entry high school preparation
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['Melbourne High', "Mac.Robertson Girls'", 'Suzanne Cory', 'North Sydney Boys', 'North Sydney Girls', 'James Ruse Agricultural', 'Normanhurst Boys'].map(s => (
              <div key={s} className="school-chip">{s}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '96px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div className="section-label">Why ScholarPrep</div>
        <h2 className="landing-h2" style={{ fontSize: 'clamp(28px, 4vw, 50px)', color: '#0F172A', marginBottom: 16, maxWidth: 600, letterSpacing: -1 }}>
          Everything your child needs to <span className="gradient-text">ace the exam</span>
        </h2>
        <p style={{ fontSize: 16, color: '#64748B', lineHeight: 1.75, maxWidth: 520, marginBottom: 56, fontFamily: 'Inter, sans-serif' }}>
          Unlike printed workbooks, ScholarPrep generates new questions every single session from our unlimited question bank.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            { icon: '🤖', title: 'Unlimited question bank', desc: 'Fresh, unique exam-style questions every session. Never the same question twice — unlimited practice.', color: '#EEF2FF', accent: '#4338CA' },
            { icon: '🎯', title: 'Full simulated exams', desc: 'Sit a complete timed exam just like the real test centre — multiple sections, timed breaks, real conditions.', color: '#FFF7ED', accent: '#F97316' },
            { icon: '📊', title: 'AI-powered analysis', desc: "More detailed than a teacher or tutor. AI identifies your child's exact weak question types and targets them.", color: '#ECFDF5', accent: '#059669' },
            { icon: '📈', title: 'Progress tracking', desc: 'Track improvement across every session. See strengths, weaknesses and trends by subject and topic.', color: '#F0FDFA', accent: '#0D9488' },
            { icon: '✏️', title: 'AI writing feedback', desc: 'Get detailed feedback and scores against real marking criteria. Works with typed or handwritten responses.', color: '#FFF1F2', accent: '#F43F5E' },
            { icon: '📄', title: 'Printable PDF tests', desc: 'Generate a professional exam-style PDF with answer key. Perfect for offline practice or tutors.', color: '#EEF2FF', accent: '#4338CA' },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div style={{ width: 52, height: 52, borderRadius: 16, background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 18 }}>{f.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 8, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{f.title}</div>
              <div style={{ fontSize: 14, color: '#64748B', lineHeight: 1.75, fontFamily: 'Inter, sans-serif' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SIMULATED EXAM ── */}
      <section style={{ background: 'linear-gradient(135deg, #3730A3, #4338CA, #6366F1)', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '6px 16px', borderRadius: 100, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>
            Full simulated exams
          </div>
          <h2 className="landing-h2" style={{ fontSize: 'clamp(28px, 4vw, 50px)', color: '#fff', marginBottom: 16, letterSpacing: -1 }}>
            Sit the real exam — before exam day
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, marginBottom: 48, maxWidth: 560, fontFamily: 'Inter, sans-serif' }}>
            ScholarPrep replicates the exact conditions of the real test centre — timed sections, scheduled breaks, and multiple papers in one sitting.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '28px 32px', maxWidth: 680 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif' }}>
              Example: ACER Selective High School Entrance Exam
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { time: '60 min', label: 'Maths & Quantitative Reasoning', color: '#FCD34D', type: 'exam' },
                { time: '20 min', label: 'Break', color: 'rgba(255,255,255,0.25)', type: 'break' },
                { time: '55 min', label: 'Reading & Verbal Reasoning', color: '#6EE7B7', type: 'exam' },
                { time: '5 min', label: 'Break', color: 'rgba(255,255,255,0.25)', type: 'break' },
                { time: '40 min', label: 'Writing', color: '#A5B4FC', type: 'exam' },
              ].map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  background: s.type === 'break' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
                  borderRadius: 12, padding: '14px 18px',
                  border: `1px solid ${s.type === 'break' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.12)'}`,
                }}>
                  <div style={{ minWidth: 60, fontSize: 14, fontWeight: 800, color: s.color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.time}</div>
                  <div style={{ fontSize: 14, color: s.type === 'break' ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.85)', fontStyle: s.type === 'break' ? 'italic' : 'normal', fontFamily: 'Inter, sans-serif' }}>{s.label}</div>
                  {s.type === 'exam' && <div style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: s.color, background: 'rgba(255,255,255,0.08)', padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>Timed</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: '#fff', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="section-label">How it works</div>
          <h2 className="landing-h2" style={{ fontSize: 'clamp(28px, 4vw, 50px)', color: '#0F172A', marginBottom: 56, letterSpacing: -1 }}>Up and running in minutes</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40 }}>
            {[
              { n: '1', t: 'Create an account', d: 'Sign up in 60 seconds. Start your 7-day free trial — no credit card required.' },
              { n: '2', t: 'Choose your exam', d: 'Pick your target exam, subject, year level, and whether you want a quick practice or a full simulated sitting.' },
              { n: '3', t: 'AI generates it', d: 'Fresh questions from our unlimited question bank every time. No two tests are ever the same.' },
              { n: '4', t: 'Review & improve', d: 'Instant scores, AI analysis of your weak spots, and progress tracking across every session.' },
            ].map((s, i) => (
              <div key={i}>
                <div className="step-number">{s.n}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 10, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.t}</div>
                <div style={{ fontSize: 14, color: '#64748B', lineHeight: 1.75, fontFamily: 'Inter, sans-serif' }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUBJECTS ── */}
      <section id="subjects" style={{ background: '#F5F7FF', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="section-label">What's covered</div>
          <h2 className="landing-h2" style={{ fontSize: 'clamp(28px, 4vw, 50px)', color: '#0F172A', marginBottom: 56, letterSpacing: -1 }}>All four sections. Nothing left out.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {[
              { icon: '🔢', title: 'Mathematics', desc: 'Word problems, fractions, decimals, geometry, time, money and more — for Years 1–11.', tags: ['Number & algebra', 'Measurement', 'Word problems', 'Geometry'], bg: '#EEF2FF', accent: '#4338CA' },
              { icon: '📖', title: 'Reading Comprehension', desc: 'Passages from stories, poems, fact sheets and brochures — with inference, vocabulary and comprehension questions.', tags: ['Inference', 'Vocabulary', 'Main idea', "Author's purpose"], bg: '#ECFDF5', accent: '#059669' },
              { icon: '🧩', title: 'General Ability', desc: 'Verbal and non-verbal reasoning, pattern recognition, analogies, sequences and logical thinking.', tags: ['Verbal reasoning', 'Patterns', 'Analogies', 'Sequences'], bg: '#FFF7ED', accent: '#F97316' },
              { icon: '✏️', title: 'Writing', desc: 'Narrative and persuasive prompts with detailed AI marking feedback. Type or upload handwritten work.', tags: ['Narrative', 'Persuasive', 'AI feedback', 'Scored'], bg: '#FFF1F2', accent: '#F43F5E' },
            ].map((s, i) => (
              <div key={i} className="subject-card">
                <div style={{ width: 52, height: 52, borderRadius: 16, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, border: `1px solid ${s.accent}20` }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 6, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.7, marginBottom: 12, fontFamily: 'Inter, sans-serif' }}>{s.desc}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {s.tags.map(t => (
                      <span key={t} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: s.bg, color: s.accent, fontWeight: 600, fontFamily: 'Inter, sans-serif', border: `1px solid ${s.accent}20` }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ background: '#fff', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label">Simple pricing</div>
          <h2 className="landing-h2" style={{ fontSize: 'clamp(28px, 4vw, 50px)', color: '#0F172A', marginBottom: 12, letterSpacing: -1 }}>Start free. Subscribe when ready.</h2>
          <p style={{ fontSize: 16, color: '#64748B', lineHeight: 1.7, marginBottom: 56, fontFamily: 'Inter, sans-serif' }}>No lock-in contracts. Cancel anytime.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'start' }}>

            {/* Free */}
            <div className="pricing-card">
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>Free trial</div>
              <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 24, fontWeight: 800, color: '#0F172A' }}>7-Day Trial</div>
              <div style={{ fontSize: 48, fontWeight: 800, color: '#0F172A', lineHeight: 1, margin: '14px 0 4px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>$0</div>
              <div style={{ fontSize: 14, color: '#94A3B8', marginBottom: 24, fontFamily: 'Inter, sans-serif' }}>Full access for 7 days</div>
              <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', marginBottom: 24 }}></div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {['All 4 subjects unlocked', 'Unlimited question bank', 'AI writing feedback', 'Progress dashboard & AI analysis', 'Years 1–11 difficulty', 'No credit card needed'].map(f => (
                  <li key={f} style={{ display: 'flex', gap: 10, fontSize: 14, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
                    <span style={{ color: '#059669', fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/signup')} style={{ width: '100%', padding: '13px', borderRadius: 100, fontSize: 15, fontWeight: 700, border: '2px solid rgba(67,56,202,0.2)', background: 'transparent', color: '#4338CA', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.target.style.background = '#EEF2FF'; e.target.style.borderColor = '#4338CA'; }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'rgba(67,56,202,0.2)'; }}>
                Create free account
              </button>
            </div>

            {/* Featured */}
            <div className="pricing-card pricing-featured" style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#F97316', color: '#fff', padding: '5px 18px', borderRadius: 100, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>Most popular</div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.55)', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>Monthly subscription</div>
              <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 24, fontWeight: 800, color: '#fff' }}>Unlimited</div>
              <div style={{ fontSize: 48, fontWeight: 800, color: '#fff', lineHeight: 1, margin: '14px 0 4px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>$9.99</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 24, fontFamily: 'Inter, sans-serif' }}>per month · cancel anytime</div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', marginBottom: 24 }}></div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {['Unlimited tests & question bank', 'Full simulated timed exams', 'All 4 subjects · Years 1–11', 'AI personalised analysis', 'Full writing AI feedback', 'Detailed progress tracking', 'ACER, AAST, Edutest & NAPLAN'].map(f => (
                  <li key={f} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif' }}>
                    <span style={{ color: '#A5B4FC', fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/signup')} style={{ width: '100%', padding: '13px', borderRadius: 100, fontSize: 15, fontWeight: 700, border: 'none', background: '#fff', color: '#4338CA', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
                onMouseEnter={e => e.target.style.background = '#F8F9FF'}
                onMouseLeave={e => e.target.style.background = '#fff'}>
                Start 7-day free trial →
              </button>
            </div>

            {/* PDF */}
            <div className="pricing-card">
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>One-off purchase</div>
              <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 24, fontWeight: 800, color: '#0F172A' }}>PDF Test</div>
              <div style={{ fontSize: 48, fontWeight: 800, color: '#0F172A', lineHeight: 1, margin: '14px 0 4px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>15¢</div>
              <div style={{ fontSize: 14, color: '#94A3B8', marginBottom: 24, fontFamily: 'Inter, sans-serif' }}>per question · no subscription</div>
              <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', marginBottom: 24 }}></div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {['Choose subject & year level', '10 to 100 questions', 'Professional exam-style PDF', 'Answer key at the back', 'Pay once, download instantly', 'Great for tutors & classrooms'].map(f => (
                  <li key={f} style={{ display: 'flex', gap: 10, fontSize: 14, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
                    <span style={{ color: '#059669', fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/pdf-generator')} style={{ width: '100%', padding: '13px', borderRadius: 100, fontSize: 15, fontWeight: 700, border: 'none', background: '#0F172A', color: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
                onMouseEnter={e => e.target.style.background = '#1E293B'}
                onMouseLeave={e => e.target.style.background = '#0F172A'}>
                Generate a PDF test
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F7FF 50%, #FFF7ED 100%)', padding: '96px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(67,56,202,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative' }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>Get started today</div>
          <h2 className="landing-h2" style={{ fontSize: 'clamp(28px, 4vw, 52px)', color: '#0F172A', marginBottom: 16, letterSpacing: -1 }}>
            Your child's exam success<br /><span className="gradient-text">starts here</span>
          </h2>
          <p style={{ fontSize: 16, color: '#64748B', lineHeight: 1.75, marginBottom: 40, fontFamily: 'Inter, sans-serif' }}>
            7 days free. No credit card. Cancel anytime.
          </p>
          <button onClick={() => navigate('/signup')} className="pill-btn btn-indigo" style={{ padding: '16px 40px', fontSize: 17 }}>
            Start free trial — 7 days free →
          </button>
          <div style={{ marginTop: 16, fontSize: 13, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>No credit card required · Instant access · Cancel anytime</div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0F172A', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 18, fontWeight: 800, color: '#fff' }}>
            Scholar<span style={{ color: '#6366F1' }}>Prep</span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
            © 2026 ScholarPrep — a Go Circle Pty Ltd company. Built for Australian primary and secondary school families.
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: 'Inter, sans-serif' }}>ACER · AAST · Edutest · NAPLAN</div>
        </div>
      </footer>

    </div>
  );
}