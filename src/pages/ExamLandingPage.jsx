import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SiteHeader from '../components/SiteHeader';
import { EXAM_DATA } from '../data/examContent';

// ── The page component ──────────────────────────────────────────────────────
// Renders one exam's page from EXAM_DATA (src/data/examContent.js). Every
// "rebuilt" field below (introParagraphs, testDayInfo, hardTopics,
// howToApproach, studyGuide, freeTest, ebooksPitch) is optional — an exam
// that hasn't been rebuilt yet (still on the original shorter schema) just
// skips those sections and renders the original shorter page, so exams can
// be upgraded one at a time without breaking the others.
export default function ExamLandingPage() {
  const { slug } = useParams();
  const exam = EXAM_DATA[slug];
  const [showAnswers, setShowAnswers] = useState(false);

  if (!exam) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h1 style={{ fontSize: 24, color: '#0F172A', marginBottom: 8 }}>Exam not found</h1>
          <p style={{ color: '#64748B', marginBottom: 24 }}>We couldn't find that exam page.</p>
          <Link to="/" style={{ color: '#4338CA', fontWeight: 700, textDecoration: 'none' }}>← Back to ScholarPrep</Link>
        </div>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": `${exam.name} Preparation — ScholarPrep`,
    "description": exam.metaDesc,
    "provider": { "@type": "Organization", "name": "ScholarPrep", "url": "https://scholarprep.com.au" },
    "offers": { "@type": "Offer", "price": "9.99", "priceCurrency": "AUD", "availability": "https://schema.org/InStock" },
  };

  const freeTestJsonLd = exam.freeTest ? {
    "@context": "https://schema.org",
    "@type": "Quiz",
    "about": { "@type": "Thing", "name": exam.name },
    "name": exam.freeTest.heading,
    "educationalLevel": exam.yearLevel,
    "numberOfQuestions": exam.freeTest.questions.length,
  } : null;

  const jumpLinks = [
    { href: '#structure', label: 'Test structure' },
    exam.freeTest && { href: '#free-test', label: `Free ${exam.shortName} test` },
    exam.studyGuide && { href: '#study-guide', label: 'Study plan' },
    { href: '#ebooks', label: 'eBooks & next steps' },
  ].filter(Boolean);

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter', 'DM Sans', sans-serif" }}>
      <Helmet>
        <title>{exam.metaTitle} | ScholarPrep</title>
        <meta name="description" content={exam.metaDesc} />
        <meta name="keywords" content={exam.keywords} />
        <meta property="og:title" content={`${exam.metaTitle} | ScholarPrep`} />
        <meta property="og:description" content={exam.metaDesc} />
        <meta property="og:url" content={`https://scholarprep.com.au/exams/${slug}`} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`https://scholarprep.com.au/exams/${slug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        {freeTestJsonLd && <script type="application/ld+json">{JSON.stringify(freeTestJsonLd)}</script>}
      </Helmet>

      {/* ── Nav bar — shared with every other public page ── */}
      <SiteHeader />

      {/* ── Hero ── */}
      <header style={{ background: `linear-gradient(135deg, ${exam.lightBg} 0%, #fff 100%)`, padding: '132px 40px 56px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: `1.5px solid ${exam.color}30`, borderRadius: 100, padding: '6px 16px', marginBottom: 24 }}>
            <span style={{ fontSize: 18 }}>{exam.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: exam.color, fontFamily: 'Inter, sans-serif' }}>{exam.state}</span>
          </div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#0F172A', letterSpacing: -1, lineHeight: 1.15, marginBottom: 16 }}>
            {exam.name}<br />
            <span style={{ color: exam.color }}>Preparation & Practice Tests</span>
          </h1>
          <p style={{ fontSize: 18, color: '#475569', lineHeight: 1.7, marginBottom: 32, maxWidth: 640 }}>{exam.heroLine}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
            <Link to="/signup" style={{ display: 'inline-block', padding: '14px 32px', borderRadius: 100, fontSize: 16, fontWeight: 700, color: '#fff', background: exam.color, textDecoration: 'none', boxShadow: `0 4px 16px ${exam.color}30` }}>
              Start 7-day free trial →
            </Link>
            <Link to="/pdf-generator" style={{ display: 'inline-block', padding: '14px 32px', borderRadius: 100, fontSize: 16, fontWeight: 700, color: exam.color, background: '#fff', border: `1.5px solid ${exam.color}40`, textDecoration: 'none' }}>
              Try a free PDF test
            </Link>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {jumpLinks.map(j => (
              <a key={j.href} href={j.href} style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 100, padding: '6px 14px', textDecoration: 'none' }}>
                {j.label} ↓
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* ── About this exam ── */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '56px 40px' }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>About the {exam.shortName}</h2>
        {exam.introParagraphs ? (
          exam.introParagraphs.map((p, i) => (
            <p key={i} style={{ fontSize: 16, color: '#475569', lineHeight: 1.8, marginBottom: 20 }}>{p}</p>
          ))
        ) : (
          <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.8, marginBottom: 24 }}>{exam.intro}</p>
        )}

        {exam.schools.length > 0 && (
          <div style={{ background: exam.lightBg, borderRadius: 16, padding: '20px 24px', marginBottom: 40 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: exam.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Schools & Programs</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {exam.schools.map(s => (
                <span key={s} style={{ fontSize: 13, padding: '5px 14px', borderRadius: 100, background: '#fff', border: `1px solid ${exam.color}25`, color: '#334155', fontWeight: 600 }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── Exam structure ── */}
        <h2 id="structure" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 20, scrollMarginTop: 76 }}>{exam.shortName} Test Structure</h2>
        <div style={{ marginBottom: 12 }}>
          {exam.structure.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid #F3F4F6', alignItems: 'flex-start' }}>
              <div style={{ minWidth: 100 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: exam.color }}>{s.duration}</div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>{s.questions}</div>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>{s.name}</div>
                <div style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>{s.desc}</div>
                {s.questionTypes && (
                  <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
                    {s.questionTypes.map((qt, i2) => (
                      <li key={i2} style={{ fontSize: 13, color: '#64748B', lineHeight: 1.65, marginBottom: 4 }}>{qt}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 14, color: '#94A3B8', fontStyle: 'italic', marginBottom: exam.testDayInfo ? 32 : 48 }}>Total: {exam.totalTime}</div>

        {/* ── Test day: format & breaks ── */}
        {exam.testDayInfo && (
          <div style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>Test Day: Format & Breaks</h2>
            {exam.testDayInfo.map((p, i) => (
              <p key={i} style={{ fontSize: 15, color: '#475569', lineHeight: 1.8, marginBottom: 14 }}>{p}</p>
            ))}
          </div>
        )}

        {/* ── Where students lose marks ── */}
        {exam.hardTopics && (
          <div style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>Where Students Lose Marks</h2>
            {exam.hardTopics.map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < exam.hardTopics.length - 1 ? '1px solid #F3F4F6' : 'none', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 14, color: exam.color, fontWeight: 700, marginTop: 2 }}>⚠</span>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>{h.area}</div>
                  <div style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7 }}>{h.note}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Preparation tips ── */}
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>Preparation Tips</h2>
        <div style={{ marginBottom: 48 }}>
          {exam.tips.map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 14, color: exam.color, fontWeight: 700, marginTop: 2 }}>✓</span>
              <span style={{ fontSize: 15, color: '#334155', lineHeight: 1.7 }}>{tip}</span>
            </div>
          ))}
        </div>

        {/* ── How to approach each section ── */}
        {exam.howToApproach && (
          <div style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>How to Approach Each Section</h2>
            {exam.howToApproach.map((h, i) => (
              <div key={i} style={{ padding: '12px 0', borderBottom: i < exam.howToApproach.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: exam.color, marginBottom: 3 }}>{h.section}</div>
                <div style={{ fontSize: 14.5, color: '#334155', lineHeight: 1.75 }}>{h.tip}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Study guide ── */}
        {exam.studyGuide && (
          <div id="study-guide" style={{ marginBottom: 48, scrollMarginTop: 76 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>{exam.shortName} Study Plan</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {exam.studyGuide.map((g, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, padding: '14px 0', borderBottom: i < exam.studyGuide.length - 1 ? '1px solid #F3F4F6' : 'none', alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 120, fontSize: 13, fontWeight: 800, color: exam.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{g.week}</div>
                  <div style={{ fontSize: 14.5, color: '#334155', lineHeight: 1.75 }}>{g.focus}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Free practice test ── */}
        {exam.freeTest && (
          <div id="free-test" style={{ marginBottom: 48, scrollMarginTop: 76 }}>
            <div style={{ background: exam.lightBg, borderRadius: 20, padding: '32px 28px', border: `1px solid ${exam.color}25` }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 26, fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>{exam.freeTest.heading}</h2>
              <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.75, marginBottom: 28 }}>{exam.freeTest.subtitle}</p>

              {exam.freeTest.passage && (
                <div style={{ background: '#fff', borderRadius: 14, padding: '20px 22px', marginBottom: 24, border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>{exam.freeTest.passage.title}</div>
                  {exam.freeTest.passage.text.split('\n\n').map((para, i) => (
                    <p key={i} style={{ fontSize: 14, color: '#334155', lineHeight: 1.8, marginBottom: 12 }}>{para}</p>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {exam.freeTest.questions.map(q => (
                  <div key={q.num} style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: exam.color }}>Q{q.num}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{q.subject}</span>
                    </div>
                    <div style={{ fontSize: 15, color: '#0F172A', fontWeight: 600, lineHeight: 1.6, marginBottom: 12 }}>{q.prompt}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
                      {q.options.map((opt, oi) => {
                        const revealed = showAnswers && oi === q.answer;
                        return (
                          <div key={oi} style={{
                            fontSize: 13.5, padding: '8px 12px', borderRadius: 8,
                            background: revealed ? '#DCFCE7' : '#F8FAFC',
                            border: revealed ? '1px solid #86EFAC' : '1px solid #E5E7EB',
                            color: revealed ? '#166534' : '#334155', fontWeight: revealed ? 700 : 500,
                          }}>
                            {String.fromCharCode(65 + oi)}) {opt}{revealed ? ' ✓' : ''}
                          </div>
                        );
                      })}
                    </div>
                    {showAnswers && q.explanation && (
                      <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, marginTop: 10, paddingTop: 10, borderTop: '1px dashed #E5E7EB' }}>
                        <strong style={{ color: '#0F172A' }}>Why: </strong>{q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {exam.freeTest.bonusWriting && (
                <div style={{ marginTop: 24, background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: exam.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Bonus Writing Practice</div>
                  {exam.freeTest.bonusWriting.map((b, i) => (
                    <div key={i} style={{ fontSize: 14, color: '#334155', lineHeight: 1.7, marginBottom: i < exam.freeTest.bonusWriting.length - 1 ? 10 : 0 }}>{b}</div>
                  ))}
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: 28 }}>
                <button
                  onClick={() => setShowAnswers(v => !v)}
                  style={{
                    border: 'none', borderRadius: 100, padding: '12px 28px', fontSize: 14.5, fontWeight: 700,
                    color: '#fff', background: exam.color, cursor: 'pointer', boxShadow: `0 4px 16px ${exam.color}30`,
                  }}
                >
                  {showAnswers ? 'Hide answers ↑' : 'Reveal answers ↓'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── eBooks cross-sell & next steps ── */}
        {exam.ebooksPitch && (
          <div id="ebooks" style={{ marginBottom: 48, scrollMarginTop: 76 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>Prefer a Practice Book? Get the ScholarPrep eBooks</h2>
            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.8, marginBottom: 20 }}>{exam.ebooksPitch}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/ebooks" style={{ display: 'inline-block', padding: '12px 26px', borderRadius: 100, fontSize: 14.5, fontWeight: 700, color: '#fff', background: '#7C3AED', textDecoration: 'none' }}>
                Browse the eBooks catalogue →
              </Link>
              <Link to="/signup" style={{ display: 'inline-block', padding: '12px 26px', borderRadius: 100, fontSize: 14.5, fontWeight: 700, color: exam.color, background: '#fff', border: `1.5px solid ${exam.color}40`, textDecoration: 'none' }}>
                7-day free trial
              </Link>
              <Link to="/pdf-generator" style={{ display: 'inline-block', padding: '12px 26px', borderRadius: 100, fontSize: 14.5, fontWeight: 700, color: '#475569', background: '#fff', border: '1.5px solid #E5E7EB', textDecoration: 'none' }}>
                Generate a PDF test (15¢/Q)
              </Link>
            </div>
          </div>
        )}

        {/* ── What ScholarPrep offers ── */}
        <div style={{ background: '#F8FAFC', borderRadius: 20, padding: '40px 32px', border: '1px solid #E5E7EB', marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 20, textAlign: 'center' }}>How ScholarPrep Prepares You</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {[
              { icon: '🔄', title: 'Unlimited Fresh Questions', desc: 'New questions every session — your child never sees the same test twice.' },
              { icon: '⏱️', title: 'Full Simulated Exams', desc: `Timed sections matching the real ${exam.shortName} exam structure and breaks.` },
              { icon: '📊', title: 'Progress Tracking', desc: 'See scores by topic and question type. Know exactly where to focus.' },
              { icon: '✍️', title: 'Writing Feedback', desc: 'Detailed scored criteria on every writing submission.' },
            ].map(f => (
              <div key={f.title} style={{ textAlign: 'center', padding: 16 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>Start Preparing Today</h2>
          <p style={{ fontSize: 16, color: '#64748B', marginBottom: 28 }}>7-day free trial. No credit card required. Cancel anytime.</p>
          <Link to="/signup" style={{ display: 'inline-block', padding: '16px 40px', borderRadius: 100, fontSize: 17, fontWeight: 700, color: '#fff', background: exam.color, textDecoration: 'none', boxShadow: `0 6px 24px ${exam.color}30` }}>
            Start free trial — $9.99/month →
          </Link>
        </div>

        {/* ── Other exams ── */}
        <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 40 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Also prepare for</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(EXAM_DATA).filter(([k]) => k !== slug).map(([k, e]) => (
              <Link key={k} to={`/exams/${k}`} style={{ fontSize: 12, padding: '5px 14px', borderRadius: 100, background: '#F8FAFC', border: '1px solid #E5E7EB', color: '#475569', fontWeight: 600, textDecoration: 'none' }}>
                {e.icon} {e.shortName}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#F8FAFC', borderTop: '1px solid #F3F4F6', padding: '32px 40px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.8, maxWidth: 700, margin: '0 auto' }}>
          ScholarPrep is an independent educational platform and is not affiliated with, endorsed by, or associated with ACARA, ACER, Edutest, ICAS Assessments (Janison), or any government education department. Exam structures, question counts and durations shown are approximate, based on publicly available information, and may change. Always confirm details with the official testing body. ScholarPrep provides practice materials for educational purposes only and does not guarantee exam outcomes, scores, or placement results.
        </p>
        <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 12 }}>© {new Date().getFullYear()} Go Circle Pty Ltd · <Link to="/" style={{ color: '#94A3B8' }}>scholarprep.com.au</Link></p>
      </footer>
    </div>
  );
}