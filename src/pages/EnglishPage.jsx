import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateEnglishQuestions } from '../lib/ai';
import { saveTestResult } from '../lib/progress';

const CFG = {
  label: 'English',
  icon: '📝',
  color: '#7c3aed',
  lightBg: '#F5F3FF',
};

const ENGLISH_TOPICS = [
  { key: 'spelling', label: 'Spelling' },
  { key: 'punctuation', label: 'Punctuation' },
  { key: 'capitals', label: 'Capital Letters' },
  { key: 'plural', label: 'Plural' },
  { key: 'nouns', label: 'Nouns' },
  { key: 'adjectives', label: 'Adjectives' },
  { key: 'verbs', label: 'Verbs' },
  { key: 'adverbs', label: 'Adverbs' },
  { key: 'inged', label: 'Adding -ing and -ed' },
  { key: 'ieei', label: 'ie and ei' },
  { key: 'tense', label: 'Tense' },
  { key: 'agreement', label: 'Subject-Verb Agreement' },
  { key: 'endingy', label: 'Words ending in -y' },
  { key: 'homophones', label: 'Homophones' },
  { key: 'days', label: 'Days, Months & Seasons' },
  { key: 'prepositions', label: 'Prepositions' },
  { key: 'pronouns', label: 'Pronouns' },
  { key: 'apostrophes', label: 'Apostrophes' },
  { key: 'sentenceorder', label: 'Sentence Order' },
  { key: 'conjunctions', label: 'Conjunctions' },
  { key: 'prefixsuffix', label: 'Prefixes & Suffixes' },
  { key: 'synonymsant', label: 'Synonyms & Antonyms' },
  { key: 'compound', label: 'Compound Words' },
  { key: 'figurative', label: 'Similes & Metaphors' },
];

