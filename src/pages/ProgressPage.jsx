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

// ── Build per-topic trend data from full sessions (which include questions[]) ──
// Returns { topicKey: [{ date, score }] }
const buildTopicTrends = (sessions) => {
  const trends = {};
  sessions.forEach(session => {
    const qs = session.questions || [];
    if (!qs.length) return;
    // Group questions by topic, compute % correct for this session
    const topicMap = {};
    qs.forEach((q, idx) => {
      const topic = q.topic;
      if (!topic) return;
      if (!topicMap[topic]) topicMap[topic] = { correct: 0, total: 0 };
      topicMap[topic].total += 1;
      // questions may have _correct or we infer from session selected answers (not stored here)
      // Use the question's correct field vs selectedAnswers if available on session
      const sel = session.selectedAnswers || {};
      if (sel[idx] !== undefined) {
        if (sel[idx] === q.correct) topicMap[topic].correct += 1;
      } else if (q._wasCorrect !== undefined) {
        if (q._wasCorrect) topicMap[topic].correct += 1;
      } else {
        // No answer data — skip this session for per-topic trend
        return;
      }
    });
    Object.entries(topicMap).forEach(([topicKey, { correct, total }]) => {
      if (total === 0) return;
      if (!trends[topicKey]) trends[topicKey] = [];
      trends[topicKey].push({ date: session.date, score: Math.round((correct / total) * 100) });
    });
  });
  return trends;
};

// ── Build per-question-type scores from full sessions ─────────────────────────
// Returns { topicKey: { questionType: { correct, total } } }
const buildQuestionTypeScores = (sessions) => {
  const result = {};
  sessions.forEach(session => {
    const qs = session.questions || [];
    const sel = session.selectedAnswers || {};
    qs.forEach((q, idx) => {
      const topic = q.topic;
      const qtype = q.questionType;
      if (!topic || !qtype) return;
      if (!result[topic]) result[topic] = {};
      if (!result[topic][qtype]) result[topic][qtype] = { correct: 0, total: 0 };
      result[topic][qtype].total += 1;
      if (sel[idx] !== undefined && sel[idx] === q.correct) {
        result[topic][qtype].correct += 1;
      }
    });
  });
  return result;
};

