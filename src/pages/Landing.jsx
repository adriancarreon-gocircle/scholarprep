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
            Ace the <em style={{ fontStyle: 'italic', color: '#E8B84B' }}>exam.</em> Every time.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: '#5A6A7A', marginBottom: 36, maxWidth: 460 }}>
            AI-powered exam preparation for ACER, AAST, Edutest and NAPLAN. Fresh questions every session,
            personalised AI feedback, and real full-length simulated exams — for Years 1 to 11.
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
          {['ACER', 'AAST', 'Edutest', 'NAPLAN', 'AIS', 'SEAL', 'Selective Entry Exams'].map(t => (
            <div key={t} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', padding: '7px 18px', borderRadius: 100, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{t}</div>
          ))}
        </div>
      </div>

      {/* SELECTIVE SCHOOLS BANNER */}
      <div style={{ background: '#F0E8D8', padding: '28px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E8B84B', marginBottom: 10 }}>Selective entry high school preparation</div>
          <p style={{ fontSize: 14, color: '#5A6A7A', lineHeight: 1.7, marginBottom: 10 }}>
            ScholarPrep helps students prepare for entry into Australia's most competitive selective high schools, including:
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              'Melbourne High School',
              'Mac.Robertson Girls\' High School',
              'Suzanne Cory High School',
              'North Sydney Boys High School',
              'North Sydney Girls High School',
              'James Ruse Agricultural High School',
              'Normanhurst Boys High School'
            ].map(s => (
              <div key={s} style={{ background: '#fff', border: '1px solid rgba(13,27,42,0.1)', padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, color: '#0D1B2A' }}>{s}</div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" style={{ padding: '100px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E8B84B', marginBottom: 16 }}>Why ScholarPrep</div>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, letterSpacing: -1.5, color: '#0D1B2A', marginBottom: 16 }}>
          Everything your child needs to <em style={{ fontStyle: 'italic', color: '#E8B84B' }}>ace the exam</em>
        </h2>
        <p style={{ fontSize: 18, color: '#5A6A7A', lineHeight: 1.7, maxWidth: 540, marginBottom: 60 }}>
          Unlike printed workbooks, ScholarPrep generates new questions every single session from our unlimited question bank — so your child actually learns, not just memorises.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { icon: '🤖', title: 'Unlimited question bank', desc: 'Fresh, unique exam-style questions every session based on real test patterns. Never the same question twice — unlimited practice.' },
            { icon: '🎯', title: 'Full simulated exams', desc: 'Sit a complete timed exam just like the real test centre — multiple sections, timed breaks, and real exam conditions from start to finish.' },
            { icon: '📊', title: 'AI-powered analysis', desc: 'More detailed than the average teacher or tutor. AI identifies your child\'s exact weak question types and hones in on what needs work.' },
            { icon: '📈', title: 'Progress tracking', desc: 'Track improvement across every session. See strengths, weaknesses, and trends by subject and question type over time.' },
            { icon: '✏️', title: 'AI writing feedback', desc: 'Submit typed or handwritten responses. Get detailed feedback and scores against real marking criteria.' },
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

      {/* SIMULATED EXAM SECTION */}
      <section style={{ background: '#0D1B2A', padding: '100px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E8B84B', marginBottom: 16 }}>Full simulated exams</div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, color: '#fff', marginBottom: 16 }}>
            Sit the real exam — before exam day
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 48, maxWidth: 600 }}>
            ScholarPrep replicates the exact conditions of the real test centre — timed sections, scheduled breaks, and multiple papers in one sitting. No surprises on exam day.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 36, marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#E8B84B', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Example: ACER Selective High School Entrance Exam</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { time: '60 min', label: 'Maths & Quantitative Reasoning', color: '#E8B84B', type: 'exam' },
                { time: '20 min', label: 'Break', color: 'rgba(255,255,255,0.2)', type: 'break' },
                { time: '55 min', label: 'Reading & Verbal Reasoning', color: '#52B788', type: 'exam' },
                { time: '5 min', label: 'Break', color: 'rgba(255,255,255,0.2)', type: 'break' },
                { time: '40 min', label: 'Writing', color: '#7B61FF', type: 'exam' },
              ].map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  background: s.type === 'break' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)',
                  borderRadius: 12, padding: '14px 20px',
                  border: `1px solid ${s.type === 'break' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'}`
                }}>
                  <div style={{ minWidth: 64, fontSize: 15, fontWeight: 800, color: s.color }}>{s.time}</div>
                  <div style={{ fontSize: 14, color: s.type === 'break' ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.8)', fontStyle: s.type === 'break' ? 'italic' : 'normal' }}>{s.label}</div>
                  {s.type === 'exam' && <div style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: s.color, background: 'rgba(255,255,255,0.06)', padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase' }}>Timed</div>}
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>ScholarPrep simulates the full exam experience for ACER, AAST, Edutest, NAPLAN and more.</p>
        </div>
      </section>

      {/* AI ANALYSIS SECTION */}
      <section style={{ background: '#FAF6EE', padding: '100px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E8B84B', marginBottom: 16 }}>Smarter than a tutor</div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(32px,4vw,48px)', fontWeight: 900, color: '#0D1B2A', marginBottom: 20, letterSpacing: -1 }}>
              Personalised AI analysis of every student
            </h2>
            <p style={{ fontSize: 16, color: '#5A6A7A', lineHeight: 1.8, marginBottom: 24 }}>
              The average teacher has 25+ students. Even the best tutor can only cover so much in an hour. ScholarPrep's AI analyses every single question your child attempts — identifying the exact question types, topics, and patterns where they lose marks.
            </p>
            <p style={{ fontSize: 16, color: '#5A6A7A', lineHeight: 1.8, marginBottom: 32 }}>
              It doesn't just say "needs improvement in Maths." It tells you: <em>"Struggles with multi-step word problems involving fractions and time — here's what to practise next."</em>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Identifies specific weak question types — not just subjects',
                'Tracks improvement session by session',
                'Highlights strengths to build confidence',
                'Recommends what to focus on next',
              ].map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ color: '#52B788', fontWeight: 700, fontSize: 16, marginTop: 2 }}>✓</span>
                  <span style={{ fontSize: 15, color: '#5A6A7A', lineHeight: 1.6 }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { subject: 'Mathematics', strength: 78, area: 'Fractions & decimals', note: 'Multi-step word problems — needs focus', color: '#E8B84B' },
              { subject: 'Reading Comprehension', strength: 91, area: 'Inference questions', note: 'Strong — keep maintaining', color: '#52B788' },
              { subject: 'General Ability', strength: 64, area: 'Number sequences', note: 'Letter patterns — needs practice', color: '#E07A5F' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid rgba(13,27,42,0.07)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0D1B2A' }}>{s.subject}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.strength}%</div>
                </div>
                <div style={{ background: '#FAF6EE', borderRadius: 100, height: 6, marginBottom: 10 }}>
                  <div style={{ background: s.color, borderRadius: 100, height: 6, width: `${s.strength}%` }}></div>
                </div>
                <div style={{ fontSize: 12, color: '#5A6A7A' }}>⚠️ {s.note}</div>
              </div>
            ))}
          </div>
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
              { n: '2', t: 'Choose your exam', d: 'Pick your target exam, subject, year level, and whether you want a quick practice or a full simulated sitting.' },
              { n: '3', t: 'AI generates it', d: 'Fresh questions from our unlimited question bank every time. No two tests are ever the same.' },
              { n: '4', t: 'Review & improve', d: 'Instant scores, AI analysis of your weak spots, and progress tracking across every session.' }
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
              { icon: '🔢', title: 'Mathematics', desc: 'Word problems, fractions, decimals, geometry, time, money, percentages and more — all in real-world exam style for Years 1–11.', tags: ['Number & algebra', 'Measurement', 'Word problems', 'Geometry'], bg: '#FEF3D0' },
              { icon: '📖', title: 'Reading Comprehension', desc: 'Passages from stories, poems, fact sheets and brochures — with inference, vocabulary and comprehension questions exactly like the real exam.', tags: ['Inference', 'Vocabulary', 'Main idea', 'Author\'s purpose'], bg: '#E8F5EE' },
              { icon: '🧩', title: 'General Ability', desc: 'Verbal and non-verbal reasoning, pattern recognition, analogies, sequences and logical thinking — core to ACER, AAST and Edutest.', tags: ['Verbal reasoning', 'Pattern recognition', 'Analogies', 'Sequences'], bg: '#EEF0FF' },
              { icon: '✏️', title: 'Writing', desc: 'Narrative and persuasive prompts with detailed AI marking feedback. Type or upload a photo of handwritten work.', tags: ['Narrative', 'Persuasive', 'AI feedback', 'Scored criteria'], bg: '#FEE8E2' }
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
                {['All 4 subjects unlocked', 'Unlimited question bank', 'AI writing feedback', 'Progress dashboard & AI analysis', 'Years 1–11 difficulty', 'No credit card needed'].map(f => (
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
                {['Unlimited tests & question bank', 'Full simulated timed exams', 'All 4 subjects · Years 1–11', 'AI personalised analysis', 'Full writing AI feedback', 'Detailed progress tracking', 'ACER, AAST, Edutest & NAPLAN'].map(f => (
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
            Your child's exam success starts <em style={{ fontStyle: 'italic', color: '#E8B84B' }}>here</em>
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
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>© 2026 ScholarPrep — a Go Circle Pty Ltd company. Built for Australian primary and secondary school families.</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>ACER · AAST · Edutest · NAPLAN</div>
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