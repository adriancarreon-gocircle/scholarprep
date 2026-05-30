// src/pages/EnglishPage.jsx
// Route: /app/english  (add to App.js alongside /app/maths, /app/reading etc.)
// Also add "English" nav link to AppLayout.jsx sidebar

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { generateEnglishQuestions } from '../lib/ai';
import { saveTestResult } from '../lib/progress';

// ─── English topic taxonomy ──────────────────────────────────────────────────
const ENGLISH_TOPICS = [
  {
    topic: 'Spelling',
    types: ['Correct the spelling', 'Choose the correct spelling', 'Fill in the missing letters']
  },
  {
    topic: 'Punctuation',
    types: ['Add the missing punctuation', 'Identify the error', 'Choose the correctly punctuated sentence']
  },
  {
    topic: 'Capital Letters',
    types: ['Identify where capitals are needed', 'Correct the sentence']
  },
  {
    topic: 'Plural',
    types: ['Write the plural', 'Choose the correct plural', 'Irregular plurals']
  },
  {
    topic: 'Nouns',
    types: ['Identify the noun', 'Common nouns', 'Proper nouns', 'Collective nouns']
  },
  {
    topic: 'Adjectives',
    types: ['Identify the adjective', 'Adjectival phrases', 'Comparative adjectives']
  },
  {
    topic: 'Verbs',
    types: ['Identify the verb', 'Action verbs', 'Helping/auxiliary verbs']
  },
  {
    topic: 'Adverbs',
    types: ['Identify the adverb', 'Adverbial phrases', 'Choose the correct adverb']
  },
  {
    topic: 'Adding -ing and -ed',
    types: ['Add the correct suffix', 'Identify the error', 'Doubling rule']
  },
  {
    topic: 'ie and ei',
    types: ['Choose the correct spelling', 'Fill in the blank']
  },
  {
    topic: 'Tense',
    types: ['Present tense', 'Past tense', 'Future tense', 'Identify the tense']
  },
  {
    topic: 'Subject-Verb Agreement',
    types: ['Choose the correct verb form', 'Correct the sentence']
  },
  {
    topic: 'Words ending in -y',
    types: ['Plural of words ending in -y', 'Adding suffixes to -y words']
  },
  {
    topic: 'Homophones',
    types: ['Choose the correct homophone', 'Fill in the blank']
  },
  {
    topic: 'Days, Months & Seasons',
    types: ['Spelling of days/months', 'Capitalisation rules']
  },
  {
    topic: 'Prepositions',
    types: ['Identify the preposition', 'Choose the correct preposition', 'Prepositional phrases']
  },
  {
    topic: 'Pronouns',
    types: ['Identify the pronoun', 'Subject vs object pronouns', 'Possessive pronouns']
  },
  {
    topic: 'Apostrophes',
    types: ['Apostrophe for possession', 'Apostrophe for contraction', 'Correct the error']
  },
  {
    topic: 'Sentence Order',
    types: ['Arrange words into a correct sentence', 'Arrange sentences into a correct paragraph', 'Sequence the steps']
  },
  {
    topic: 'Conjunctions',
    types: ['Choose the correct conjunction', 'Join two sentences']
  },
  {
    topic: 'Prefixes & Suffixes',
    types: ['Identify the prefix/suffix', 'Choose the correct word with prefix/suffix']
  },
  {
    topic: 'Synonyms & Antonyms',
    types: ['Choose the synonym', 'Choose the antonym']
  },
  {
    topic: 'Compound Words',
    types: ['Identify/form compound words']
  },
  {
    topic: 'Similes & Metaphors',
    types: ['Identify the figure of speech', 'Complete the simile']
  }
];

const QUESTION_COUNTS = [5, 10, 15, 20, 30];

// ─── Colours ─────────────────────────────────────────────────────────────────
const INDIGO = '#4338CA';
const INDIGO_LIGHT = '#EEF2FF';
const ORANGE = '#F97316';
const GREEN = '#16a34a';
const RED = '#dc2626';
const GREY = '#6b7280';

