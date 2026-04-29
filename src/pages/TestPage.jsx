import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { generateMathsQuestions, generateReadingQuestions, generateGeneralAbilityQuestions } from '../lib/ai';
import { saveTestResult } from '../lib/progress';

const SUBJECT_CONFIG = {
  mathematics: { label: 'Mathematics', icon: '🔢', color: '#E8B84B', generate: generateMathsQuestions },
  reading: { label: 'Reading Comprehension', icon: '📖', color: '#52B788', generate: generateReadingQuestions },
  general: { label: 'General Ability', icon: '🧩', color: '#7B61FF', generate: generateGeneralAbilityQuestions }
};

// ── Setup Screen ──────────────────────────────────────────────────────────────
function SetupScreen({ subject, yearLevel, onStart }) {
  const [qCount, setQCount] = useState(10);
  const [timer, setTimer] = useState(0); // 0 = no timer
  const cfg = SUBJECT_CONFIG[subject];

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 32 }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>{cfg.icon}</div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 900, color: '#0D1B2A', marginBottom: 8 }}>{cfg.label}</h1>
        <div style={{ fontSize: 15, color: '#5A6A7A' }}>AI-generated questions · Year {yearLevel} level</div>
      </div>

      {/* Questions */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(13,27,42,0.08)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Number of questions</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[5, 10, 15, 20, 30].map(n => (
            <button key={n} onClick={() => setQCount(n)} style={{
              padding: '8px 20px', borderRadius: 100, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              background: qCount === n ? cfg.color : '#FAF6EE',
              color: qCount === n ? (subject === 'mathematics' ? '#0D1B2A' : '#fff') : '#5A6A7A',
              border: qCount === n ? 'none' : '1px solid rgba(13,27,42,0.12)',
              transition: 'all 0.15s'
            }}>{n}</button>
          ))}
        </div>
      </div>

      {/* Timer */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid rgba(13,27,42,0.08)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Time limit</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[{l:'No timer',v:0},{l:'10 min',v:600},{l:'20 min',v:1200},{l:'30 min',v:1800},{l:'45 min',v:2700}].map(t => (
            <button key={t.v} onClick={() => setTimer(t.v)} style={{
              padding: '8px 20px', borderRadius: 100, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              background: timer === t.v ? '#0D1B2A' : '#FAF6EE',
              color: timer === t.v ? '#fff' : '#5A6A7A',
              border: timer === t.v ? 'none' : '1px solid rgba(13,27,42,0.12)',
              transition: 'all 0.15s'
            }}>{t.l}</button>
          ))}
        </div>
      </div>

      <button onClick={() => onStart(qCount, timer)} style={{
        width: '100%', padding: 16, borderRadius: 100, fontSize: 16, fontWeight: 700,
        background: '#0D1B2A', color: '#fff', border: 'none', cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(13,27,42,0.2)'
      }}>
        Generate test with AI →
      </button>
      <div style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: '#5A6A7A' }}>Fresh questions generated every time — never the same test twice</div>
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 20 }}>
      <div style={{ fontSize: 48 }}>{SUBJECT_CONFIG[subject]?.icon}</div>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 900, color: '#0D1B2A' }}>Generating your test{dots}</div>
      <div style={{ fontSize: 15, color: '#5A6A7A', maxWidth: 320, textAlign: 'center', lineHeight: 1.6 }}>
        Our AI is creating fresh, unique questions just for you. This takes about 10–20 seconds.
      </div>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(13,27,42,0.1)', borderTop: '3px solid #0D1B2A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}></div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Quiz Screen ───────────────────────────────────────────────────────────────