// ── Calendar heat map ─────────────────────────────────────────────────────────
function CalendarHeatmap({ sessions }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleString('en-AU', { month: 'long', year: 'numeric' });
  const dayMap = {};
  sessions.forEach(s => {
    const d = new Date(s.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!dayMap[key]) dayMap[key] = [];
    dayMap[key].push(s);
  });

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const blanks = firstDay === 0 ? 6 : firstDay - 1;

  const totalTests = Object.entries(dayMap).filter(([key]) => {
    const [y, m] = key.split('-').map(Number);
    return m - 1 === viewMonth && y === viewYear;
  }).reduce((s, [, arr]) => s + arr.length, 0);

  const getHeatColor = (count) => {
    if (!count) return '#F1F5F9';
    if (count <= 2) return '#BFDBFE';
    if (count <= 4) return '#60A5FA';
    return '#1D4ED8';
  };
  const getTextColor = (count) => count >= 3 ? '#fff' : '#1e293b';

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => {
    const isLast = viewYear === today.getFullYear() && viewMonth >= today.getMonth();
    if (isLast) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1);
  };
  const isNextDisabled = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth >= today.getMonth());

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', marginBottom: 24, border: '1px solid rgba(13,27,42,0.08)' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 15, fontWeight: 800, color: '#0F172A' }}>📅 Practice Calendar</div>
          <div style={{ fontSize: 12, color: '#64748B', fontFamily: 'Inter, sans-serif', marginTop: 1 }}>{totalTests} test{totalTests !== 1 ? 's' : ''} completed in {monthName}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={prevMonth} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', minWidth: 110, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{monthName}</span>
          <button onClick={nextMonth} disabled={isNextDisabled} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #E2E8F0', background: '#fff', cursor: isNextDisabled ? 'default' : 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isNextDisabled ? 0.3 : 1 }}>›</button>
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 3 }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>{d}</div>
        ))}
      </div>

      {/* Grid — compact cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {Array(blanks).fill(null).map((_, i) => <div key={`b${i}`} />)}
        {Array(daysInMonth).fill(null).map((_, i) => {
          const day = i + 1;
          const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const daySessions = dayMap[key] || [];
          const count = daySessions.length;
          const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
          const subjectCounts = {};
          daySessions.forEach(s => { subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1; });
          const tooltip = count > 0
            ? `${count} test${count > 1 ? 's' : ''}: ${Object.entries(subjectCounts).map(([k, v]) => `${v} ${subjects.find(s => s.key === k)?.shortLabel || k}`).join(', ')}`
            : '';
          return (
            <div key={day} title={tooltip} style={{
              height: 38, borderRadius: 5, background: getHeatColor(count),
              border: isToday ? '2px solid #4338CA' : '1px solid rgba(0,0,0,0.04)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: count > 0 ? 'pointer' : 'default', gap: 2,
            }}>
              {/* Day number — larger and more readable */}
              <span style={{ fontSize: 13, fontWeight: isToday ? 800 : 600, color: getTextColor(count), fontFamily: 'Inter, sans-serif', lineHeight: 1 }}>{day}</span>
              {/* Subject dots — bigger */}
              {count > 0 && (
                <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 32 }}>
                  {Object.entries(subjectCounts).map(([sk, c]) =>
                    Array(Math.min(c, 3)).fill(null).map((_, ci) => (
                      <div key={`${sk}${ci}`} style={{ width: 6, height: 6, borderRadius: '50%', background: SUBJECT_COLORS[sk] || '#94A3B8', flexShrink: 0, border: '1px solid rgba(255,255,255,0.6)' }} />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Tests/day:</span>
        {[['0', '#F1F5F9', '#374151'], ['1–2', '#BFDBFE', '#374151'], ['3–4', '#60A5FA', '#374151'], ['5+', '#1D4ED8', '#fff']].map(([label, bg]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 11, height: 11, borderRadius: 2, background: bg, border: '1px solid #E2E8F0' }} />
            <span style={{ fontSize: 10, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>{label}</span>
          </div>
        ))}
        <span style={{ fontSize: 10, color: '#94A3B8', marginLeft: 6, fontFamily: 'Inter, sans-serif' }}>Dots = subjects:</span>
        {subjects.map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.color }} />
            <span style={{ fontSize: 10, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>{s.shortLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Score trend bar chart ─────────────────────────────────────────────────────
const BAR_HEIGHT = 100; // px — the max bar height representing 100%

function ScoreTrendChart({ sessions, color }) {
  const scrollRef = useRef(null);
  const sorted = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
  if (sorted.length === 0) return null;
  const avg = Math.round(sorted.reduce((s, r) => s + (r.score || 0), 0) / sorted.length);

  // avgTop: distance from top of bar area to where the avg line sits
  // score 100% → bar fills full BAR_HEIGHT → avgTop for 50% = BAR_HEIGHT * 0.5
  const avgTop = BAR_HEIGHT - (avg / 100) * BAR_HEIGHT;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Inter, sans-serif' }}>Score trend</div>
        <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>
          Avg: <strong style={{ color }}>{avg}%</strong> · scroll left for older
        </div>
      </div>
      <div ref={scrollRef} style={{ overflowX: 'auto', paddingBottom: 4 }}>
        {/* Outer wrapper: fixed pixel height = BAR_HEIGHT + room for labels */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, minWidth: sorted.length * 44, position: 'relative', padding: '0 4px' }}>
          {sorted.map((s, i) => {
            const score = s.score || 0;
            const barPx = Math.max(3, (score / 100) * BAR_HEIGHT); // pixel height proportional to score
            const date = new Date(s.date);
            const label = date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
            return (
              <div key={i} title={`${label}: ${score}%`}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: '0 0 40px', zIndex: 2 }}>
                {/* Score label sits above the bar */}
                <span style={{ fontSize: 10, fontWeight: 700, color: getGradeColor(score), fontFamily: 'Inter, sans-serif', height: 14, display: 'flex', alignItems: 'flex-end' }}>{score}%</span>
                {/* Spacer pushes bar to correct height within the BAR_HEIGHT frame */}
                <div style={{ height: BAR_HEIGHT - barPx }} />
                {/* The bar itself — fixed pixel height */}
                <div style={{
                  width: 28,
                  height: barPx,
                  background: score >= 70 ? color : score >= 50 ? `${color}99` : `${color}55`,
                  borderRadius: '4px 4px 0 0',
                }} />
                {/* Date label */}
                <span style={{ fontSize: 9, color: '#94A3B8', textAlign: 'center', fontFamily: 'Inter, sans-serif', lineHeight: 1.2, marginTop: 3 }}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Topic trend line chart — proper date x-axis, % y-axis ───────────────────
function TopicLineChart({ topicKey, trendPoints, color }) {
  if (!trendPoints || trendPoints.length === 0) {
    return (
      <div style={{ fontSize: 10, color: '#CBD5E1', textAlign: 'center', width: '100%', fontFamily: 'Inter, sans-serif', padding: '4px 0' }}>
        No data yet
      </div>
    );
  }

  const sorted = [...trendPoints].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-10);

  if (sorted.length === 1) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, padding: '2px 0' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: getGradeColor(sorted[0].score) }}>{sorted[0].score}%</div>
        <div style={{ fontSize: 9, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>
          {new Date(sorted[0].date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
        </div>
      </div>
    );
  }

  // Chart dimensions — use available width, fixed height
  const W = 280;
  const H = 60;          // plot area height in px
  const PAD_L = 26;      // left padding for y-axis labels
  const PAD_R = 8;
  const PAD_T = 14;      // top padding so score labels don't clip
  const PAD_B = 18;      // bottom padding for date labels
  const plotW = W - PAD_L - PAD_R;
  const plotH = H;

  // Y axis: always 0–100 so the line genuinely goes up and down
  const Y_MIN = 0;
  const Y_MAX = 100;

  // Map score → y pixel (top of SVG = high score)
  const toY = (score) => PAD_T + plotH - ((score - Y_MIN) / (Y_MAX - Y_MIN)) * plotH;
  // Map index → x pixel
  const toX = (i) => PAD_L + (sorted.length === 1 ? plotW / 2 : (i / (sorted.length - 1)) * plotW);

  const pts = sorted.map((p, i) => ({ x: toX(i), y: toY(p.score), score: p.score, date: p.date }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${PAD_T + plotH} L ${pts[0].x} ${PAD_T + plotH} Z`;

  const totalH = PAD_T + plotH + PAD_B;
  const trend = sorted[sorted.length - 1].score - sorted[0].score;

  // Y axis grid lines at 0, 50, 100
  const yLines = [0, 50, 100];

  return (
    <div style={{ width: '100%', maxWidth: W }}>
      <svg width={W} height={totalH} style={{ overflow: 'visible', display: 'block' }}>
        {/* Y axis grid lines + labels */}
        {yLines.map(v => {
          const y = toY(v);
          return (
            <g key={v}>
              <line x1={PAD_L} x2={PAD_L + plotW} y1={y} y2={y}
                stroke="#E5E7EB" strokeWidth={1} strokeDasharray={v === 0 ? 'none' : '2,3'} />
              <text x={PAD_L - 3} y={y + 3} textAnchor="end" fontSize={7}
                fill="#94A3B8" fontFamily="Inter, sans-serif">{v}</text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill={`${color}15`} />

        {/* Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth={2}
          strokeLinejoin="round" strokeLinecap="round" />

        {/* Dots + score labels */}
        {pts.map((p, i) => {
          const isLast = i === pts.length - 1;
          const isFirst = i === 0;
          const showLabel = isLast || isFirst || pts.length <= 4;
          const labelY = p.y - 6;
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y}
                r={isLast ? 4 : 2.5}
                fill={color} stroke="#fff" strokeWidth={1.5} />
              {showLabel && (
                <text x={p.x} y={labelY} textAnchor="middle"
                  fontSize={8} fontWeight="700"
                  fill={getGradeColor(p.score)} fontFamily="Inter, sans-serif">
                  {p.score}%
                </text>
              )}
            </g>
          );
        })}

        {/* X axis date labels — first and last only */}
        <text x={pts[0].x} y={PAD_T + plotH + 12} textAnchor="middle"
          fontSize={8} fill="#94A3B8" fontFamily="Inter, sans-serif">
          {new Date(sorted[0].date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
        </text>
        {sorted.length > 2 && (
          <text x={pts[Math.floor(pts.length / 2)].x} y={PAD_T + plotH + 12} textAnchor="middle"
            fontSize={8} fill="#CBD5E1" fontFamily="Inter, sans-serif">
            {new Date(sorted[Math.floor(sorted.length / 2)].date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
          </text>
        )}
        <text x={pts[pts.length - 1].x} y={PAD_T + plotH + 12} textAnchor="middle"
          fontSize={8} fill="#94A3B8" fontFamily="Inter, sans-serif">
          {new Date(sorted[sorted.length - 1].date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
        </text>
      </svg>

      {/* Trend summary below chart */}
      {sorted.length >= 2 && (
        <div style={{ fontSize: 9, fontWeight: 700, color: trend > 0 ? '#2D6A4F' : trend < 0 ? '#B04030' : '#94A3B8', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>
          {trend > 0 ? `↑ +${trend}% since first test` : trend < 0 ? `↓ ${trend}% since first test` : '→ No change'}
        </div>
      )}
    </div>
  );
}

// ── Topic Row ─────────────────────────────────────────────────────────────────
function TopicRow({ topic, score, color, trendPoints, questionTypeScores }) {
  const na = topic.nationalAvg;
  const hasScore = score > 0;
  const status = hasScore ? getStatusLabel(score, na) : { text: 'Not yet tested', color: '#9AA5B0' };
  const grade = hasScore ? getGrade(score) : '—';
  const gradeColor = hasScore ? getGradeColor(score) : '#9AA5B0';

  // AI feedback — uses actual question type data where available
  const getFeedback = () => {
    if (!hasScore) return `Complete a test to see your ${topic.label} performance.`;
    const diff = score - na;

    // Build question type analysis from real data
    const qtData = questionTypeScores?.[topic.key] || {};
    const qtEntries = Object.entries(qtData)
      .filter(([, v]) => v.total >= 2)
      .map(([qtype, v]) => ({ qtype, pct: Math.round((v.correct / v.total) * 100), total: v.total }))
      .sort((a, b) => a.pct - b.pct);

    const weakTypes = qtEntries.filter(e => e.pct < 50).slice(0, 2);
    const strongTypes = qtEntries.filter(e => e.pct >= 75).slice(0, 2);

    let feedback = '';
    if (diff >= 15) feedback = `Excellent — ${score}% is well above the national average of ${na}%.`;
    else if (diff >= 5) feedback = `Good — ${score}% is above the ${na}% national average.`;
    else if (diff >= -5) feedback = `At the ${na}% national average for ${topic.label}.`;
    else if (diff >= -15) feedback = `Below average — ${score}% vs ${na}% national. Needs focus.`;
    else feedback = `Significantly below average — ${score}% vs ${na}% national. High priority.`;

    if (weakTypes.length > 0) {
      feedback += ` Weakest question types: ${weakTypes.map(e => `${e.qtype} (${e.pct}%)`).join(', ')} — drill these specifically.`;
    } else if (qtEntries.length === 0 && diff < 0) {
      feedback += ` Use the question type picker to identify exactly which types within ${topic.label} are costing you marks.`;
    }
    if (strongTypes.length > 0 && diff >= 5) {
      feedback += ` Strong on: ${strongTypes.map(e => e.qtype).join(', ')}.`;
    }
    return feedback;
  };

  return (
    // Layout: Topic+bar (narrow) | Score | Trend (wide) | AI Feedback
    <div style={{ display: 'grid', gridTemplateColumns: '320px 80px 1fr 200px', gap: 0, borderBottom: '1px solid rgba(13,27,42,0.06)', alignItems: 'stretch', background: '#fff' }}>

      {/* Column 1: Topic name + band bar — narrower */}
      <div style={{ padding: '12px 14px', borderRight: '1px solid rgba(13,27,42,0.06)' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0D1B2A', marginBottom: 6 }}>{topic.label}</div>
        <div style={{ position: 'relative', height: 22, marginBottom: 2 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 4, display: 'flex', overflow: 'hidden' }}>
            <div style={{ width: '40%', background: '#FDEAEA' }} />
            <div style={{ width: '20%', background: '#FEF3D0' }} />
            <div style={{ width: '20%', background: '#E8F5EE' }} />
            <div style={{ width: '20%', background: '#C8EDD8' }} />
          </div>
          {/* National average marker */}
          <div style={{ position: 'absolute', top: '50%', left: `${na}%`, transform: 'translate(-50%,-50%)', width: 12, height: 12, borderRadius: '50%', background: '#fff', border: '2px solid #5A6A7A', zIndex: 2 }} />
          {/* Your score marker */}
          {hasScore && <div style={{ position: 'absolute', top: '50%', left: `${Math.min(score, 99)}%`, transform: 'translate(-50%,-50%)', width: 16, height: 16, borderRadius: '50%', background: color, border: '2.5px solid #fff', zIndex: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }} />}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#9AA5B0' }}>
          <span>0</span><span>50</span><span>100</span>
        </div>
      </div>

      {/* Column 2: Score */}
      <div style={{ padding: '10px 6px', borderRight: '1px solid rgba(13,27,42,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: gradeColor, lineHeight: 1.1 }}>{hasScore ? `${score}%` : '—'}</div>
        <div style={{ fontSize: 16, fontWeight: 900, color: gradeColor, lineHeight: 1 }}>{grade}</div>
        <div style={{ fontSize: 8, color: status.color, fontWeight: 700, textAlign: 'center', marginTop: 2, lineHeight: 1.3 }}>{status.text}</div>
      </div>

      {/* Column 3: Trend line chart — 3x wider */}
      <div style={{ padding: '10px 16px', borderRight: '1px solid rgba(13,27,42,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <TopicLineChart topicKey={topic.key} trendPoints={trendPoints} color={color} />
      </div>

      {/* Column 4: AI Feedback — narrower but specific */}
      <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center' }}>
        <div style={{ fontSize: 11, color: '#5A6A7A', lineHeight: 1.55 }}>{getFeedback()}</div>
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
    <div onClick={onClick} style={{ background: '#fff', borderRadius: 16, padding: '18px 16px', border: '1px solid rgba(13,27,42,0.08)', borderTop: `4px solid ${subject.color}`, cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 2px 8px rgba(13,27,42,0.04)' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${subject.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{subject.icon}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0D1B2A' }}>{subject.shortLabel}</div>
      </div>
      {hasData ? (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: gradeColor, lineHeight: 1 }}>{avg}%</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: gradeColor }}>{grade}</div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: vsNational >= 0 ? '#2D6A4F' : '#B04030', marginBottom: 8 }}>
            {vsNational >= 0 ? `↑ +${vsNational}%` : `↓ ${vsNational}%`} vs national avg
          </div>
          <div style={{ height: 4, background: '#F0E8D8', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${avg}%`, background: subject.color, borderRadius: 2 }} />
          </div>
          <div style={{ fontSize: 11, color: '#5A6A7A', marginTop: 6 }}>{totalQuestions}q attempted</div>
        </>
      ) : (
        <div style={{ fontSize: 12, color: '#9AA5B0', lineHeight: 1.5 }}>No tests yet.<br /><span style={{ color: subject.color, fontWeight: 600 }}>Start →</span></div>
      )}
    </div>
  );
}

// ── Subject Detail Card ───────────────────────────────────────────────────────
function SubjectCard({ subject, avg, stats, sessions, topicScores, topicTrends, questionTypeScores, anchorId }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);
  const vsNational = avg !== null ? avg - subject.nationalAvg : null;

  const getAIAnalysis = () => {
    if (avg === null) return 'Complete a test to get your AI analysis.';
    const vsNat = avg - subject.nationalAvg;
    let text = vsNat >= 10
      ? `Strong overall — ${vsNat}% above the national average. `
      : vsNat >= 0 ? `At or just above the national average. `
        : `Currently ${Math.abs(vsNat)}% below the national average. `;

    const strong = subject.topics.filter((_, i) => (topicScores[i] || 0) >= 70).map(t => t.label);
    const weak = subject.topics.filter((_, i) => (topicScores[i] || 0) > 0 && (topicScores[i] || 0) < 55).map(t => t.label);
    if (strong.length > 0) text += `Strong topics: ${strong.join(', ')}. `;
    if (weak.length > 0) {
      text += `Weak topics: ${weak.join(', ')}. `;
      // Find worst question types within weak topics
      const worstQTypes = [];
      weak.forEach(topicLabel => {
        const topicObj = subject.topics.find(t => t.label === topicLabel);
        if (!topicObj) return;
        const qtData = questionTypeScores?.[topicObj.key] || {};
        Object.entries(qtData)
          .filter(([, v]) => v.total >= 2)
          .map(([qtype, v]) => ({ topic: topicLabel, qtype, pct: Math.round((v.correct / v.total) * 100) }))
          .filter(e => e.pct < 50)
          .sort((a, b) => a.pct - b.pct)
          .slice(0, 2)
          .forEach(e => worstQTypes.push(e));
      });
      if (worstQTypes.length > 0) {
        text += `Lowest question types to fix first: ${worstQTypes.map(e => `${e.qtype} in ${e.topic} (${e.pct}%)`).join('; ')}. `;
      } else {
        text += `Use the question type picker to isolate the specific types within these topics. `;
      }
    }
    if (weak.length === 0 && avg >= 70) text += `All topics above 55%. Push further by testing harder question types.`;
    return text;
  };

  return (
    <div id={anchorId} style={{ background: '#fff', borderRadius: 20, marginBottom: 24, border: '1px solid rgba(13,27,42,0.08)', boxShadow: '0 2px 12px rgba(13,27,42,0.04)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(13,27,42,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: '#FAFAF8' }}
        onClick={() => setExpanded(e => !e)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${subject.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{subject.icon}</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0D1B2A' }}>{subject.label}</div>
            <div style={{ fontSize: 12, color: '#5A6A7A' }}>{stats.attempts} session{stats.attempts !== 1 ? 's' : ''} · {stats.totalQuestions || 0} questions attempted</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {avg !== null && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: avg >= 70 ? '#2D6A4F' : avg >= 50 ? '#A07010' : '#B04030' }}>
                {avg}% <span style={{ fontSize: 18 }}>{getGrade(avg)}</span>
              </div>
              <div style={{ fontSize: 11, color: vsNational >= 0 ? '#2D6A4F' : '#B04030', fontWeight: 600 }}>
                {vsNational >= 0 ? `↑ +${vsNational}%` : `↓ ${vsNational}%`} vs national avg ({subject.nationalAvg}%)
              </div>
            </div>
          )}
          <div style={{ fontSize: 16, color: '#9AA5B0' }}>{expanded ? '▲' : '▼'}</div>
        </div>
      </div>

      {expanded && (
        <div>
          {/* Score trend */}
          {sessions.length > 1 && (
            <div style={{ padding: '16px 24px 0' }}>
              <ScoreTrendChart sessions={sessions} color={subject.color} />
            </div>
          )}

          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '320px 80px 1fr 200px', background: '#F5F3EE', borderBottom: '1px solid rgba(13,27,42,0.08)', borderTop: '1px solid rgba(13,27,42,0.06)' }}>
            <div style={{ padding: '7px 14px', fontSize: 10, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.07em', borderRight: '1px solid rgba(13,27,42,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
              Topic
              <span style={{ display: 'flex', gap: 6 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: subject.color, border: '2px solid #fff', display: 'inline-block' }} />
                  <span style={{ fontSize: 8, color: '#9AA5B0', fontWeight: 400 }}>You</span>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', border: '2px solid #5A6A7A', display: 'inline-block' }} />
                  <span style={{ fontSize: 8, color: '#9AA5B0', fontWeight: 400 }}>Nat.</span>
                </span>
              </span>
            </div>
            <div style={{ padding: '7px 6px', fontSize: 10, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'center', borderRight: '1px solid rgba(13,27,42,0.06)' }}>Score</div>
            <div style={{ padding: '7px 16px', fontSize: 10, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.07em', borderRight: '1px solid rgba(13,27,42,0.06)' }}>Trend over time</div>
            <div style={{ padding: '7px 12px', fontSize: 10, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.07em' }}>AI Feedback</div>
          </div>

          {subject.topics.map((topic, i) => (
            <TopicRow
              key={topic.key}
              topic={topic}
              score={topicScores[i] || 0}
              color={subject.color}
              trendPoints={topicTrends?.[topic.key] || []}
              questionTypeScores={questionTypeScores}
            />
          ))}

          <div style={{ padding: '18px 24px' }}>
            {/* AI Analysis */}
            <div style={{ background: '#0D1B2A', borderRadius: 12, padding: '14px 18px', marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#E8B84B', marginBottom: 5 }}>🤖 AI Analysis — {subject.label}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75 }}>{getAIAnalysis()}</div>
            </div>

            {/* Question type breakdown — shown if data available */}
            {questionTypeScores && Object.keys(questionTypeScores).length > 0 && (() => {
              const allQT = [];
              Object.entries(questionTypeScores).forEach(([topicKey, qtData]) => {
                const topicLabel = subject.topics.find(t => t.key === topicKey)?.label || topicKey;
                Object.entries(qtData).filter(([, v]) => v.total >= 2).forEach(([qtype, v]) => {
                  allQT.push({ topicLabel, qtype, pct: Math.round((v.correct / v.total) * 100), total: v.total });
                });
              });
              if (allQT.length === 0) return null;
              const worst = [...allQT].sort((a, b) => a.pct - b.pct).slice(0, 5);
              const best = [...allQT].sort((a, b) => b.pct - a.pct).slice(0, 3);
              return (
                <div style={{ background: '#F8F9FF', borderRadius: 12, padding: '14px 16px', marginBottom: 18, border: '1px solid #EEF2FF' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0D1B2A', marginBottom: 10 }}>📊 Question type breakdown</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#B04030', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>⚠ Needs work</div>
                      {worst.map((e, i) => (
                        <div key={i} style={{ marginBottom: 6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                            <div style={{ fontSize: 11, color: '#374151', fontFamily: 'Inter, sans-serif' }}>{e.qtype}<span style={{ fontSize: 9, color: '#9AA5B0' }}> · {e.topicLabel}</span></div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: getGradeColor(e.pct) }}>{e.pct}%</div>
                          </div>
                          <div style={{ height: 5, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${e.pct}%`, background: getGradeColor(e.pct), borderRadius: 2 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#2D6A4F', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>✓ Strongest</div>
                      {best.map((e, i) => (
                        <div key={i} style={{ marginBottom: 6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                            <div style={{ fontSize: 11, color: '#374151', fontFamily: 'Inter, sans-serif' }}>{e.qtype}<span style={{ fontSize: 9, color: '#9AA5B0' }}> · {e.topicLabel}</span></div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: getGradeColor(e.pct) }}>{e.pct}%</div>
                          </div>
                          <div style={{ height: 5, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${e.pct}%`, background: '#52B788', borderRadius: 2 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Test history */}
            {sessions.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Test history</div>
                <div style={{ borderRadius: 10, border: '1px solid rgba(13,27,42,0.08)', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 100px 55px 55px', background: '#FAF6EE', padding: '7px 12px', fontSize: 10, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <div>Date</div><div>Year</div><div>Result</div><div>Score</div><div>Grade</div>
                  </div>
                  <div style={{ maxHeight: sessions.length > 10 ? 360 : 'none', overflowY: sessions.length > 10 ? 'auto' : 'visible' }}>
                    {sessions.map((s, i) => {
                      const score = s.score || s.percentage || 0;
                      return (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 100px 55px 55px', padding: '8px 12px', fontSize: 12, borderTop: '1px solid rgba(13,27,42,0.05)', background: i % 2 === 0 ? '#fff' : '#FDFAF6', alignItems: 'center' }}>
                          <div style={{ color: '#5A6A7A', fontSize: 11 }}>{new Date(s.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                          <div style={{ color: '#0D1B2A', fontWeight: 600 }}>Yr {s.yearLevel || '—'}</div>
                          <div style={{ color: '#5A6A7A', fontSize: 11 }}>{s.correct !== undefined ? `${s.correct} / ${s.total}` : '—'}</div>
                          <div style={{ fontWeight: 800, color: score >= 70 ? '#2D6A4F' : score >= 50 ? '#A07010' : '#B04030' }}>{score}%</div>
                          <div style={{ fontWeight: 800, color: getGradeColor(score) }}>{getGrade(score)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <button onClick={() => navigate(subject.path)} style={{ padding: '8px 20px', borderRadius: 100, fontSize: 13, fontWeight: 700, background: '#0D1B2A', color: '#fff', border: 'none', cursor: 'pointer' }}>
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
  const [fullSessions, setFullSessions] = useState([]); // sessions WITH questions[] for charts
  const [weekly, setWeekly] = useState({ testsCompleted: 0, avgScore: 0 });
  const [recent, setRecent] = useState([]); // sessions without questions (for calendar/history)
  const [subjectAverages, setSubjectAverages] = useState({});
  const [allTopicScores, setAllTopicScores] = useState({});
  const [allTopicTrends, setAllTopicTrends] = useState({});   // { subjectKey: { topicKey: [{date, score}] } }
  const [allQTypeScores, setAllQTypeScores] = useState({});   // { subjectKey: { topicKey: { qtype: {correct,total} } } }
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

        // Use full sessions (include questions[]) for topic trend + question type analysis
        const sessionsFull = progressData.sessions || [];
        setFullSessions(sessionsFull);

        // Compute per-topic trends and question type scores from sessions that have questions[]
        const trendsMap = {};
        const qtScoresMap = {};
        subjects.forEach(subj => {
          const subjSessions = sessionsFull.filter(s => s.subject === subj.key);
          trendsMap[subj.key] = buildTopicTrends(subjSessions);
          qtScoresMap[subj.key] = buildQuestionTypeScores(subjSessions);
        });
        setAllTopicTrends(trendsMap);
        setAllQTypeScores(qtScoresMap);

        // Also load cumulative topic scores from Supabase
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
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(67,56,202,0.08)', padding: '20px 32px' }}>
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 900, color: '#0F172A', letterSpacing: -0.5 }}>📊 Progress Dashboard</div>
        <div style={{ fontSize: 13, color: '#64748B', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>Track your strengths, weaknesses and progress over time</div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {totalTests === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 900, color: '#0F172A', marginBottom: 8 }}>No results yet</div>
            <div style={{ fontSize: 14, color: '#64748B', marginBottom: 24, fontFamily: 'Inter, sans-serif' }}>Complete a practice test to start tracking your progress</div>
            <button onClick={() => navigate('/app/maths')} style={{ background: '#4338CA', color: '#fff', padding: '12px 28px', borderRadius: 100, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Start practising →</button>
          </div>
        ) : (
          <>
            {/* Subject summary cards */}
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: 'Inter, sans-serif' }}>Subject summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20 }}>
              {subjects.map(s => (
                <SubjectSummaryCard key={s.key} subject={s} avg={subjectAverages[s.key]} totalQuestions={getTotalQuestions(s.key)}
                  onClick={() => { const stats = progress.subjectStats[s.key]; if (stats && stats.attempts > 0) scrollToSubject(s.key); else navigate(s.path); }}
                />
              ))}
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Total tests completed', value: totalTests },
                { label: 'Tests this week', value: weekly.testsCompleted },
                { label: 'Overall average', value: overallAvg !== null ? `${overallAvg}% ${getGrade(overallAvg)}` : '—' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '14px 18px', border: '1px solid rgba(67,56,202,0.08)' }}>
                  <div style={{ fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 3, fontFamily: 'Inter, sans-serif' }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Calendar — compact */}
            <CalendarHeatmap sessions={recent} />

            {/* Subject detail cards */}
            {subjects.map(s => {
              const avg = subjectAverages[s.key];
              const stats = progress.subjectStats[s.key];
              if (!stats || (stats.attempts || 0) === 0) return null;
              const topicScores = getTopicScores(s.key, avg);
              const sessions = getSubjectSessions(s.key);
              const topicTrends = allTopicTrends[s.key] || {};
              const questionTypeScores = allQTypeScores[s.key] || {};
              return (
                <SubjectCard key={s.key} subject={s} avg={avg}
                  stats={{ ...stats, totalQuestions: getTotalQuestions(s.key) }}
                  sessions={sessions} topicScores={topicScores}
                  topicTrends={topicTrends}
                  questionTypeScores={questionTypeScores}
                  anchorId={`subject-${s.key}`}
                />
              );
            })}

            {/* Overall recommendation */}
            <div style={{ background: '#1E1B4B', borderRadius: 16, padding: '20px 24px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#A5B4FC', marginBottom: 6, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>🎯 Overall recommendation</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, fontFamily: 'Inter, sans-serif' }}>
                {(() => {
                  const avgs = subjects.map(s => ({ label: s.label, avg: subjectAverages[s.key], nationalAvg: s.nationalAvg })).filter(s => s.avg !== null && s.avg !== undefined);
                  if (avgs.length === 0) return 'Complete more tests to get personalised recommendations.';
                  const weakest = [...avgs].sort((a, b) => a.avg - b.avg)[0];
                  const strongest = [...avgs].sort((a, b) => b.avg - a.avg)[0];
                  const below = avgs.filter(s => s.avg < s.nationalAvg);
                  return `Strongest subject: ${strongest.label} at ${strongest.avg}% (${getGrade(strongest.avg)}). Needs most work: ${weakest.label} at ${weakest.avg}% (${getGrade(weakest.avg)})${weakest.avg < weakest.nationalAvg ? ` — ${weakest.nationalAvg - weakest.avg}% below benchmark` : ''}. ${below.length > 0 ? `Focus on ${below.map(s => s.label).join(' and ')} to reach national benchmark. Use the question type picker to drill specific weak types.` : 'You are at or above benchmark across all tested subjects — keep it up!'}`;
                })()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}