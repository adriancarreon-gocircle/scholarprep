import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { generateWritingPrompt, assessWriting, generateIdealAnswer } from '../lib/ai';
import { saveWritingResult } from '../lib/progress';

const getBandColor = (pct) => {
  if (pct >= 80) return '#059669';
  if (pct >= 60) return '#4338CA';
  return '#F97316';
};

const TIME_OPTIONS = [
  { mins: 15, label: '15 min', words: '~200 words', desc: 'Short task' },
  { mins: 20, label: '20 min', words: '~280 words', desc: 'Medium task' },
  { mins: 30, label: '30 min', words: '~400 words', desc: 'Standard task' },
  { mins: 40, label: '40 min', words: '~550 words', desc: 'Extended task' },
];

// ── Ideal Answer Dialog ───────────────────────────────────────────────────────
function IdealAnswerDialog({ prompt, type, yearLevel, onClose }) {
  const [timeMins, setTimeMins] = useState(25);
  const [idealAnswer, setIdealAnswer] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [dots, setDots] = useState('');

  React.useEffect(() => {
    if (!generating) return;
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(t);
  }, [generating]);

  const handleGenerate = async () => {
    setGenerating(true); setError(''); setIdealAnswer(null);
    try {
      const result = await generateIdealAnswer(prompt, type, yearLevel, timeMins);
      setIdealAnswer(result);
    } catch (e) {
      setError('Failed to generate ideal answer. Please try again.');
    }
    setGenerating(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: 32, maxWidth: 680, width: '100%', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 800, color: '#0F172A' }}>✨ Ideal Answer</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#94A3B8', lineHeight: 1 }}>✕</button>
        </div>

        {/* Prompt reminder */}
        <div style={{ background: '#F5F7FF', borderRadius: 12, padding: '12px 16px', marginBottom: 24, fontSize: 14, color: '#64748B', lineHeight: 1.6, fontFamily: 'Inter, sans-serif', borderLeft: '3px solid #4338CA' }}>
          <strong style={{ color: '#0F172A' }}>Prompt:</strong> {prompt}
        </div>

        {/* Time selection — only show before generating */}
        {!idealAnswer && !generating && (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontFamily: 'Inter, sans-serif' }}>
              Choose time allocation
            </div>
            <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6, marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>
              The ideal answer will be calibrated to the appropriate length and depth for the selected time limit.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              {TIME_OPTIONS.map(t => (
                <button key={t.mins} onClick={() => setTimeMins(t.mins)} style={{
                  padding: '16px', borderRadius: 14, textAlign: 'left', cursor: 'pointer',
                  border: `2px solid ${timeMins === t.mins ? '#4338CA' : '#E5E7EB'}`,
                  background: timeMins === t.mins ? '#EEF2FF' : '#fff',
                  transition: 'all 0.15s',
                }}>
                  <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 17, fontWeight: 800, color: timeMins === t.mins ? '#4338CA' : '#0F172A', marginBottom: 2 }}>{t.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: timeMins === t.mins ? '#6366F1' : '#64748B', fontFamily: 'Inter, sans-serif', marginBottom: 2 }}>{t.words}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>{t.desc}</div>
                </button>
              ))}
            </div>

            {error && (
              <div style={{ background: '#FFF1F2', border: '1px solid #FDA4AF', borderRadius: 12, padding: '12px 16px', marginBottom: 16, fontSize: 14, color: '#BE123C', fontFamily: 'Inter, sans-serif' }}>
                ⚠️ {error}
              </div>
            )}

            <button onClick={handleGenerate} style={{
              width: '100%', padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 700,
              background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(67,56,202,0.3)',
            }}>
              Generate ideal answer →
            </button>
          </>
        )}

        {/* Generating state */}
        {generating && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '40px 0', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
              Writing ideal answer{dots}
            </div>
            <div style={{ fontSize: 14, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
              Creating a top-scoring {timeMins}-minute {type} response for Year {yearLevel}
            </div>
            <div style={{ width: 36, height: 36, border: '3px solid #EEF2FF', borderTop: '3px solid #4338CA', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Ideal answer result */}
        {idealAnswer && (
          <div>
            {/* Badges */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              <span style={{ background: '#EEF2FF', color: '#4338CA', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
                ✨ Ideal answer
              </span>
              <span style={{ background: '#F5F7FF', color: '#64748B', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                {timeMins} min task · {idealAnswer.wordCount} words
              </span>
              <span style={{ background: '#F5F7FF', color: '#64748B', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif', textTransform: 'capitalize' }}>
                {type} · Year {yearLevel}
              </span>
            </div>

            {/* Title */}
            {idealAnswer.title && (
              <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 14, textAlign: 'center' }}>
                {idealAnswer.title}
              </div>
            )}

            {/* The text */}
            <div style={{ background: '#F8F9FF', borderRadius: 16, padding: 24, marginBottom: 20, border: '1px solid rgba(67,56,202,0.08)', fontSize: 15, color: '#0F172A', lineHeight: 1.9, fontFamily: 'Inter, sans-serif', whiteSpace: 'pre-line' }}>
              {idealAnswer.text}
            </div>

            {/* Key strengths */}
            {idealAnswer.highlights?.length > 0 && (
              <div style={{ background: '#ECFDF5', borderRadius: 14, padding: '16px 20px', marginBottom: 24, border: '1px solid #6EE7B7' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#059669', marginBottom: 12, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  💡 What makes this response excellent
                </div>
                {idealAnswer.highlights.map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: '#065F46', fontFamily: 'Inter, sans-serif', lineHeight: 1.65 }}>
                    <span style={{ fontWeight: 700, flexShrink: 0, color: '#059669' }}>✓</span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setIdealAnswer(null); setError(''); }} style={{
                flex: 1, padding: 12, borderRadius: 100, fontSize: 14, fontWeight: 600,
                background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}>
                ← Try different time
              </button>
              <button onClick={onClose} style={{
                flex: 1, padding: 12, borderRadius: 100, fontSize: 14, fontWeight: 700,
                background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main WritingPage ──────────────────────────────────────────────────────────
export default function WritingPage() {
  const { yearLevel, hasAccess } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('setup');
  const [type, setType] = useState('narrative');
  const [prompt, setPrompt] = useState(null);
  const [response, setResponse] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timerOn, setTimerOn] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [showIdealDialog, setShowIdealDialog] = useState(false);
  const timerRef = useRef(null);
  const fileRef = useRef(null);

  const handleGetPrompt = async () => {
    setLoading(true); setError('');
    try {
      const p = await generateWritingPrompt(type, yearLevel);
      setPrompt(p); setPhase('writing'); setResponse('');
    } catch (e) {
      setError('Failed to generate prompt. Please try again.');
    }
    setLoading(false);
  };

  const startTimer = () => {
    if (timerOn) return;
    setTimerOn(true);
    setTimeLeft(25 * 60);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleSubmit = async () => {
    if (!response.trim() || response.trim().length < 20) {
      setError('Please write at least a few sentences before submitting.');
      return;
    }
    setPhase('assessing'); setError('');
    try {
      const result = await assessWriting(response, prompt.prompt, type, yearLevel);
      setFeedback(result);
      await saveWritingResult(yearLevel, type, result.totalScore, result.maxTotal, result);
      setPhase('feedback');
    } catch (e) {
      setError('Failed to assess writing. Please try again.');
      setPhase('writing');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setResponse(`[Handwritten response uploaded: ${file.name}]\n\n[Content will be assessed from the uploaded image.]`);
  };

  const handleReset = () => {
    setPhase('setup'); setPrompt(null); setFeedback(null);
    setResponse(''); setShowIdealDialog(false); setTimerOn(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const pct = feedback ? Math.round((feedback.totalScore / feedback.maxTotal) * 100) : 0;
  const wordCount = response.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div style={{ minHeight: '100vh', background: '#F5F7FF' }}>

      {/* Ideal answer dialog */}
      {showIdealDialog && prompt && (
        <IdealAnswerDialog
          prompt={prompt.prompt}
          type={type}
          yearLevel={yearLevel}
          onClose={() => setShowIdealDialog(false)}
        />
      )}

      {/* Page header */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(67,56,202,0.08)', padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>✏️</div>
        <div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 800, color: '#0F172A', letterSpacing: -0.3 }}>Writing Practice</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>Assessed · Year {yearLevel} · Narrative & Persuasive</div>
        </div>
      </div>

      <div style={{ padding: 32, maxWidth: 760, margin: '0 auto' }}>

        {/* Trial expired upgrade wall */}
        {!hasAccess && (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <div style={{ background: '#fff', borderRadius: 24, padding: 40, border: '1px solid rgba(67,56,202,0.1)', boxShadow: '0 4px 24px rgba(67,56,202,0.08)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
              <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>Your free trial has ended</div>
              <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.7, marginBottom: 28, fontFamily: 'Inter, sans-serif' }}>
                Subscribe to keep practising with unlimited writing tasks, detailed feedback and your Progress Report Dashboard — all for just $9.99/month.
              </p>
              <button onClick={() => navigate('/subscribe')} style={{ width: '100%', padding: '15px', borderRadius: 100, fontSize: 16, fontWeight: 700, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(67,56,202,0.3)', marginBottom: 12 }}>
                Subscribe for $9.99/month →
              </button>
              <button onClick={() => navigate('/app/progress')} style={{ width: '100%', padding: '13px', borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                View my Progress Dashboard
              </button>
              <div style={{ marginTop: 16, fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Cancel anytime · No lock-in contracts</div>
            </div>
          </div>
        )}

        {hasAccess && error && (
          <div style={{ background: '#FFF1F2', border: '1px solid #FDA4AF', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#BE123C', fontFamily: 'Inter, sans-serif' }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── SETUP ── */}
        {hasAccess && phase === 'setup' && (
          <div>
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 2px 8px rgba(67,56,202,0.05)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>Writing type</div>
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  { k: 'narrative', l: 'Narrative', icon: '📖', desc: 'Write a story using your imagination' },
                  { k: 'persuasive', l: 'Persuasive', icon: '🗣️', desc: 'Argue a point of view convincingly' }
                ].map(t => (
                  <button key={t.k} onClick={() => setType(t.k)} style={{
                    flex: 1, padding: 20, borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                    background: type === t.k ? '#4338CA' : '#F8F9FF',
                    border: type === t.k ? 'none' : '1.5px solid rgba(67,56,202,0.1)',
                    transition: 'all 0.15s',
                    boxShadow: type === t.k ? '0 4px 16px rgba(67,56,202,0.3)' : 'none',
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{t.icon}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: type === t.k ? '#fff' : '#0F172A', marginBottom: 4, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{t.l}</div>
                    <div style={{ fontSize: 13, color: type === t.k ? 'rgba(255,255,255,0.65)' : '#64748B', fontFamily: 'Inter, sans-serif' }}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: '#EEF2FF', borderRadius: 14, padding: 18, marginBottom: 24, border: '1px solid rgba(67,56,202,0.1)' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#4338CA', marginBottom: 6, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>📝 How it works</div>
              <div style={{ fontSize: 14, color: '#4338CA', lineHeight: 1.7, fontFamily: 'Inter, sans-serif', opacity: 0.85 }}>
                1. Get a fresh writing prompt (similar to real ACER/Edutest exams)<br />
                2. Type your response or upload a photo of handwritten work<br />
                3. Get detailed feedback with scores across 5 criteria<br />
                4. View an ideal answer to see what a top-scoring response looks like
              </div>
            </div>

            <button onClick={handleGetPrompt} disabled={loading} style={{
              width: '100%', padding: 16, borderRadius: 100, fontSize: 16, fontWeight: 700,
              background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer',
              opacity: loading ? 0.7 : 1, fontFamily: 'Inter, sans-serif',
              boxShadow: '0 4px 20px rgba(67,56,202,0.3)',
            }}>
              {loading ? 'Getting your prompt...' : 'Get writing prompt →'}
            </button>
          </div>
        )}

        {/* ── WRITING ── */}
        {hasAccess && phase === 'writing' && prompt && (
          <div>
            {/* Prompt card */}
            <div style={{ background: '#3730A3', borderRadius: 16, padding: 24, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ background: type === 'narrative' ? '#F97316' : '#7C3AED', color: '#fff', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>{type}</span>
                  <span style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.65)', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Year {yearLevel}</span>
                </div>
                {timerOn && (
                  <div style={{ background: timeLeft < 300 ? '#FFF1F2' : '#EEF2FF', color: timeLeft < 300 ? '#BE123C' : '#4338CA', padding: '5px 12px', borderRadius: 100, fontSize: 14, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
                    ⏱ {formatTime(timeLeft)}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 16, fontWeight: 500, color: '#fff', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>{prompt.prompt}</div>
              {!timerOn && (
                <button onClick={startTimer} style={{ marginTop: 14, background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)', border: 'none', padding: '6px 16px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  ⏱ Start 25-minute timer
                </button>
              )}
            </div>

            {/* Criteria + ideal answer button row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 13, color: '#4338CA', fontFamily: 'Inter, sans-serif', background: '#EEF2FF', borderRadius: 10, padding: '8px 14px', flex: 1 }}>
                <strong>Assessed on:</strong> Ideas · Structure · Language · Sentences · Punctuation
              </div>
              <button onClick={() => setShowIdealDialog(true)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600,
                background: '#fff', color: '#4338CA', border: '1.5px solid rgba(67,56,202,0.2)',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
              }}>
                ✨ View ideal answer
              </button>
            </div>

            <textarea
              value={response}
              onChange={e => setResponse(e.target.value)}
              placeholder="Start writing your response here..."
              style={{
                width: '100%', minHeight: 280, padding: 20,
                border: '1.5px solid rgba(67,56,202,0.12)', borderRadius: 16,
                fontSize: 16, lineHeight: 1.8, fontFamily: 'Inter, sans-serif',
                color: '#0F172A', resize: 'vertical', outline: 'none',
                background: '#fff', marginBottom: 12,
              }}
              onFocus={e => e.target.style.borderColor = '#4338CA'}
              onBlur={e => e.target.style.borderColor = 'rgba(67,56,202,0.12)'}
            />

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>{wordCount} words</span>
              <span style={{ fontSize: 13, color: '#94A3B8' }}>·</span>
              <button onClick={() => fileRef.current?.click()} style={{ fontSize: 13, fontWeight: 600, color: '#64748B', background: 'none', border: '1px dashed rgba(67,56,202,0.2)', padding: '5px 14px', borderRadius: 100, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                📷 Upload handwritten photo
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setPhase('setup'); setPrompt(null); setTimerOn(false); if (timerRef.current) clearInterval(timerRef.current); }} style={{
                padding: '12px 24px', borderRadius: 100, fontSize: 14, fontWeight: 600,
                background: '#fff', color: '#64748B', border: '1.5px solid #E5E7EB', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}>
                ← New prompt
              </button>
              <button onClick={handleSubmit} style={{
                flex: 1, padding: '12px 24px', borderRadius: 100, fontSize: 15, fontWeight: 700,
                background: '#F97316', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
              }}>
                Submit for feedback →
              </button>
            </div>
          </div>
        )}

        {/* ── ASSESSING ── */}
        {hasAccess && phase === 'assessing' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360, gap: 20, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>✏️</div>
            <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 800, color: '#0F172A' }}>Assessing your writing...</div>
            <div style={{ fontSize: 15, color: '#64748B', maxWidth: 340, lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
              Reading your response carefully and preparing detailed feedback. This takes about 15 seconds.
            </div>
            <div style={{ width: 36, height: 36, border: '3px solid #EEF2FF', borderTop: '3px solid #4338CA', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── FEEDBACK ── */}
        {hasAccess && phase === 'feedback' && feedback && (
          <div>
            {/* Score hero */}
            <div style={{ background: 'linear-gradient(135deg, #3730A3, #4338CA)', borderRadius: 20, padding: 32, marginBottom: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 60, fontWeight: 900, color: '#fff', lineHeight: 1, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {feedback.totalScore}<span style={{ fontSize: 28, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>/{feedback.maxTotal}</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginTop: 8, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {pct >= 80 ? '🌟 Excellent writing!' : pct >= 60 ? '👍 Good work!' : '💪 Keep practising!'}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>{pct}% · {type} · Year {yearLevel}</div>
            </div>

            {/* Ideal answer CTA — prominent */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', marginBottom: 16, border: '1.5px solid rgba(67,56,202,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', boxShadow: '0 2px 12px rgba(67,56,202,0.06)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>✨ See an ideal answer</div>
                <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
                  Generate a top-scoring model response for this prompt — choose your time limit to calibrate the length — so you can see exactly what to aim for.
                </div>
              </div>
              <button onClick={() => setShowIdealDialog(true)} style={{
                padding: '11px 22px', borderRadius: 100, fontSize: 14, fontWeight: 700,
                background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(67,56,202,0.3)',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                View ideal answer →
              </button>
            </div>

            {/* Overall feedback */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(67,56,202,0.08)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 10, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>📝 Overall feedback</div>
              <div style={{ fontSize: 15, color: '#334155', lineHeight: 1.8, fontFamily: 'Inter, sans-serif' }}>{feedback.overallFeedback}</div>
            </div>

            {/* Criteria scores */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(67,56,202,0.08)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 16, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>📊 Scores by criteria</div>
              {feedback.criteria.map((c, i) => {
                const cpct = Math.round((c.score / c.maxScore) * 100);
                return (
                  <div key={i} style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', fontFamily: 'Inter, sans-serif' }}>{c.name}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: getBandColor(cpct), fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{c.score}/{c.maxScore}</div>
                    </div>
                    <div style={{ height: 6, background: '#E5E7EB', borderRadius: 3, marginBottom: 8, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${cpct}%`, background: getBandColor(cpct), borderRadius: 3, transition: 'width 0.5s' }}></div>
                    </div>
                    <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.65, fontFamily: 'Inter, sans-serif' }}>{c.feedback}</div>
                  </div>
                );
              })}
            </div>

            {/* Improvements */}
            <div style={{ background: '#ECFDF5', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid #6EE7B7' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#059669', marginBottom: 12, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>💡 How to improve</div>
              {feedback.improvements.map((imp, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 14, color: '#065F46', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
                  <span style={{ flexShrink: 0, fontWeight: 700 }}>{i + 1}.</span>
                  <span>{imp}</span>
                </div>
              ))}
            </div>

            <button onClick={handleReset} style={{
              width: '100%', padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 700,
              background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(67,56,202,0.3)',
            }}>
              Try another writing task →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}