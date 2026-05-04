import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { generatePDFQuestions } from '../lib/ai';
import { useAuth } from '../hooks/useAuth';

const PRICE_PER_Q = 0.15;

export default function PDFGeneratorPage() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('mathematics');
  const [count, setCount] = useState(20);
  const [yearLevel, setYearLevel] = useState(5);
  const [phase, setPhase] = useState('config'); // config | paying | generating | done
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [passage, setPassage] = useState(null);

  const total = (count * PRICE_PER_Q).toFixed(2);

  // Check if returning from successful Stripe payment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('paid') === 'true') {
      const questionCount = parseInt(params.get('questions') || '20');
      const savedSubject = params.get('subject') || 'mathematics';
      const savedYearLevel = parseInt(params.get('year') || '5');

      setCount(questionCount);
      setSubject(savedSubject);
      setYearLevel(savedYearLevel);

      window.history.replaceState({}, '', '/pdf-generator');
      generateAfterPayment(savedSubject, questionCount, savedYearLevel);
    }
  }, []);

  const generateAfterPayment = async (subj, qCount, yrLevel) => {
    setPhase('generating');
    setError('');
    try {
      const data = await generatePDFQuestions(subj, qCount, yrLevel);
      if (subj === 'reading' && data.passage) {
        setPassage(data.passage);
        setQuestions(data.questions);
      } else {
        setQuestions(Array.isArray(data) ? data : []);
      }
      setPhase('done');
    } catch (e) {
      setError('Payment was successful but question generation failed. Please contact support or try again.');
      setPhase('config');
    }
  };

  const handlePayAndGenerate = async () => {
    setPhase('paying');
    setError('');
    try {
      const successUrl = `${window.location.origin}/pdf-generator?paid=true&questions=${count}&subject=${subject}&year=${yearLevel}`;
      const cancelUrl = `${window.location.origin}/pdf-generator`;

      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'pdf',
          questionCount: count,
          successUrl,
          cancelUrl,
          userEmail: user?.email,
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      window.location.href = data.url;
    } catch (e) {
      setError('Payment failed to load. Please try again.');
      setPhase('config');
    }
  };

  const handleDownloadPDF = () => {
    const win = window.open('', '_blank');
    const subjectLabel = { mathematics: 'Mathematics', reading: 'Reading Comprehension', general: 'General Ability' }[subject];
    const answers = questions.map((q, i) => `${i + 1}. ${q.correct}`).join('   ');

    const questionsHtml = subject === 'reading' && passage
      ? `<div class="passage"><h2>${passage.title}</h2><p>${passage.text.replace(/\n\n/g, '</p><p>')}</p></div>
         ${questions.map((q, i) => `
           <div class="question">
             <p class="q-text">${i + 1}. ${q.question}</p>
             <div class="options">
               ${Object.entries(q.options).map(([l, t]) => `<p>   ${l}. ${t}</p>`).join('')}
             </div>
           </div>`).join('')}`
      : questions.map((q, i) => `
          <div class="question">
            <p class="q-text">${i + 1}. ${q.question}</p>
            <div class="options">
              ${Object.entries(q.options).map(([l, t]) => `<p>   ${l}. ${t}</p>`).join('')}
            </div>
          </div>`).join('');

    win.document.write(`
      <!DOCTYPE html><html><head><title>ScholarPrep — ${subjectLabel} Test</title>
      <style>
        body { font-family: Times New Roman, serif; font-size: 12pt; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; color: #000; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 16px; margin-bottom: 24px; }
        .header h1 { font-size: 18pt; margin: 0 0 6px; }
        .header p { font-size: 11pt; margin: 2px 0; }
        .meta { display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 11pt; }
        .meta div { border: 1px solid #000; padding: 6px 12px; }
        .passage { border: 1px solid #ccc; padding: 16px; margin-bottom: 24px; background: #f9f9f9; }
        .passage h2 { font-size: 13pt; margin: 0 0 10px; text-align: center; }
        .question { margin-bottom: 20px; page-break-inside: avoid; }
        .q-text { font-weight: bold; margin: 0 0 6px; }
        .options { margin-left: 20px; }
        .answers { border-top: 2px solid #000; padding-top: 16px; margin-top: 40px; font-size: 11pt; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      <div class="header">
        <h1>ScholarPrep ${subjectLabel} Practice Test</h1>
        <p>Year ${yearLevel} Level · ${count} Questions · scholarprep.com.au</p>
      </div>
      <div class="meta">
        <div>Name: ________________________</div>
        <div>Date: ________________________</div>
        <div>Score: _______ / ${count}</div>
      </div>
      <div class="instructions"><p><strong>Instructions:</strong> Circle the letter of the best answer for each question. There is only one correct answer per question.</p></div>
      <br/>
      ${questionsHtml}
      <div class="answers">
        <h2>Answer Key</h2>
        <p>${answers}</p>
        <br/>
        <h3>Explanations</h3>
        ${questions.map((q, i) => `<p><strong>${i + 1}.</strong> ${q.correct}. ${q.options[q.correct]} — ${q.explanation}</p>`).join('')}
      </div>
      </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  return (
    <AppLayout>
      <div style={{ minHeight: '100vh', background: '#FAF6EE' }}>
        {/* Header */}
        <div style={{ background: '#0D1B2A', padding: '20px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 900, color: '#fff' }}>
            Scholar<span style={{ color: '#E8B84B' }}>Prep</span>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginLeft: 16, fontFamily: 'inherit', fontWeight: 400 }}>PDF Test Generator</span>
          </div>
          <a href="/app" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>← Back to home</a>
        </div>

        <div style={{ maxWidth: 680, margin: '0 auto', padding: 48 }}>
          {error && <div style={{ background: '#FDEAEA', border: '1px solid #E07A5F', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#B04030' }}>⚠️ {error}</div>}

          {phase === 'config' && (
            <>
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 900, color: '#0D1B2A', marginBottom: 8 }}>Generate a PDF Test</h1>
                <p style={{ fontSize: 16, color: '#5A6A7A', lineHeight: 1.7 }}>
                  Create a professional exam-style test PDF — looks just like a real scholarship exam, with an answer key at the back.
                  Just <strong style={{ color: '#0D1B2A' }}>15¢ per question</strong>. No subscription needed.
                </p>
                {user?.email && (
                  <div style={{ marginTop: 10, fontSize: 13, color: '#5A6A7A' }}>
                    Paying as: <strong style={{ color: '#0D1B2A' }}>{user.email}</strong>
                  </div>
                )}
              </div>

              {/* Subject */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(13,27,42,0.08)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Subject</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { k: 'mathematics', l: 'Mathematics', icon: '🔢', desc: 'Number, algebra, measurement, geometry' },
                    { k: 'reading', l: 'Reading Comprehension', icon: '📖', desc: 'Passage with inference & vocabulary questions' },
                    { k: 'general', l: 'General Ability', icon: '🧩', desc: 'Verbal reasoning, patterns, logic' }
                  ].map(s => (
                    <button key={s.k} onClick={() => setSubject(s.k)} style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                      borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                      background: subject === s.k ? '#0D1B2A' : '#FAF6EE',
                      border: subject === s.k ? 'none' : '1.5px solid rgba(13,27,42,0.1)',
                      transition: 'all 0.15s'
                    }}>
                      <span style={{ fontSize: 22 }}>{s.icon}</span>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: subject === s.k ? '#fff' : '#0D1B2A' }}>{s.l}</div>
                        <div style={{ fontSize: 13, color: subject === s.k ? 'rgba(255,255,255,0.55)' : '#5A6A7A' }}>{s.desc}</div>
                      </div>
                      {subject === s.k && <span style={{ marginLeft: 'auto', color: '#E8B84B', fontSize: 18 }}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year level */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(13,27,42,0.08)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Year level</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(y => (
                    <button key={y} onClick={() => setYearLevel(y)} style={{
                      flex: '1 0 auto', padding: '10px 0', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                      background: yearLevel === y ? '#0D1B2A' : '#FAF6EE',
                      color: yearLevel === y ? '#fff' : '#5A6A7A',
                      border: yearLevel === y ? 'none' : '1px solid rgba(13,27,42,0.12)',
                      transition: 'all 0.15s', minWidth: 52
                    }}>Yr {y}</button>
                  ))}
                </div>
              </div>

              {/* Question count */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid rgba(13,27,42,0.08)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Number of questions</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  {[10, 20, 30, 40, 50, 60, 80, 100].map(n => (
                    <button key={n} onClick={() => setCount(n)} style={{
                      padding: '8px 16px', borderRadius: 100, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                      background: count === n ? '#E8B84B' : '#FAF6EE',
                      color: count === n ? '#0D1B2A' : '#5A6A7A',
                      border: count === n ? 'none' : '1px solid rgba(13,27,42,0.12)',
                      transition: 'all 0.15s'
                    }}>{n}</button>
                  ))}
                </div>
                <div style={{ fontSize: 14, color: '#5A6A7A' }}>
                  {count} questions × 15¢ = <strong style={{ color: '#0D1B2A', fontSize: 16 }}>${total}</strong>
                </div>
              </div>

              {/* Summary + pay */}
              <div style={{ background: '#0D1B2A', borderRadius: 16, padding: 24, marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Order summary</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 16 }}>
                  {count} × {subject} questions · Year {yearLevel} · PDF with answer key
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#E8B84B' }}>${total}</div>
                  <button onClick={handlePayAndGenerate} style={{
                    background: '#E8B84B', color: '#0D1B2A', padding: '12px 28px',
                    borderRadius: 100, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer'
                  }}>
                    Pay & Generate PDF →
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#5A6A7A', textAlign: 'center' }}>
                Secure payment via Stripe · Instant PDF download · No subscription required
              </div>
            </>
          )}

          {phase === 'paying' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 48 }}>💳</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 900, color: '#0D1B2A' }}>Redirecting to checkout...</div>
              <div style={{ fontSize: 15, color: '#5A6A7A', maxWidth: 340, lineHeight: 1.6 }}>
                You'll be taken to Stripe's secure checkout page to complete your payment.
              </div>
              <div style={{ width: 36, height: 36, border: '3px solid rgba(13,27,42,0.1)', borderTop: '3px solid #0D1B2A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}></div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {phase === 'generating' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 48 }}>📄</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 900, color: '#0D1B2A' }}>Generating your test...</div>
              <div style={{ fontSize: 15, color: '#5A6A7A', maxWidth: 340, lineHeight: 1.6 }}>
                Creating {count} unique {subject} questions at Year {yearLevel} level. This may take 20–40 seconds for larger tests.
              </div>
              <div style={{ width: 36, height: 36, border: '3px solid rgba(13,27,42,0.1)', borderTop: '3px solid #0D1B2A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}></div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {phase === 'done' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: '#E8F5EE', borderRadius: 20, padding: 40, marginBottom: 24 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 900, color: '#0D1B2A', marginBottom: 8 }}>Your test is ready!</div>
                <div style={{ fontSize: 15, color: '#5A6A7A', marginBottom: 24 }}>
                  {questions.length} questions · {subject === 'mathematics' ? 'Mathematics' : subject === 'reading' ? 'Reading Comprehension' : 'General Ability'} · Year {yearLevel}
                </div>
                <button onClick={handleDownloadPDF} style={{
                  background: '#0D1B2A', color: '#fff', padding: '16px 36px',
                  borderRadius: 100, fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(13,27,42,0.2)'
                }}>
                  📥 Download / Print PDF
                </button>
              </div>
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(13,27,42,0.08)', textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0D1B2A', marginBottom: 8 }}>📋 Your PDF includes:</div>
                <div style={{ fontSize: 14, color: '#5A6A7A', lineHeight: 1.8 }}>
                  ✓ {questions.length} multiple-choice questions<br />
                  {passage && `✓ Reading passage: ${passage.title}`}<br />
                  ✓ Student name, date & score fields<br />
                  ✓ Clear A/B/C/D answer options<br />
                  ✓ Complete answer key at the back<br />
                  ✓ Full explanations for every question
                </div>
              </div>
              <button onClick={() => { setPhase('config'); setQuestions([]); setPassage(null); }} style={{
                padding: '12px 28px', borderRadius: 100, fontSize: 14, fontWeight: 600,
                background: '#FAF6EE', color: '#0D1B2A', border: '1.5px solid rgba(13,27,42,0.12)', cursor: 'pointer'
              }}>
                Generate another test
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}