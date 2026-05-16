import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { generateMathsQuestions, generateReadingQuestions, generateGeneralAbilityQuestions } from '../lib/ai';
import { saveTestResult } from '../lib/progress';

// ── Constants ─────────────────────────────────────────────────────────────────

const MATHS_TOPICS = [
  {
    key: 'number', label: 'Numbers & Counting',
    questionTypes: [
      { key: 'evenodd', label: 'Even or odd numbers' },
      { key: 'wordform', label: 'Write numbers in word form' },
      { key: 'placevalue', label: 'Place value' },
      { key: 'ordering', label: 'Order / compare numbers' },
      { key: 'rounding', label: 'Rounding numbers' },
      { key: 'greaterthan', label: 'Greater than / less than' },
    ]
  },
  {
    key: 'addition', label: 'Addition',
    questionTypes: [
      { key: 'addbasic', label: 'Basic addition (1–2 digit)' },
      { key: 'addlarge', label: 'Adding larger numbers (3–5 digit)' },
      { key: 'addworded', label: 'Worded addition problems' },
    ]
  },
  {
    key: 'subtraction', label: 'Subtraction',
    questionTypes: [
      { key: 'subbasic', label: 'Basic subtraction (1–2 digit)' },
      { key: 'sublarge', label: 'Subtracting larger numbers (3–5 digit)' },
      { key: 'subworded', label: 'Worded subtraction problems' },
    ]
  },
  {
    key: 'multiplication', label: 'Multiplication',
    questionTypes: [
      { key: 'timestables', label: 'Times tables (2×–12×)' },
      { key: 'multisingle', label: 'Multiply by 1 digit' },
      { key: 'multimulti', label: 'Multiply by 2+ digits' },
      { key: 'multiworded', label: 'Worded multiplication problems' },
    ]
  },
  {
    key: 'division', label: 'Division',
    questionTypes: [
      { key: 'divbasic', label: 'Basic division facts' },
      { key: 'divremainder', label: 'Division with remainders' },
      { key: 'divworded', label: 'Worded division problems' },
    ]
  },
  {
    key: 'fractions', label: 'Fractions',
    questionTypes: [
      { key: 'fracbasic', label: 'Basic fractions (shaded parts, halves, quarters)' },
      { key: 'fracequiv', label: 'Equivalent fractions' },
      { key: 'fraccompare', label: 'Compare fractions' },
      { key: 'fracworded', label: 'Worded fraction problems' },
    ]
  },
  {
    key: 'decimals', label: 'Decimals',
    questionTypes: [
      { key: 'decconvert', label: 'Convert fractions to decimals' },
      { key: 'deccompare', label: 'Compare / order decimals' },
      { key: 'decarith', label: 'Add / subtract / multiply decimals' },
    ]
  },
  {
    key: 'percentages', label: 'Percentages',
    questionTypes: [
      { key: 'pctbasic', label: 'Percentage of a number' },
      { key: 'pctconvert', label: 'Convert fractions / decimals to percentages' },
      { key: 'pctworded', label: 'Worded percentage problems (discounts, GST)' },
      { key: 'pctchange', label: 'Percentage increase / decrease' },
    ]
  },
  {
    key: 'geometry', label: 'Geometry & Shapes',
    questionTypes: [
      { key: 'geo2d', label: '2D shapes (sides, corners, names)' },
      { key: 'geo3d', label: '3D shapes (faces, edges, vertices)' },
      { key: 'geoangles', label: 'Angles (straight line, right angle, triangle, polygon)' },
      { key: 'geosymmetry', label: 'Lines of symmetry' },
    ]
  },
  {
    key: 'measurement', label: 'Measurement',
    questionTypes: [
      { key: 'meastime', label: 'Time (reading clocks, time calculations)' },
      { key: 'measmoney', label: 'Money (making change, prices)' },
      { key: 'measlength', label: 'Length / distance conversions' },
      { key: 'measarea', label: 'Area and perimeter' },
      { key: 'measvolume', label: 'Volume and capacity' },
    ]
  },
  {
    key: 'algebra', label: 'Algebra',
    questionTypes: [
      { key: 'algexpr', label: 'Simplify expressions' },
      { key: 'algsolve', label: 'Solve for x' },
      { key: 'algexpand', label: 'Expand brackets' },
      { key: 'algsubst', label: 'Substitute values' },
      { key: 'algfactor', label: 'Factorise expressions' },
    ]
  },
  {
    key: 'statistics', label: 'Statistics & Averages',
    questionTypes: [
      { key: 'statmean', label: 'Mean (average)' },
      { key: 'statmedmode', label: 'Median, mode and range' },
      { key: 'statgraph', label: 'Reading graphs and data' },
      { key: 'statworded', label: 'Worded statistics problems' },
    ]
  },
  {
    key: 'wordproblems', label: 'Word Problems',
    questionTypes: [
      { key: 'wprates', label: 'Rates (speed, pay rate)' },
      { key: 'wpratio', label: 'Ratio and proportion' },
      { key: 'wpmulti', label: 'Multi-step mixed problems' },
    ]
  },
];

