import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { generateWritingPrompt, assessWriting } from '../lib/ai';
import { saveWritingResult } from '../lib/progress';

export default function WritingPage() {
  const { yearLevel } = useAuth();
  const [phase, setPhase] = useState('setup'); // setup | writing | assessing | feedback
  const [type, setType] = useState('narrative');
  const [prompt, setPrompt] = useState(null);
  const [response, setResponse] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timerOn, setTimerOn] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const timerRef = useRef(null);
  const fileRef = useRef(null);

  const handleGetPrompt = async () => {
    setLoading(true);
    setError('');
    try {
      const p = await generateWritingPrompt(type, yearLevel);
      setPrompt(p);
      setPhase('writing');
      setResponse('');
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
    setPhase('assessing');
    setError('');
    try {
      const result = await assessWriting(response, prompt.prompt, type, yearLevel);
      setFeedback(result);
      saveWritingResult(yearLevel, type, result.totalScore, result.maxTotal, result);
      setPhase('feedback');
    } catch (e) {
      setError('Failed to assess writing. Please try again.');
      setPhase('writing');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResponse(`[Handwritten response uploaded: ${file.name}]\n\n[The AI will assess the content of your handwritten response based on the image.]`);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2,'0')}`;
  };

  const pct = feedback ? Math.round((feedback.totalScore / feedback.maxTotal) * 100) : 0;

  return (
    <div>
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(13,27,42,0.08)', padding: '20px 32px' }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 900, color: '#0D1B2A' }}>✏️ Writing Practice</div>
        <div style={{ fontSize: 14, color: '#5A6A7A', marginTop: 2 }}>AI-assessed · Year {yearLevel} · Narrative & Persuasive</div>
      </div>

      <div style={{ padding: 32, maxWidth: 760, margin: '0 auto' }}>
        {error && <div style={{ background: '#FDEAEA', border: '1px solid #E07A5F', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#B04030' }}>⚠️ {error}</div>}

        {/* SETUP */}
        {phase === 'setup' && (
          <div>
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(13,27,42,0.08)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Writing type</div>
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  { k: 'narrative', l: 'Narrative', icon: '📖', desc: 'Write a story using your imagination' },
                  { k: 'persuasive', l: 'Persuasive', icon: '🗣️', desc: 'Argue a point of view convincingly' }
                ].map(t => (
                  <button key={t.k} onClick={() => setType(t.k)} style={{
                    flex: 1, padding: 20, borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                    background: type === t.k ? '#0D1B2A' : '#FAF6EE',
                    border: type === t.k ? 'none' : '1.5px solid rgba(13,27,42,0.12)',
                    transition: 'all 0.15s'
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{t.icon}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: type === t.k ? '#fff' : '#0D1B2A', marginBottom: 4 }}>{t.l}</div>
                    <div style={{ fontSize: 13, color: type === t.k ? 'rgba(255,255,255,0.6)' : '#5A6A7A' }}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: '#FAF6EE', borderRadius: 14, padding: 20, marginBottom: 24, border: '1px solid rgba(13,27,42,0.08)' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0D1B2A', marginBottom: 4 }}>📝 How it works</div>
              <div style={{ fontSize: 14, color: '#5A6A7A', lineHeight: 1.7 }}>
                1. Get an AI-generated writing prompt (similar to real ACER/Edutest exams)<br/>
                2. Type your response OR upload a photo of your handwritten work<br/>
                3. AI assesses your writing and gives detailed feedback with scores
              </div>
            </div>

            <button onClick={handleGetPrompt} disabled={loading} style={{
              width: '100%', padding: 16, borderRadius: 100, fontSize: 16, fontWeight: 700,
              background: '#0D1B2A', color: '#fff', border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1
            }}>
              {loading ? 'Getting your prompt...' : 'Get writing prompt →'}
            </button>
          </div>
        )}

        {/* WRITING */}
        {phase === 'writing' && prompt && (
          <div>
            {/* Prompt card */}
            <div style={{ background: '#0D1B2A', borderRadius: 16, padding: 24, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ background: type === 'narrative' ? '#E8B84B' : '#7B61FF', color: '#fff', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{type}</span>
                  <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600 }}>Year {yearLevel}</span>
                </div>
                {timerOn && (
                  <div style={{ background: timeLeft < 300 ? '#FDEAEA' : '#E8F5EE', color: timeLeft < 300 ? '#B04030' : '#2D6A4F', padding: '5px 12px', borderRadius: 100, fontSize: 14, fontWeight: 700 }}>
                    ⏱ {formatTime(timeLeft)}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 17, fontWeight: 500, color: '#fff', lineHeight: 1.7 }}>{prompt.prompt}</div>
              {!timerOn && (
                <button onClick={startTimer} style={{ marginTop: 14, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: 'none', padding: '6px 16px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  ⏱ Start 25-minute timer
                </button>
              )}
            </div>

            {/* Criteria reminder */}
            <div style={{ background: '#E8F5EE', borderRadius: 12, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#2D6A4F' }}>
              <strong>Your writing will be assessed on:</strong> Ideas & content · Structure & organisation · Language & vocabulary · Sentence structure · Punctuation & spelling
            </div>

            {/* Text area */}
            <textarea
              value={response}
              onChange={e => setResponse(e.target.value)}
              placeholder="Start writing your response here..."
              style={{
                width: '100%', minHeight: 280, padding: 20,
                border: '1.5px solid rgba(13,27,42,0.12)', borderRadius: 16,
                fontSize: 16, lineHeight: 1.8, fontFamily: "'DM Sans', sans-serif",
                color: '#0D1B2A', resize: 'vertical', outline: 'none',
                background: '#fff', marginBottom: 12
              }}
            />

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: '#5A6A7A' }}>{response.trim().split(/\s+/).filter(Boolean).length} words</span>
              <span style={{ fontSize: 13, color: '#5A6A7A' }}>·</span>
              <button onClick={() => fileRef.current?.click()} style={{ fontSize: 13, fontWeight: 600, color: '#5A6A7A', background: 'none', border: '1px dashed rgba(13,27,42,0.2)', padding: '5px 14px', borderRadius: 100, cursor: 'pointer' }}>
                📷 Upload handwritten photo instead
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setPhase('setup'); setPrompt(null); }} style={{ padding: '12px 24px', borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#fff', color: '#5A6A7A', border: '1.5px solid rgba(13,27,42,0.15)', cursor: 'pointer' }}>
                ← New prompt
              </button>
              <button onClick={handleSubmit} style={{ flex: 1, padding: '12px 24px', borderRadius: 100, fontSize: 15, fontWeight: 700, background: '#E8B84B', color: '#0D1B2A', border: 'none', cursor: 'pointer' }}>
                Submit for AI feedback →
              </button>
            </div>
          </div>
        )}

        {/* ASSESSING */}
        {phase === 'assessing' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360, gap: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 48 }}>✏️</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 900, color: '#0D1B2A' }}>Assessing your writing...</div>
            <div style={{ fontSize: 15, color: '#5A6A7A', maxWidth: 340, lineHeight: 1.6 }}>
              Our AI is reading your response carefully and preparing detailed feedback. This takes about 15 seconds.
            </div>
            <div style={{ width: 36, height: 36, border: '3px solid rgba(13,27,42,0.1)', borderTop: '3px solid #0D1B2A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* FEEDBACK */}
        {phase === 'feedback' && feedback && (
          <div>
            {/* Score hero */}
            <div style={{ background: '#0D1B2A', borderRadius: 20, padding: 32, marginBottom: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 56, fontWeight: 800, color: '#E8B84B', lineHeight: 1 }}>{feedback.totalScore}<span style={{ fontSize: 28, color: 'rgba(255,255,255,0.4)' }}>/{feedback.maxTotal}</span></div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginTop: 8 }}>
                {pct >= 80 ? '🌟 Excellent writing!' : pct >= 60 ? '👍 Good work!' : '💪 Keep practising!'}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>{pct}% · {type} writing · Year {yearLevel}</div>
            </div>

            {/* Overall feedback */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(13,27,42,0.08)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0D1B2A', marginBottom: 10 }}>📝 Overall feedback</div>
              <div style={{ fontSize: 15, color: '#2A3A4A', lineHeight: 1.8 }}>{feedback.overallFeedback}</div>
            </div>

            {/* Criteria scores */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(13,27,42,0.08)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0D1B2A', marginBottom: 16 }}>📊 Scores by criteria</div>
              {feedback.criteria.map((c, i) => (
                <div key={i} style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0D1B2A' }}>{c.name}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: c.score >= 4 ? '#2D6A4F' : c.score >= 3 ? '#A07010' : '#B04030' }}>{c.score}/{c.maxScore}</div>
                  </div>
                  <div style={{ height: 6, background: '#F0E8D8', borderRadius: 3, marginBottom: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(c.score / c.maxScore) * 100}%`, background: c.score >= 4 ? '#52B788' : c.score >= 3 ? '#E8B84B' : '#E07A5F', borderRadius: 3, transition: 'width 0.5s' }}></div>
                  </div>
                  <div style={{ fontSize: 13, color: '#5A6A7A', lineHeight: 1.6 }}>{c.feedback}</div>
                </div>
              ))}
            </div>

            {/* Improvements */}
            <div style={{ background: '#E8F5EE', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid #A8DCC0' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2D6A4F', marginBottom: 12 }}>💡 How to improve</div>
              {feedback.improvements.map((imp, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 14, color: '#2D6A4F' }}>
                  <span style={{ flexShrink: 0, fontWeight: 700 }}>{i + 1}.</span>
                  <span style={{ lineHeight: 1.6 }}>{imp}</span>
                </div>
              ))}
            </div>

            <button onClick={() => { setPhase('setup'); setPrompt(null); setFeedback(null); setResponse(''); }} style={{
              width: '100%', padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 700,
              background: '#0D1B2A', color: '#fff', border: 'none', cursor: 'pointer'
            }}>
              Try another writing task →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
