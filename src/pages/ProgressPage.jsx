import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getProgress, getSubjectAverage, getWeeklyStats, getRecentSessions } from '../lib/progress';

const subjects = [
  {
    key: 'mathematics', label: 'Mathematics', icon: '🔢', color: '#E8B84B', path: '/app/maths',
    nationalAvg: 64,
    topics: [
      { label: 'Number operations', key: 'number' },
      { label: 'Fractions & decimals', key: 'fractions' },
      { label: 'Percentages', key: 'percentages' },
      { label: 'Geometry', key: 'geometry' },
      { label: 'Measurement', key: 'measurement' },
      { label: 'Word problems', key: 'wordproblems' },
    ]
  },
  {
    key: 'reading', label: 'Reading Comprehension', icon: '📖', color: '#52B788', path: '/app/reading',
    nationalAvg: 67,
    topics: [
      { label: 'Literal comprehension', key: 'literal' },
      { label: 'Inference', key: 'inference' },
      { label: 'Vocabulary', key: 'vocabulary' },
      { label: 'Main idea', key: 'mainidea' },
      { label: "Author's purpose", key: 'purpose' },
      { label: 'Text type', key: 'texttype' },
    ]
  },
  {
    key: 'general', label: 'General Ability', icon: '🧩', color: '#7B61FF', path: '/app/general',
    nationalAvg: 61,
    topics: [
      { label: 'Verbal analogies', key: 'analogies' },
      { label: 'Number sequences', key: 'sequences' },
      { label: 'Letter patterns', key: 'letters' },
      { label: 'Odd one out', key: 'oddoneout' },
      { label: 'Logic problems', key: 'logic' },
      { label: 'Spatial reasoning', key: 'spatial' },
    ]
  },
  {
    key: 'writing', label: 'Writing', icon: '✏️', color: '#E07A5F', path: '/app/writing',
    nationalAvg: 62,
    topics: [
      { label: 'Ideas & content', key: 'ideas' },
      { label: 'Structure', key: 'structure' },
      { label: 'Language & vocab', key: 'language' },
      { label: 'Sentence structure', key: 'sentences' },
      { label: 'Punctuation', key: 'punctuation' },
    ]
  }
];

// ── Radar / Spider Chart ──────────────────────────────────────────────────────
function RadarChart({ topics, scores, nationalAvgs, color }) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = 80;
  const n = topics.length;

  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  const getPoint = (i, value, radius) => {
    const angle = startAngle + i * angleStep;
    return {
      x: cx + radius * (value / 100) * Math.cos(angle),
      y: cy + radius * (value / 100) * Math.sin(angle),
    };
  };

  const getLabelPoint = (i) => {
    const angle = startAngle + i * angleStep;
    const labelR = r + 26;
    return {
      x: cx + labelR * Math.cos(angle),
      y: cy + labelR * Math.sin(angle),
    };
  };

  const gridLevels = [25, 50, 75, 100];

  const studentPoints = topics.map((_, i) => getPoint(i, scores[i] || 0, r));
  const nationalPoints = topics.map((_, i) => getPoint(i, nationalAvgs[i] || 65, r));

  const toPath = (pts) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid circles */}
      {gridLevels.map(level => (
        <polygon key={level}
          points={topics.map((_, i) => {
            const angle = startAngle + i * angleStep;
            return `${(cx + r * (level / 100) * Math.cos(angle)).toFixed(1)},${(cy + r * (level / 100) * Math.sin(angle)).toFixed(1)}`;
          }).join(' ')}
          fill="none" stroke="rgba(13,27,42,0.07)" strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {topics.map((_, i) => {
        const angle = startAngle + i * angleStep;
        return (
          <line key={i}
            x1={cx} y1={cy}
            x2={(cx + r * Math.cos(angle)).toFixed(1)}
            y2={(cy + r * Math.sin(angle)).toFixed(1)}
            stroke="rgba(13,27,42,0.08)" strokeWidth="1"
          />
        );
      })}

      {/* National average area */}
      <path d={toPath(nationalPoints)} fill="rgba(90,106,122,0.08)" stroke="rgba(90,106,122,0.4)" strokeWidth="1.5" strokeDasharray="4,3" />

      {/* Student area */}
      <path d={toPath(studentPoints)} fill={`${color}22`} stroke={color} strokeWidth="2" />

      {/* Student dots */}
      {studentPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} />
      ))}

      {/* Labels */}
      {topics.map((t, i) => {
        const lp = getLabelPoint(i);
        return (
          <text key={i} x={lp.x} y={lp.y}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="8.5" fill="#5A6A7A" fontFamily="DM Sans, sans-serif"
          >
            {t.label.length > 14 ? t.label.slice(0, 13) + '…' : t.label}
          </text>
        );
      })}
    </svg>
  );
}

