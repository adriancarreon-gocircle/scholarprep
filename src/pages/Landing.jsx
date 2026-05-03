import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#FAF6EE', minHeight: '100vh' }}>
      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 48px',
        background: 'rgba(250,246,238,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(13,27,42,0.08)'
      }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 900, color: '#0D1B2A' }}>
          Scholar<span style={{ color: '#E8B84B' }}>Prep</span>
        </div>
        <div style={{ display: 'flex', gap: 32 }}>
          {['Features', 'Subjects', 'Pricing'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ fontSize: 14, fontWeight: 500, color: '#5A6A7A', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
        <button onClick={() => navigate('/signup')} style={{
          background: '#0D1B2A', color: '#fff', padding: '10px 24px',
          borderRadius: 100, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer'
        }}>Start free trial</button>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: '100vh', padding: '140px 48px 80px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64,
        alignItems: 'center', maxWidth: 1200, margin: '0 auto'
      }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#E8B84B', color: '#0D1B2A', padding: '6px 14px',
            borderRadius: 100, fontSize: 12, fontWeight: 700, marginBottom: 24,
            textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>★ Trusted by Australian families</div>
          <h1 style={{
            fontFamily: "'Fraunces', serif", fontSize: 'clamp(42px, 5vw, 66px)',
            fontWeight: 900, lineHeight: 1.05, letterSpacing: -2,
            color: '#0D1B2A', marginBottom: 24
          }}>
            Ace the <em style={{ fontStyle: 'italic', color: '#E8B84B' }}>scholarship</em> test. Every time.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: '#5A6A7A', marginBottom: 36, maxWidth: 460 }}>
            AI-powered practice for ACER, AAST and Edutest. Fresh questions every session,
            personalised feedback, and real exam-style tests — for Years 1 to 6.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/signup')} style={{
              background: '#0D1B2A', color: '#fff', padding: '16px 32px',
              borderRadius: 100, fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(13,27,42,0.25)'
            }}>Start 7-day free trial</button>
            <button onClick={() => navigate('/login')} style={{
              background: 'transparent', color: '#0D1B2A', padding: '16px 32px',
              borderRadius: 100, fontSize: 16, fontWeight: 600,
              border: '2px solid rgba(13,27,42,0.2)', cursor: 'pointer'
            }}>Log in</button>
          </div>
          <div style={{ marginTop: 32, fontSize: 13, color: '#5A6A7A' }}>
            ✓ No credit card required &nbsp; ✓ Full access for 7 days &nbsp; ✓ Cancel anytime
          </div>
        </div>

        {/* Hero card */}
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', top: -20, right: -20, zIndex: 2,
            background: '#fff', borderRadius: 14, padding: '12px 16px',
            boxShadow: '0 8px 24px rgba(13,27,42,0.12)',
            display: 'flex', alignItems: 'center', gap: 10, animation: 'float 4s ease-in-out infinite'
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#E8F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏆</div>
            <div>
              <div style={{ fontSize: 11, color: '#888' }}>Last score</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0D1B2A' }}>92% · Maths</div>
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 24px 64px rgba(13,27,42,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mathematics · Year 5</span>
              <span style={{ background: '#E8F5EE', color: '#2D6A4F', padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700 }}>✓ Answered</span>
            </div>
            <div style={{ background: '#FAF6EE', borderRadius: 12, padding: 16, fontSize: 15, fontWeight: 500, color: '#0D1B2A', lineHeight: 1.6, marginBottom: 16 }}>
              Adam's car travels at 70 km per hour. How far has it traveled from 9am to 3:30pm with no stops?
            </div>
            {[{ l: 'A', t: '225 km', s: 'neutral' }, { l: 'B', t: '455 km', s: 'correct' }, { l: 'C', t: '570 km', s: 'neutral' }, { l: 'D', t: '630 km', s: 'neutral' }].map(o => (
              <div key={o.l} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                borderRadius: 10, marginBottom: 6,
                background: o.s === 'correct' ? '#E8F5EE' : o.s === 'wrong' ? '#FDEAEA' : '#FAF6EE',
                border: `1.5px solid ${o.s === 'correct' ? '#52B788' : o.s === 'wrong' ? '#E07A5F' : '#F0E8D8'}`,
                fontSize: 14, color: o.s === 'correct' ? '#2D6A4F' : o.s === 'wrong' ? '#B04030' : '#5A6A7A'
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  background: o.s === 'correct' ? '#2D6A4F' : o.s === 'wrong' ? '#E07A5F' : '#F0E8D8',
                  color: o.s === 'neutral' ? '#5A6A7A' : '#fff', flexShrink: 0
                }}>{o.l}</div>
                {o.t}
              </div>
            ))}
            <div style={{ marginTop: 12, padding: '12px 16px', background: '#E8F5EE', borderRadius: 12, fontSize: 13, color: '#2D6A4F', lineHeight: 1.6 }}>
              <strong>Explanation:</strong> From 9am to 3:30pm = 6.5 hours. 70 × 6.5 = 455 km. ✓
            </div>
          </div>
          <div style={{
            position: 'absolute', bottom: 20, left: -24, zIndex: 2,
            background: '#fff', borderRadius: 14, padding: '12px 16px',
            boxShadow: '0 8px 24px rgba(13,27,42,0.12)',
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#FEF3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✏️</div>
            <div>
              <div style={{ fontSize: 11, color: '#888' }}>AI Writing Score</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0D1B2A' }}>18/25 · Narrative</div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTS BAR */}
      <div style={{ background: '#0D1B2A', padding: '24px 48px', display: 'flex', alignItems: 'center', gap: 48 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>Prepares you for</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {['ACER', 'AAST', 'Edutest', 'AIS', 'SEAL', 'Scholarship Exams'].map(t => (
            <div key={t} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', padding: '7px 18px', borderRadius: 100, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{t}</div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" style={{ padding: '100px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E8B84B', marginBottom: 16 }}>Why ScholarPrep</div>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, letterSpacing: -1.5, color: '#0D1B2A', marginBottom: 16 }}>
          Everything your child needs to <em style={{ fontStyle: 'italic', color: '#E8B84B' }}>succeed</em>
        </h2>
        <p style={{ fontSize: 18, color: '#5A6A7A', lineHeight: 1.7, maxWidth: 540, marginBottom: 60 }}>
          Unlike printed workbooks, ScholarPrep generates new questions every single session — so your child actually learns, not just memorises.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { icon: '🤖', title: 'AI-generated questions', desc: 'Every test is unique. Fresh, exam-style questions based on real scholarship test patterns — never the same test twice.' },
            { icon: '⏱️', title: 'Timed or relaxed', desc: 'Set a countdown timer to simulate real exam pressure, or let your child work at their own pace.' },
            { icon: '✏️', title: 'AI writing feedback', desc: 'Submit typed or handwritten responses. Get detailed feedback and scores against real marking criteria.' },
            { icon: '📊', title: 'Progress tracking', desc: 'See exactly where your child excels and where they need more practice — updated after every session.' },
            { icon: '🎓', title: 'Years 1–6 difficulty', desc: 'Adjust difficulty to match your child\'s grade. Always appropriately challenging, never too easy.' },
            { icon: '📄', title: 'Printable PDF tests', desc: 'Generate a professional exam-style PDF with answer key at the back. Perfect for offline practice or tutors.' }
          ].map((f, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 20, padding: 32,
              border: '1px solid rgba(13,27,42,0.06)',
              borderTop: `3px solid ${['#E8B84B', '#52B788', '#E07A5F', '#7B61FF', '#00B4D8', '#E8B84B'][i]}`
            }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0D1B2A', marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: '#5A6A7A', lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: '#0D1B2A', padding: '100px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E8B84B', marginBottom: 16 }}>How it works</div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, color: '#fff', marginBottom: 16 }}>Up and running in minutes</h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', marginBottom: 60 }}>No setup headaches. No printed workbooks. Just log in and practise.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
            {[
              { n: '1', t: 'Create an account', d: 'Sign up in 60 seconds. Start your 7-day free trial — no credit card required.' },
              { n: '2', t: 'Choose your test', d: 'Pick subject, year level, question count, and whether you want a timer.' },
              { n: '3', t: 'AI generates it', d: 'Fresh, unique questions every time. No two tests are the same.' },
              { n: '4', t: 'Review & improve', d: 'Instant scores, explanations for wrong answers, and progress tracking over time.' }
            ].map((s, i) => (
              <div key={i}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#E8B84B', color: '#0D1B2A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 900, marginBottom: 20 }}>{s.n}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{s.t}</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUBJECTS */}
      <section id="subjects" style={{ background: '#F0E8D8', padding: '100px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E8B84B', marginBottom: 16 }}>What's covered</div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, color: '#0D1B2A', marginBottom: 60 }}>All four sections. Nothing left out.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {[
              { icon: '🔢', title: 'Mathematics', desc: 'Word problems, fractions, decimals, geometry, time, money, percentages — all in real-world exam style.', tags: ['Number & algebra', 'Measurement', 'Word problems', 'Geometry'], bg: '#FEF3D0' },
              { icon: '📖', title: 'Reading Comprehension', desc: 'Passages from stories, poems, fact sheets and brochures — with inference, vocabulary and comprehension questions.', tags: ['Inference', 'Vocabulary', 'Main idea', 'Author\'s purpose'], bg: '#E8F5EE' },
              { icon: '🧩', title: 'General Ability', desc: 'Verbal and non-verbal reasoning, pattern recognition, analogies, sequences and logical thinking.', tags: ['Verbal reasoning', 'Pattern recognition', 'Analogies', 'Sequences'], bg: '#EEF0FF' },
              { icon: '✏️', title: 'Writing', desc: 'Narrative and persuasive prompts with AI feedback. Type or upload a photo of handwritten work.', tags: ['Narrative', 'Persuasive', 'AI feedback', 'Scored criteria'], bg: '#FEE8E2' }
            ].map((s, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 20, padding: 36, display: 'flex', gap: 24, border: '1px solid rgba(13,27,42,0.06)' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#0D1B2A', marginBottom: 8 }}>{s.title}</div>
                  <div style={{ fontSize: 14, color: '#5A6A7A', lineHeight: 1.7, marginBottom: 12 }}>{s.desc}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {s.tags.map(t => <span key={t} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: '#FAF6EE', color: '#5A6A7A', fontWeight: 600 }}>{t}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: '100px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E8B84B', marginBottom: 16 }}>Simple pricing</div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, color: '#0D1B2A', marginBottom: 16 }}>Start free. Subscribe when ready.</h2>
          <p style={{ fontSize: 18, color: '#5A6A7A', lineHeight: 1.7, marginBottom: 60 }}>No lock-in contracts. Cancel anytime. Or buy a one-off PDF test without even subscribing.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'center' }}>
            {/* Free */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 36, border: '1px solid rgba(13,27,42,0.08)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#5A6A7A', marginBottom: 8 }}>Free trial</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 900, color: '#0D1B2A' }}>7-Day Trial</div>
              <div style={{ fontSize: 48, fontWeight: 800, color: '#0D1B2A', lineHeight: 1, margin: '16px 0 4px' }}>$0</div>
              <div style={{ fontSize: 14, color: '#5A6A7A', marginBottom: 24 }}>Full access for 7 days</div>
              <div style={{ height: 1, background: 'rgba(13,27,42,0.08)', marginBottom: 24 }}></div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {['All 4 subjects unlocked', 'AI question generation', 'AI writing feedback', 'Progress dashboard', 'Years 1–6 difficulty', 'No credit card needed'].map(f => (
                  <li key={f} style={{ display: 'flex', gap: 8, fontSize: 14, color: '#5A6A7A' }}>
                    <span style={{ color: '#52B788', fontWeight: 700 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/signup')} style={{ width: '100%', padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 700, border: '2px solid rgba(13,27,42,0.2)', background: 'transparent', color: '#0D1B2A', cursor: 'pointer' }}>
                Create free account
              </button>
            </div>

            {/* Subscription */}
            <div style={{ background: '#0D1B2A', borderRadius: 20, padding: 36, position: 'relative', transform: 'scale(1.04)', boxShadow: '0 24px 64px rgba(13,27,42,0.25)' }}>
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#E8B84B', color: '#0D1B2A', padding: '5px 16px', borderRadius: 100, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Most popular</div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Monthly subscription</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 900, color: '#fff' }}>Unlimited</div>
              <div style={{ fontSize: 48, fontWeight: 800, color: '#E8B84B', lineHeight: 1, margin: '16px 0 4px' }}>$9.99</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>per month · cancel anytime</div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', marginBottom: 24 }}></div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {['Unlimited tests & questions', 'Fresh AI questions every session', 'All 4 subjects', 'Timed & untimed modes', 'Full writing AI feedback', 'Detailed progress tracking', 'Years 1–6 difficulty'].map(f => (
                  <li key={f} style={{ display: 'flex', gap: 8, fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                    <span style={{ color: '#E8B84B', fontWeight: 700 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/signup')} style={{ width: '100%', padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 700, border: 'none', background: '#E8B84B', color: '#0D1B2A', cursor: 'pointer' }}>
                Start 7-day free trial
              </button>
            </div>

            {/* PDF */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 36, border: '1px solid rgba(13,27,42,0.08)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#5A6A7A', marginBottom: 8 }}>One-off purchase</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 900, color: '#0D1B2A' }}>PDF Test</div>
              <div style={{ fontSize: 48, fontWeight: 800, color: '#0D1B2A', lineHeight: 1, margin: '16px 0 4px' }}>15¢</div>
              <div style={{ fontSize: 14, color: '#5A6A7A', marginBottom: 24 }}>per question · no subscription</div>
              <div style={{ height: 1, background: 'rgba(13,27,42,0.08)', marginBottom: 24 }}></div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {['Choose subject & year level', '10 to 100 questions', 'Professional exam-style PDF', 'Answer key at the back', 'Pay once, download instantly', 'Great for tutors & classrooms'].map(f => (
                  <li key={f} style={{ display: 'flex', gap: 8, fontSize: 14, color: '#5A6A7A' }}>
                    <span style={{ color: '#52B788', fontWeight: 700 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/pdf-generator')} style={{ width: '100%', padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 700, border: 'none', background: '#0D1B2A', color: '#fff', cursor: 'pointer' }}>
                Generate a PDF test
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#0D1B2A', padding: '100px 48px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E8B84B', marginBottom: 16 }}>Get started today</div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, color: '#fff', marginBottom: 16 }}>
            Your child's scholarship starts <em style={{ fontStyle: 'italic', color: '#E8B84B' }}>here</em>
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 40 }}>
            7 days free. No credit card. Cancel anytime.
          </p>
          <button onClick={() => navigate('/signup')} style={{
            background: '#E8B84B', color: '#0D1B2A', padding: '18px 40px',
            borderRadius: 100, fontSize: 18, fontWeight: 700, border: 'none', cursor: 'pointer'
          }}>Start free trial — 7 days free</button>
          <div style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>No credit card required · Instant access · Cancel anytime</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0D1B2A', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 900, color: 'rgba(255,255,255,0.8)' }}>Scholar<span style={{ color: '#E8B84B' }}>Prep</span></div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>© 2026 ScholarPrep · Built for Australian primary school families</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>ACER · AAST · Edutest</div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @media (max-width: 900px) {
          section[style] { padding: 60px 20px !important; }
          h2 { font-size: 32px !important; }
        }
      `}</style>
    </div>
  );
}