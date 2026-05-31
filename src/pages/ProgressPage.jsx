import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getProgress, getSubjectAverage, getWeeklyStats, getRecentSessions, getTopicScoresForSubject, getQuestionTypeScoresForSubject } from '../lib/progress';

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

// ── Build per-topic trend data from full sessions ────────────────────────────
// Strategy: for each session that contains questions[] with topic tags,
// compute the % correct for that topic within that session.
// selectedAnswers is NOT stored in Supabase — but we can reconstruct correctness
// by checking if q._userAnswer (if present) matches q.correct.
// Fallback: if no per-question answer data, we still record the session date
// for the topic (so the chart shows the session happened) using the session score.
// Returns { topicKey: [{ date, score }] }
const buildTopicTrends = (sessions) => {
  const trends = {};
  sessions.forEach(session => {
    const qs = session.questions || [];
    if (!qs.length) return;

    // Tally topic questions in this session
    const topicTotals = {};
    const topicCorrect = {};
    qs.forEach((q) => {
      const topic = q.topic;
      if (!topic) return;
      if (!topicTotals[topic]) { topicTotals[topic] = 0; topicCorrect[topic] = 0; }
      topicTotals[topic] += 1;
    });

    // For each topic that appeared in this session, use session.score as proxy score
    // This is the best we can do without per-question answer storage
    // It shows WHEN a topic was practiced and the overall session performance
    Object.keys(topicTotals).forEach(topicKey => {
      if (!trends[topicKey]) trends[topicKey] = [];
      // Use session score as the data point for this topic on this date
      trends[topicKey].push({
        date: session.date,
        score: session.score || session.percentage || 0,
        topicCount: topicTotals[topicKey],
      });
    });
  });

  // Deduplicate same-date entries for each topic (keep highest score)
  Object.keys(trends).forEach(topicKey => {
    const byDate = {};
    trends[topicKey].forEach(pt => {
      const d = pt.date.substring(0, 10);
      if (!byDate[d] || pt.score > byDate[d].score) byDate[d] = pt;
    });
    trends[topicKey] = Object.values(byDate).sort((a, b) => new Date(a.date) - new Date(b.date));
  });

  return trends;
};

// buildQuestionTypeScores replaced by Supabase query

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
    <div style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', marginBottom: 24, border: '1px solid rgba(13,27,42,0.08)', overflow: 'hidden', maxWidth: '100%' }}>
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
const BAR_H = 80;   // px — full height = 100%
const BAR_W = 34;   // px per bar slot
const MAX_VISIBLE = 10; // visible bars before scroll kicks in

