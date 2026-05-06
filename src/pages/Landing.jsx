import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }

        @keyframes float2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }

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
          box-shadow: 0 4px 20px rgba(67,56,202,0.3);
          transition: all 0.2s;
        }
        .cta-primary:hover { background: #3730A3; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(67,56,202,0.4); }
        .cta-primary:active { transform: scale(0.98); }

        .cta-secondary {
          display: inline-flex; align-items: center; gap: 6px;
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
          box-shadow: 0 4px 20px rgba(249,115,22,0.35);
          transition: all 0.2s;
        }
        .cta-orange:hover { background: #EA6C0C; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(249,115,22,0.45); }

        .feature-row {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 80px; align-items: center;
          padding: 80px 0;
          border-bottom: 1px solid #F3F4F6;
        }
        .feature-row:last-child { border-bottom: none; }

        .pricing-card {
          background: #fff; border-radius: 24px; padding: 36px;
          border: 1px solid #E5E7EB; transition: box-shadow 0.2s;
        }
        .pricing-card:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.08); }

        .check-item {
          display: flex; gap: 10px; font-size: 14px; color: #4B5563;
          font-family: 'Inter', sans-serif; align-items: flex-start;
        }

        .mesh-gradient {
          background:
            radial-gradient(ellipse at 20% 50%, rgba(167,139,250,0.15) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 60% 80%, rgba(249,115,22,0.08) 0%, transparent 50%),
            #F9FAFB;
        }

        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-screenshot { display: none !important; }
          .feature-row { grid-template-columns: 1fr !important; gap: 40px !important; padding: 60px 0 !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .nav-links-d { display: none !important; }
          .nav-cta-d { display: none !important; }
          .nav-burger { display: flex !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
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
                ✦ AI-powered exam prep
              </div>
              <h1 className="fade-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(40px, 5.5vw, 72px)', fontWeight: 900, lineHeight: 1.06, letterSpacing: -2.5, color: '#111827', marginBottom: 24 }}>
                The smartest way to ace<br />
                <span style={{ background: 'linear-gradient(135deg, #4338CA, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>any Australian exam.</span>
              </h1>
              <p className="fade-3" style={{ fontSize: 18, lineHeight: 1.75, color: '#6B7280', marginBottom: 40, maxWidth: 460, fontFamily: 'Inter, sans-serif' }}>
                AI-generated practice questions for ACER, AAST, Edutest and NAPLAN.
                Personalised feedback, simulated timed exams, and progress tracking — for Years 1 to 11.
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
            <div className="hero-screenshot" style={{ position: 'relative', alignItems: 'flex-end', display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', top: 40, left: -10, zIndex: 3, background: '#fff', borderRadius: 16, padding: '12px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 10, animation: 'float2 5s ease-in-out infinite', border: '1px solid #F3F4F6' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📈</div>
                <div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>Progress this week</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#10B981', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>+18% improvement</div>
                </div>
              </div>
              <div style={{ position: 'absolute', top: 60, right: -20, zIndex: 3, background: '#fff', borderRadius: 16, padding: '12px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 10, animation: 'float2 5s 1.5s ease-in-out infinite', border: '1px solid #F3F4F6' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
                <div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>AI analysis</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#4338CA', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Strengths identified</div>
                </div>
              </div>

              {/* Browser mockup */}
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
                  <div style={{ background: '#fff', borderRadius: 14, padding: 16, fontSize: 14, color: '#111827', lineHeight: 1.65, marginBottom: 12, fontFamily: 'Inter, sans-serif', fontWeight: 500, border: '1px solid rgba(67,56,202,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    Adam's car travels at 70 km/h. How far has it traveled from 9am to 3:30pm with no stops?
                  </div>
                  {[{ l: 'A', t: '225 km', s: false }, { l: 'B', t: '455 km', s: true }, { l: 'C', t: '570 km', s: false }, { l: 'D', t: '630 km', s: false }].map(o => (
                    <div key={o.l} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, marginBottom: 7, background: o.s ? '#ECFDF5' : '#fff', border: `1.5px solid ${o.s ? '#6EE7B7' : '#E5E7EB'}`, fontSize: 13, color: o.s ? '#059669' : '#4B5563', fontFamily: 'Inter, sans-serif', boxShadow: o.s ? '0 0 0 3px rgba(16,185,129,0.08)' : 'none' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, background: o.s ? '#059669' : '#F3F4F6', color: o.s ? '#fff' : '#6B7280' }}>{o.l}</div>
                      <span style={{ fontWeight: o.s ? 600 : 400 }}>{o.t}</span>
                      {o.s && <span style={{ marginLeft: 'auto' }}>✓</span>}
                    </div>
                  ))}
                  <div style={{ marginTop: 12, padding: '12px 14px', background: '#EEF2FF', borderRadius: 12, fontSize: 12, color: '#4338CA', lineHeight: 1.65, fontFamily: 'Inter, sans-serif', border: '1px solid #C7D2FE' }}>
                    <strong>🤖 AI:</strong> 9am → 3:30pm = 6.5 hrs. 70 × 6.5 = <strong>455 km ✓</strong>
                  </div>
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
              { n: 'Unlimited', l: 'Fresh AI questions every session' },
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

      {/* ── FEATURES — Apple-style alternating rows ── */}
      <section id="features" style={{ background: '#fff', padding: '0 40px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>

          <div style={{ paddingTop: 96, paddingBottom: 64, textAlign: 'center', borderBottom: '1px solid #F3F4F6' }}>
            <div style={{ display: 'inline-block', background: '#F5F3FF', color: '#4338CA', padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>Why ScholarPrep</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(30px, 4vw, 54px)', fontWeight: 900, letterSpacing: -1.5, color: '#111827', marginBottom: 16, lineHeight: 1.1 }}>
              Everything your child needs.<br />Nothing they don't.
            </h2>
            <p style={{ fontSize: 17, color: '#6B7280', lineHeight: 1.75, maxWidth: 520, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
              Unlike printed workbooks, ScholarPrep generates new questions every session — so your child never runs out of practice.
            </p>
          </div>

          {[
            {
              icon: '🤖', accent: '#4338CA', bg: '#EEF2FF',
              label: 'Unlimited Question Bank',
              title: 'Never run out of practice questions.',
              desc: 'Our AI generates fresh, curriculum-aligned questions every single session. No two tests are ever the same — so your child always has something new to work on, no matter how much they practise.',
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
              icon: '📊', accent: '#059669', bg: '#ECFDF5', reverse: true,
              label: 'AI-Powered Analysis',
              title: 'More detail than any teacher or tutor.',
              desc: "ScholarPrep's AI doesn't just score your child's test — it identifies exactly which question types they struggle with, tracks improvement over time, and tells you precisely what to focus on next.",
              visual: (
                <div style={{ background: '#F0FDF4', borderRadius: 20, padding: 24, border: '1px solid #BBF7D0' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#065F46', marginBottom: 16, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>AI Analysis — Mathematics</div>
                  {[{ topic: 'Word problems', pct: 88, color: '#059669' }, { topic: 'Fractions', pct: 62, color: '#F97316' }, { topic: 'Geometry', pct: 45, color: '#F43F5E' }, { topic: 'Time & money', pct: 91, color: '#059669' }].map((t, i) => (
                    <div key={i} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#374151', fontFamily: 'Inter, sans-serif' }}>{t.topic}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: t.color, fontFamily: 'Inter, sans-serif' }}>{t.pct}%</span>
                      </div>
                      <div style={{ height: 6, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${t.pct}%`, height: '100%', background: t.color, borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 16, padding: '12px 14px', background: '#ECFDF5', borderRadius: 12, fontSize: 12, color: '#065F46', fontFamily: 'Inter, sans-serif', border: '1px solid #6EE7B7' }}>
                    💡 <strong>Recommendation:</strong> Focus on Geometry and Fractions this week.
                  </div>
                </div>
              )
            },
            {
              icon: '🎯', accent: '#7C3AED', bg: '#F5F3FF',
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
              icon: '📄', accent: '#F97316', bg: '#FFF7ED', reverse: true,
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
              { n: '03', t: 'AI generates it', d: 'Fresh questions every time from our unlimited question bank. No two tests are ever the same.' },
              { n: '04', t: 'Review & improve', d: 'Instant scores, AI analysis of weak spots, and progress tracked across every session.' },
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
              { icon: '✏️', title: 'Writing', desc: 'Narrative and persuasive prompts with detailed AI marking feedback.', tags: ['Narrative', 'Persuasive', 'AI feedback', 'Scored criteria'], bg: '#FFF1F2', accent: '#F43F5E' },
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
                {['All 4 subjects unlocked', 'Unlimited question bank', 'AI writing feedback', 'Progress dashboard & AI analysis', 'Years 1–11 difficulty', 'No credit card needed'].map(f => (
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
                {['Unlimited tests & question bank', 'Full simulated timed exams', 'All 4 subjects · Years 1–11', 'AI personalised analysis', 'Full writing AI feedback', 'Detailed progress tracking', 'ACER, AAST, Edutest & NAPLAN'].map(f => (
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
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>
            Scholar<span style={{ color: '#818CF8' }}>Prep</span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
            © 2026 ScholarPrep — a Go Circle Pty Ltd company. Built for Australian primary and secondary school families.
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: 'Inter, sans-serif' }}>ACER · AAST · Edutest · NAPLAN</div>
        </div>
      </footer>

    </div>
  );
}