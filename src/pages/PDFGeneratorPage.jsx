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
  const [phase, setPhase] = useState('config');
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [passage, setPassage] = useState(null);

  const total = (count * PRICE_PER_Q).toFixed(2);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('paid') === 'true') {
      const questionCount = parseInt(params.get('questions') || '20');
      const savedSubject = params.get('subject') || 'mathematics';
      const savedYearLevel = parseInt(params.get('year') || '5');
      setCount(questionCount); setSubject(savedSubject); setYearLevel(savedYearLevel);
      window.history.replaceState({}, '', '/pdf-generator');
      generateAfterPayment(savedSubject, questionCount, savedYearLevel);
    }
  }, []);

  const generateAfterPayment = async (subj, qCount, yrLevel) => {
    setPhase('generating'); setError('');
    try {
      const data = await generatePDFQuestions(subj, qCount, yrLevel);
      if (subj === 'reading' && data.passage) { setPassage(data.passage); setQuestions(data.questions); }
      else setQuestions(Array.isArray(data) ? data : []);
      setPhase('done');
    } catch (e) {
      setError('Payment was successful but question generation failed. Please contact support.');
      setPhase('config');
    }
  };

  const handlePayAndGenerate = async () => {
    setPhase('paying'); setError('');
    try {
      const successUrl = `${window.location.origin}/pdf-generator?paid=true&questions=${count}&subject=${subject}&year=${yearLevel}`;
      const cancelUrl = `${window.location.origin}/pdf-generator`;
      const response = await fetch('/api/stripe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'pdf', questionCount: count, successUrl, cancelUrl, userEmail: user?.email })
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
         ${questions.map((q, i) => `<div class="question"><p class="q-text">${i + 1}. ${q.question}</p><div class="options">${Object.entries(q.options).map(([l, t]) => `<p>   ${l}. ${t}</p>`).join('')}</div></div>`).join('')}`
      : questions.map((q, i) => `<div class="question"><p class="q-text">${i + 1}. ${q.question}</p><div class="options">${Object.entries(q.options).map(([l, t]) => `<p>   ${l}. ${t}</p>`).join('')}</div></div>`).join('');
    win.document.write(`<!DOCTYPE html><html><head><title>ScholarPrep — ${subjectLabel} Test</title>
      <style>body{font-family:Times New Roman,serif;font-size:12pt;line-height:1.6;max-width:800px;margin:0 auto;padding:40px;color:#000}.header{text-align:center;border-bottom:2px solid #000;padding-bottom:16px;margin-bottom:24px}.header h1{font-size:18pt;margin:0 0 6px}.header p{font-size:11pt;margin:2px 0}.meta{display:flex;justify-content:space-between;margin-bottom:24px;font-size:11pt}.meta div{border:1px solid #000;padding:6px 12px}.passage{border:1px solid #ccc;padding:16px;margin-bottom:24px;background:#f9f9f9}.passage h2{font-size:13pt;margin:0 0 10px;text-align:center}.question{margin-bottom:20px;page-break-inside:avoid}.q-text{font-weight:bold;margin:0 0 6px}.options{margin-left:20px}.answers{border-top:2px solid #000;padding-top:16px;margin-top:40px;font-size:11pt}@media print{body{padding:20px}}</style></head><body>
      <div class="header"><h1>ScholarPrep ${subjectLabel} Practice Test</h1><p>Year ${yearLevel} Level · ${count} Questions · scholarprep.com.au</p></div>
      <div class="meta"><div>Name: ________________________</div><div>Date: ________________________</div><div>Score: _______ / ${count}</div></div>
      <div class="instructions"><p><strong>Instructions:</strong> Circle the letter of the best answer for each question. There is only one correct answer per question.</p></div><br/>
      ${questionsHtml}
      <div class="answers"><h2>Answer Key</h2><p>${answers}</p><br/><h3>Explanations</h3>${questions.map((q, i) => `<p><strong>${i + 1}.</strong> ${q.correct}. ${q.options[q.correct]} — ${q.explanation}</p>`).join('')}</div>
      </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const spinnerStyle = `@keyframes spin { to { transform: rotate(360deg); } }`;

  return (
    <AppLayout>
      <div style={{ minHeight: '100vh', background: '#F5F7FF' }}>

        {/* Header */}
        <div style={{ background: '#fff', borderBottom: '1px solid rgba(67,56,202,0.08)', padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📄</div>
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", fontSize: 20, fontWeight: 800, color: '#0F172A', letterSpacing: -0.3 }}>PDF Test Generator</div>
            <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>Generate a printable exam-style test with answer key</div>
          </div>
        </div>

        <div style={{ maxWidth: 560, margin: '0 auto', padding: 32 }}>

          {error && (
            <div style={{ background: '#FFF1F2', border: '1px solid #FDA4AF', borderRadius: 14, padding: '14px 18px', marginBottom: 20, fontSize: 14, color: '#BE123C', fontFamily: 'Inter, sans-serif' }}>
              ⚠️ {error}
            </div>
          )}

          {phase === 'config' && (
            <>
              <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.7, marginBottom: 28, fontFamily: 'Inter, sans-serif' }}>
                Generate a professional printable exam with an answer key at the back. Just <strong style={{ color: '#0F172A' }}>15¢ per question</strong>. No subscription needed.
              </p>
              {user?.email && (
                <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>
                  Paying as: <strong style={{ color: '#4338CA' }}>{user.email}</strong>
                </div>
              )}

              {/* Subject */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 14, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 2px 8px rgba(67,56,202,0.05)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>Subject</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { k: 'mathematics', l: 'Mathematics', icon: '🔢', desc: 'Number, algebra, measurement, geometry', bg: '#EEF2FF' },
                    { k: 'reading', l: 'Reading Comprehension', icon: '📖', desc: 'Passage with inference & vocabulary questions', bg: '#ECFDF5' },
                    { k: 'general', l: 'General Ability', icon: '🧩', desc: 'Verbal reasoning, patterns, logic', bg: '#FFF7ED' }
                  ].map(s => (
                    <button key={s.k} onClick={() => setSubject(s.k)} style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                      borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                      background: subject === s.k ? '#4338CA' : '#F8F9FF',
                      border: subject === s.k ? 'none' : '1.5px solid rgba(67,56,202,0.1)',
                      transition: 'all 0.15s',
                      boxShadow: subject === s.k ? '0 4px 16px rgba(67,56,202,0.25)' : 'none',
                    }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: subject === s.k ? 'rgba(255,255,255,0.15)' : s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: subject === s.k ? '#fff' : '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.l}</div>
                        <div style={{ fontSize: 13, color: subject === s.k ? 'rgba(255,255,255,0.6)' : '#64748B', fontFamily: 'Inter, sans-serif' }}>{s.desc}</div>
                      </div>
                      {subject === s.k && <span style={{ marginLeft: 'auto', color: '#A5B4FC', fontSize: 18 }}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year level */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 14, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 2px 8px rgba(67,56,202,0.05)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>Year level</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(y => (
                    <button key={y} onClick={() => setYearLevel(y)} style={{
                      flex: '1 0 auto', padding: '10px 0', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                      background: yearLevel === y ? '#4338CA' : '#F8F9FF',
                      color: yearLevel === y ? '#fff' : '#64748B',
                      border: yearLevel === y ? 'none' : '1.5px solid rgba(67,56,202,0.1)',
                      transition: 'all 0.15s', minWidth: 52,
                      boxShadow: yearLevel === y ? '0 3px 10px rgba(67,56,202,0.3)' : 'none',
                      fontFamily: 'Inter, sans-serif',
                    }}>Yr {y}</button>
                  ))}
                </div>
              </div>

              {/* Question count */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 20, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 2px 8px rgba(67,56,202,0.05)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>Number of questions</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  {[10, 20, 30, 40, 50, 60, 80, 100].map(n => (
                    <button key={n} onClick={() => setCount(n)} style={{
                      padding: '8px 18px', borderRadius: 100, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                      background: count === n ? '#F97316' : '#F8F9FF',
                      color: count === n ? '#fff' : '#64748B',
                      border: count === n ? 'none' : '1.5px solid rgba(67,56,202,0.1)',
                      transition: 'all 0.15s',
                      boxShadow: count === n ? '0 4px 12px rgba(249,115,22,0.3)' : 'none',
                      fontFamily: 'Inter, sans-serif',
                    }}>{n}</button>
                  ))}
                </div>
                <div style={{ fontSize: 14, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
                  {count} questions × 15¢ = <strong style={{ color: '#0F172A', fontSize: 18 }}>${total}</strong>
                </div>
              </div>

              {/* Order summary + pay */}
              <div style={{ background: 'linear-gradient(135deg, #3730A3, #4338CA)', borderRadius: 20, padding: 24, marginBottom: 14, boxShadow: '0 8px 32px rgba(67,56,202,0.25)' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Order summary</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>
                  {count} × {subject} questions · Year {yearLevel} · PDF with answer key
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>${total}</div>
                  <button onClick={handlePayAndGenerate} style={{
                    background: '#F97316', color: '#fff', padding: '13px 28px',
                    borderRadius: 100, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => e.target.style.background = '#EA6C0C'}
                    onMouseLeave={e => e.target.style.background = '#F97316'}
                  >
                    Pay & Generate PDF →
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
                Secure payment via Stripe · Instant PDF download · No subscription required
              </div>
            </>
          )}

          {phase === 'paying' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 20, textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>💳</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: '#0F172A' }}>Redirecting to checkout...</div>
              <div style={{ fontSize: 15, color: '#64748B', maxWidth: 340, lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>
                You'll be taken to Stripe's secure checkout page to complete your payment.
              </div>
              <div style={{ width: 40, height: 40, border: '3px solid #EEF2FF', borderTop: '3px solid #4338CA', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}></div>
              <style>{spinnerStyle}</style>
            </div>
          )}

          {phase === 'generating' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 20, textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>📄</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: '#0F172A' }}>Generating your test...</div>
              <div style={{ fontSize: 15, color: '#64748B', maxWidth: 340, lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>
                Creating {count} unique {subject} questions at Year {yearLevel} level. This may take 20–40 seconds for larger tests.
              </div>
              <div style={{ width: 40, height: 40, border: '3px solid #EEF2FF', borderTop: '3px solid #4338CA', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}></div>
              <style>{spinnerStyle}</style>
            </div>
          )}

          {phase === 'done' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: 'linear-gradient(135deg, #ECFDF5, #F0FDF4)', borderRadius: 24, padding: 40, marginBottom: 20, border: '1px solid #6EE7B7' }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 26, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Your test is ready!</div>
                <div style={{ fontSize: 15, color: '#64748B', marginBottom: 28, fontFamily: 'Inter, sans-serif' }}>
                  {questions.length} questions · {subject === 'mathematics' ? 'Mathematics' : subject === 'reading' ? 'Reading Comprehension' : 'General Ability'} · Year {yearLevel}
                </div>
                <button onClick={handleDownloadPDF} style={{
                  background: '#4338CA', color: '#fff', padding: '16px 36px',
                  borderRadius: 100, fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(67,56,202,0.3)', fontFamily: 'Inter, sans-serif',
                }}>
                  📥 Download / Print PDF
                </button>
              </div>

              <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(67,56,202,0.08)', textAlign: 'left', boxShadow: '0 2px 8px rgba(67,56,202,0.05)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 10, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>📋 Your PDF includes:</div>
                <div style={{ fontSize: 14, color: '#64748B', lineHeight: 1.9, fontFamily: 'Inter, sans-serif' }}>
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
                background: '#fff', color: '#4338CA', border: '1.5px solid rgba(67,56,202,0.2)', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
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