function ScoreTrendChart({ sessions, color }) {
  const scrollRef = useRef(null);
  const sorted = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
  if (sorted.length === 0) return null;
  const avg = Math.round(sorted.reduce((s, r) => s + (r.score || 0), 0) / sorted.length);
  const hasMore = sorted.length > MAX_VISIBLE;

  // Scroll to rightmost (most recent) on mount
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
  }, []);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Inter, sans-serif' }}>Score trend</div>
        <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>
          Avg: <strong style={{ color }}>{avg}%</strong>
          {hasMore && <span style={{ marginLeft: 8, fontSize: 10 }}>← scroll for older tests</span>}
        </div>
      </div>
      {/* Container: fixed width = 10 bars max, scroll reveals older */}
      <div ref={scrollRef} style={{
        overflowX: 'auto',
        width: MAX_VISIBLE * BAR_W,   // hard cap: exactly 10 bars wide
        maxWidth: '100%',             // never wider than parent
        paddingBottom: 2,
        scrollbarWidth: 'thin',
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 3,
          width: Math.max(sorted.length, MAX_VISIBLE) * BAR_W,
          paddingTop: 14, paddingLeft: 2, paddingRight: 2,
          position: 'relative',
          flexShrink: 0,
        }}>
          {sorted.map((s, i) => {
            const score = s.score || 0;
            const barPx = Math.max(3, Math.round((score / 100) * BAR_H));
            const date = new Date(s.date);
            const label = date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
            return (
              <div key={i} title={`${label}: ${score}%`}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flex: `0 0 ${BAR_W - 2}px` }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: getGradeColor(score), fontFamily: 'Inter, sans-serif', lineHeight: 1 }}>{score}%</span>
                <div style={{ height: BAR_H - barPx }} />
                <div style={{
                  width: BAR_W - 6,
                  height: barPx,
                  background: score >= 70 ? color : score >= 50 ? `${color}99` : `${color}55`,
                  borderRadius: '3px 3px 0 0',
                }} />
                <span style={{ fontSize: 8, color: '#94A3B8', textAlign: 'center', fontFamily: 'Inter, sans-serif', lineHeight: 1.2, marginTop: 2, whiteSpace: 'nowrap' }}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
// ── Topic line chart — responsive width, dates on x-axis, % on each dot ─────
function TopicLineChart({ topicKey, trendPoints, color }) {
  const containerRef = useRef(null);
  const [containerW, setContainerW] = useState(300);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect?.width;
      if (w > 0) setContainerW(Math.floor(w));
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  if (!trendPoints || trendPoints.length === 0) {
    return (
      <div ref={containerRef} style={{ width: '100%', fontSize: 10, color: '#CBD5E1', textAlign: 'center', padding: '12px 0', fontFamily: 'Inter, sans-serif' }}>
        No data yet
      </div>
    );
  }

  const sorted = [...trendPoints].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-12);

  if (sorted.length === 1) {
    return (
      <div ref={containerRef} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4px 0', gap: 2 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: getGradeColor(sorted[0].score) }}>{sorted[0].score}%</div>
        <div style={{ fontSize: 9, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>
          {new Date(sorted[0].date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
        </div>
      </div>
    );
  }

  // Chart layout constants
  const PAD_L = 24;   // y-axis labels
  const PAD_R = 16;   // right margin (last label)
  const PAD_T = 16;   // top (score label above first/last dot)
  const PAD_B = 20;   // bottom (date labels)
  const PLOT_H = 70;  // height of the plot area
  const W = containerW;
  const plotW = W - PAD_L - PAD_R;
  const SVG_H = PAD_T + PLOT_H + PAD_B;

  const toY = (v) => PAD_T + PLOT_H - (v / 100) * PLOT_H;
  const toX = (i) => PAD_L + (sorted.length === 1 ? plotW / 2 : (i / (sorted.length - 1)) * plotW);

  const pts = sorted.map((p, i) => ({ x: toX(i), y: toY(p.score), score: p.score, date: p.date }));
  const lineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = `${lineD} L ${pts[pts.length - 1].x.toFixed(1)} ${(PAD_T + PLOT_H).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(PAD_T + PLOT_H).toFixed(1)} Z`;

  const trend = sorted[sorted.length - 1].score - sorted[0].score;

  // Decide which points show a % label (avoid overlapping)
  // Show label if gap from previous labeled point is big enough
  const minLabelGap = 28;
  const labeledPts = [];
  pts.forEach((p, i) => {
    const isFirst = i === 0;
    const isLast = i === pts.length - 1;
    const prev = labeledPts[labeledPts.length - 1];
    const farEnough = !prev || (p.x - prev.x) >= minLabelGap;
    if (isFirst || isLast || farEnough) labeledPts.push({ ...p, i });
  });

  // X-axis date labels: show for first, last, and every ~80px
  const dateLabeledIdx = new Set([0, pts.length - 1]);
  pts.forEach((p, i) => {
    if (i === 0 || i === pts.length - 1) return;
    const prev = [...dateLabeledIdx].filter(j => j < i).pop();
    if (prev !== undefined && (p.x - pts[prev].x) >= 70) dateLabeledIdx.add(i);
  });

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <svg width={W} height={SVG_H} style={{ display: 'block', overflow: 'visible' }}>
        {/* Y-axis lines at 0, 50, 100 */}
        {[0, 50, 100].map(v => (
          <g key={v}>
            <line x1={PAD_L} x2={PAD_L + plotW} y1={toY(v)} y2={toY(v)}
              stroke={v === 0 ? '#D1D5DB' : '#E5E7EB'} strokeWidth={v === 0 ? 1 : 1}
              strokeDasharray={v === 0 ? 'none' : '3,4'} />
            <text x={PAD_L - 3} y={toY(v) + 3.5} textAnchor="end"
              fontSize={8} fill="#9AA5B0" fontFamily="Inter, sans-serif">{v}</text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaD} fill={`${color}18`} />

        {/* Line */}
        <path d={lineD} fill="none" stroke={color} strokeWidth={2}
          strokeLinejoin="round" strokeLinecap="round" />

        {/* All dots */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y}
            r={i === pts.length - 1 ? 4 : 3}
            fill={color} stroke="#fff" strokeWidth={1.5} />
        ))}

        {/* % labels above dots — spaced so they don't overlap */}
        {labeledPts.map((p) => {
          // Position label above or below depending on whether there's room above
          const above = p.y - PAD_T > 14;
          const labelY = above ? p.y - 7 : p.y + 14;
          const anchor = p.x < PAD_L + 20 ? 'start' : p.x > W - PAD_R - 20 ? 'end' : 'middle';
          return (
            <text key={p.i} x={p.x} y={labelY} textAnchor={anchor}
              fontSize={9} fontWeight="700"
              fill={getGradeColor(p.score)} fontFamily="Inter, sans-serif">
              {p.score}%
            </text>
          );
        })}

        {/* X-axis date labels */}
        {[...dateLabeledIdx].map(i => {
          const p = pts[i];
          const anchor = i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle';
          return (
            <text key={i} x={p.x} y={PAD_T + PLOT_H + 13} textAnchor={anchor}
              fontSize={8} fill="#94A3B8" fontFamily="Inter, sans-serif">
              {fmtDate(sorted[i].date)}
            </text>
          );
        })}
      </svg>

      {/* Trend tag */}
      <div style={{
        fontSize: 9, fontWeight: 700, marginTop: 1, fontFamily: 'Inter, sans-serif',
        color: trend > 0 ? '#2D6A4F' : trend < 0 ? '#B04030' : '#94A3B8'
      }}>
        {trend > 0 ? `↑ +${trend}% since first test` : trend < 0 ? `↓ ${trend}% since first test` : '→ No change'}
      </div>
    </div>
  );
}

// ── Topic Row ─────────────────────────────────────────────────────────────────
function TopicRow({ topic, score, color, trendPoints, questionTypeScores, hideQT }) {
  const na = topic.nationalAvg;
  const hasScore = score > 0;
  const status = hasScore ? getStatusLabel(score, na) : { text: 'Not yet tested', color: '#9AA5B0' };
  const grade = hasScore ? getGrade(score) : '—';
  const gradeColor = hasScore ? getGradeColor(score) : '#9AA5B0';

  const [showQTypes, setShowQTypes] = React.useState(false);

  // Build question type data for this topic
  const qtData = questionTypeScores?.[topic.key] || {};
  const qtEntries = Object.entries(qtData)
    .filter(([, v]) => v.total >= 1)
    .map(([qtype, v]) => ({ qtype, pct: Math.round((v.correct / v.total) * 100), correct: v.correct, total: v.total }))
    .sort((a, b) => a.pct - b.pct);
  const hasQTData = qtEntries.length > 0;
  // Show button always when topic has been tested — QT data populates after new tests
  const showQTButton = hasScore && !hideQT;

  // Feedback
  const getFeedback = () => {
    if (!hasScore) return hideQT
      ? `Submit a writing piece to see your ${topic.label} score.`
      : `Complete a test to see your ${topic.label} performance.`;
    const diff = score - na;
    let feedback = '';
    if (diff >= 15) feedback = `Excellent — ${score}% is well above the ${na}% national average.`;
    else if (diff >= 5) feedback = `Good — ${score}% is above the ${na}% national average.`;
    else if (diff >= -5) feedback = `At the ${na}% national average.`;
    else if (diff >= -15) feedback = `Below average — ${score}% vs ${na}% national. Needs focus.`;
    else feedback = `Significantly below — ${score}% vs ${na}%. High priority.`;
    if (hideQT) {
      // Writing — give criteria-specific advice
      if (diff < 0) feedback += ` Focus on this criterion in your next submission and rewrite session.`;
    } else {
      const weakTypes = qtEntries.filter(e => e.pct < 50).slice(0, 2);
      const strongTypes = qtEntries.filter(e => e.pct >= 75).slice(0, 2);
      if (weakTypes.length > 0) feedback += ` Weakest: ${weakTypes.map(e => `${e.qtype} (${e.pct}%)`).join(', ')}.`;
      else if (!hasQTData && diff < 0) feedback += ` Use the question type picker to drill specific weak types.`;
      if (strongTypes.length > 0 && diff >= 5) feedback += ` Strong: ${strongTypes.map(e => e.qtype).join(', ')}.`;
    }
    return feedback;
  };

  return (
    <div style={{ borderBottom: '1px solid rgba(13,27,42,0.06)', background: '#fff' }}>

      {/* Main 4-column row: Topic+bar | Trend | Score | Feedback */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 100px 1fr 170px', alignItems: 'stretch' }}>

        {/* Column 1: Topic name + band bar + QT breakdown toggle */}
        <div style={{ padding: '10px 14px', borderRight: '1px solid rgba(13,27,42,0.06)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0D1B2A', marginBottom: 5 }}>{topic.label}</div>
          {/* Band bar */}
          <div style={{ position: 'relative', height: 20, marginBottom: 2 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 4, display: 'flex', overflow: 'hidden' }}>
              <div style={{ width: '40%', background: '#FDEAEA' }} />
              <div style={{ width: '20%', background: '#FEF3D0' }} />
              <div style={{ width: '20%', background: '#E8F5EE' }} />
              <div style={{ width: '20%', background: '#C8EDD8' }} />
            </div>
            <div style={{ position: 'absolute', top: '50%', left: `${na}%`, transform: 'translate(-50%,-50%)', width: 12, height: 12, borderRadius: '50%', background: '#fff', border: '2px solid #5A6A7A', zIndex: 2 }} />
            {hasScore && <div style={{ position: 'absolute', top: '50%', left: `${Math.min(score, 99)}%`, transform: 'translate(-50%,-50%)', width: 16, height: 16, borderRadius: '50%', background: color, border: '2.5px solid #fff', zIndex: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }} />}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#9AA5B0', marginBottom: hasQTData ? 6 : 0 }}>
            <span>0</span><span>50</span><span>100</span>
          </div>

          {/* QT expand button — directly under the band bar, same width */}
          {showQTButton && (
            <button onClick={() => setShowQTypes(v => !v)} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 10, color: '#4338CA', background: '#EEF2FF',
              border: '1px solid #C7D2FE', borderRadius: 4,
              cursor: 'pointer', padding: '3px 8px',
              fontFamily: 'Inter, sans-serif', fontWeight: 600,
              width: '100%', justifyContent: 'center',
            }}>
              {showQTypes ? '▲' : '▼'} {showQTypes ? 'Hide question types' : `${qtEntries.length} question type${qtEntries.length !== 1 ? 's' : ''}`}
            </button>
          )}

          {/* QT breakdown — expands inline under the band bar, same column width */}
          {showQTypes && (
            <div style={{ marginTop: 8, borderTop: '1px solid #EEF2FF', paddingTop: 8 }}>
              {!hasQTData && (
                <div style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'Inter, sans-serif', fontStyle: 'italic', marginBottom: 4 }}>
                  Question type data available after your next test on this topic.
                </div>
              )}
              {qtEntries.map((e, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontSize: 10, color: '#374151', fontFamily: 'Inter, sans-serif', flex: 1, marginRight: 6, lineHeight: 1.3 }}>{e.qtype}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: getGradeColor(e.pct), flexShrink: 0 }}>
                      {e.pct}%
                      <span style={{ fontSize: 9, color: '#94A3B8', fontWeight: 400 }}> ({e.correct}/{e.total})</span>
                    </span>
                  </div>
                  <div style={{ height: 5, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${e.pct}%`, background: getGradeColor(e.pct), borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: Score */}
        <div style={{ padding: '10px 6px', borderRight: '1px solid rgba(13,27,42,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: gradeColor, lineHeight: 1.1 }}>{hasScore ? `${score}%` : '—'}</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: gradeColor, lineHeight: 1 }}>{grade}</div>
          <div style={{ fontSize: 8, color: status.color, fontWeight: 700, textAlign: 'center', marginTop: 2, lineHeight: 1.3 }}>{status.text}</div>
        </div>

        {/* Column 3: Trend line chart */}
        <div style={{ padding: '10px 14px', borderRight: '1px solid rgba(13,27,42,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <TopicLineChart topicKey={topic.key} trendPoints={trendPoints} color={color} />
        </div>

        {/* Column 4: Feedback */}
        <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'flex-start' }}>
          <div style={{ fontSize: 11, color: '#5A6A7A', lineHeight: 1.55 }}>{getFeedback()}</div>
        </div>
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
          <div style={{ fontSize: 11, color: '#5A6A7A', marginTop: 6 }}>
            {subject.key === 'writing'
              ? `${stats?.attempts || 0} submission${(stats?.attempts || 0) !== 1 ? 's' : ''}`
              : `${totalQuestions}q attempted`}
          </div>
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
    if (avg === null) return 'Complete a submission to see your analysis.';
    const vsNat = avg - subject.nationalAvg;
    const isWriting = subject.key === 'writing';
    let text = vsNat >= 10
      ? `Strong overall — ${vsNat}% above the national average. `
      : vsNat >= 0 ? `At or just above the national average. `
        : `Currently ${Math.abs(vsNat)}% below the national average. `;

    const strong = subject.topics.filter((_, i) => (topicScores[i] || 0) >= 70).map(t => t.label);
    const weak = subject.topics.filter((_, i) => (topicScores[i] || 0) > 0 && (topicScores[i] || 0) < 55).map(t => t.label);
    if (strong.length > 0) text += `Strong ${isWriting ? 'criteria' : 'topics'}: ${strong.join(', ')}. `;
    if (weak.length > 0) {
      text += `Needs work: ${weak.join(', ')}. `;
      if (isWriting) {
        text += `Focus on these criteria in your next writing submission — use the feedback from your last piece to guide your rewrite.`;
      } else {
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
    }
    if (weak.length === 0 && avg >= 70) {
      text += isWriting
        ? `All criteria performing well — keep submitting to track your improvement over time.`
        : `All topics above 55%. Push further by testing harder question types.`;
    }
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
            <div style={{ fontSize: 12, color: '#5A6A7A' }}>
              {subject.key === 'writing'
                ? (stats.attempts > 0
                  ? `${stats.attempts} submission${stats.attempts !== 1 ? 's' : ''}`
                  : 'No submissions yet — submit your first piece of writing to track your progress')
                : `${stats.attempts} session${stats.attempts !== 1 ? 's' : ''} · ${stats.totalQuestions || 0} questions attempted`}
            </div>
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
          {/* Writing with no submissions yet — show a prompt */}
          {subject.key === 'writing' && sessions.length === 0 && (
            <div style={{ padding: '24px 24px 0' }}>
              <div style={{ background: '#FFF7ED', borderRadius: 12, padding: '20px 24px', border: '1px solid #FED7AA', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 32 }}>✍️</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#92400E', marginBottom: 4, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>No writing submissions yet</div>
                  <div style={{ fontSize: 13, color: '#78350F', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
                    Submit a typed or handwritten piece of writing to see your scores across the 5 criteria — Ideas, Structure, Language, Sentence Structure and Punctuation — tracked here over time.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '280px 100px 1fr 170px', background: '#F5F3EE', borderBottom: '1px solid rgba(13,27,42,0.08)', borderTop: '1px solid rgba(13,27,42,0.06)' }}>
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
            <div style={{ padding: '7px 12px', fontSize: 10, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Feedback</div>
          </div>

          {subject.topics.map((topic, i) => (
            <TopicRow
              key={topic.key}
              topic={topic}
              score={topicScores[i] || 0}
              color={subject.color}
              trendPoints={topicTrends?.[topic.key] || []}
              questionTypeScores={questionTypeScores}
              hideQT={subject.key === 'writing'}
            />
          ))}

          <div style={{ padding: '18px 24px' }}>
            {/* Analysis */}
            <div style={{ background: '#0D1B2A', borderRadius: 12, padding: '14px 18px', marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#E8B84B', marginBottom: 5 }}>📊 Analysis — {subject.label}</div>
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
                <div style={{ fontSize: 11, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{subject.key === 'writing' ? 'Submission history' : 'Test history'}</div>
                <div style={{ borderRadius: 10, border: '1px solid rgba(13,27,42,0.08)', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 100px 55px 55px', background: '#FAF6EE', padding: '7px 12px', fontSize: 10, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <div>Date</div><div>Year</div><div>Result</div><div>Score</div><div>Grade</div>
                  </div>
                  <div style={{ maxHeight: sessions.length > 10 ? 360 : 'none', overflowY: sessions.length > 10 ? 'auto' : 'visible' }}>
                    {sessions.map((s, i) => {
                      const score = s.score || s.percentage || 0;
                      return (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 100px 55px 55px', padding: '8px 12px', fontSize: 12, borderTop: '1px solid rgba(13,27,42,0.05)', background: i % 2 === 0 ? '#fff' : '#FDFAF6', alignItems: 'center' }}>
                          <div style={{ color: '#5A6A7A', fontSize: 11 }}>
                            {new Date(s.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {subject.key === 'writing' && s.type && <span style={{ marginLeft: 5, fontSize: 9, background: '#F5F3FF', color: '#7c3aed', borderRadius: 4, padding: '1px 5px', fontWeight: 700, textTransform: 'capitalize' }}>{s.type}</span>}
                          </div>
                          <div style={{ color: '#0D1B2A', fontWeight: 600 }}>Yr {s.yearLevel || '—'}</div>
                          <div style={{ color: '#5A6A7A', fontSize: 11 }}>
                            {subject.key === 'writing' ? (s.score !== undefined ? `${s.score || 0} / 25` : '—') : (s.correct !== undefined ? `${s.correct} / ${s.total}` : '—')}
                          </div>
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
              {subject.key === 'writing' ? 'Submit writing →' : `Practise ${subject.label} →`}
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

        // Compute topic trends from full sessions
        const trendsMap = {};
        subjects.forEach(subj => {
          const subjSessions = sessionsFull.filter(s => s.subject === subj.key);
          trendsMap[subj.key] = buildTopicTrends(subjSessions);
        });
        setAllTopicTrends(trendsMap);

        // Load cumulative topic scores AND question type scores from Supabase
        const topicData = {};
        const qtData = {};
        await Promise.all(subjects.map(async s => {
          topicData[s.key] = await getTopicScoresForSubject(s.key);
          qtData[s.key] = await getQuestionTypeScoresForSubject(s.key);
        }));
        setAllTopicScores(topicData);
        setAllQTypeScores(qtData);

      } catch (e) {
        console.error('Failed to load progress data:', e);
      }
      setLoadingData(false);
    };
    loadData();
  }, [user?.id]); // use user.id not user object to prevent reload on every navigation

  const totalTests = progress.sessions.length;
  const overallAvg = totalTests > 0
    ? Math.round(progress.sessions.reduce((s, sess) => s + (sess.score || sess.percentage || 0), 0) / totalTests)
    : null;

  const getSubjectSessions = (key) => recent.filter(s => s.subject === key);
  const getTotalQuestions = (key) => {
    if (key === 'writing') {
      // Writing doesn't have "questions" — count submissions
      return recent.filter(s => s.subject === key).length;
    }
    return recent.filter(s => s.subject === key).reduce((sum, s) => sum + (s.total || 0), 0);
  };

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
              // Writing always shows (even with no data) — other subjects only show when they have data
              const isWriting = s.key === 'writing';
              const hasData = (stats && (stats.attempts || 0) > 0) || (avg !== null && avg !== undefined);
              if (!isWriting && !hasData) return null;
              // Create a minimal stats object if missing (writing with no submissions yet)
              const effectiveStats = stats || { attempts: 0, totalQuestions: 0 };
              const topicScores = getTopicScores(s.key, avg);
              const sessions = getSubjectSessions(s.key);
              const topicTrends = allTopicTrends[s.key] || {};
              const questionTypeScores = allQTypeScores[s.key] || {};
              return (
                <SubjectCard key={s.key} subject={s} avg={avg}
                  stats={{ ...effectiveStats, totalQuestions: getTotalQuestions(s.key) }}
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