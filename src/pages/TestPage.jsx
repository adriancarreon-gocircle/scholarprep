import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { generateMathsQuestions, generateReadingQuestions, generateGeneralAbilityQuestions } from '../lib/ai';
import { saveTestResult } from '../lib/progress';

const SUBJECT_CONFIG = {
  mathematics: { label: 'Mathematics', icon: '🔢', color: '#4338CA', lightBg: '#EEF2FF', generate: generateMathsQuestions },
  reading: { label: 'Reading Comprehension', icon: '📖', color: '#059669', lightBg: '#ECFDF5', generate: generateReadingQuestions },
  general: { label: 'General Ability', icon: '🧩', color: '#F97316', lightBg: '#FFF7ED', generate: generateGeneralAbilityQuestions }
};

// ── Confirm Exit Dialog ───────────────────────────────────────────────────────
function ExitDialog({ onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🚪</div>
        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>Exit test?</div>
        <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, marginBottom: 28, fontFamily: 'Inter, sans-serif' }}>
          Your progress will be lost and this test won't be saved. Are you sure you want to exit?
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '12px', borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Keep going
          </button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '12px', borderRadius: 100, fontSize: 14, fontWeight: 700, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Exit test
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Pause Overlay ─────────────────────────────────────────────────────────────
function PauseOverlay({ onResume, color }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 40, maxWidth: 380, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏸</div>
        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>Test paused</div>
        <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, marginBottom: 28, fontFamily: 'Inter, sans-serif' }}>
          Your timer is paused. Take a moment and resume when you're ready.
        </p>
        <button onClick={onResume} style={{ width: '100%', padding: '14px', borderRadius: 100, fontSize: 15, fontWeight: 700, background: color, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: `0 4px 16px ${color}40` }}>
          Resume test →
        </button>
      </div>
    </div>
  );
}

