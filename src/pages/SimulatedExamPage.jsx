import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { generateMathsQuestions, generateReadingQuestions, generateGeneralAbilityQuestions, generateWritingPrompt, assessWriting } from '../lib/ai';
import { saveTestResult } from '../lib/progress';

// ── Exam definitions ──────────────────────────────────────────────────────────
const EXAM_CONFIGS = {
  acer: {
    name: 'ACER',
    fullName: 'ACER Selective High School Entrance Test',
    color: '#4338CA',
    lightBg: '#EEF2FF',
    icon: '🎓',
    description: 'The most widely used selective entry test in Australia, used by Melbourne High, Mac.Robertson Girls\', Suzanne Cory and many others.',
    sections: [
      { id: 'maths_quant', name: 'Mathematics & Quantitative Reasoning', type: 'mathematics', duration: 60, questions: 65, icon: '🔢' },
      { id: 'break1', name: 'Break', type: 'break', duration: 20 },
      { id: 'reading_verbal', name: 'Reading & Verbal Reasoning', type: 'reading', duration: 55, questions: 65, icon: '📖' },
      { id: 'break2', name: 'Short Break', type: 'break', duration: 5 },
      { id: 'writing', name: 'Writing', type: 'writing', duration: 40, questions: 1, icon: '✏️' },
    ]
  },
  aast: {
    name: 'AAST',
    fullName: 'Australian Academic Scholarship Test',
    color: '#059669',
    lightBg: '#ECFDF5',
    icon: '📚',
    description: 'Used by many independent schools for academic scholarship selection across Australia.',
    sections: [
      { id: 'general', name: 'General Ability', type: 'general', duration: 45, questions: 60, icon: '🧩', note: 'Abstract Reasoning and Problem Solving' },
      { id: 'break1', name: 'Break', type: 'break', duration: 20 },
      { id: 'writing', name: 'Writing', type: 'writing', duration: 25, questions: 1, icon: '✏️' },
      { id: 'break2', name: 'Break', type: 'break', duration: 20 },
      { id: 'reading', name: 'Reading', type: 'reading', duration: 45, questions: 45, icon: '📖', note: '9 stories, 5 questions each' },
      { id: 'break3', name: 'Break', type: 'break', duration: 20 },
      { id: 'maths', name: 'Mathematics', type: 'mathematics', duration: 45, questions: 45, icon: '🔢', note: 'Mathematics Achievement and Reasoning' },
    ]
  },
  edutest: {
    name: 'Edutest',
    fullName: 'Edutest Scholarship & Selective Entry',
    color: '#F97316',
    lightBg: '#FFF7ED',
    icon: '🏫',
    description: 'Used by many Victorian independent schools and some government selective entry programs.',
    sections: [
      { id: 'verbal', name: 'Verbal Reasoning', type: 'general', duration: 30, questions: 45, icon: '🧩' },
      { id: 'break1', name: 'Break', type: 'break', duration: 20 },
      { id: 'numerical', name: 'Numerical Reasoning', type: 'mathematics', duration: 30, questions: 35, icon: '🔢' },
      { id: 'break2', name: 'Break', type: 'break', duration: 20 },
      { id: 'reading', name: 'Reading Comprehension', type: 'reading', duration: 30, questions: 30, icon: '📖' },
      { id: 'break3', name: 'Break', type: 'break', duration: 20 },
      { id: 'maths', name: 'Mathematics', type: 'mathematics', duration: 45, questions: 35, icon: '🔢' },
      { id: 'break4', name: 'Break', type: 'break', duration: 20 },
      { id: 'writing', name: 'Written Expression', type: 'writing', duration: 30, questions: 1, icon: '✏️' },
    ]
  },
  naplan: {
    name: 'NAPLAN',
    fullName: 'National Assessment Program — Literacy and Numeracy',
    color: '#7C3AED',
    lightBg: '#F5F3FF',
    icon: '📝',
    description: 'National standardised assessment for all Australian students in Years 3, 5, 7 and 9.',
    sections: [
      { id: 'writing', name: 'Writing', type: 'writing', duration: 40, questions: 1, icon: '✏️' },
      { id: 'break1', name: 'Break', type: 'break', duration: 20 },
      { id: 'reading', name: 'Reading', type: 'reading', duration: 45, questions: 45, icon: '📖', note: '9 stories, 5 questions each' },
      { id: 'break2', name: 'Break', type: 'break', duration: 20 },
      { id: 'conventions', name: 'Conventions of Language', type: 'general', duration: 45, questions: 50, icon: '🧩' },
      { id: 'break3', name: 'Break', type: 'break', duration: 20 },
      { id: 'numeracy', name: 'Numeracy', type: 'mathematics', duration: 45, questions: 36, icon: '🔢' },
    ]
  }
};