export default function EnglishPage() {
  const { user, yearLevel } = useAuth();
  const location = useLocation();

  // ── phase: 'setup' | 'loading' | 'quiz' | 'results'
  const [phase, setPhase] = useState('setup');
  const [questionCount, setQuestionCount] = useState(10);
  const [reviewMode, setReviewMode] = useState('review'); // 'review' | 'end'
  const [topicCounts, setTopicCounts] = useState({});    // { 'Spelling': 3 }
  const [expandedTopics, setExpandedTopics] = useState({});
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState({});
  const [showExplanation, setShowExplanation] = useState({});
  const [error, setError] = useState(null);

  // Reset on nav
  useEffect(() => {
    setPhase('setup');
    setQuestions([]);
    setCurrent(0);
    setSelected({});
    setShowExplanation({});
    setTopicCounts({});
    setError(null);
  }, [location.key]);

  const topicTotal = Object.values(topicCounts).reduce((a, b) => a + b, 0);

  // ── topic picker helpers
  const adjustTopic = (topic, delta) => {
    setTopicCounts(prev => {
      const cur = prev[topic] || 0;
      const next = Math.max(0, cur + delta);
      const updated = { ...prev, [topic]: next };
      if (updated[topic] === 0) delete updated[topic];
      return updated;
    });
  };

  const toggleExpand = (topic) => {
    setExpandedTopics(prev => ({ ...prev, [topic]: !prev[topic] }));
  };

  // ── start test
  const handleStart = async () => {
    setPhase('loading');
    setError(null);
    try {
      let focusInstruction = null;
      if (topicTotal > 0) {
        const parts = Object.entries(topicCounts).map(
          ([t, c]) => `${c} question${c > 1 ? 's' : ''} on ${t}`
        );
        focusInstruction = parts.join(', ');
      }
      const count = topicTotal > 0 ? topicTotal : questionCount;
      const qs = await generateEnglishQuestions(yearLevel, count, focusInstruction);
      setQuestions(qs);
      setCurrent(0);
      setSelected({});
      setShowExplanation({});
      setPhase('quiz');
    } catch (e) {
      setError('Something went wrong generating questions. Please try again.');
      setPhase('setup');
    }
  };

  // ── answer
  const handleAnswer = (letter) => {
    if (selected[current] !== undefined) return;
    setSelected(prev => ({ ...prev, [current]: letter }));
    if (reviewMode === 'review') {
      setShowExplanation(prev => ({ ...prev, [current]: true }));
    }
  };

  // ── finish
  const handleFinish = async () => {
    const correct = questions.filter((q, i) => selected[i] === q.correct).length;
    if (user) {
      await saveTestResult('english', yearLevel, correct, questions.length, questions, selected);
    }
    setPhase('results');
  };

  const score = questions.filter((q, i) => selected[i] === q.correct).length;
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  // ═══════════════════════════════════════════════════════════════════════════
  // SETUP SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === 'setup') {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: INDIGO, marginBottom: 4 }}>
          English
        </h1>
        <p style={{ color: GREY, marginBottom: '2rem' }}>
          Grammar, spelling, punctuation and language skills — Year {yearLevel}
        </p>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.75rem 1rem', color: RED, marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {/* Question count — only show when no topics selected */}
        {topicTotal === 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#1e293b' }}>How many questions?</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {QUESTION_COUNTS.map(n => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: 8,
                    border: `2px solid ${questionCount === n ? INDIGO : '#e2e8f0'}`,
                    background: questionCount === n ? INDIGO_LIGHT : '#fff',
                    color: questionCount === n ? INDIGO : '#374151',
                    fontWeight: questionCount === n ? 700 : 400,
                    cursor: 'pointer', fontSize: '0.95rem'
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Review mode */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#1e293b' }}>Answer review</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { value: 'review', label: 'Review as I go' },
              { value: 'end', label: 'Exam mode' }
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setReviewMode(opt.value)}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: 8,
                  border: `2px solid ${reviewMode === opt.value ? INDIGO : '#e2e8f0'}`,
                  background: reviewMode === opt.value ? INDIGO_LIGHT : '#fff',
                  color: reviewMode === opt.value ? INDIGO : '#374151',
                  fontWeight: reviewMode === opt.value ? 700 : 400,
                  cursor: 'pointer', fontSize: '0.95rem'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Topic picker */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <p style={{ fontWeight: 600, color: '#1e293b', margin: 0 }}>
              Choose topics <span style={{ fontWeight: 400, color: GREY, fontSize: '0.85rem' }}>(optional)</span>
            </p>
            {topicTotal > 0 && (
              <span style={{ fontSize: '0.85rem', color: INDIGO, fontWeight: 600 }}>
                {topicTotal} question{topicTotal !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
            {ENGLISH_TOPICS.map((item, idx) => (
              <div key={item.topic} style={{ borderBottom: idx < ENGLISH_TOPICS.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '0.6rem 1rem', background: '#fafafa' }}>
                  <button
                    onClick={() => toggleExpand(item.topic)}
                    style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, color: '#1e293b' }}
                  >
                    {expandedTopics[item.topic] ? '▾' : '▸'} {item.topic}
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => adjustTopic(item.topic, -1)}
                      style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 700 }}>−</button>
                    <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 700, color: topicCounts[item.topic] ? INDIGO : GREY, fontSize: '0.9rem' }}>
                      {topicCounts[item.topic] || 0}
                    </span>
                    <button onClick={() => adjustTopic(item.topic, 1)}
                      style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 700 }}>+</button>
                  </div>
                </div>
                {expandedTopics[item.topic] && (
                  <div style={{ padding: '0.5rem 1rem 0.75rem 2rem', background: '#fff' }}>
                    {item.types.map(t => (
                      <div key={t} style={{ fontSize: '0.82rem', color: GREY, padding: '0.15rem 0' }}>• {t}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleStart}
          style={{
            width: '100%', padding: '0.85rem', borderRadius: 10,
            background: ORANGE, color: '#fff', fontWeight: 700,
            fontSize: '1rem', border: 'none', cursor: 'pointer'
          }}
        >
          Start {topicTotal > 0 ? topicTotal : questionCount} Questions →
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LOADING
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === 'loading') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <div style={{ width: 48, height: 48, border: `4px solid ${INDIGO_LIGHT}`, borderTop: `4px solid ${INDIGO}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: GREY, fontWeight: 500 }}>Generating English questions for Year {yearLevel}…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUIZ
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === 'quiz') {
    const q = questions[current];
    const answered = selected[current] !== undefined;
    const isCorrect = selected[current] === q.correct;
    const allAnswered = questions.every((_, i) => selected[i] !== undefined);

    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Progress */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: GREY }}>
            Question {current + 1} of {questions.length}
          </span>
          <span style={{ fontSize: '0.82rem', background: INDIGO_LIGHT, color: INDIGO, borderRadius: 20, padding: '0.2rem 0.6rem', fontWeight: 600 }}>
            {q.topic}
          </span>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {questions.map((qq, i) => {
            let bg = '#e2e8f0';
            if (selected[i] !== undefined) {
              if (reviewMode === 'end') bg = '#94a3b8';
              else bg = selected[i] === qq.correct ? GREEN : RED;
            }
            if (i === current) bg = INDIGO;
            return (
              <div key={i} onClick={() => setCurrent(i)}
                style={{ width: 22, height: 22, borderRadius: '50%', background: bg, cursor: 'pointer', transition: 'background 0.2s' }} />
            );
          })}
        </div>

        {/* Question */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.78rem', color: GREY, marginBottom: '0.5rem', fontWeight: 500 }}>
            {q.questionType}
          </p>
          <p style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
            {q.question}
          </p>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
          {['A', 'B', 'C', 'D'].map(letter => {
            let borderColor = '#e2e8f0';
            let bg = '#fff';
            let color = '#1e293b';
            if (answered && reviewMode === 'review') {
              if (letter === q.correct) { borderColor = GREEN; bg = '#f0fdf4'; color = GREEN; }
              else if (letter === selected[current]) { borderColor = RED; bg = '#fef2f2'; color = RED; }
            } else if (answered && letter === selected[current]) {
              borderColor = INDIGO; bg = INDIGO_LIGHT;
            }
            return (
              <button key={letter} onClick={() => handleAnswer(letter)}
                style={{
                  textAlign: 'left', padding: '0.75rem 1rem', borderRadius: 10,
                  border: `2px solid ${borderColor}`, background: bg, color,
                  fontSize: '0.95rem', cursor: answered ? 'default' : 'pointer',
                  fontWeight: answered && letter === q.correct && reviewMode === 'review' ? 700 : 400,
                  transition: 'all 0.15s'
                }}
              >
                <span style={{ fontWeight: 700, marginRight: 8 }}>{letter}.</span>
                {q.options[letter]}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation[current] && reviewMode === 'review' && (
          <div style={{
            background: isCorrect ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${isCorrect ? '#86efac' : '#fca5a5'}`,
            borderRadius: 10, padding: '1rem', marginBottom: '1rem', fontSize: '0.9rem',
            color: isCorrect ? GREEN : RED
          }}>
            <strong>{isCorrect ? '✓ Correct!' : `✗ Correct answer: ${q.correct}`}</strong>
            <p style={{ margin: '0.4rem 0 0', color: '#374151' }}>{q.explanation}</p>
          </div>
        )}

        {/* Nav buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <button onClick={() => setCurrent(c => Math.max(0, c - 1))}
            disabled={current === 0}
            style={{ padding: '0.6rem 1.25rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: current === 0 ? '#cbd5e1' : '#374151', cursor: current === 0 ? 'default' : 'pointer' }}>
            ← Previous
          </button>
          {current < questions.length - 1 ? (
            <button onClick={() => setCurrent(c => c + 1)}
              style={{ padding: '0.6rem 1.25rem', borderRadius: 8, border: 'none', background: INDIGO, color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
              Next →
            </button>
          ) : (
            <button onClick={handleFinish}
              disabled={!allAnswered}
              style={{ padding: '0.6rem 1.25rem', borderRadius: 8, border: 'none', background: allAnswered ? ORANGE : '#e2e8f0', color: allAnswered ? '#fff' : GREY, cursor: allAnswered ? 'pointer' : 'default', fontWeight: 600 }}>
              Finish Test
            </button>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RESULTS
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === 'results') {
    const grade = pct >= 90 ? 'Excellent' : pct >= 75 ? 'Good' : pct >= 60 ? 'Getting there' : 'Keep practising';
    const gradeColor = pct >= 90 ? GREEN : pct >= 75 ? INDIGO : pct >= 60 ? ORANGE : RED;

    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3.5rem', fontWeight: 800, color: gradeColor }}>{pct}%</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: gradeColor, marginBottom: 4 }}>{grade}</div>
          <div style={{ color: GREY }}>{score} out of {questions.length} correct</div>
        </div>

        {/* Review all questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {questions.map((q, i) => {
            const correct = selected[i] === q.correct;
            return (
              <div key={i} style={{
                border: `1px solid ${correct ? '#86efac' : '#fca5a5'}`,
                borderRadius: 10, padding: '1rem',
                background: correct ? '#f0fdf4' : '#fef2f2'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, background: correct ? '#dcfce7' : '#fee2e2', color: correct ? GREEN : RED, borderRadius: 100, padding: '2px 8px' }}>
                      {q.topic}
                    </span>
                    {q.questionType && (
                      <span style={{ fontSize: '0.72rem', color: '#6b7280', background: '#f1f5f9', borderRadius: 100, padding: '2px 8px' }}>
                        {q.questionType}
                      </span>
                    )}
                  </div>
                  <span style={{ fontWeight: 700, color: correct ? GREEN : RED, flexShrink: 0 }}>{correct ? '✓' : '✗'}</span>
                </div>
                <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem', whiteSpace: 'pre-line' }}>{q.question}</p>
                <p style={{ fontSize: '0.88rem', color: '#374151' }}>
                  Your answer: <strong style={{ color: correct ? GREEN : RED }}>{selected[i]}. {q.options[selected[i]]}</strong>
                </p>
                {!correct && (
                  <p style={{ fontSize: '0.88rem', color: GREEN }}>
                    Correct: <strong>{q.correct}. {q.options[q.correct]}</strong>
                  </p>
                )}
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.4rem' }}>{q.explanation}</p>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => { setPhase('setup'); setQuestions([]); }}
            style={{ padding: '0.75rem 1.5rem', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#374151', cursor: 'pointer', fontWeight: 600 }}>
            ← Home
          </button>
          <button onClick={handleStart}
            style={{ padding: '0.75rem 1.5rem', borderRadius: 10, border: 'none', background: ORANGE, color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT the topic taxonomy for use in CustomTestPage
// ─────────────────────────────────────────────────────────────────────────────
export { ENGLISH_TOPICS };