const GA_TOPICS = [
  { key: 'sequences', label: 'Number Sequences' },
  { key: 'analogies', label: 'Verbal Analogies' },
  { key: 'letters', label: 'Letter Patterns' },
  { key: 'oddoneout', label: 'Odd One Out' },
  { key: 'logic', label: 'Logic Problems' },
  { key: 'coding', label: 'Coding & Decoding' },
];

const SUBJECT_CONFIG = {
  mathematics: { label: 'Mathematics', icon: '🔢', color: '#4338CA', lightBg: '#EEF2FF' },
  reading: { label: 'Reading Comprehension', icon: '📖', color: '#059669', lightBg: '#ECFDF5' },
  general: { label: 'General Ability', icon: '🧩', color: '#F97316', lightBg: '#FFF7ED' },
};

const STORAGE_KEY = 'scholarprep_custom_tests';

// ── Storage helpers ───────────────────────────────────────────────────────────

const loadSavedTests = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

const saveTests = (tests) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tests)); } catch { }
};

// ── Utility ───────────────────────────────────────────────────────────────────

const formatTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const getBandColor = (pct) => {
  if (pct >= 80) return '#059669';
  if (pct >= 60) return '#4338CA';
  return '#F97316';
};

// ── Exit Dialog ───────────────────────────────────────────────────────────────

function ExitDialog({ onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🚪</div>
        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>Exit test?</div>
        <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, marginBottom: 28, fontFamily: 'Inter, sans-serif' }}>Your progress will not be saved. Are you sure?</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: 12, borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Keep going</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: 12, borderRadius: 100, fontSize: 14, fontWeight: 700, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Exit test</button>
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
        <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, marginBottom: 28, fontFamily: 'Inter, sans-serif' }}>Timer is paused. Resume when ready.</p>
        <button onClick={onResume} style={{ width: '100%', padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 700, background: color, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Resume →</button>
      </div>
    </div>
  );
}

// ── Builder Screen ────────────────────────────────────────────────────────────