// ── Setup Screen ──────────────────────────────────────────────────────────────
function SetupScreen({ yearLevel, onStart }) {
  const [qCount, setQCount] = useState(10);
  const [timer, setTimer] = useState(0);
  const [reviewMode, setReviewMode] = useState('each');
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  const [topicCounts, setTopicCounts] = useState({});

  const topicTotal = Object.values(topicCounts).reduce((s, n) => s + n, 0);
  const usingTopics = topicTotal > 0;

  const setTopicCount = (key, count) =>
    setTopicCounts(p => ({ ...p, [key]: Math.max(0, count) }));

  const handleStart = () => {
    onStart(usingTopics ? topicTotal : qCount, timer, reviewMode, usingTopics ? topicCounts : null);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 32 }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: CFG.lightBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 16 }}>
          {CFG.icon}
        </div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 8, letterSpacing: -0.5 }}>
          {CFG.label}
        </h1>
        <div style={{ fontSize: 15, color: '#64748B', fontFamily: 'Inter, DM Sans, sans-serif' }}>
          Fresh questions · Year {yearLevel} level
        </div>
      </div>

      {/* Number of questions — hidden when topic picker is active */}
      {!usingTopics && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 14, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 2px 8px rgba(67,56,202,0.05)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>
            Number of questions
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[5, 10, 15, 20, 30].map(n => (
              <button key={n} onClick={() => setQCount(n)} style={{
                padding: '9px 22px', borderRadius: 100, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                background: qCount === n ? CFG.color : '#F8F9FF',
                color: qCount === n ? '#fff' : '#64748B',
                border: qCount === n ? 'none' : '1.5px solid rgba(67,56,202,0.1)',
                transition: 'all 0.15s',
                boxShadow: qCount === n ? `0 4px 12px ${CFG.color}40` : 'none',
                fontFamily: 'Inter, sans-serif',
              }}>{n}</button>
            ))}
          </div>
        </div>
      )}

      {/* Topic picker */}
      <div style={{
        background: '#fff', borderRadius: 16, padding: 24, marginBottom: 14,
        border: `1px solid ${(showTopicPicker || usingTopics) ? CFG.color + '40' : 'rgba(67,56,202,0.08)'}`,
        boxShadow: '0 2px 8px rgba(67,56,202,0.05)', transition: 'border-color 0.2s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showTopicPicker ? 16 : 0 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif' }}>
              Pick specific topics
            </div>
            {usingTopics
              ? <div style={{ fontSize: 12, color: CFG.color, fontFamily: 'Inter, sans-serif', marginTop: 2, fontWeight: 600 }}>{topicTotal} questions across selected topics</div>
              : !showTopicPicker && <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>Optional — or use random mix above</div>
            }
          </div>
          <button
            onClick={() => setShowTopicPicker(p => !p)}
            style={{ padding: '7px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: showTopicPicker ? CFG.lightBg : '#F8F9FF', color: showTopicPicker ? CFG.color : '#64748B', border: `1.5px solid ${showTopicPicker ? CFG.color : 'rgba(67,56,202,0.1)'}`, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
          >
            {showTopicPicker ? '▲ Hide' : '▼ Choose'}
          </button>
        </div>

        {showTopicPicker && (
          <div>
            {usingTopics && (
              <button onClick={() => setTopicCounts({})} style={{ fontSize: 12, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginBottom: 10, padding: 0 }}>
                ✕ Clear selection
              </button>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {ENGLISH_TOPICS.map(t => {
                const count = topicCounts[t.key] || 0;
                return (
                  <div key={t.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px', borderBottom: '1px solid #F8FAFC' }}>
                    <span style={{ fontSize: 13, fontWeight: count > 0 ? 700 : 500, color: count > 0 ? CFG.color : '#374151', fontFamily: 'Inter, sans-serif' }}>{t.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => setTopicCount(t.key, count - 1)} style={{ width: 26, height: 26, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 700, color: count > 0 ? CFG.color : '#94A3B8', minWidth: 22, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{count}</span>
                      <button onClick={() => setTopicCount(t.key, count + 1)} style={{ width: 26, height: 26, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Time limit */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 14, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 2px 8px rgba(67,56,202,0.05)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>Time limit</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[{ l: 'No timer', v: 0 }, { l: '10 min', v: 600 }, { l: '20 min', v: 1200 }, { l: '30 min', v: 1800 }, { l: '45 min', v: 2700 }].map(t => (
            <button key={t.v} onClick={() => setTimer(t.v)} style={{
              padding: '9px 20px', borderRadius: 100, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              background: timer === t.v ? '#0F172A' : '#F8F9FF',
              color: timer === t.v ? '#fff' : '#64748B',
              border: timer === t.v ? 'none' : '1.5px solid rgba(67,56,202,0.1)',
              transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
            }}>{t.l}</button>
          ))}
        </div>
      </div>

      {/* Answer review */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 2px 8px rgba(67,56,202,0.05)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>Answer review</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { key: 'each', icon: '💡', title: 'Review as I go', desc: 'See the correct answer and explanation after each question.' },
            { key: 'end', icon: '🏆', title: 'Exam mode', desc: 'See all answers and explanations at the end only.' },
          ].map(m => (
            <button key={m.key} onClick={() => setReviewMode(m.key)} style={{
              padding: '14px 16px', borderRadius: 12,
              border: `2px solid ${reviewMode === m.key ? CFG.color : '#E5E7EB'}`,
              background: reviewMode === m.key ? CFG.lightBg : '#fff',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
            }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{m.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: reviewMode === m.key ? CFG.color : '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 4 }}>{m.title}</div>
              <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleStart} style={{
        width: '100%', padding: 16, borderRadius: 100, fontSize: 16, fontWeight: 700,
        background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(67,56,202,0.3)', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
      }}
        onMouseEnter={e => e.target.style.background = '#3730A3'}
        onMouseLeave={e => e.target.style.background = '#4338CA'}
      >
        Generate test →
      </button>
      <div style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>
        Fresh questions generated every time — never the same test twice
      </div>
    </div>
  );
}

// ── Loading Screen ────────────────────────────────────────────────────────────
function LoadingScreen() {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 20, padding: 32 }}>
      <div style={{ width: 72, height: 72, borderRadius: 20, background: CFG.lightBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>{CFG.icon}</div>
      <div style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", fontSize: 22, fontWeight: 800, color: '#0F172A' }}>Generating your test{dots}</div>
      <div style={{ fontSize: 15, color: '#64748B', maxWidth: 320, textAlign: 'center', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>Creating fresh, unique questions just for you. This takes about 10–20 seconds.</div>
      <div style={{ width: 40, height: 40, border: '3px solid #EEF2FF', borderTop: `3px solid ${CFG.color}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}></div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Quiz Screen ───────────────────────────────────────────────────────────────
function QuizScreen({ questions, timerSecs, reviewMode, onFinish, onExit }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState({});
  const [revealed, setRevealed] = useState({});
  const [timeLeft, setTimeLeft] = useState(timerSecs);
  const [paused, setPaused] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [finished, setFinished] = useState(false);
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

  const handleFinish = useCallback(() => {
    setFinished(true);
    onFinish(selected);
  }, [selected, onFinish]);

  const handleSelect = (letter) => {
    if (revealed[current]) return;
    setSelected(s => ({ ...s, [current]: letter }));
    if (reviewMode === 'each') setRevealed(r => ({ ...r, [current]: true }));
  };

  const formatTime = (secs) => `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;
  const progress = ((current + 1) / questions.length) * 100;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 32 }}>
      {/* Exit dialog */}
      {showExit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🚪</div>
            <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>Exit test?</div>
            <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, marginBottom: 28, fontFamily: 'Inter, sans-serif' }}>Your progress will be lost and this test won't be saved.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowExit(false)} style={{ flex: 1, padding: '12px', borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Keep going</button>
              <button onClick={onExit} style={{ flex: 1, padding: '12px', borderRadius: 100, fontSize: 14, fontWeight: 700, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Exit test</button>
            </div>
          </div>
        </div>
      )}

      {/* Pause overlay */}
      {paused && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 40, maxWidth: 380, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏸</div>
            <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>Test paused</div>
            <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, marginBottom: 28, fontFamily: 'Inter, sans-serif' }}>Your timer is paused. Take a moment and resume when you're ready.</p>
            <button onClick={() => setPaused(false)} style={{ width: '100%', padding: '14px', borderRadius: 100, fontSize: 15, fontWeight: 700, background: CFG.color, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Resume test →</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
          Question {current + 1} of {questions.length} · English
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {timerSecs > 0 && (
            <>
              <div style={{ background: timeLeft < 60 ? '#FFF1F2' : '#EEF2FF', color: timeLeft < 60 ? '#BE123C' : '#4338CA', padding: '6px 14px', borderRadius: 100, fontSize: 14, fontWeight: 700, fontFamily: 'Inter, sans-serif', border: `1px solid ${timeLeft < 60 ? '#FDA4AF' : '#C7D2FE'}` }}>
                ⏱ {formatTime(timeLeft)}
              </div>
              <button onClick={() => setPaused(true)} style={{ padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0', cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>⏸ Pause</button>
            </>
          )}
          <button onClick={() => setShowExit(true)} style={{ padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#FFF1F2', color: '#EF4444', border: '1px solid #FCA5A5', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>✕ Exit</button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 5, background: '#EEF2FF', borderRadius: 3, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: CFG.color, borderRadius: 3, transition: 'width 0.3s' }}></div>
      </div>

      {/* Question card */}
      <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 16, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 4px 16px rgba(67,56,202,0.06)' }}>
        {q?.questionType && (
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, fontFamily: 'Inter, sans-serif' }}>
            {q.topic} · {q.questionType}
          </div>
        )}
        <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', lineHeight: 1.7, marginBottom: 20, fontFamily: 'Inter, sans-serif', whiteSpace: 'pre-line' }}>{q?.question}</div>
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
              bg = '#F5F3FF'; border = `1.5px solid ${CFG.color}`; color = CFG.color;
            }
            return (
              <button key={letter} onClick={() => handleSelect(letter)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, cursor: isRevealed ? 'default' : 'pointer', background: bg, border, color, textAlign: 'left', transition: 'all 0.15s', fontFamily: 'Inter, sans-serif' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: isRevealed && isCorrect ? '#059669' : isRevealed && isSelected ? '#BE123C' : isSelected ? CFG.color : 'rgba(124,58,237,0.08)', color: (isRevealed && isCorrect) || (isRevealed && isSelected) || isSelected ? '#fff' : '#64748B' }}>{letter}</div>
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
            <div key={i} onClick={() => setCurrent(i)} style={{ width: 10, height: 10, borderRadius: '50%', cursor: 'pointer', background: i === current ? CFG.color : (selected[i] && reviewMode !== 'end') ? (selected[i] === questions[i].correct ? '#059669' : '#F43F5E') : selected[i] ? '#94A3B8' : '#E2E8F0', transition: 'background 0.2s' }}></div>
          ))}
        </div>
        {current < questions.length - 1
          ? <button onClick={() => setCurrent(c => c + 1)} style={{ padding: '10px 24px', borderRadius: 100, fontSize: 14, fontWeight: 600, background: CFG.color, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Next →</button>
          : <button onClick={handleFinish} style={{ padding: '10px 24px', borderRadius: 100, fontSize: 14, fontWeight: 700, background: '#F97316', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}>Finish test ✓</button>
        }
      </div>
    </div>
  );
}

// ── Results Screen ────────────────────────────────────────────────────────────
function ResultsScreen({ questions, selected, result, onRetry, onHome, onNewTest }) {
  const pct = result.score;
  const msg = pct >= 80 ? 'Excellent work! 🌟' : pct >= 60 ? 'Good effort! 👍' : 'Keep practising! 💪';

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 32 }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: 36, textAlign: 'center', marginBottom: 24, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 4px 20px rgba(67,56,202,0.08)' }}>
        <div style={{ fontSize: 72, fontWeight: 800, color: pct >= 80 ? '#059669' : pct >= 60 ? CFG.color : '#F97316', lineHeight: 1, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{pct}%</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginTop: 10, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{msg}</div>
        <div style={{ fontSize: 14, color: '#64748B', marginTop: 6, fontFamily: 'Inter, sans-serif' }}>{result.correct} correct out of {result.total} questions · English</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 20 }}>
          <div style={{ fontSize: 14, color: '#059669', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>✓ {result.correct} correct</div>
          <div style={{ fontSize: 14, color: '#F43F5E', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>✗ {result.total - result.correct} incorrect</div>
        </div>
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>Question review</div>
      {questions.map((q, i) => {
        const userAnswer = selected[i];
        const isCorrectAnswer = userAnswer === q.correct;
        return (
          <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', marginBottom: 10, border: '1px solid rgba(67,56,202,0.06)', display: 'flex', gap: 14, boxShadow: '0 1px 4px rgba(67,56,202,0.04)' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: isCorrectAnswer ? '#ECFDF5' : '#FFF1F2', color: isCorrectAnswer ? '#059669' : '#BE123C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>{isCorrectAnswer ? '✓' : '✗'}</div>
            <div style={{ flex: 1 }}>
              {/* Topic + question type badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                {q.topic && (
                  <span style={{ fontSize: 11, fontWeight: 700, background: isCorrectAnswer ? '#ECFDF5' : '#FFF1F2', color: isCorrectAnswer ? '#059669' : '#BE123C', borderRadius: 100, padding: '2px 9px', fontFamily: 'Inter, sans-serif' }}>
                    {q.topic}
                  </span>
                )}
                {q.questionType && (
                  <span style={{ fontSize: 11, color: '#64748B', background: '#F1F5F9', borderRadius: 100, padding: '2px 9px', fontFamily: 'Inter, sans-serif' }}>
                    {q.questionType}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#0F172A', marginBottom: 6, lineHeight: 1.6, fontFamily: 'Inter, sans-serif', whiteSpace: 'pre-line' }}><strong>Q{i + 1}.</strong> {q.question}</div>
              {!isCorrectAnswer && <div style={{ fontSize: 13, color: '#BE123C', marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>You answered: <strong>{userAnswer ? `${userAnswer}. ${q.options[userAnswer]}` : 'Not answered'}</strong></div>}
              <div style={{ fontSize: 13, color: '#059669', marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>Correct: <strong>{q.correct}. {q.options[q.correct]}</strong></div>
              {!isCorrectAnswer && <div style={{ fontSize: 13, color: '#64748B', background: '#EEF2FF', padding: '10px 14px', borderRadius: 10, lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>💡 {q.explanation}</div>}
            </div>
          </div>
        );
      })}

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button onClick={onHome} style={{ flex: 1, padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 600, background: '#F1F5F9', color: '#374151', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>🏠 Home</button>
        <button onClick={onNewTest} style={{ flex: 1, padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 600, background: '#EEF2FF', color: '#4338CA', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>New test</button>
        <button onClick={onRetry} style={{ flex: 2, padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 700, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(67,56,202,0.3)' }}>Try again →</button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function EnglishPage() {
  const { yearLevel, hasAccess } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState('setup');
  const [questions, setQuestions] = useState([]);
  const [timerSecs, setTimerSecs] = useState(0);
  const [reviewMode, setReviewMode] = useState('each');
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState({});
  const [error, setError] = useState('');

  // Reset on nav
  useEffect(() => {
    setPhase('setup'); setQuestions([]); setResult(null); setSelected({}); setError('');
  }, [location.key]);

  const handleStart = async (count, timer, mode, topicCounts) => {
    setPhase('loading'); setError(''); setTimerSecs(timer); setReviewMode(mode);
    try {
      let focus = null;
      if (topicCounts && Object.keys(topicCounts).length > 0) {
        const parts = Object.entries(topicCounts)
          .filter(([, n]) => n > 0)
          .map(([key, n]) => {
            const label = ENGLISH_TOPICS.find(t => t.key === key)?.label || key;
            return `${n} question${n > 1 ? 's' : ''} on ${label}`;
          });
        focus = parts.join(', ');
      }
      const qs = await generateEnglishQuestions(yearLevel, count, focus);
      setQuestions(qs);
      setPhase('quiz');
    } catch (e) {
      setError('Failed to generate questions. Please check your connection and try again.');
      setPhase('setup');
    }
  };

  const handleFinish = useCallback(async (sel) => {
    const correct = questions.filter((q, i) => sel[i] === q.correct).length;
    const total = questions.length;
    const score = Math.round((correct / total) * 100);
    await saveTestResult('english', yearLevel, correct, total, questions, sel);
    setSelected(sel);
    setResult({ correct, total, score });
    setPhase('results');
  }, [questions, yearLevel]);

  const handleRetry = () => { setPhase('quiz'); setResult(null); setSelected({}); };
  const handleNewTest = () => { setPhase('setup'); setQuestions([]); setResult(null); setSelected({}); };
  const handleHome = () => navigate('/app');
  const handleExit = () => { setPhase('setup'); setQuestions([]); setResult(null); setSelected({}); };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F7FF' }}>
      {/* Page header */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(67,56,202,0.08)', padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: CFG.lightBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{CFG.icon}</div>
        <div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", fontSize: 20, fontWeight: 800, color: '#0F172A', letterSpacing: -0.3 }}>{CFG.label}</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>Fresh questions · Year {yearLevel} · Never the same test twice</div>
        </div>
      </div>

      {/* Trial wall */}
      {!hasAccess && (
        <div style={{ maxWidth: 560, margin: '60px auto', padding: 32, textAlign: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: 40, border: '1px solid rgba(67,56,202,0.1)', boxShadow: '0 4px 24px rgba(67,56,202,0.08)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
            <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>Your free trial has ended</div>
            <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.7, marginBottom: 28, fontFamily: 'Inter, sans-serif' }}>Subscribe to keep practising with unlimited questions — just $9.99/month.</p>
            <button onClick={() => navigate('/subscribe')} style={{ width: '100%', padding: '15px', borderRadius: 100, fontSize: 16, fontWeight: 700, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(67,56,202,0.3)', marginBottom: 12 }}>Subscribe for $9.99/month →</button>
            <div style={{ marginTop: 16, fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Cancel anytime · No lock-in contracts</div>
          </div>
        </div>
      )}

      {hasAccess && error && (
        <div style={{ margin: 24, padding: '14px 18px', background: '#FFF1F2', border: '1px solid #FDA4AF', borderRadius: 14, fontSize: 14, color: '#BE123C', fontFamily: 'Inter, sans-serif' }}>
          ⚠️ {error}
        </div>
      )}

      {hasAccess && phase === 'setup' && <SetupScreen yearLevel={yearLevel} onStart={handleStart} />}
      {hasAccess && phase === 'loading' && <LoadingScreen />}
      {hasAccess && phase === 'quiz' && <QuizScreen questions={questions} timerSecs={timerSecs} reviewMode={reviewMode} onFinish={handleFinish} onExit={handleExit} />}
      {hasAccess && phase === 'results' && <ResultsScreen questions={questions} selected={selected} result={result} onRetry={handleRetry} onHome={handleHome} onNewTest={handleNewTest} />}
    </div>
  );
}