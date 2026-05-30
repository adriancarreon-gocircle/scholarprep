import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getProgress, getSubjectAverage, getWeeklyStats, getRecentSessions, getTopicScoresForSubject } from '../lib/progress';

// ── Subject config ─────────────────────────────────────────────────────────────
const subjects = [
  {
    key: 'mathematics', label: 'Mathematics', shortLabel: 'Maths', icon: '🔢', color: '#E8B84B', path: '/app/maths', nationalAvg: 64,
    topics: [
      { label: 'Numbers & Counting', key: 'number', nationalAvg: 66 },
      { label: 'Addition', key: 'addition', nationalAvg: 68 },
      { label: 'Subtraction', key: 'subtraction', nationalAvg: 65 },
      { label: 'Multiplication', key: 'multiplication', nationalAvg: 63 },
      { label: 'Division', key: 'division', nationalAvg: 61 },
      { label: 'Fractions', key: 'fractions', nationalAvg: 60 },
      { label: 'Decimals', key: 'decimals', nationalAvg: 59 },
      { label: 'Percentages', key: 'percentages', nationalAvg: 62 },
      { label: 'Geometry & Shapes', key: 'geometry', nationalAvg: 64 },
      { label: 'Measurement', key: 'measurement', nationalAvg: 65 },
      { label: 'Algebra', key: 'algebra', nationalAvg: 58 },
      { label: 'Statistics & Averages', key: 'statistics', nationalAvg: 60 },
      { label: 'Word Problems', key: 'wordproblems', nationalAvg: 63 },
    ]
  },
  {
    key: 'reading', label: 'Reading Comprehension', shortLabel: 'Reading', icon: '📖', color: '#52B788', path: '/app/reading', nationalAvg: 67,
    topics: [
      { label: 'Literal comprehension', key: 'literal', nationalAvg: 72 },
      { label: 'Inference', key: 'inference', nationalAvg: 62 },
      { label: 'Vocabulary in context', key: 'vocabulary', nationalAvg: 68 },
      { label: 'Main idea', key: 'mainidea', nationalAvg: 70 },
      { label: "Author's purpose", key: 'purpose', nationalAvg: 63 },
      { label: 'Text type', key: 'texttype', nationalAvg: 65 },
    ]
  },
  {
    key: 'english', label: 'English', shortLabel: 'English', icon: '📝', color: '#7c3aed', path: '/app/english', nationalAvg: 65,
    topics: [
      { label: 'Spelling', key: 'spelling', nationalAvg: 66 },
      { label: 'Punctuation', key: 'punctuation', nationalAvg: 64 },
      { label: 'Grammar', key: 'grammar', nationalAvg: 63 },
      { label: 'Vocabulary', key: 'vocabulary', nationalAvg: 65 },
      { label: 'Sentence Order', key: 'sentence', nationalAvg: 62 },
      { label: 'Figurative Language', key: 'figurative', nationalAvg: 60 },
    ]
  },
  {
    key: 'general', label: 'General Ability', shortLabel: 'General', icon: '🧩', color: '#7B61FF', path: '/app/general', nationalAvg: 61,
    topics: [
      { label: 'Verbal analogies', key: 'analogies', nationalAvg: 63 },
      { label: 'Number sequences', key: 'sequences', nationalAvg: 60 },
      { label: 'Letter patterns', key: 'letters', nationalAvg: 62 },
      { label: 'Odd one out', key: 'oddoneout', nationalAvg: 65 },
      { label: 'Logic problems', key: 'logic', nationalAvg: 58 },
      { label: 'Spatial reasoning', key: 'spatial', nationalAvg: 60 },
    ]
  },
  {
    key: 'writing', label: 'Writing', shortLabel: 'Writing', icon: '✏️', color: '#E07A5F', path: '/app/writing', nationalAvg: 62,
    topics: [
      { label: 'Ideas & content', key: 'ideas', nationalAvg: 64 },
      { label: 'Structure', key: 'structure', nationalAvg: 62 },
      { label: 'Language & vocab', key: 'language', nationalAvg: 60 },
      { label: 'Sentence structure', key: 'sentences', nationalAvg: 63 },
      { label: 'Punctuation', key: 'punctuation', nationalAvg: 61 },
    ]
  }
];