function QuizScreen({ subject, questions, passage, timerSecs, yearLevel, onFinish }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState({});
  const [revealed, setRevealed] = useState({});
  const [timeLeft, setTimeLeft] = useState(timerSecs);
  const [finished, setFinished] = useState(false);
  const cfg = SUBJECT_CONFIG[subject];
  const q = questions[current];

  useEffect(() => {
    if (timerSecs === 0 || finished) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); handleFinish(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [timerSecs, finished]);

  const handleFinish = useCallback(() => {
    setFinished(true);
    const correct = questions.filter((q, i) => selected[i] === q.correct).length;
    const result = saveTestResult(subject, yearLevel, correct, questions.length, questions);
    onFinish(result, selected);
  }, [questions, selected, subject, yearLevel, onFinish]);

  const handleSelect = (letter) => {
    if (revealed[current]) return;
    setSelected(s => ({ ...s, [current]: letter }));
    setRevealed(r => ({ ...r, [current]: true }));
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((current + 1) / questions.length) * 100;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#5A6A7A' }}>
          Question {current + 1} of {questions.length} · {cfg.label}
        </div>
        {timerSecs > 0 && (
          <div style={{ background: timeLeft < 60 ? '#FDEAEA' : '#E8F0FF', color: timeLeft < 60 ? '#B04030' : '#2244AA', padding: '6px 14px', borderRadius: 100, fontSize: 14, fontWeight: 700 }}>
            ⏱ {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Progress */}
      <div style={{ height: 5, background: '#F0E8D8', borderRadius: 3, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: cfg.color, borderRadius: 3, transition: 'width 0.3s' }}></div>
      </div>

      {/* Passage (reading only) */}
      {passage && current === 0 && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 20, border: '1px solid rgba(13,27,42,0.08)' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0D1B2A', marginBottom: 12 }}>{passage.title}</div>
          <div style={{ fontSize: 14, color: '#2A3A4A', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{passage.text}</div>
        </div>
      )}

      {/* Passage reminder for reading */}
      {passage && current > 0 && (
        <details style={{ marginBottom: 16 }}>
          <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#5A6A7A', padding: '8px 0' }}>📖 Show passage: {passage.title}</summary>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, marginTop: 8, border: '1px solid rgba(13,27,42,0.08)', fontSize: 14, color: '#2A3A4A', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{passage.text}</div>
        </details>
      )}

      {/* Question */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid rgba(13,27,42,0.08)', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: '#0D1B2A', lineHeight: 1.7, marginBottom: 24 }}>
          <span style={{ fontWeight: 700, color: '#5A6A7A', marginRight: 8 }}>Q{current + 1}.</span>
          {q.question}
        </div>

        {Object.entries(q.options).map(([letter, text]) => {
          const isSelected = selected[current] === letter;
          const isCorrect = q.correct === letter;
          const show = revealed[current];
          let bg = '#FAF6EE', border = '1.5px solid #F0E8D8', color = '#0D1B2A';
          if (show && isCorrect) { bg = '#E8F5EE'; border = '1.5px solid #52B788'; color = '#2D6A4F'; }
          else if (show && isSelected && !isCorrect) { bg = '#FDEAEA'; border = '1.5px solid #E07A5F'; color = '#B04030'; }

          return (
            <div key={letter} onClick={() => handleSelect(letter)} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 16px', borderRadius: 12, marginBottom: 8,
              background: bg, border, color,
              cursor: show ? 'default' : 'pointer',
              transition: 'all 0.15s'
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                background: show && isCorrect ? '#2D6A4F' : show && isSelected ? '#E07A5F' : '#E8E0D4',
                color: show && (isCorrect || isSelected) ? '#fff' : '#5A6A7A'
              }}>{letter}</div>
              <div style={{ fontSize: 15, lineHeight: 1.5, paddingTop: 2 }}>{text}</div>
              {show && isCorrect && <span style={{ marginLeft: 'auto', fontSize: 18, flexShrink: 0 }}>✓</span>}
              {show && isSelected && !isCorrect && <span style={{ marginLeft: 'auto', fontSize: 18, flexShrink: 0 }}>✗</span>}
            </div>
          );
        })}

        {/* Explanation */}
        {revealed[current] && (
          <div style={{ marginTop: 16, padding: '14px 18px', background: '#E8F5EE', border: '1px solid #A8DCC0', borderRadius: 12, fontSize: 14, color: '#2D6A4F', lineHeight: 1.7 }}>
            <strong>💡 Explanation:</strong> {q.explanation}
          </div>
        )}
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} style={{
          padding: '10px 24px', borderRadius: 100, fontSize: 14, fontWeight: 600,
          background: '#fff', color: '#0D1B2A', border: '1.5px solid rgba(13,27,42,0.15)',
          cursor: current === 0 ? 'default' : 'pointer', opacity: current === 0 ? 0.4 : 1
        }}>← Previous</button>

        <div style={{ display: 'flex', gap: 4 }}>
          {questions.map((_, i) => (
            <div key={i} onClick={() => setCurrent(i)} style={{
              width: 10, height: 10, borderRadius: '50%', cursor: 'pointer',
              background: i === current ? '#0D1B2A' : selected[i] ? (selected[i] === questions[i].correct ? '#52B788' : '#E07A5F') : '#D0C8BE',
              transition: 'background 0.2s'
            }}></div>
          ))}
        </div>

        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent(c => c + 1)} style={{
            padding: '10px 24px', borderRadius: 100, fontSize: 14, fontWeight: 600,
            background: '#0D1B2A', color: '#fff', border: 'none', cursor: 'pointer'
          }}>Next →</button>
        ) : (
          <button onClick={handleFinish} style={{
            padding: '10px 24px', borderRadius: 100, fontSize: 14, fontWeight: 700,
            background: '#E8B84B', color: '#0D1B2A', border: 'none', cursor: 'pointer'
          }}>Finish test ✓</button>
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
      {/* Score hero */}
      <div style={{ background: '#fff', borderRadius: 20, padding: 36, textAlign: 'center', marginBottom: 24, border: '1px solid rgba(13,27,42,0.08)' }}>
        <div style={{ fontSize: 64, fontWeight: 800, color: '#0D1B2A', lineHeight: 1 }}>{pct}%</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#0D1B2A', marginTop: 8 }}>{msg}</div>
        <div style={{ fontSize: 14, color: '#5A6A7A', marginTop: 4 }}>{result.correct} correct out of {result.total} questions · {cfg.label}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 20 }}>
          <div style={{ fontSize: 14, color: '#2D6A4F', fontWeight: 600 }}>✓ {result.correct} correct</div>
          <div style={{ fontSize: 14, color: '#B04030', fontWeight: 600 }}>✗ {result.total - result.correct} incorrect</div>
        </div>
      </div>

      {/* Review */}
      <div style={{ fontSize: 13, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Question review</div>
      {questions.map((q, i) => {
        const userAnswer = selected[i];
        const correct = userAnswer === q.correct;
        return (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', marginBottom: 10, border: '1px solid rgba(13,27,42,0.08)', display: 'flex', gap: 14 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: correct ? '#E8F5EE' : '#FDEAEA',
              color: correct ? '#2D6A4F' : '#B04030',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700
            }}>{correct ? '✓' : '✗'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#0D1B2A', marginBottom: 4, lineHeight: 1.5 }}>
                <strong>Q{i + 1}.</strong> {q.question}
              </div>
              {!correct && (
                <div style={{ fontSize: 13, color: '#B04030', marginBottom: 4 }}>
                  You answered: <strong>{userAnswer ? `${userAnswer}. ${q.options[userAnswer]}` : 'Not answered'}</strong>
                </div>
              )}
              <div style={{ fontSize: 13, color: '#2D6A4F', marginBottom: 6 }}>
                Correct: <strong>{q.correct}. {q.options[q.correct]}</strong>
              </div>
              {!correct && (
                <div style={{ fontSize: 13, color: '#5A6A7A', background: '#FAF6EE', padding: '8px 12px', borderRadius: 8, lineHeight: 1.6 }}>
                  💡 {q.explanation}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button onClick={onRetry} style={{ flex: 1, padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 700, background: '#0D1B2A', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Try another test →
        </button>
      </div>
    </div>
  );
}

// ── Main Test Page ────────────────────────────────────────────────────────────
export default function TestPage({ subject }) {
  const { yearLevel } = useAuth();
  const [phase, setPhase] = useState('setup'); // setup | loading | quiz | results
  const [questions, setQuestions] = useState([]);
  const [passage, setPassage] = useState(null);
  const [timerSecs, setTimerSecs] = useState(0);
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState({});
  const [error, setError] = useState('');

  const handleStart = async (count, timer) => {
    setPhase('loading');
    setError('');
    setTimerSecs(timer);
    try {
      const cfg = SUBJECT_CONFIG[subject];
      const data = await cfg.generate(yearLevel, count);
      if (subject === 'reading') {
        setPassage(data.passage);
        setQuestions(data.questions);
      } else {
        setQuestions(data);
      }
      setPhase('quiz');
    } catch (e) {
      setError('Failed to generate questions. Please check your API connection and try again.');
      setPhase('setup');
    }
  };

  const handleFinish = (result, sel) => {
    setResult(result);
    setSelected(sel);
    setPhase('results');
  };

  const handleRetry = () => {
    setPhase('setup');
    setQuestions([]);
    setPassage(null);
    setResult(null);
    setSelected({});
  };

  return (
    <div>
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(13,27,42,0.08)', padding: '20px 32px' }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 900, color: '#0D1B2A' }}>
          {SUBJECT_CONFIG[subject]?.icon} {SUBJECT_CONFIG[subject]?.label}
        </div>
        <div style={{ fontSize: 14, color: '#5A6A7A', marginTop: 2 }}>AI-generated · Year {yearLevel} · Fresh questions every session</div>
      </div>

      {error && (
        <div style={{ margin: 24, padding: '14px 18px', background: '#FDEAEA', border: '1px solid #E07A5F', borderRadius: 12, fontSize: 14, color: '#B04030' }}>
          ⚠️ {error}
        </div>
      )}

      {phase === 'setup' && <SetupScreen subject={subject} yearLevel={yearLevel} onStart={handleStart} />}
      {phase === 'loading' && <LoadingScreen subject={subject} />}
      {phase === 'quiz' && <QuizScreen subject={subject} questions={questions} passage={passage} timerSecs={timerSecs} yearLevel={yearLevel} onFinish={handleFinish} />}
      {phase === 'results' && <ResultsScreen subject={subject} questions={questions} selected={selected} result={result} onRetry={handleRetry} />}
    </div>
  );
}