const getBandColor = (pct) => {
  if (pct < 40) return '#EF4444';
  if (pct < 60) return '#F97316';
  if (pct < 75) return '#10B981';
  return '#059669';
};

const getGrade = (pct) => {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 75) return 'B+';
  if (pct >= 65) return 'B';
  if (pct >= 55) return 'C+';
  if (pct >= 45) return 'C';
  if (pct >= 35) return 'D';
  return 'E';
};

const formatTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// ── Setup Screen ──────────────────────────────────────────────────────────────
function SetupScreen({ onStart, yearLevel }) {
  const [selectedExam, setSelectedExam] = useState(null);
  const [reviewMode, setReviewMode] = useState('end'); // 'each' | 'end'
  const [customSections, setCustomSections] = useState(null);

  const handleSelectExam = (key) => {
    setSelectedExam(key);
    const exam = EXAM_CONFIGS[key];
    setCustomSections(exam.sections.map(s => ({ ...s })));
  };

  const updateSection = (idx, field, value) => {
    setCustomSections(prev => prev.map((s, i) => i === idx ? { ...s, [field]: Math.max(1, parseInt(value) || 1) } : s));
  };

  const resetToDefaults = () => {
    if (selectedExam) {
      setCustomSections(EXAM_CONFIGS[selectedExam].sections.map(s => ({ ...s })));
    }
  };

  const exam = selectedExam ? EXAM_CONFIGS[selectedExam] : null;
  const nonBreakSections = customSections?.filter(s => s.type !== 'break') || [];
  const totalMins = customSections?.reduce((sum, s) => sum + s.duration, 0) || 0;
  const totalQuestions = nonBreakSections.reduce((sum, s) => sum + (s.questions || 0), 0);

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: 32 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 8, letterSpacing: -0.5 }}>
          Simulated Exam
        </h1>
        <p style={{ fontSize: 15, color: '#64748B', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
          Full exam simulation with timed sections and breaks — just like the real test centre.
        </p>
      </div>

      {/* Exam selector */}
      {!selectedExam && (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>Choose your exam</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
            {Object.entries(EXAM_CONFIGS).map(([key, cfg]) => (
              <button key={key} onClick={() => handleSelectExam(key)} style={{
                background: '#fff', borderRadius: 16, padding: '20px 24px',
                border: '1.5px solid #E5E7EB', cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = cfg.color; e.currentTarget.style.boxShadow = `0 4px 16px ${cfg.color}20`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: cfg.lightBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{cfg.icon}</div>
                  <div>
                    <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 17, fontWeight: 800, color: '#0F172A' }}>{cfg.name}</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>{cfg.fullName}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, margin: '0 0 12px', fontFamily: 'Inter, sans-serif' }}>{cfg.description}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {cfg.sections.filter(s => s.type !== 'break').map(s => (
                    <span key={s.id} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: cfg.lightBg, color: cfg.color, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                      {s.name}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {selectedExam && exam && customSections && (
        <>
          {/* Back button */}
          <button onClick={() => { setSelectedExam(null); setCustomSections(null); }} style={{ background: 'none', border: 'none', fontSize: 14, color: '#64748B', cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginBottom: 20, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Back to exam selection
          </button>

          {/* Selected exam header */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', marginBottom: 16, border: `1.5px solid ${exam.color}30`, boxShadow: `0 4px 20px ${exam.color}10` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: exam.lightBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{exam.icon}</div>
              <div>
                <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{exam.fullName}</div>
                <div style={{ fontSize: 13, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Year {yearLevel} · {totalMins} mins total · {totalQuestions} questions</div>
              </div>
            </div>
          </div>

          {/* Customise sections */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Customise sections</div>
              <button onClick={resetToDefaults} style={{ fontSize: 12, color: exam.color, background: exam.lightBg, border: 'none', borderRadius: 100, padding: '4px 14px', cursor: 'pointer', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                Reset to defaults
              </button>
            </div>
            {customSections.map((s, i) => (
              s.type === 'break' ? (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px dashed #F3F4F6' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>☕</div>
                  <div style={{ flex: 1, fontSize: 13, color: '#94A3B8', fontStyle: 'italic', fontFamily: 'Inter, sans-serif' }}>{s.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button onClick={() => updateSection(i, 'duration', s.duration - 5)} style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>−</button>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B', minWidth: 52, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{s.duration} mins</span>
                    <button onClick={() => updateSection(i, 'duration', s.duration + 5)} style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>+</button>
                  </div>
                </div>
              ) : (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: exam.lightBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{s.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', fontFamily: 'Inter, sans-serif' }}>{s.name}</div>
                    {s.note && <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>{s.note}</div>}
                  </div>
                  {s.type !== 'writing' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'Inter, sans-serif', marginRight: 4 }}>Questions:</span>
                      <button onClick={() => updateSection(i, 'questions', s.questions - 5)} style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', minWidth: 28, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{s.questions}</span>
                      <button onClick={() => updateSection(i, 'questions', s.questions + 5)} style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>+</button>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'Inter, sans-serif', marginRight: 4 }}>Time:</span>
                    <button onClick={() => updateSection(i, 'duration', s.duration - 5)} style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>−</button>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', minWidth: 52, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{s.duration} mins</span>
                    <button onClick={() => updateSection(i, 'duration', s.duration + 5)} style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>+</button>
                  </div>
                </div>
              )
            ))}
          </div>

          {/* Review mode */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 20, border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 14, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Answer review mode</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { key: 'end', icon: '🏆', title: 'Exam mode', desc: 'See all answers and explanations at the end only. Most realistic.' },
                { key: 'each', icon: '💡', title: 'Review as I go', desc: 'See the correct answer and explanation after each question.' },
              ].map(m => (
                <button key={m.key} onClick={() => setReviewMode(m.key)} style={{
                  padding: '14px 16px', borderRadius: 12, border: `2px solid ${reviewMode === m.key ? exam.color : '#E5E7EB'}`,
                  background: reviewMode === m.key ? exam.lightBg : '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{m.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: reviewMode === m.key ? exam.color : '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 4 }}>{m.title}</div>
                  <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Start button */}
          <button onClick={() => onStart(selectedExam, customSections, reviewMode)} style={{
            width: '100%', padding: 16, borderRadius: 100, fontSize: 16, fontWeight: 700,
            background: exam.color, color: '#fff', border: 'none', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', boxShadow: `0 4px 20px ${exam.color}40`,
            transition: 'all 0.2s',
          }}>
            Start {exam.name} exam →
          </button>
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>
            {totalMins} minutes total · {totalQuestions} questions · Year {yearLevel}
          </div>
        </>
      )}
    </div>
  );
}

// ── Break Screen ──────────────────────────────────────────────────────────────
function BreakScreen({ section, nextSection, examColor, onFinish }) {
  const [timeLeft, setTimeLeft] = useState(section.duration * 60);
  const [minutesPassed, setMinutesPassed] = useState(0);

  useEffect(() => {
    if (timeLeft <= 0) { onFinish(); return; }
    const t = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        setMinutesPassed(Math.floor((section.duration * 60 - next) / 60));
        if (next <= 0) { clearInterval(t); onFinish(); }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const pct = ((section.duration * 60 - timeLeft) / (section.duration * 60)) * 100;

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: 32, textAlign: 'center' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 24px' }}>☕</div>
      <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 26, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>{section.name}</h2>
      <p style={{ fontSize: 15, color: '#64748B', marginBottom: 32, fontFamily: 'Inter, sans-serif' }}>
        Take a moment to rest before the next section.
        {nextSection && <><br />Next up: <strong style={{ color: '#0F172A' }}>{nextSection.name}</strong></>}
      </p>

      {/* Circular timer */}
      <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto 32px' }}>
        <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="80" cy="80" r="70" fill="none" stroke="#F3F4F6" strokeWidth="8" />
          <circle cx="80" cy="80" r="70" fill="none" stroke={examColor} strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 70}`}
            strokeDashoffset={`${2 * Math.PI * 70 * (1 - pct / 100)}`}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 28, fontWeight: 900, color: '#0F172A' }}>{formatTime(timeLeft)}</div>
          <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>remaining</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {minutesPassed >= 1 && (
          <button onClick={onFinish} style={{ padding: '12px 28px', borderRadius: 100, fontSize: 14, fontWeight: 700, background: examColor, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: `0 4px 16px ${examColor}30` }}>
            Start next section early →
          </button>
        )}
        <button onClick={onFinish} style={{ padding: '12px 28px', borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#fff', color: '#64748B', border: '1.5px solid #E5E7EB', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
          Skip break →
        </button>
      </div>
    </div>
  );
}

// ── Section Quiz Screen ───────────────────────────────────────────────────────
function SectionQuizScreen({ section, examColor, reviewMode, yearLevel, onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [passage, setPassage] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState({});
  const [revealed, setRevealed] = useState({});
  const [timeLeft, setTimeLeft] = useState(section.duration * 60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dots, setDots] = useState('');
  const finishedRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    generateQuestions();
  }, []);

  const generateQuestions = async () => {
    try {
      if (section.type === 'mathematics') {
        const qs = await generateMathsQuestions(yearLevel, section.questions);
        setQuestions(qs);
      } else if (section.type === 'reading') {
        const data = await generateReadingQuestions(yearLevel, section.questions);
        setPassage(data.passage);
        setQuestions(data.questions);
      } else if (section.type === 'general') {
        const qs = await generateGeneralAbilityQuestions(yearLevel, section.questions);
        setQuestions(qs);
      }
      setLoading(false);
    } catch (e) {
      setError('Failed to generate questions. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); if (!finishedRef.current) handleFinish(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [loading]);

  const handleFinish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const correct = questions.filter((q, i) => selected[i] === q.correct).length;
    const pct = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    saveTestResult(section.type, yearLevel, correct, questions.length, questions);
    onComplete({ sectionId: section.id, sectionName: section.name, correct, total: questions.length, pct, questions, selected });
  }, [questions, selected, section, yearLevel, onComplete]);

  const handleSelect = (letter) => {
    if (revealed[current]) return;
    setSelected(s => ({ ...s, [current]: letter }));
    if (reviewMode === 'each') setRevealed(r => ({ ...r, [current]: true }));
  };

  const progress = questions.length > 0 ? ((current + 1) / questions.length) * 100 : 0;
  const q = questions[current];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 20, padding: 32 }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{section.icon}</div>
        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 800, color: '#0F172A' }}>Generating {section.name}{dots}</div>
        <div style={{ fontSize: 14, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>Creating {section.questions} fresh questions — this takes about 20 seconds</div>
        <div style={{ width: 36, height: 36, border: '3px solid #EEF2FF', borderTop: `3px solid ${examColor}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 480, margin: '60px auto', padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>{error}</div>
        <button onClick={generateQuestions} style={{ padding: '12px 28px', borderRadius: 100, background: examColor, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Try again</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 32px' }}>
      {/* Section header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
          {section.name} · Q{current + 1} of {questions.length}
        </div>
        <div style={{ background: timeLeft < 300 ? '#FFF1F2' : '#EEF2FF', color: timeLeft < 300 ? '#BE123C' : examColor, padding: '6px 14px', borderRadius: 100, fontSize: 14, fontWeight: 700, fontFamily: 'Inter, sans-serif', border: `1px solid ${timeLeft < 300 ? '#FDA4AF' : '#C7D2FE'}` }}>
          ⏱ {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: examColor, borderRadius: 2, transition: 'width 0.3s' }} />
      </div>

      {/* Passage */}
      {passage && current === 0 && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, marginBottom: 16, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 10, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{passage.title}</div>
          <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.85, whiteSpace: 'pre-line', fontFamily: 'Inter, sans-serif' }}>{passage.text}</div>
        </div>
      )}
      {passage && current > 0 && (
        <details style={{ marginBottom: 14 }}>
          <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600, color: examColor, fontFamily: 'Inter, sans-serif', padding: '6px 0' }}>📖 Show passage: {passage.title}</summary>
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
                bg = '#EEF2FF'; border = `1.5px solid ${examColor}`; color = examColor;
              }
              return (
                <button key={letter} onClick={() => handleSelect(letter)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 10, cursor: isRevealed ? 'default' : 'pointer', background: bg, border, color, textAlign: 'left', transition: 'all 0.15s', fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: isRevealed && isCorrect ? '#059669' : isRevealed && isSelected ? '#BE123C' : isSelected ? examColor : 'rgba(67,56,202,0.08)', color: (isRevealed && isCorrect) || (isRevealed && isSelected) || isSelected ? '#fff' : '#64748B' }}>{letter}</div>
                  <span style={{ fontSize: 14 }}>{text}</span>
                  {isRevealed && isCorrect && <span style={{ marginLeft: 'auto' }}>✓</span>}
                  {isRevealed && isSelected && !isCorrect && <span style={{ marginLeft: 'auto' }}>✗</span>}
                </button>
              );
            })}
          </div>
          {revealed[current] && (
            <div style={{ marginTop: 14, padding: '12px 14px', background: '#EEF2FF', borderRadius: 10, fontSize: 13, color: examColor, lineHeight: 1.65, fontFamily: 'Inter, sans-serif', border: '1px solid #C7D2FE' }}>
              <strong>💡 Explanation:</strong> {q.explanation}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} style={{ padding: '10px 22px', borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#fff', color: examColor, border: '1.5px solid rgba(67,56,202,0.2)', cursor: current === 0 ? 'default' : 'pointer', opacity: current === 0 ? 0.4 : 1, fontFamily: 'Inter, sans-serif' }}>← Previous</button>
        <div style={{ display: 'flex', gap: 4 }}>
          {questions.slice(0, Math.min(questions.length, 20)).map((_, i) => (
            <div key={i} onClick={() => setCurrent(i)} style={{ width: 8, height: 8, borderRadius: '50%', cursor: 'pointer', background: i === current ? examColor : selected[i] ? (selected[i] === questions[i].correct ? '#059669' : '#F43F5E') : '#E2E8F0', transition: 'background 0.2s' }} />
          ))}
          {questions.length > 20 && <span style={{ fontSize: 11, color: '#94A3B8' }}>+{questions.length - 20}</span>}
        </div>
        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent(c => c + 1)} style={{ padding: '10px 22px', borderRadius: 100, fontSize: 14, fontWeight: 600, background: examColor, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Next →</button>
        ) : (
          <button onClick={handleFinish} style={{ padding: '10px 22px', borderRadius: 100, fontSize: 14, fontWeight: 700, background: '#F97316', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}>Finish section ✓</button>
        )}
      </div>
    </div>
  );
}

// ── Writing Section Screen ────────────────────────────────────────────────────
function WritingSectionScreen({ section, examColor, yearLevel, onComplete }) {
  const [prompt, setPrompt] = useState(null);
  const [response, setResponse] = useState('');
  const [timeLeft, setTimeLeft] = useState(section.duration * 60);
  const [loading, setLoading] = useState(true);
  const [assessing, setAssessing] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    generateWritingPrompt('narrative', yearLevel).then(p => { setPrompt(p); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [loading]);

  const handleSubmit = async () => {
    if (assessing) return;
    setAssessing(true);
    try {
      const result = response.trim() ? await assessWriting(response, prompt?.prompt || '', 'narrative', yearLevel) : null;
      onComplete({ sectionId: section.id, sectionName: section.name, writing: true, prompt, response, assessment: result });
    } catch (e) {
      onComplete({ sectionId: section.id, sectionName: section.name, writing: true, prompt, response, assessment: null });
    }
  };

  const wordCount = response.trim().split(/\s+/).filter(Boolean).length;

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 20, padding: 32 }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>✏️</div>
        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 800, color: '#0F172A' }}>Preparing writing task{dots}</div>
        <div style={{ width: 36, height: 36, border: '3px solid #EEF2FF', borderTop: `3px solid ${examColor}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (assessing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 20, padding: 32 }}>
        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 800, color: '#0F172A' }}>Assessing your writing{dots}</div>
        <div style={{ width: 36, height: 36, border: '3px solid #EEF2FF', borderTop: `3px solid ${examColor}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>{section.name}</div>
        <div style={{ background: timeLeft < 300 ? '#FFF1F2' : '#EEF2FF', color: timeLeft < 300 ? '#BE123C' : examColor, padding: '6px 14px', borderRadius: 100, fontSize: 14, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
          ⏱ {formatTime(timeLeft)}
        </div>
      </div>

      {prompt && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 2px 8px rgba(67,56,202,0.05)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>Writing prompt</div>
          <div style={{ fontSize: 15, color: '#0F172A', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>{prompt.prompt}</div>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid rgba(67,56,202,0.08)', marginBottom: 14 }}>
        <textarea value={response} onChange={e => setResponse(e.target.value)} placeholder="Start writing your response here..." style={{ width: '100%', minHeight: 280, border: 'none', outline: 'none', fontSize: 15, lineHeight: 1.8, color: '#0F172A', fontFamily: 'Inter, sans-serif', resize: 'vertical', background: 'transparent' }} />
        <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif', textAlign: 'right', marginTop: 8 }}>{wordCount} words</div>
      </div>

      <button onClick={handleSubmit} disabled={!response.trim()} style={{ width: '100%', padding: 15, borderRadius: 100, fontSize: 15, fontWeight: 700, background: response.trim() ? '#F97316' : '#E5E7EB', color: response.trim() ? '#fff' : '#9CA3AF', border: 'none', cursor: response.trim() ? 'pointer' : 'default', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}>
        Submit writing ✓
      </button>
    </div>
  );
}

// ── Results Screen ────────────────────────────────────────────────────────────
function ResultsScreen({ examKey, sections, results, reviewMode, onRetry }) {
  const exam = EXAM_CONFIGS[examKey];
  const nonWriting = results.filter(r => !r.writing);
  const totalCorrect = nonWriting.reduce((sum, r) => sum + r.correct, 0);
  const totalQs = nonWriting.reduce((sum, r) => sum + r.total, 0);
  const overallPct = totalQs > 0 ? Math.round((totalCorrect / totalQs) * 100) : 0;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 32 }}>
      {/* Overall score */}
      <div style={{ background: '#fff', borderRadius: 24, padding: 36, textAlign: 'center', marginBottom: 24, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 4px 20px rgba(67,56,202,0.08)' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: exam.lightBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 16px' }}>{exam.icon}</div>
        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 16, fontWeight: 700, color: '#94A3B8', marginBottom: 8 }}>{exam.name} Simulated Exam</div>
        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 64, fontWeight: 900, color: getBandColor(overallPct), lineHeight: 1 }}>{overallPct}%</div>
        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 28, fontWeight: 800, color: getBandColor(overallPct), marginBottom: 8 }}>{getGrade(overallPct)}</div>
        <div style={{ fontSize: 14, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>{totalCorrect} correct out of {totalQs} questions</div>
      </div>

      {/* Per section results */}
      <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>Section breakdown</div>

      {results.map((r, i) => (
        <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', marginBottom: 10, border: '1px solid rgba(67,56,202,0.06)', boxShadow: '0 1px 4px rgba(67,56,202,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: r.writing && r.assessment ? 16 : 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{r.sectionName}</div>
            {!r.writing ? (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 900, color: getBandColor(r.pct) }}>{r.pct}%</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: getBandColor(r.pct), fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{getGrade(r.pct)}</div>
                <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>{r.correct}/{r.total} correct</div>
              </div>
            ) : (
              <div style={{ background: '#EEF2FF', color: '#4338CA', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>Writing</div>
            )}
          </div>

          {/* Writing assessment */}
          {r.writing && r.assessment && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 900, color: getBandColor(Math.round(r.assessment.totalScore / r.assessment.maxTotal * 100)) }}>
                  {r.assessment.totalScore}/{r.assessment.maxTotal}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', fontFamily: 'Inter, sans-serif', maxWidth: 380, lineHeight: 1.6 }}>{r.assessment.overallFeedback}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {r.assessment.criteria.map((c, ci) => (
                  <div key={ci}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: '#374151', fontFamily: 'Inter, sans-serif' }}>{c.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: getBandColor(Math.round(c.score / c.maxScore * 100)), fontFamily: 'Inter, sans-serif' }}>{c.score}/{c.maxScore}</span>
                    </div>
                    <div style={{ height: 5, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${(c.score / c.maxScore) * 100}%`, height: '100%', background: getBandColor(Math.round(c.score / c.maxScore * 100)), borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Question review in exam mode */}
          {!r.writing && reviewMode === 'end' && r.questions && (
            <div style={{ marginTop: 14 }}>
              <details>
                <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600, color: exam.color, fontFamily: 'Inter, sans-serif', padding: '4px 0' }}>Review questions</summary>
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {r.questions.map((q, qi) => {
                    const userAnswer = r.selected[qi];
                    const correct = userAnswer === q.correct;
                    return (
                      <div key={qi} style={{ background: '#F9FAFB', borderRadius: 10, padding: '12px 14px', border: '1px solid #F3F4F6', display: 'flex', gap: 10 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: correct ? '#ECFDF5' : '#FFF1F2', color: correct ? '#059669' : '#BE123C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{correct ? '✓' : '✗'}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A', marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>Q{qi + 1}. {q.question}</div>
                          {!correct && <div style={{ fontSize: 12, color: '#BE123C', fontFamily: 'Inter, sans-serif' }}>Your answer: {userAnswer ? `${userAnswer}. ${q.options[userAnswer]}` : 'Not answered'}</div>}
                          <div style={{ fontSize: 12, color: '#059669', fontFamily: 'Inter, sans-serif' }}>Correct: {q.correct}. {q.options[q.correct]}</div>
                          {!correct && <div style={{ fontSize: 12, color: '#64748B', background: '#EEF2FF', padding: '8px 10px', borderRadius: 8, marginTop: 6, lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>💡 {q.explanation}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </details>
            </div>
          )}
        </div>
      ))}

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button onClick={onRetry} style={{ flex: 1, padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 700, background: exam.color, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: `0 4px 16px ${exam.color}30` }}>
          Try another exam →
        </button>
      </div>
      <div style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>
        Results saved to your Progress Report Dashboard
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SimulatedExamPage() {
  const { yearLevel } = useAuth();
  const [phase, setPhase] = useState('setup'); // setup | exam | done
  const [examKey, setExamKey] = useState(null);
  const [sections, setSections] = useState([]);
  const [reviewMode, setReviewMode] = useState('end');
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [results, setResults] = useState([]);

  const handleStart = (key, customSections, mode) => {
    setExamKey(key);
    setSections(customSections);
    setReviewMode(mode);
    setCurrentSectionIdx(0);
    setResults([]);
    setPhase('exam');
  };

  const handleSectionComplete = (result) => {
    const newResults = [...results, result];
    setResults(newResults);
    const next = currentSectionIdx + 1;
    if (next >= sections.length) {
      setPhase('done');
    } else {
      setCurrentSectionIdx(next);
    }
  };

  const handleRetry = () => {
    setPhase('setup');
    setExamKey(null);
    setSections([]);
    setResults([]);
    setCurrentSectionIdx(0);
  };

  const exam = examKey ? EXAM_CONFIGS[examKey] : null;
  const currentSection = sections[currentSectionIdx];

  return (
    <div style={{ minHeight: '100vh', background: '#F5F7FF' }}>
      {/* Page header */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(67,56,202,0.08)', padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎓</div>
        <div>
          <div style={{ fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif', fontSize: 20, fontWeight: 800, color: '#0F172A', letterSpacing: -0.3 }}>
            {phase === 'exam' && exam ? `${exam.name} — ${currentSection?.name || ''}` : 'Simulated Exam'}
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>
            {phase === 'exam' && exam
              ? `Section ${currentSectionIdx + 1} of ${sections.length} · Year ${yearLevel}`
              : `Full exam simulation · Year ${yearLevel}`}
          </div>
        </div>

        {/* Section progress pills */}
        {phase === 'exam' && sections.length > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {sections.map((s, i) => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: i < currentSectionIdx ? '#10B981' : i === currentSectionIdx ? (exam?.color || '#4338CA') : '#E5E7EB',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
        )}
      </div>

      {phase === 'setup' && <SetupScreen onStart={handleStart} yearLevel={yearLevel} />}

      {phase === 'exam' && currentSection && exam && (
        currentSection.type === 'break' ? (
          <BreakScreen
            section={currentSection}
            nextSection={sections[currentSectionIdx + 1]}
            examColor={exam.color}
            onFinish={() => {
              const next = currentSectionIdx + 1;
              if (next >= sections.length) setPhase('done');
              else setCurrentSectionIdx(next);
            }}
          />
        ) : currentSection.type === 'writing' ? (
          <WritingSectionScreen
            section={currentSection}
            examColor={exam.color}
            yearLevel={yearLevel}
            onComplete={handleSectionComplete}
          />
        ) : (
          <SectionQuizScreen
            section={currentSection}
            examColor={exam.color}
            reviewMode={reviewMode}
            yearLevel={yearLevel}
            onComplete={handleSectionComplete}
          />
        )
      )}

      {phase === 'done' && (
        <ResultsScreen
          examKey={examKey}
          sections={sections}
          results={results}
          reviewMode={reviewMode}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}