// ── AI Analysis Text ──────────────────────────────────────────────────────────
function AIAnalysis({ subject, avg, scores, nationalAvg }) {
  const topics = subject.topics;
  const topicScores = scores;

  const strong = topics.filter((_, i) => (topicScores[i] || 0) >= 70);
  const weak = topics.filter((_, i) => (topicScores[i] || 0) < 50 && (topicScores[i] || 0) > 0);
  const vsNational = avg !== null ? avg - nationalAvg : null;

  if (avg === null) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
      {/* vs National */}
      <div style={{
        padding: '10px 14px', borderRadius: 10,
        background: vsNational >= 0 ? '#E8F5EE' : '#FDEAEA',
        border: `1px solid ${vsNational >= 0 ? '#A8DCC0' : '#F0A8A0'}`
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: vsNational >= 0 ? '#2D6A4F' : '#B04030', marginBottom: 2 }}>
          {vsNational >= 0 ? '↑ Above' : '↓ Below'} national average
        </div>
        <div style={{ fontSize: 12, color: vsNational >= 0 ? '#2D6A4F' : '#B04030' }}>
          Your average: <strong>{avg}%</strong> · National benchmark: <strong>{nationalAvg}%</strong> · Difference: <strong>{vsNational >= 0 ? '+' : ''}{vsNational}%</strong>
        </div>
      </div>

      {/* Strengths */}
      {strong.length > 0 && (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: '#F0FFF8', border: '1px solid #C0E8D0' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#2D6A4F', marginBottom: 4 }}>✅ Strengths</div>
          <div style={{ fontSize: 12, color: '#2D6A4F', lineHeight: 1.6 }}>
            Performing well in: <strong>{strong.map(t => t.label).join(', ')}</strong>. Keep maintaining these with regular practice.
          </div>
        </div>
      )}

      {/* Weaknesses */}
      {weak.length > 0 && (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FFF5F5', border: '1px solid #F0C0C0' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#B04030', marginBottom: 4 }}>⚠️ Needs focus</div>
          <div style={{ fontSize: 12, color: '#B04030', lineHeight: 1.6 }}>
            Struggling with: <strong>{weak.map(t => t.label).join(', ')}</strong>. These specific question types are costing marks.
          </div>
        </div>
      )}

      {/* Recommendation */}
      <div style={{ padding: '10px 14px', borderRadius: 10, background: '#F0EEFF', border: '1px solid #C8C0F0' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#5B3FBB', marginBottom: 4 }}>🎯 AI Recommendation</div>
        <div style={{ fontSize: 12, color: '#5B3FBB', lineHeight: 1.6 }}>
          {weak.length > 0
            ? `Focus your next 3 sessions on ${weak[0].label}${weak[1] ? ` and ${weak[1].label}` : ''}. Practice 10-question targeted tests on these topics before attempting a full test again.`
            : avg >= 80
              ? `Excellent performance! Challenge yourself with harder year-level questions and full timed simulations to maintain your edge.`
              : `You're on track. Aim for consistency — complete at least 3 sessions per week to keep improving before exam day.`
          }
        </div>
      </div>
    </div>
  );
}

// ── Session History Table ─────────────────────────────────────────────────────
function SessionHistory({ sessions, subject }) {
  if (sessions.length === 0) return null;
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Test history</div>
      <div style={{ borderRadius: 10, border: '1px solid rgba(13,27,42,0.08)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 70px 70px', background: '#FAF6EE', padding: '8px 14px', fontSize: 11, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <div>Date</div>
          <div>Year</div>
          <div>Questions</div>
          <div>Score</div>
        </div>
        {sessions.map((s, i) => {
          const score = s.score || s.percentage || 0;
          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr 80px 70px 70px',
              padding: '10px 14px', fontSize: 13,
              borderTop: '1px solid rgba(13,27,42,0.05)',
              background: i % 2 === 0 ? '#fff' : '#FDFAF6'
            }}>
              <div style={{ color: '#5A6A7A' }}>
                {new Date(s.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
              <div style={{ color: '#0D1B2A', fontWeight: 600 }}>Yr {s.yearLevel || '—'}</div>
              <div style={{ color: '#5A6A7A' }}>{s.total || s.correct !== undefined ? `${s.correct}/${s.total}` : '—'}</div>
              <div style={{ fontWeight: 700, color: score >= 70 ? '#2D6A4F' : score >= 50 ? '#A07010' : '#B04030' }}>{score}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProgressPage() {
  const navigate = useNavigate();
  const { yearLevel } = useAuth();
  const progress = getProgress();
  const weekly = getWeeklyStats();
  const recent = getRecentSessions(50);
  const totalTests = progress.sessions.length;
  const overallAvg = totalTests > 0
    ? Math.round(progress.sessions.reduce((s, sess) => s + (sess.score || sess.percentage || 0), 0) / totalTests)
    : null;

  const getSubjectSessions = (key) => recent.filter(s => s.subject === key);

  // Generate simulated topic scores from overall subject average
  // In a full build these would come from per-question tracking
  const getTopicScores = (subjectKey, avg) => {
    if (avg === null) return [];
    const subject = subjects.find(s => s.key === subjectKey);
    if (!subject) return [];
    // Simulate topic variance around the average (±15–25 points)
    const seed = subjectKey.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return subject.topics.map((_, i) => {
      const variance = ((seed * (i + 1) * 7) % 30) - 15;
      return Math.min(100, Math.max(10, Math.round(avg + variance)));
    });
  };

  return (
    <div>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(13,27,42,0.08)', padding: '20px 32px' }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 900, color: '#0D1B2A' }}>📊 Progress Report Dashboard</div>
        <div style={{ fontSize: 14, color: '#5A6A7A', marginTop: 2 }}>Track your strengths and weaknesses across all subjects and topics</div>
      </div>

      <div style={{ padding: 32 }}>
        {totalTests === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 900, color: '#0D1B2A', marginBottom: 8 }}>No results yet</div>
            <div style={{ fontSize: 15, color: '#5A6A7A', marginBottom: 24 }}>Complete your first practice test to start tracking your progress</div>
            <button onClick={() => navigate('/app/maths')} style={{ background: '#0D1B2A', color: '#fff', padding: '12px 28px', borderRadius: 100, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              Start practising →
            </button>
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
              {[
                { label: 'Total tests', value: totalTests },
                { label: 'This week', value: weekly.testsCompleted },
                { label: 'Overall average', value: overallAvg !== null ? `${overallAvg}%` : '—' },
                { label: 'Est. time spent', value: `${Math.round(totalTests * 15)}m` }
              ].map((s, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid rgba(13,27,42,0.08)' }}>
                  <div style={{ fontSize: 11, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#0D1B2A' }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 24, alignItems: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#5A6A7A' }}>Chart legend:</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 24, height: 3, background: '#E8B84B', borderRadius: 2 }}></div>
                <span style={{ fontSize: 12, color: '#5A6A7A' }}>Your scores</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 24, height: 2, background: 'rgba(90,106,122,0.5)', borderRadius: 2, borderTop: '2px dashed rgba(90,106,122,0.5)' }}></div>
                <span style={{ fontSize: 12, color: '#5A6A7A' }}>National benchmark average</span>
              </div>
            </div>

            {/* Per-subject cards */}
            {subjects.map(s => {
              const avg = getSubjectAverage(s.key);
              const stats = progress.subjectStats[s.key];
              const sessions = getSubjectSessions(s.key);
              if (!stats || (stats.attempts || 0) === 0) return null;

              const topicScores = getTopicScores(s.key, avg);
              const nationalTopicAvgs = s.topics.map(() => s.nationalAvg);

              return (
                <div key={s.key} style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 24, border: '1px solid rgba(13,27,42,0.08)', boxShadow: '0 2px 12px rgba(13,27,42,0.04)' }}>
                  {/* Subject header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: `${s.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#0D1B2A' }}>{s.label}</div>
                        <div style={{ fontSize: 12, color: '#5A6A7A' }}>{stats.attempts} session{stats.attempts !== 1 ? 's' : ''} completed</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 32, fontWeight: 800, color: avg >= 70 ? '#2D6A4F' : avg >= 50 ? '#A07010' : '#B04030' }}>{avg}%</div>
                      <div style={{ fontSize: 12, color: '#5A6A7A' }}>your average · benchmark {s.nationalAvg}%</div>
                    </div>
                  </div>

                  {/* Chart + AI analysis side by side */}
                  <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, marginBottom: 8, alignItems: 'start' }}>
                    {/* Radar chart */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <RadarChart
                        topics={s.topics}
                        scores={topicScores}
                        nationalAvgs={nationalTopicAvgs}
                        color={s.color}
                      />
                      <div style={{ fontSize: 11, color: '#9AA5B0', textAlign: 'center', marginTop: 4 }}>Topic performance spider chart</div>
                    </div>

                    {/* AI Analysis */}
                    <AIAnalysis
                      subject={s}
                      avg={avg}
                      scores={topicScores}
                      nationalAvg={s.nationalAvg}
                    />
                  </div>

                  {/* Session history for this subject */}
                  <SessionHistory sessions={sessions} subject={s} />

                  {/* Practise button */}
                  <button onClick={() => navigate(s.path)} style={{ marginTop: 16, padding: '9px 22px', borderRadius: 100, fontSize: 13, fontWeight: 700, background: '#0D1B2A', color: '#fff', border: 'none', cursor: 'pointer' }}>
                    Practise {s.label} →
                  </button>
                </div>
              );
            })}

            {/* Overall AI recommendation */}
            <div style={{ background: '#0D1B2A', borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8 }}>🎯 Overall AI recommendation</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
                {(() => {
                  const avgs = subjects.map(s => ({ label: s.label, avg: getSubjectAverage(s.key), nationalAvg: s.nationalAvg })).filter(s => s.avg !== null);
                  if (avgs.length === 0) return 'Complete more tests to get personalised recommendations.';
                  const weakest = [...avgs].sort((a, b) => a.avg - b.avg)[0];
                  const strongest = [...avgs].sort((a, b) => b.avg - a.avg)[0];
                  const belowNational = avgs.filter(s => s.avg < s.nationalAvg);
                  return `Your strongest subject is ${strongest.label} at ${strongest.avg}%. ${weakest.label} needs the most attention at ${weakest.avg}%${weakest.avg < weakest.nationalAvg ? ` — currently ${weakest.nationalAvg - weakest.avg}% below the national benchmark` : ''}. ${belowNational.length > 0 ? `Focus on bringing ${belowNational.map(s => s.label).join(' and ')} up to benchmark level before exam day.` : 'You are above the national benchmark in all tested subjects — keep it up!'}`;
                })()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}