function BuilderScreen({ onSaveAndStart, onSaveOnly, editingTest }) {
  const [step, setStep] = useState(1); // 1=subject, 2=config, 3=name
  const [subject, setSubject] = useState(editingTest?.subject || '');
  const [testName, setTestName] = useState(editingTest?.name || '');
  const [timerSecs, setTimerSecs] = useState(editingTest?.timerSecs || 0);
  const [reviewMode, setReviewMode] = useState(editingTest?.reviewMode || 'each');

  // Maths config
  const [mathsTopics, setMathsTopics] = useState(
    editingTest?.mathsTopics || MATHS_TOPICS.reduce((acc, t) => ({ ...acc, [t.key]: 0 }), {})
  );
  const [mathsQuestionTypes, setMathsQuestionTypes] = useState(
    editingTest?.mathsQuestionTypes || {}
  );
  const [expandedTopics, setExpandedTopics] = useState({});

  // Reading config
  const [passages, setPassages] = useState(editingTest?.passages || 2);
  const [questionsPerPassage, setQuestionsPerPassage] = useState(editingTest?.questionsPerPassage || 5);

  // GA config
  const [gaTopics, setGaTopics] = useState(
    editingTest?.gaTopics || GA_TOPICS.reduce((acc, t) => ({ ...acc, [t.key]: 0 }), {})
  );

  const totalQtQuestions = Object.values(mathsQuestionTypes).reduce((sum, n) => sum + n, 0);
  const totalMathsQuestions = totalQtQuestions > 0 ? totalQtQuestions : Object.values(mathsTopics).reduce((sum, n) => sum + n, 0);
  const totalGaQuestions = Object.values(gaTopics).reduce((sum, n) => sum + n, 0);
  const totalReadingQuestions = passages * questionsPerPassage;

  const totalQuestions = subject === 'mathematics' ? totalMathsQuestions
    : subject === 'reading' ? totalReadingQuestions
      : totalGaQuestions;

  const isValid = subject && totalQuestions > 0 && testName.trim();

  const buildTestConfig = () => ({
    id: editingTest?.id || Date.now().toString(),
    name: testName.trim(),
    subject,
    timerSecs,
    reviewMode,
    mathsTopics: subject === 'mathematics' ? mathsTopics : null,
    mathsQuestionTypes: subject === 'mathematics' ? mathsQuestionTypes : null,
    passages: subject === 'reading' ? passages : null,
    questionsPerPassage: subject === 'reading' ? questionsPerPassage : null,
    gaTopics: subject === 'general' ? gaTopics : null,
    totalQuestions,
    createdAt: editingTest?.createdAt || new Date().toISOString(),
  });

  const cfg = subject ? SUBJECT_CONFIG[subject] : null;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 32 }}>
      <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 8, letterSpacing: -0.5 }}>
        {editingTest ? 'Edit custom test' : 'Build a custom test'}
      </h2>
      <p style={{ fontSize: 15, color: '#64748B', marginBottom: 28, fontFamily: 'Inter, sans-serif' }}>Choose topics, set question counts and save it to reuse anytime.</p>

      {/* Step 1: Subject */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 14, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 2px 8px rgba(67,56,202,0.04)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>Subject</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {Object.entries(SUBJECT_CONFIG).map(([key, s]) => (
            <button key={key} onClick={() => setSubject(key)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12,
              border: `2px solid ${subject === key ? s.color : '#E5E7EB'}`,
              background: subject === key ? s.lightBg : '#fff',
              cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600,
              color: subject === key ? s.color : '#374151', transition: 'all 0.15s',
            }}>
              <span>{s.icon}</span> {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Topic config */}
      {subject === 'mathematics' && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 14, border: '1px solid rgba(67,56,202,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif' }}>Topics & questions</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#4338CA', fontFamily: 'Inter, sans-serif' }}>Total: {totalMathsQuestions} questions</div>
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16, fontFamily: 'Inter, sans-serif' }}>
            Click ▶ to expand a topic and choose specific question types
          </div>
          {MATHS_TOPICS.map(t => {
            const isExpanded = expandedTopics[t.key];
            const topicCount = mathsTopics[t.key] || 0;
            const selectedTypes = t.questionTypes.filter(qt => mathsQuestionTypes[`${t.key}__${qt.key}`] > 0);
            return (
              <div key={t.key} style={{ borderBottom: '1px solid #F3F4F6' }}>
                {/* Topic row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0' }}>
                  {/* Expand toggle */}
                  <button
                    onClick={() => setExpandedTopics(p => ({ ...p, [t.key]: !p[t.key] }))}
                    style={{ width: 24, height: 24, borderRadius: 6, border: '1.5px solid #E5E7EB', background: isExpanded ? '#EEF2FF' : '#F8F9FF', cursor: 'pointer', fontSize: 10, color: isExpanded ? '#4338CA' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}
                  >
                    {isExpanded ? '▼' : '▶'}
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', fontFamily: 'Inter, sans-serif' }}>{t.label}</div>
                    {selectedTypes.length > 0 && (
                      <div style={{ fontSize: 11, color: '#4338CA', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>
                        {selectedTypes.map(qt => `${qt.label} (${mathsQuestionTypes[`${t.key}__${qt.key}`]})`).join(' · ')}
                      </div>
                    )}
                  </div>
                  {/* +/- for total topic questions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => setMathsTopics(p => ({ ...p, [t.key]: Math.max(0, p[t.key] - 1) }))}
                      style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 16, fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ fontSize: 15, fontWeight: 700, color: topicCount > 0 ? '#4338CA' : '#94A3B8', minWidth: 24, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{topicCount}</span>
                    <button onClick={() => setMathsTopics(p => ({ ...p, [t.key]: p[t.key] + 1 }))}
                      style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 16, fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                </div>

                {/* Expanded question types */}
                {isExpanded && (
                  <div style={{ background: '#F8FAFF', borderRadius: 10, padding: '8px 12px', marginBottom: 8, border: '1px solid #EEF2FF' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>
                      Optional: pick specific question types
                    </div>
                    {t.questionTypes.map(qt => {
                      const qtKey = `${t.key}__${qt.key}`;
                      const qtCount = mathsQuestionTypes[qtKey] || 0;
                      return (
                        <div key={qt.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 4px', borderBottom: '1px solid #EEF2FF' }}>
                          <div style={{ fontSize: 13, color: '#374151', fontFamily: 'Inter, sans-serif', flex: 1 }}>{qt.label}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button onClick={() => setMathsQuestionTypes(p => ({ ...p, [qtKey]: Math.max(0, (p[qtKey] || 0) - 1) }))}
                              style={{ width: 24, height: 24, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                            <span style={{ fontSize: 13, fontWeight: 700, color: qtCount > 0 ? '#4338CA' : '#94A3B8', minWidth: 20, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{qtCount}</span>
                            <button onClick={() => setMathsQuestionTypes(p => ({ ...p, [qtKey]: (p[qtKey] || 0) + 1 }))}
                              style={{ width: 24, height: 24, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 8, fontFamily: 'Inter, sans-serif', fontStyle: 'italic' }}>
                      Leave all at 0 to let the test pick any question type from this topic automatically.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {subject === 'reading' && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 14, border: '1px solid rgba(67,56,202,0.08)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16, fontFamily: 'Inter, sans-serif' }}>Passage configuration</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F8FAFC' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', fontFamily: 'Inter, sans-serif' }}>Number of passages</div>
              <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Each passage has its own text to read</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => setPassages(p => Math.max(1, p - 1))} style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 16, fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#059669', minWidth: 24, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{passages}</span>
              <button onClick={() => setPassages(p => Math.min(5, p + 1))} style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 16, fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', fontFamily: 'Inter, sans-serif' }}>Questions per passage</div>
              <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Comprehension questions after each passage</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => setQuestionsPerPassage(p => Math.max(1, p - 1))} style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 16, fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#059669', minWidth: 24, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{questionsPerPassage}</span>
              <button onClick={() => setQuestionsPerPassage(p => Math.min(10, p + 1))} style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 16, fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            </div>
          </div>
          <div style={{ background: '#ECFDF5', borderRadius: 10, padding: '10px 14px', marginTop: 8, fontSize: 13, color: '#059669', fontFamily: 'Inter, sans-serif' }}>
            Total: {passages} passage{passages > 1 ? 's' : ''} × {questionsPerPassage} questions = <strong>{totalReadingQuestions} questions</strong>
          </div>
        </div>
      )}

      {subject === 'general' && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 14, border: '1px solid rgba(67,56,202,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif' }}>Question types</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#F97316', fontFamily: 'Inter, sans-serif' }}>Total: {totalGaQuestions} questions</div>
          </div>
          {GA_TOPICS.map(t => (
            <div key={t.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F8FAFC' }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#0F172A', fontFamily: 'Inter, sans-serif' }}>{t.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => setGaTopics(p => ({ ...p, [t.key]: Math.max(0, p[t.key] - 1) }))}
                  style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 16, fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ fontSize: 15, fontWeight: 700, color: gaTopics[t.key] > 0 ? '#F97316' : '#94A3B8', minWidth: 24, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{gaTopics[t.key]}</span>
                <button onClick={() => setGaTopics(p => ({ ...p, [t.key]: p[t.key] + 1 }))}
                  style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 16, fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timer */}
      {subject && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 14, border: '1px solid rgba(67,56,202,0.08)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>Time limit</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[{ l: 'No timer', v: 0 }, { l: '10 min', v: 600 }, { l: '20 min', v: 1200 }, { l: '30 min', v: 1800 }, { l: '45 min', v: 2700 }, { l: '60 min', v: 3600 }].map(t => (
              <button key={t.v} onClick={() => setTimerSecs(t.v)} style={{
                padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: timerSecs === t.v ? '#0F172A' : '#F8F9FF',
                color: timerSecs === t.v ? '#fff' : '#64748B',
                border: timerSecs === t.v ? 'none' : '1.5px solid rgba(67,56,202,0.1)',
                fontFamily: 'Inter, sans-serif',
              }}>{t.l}</button>
            ))}
          </div>
        </div>
      )}

      {/* Review mode */}
      {subject && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 14, border: '1px solid rgba(67,56,202,0.08)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>Answer review</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { key: 'each', icon: '💡', title: 'Review as I go', desc: 'See the answer after each question.' },
              { key: 'end', icon: '🏆', title: 'Exam mode', desc: 'See all answers at the end only.' },
            ].map(m => (
              <button key={m.key} onClick={() => setReviewMode(m.key)} style={{
                padding: '14px 16px', borderRadius: 12,
                border: `2px solid ${reviewMode === m.key ? (cfg?.color || '#4338CA') : '#E5E7EB'}`,
                background: reviewMode === m.key ? (cfg?.lightBg || '#EEF2FF') : '#fff',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{m.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: reviewMode === m.key ? (cfg?.color || '#4338CA') : '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 2 }}>{m.title}</div>
                <div style={{ fontSize: 12, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>{m.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Test name */}
      {subject && totalQuestions > 0 && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 20, border: '1px solid rgba(67,56,202,0.08)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: 'Inter, sans-serif' }}>Test name</div>
          <input
            value={testName}
            onChange={e => setTestName(e.target.value)}
            placeholder={`e.g. My ${cfg?.label} Practice`}
            style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #E5E7EB', fontSize: 15, fontFamily: 'Inter, sans-serif', color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = cfg?.color || '#4338CA'}
            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
          />
        </div>
      )}

      {/* Action buttons */}
      {isValid && (
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => onSaveOnly(buildTestConfig())} style={{
            flex: 1, padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 600,
            background: '#F1F5F9', color: '#374151', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}>
            💾 Save only
          </button>
          <button onClick={() => onSaveAndStart(buildTestConfig())} style={{
            flex: 2, padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 700,
            background: cfg?.color || '#4338CA', color: '#fff', border: 'none', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', boxShadow: `0 4px 16px ${cfg?.color || '#4338CA'}30`,
          }}>
            Save & start test →
          </button>
        </div>
      )}
      {subject && totalQuestions === 0 && (
        <div style={{ textAlign: 'center', fontSize: 14, color: '#94A3B8', fontFamily: 'Inter, sans-serif', padding: '12px 0' }}>
          Add at least 1 question to continue
        </div>
      )}
    </div>
  );
}

// ── Saved Tests List ──────────────────────────────────────────────────────────

function SavedTestsList({ tests, onStart, onEdit, onDelete, onCreateNew }) {
  if (tests.length === 0) {
    return (
      <div style={{ maxWidth: 560, margin: '60px auto', padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>No custom tests yet</div>
        <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.7, marginBottom: 28, fontFamily: 'Inter, sans-serif' }}>
          Build your first custom test — choose exactly which topics to practise and save it to reuse anytime.
        </p>
        <button onClick={onCreateNew} style={{ padding: '14px 32px', borderRadius: 100, fontSize: 15, fontWeight: 700, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(67,56,202,0.3)' }}>
          Build my first test →
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 800, color: '#0F172A', letterSpacing: -0.5 }}>My custom tests</h2>
          <p style={{ fontSize: 14, color: '#64748B', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>Save and reuse your favourite practice sets</p>
        </div>
        <button onClick={onCreateNew} style={{ padding: '10px 20px', borderRadius: 100, fontSize: 14, fontWeight: 700, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
          + New test
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tests.map(test => {
          const cfg = SUBJECT_CONFIG[test.subject];
          return (
            <div key={test.id} style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 2px 8px rgba(67,56,202,0.04)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: cfg?.lightBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{cfg?.icon}</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{test.name}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>{cfg?.label}</span>
                  <span style={{ fontSize: 12, color: '#94A3B8' }}>·</span>
                  <span style={{ fontSize: 12, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>{test.totalQuestions} questions</span>
                  <span style={{ fontSize: 12, color: '#94A3B8' }}>·</span>
                  <span style={{ fontSize: 12, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>{test.timerSecs > 0 ? `${Math.round(test.timerSecs / 60)} min timer` : 'No timer'}</span>
                  <span style={{ fontSize: 12, color: '#94A3B8' }}>·</span>
                  <span style={{ fontSize: 12, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>{test.reviewMode === 'each' ? 'Review as I go' : 'Exam mode'}</span>
                </div>
                {/* Topic pills */}
                {test.subject === 'mathematics' && test.mathsTopics && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                    {MATHS_TOPICS.filter(t => test.mathsTopics[t.key] > 0).map(t => (
                      <span key={t.key} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: cfg.lightBg, color: cfg.color, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                        {t.label} ({test.mathsTopics[t.key]})
                      </span>
                    ))}
                  </div>
                )}
                {test.subject === 'reading' && (
                  <div style={{ marginTop: 6, fontSize: 12, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
                    {test.passages} passage{test.passages > 1 ? 's' : ''} × {test.questionsPerPassage} questions each
                  </div>
                )}
                {test.subject === 'general' && test.gaTopics && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                    {GA_TOPICS.filter(t => test.gaTopics[t.key] > 0).map(t => (
                      <span key={t.key} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: cfg.lightBg, color: cfg.color, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                        {t.label} ({test.gaTopics[t.key]})
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => onEdit(test)} style={{ padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Edit</button>
                <button onClick={() => onDelete(test.id)} style={{ padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#FFF1F2', color: '#EF4444', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Delete</button>
                <button onClick={() => onStart(test)} style={{ padding: '8px 20px', borderRadius: 100, fontSize: 13, fontWeight: 700, background: cfg?.color || '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Start →</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Quiz Screen ───────────────────────────────────────────────────────────────

function QuizScreen({ test, yearLevel, onFinish, onExit }) {
  const [questions, setQuestions] = useState([]);
  const [passageGroups, setPassageGroups] = useState([]); // for reading
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState({});
  const [revealed, setRevealed] = useState({});
  const [timeLeft, setTimeLeft] = useState(test.timerSecs || 0);
  const [paused, setPaused] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [dots, setDots] = useState('');
  const finishedRef = useRef(false);
  const cfg = SUBJECT_CONFIG[test.subject];

  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { generateAllQuestions(); }, []);

  const generateAllQuestions = async () => {
    try {
      if (test.subject === 'mathematics') {
        const allQuestions = [];
        // Check if any specific question types are selected
        const qtEntries = test.mathsQuestionTypes
          ? Object.entries(test.mathsQuestionTypes).filter(([, count]) => count > 0)
          : [];

        if (qtEntries.length > 0) {
          // Generate per specific question type
          for (const [qtKey, count] of qtEntries) {
            const [topicKey] = qtKey.split('__');
            const topic = MATHS_TOPICS.find(t => t.key === topicKey);
            const qt = topic?.questionTypes.find(q => q.key === qtKey.split('__')[1]);
            const focusLabel = qt ? `${topic.label} — ${qt.label}` : null;
            const qs = await generateMathsQuestions(yearLevel, count, focusLabel);
            const tagged = qs.slice(0, count).map(q => ({ ...q, topic: topicKey }));
            allQuestions.push(...tagged);
          }
        } else {
          // Generate per topic (no specific question type selected)
          const topicEntries = Object.entries(test.mathsTopics).filter(([, count]) => count > 0);
          for (const [topicKey, count] of topicEntries) {
            const qs = await generateMathsQuestions(yearLevel, count);
            const tagged = qs.slice(0, count).map(q => ({ ...q, topic: topicKey }));
            allQuestions.push(...tagged);
          }
        }
        setQuestions(allQuestions);
      } else if (test.subject === 'reading') {
        // Generate multiple passages
        const groups = [];
        for (let i = 0; i < test.passages; i++) {
          const data = await generateReadingQuestions(yearLevel, test.questionsPerPassage);
          groups.push(data);
        }
        setPassageGroups(groups);
        // Flatten all questions
        const allQs = groups.flatMap(g => g.questions);
        setQuestions(allQs);
      } else if (test.subject === 'general') {
        const allQuestions = [];
        const topicEntries = Object.entries(test.gaTopics).filter(([, count]) => count > 0);
        for (const [topicKey, count] of topicEntries) {
          const qs = await generateGeneralAbilityQuestions(yearLevel, count);
          const tagged = qs.slice(0, count).map(q => ({ ...q, topic: topicKey }));
          allQuestions.push(...tagged);
        }
        setQuestions(allQuestions);
      }
      setLoading(false);
    } catch (e) {
      setError('Failed to generate questions. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading || !test.timerSecs || paused) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); if (!finishedRef.current) handleFinish(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [loading, paused]);

  const handleFinish = useCallback(async () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const correct = questions.filter((q, i) => selected[i] === q.correct).length;
    const total = questions.length;
    const score = Math.round((correct / total) * 100);
    await saveTestResult(test.subject, yearLevel, correct, total, questions, selected);
    onFinish({ correct, total, score, questions, selected, passageGroups });
  }, [questions, selected, test, yearLevel, onFinish, passageGroups]);

  const handleSelect = (letter) => {
    if (revealed[current]) return;
    setSelected(s => ({ ...s, [current]: letter }));
    if (test.reviewMode === 'each') setRevealed(r => ({ ...r, [current]: true }));
  };

  const progress = questions.length > 0 ? ((current + 1) / questions.length) * 100 : 0;
  const q = questions[current];

  // Find passage for current question (reading)
  const getCurrentPassage = () => {
    if (test.subject !== 'reading' || passageGroups.length === 0) return null;
    const passageIndex = Math.floor(current / test.questionsPerPassage);
    return passageGroups[passageIndex]?.passage || null;
  };
  const passage = getCurrentPassage();
  const isFirstInPassage = test.subject === 'reading' && current % test.questionsPerPassage === 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 20, padding: 32 }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: cfg.lightBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{cfg.icon}</div>
        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 800, color: '#0F172A' }}>Generating your test{dots}</div>
        <div style={{ fontSize: 14, color: '#64748B', fontFamily: 'Inter, sans-serif', textAlign: 'center', maxWidth: 320 }}>Creating fresh questions for your custom test — this takes about 20–30 seconds</div>
        <div style={{ width: 36, height: 36, border: '3px solid #EEF2FF', borderTop: `3px solid ${cfg.color}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 480, margin: '60px auto', padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>{error}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={generateAllQuestions} style={{ padding: '12px 28px', borderRadius: 100, background: cfg.color, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Try again</button>
          <button onClick={onExit} style={{ padding: '12px 28px', borderRadius: 100, background: '#FFF1F2', color: '#EF4444', border: '1px solid #FCA5A5', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Exit</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 32px' }}>
      {showExitDialog && <ExitDialog onConfirm={onExit} onCancel={() => setShowExitDialog(false)} />}
      {paused && <PauseOverlay onResume={() => setPaused(false)} color={cfg.color} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
          {test.name} · Q{current + 1} of {questions.length}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {test.timerSecs > 0 && (
            <>
              <div style={{ background: timeLeft < 60 ? '#FFF1F2' : '#EEF2FF', color: timeLeft < 60 ? '#BE123C' : cfg.color, padding: '6px 14px', borderRadius: 100, fontSize: 14, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
                ⏱ {formatTime(timeLeft)}
              </div>
              <button onClick={() => setPaused(true)} style={{ padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>⏸ Pause</button>
            </>
          )}
          <button onClick={() => setShowExitDialog(true)} style={{ padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#FFF1F2', color: '#EF4444', border: '1px solid #FCA5A5', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>✕ Exit</button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: cfg.color, borderRadius: 2, transition: 'width 0.3s' }} />
      </div>

      {/* Passage (reading) */}
      {passage && isFirstInPassage && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, marginBottom: 16, border: '1px solid rgba(67,56,202,0.08)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 10, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{passage.title}</div>
          <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.85, whiteSpace: 'pre-line', fontFamily: 'Inter, sans-serif' }}>{passage.text}</div>
        </div>
      )}
      {passage && !isFirstInPassage && (
        <details style={{ marginBottom: 14 }}>
          <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600, color: cfg.color, fontFamily: 'Inter, sans-serif', padding: '6px 0' }}>📖 Show passage: {passage.title}</summary>
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginTop: 8, border: '1px solid #E5E7EB', fontSize: 14, color: '#334155', lineHeight: 1.85, whiteSpace: 'pre-line', fontFamily: 'Inter, sans-serif' }}>{passage.text}</div>
        </details>
      )}

      {/* Question */}
      {q && (
        <div style={{ background: '#fff', borderRadius: 20, padding: 24, marginBottom: 14, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 2px 8px rgba(67,56,202,0.05)' }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#0F172A', lineHeight: 1.7, marginBottom: 18, fontFamily: 'Inter, sans-serif' }}>{q.question}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(q.options).map(([letter, text]) => {
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
                <button key={letter} onClick={() => handleSelect(letter)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 10, cursor: isRevealed ? 'default' : 'pointer', background: bg, border, color, textAlign: 'left', transition: 'all 0.15s', fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: isRevealed && isCorrect ? '#059669' : isRevealed && isSelected ? '#BE123C' : isSelected ? cfg.color : 'rgba(67,56,202,0.08)', color: (isRevealed && isCorrect) || (isRevealed && isSelected) || isSelected ? '#fff' : '#64748B' }}>{letter}</div>
                  <span style={{ fontSize: 14 }}>{text}</span>
                  {isRevealed && isCorrect && <span style={{ marginLeft: 'auto' }}>✓</span>}
                  {isRevealed && isSelected && !isCorrect && <span style={{ marginLeft: 'auto' }}>✗</span>}
                </button>
              );
            })}
          </div>
          {revealed[current] && (
            <div style={{ marginTop: 14, padding: '12px 14px', background: '#EEF2FF', borderRadius: 10, fontSize: 13, color: cfg.color, lineHeight: 1.65, fontFamily: 'Inter, sans-serif', border: '1px solid #C7D2FE' }}>
              <strong>💡 Explanation:</strong> {q.explanation}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} style={{ padding: '10px 22px', borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#fff', color: cfg.color, border: '1.5px solid rgba(67,56,202,0.2)', cursor: current === 0 ? 'default' : 'pointer', opacity: current === 0 ? 0.4 : 1, fontFamily: 'Inter, sans-serif' }}>← Previous</button>
        <div style={{ display: 'flex', gap: 4 }}>
          {questions.slice(0, Math.min(questions.length, 20)).map((_, i) => (
            <div key={i} onClick={() => setCurrent(i)} style={{ width: 8, height: 8, borderRadius: '50%', cursor: 'pointer', background: i === current ? cfg.color : selected[i] ? (selected[i] === questions[i]?.correct ? '#059669' : '#F43F5E') : '#E2E8F0', transition: 'background 0.2s' }} />
          ))}
          {questions.length > 20 && <span style={{ fontSize: 11, color: '#94A3B8' }}>+{questions.length - 20}</span>}
        </div>
        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent(c => c + 1)} style={{ padding: '10px 22px', borderRadius: 100, fontSize: 14, fontWeight: 600, background: cfg.color, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Next →</button>
        ) : (
          <button onClick={handleFinish} style={{ padding: '10px 22px', borderRadius: 100, fontSize: 14, fontWeight: 700, background: '#F97316', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}>Finish ✓</button>
        )}
      </div>
    </div>
  );
}

// ── Results Screen ────────────────────────────────────────────────────────────

function ResultsScreen({ test, result, onRetry, onBack }) {
  const cfg = SUBJECT_CONFIG[test.subject];
  const { correct, total, score, questions, selected } = result;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 32 }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: 36, textAlign: 'center', marginBottom: 24, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 4px 20px rgba(67,56,202,0.08)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>{test.name}</div>
        <div style={{ fontSize: 64, fontWeight: 900, color: getBandColor(score), lineHeight: 1, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{score}%</div>
        <div style={{ fontSize: 14, color: '#64748B', marginTop: 8, fontFamily: 'Inter, sans-serif' }}>{correct} correct out of {total} · {cfg.label}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
          <div style={{ fontSize: 14, color: '#059669', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>✓ {correct} correct</div>
          <div style={{ fontSize: 14, color: '#F43F5E', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>✗ {total - correct} incorrect</div>
        </div>
      </div>

      {/* Question review */}
      <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>Question review</div>
      {questions.map((q, i) => {
        const userAnswer = selected[i];
        const isCorrect = userAnswer === q.correct;
        return (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '14px 18px', marginBottom: 10, border: '1px solid rgba(67,56,202,0.06)', display: 'flex', gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: isCorrect ? '#ECFDF5' : '#FFF1F2', color: isCorrect ? '#059669' : '#BE123C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{isCorrect ? '✓' : '✗'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A', marginBottom: 4, fontFamily: 'Inter, sans-serif' }}><strong>Q{i + 1}.</strong> {q.question}</div>
              {!isCorrect && <div style={{ fontSize: 12, color: '#BE123C', fontFamily: 'Inter, sans-serif', marginBottom: 2 }}>You answered: <strong>{userAnswer ? `${userAnswer}. ${q.options[userAnswer]}` : 'Not answered'}</strong></div>}
              <div style={{ fontSize: 12, color: '#059669', fontFamily: 'Inter, sans-serif', marginBottom: isCorrect ? 0 : 4 }}>Correct: <strong>{q.correct}. {q.options[q.correct]}</strong></div>
              {!isCorrect && q.explanation && <div style={{ fontSize: 12, color: '#64748B', background: '#EEF2FF', padding: '8px 10px', borderRadius: 8, lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>💡 {q.explanation}</div>}
            </div>
          </div>
        );
      })}

      <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
        <button onClick={onBack} style={{ flex: 1, padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 600, background: '#F1F5F9', color: '#374151', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>← My tests</button>
        <button onClick={onRetry} style={{ flex: 2, padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 700, background: cfg.color, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: `0 4px 16px ${cfg.color}30` }}>
          Redo this test →
        </button>
      </div>
      <div style={{ textAlign: 'center', marginTop: 10, fontSize: 13, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Results saved to your Progress Dashboard</div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CustomTestPage() {
  const { yearLevel, hasAccess } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('list'); // list | builder | quiz | results
  const [savedTests, setSavedTests] = useState(loadSavedTests);
  const [editingTest, setEditingTest] = useState(null);
  const [activeTest, setActiveTest] = useState(null);
  const [result, setResult] = useState(null);

  const handleSaveOnly = (testConfig) => {
    const updated = editingTest
      ? savedTests.map(t => t.id === testConfig.id ? testConfig : t)
      : [...savedTests, testConfig];
    setSavedTests(updated);
    saveTests(updated);
    setEditingTest(null);
    setView('list');
  };

  const handleSaveAndStart = (testConfig) => {
    const updated = editingTest
      ? savedTests.map(t => t.id === testConfig.id ? testConfig : t)
      : [...savedTests, testConfig];
    setSavedTests(updated);
    saveTests(updated);
    setEditingTest(null);
    setActiveTest(testConfig);
    setView('quiz');
  };

  const handleStartTest = (test) => {
    setActiveTest(test);
    setView('quiz');
  };

  const handleEditTest = (test) => {
    setEditingTest(test);
    setView('builder');
  };

  const handleDeleteTest = (id) => {
    const updated = savedTests.filter(t => t.id !== id);
    setSavedTests(updated);
    saveTests(updated);
  };

  const handleFinishQuiz = (result) => {
    setResult(result);
    setView('results');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F7FF' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(67,56,202,0.08)', padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎯</div>
        <div>
          <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 800, color: '#0F172A', letterSpacing: -0.3 }}>Custom Tests</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>Build, save and reuse your own practice tests · Year {yearLevel}</div>
        </div>
        {view === 'builder' && (
          <button onClick={() => { setEditingTest(null); setView('list'); }} style={{ marginLeft: 'auto', padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>← Back</button>
        )}
      </div>

      {/* Upgrade wall */}
      {!hasAccess && (
        <div style={{ maxWidth: 560, margin: '60px auto', padding: 32, textAlign: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: 40, border: '1px solid rgba(67,56,202,0.1)', boxShadow: '0 4px 24px rgba(67,56,202,0.08)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
            <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>Your free trial has ended</div>
            <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.7, marginBottom: 28, fontFamily: 'Inter, sans-serif' }}>Subscribe to build and save custom tests for just $9.99/month.</p>
            <button onClick={() => navigate('/subscribe')} style={{ width: '100%', padding: '15px', borderRadius: 100, fontSize: 16, fontWeight: 700, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(67,56,202,0.3)' }}>
              Subscribe for $9.99/month →
            </button>
          </div>
        </div>
      )}

      {hasAccess && view === 'list' && (
        <SavedTestsList
          tests={savedTests}
          onStart={handleStartTest}
          onEdit={handleEditTest}
          onDelete={handleDeleteTest}
          onCreateNew={() => { setEditingTest(null); setView('builder'); }}
        />
      )}

      {hasAccess && view === 'builder' && (
        <BuilderScreen
          onSaveAndStart={handleSaveAndStart}
          onSaveOnly={handleSaveOnly}
          editingTest={editingTest}
        />
      )}

      {hasAccess && view === 'quiz' && activeTest && (
        <QuizScreen
          test={activeTest}
          yearLevel={yearLevel}
          onFinish={handleFinishQuiz}
          onExit={() => setView('list')}
        />
      )}

      {hasAccess && view === 'results' && result && activeTest && (
        <ResultsScreen
          test={activeTest}
          result={result}
          onRetry={() => setView('quiz')}
          onBack={() => setView('list')}
        />
      )}
    </div>
  );
}