// ── Setup Screen ──────────────────────────────────────────────────────────────
function SetupScreen({ subject, yearLevel, onStart }) {
  const [qCount, setQCount] = useState(10);
  const [timer, setTimer] = useState(0);
  const [reviewMode, setReviewMode] = useState('each');
  const cfg = SUBJECT_CONFIG[subject];

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 32 }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: cfg.lightBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 16 }}>{cfg.icon}</div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 8, letterSpacing: -0.5 }}>{cfg.label}</h1>
        <div style={{ fontSize: 15, color: '#64748B', fontFamily: 'Inter, DM Sans, sans-serif' }}>Fresh questions · Year {yearLevel} level</div>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 14, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 2px 8px rgba(67,56,202,0.05)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>Number of questions</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[5, 10, 15, 20, 30].map(n => (
            <button key={n} onClick={() => setQCount(n)} style={{
              padding: '9px 22px', borderRadius: 100, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              background: qCount === n ? cfg.color : '#F8F9FF',
              color: qCount === n ? '#fff' : '#64748B',
              border: qCount === n ? 'none' : '1.5px solid rgba(67,56,202,0.1)',
              transition: 'all 0.15s',
              boxShadow: qCount === n ? `0 4px 12px ${cfg.color}40` : 'none',
              fontFamily: 'Inter, sans-serif',
            }}>{n}</button>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 14, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 2px 8px rgba(67,56,202,0.05)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>Time limit</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[{ l: 'No timer', v: 0 }, { l: '10 min', v: 600 }, { l: '20 min', v: 1200 }, { l: '30 min', v: 1800 }, { l: '45 min', v: 2700 }].map(t => (
            <button key={t.v} onClick={() => setTimer(t.v)} style={{
              padding: '9px 20px', borderRadius: 100, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              background: timer === t.v ? '#0F172A' : '#F8F9FF',
              color: timer === t.v ? '#fff' : '#64748B',
              border: timer === t.v ? 'none' : '1.5px solid rgba(67,56,202,0.1)',
              transition: 'all 0.15s',
              fontFamily: 'Inter, sans-serif',
            }}>{t.l}</button>
          ))}
        </div>
      </div>

      {/* Answer review mode */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 2px 8px rgba(67,56,202,0.05)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>Answer review</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { key: 'each', icon: '💡', title: 'Review as I go', desc: 'See the correct answer and explanation after each question.' },
            { key: 'end', icon: '🏆', title: 'Exam mode', desc: 'See all answers and explanations at the end only.' },
          ].map(m => (
            <button key={m.key} onClick={() => setReviewMode(m.key)} style={{
              padding: '14px 16px', borderRadius: 12,
              border: `2px solid ${reviewMode === m.key ? cfg.color : '#E5E7EB'}`,
              background: reviewMode === m.key ? cfg.lightBg : '#fff',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
            }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{m.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: reviewMode === m.key ? cfg.color : '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 4 }}>{m.title}</div>
              <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <button onClick={() => onStart(qCount, timer, reviewMode)} style={{
        width: '100%', padding: 16, borderRadius: 100, fontSize: 16, fontWeight: 700,
        background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(67,56,202,0.3)', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
      }}
        onMouseEnter={e => e.target.style.background = '#3730A3'}
        onMouseLeave={e => e.target.style.background = '#4338CA'}
      >
        Generate test →
      </button>
      <div style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Fresh questions generated every time — never the same test twice</div>
    </div>
  );
}

// ── Loading Screen ────────────────────────────────────────────────────────────
function LoadingScreen({ subject }) {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 20, padding: 32 }}>
      <div style={{ width: 72, height: 72, borderRadius: 20, background: SUBJECT_CONFIG[subject]?.lightBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>{SUBJECT_CONFIG[subject]?.icon}</div>
      <div style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", fontSize: 22, fontWeight: 800, color: '#0F172A' }}>Generating your test{dots}</div>
      <div style={{ fontSize: 15, color: '#64748B', maxWidth: 320, textAlign: 'center', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>Creating fresh, unique questions just for you. This takes about 10–20 seconds.</div>
      <div style={{ width: 40, height: 40, border: '3px solid #EEF2FF', borderTop: '3px solid #4338CA', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}></div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Quiz Screen ───────────────────────────────────────────────────────────────
function QuizScreen({ subject, questions, passage, timerSecs, yearLevel, reviewMode, onFinish, onExit }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState({});
  const [revealed, setRevealed] = useState({});
  const [timeLeft, setTimeLeft] = useState(timerSecs);
  const [paused, setPaused] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [finished, setFinished] = useState(false);
  const cfg = SUBJECT_CONFIG[subject];
  const q = questions[current];

  useEffect(() => {
    if (timerSecs === 0 || finished || paused) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); handleFinish(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [timerSecs, finished, paused]);

  const handleFinish = useCallback(async () => {
    setFinished(true);
    const correct = questions.filter((q, i) => selected[i] === q.correct).length;
    const result = await saveTestResult(subject, yearLevel, correct, questions.length, questions);
    onFinish(result, selected);
  }, [questions, selected, subject, yearLevel, onFinish]);

  const handleSelect = (letter) => {
    if (revealed[current]) return;
    setSelected(s => ({ ...s, [current]: letter }));
    if (reviewMode === 'each') setRevealed(r => ({ ...r, [current]: true }));
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((current + 1) / questions.length) * 100;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 32 }}>
      {showExitDialog && <ExitDialog onConfirm={onExit} onCancel={() => setShowExitDialog(false)} />}
      {paused && <PauseOverlay onResume={() => setPaused(false)} color={cfg.color} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
          Question {current + 1} of {questions.length} · {cfg.label}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {timerSecs > 0 && (
            <>
              <div style={{
                background: timeLeft < 60 ? '#FFF1F2' : '#EEF2FF',
                color: timeLeft < 60 ? '#BE123C' : '#4338CA',
                padding: '6px 14px', borderRadius: 100, fontSize: 14, fontWeight: 700,
                fontFamily: 'Inter, sans-serif', border: `1px solid ${timeLeft < 60 ? '#FDA4AF' : '#C7D2FE'}`,
              }}>
                ⏱ {formatTime(timeLeft)}
              </div>
              <button onClick={() => setPaused(true)} style={{
                padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 600,
                background: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 4,
              }}>⏸ Pause</button>
            </>
          )}
          <button onClick={() => setShowExitDialog(true)} style={{
            padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 600,
            background: '#FFF1F2', color: '#EF4444', border: '1px solid #FCA5A5',
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}>✕ Exit</button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 5, background: '#EEF2FF', borderRadius: 3, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: cfg.color, borderRadius: 3, transition: 'width 0.3s' }}></div>
      </div>

      {/* Passage */}
      {passage && current === 0 && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 20, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 2px 8px rgba(67,56,202,0.05)' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 12, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{passage.title}</div>
          <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.85, whiteSpace: 'pre-line', fontFamily: 'Inter, sans-serif' }}>{passage.text}</div>
        </div>
      )}
      {passage && current > 0 && (
        <details style={{ marginBottom: 16 }}>
          <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#4338CA', padding: '8px 0', fontFamily: 'Inter, sans-serif' }}>📖 Show passage: {passage.title}</summary>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, marginTop: 8, border: '1px solid rgba(67,56,202,0.08)', fontSize: 14, color: '#334155', lineHeight: 1.85, whiteSpace: 'pre-line', fontFamily: 'Inter, sans-serif' }}>{passage.text}</div>
        </details>
      )}

      {/* Question card */}
      <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 16, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 4px 16px rgba(67,56,202,0.06)' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', lineHeight: 1.7, marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>{q?.question}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q && Object.entries(q.options).map(([letter, text]) => {
            const isSelected = selected[current] === letter;
            const isRevealed = revealed[current];
            const isCorrect = q.correct === letter;
            let bg = '#F8F9FF', border = '1.5px solid rgba(67,56,202,0.1)', color = '#334155';
            if (isRevealed) {
              if (isCorrect) { bg = '#ECFDF5'; border = '1.5px solid #6EE7B7'; color = '#059669'; }
              else if (isSelected) { bg = '#FFF1F2'; border = '1.5px solid #FDA4AF'; color = '#BE123C'; }
            } else if (isSelected) {
              bg = '#EEF2FF'; border = `1.5px solid ${cfg.color}`; color = cfg.color;
            }
            return (
              <button key={letter} onClick={() => handleSelect(letter)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderRadius: 12, cursor: isRevealed ? 'default' : 'pointer',
                background: bg, border, color, textAlign: 'left', transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
              }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: isRevealed && isCorrect ? '#059669' : isRevealed && isSelected ? '#BE123C' : isSelected ? cfg.color : 'rgba(67,56,202,0.08)', color: (isRevealed && isCorrect) || (isRevealed && isSelected) || isSelected ? '#fff' : '#64748B' }}>{letter}</div>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{text}</span>
                {isRevealed && isCorrect && <span style={{ marginLeft: 'auto', fontSize: 16 }}>✓</span>}
                {isRevealed && isSelected && !isCorrect && <span style={{ marginLeft: 'auto', fontSize: 16 }}>✗</span>}
              </button>
            );
          })}
        </div>
        {revealed[current] && (
          <div style={{ marginTop: 16, padding: '14px 16px', background: '#EEF2FF', borderRadius: 12, fontSize: 13, color: '#4338CA', lineHeight: 1.7, fontFamily: 'Inter, sans-serif', border: '1px solid rgba(67,56,202,0.12)' }}>
            <strong>💡 Explanation:</strong> {q?.explanation}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} style={{ padding: '10px 24px', borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#fff', color: '#4338CA', border: '1.5px solid rgba(67,56,202,0.2)', cursor: current === 0 ? 'default' : 'pointer', opacity: current === 0 ? 0.4 : 1, fontFamily: 'Inter, sans-serif' }}>← Previous</button>
        <div style={{ display: 'flex', gap: 5 }}>
          {questions.map((_, i) => (
            <div key={i} onClick={() => setCurrent(i)} style={{ width: 10, height: 10, borderRadius: '50%', cursor: 'pointer', background: i === current ? '#4338CA' : selected[i] ? (selected[i] === questions[i].correct ? '#059669' : '#F43F5E') : '#E2E8F0', transition: 'background 0.2s' }}></div>
          ))}
        </div>
        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent(c => c + 1)} style={{ padding: '10px 24px', borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Next →</button>
        ) : (
          <button onClick={handleFinish} style={{ padding: '10px 24px', borderRadius: 100, fontSize: 14, fontWeight: 700, background: '#F97316', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}>Finish test ✓</button>
        )}
      </div>
    </div>
  );
}

// ── Results Screen ────────────────────────────────────────────────────────────
function ResultsScreen({ subject, questions, selected, result, onRetry }) {
  const cfg = SUBJECT_CONFIG[subject];
  const pct = result.score;
  const msg = pct >= 80 ? 'Excellent work! 🌟' : pct >= 60 ? 'Good effort! 👍' : 'Keep practising! 💪';

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 32 }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: 36, textAlign: 'center', marginBottom: 24, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 4px 20px rgba(67,56,202,0.08)' }}>
        <div style={{ fontSize: 72, fontWeight: 800, color: pct >= 80 ? '#059669' : pct >= 60 ? '#4338CA' : '#F97316', lineHeight: 1, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{pct}%</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginTop: 10, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{msg}</div>
        <div style={{ fontSize: 14, color: '#64748B', marginTop: 6, fontFamily: 'Inter, sans-serif' }}>{result.correct} correct out of {result.total} questions · {cfg.label}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 20 }}>
          <div style={{ fontSize: 14, color: '#059669', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>✓ {result.correct} correct</div>
          <div style={{ fontSize: 14, color: '#F43F5E', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>✗ {result.total - result.correct} incorrect</div>
        </div>
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>Question review</div>
      {questions.map((q, i) => {
        const userAnswer = selected[i];
        const correct = userAnswer === q.correct;
        return (
          <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', marginBottom: 10, border: '1px solid rgba(67,56,202,0.06)', display: 'flex', gap: 14, boxShadow: '0 1px 4px rgba(67,56,202,0.04)' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: correct ? '#ECFDF5' : '#FFF1F2', color: correct ? '#059669' : '#BE123C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>{correct ? '✓' : '✗'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#0F172A', marginBottom: 6, lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}><strong>Q{i + 1}.</strong> {q.question}</div>
              {!correct && <div style={{ fontSize: 13, color: '#BE123C', marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>You answered: <strong>{userAnswer ? `${userAnswer}. ${q.options[userAnswer]}` : 'Not answered'}</strong></div>}
              <div style={{ fontSize: 13, color: '#059669', marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>Correct: <strong>{q.correct}. {q.options[q.correct]}</strong></div>
              {!correct && <div style={{ fontSize: 13, color: '#64748B', background: '#EEF2FF', padding: '10px 14px', borderRadius: 10, lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>💡 {q.explanation}</div>}
            </div>
          </div>
        );
      })}

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button onClick={onRetry} style={{ flex: 1, padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 700, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(67,56,202,0.3)' }}>
          Try another test →
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function TestPage({ subject }) {
  const { yearLevel } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('setup');
  const [questions, setQuestions] = useState([]);
  const [passage, setPassage] = useState(null);
  const [timerSecs, setTimerSecs] = useState(0);
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState({});
  const [error, setError] = useState('');
  const [reviewMode, setReviewMode] = useState('each');
  const cfg = SUBJECT_CONFIG[subject];

  const handleStart = async (count, timer, mode) => {
    setPhase('loading'); setError(''); setTimerSecs(timer); setReviewMode(mode);
    try {
      const data = await cfg.generate(yearLevel, count);
      if (subject === 'reading') { setPassage(data.passage); setQuestions(data.questions); }
      else setQuestions(data);
      setPhase('quiz');
    } catch (e) {
      setError('Failed to generate questions. Please check your connection and try again.');
      setPhase('setup');
    }
  };

  const handleFinish = (result, sel) => { setResult(result); setSelected(sel); setPhase('results'); };
  const handleRetry = () => { setPhase('setup'); setQuestions([]); setPassage(null); setResult(null); setSelected({}); };
  const handleExit = () => { setPhase('setup'); setQuestions([]); setPassage(null); setResult(null); setSelected({}); };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F7FF' }}>
      {/* Page header */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(67,56,202,0.08)', padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: cfg?.lightBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{cfg?.icon}</div>
        <div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", fontSize: 20, fontWeight: 800, color: '#0F172A', letterSpacing: -0.3 }}>{cfg?.label}</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>Fresh questions · Year {yearLevel} · Never the same test twice</div>
        </div>
      </div>

      {error && (
        <div style={{ margin: 24, padding: '14px 18px', background: '#FFF1F2', border: '1px solid #FDA4AF', borderRadius: 14, fontSize: 14, color: '#BE123C', fontFamily: 'Inter, sans-serif' }}>
          ⚠️ {error}
        </div>
      )}

      {phase === 'setup' && <SetupScreen subject={subject} yearLevel={yearLevel} onStart={handleStart} />}
      {phase === 'loading' && <LoadingScreen subject={subject} />}
      {phase === 'quiz' && (
        <QuizScreen
          subject={subject} questions={questions} passage={passage}
          timerSecs={timerSecs} yearLevel={yearLevel} reviewMode={reviewMode}
          onFinish={handleFinish} onExit={handleExit}
        />
      )}
      {phase === 'results' && <ResultsScreen subject={subject} questions={questions} selected={selected} result={result} onRetry={handleRetry} />}
    </div>
  );
}