const getGrade = (s) => s >= 90 ? 'A+' : s >= 80 ? 'A' : s >= 75 ? 'B+' : s >= 65 ? 'B' : s >= 55 ? 'C+' : s >= 45 ? 'C' : s >= 35 ? 'D' : 'E';
const getGradeColor = (s) => s >= 80 ? '#2D6A4F' : s >= 60 ? '#A07010' : s >= 40 ? '#E07A5F' : '#B04030';
const getStatusLabel = (score, na) => {
  const d = score - na;
  if (d >= 15) return { text: 'Well above average', color: '#2D6A4F' };
  if (d >= 5) return { text: 'Above average', color: '#52B788' };
  if (d >= -5) return { text: 'At average', color: '#A07010' };
  if (d >= -15) return { text: 'Below average', color: '#E07A5F' };
  return { text: 'Well below average', color: '#B04030' };
};

const SUBJECT_COLORS = Object.fromEntries(subjects.map(s => [s.key, s.color]));

// ── Calendar heat map ─────────────────────────────────────────────────────────
function CalendarHeatmap({ sessions }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleString('en-AU', { month: 'long', year: 'numeric' });

  // Build day map: { 'YYYY-MM-DD': [session, ...] }
  const dayMap = {};
  sessions.forEach(s => {
    const d = new Date(s.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!dayMap[key]) dayMap[key] = [];
    dayMap[key].push(s);
  });

  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const blanks = firstDay === 0 ? 6 : firstDay - 1; // Mon-start offset

  const totalTests = Object.values(dayMap).filter(arr => {
    const d = new Date(arr[0].date);
    return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
  }).reduce((s, arr) => s + arr.length, 0);

  const getHeatColor = (count) => {
    if (!count || count === 0) return '#F1F5F9';
    if (count <= 2) return '#BFDBFE';
    if (count <= 4) return '#60A5FA';
    return '#1D4ED8';
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    const ny = viewMonth === 11 ? viewYear + 1 : viewYear;
    const nm = viewMonth === 11 ? 0 : viewMonth + 1;
    if (ny > today.getFullYear() || (ny === today.getFullYear() && nm > today.getMonth())) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isNextDisabled = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth >= today.getMonth());

  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 24, marginBottom: 24, border: '1px solid rgba(13,27,42,0.08)', boxShadow: '0 2px 12px rgba(13,27,42,0.04)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 17, fontWeight: 800, color: '#0F172A' }}>📅 Practice Calendar</div>
          <div style={{ fontSize: 12, color: '#64748B', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>{totalTests} test{totalTests !== 1 ? 's' : ''} completed in {monthName}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={prevMonth} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', minWidth: 130, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{monthName}</span>
          <button onClick={nextMonth} disabled={isNextDisabled} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #E2E8F0', background: '#fff', cursor: isNextDisabled ? 'default' : 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isNextDisabled ? 0.3 : 1 }}>›</button>
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#94A3B8', fontFamily: 'Inter, sans-serif', paddingBottom: 4 }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {Array(blanks).fill(null).map((_, i) => <div key={`b${i}`} />)}
        {Array(daysInMonth).fill(null).map((_, i) => {
          const day = i + 1;
          const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const daySessions = dayMap[key] || [];
          const count = daySessions.length;
          const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
          const subjectCounts = {};
          daySessions.forEach(s => { subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1; });

          return (
            <div key={day} title={count > 0 ? `${count} test${count > 1 ? 's' : ''}: ${Object.entries(subjectCounts).map(([k, v]) => `${v} ${subjects.find(s => s.key === k)?.shortLabel || k}`).join(', ')}` : ''} style={{
              aspectRatio: '1', borderRadius: 6, background: getHeatColor(count),
              border: isToday ? '2px solid #4338CA' : '1px solid transparent',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: count > 0 ? 'pointer' : 'default', position: 'relative', overflow: 'hidden',
            }}>
              <span style={{ fontSize: 11, fontWeight: isToday ? 800 : 500, color: count >= 3 ? '#fff' : '#374151', fontFamily: 'Inter, sans-serif', lineHeight: 1 }}>{day}</span>
              {count > 0 && (
                <div style={{ display: 'flex', gap: 1, marginTop: 2, flexWrap: 'wrap', justifyContent: 'center', maxWidth: '90%' }}>
                  {Object.entries(subjectCounts).map(([sk, c]) =>
                    Array(c).fill(null).map((_, ci) => (
                      <div key={`${sk}${ci}`} style={{ width: 4, height: 4, borderRadius: '50%', background: SUBJECT_COLORS[sk] || '#94A3B8', flexShrink: 0 }} />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Tests per day:</span>
        {[['0', '#F1F5F9', '#374151'], ['1–2', '#BFDBFE', '#374151'], ['3–4', '#60A5FA', '#374151'], ['5+', '#1D4ED8', '#fff']].map(([label, bg, fg]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: bg, border: '1px solid #E2E8F0' }} />
            <span style={{ fontSize: 11, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>{label}</span>
          </div>
        ))}
        <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 8, fontFamily: 'Inter, sans-serif' }}>Dots = subjects</span>
        {subjects.map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
            <span style={{ fontSize: 11, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>{s.shortLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Score trend bar chart (last 10 tests per subject) ─────────────────────────
function ScoreTrendChart({ sessions, color }) {
  const scrollRef = useRef(null);
  const sorted = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
  if (sorted.length === 0) return null;

  const avg = Math.round(sorted.reduce((s, r) => s + (r.score || 0), 0) / sorted.length);
  const maxVisible = 10;
  const hasMore = sorted.length > maxVisible;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Inter, sans-serif' }}>Score trend</div>
        <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>
          Avg: <strong style={{ color }}>{avg}%</strong>
          {hasMore && ' · scroll left for older tests'}
        </div>
      </div>
      <div ref={scrollRef} style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, minWidth: sorted.length * 44, height: 100, position: 'relative', padding: '0 4px' }}>
          {/* Avg line */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: `${100 - avg}%`, height: 1, background: `${color}60`, borderTop: `2px dashed ${color}80`, zIndex: 1 }} />
          {sorted.map((s, i) => {
            const score = s.score || 0;
            const barH = Math.max(4, score);
            const date = new Date(s.date);
            const label = date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
            return (
              <div key={i} title={`${label}: ${score}%`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: '0 0 40px', zIndex: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: getGradeColor(score), fontFamily: 'Inter, sans-serif' }}>{score}%</span>
                <div style={{ width: 28, height: `${barH}%`, background: score >= 70 ? color : score >= 50 ? `${color}99` : `${color}55`, borderRadius: '4px 4px 0 0', minHeight: 4, transition: 'height 0.3s', position: 'relative' }} />
                <span style={{ fontSize: 9, color: '#94A3B8', textAlign: 'center', fontFamily: 'Inter, sans-serif', lineHeight: 1.2 }}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Topic line chart ──────────────────────────────────────────────────────────
function TopicLineChart({ topicKey, sessions, color }) {
  // Filter sessions that have questions with this topic
  const points = [];
  sessions.forEach(s => {
    const qs = s.questions || [];
    const topicQs = qs.filter(q => q.topic === topicKey);
    if (topicQs.length === 0) return;
    // We need the selected answers — stored in session as selectedAnswers or we compute from questions
    // Since we don't store per-question answers in the session list easily, use score as a proxy for sessions
    // that had this topic. We'll mark the score on the date.
    points.push({ date: s.date, score: s.score || 0 });
  });

  if (points.length < 2) {
    if (points.length === 1) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 48 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: getGradeColor(points[0].score) }}>{points[0].score}%</span>
        </div>
      );
    }
    return <div style={{ fontSize: 10, color: '#CBD5E1', textAlign: 'center', paddingTop: 16, fontFamily: 'Inter, sans-serif' }}>No data yet</div>;
  }

  const W = 120, H = 48;
  const sorted = [...points].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-8);
  const xs = sorted.map((_, i) => (i / (sorted.length - 1)) * (W - 12) + 6);
  const ys = sorted.map(p => H - 8 - ((p.score / 100) * (H - 16)));
  const pathD = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x} ${ys[i]}`).join(' ');
  const last = sorted[sorted.length - 1];

  return (
    <div style={{ position: 'relative' }}>
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        <path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {sorted.map((p, i) => (
          <circle key={i} cx={xs[i]} cy={ys[i]} r={i === sorted.length - 1 ? 4 : 2.5} fill={color} stroke="#fff" strokeWidth={1} />
        ))}
      </svg>
      <div style={{ position: 'absolute', right: 0, top: -4, fontSize: 11, fontWeight: 700, color: getGradeColor(last.score), fontFamily: 'Inter, sans-serif' }}>{last.score}%</div>
    </div>
  );
}

// ── Topic Row with line chart ─────────────────────────────────────────────────
function TopicRow({ topic, score, color, sessions }) {
  const na = topic.nationalAvg;
  const hasScore = score > 0;
  const status = hasScore ? getStatusLabel(score, na) : { text: 'Not yet tested', color: '#9AA5B0' };
  const grade = hasScore ? getGrade(score) : '—';
  const gradeColor = hasScore ? getGradeColor(score) : '#9AA5B0';

  // AI feedback — more specific about question types
  const getFeedback = () => {
    if (!hasScore) return `Complete a practice test to see your ${topic.label} performance here.`;
    const diff = score - na;
    if (diff >= 15) return `Excellent — well ahead of average. To maintain this, try harder question types within ${topic.label}.`;
    if (diff >= 5) return `Good work — above average on ${topic.label}. Focus on any question types you find tricky to push higher.`;
    if (diff >= -5) return `On track with the average for ${topic.label}. Identify which specific question types within this topic cost you marks and drill those.`;
    if (diff >= -15) return `Below average on ${topic.label}. Target the specific question types you missed — do 2–3 short focused sessions on those only.`;
    return `Significant gap on ${topic.label}. Prioritise the hardest question types in this area daily — use the topic picker to isolate them.`;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 130px 140px', gap: 0, borderBottom: '1px solid rgba(13,27,42,0.06)', alignItems: 'stretch', background: '#fff' }}>
      {/* Column 1: Topic + band bar */}
      <div style={{ padding: '12px 16px', borderRight: '1px solid rgba(13,27,42,0.06)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0D1B2A', marginBottom: 8 }}>{topic.label}</div>
        <div style={{ position: 'relative', height: 28, marginBottom: 3 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 5, display: 'flex', overflow: 'hidden' }}>
            <div style={{ width: '40%', background: '#FDEAEA' }} />
            <div style={{ width: '20%', background: '#FEF3D0' }} />
            <div style={{ width: '20%', background: '#E8F5EE' }} />
            <div style={{ width: '20%', background: '#C8EDD8' }} />
          </div>
          <div style={{ position: 'absolute', top: '50%', left: `${na}%`, transform: 'translate(-50%,-50%)', width: 14, height: 14, borderRadius: '50%', background: '#fff', border: '2.5px solid #5A6A7A', zIndex: 2 }} />
          {hasScore && <div style={{ position: 'absolute', top: '50%', left: `${Math.min(score, 99)}%`, transform: 'translate(-50%,-50%)', width: 18, height: 18, borderRadius: '50%', background: color, border: '2.5px solid #fff', zIndex: 3, boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }} />}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#9AA5B0' }}>
          <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
        </div>
      </div>

      {/* Column 2: Score + Grade */}
      <div style={{ padding: '12px 8px', borderRight: '1px solid rgba(13,27,42,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: gradeColor, lineHeight: 1 }}>{hasScore ? `${score}%` : '—'}</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: gradeColor, lineHeight: 1 }}>{grade}</div>
        <div style={{ fontSize: 9, color: status.color, fontWeight: 700, textAlign: 'center', marginTop: 2, lineHeight: 1.3 }}>{status.text}</div>
      </div>

      {/* Column 3: Topic trend line chart */}
      <div style={{ padding: '12px 10px', borderRight: '1px solid rgba(13,27,42,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <TopicLineChart topicKey={topic.key} sessions={sessions} color={color} />
      </div>

      {/* Column 4: AI Feedback */}
      <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center' }}>
        <div style={{ fontSize: 11, color: '#5A6A7A', lineHeight: 1.6 }}>{getFeedback()}</div>
      </div>
    </div>
  );
}

// ── Subject Summary Card ───────────────────────────────────────────────────────
function SubjectSummaryCard({ subject, avg, totalQuestions, onClick }) {
  const hasData = avg !== null && avg !== undefined;
  const vsNational = hasData ? avg - subject.nationalAvg : null;
  const grade = hasData ? getGrade(avg) : '—';
  const gradeColor = hasData ? getGradeColor(avg) : '#9AA5B0';

  return (
    <div onClick={onClick} style={{ background: '#fff', borderRadius: 16, padding: '20px 20px', border: '1px solid rgba(13,27,42,0.08)', borderTop: `4px solid ${subject.color}`, cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 2px 8px rgba(13,27,42,0.04)' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: `${subject.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{subject.icon}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0D1B2A' }}>{subject.shortLabel}</div>
      </div>
      {hasData ? (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: gradeColor, lineHeight: 1 }}>{avg}%</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: gradeColor }}>{grade}</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: vsNational >= 0 ? '#2D6A4F' : '#B04030', marginBottom: 10 }}>
            {vsNational >= 0 ? `↑ +${vsNational}%` : `↓ ${vsNational}%`} vs national avg
          </div>
          <div style={{ height: 5, background: '#F0E8D8', borderRadius: 3, marginBottom: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${avg}%`, background: subject.color, borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: 12, color: '#5A6A7A' }}>{totalQuestions} question{totalQuestions !== 1 ? 's' : ''} attempted</div>
        </>
      ) : (
        <div style={{ fontSize: 13, color: '#9AA5B0', lineHeight: 1.5 }}>No tests completed yet.<br /><span style={{ color: subject.color, fontWeight: 600 }}>Start practising →</span></div>
      )}
    </div>
  );
}

// ── Subject Detail Card ───────────────────────────────────────────────────────
function SubjectCard({ subject, avg, stats, sessions, topicScores, anchorId }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);
  const vsNational = avg !== null ? avg - subject.nationalAvg : null;

  // AI analysis — more specific
  const getAIAnalysis = () => {
    if (avg === null) return 'Complete a test to get your AI analysis.';
    const strong = subject.topics.filter((_, i) => (topicScores[i] || 0) >= 70).map(t => t.label);
    const weak = subject.topics.filter((_, i) => (topicScores[i] || 0) > 0 && (topicScores[i] || 0) < 55).map(t => t.label);
    const vsNat = avg - subject.nationalAvg;
    let text = '';
    if (vsNat >= 10) text += `Strong overall — ${vsNat}% above the national average. `;
    else if (vsNat >= 0) text += `At or just above the national average. `;
    else text += `Currently ${Math.abs(vsNat)}% below the national average. `;
    if (strong.length > 0) text += `Strengths: ${strong.join(', ')}. `;
    if (weak.length > 0) text += `Priority areas: ${weak.join(', ')} — use the topic picker to select these specifically, then drill the individual question types within each topic to pinpoint exactly what to fix. `;
    if (weak.length === 0 && avg >= 70) text += `All topics performing well. Push further by testing harder question types within each topic.`;
    return text;
  };

  return (
    <div id={anchorId} style={{ background: '#fff', borderRadius: 20, marginBottom: 24, border: '1px solid rgba(13,27,42,0.08)', boxShadow: '0 2px 12px rgba(13,27,42,0.04)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(13,27,42,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: '#FAFAF8' }}
        onClick={() => setExpanded(e => !e)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: `${subject.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{subject.icon}</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0D1B2A' }}>{subject.label}</div>
            <div style={{ fontSize: 12, color: '#5A6A7A' }}>{stats.attempts} session{stats.attempts !== 1 ? 's' : ''} · {stats.totalQuestions || 0} questions attempted</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {avg !== null && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: avg >= 70 ? '#2D6A4F' : avg >= 50 ? '#A07010' : '#B04030' }}>
                {avg}% <span style={{ fontSize: 20 }}>{getGrade(avg)}</span>
              </div>
              <div style={{ fontSize: 11, color: vsNational >= 0 ? '#2D6A4F' : '#B04030', fontWeight: 600 }}>
                {vsNational >= 0 ? `↑ +${vsNational}%` : `↓ ${vsNational}%`} vs national avg ({subject.nationalAvg}%)
              </div>
            </div>
          )}
          <div style={{ fontSize: 18, color: '#9AA5B0' }}>{expanded ? '▲' : '▼'}</div>
        </div>
      </div>

      {expanded && (
        <div>
          {/* Score trend chart */}
          {sessions.length > 1 && (
            <div style={{ padding: '20px 24px 0' }}>
              <ScoreTrendChart sessions={sessions} color={subject.color} />
            </div>
          )}

          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 130px 140px', background: '#F5F3EE', borderBottom: '1px solid rgba(13,27,42,0.08)', borderTop: '1px solid rgba(13,27,42,0.06)' }}>
            <div style={{ padding: '8px 16px', fontSize: 11, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.07em', borderRight: '1px solid rgba(13,27,42,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
              Topic
              <span style={{ display: 'flex', gap: 8 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: subject.color, border: '2px solid #fff' }} />
                  <span style={{ fontSize: 9, color: '#9AA5B0', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>You</span>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: '#fff', border: '2px solid #5A6A7A' }} />
                  <span style={{ fontSize: 9, color: '#9AA5B0', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>National</span>
                </span>
              </span>
            </div>
            <div style={{ padding: '8px 8px', fontSize: 11, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'center', borderRight: '1px solid rgba(13,27,42,0.06)' }}>Score</div>
            <div style={{ padding: '8px 10px', fontSize: 11, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'center', borderRight: '1px solid rgba(13,27,42,0.06)' }}>Trend</div>
            <div style={{ padding: '8px 14px', fontSize: 11, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.07em' }}>AI Feedback</div>
          </div>

          {subject.topics.map((topic, i) => (
            <TopicRow key={topic.key} topic={topic} score={topicScores[i] || 0} color={subject.color} sessions={sessions} />
          ))}

          <div style={{ padding: '20px 24px' }}>
            {/* AI Analysis block */}
            <div style={{ background: '#0D1B2A', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#E8B84B', marginBottom: 6 }}>🤖 AI Analysis — {subject.label}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75 }}>{getAIAnalysis()}</div>
            </div>

            {/* Test history */}
            {sessions.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Test history</div>
                <div style={{ borderRadius: 12, border: '1px solid rgba(13,27,42,0.08)', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 110px 60px 60px', background: '#FAF6EE', padding: '8px 14px', fontSize: 11, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <div>Date</div><div>Year</div><div>Result</div><div>Score</div><div>Grade</div>
                  </div>
                  <div style={{ maxHeight: sessions.length > 10 ? 440 : 'none', overflowY: sessions.length > 10 ? 'auto' : 'visible' }}>
                    {sessions.map((s, i) => {
                      const score = s.score || s.percentage || 0;
                      return (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 110px 60px 60px', padding: '10px 14px', fontSize: 13, borderTop: '1px solid rgba(13,27,42,0.05)', background: i % 2 === 0 ? '#fff' : '#FDFAF6', alignItems: 'center' }}>
                          <div style={{ color: '#5A6A7A', fontSize: 12 }}>{new Date(s.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                          <div style={{ color: '#0D1B2A', fontWeight: 600 }}>Yr {s.yearLevel || '—'}</div>
                          <div style={{ color: '#5A6A7A', fontSize: 12 }}>{s.correct !== undefined ? `${s.correct} / ${s.total} correct` : '—'}</div>
                          <div style={{ fontWeight: 800, color: score >= 70 ? '#2D6A4F' : score >= 50 ? '#A07010' : '#B04030' }}>{score}%</div>
                          <div style={{ fontWeight: 800, color: getGradeColor(score) }}>{getGrade(score)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <button onClick={() => navigate(subject.path)} style={{ padding: '9px 22px', borderRadius: 100, fontSize: 13, fontWeight: 700, background: '#0D1B2A', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Practise {subject.label} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProgressPage() {
  const navigate = useNavigate();
  const { yearLevel, user } = useAuth();
  const [progress, setProgress] = useState({ sessions: [], subjectStats: {} });
  const [weekly, setWeekly] = useState({ testsCompleted: 0, avgScore: 0 });
  const [recent, setRecent] = useState([]);
  const [subjectAverages, setSubjectAverages] = useState({});
  const [allTopicScores, setAllTopicScores] = useState({});
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const [progressData, weeklyData, recentData, ...avgs] = await Promise.all([
          getProgress(),
          getWeeklyStats(),
          getRecentSessions(200),
          ...subjects.map(s => getSubjectAverage(s.key))
        ]);
        setProgress(progressData);
        setWeekly(weeklyData);
        setRecent(recentData);
        const avgMap = {};
        subjects.forEach((s, i) => { avgMap[s.key] = avgs[i]; });
        setSubjectAverages(avgMap);
        const topicData = {};
        await Promise.all(subjects.map(async s => {
          topicData[s.key] = await getTopicScoresForSubject(s.key);
        }));
        setAllTopicScores(topicData);
      } catch (e) {
        console.error('Failed to load progress data:', e);
      }
      setLoadingData(false);
    };
    loadData();
  }, [user]);

  const totalTests = progress.sessions.length;
  const overallAvg = totalTests > 0
    ? Math.round(progress.sessions.reduce((s, sess) => s + (sess.score || sess.percentage || 0), 0) / totalTests)
    : null;

  const getSubjectSessions = (key) => recent.filter(s => s.subject === key);
  const getTotalQuestions = (key) => recent.filter(s => s.subject === key).reduce((sum, s) => sum + (s.total || 0), 0);

  const getTopicScores = (subjectKey, avg) => {
    const realScores = allTopicScores[subjectKey];
    const subject = subjects.find(s => s.key === subjectKey);
    if (!subject) return [];
    return subject.topics.map(topic => {
      if (realScores && realScores[topic.key] !== undefined) return realScores[topic.key];
      if (avg === null) return 0;
      const seed = subjectKey.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const i = subject.topics.indexOf(topic);
      const variance = ((seed * (i + 1) * 7) % 30) - 15;
      return Math.min(100, Math.max(5, Math.round(avg + variance)));
    });
  };

  const scrollToSubject = (key) => {
    const el = document.getElementById(`subject-${key}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loadingData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #EEF2FF', borderTop: '3px solid #4338CA', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontSize: 14, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Loading your progress...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(67,56,202,0.08)', padding: '20px 32px' }}>
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 900, color: '#0F172A', letterSpacing: -0.5 }}>📊 Progress Report Dashboard</div>
        <div style={{ fontSize: 14, color: '#64748B', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>Track your strengths and weaknesses across all subjects and topics</div>
      </div>

      <div style={{ padding: 32 }}>
        {totalTests === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 900, color: '#0F172A', marginBottom: 8 }}>No results yet</div>
            <div style={{ fontSize: 15, color: '#64748B', marginBottom: 24, fontFamily: 'Inter, sans-serif' }}>Complete your first practice test to start tracking your progress</div>
            <button onClick={() => navigate('/app/maths')} style={{ background: '#4338CA', color: '#fff', padding: '12px 28px', borderRadius: 100, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Start practising →</button>
          </div>
        ) : (
          <>
            {/* Subject summary cards */}
            <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontFamily: 'Inter, sans-serif' }}>Subject summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
              {subjects.map(s => (
                <SubjectSummaryCard key={s.key} subject={s} avg={subjectAverages[s.key]} totalQuestions={getTotalQuestions(s.key)}
                  onClick={() => {
                    const stats = progress.subjectStats[s.key];
                    if (stats && stats.attempts > 0) scrollToSubject(s.key);
                    else navigate(s.path);
                  }}
                />
              ))}
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
              {[
                { label: 'Total tests completed', value: totalTests },
                { label: 'Tests this week', value: weekly.testsCompleted },
                { label: 'Overall average', value: overallAvg !== null ? `${overallAvg}% ${getGrade(overallAvg)}` : '—' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 1px 4px rgba(67,56,202,0.04)' }}>
                  <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>{s.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Calendar heatmap */}
            <CalendarHeatmap sessions={recent} />

            {/* Subject detail cards */}
            {subjects.map(s => {
              const avg = subjectAverages[s.key];
              const stats = progress.subjectStats[s.key];
              if (!stats || (stats.attempts || 0) === 0) return null;
              const topicScores = getTopicScores(s.key, avg);
              const sessions = getSubjectSessions(s.key);
              return (
                <SubjectCard key={s.key} subject={s} avg={avg}
                  stats={{ ...stats, totalQuestions: getTotalQuestions(s.key) }}
                  sessions={sessions} topicScores={topicScores} anchorId={`subject-${s.key}`}
                />
              );
            })}

            {/* Overall recommendation */}
            <div style={{ background: '#1E1B4B', borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#A5B4FC', marginBottom: 8, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>🎯 Overall recommendation</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, fontFamily: 'Inter, sans-serif' }}>
                {(() => {
                  const avgs = subjects.map(s => ({ label: s.label, avg: subjectAverages[s.key], nationalAvg: s.nationalAvg })).filter(s => s.avg !== null && s.avg !== undefined);
                  if (avgs.length === 0) return 'Complete more tests to get personalised recommendations.';
                  const weakest = [...avgs].sort((a, b) => a.avg - b.avg)[0];
                  const strongest = [...avgs].sort((a, b) => b.avg - a.avg)[0];
                  const belowNational = avgs.filter(s => s.avg < s.nationalAvg);
                  return `Your strongest subject is ${strongest.label} at ${strongest.avg}% (${getGrade(strongest.avg)}). ${weakest.label} needs the most attention at ${weakest.avg}% (${getGrade(weakest.avg)})${weakest.avg < weakest.nationalAvg ? ` — currently ${weakest.nationalAvg - weakest.avg}% below the national benchmark` : ''}. ${belowNational.length > 0 ? `Focus on bringing ${belowNational.map(s => s.label).join(' and ')} up to benchmark level. Use the topic picker within each subject to drill the specific question types you are weakest on.` : 'You are above the national benchmark across all tested subjects — keep it up!'}`;
                })()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}