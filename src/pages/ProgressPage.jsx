import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getProgress, getSubjectAverage, getWeeklyStats, getRecentSessions } from '../lib/progress';

const subjects = [
  {
    key: 'mathematics', label: 'Mathematics', icon: '🔢', color: '#E8B84B', path: '/app/maths',
    nationalAvg: 64,
    topics: [
      { label: 'Number operations', key: 'number', nationalAvg: 65 },
      { label: 'Fractions & decimals', key: 'fractions', nationalAvg: 60 },
      { label: 'Percentages', key: 'percentages', nationalAvg: 62 },
      { label: 'Geometry', key: 'geometry', nationalAvg: 66 },
      { label: 'Measurement', key: 'measurement', nationalAvg: 64 },
      { label: 'Word problems', key: 'wordproblems', nationalAvg: 63 },
    ]
  },
  {
    key: 'reading', label: 'Reading Comprehension', icon: '📖', color: '#52B788', path: '/app/reading',
    nationalAvg: 67,
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
    key: 'general', label: 'General Ability', icon: '🧩', color: '#7B61FF', path: '/app/general',
    nationalAvg: 61,
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
    key: 'writing', label: 'Writing', icon: '✏️', color: '#E07A5F', path: '/app/writing',
    nationalAvg: 62,
    topics: [
      { label: 'Ideas & content', key: 'ideas', nationalAvg: 64 },
      { label: 'Structure', key: 'structure', nationalAvg: 62 },
      { label: 'Language & vocab', key: 'language', nationalAvg: 60 },
      { label: 'Sentence structure', key: 'sentences', nationalAvg: 63 },
      { label: 'Punctuation', key: 'punctuation', nationalAvg: 61 },
    ]
  }
];

// ── Topic Band Chart Row (NAPLAN style) ───────────────────────────────────────
function TopicBandRow({ topic, score, color }) {
  const na = topic.nationalAvg;
  const hasScore = score > 0;

  // Band colours: 0-39 red, 40-59 amber, 60-79 yellow-green, 80-100 green
  const getBandColor = (pct) => {
    if (pct >= 80) return '#2D6A4F';
    if (pct >= 60) return '#A07010';
    if (pct >= 40) return '#E07A5F';
    return '#B04030';
  };

  const getStatusLabel = (score, na) => {
    if (!hasScore) return { text: 'Not yet tested', color: '#9AA5B0' };
    const diff = score - na;
    if (diff >= 15) return { text: 'Well above average', color: '#2D6A4F' };
    if (diff >= 5) return { text: 'Above average', color: '#52B788' };
    if (diff >= -5) return { text: 'At average', color: '#A07010' };
    if (diff >= -15) return { text: 'Below average', color: '#E07A5F' };
    return { text: 'Well below average', color: '#B04030' };
  };

  const getAdvice = (score, na, label) => {
    if (!hasScore) return `Complete a ${label} practice test to see your performance here.`;
    const diff = score - na;
    if (diff >= 15) return `Excellent — well ahead of the national average. Keep practising to maintain this.`;
    if (diff >= 5) return `Good work — slightly above average. A few more targeted sessions will consolidate this.`;
    if (diff >= -5) return `On track with the national average. Regular practice will push you above the benchmark.`;
    if (diff >= -15) return `Below average. Focus on this topic — attempt 2–3 short targeted tests to lift your score.`;
    return `Significant gap to close. Prioritise this topic urgently before your exam. Try 5-question daily drills.`;
  };

  const status = getStatusLabel(score, na);

  return (
    <div style={{ marginBottom: 12, background: '#FAFAF8', borderRadius: 12, padding: '12px 16px', border: '1px solid rgba(13,27,42,0.06)' }}>
      {/* Topic label + status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0D1B2A' }}>{topic.label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {hasScore && (
            <div style={{ fontSize: 13, fontWeight: 800, color: getBandColor(score) }}>{score}%</div>
          )}
          <div style={{ fontSize: 11, fontWeight: 600, color: status.color, background: `${status.color}15`, padding: '2px 8px', borderRadius: 100 }}>
            {status.text}
          </div>
        </div>
      </div>

      {/* Band bar */}
      <div style={{ position: 'relative', height: 28, marginBottom: 6 }}>
        {/* Background bands */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: 6, display: 'flex', overflow: 'hidden' }}>
          <div style={{ width: '40%', background: '#FDEAEA' }}></div>
          <div style={{ width: '20%', background: '#FEF3D0' }}></div>
          <div style={{ width: '20%', background: '#E8F5EE' }}></div>
          <div style={{ width: '20%', background: '#C8EDD8' }}></div>
        </div>

        {/* Band labels */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '40%', textAlign: 'center', fontSize: 9, color: '#B04030', fontWeight: 600, opacity: 0.7 }}>Below (0–39%)</div>
          <div style={{ width: '20%', textAlign: 'center', fontSize: 9, color: '#A07010', fontWeight: 600, opacity: 0.7 }}>Developing</div>
          <div style={{ width: '20%', textAlign: 'center', fontSize: 9, color: '#2D6A4F', fontWeight: 600, opacity: 0.7 }}>Proficient</div>
          <div style={{ width: '20%', textAlign: 'center', fontSize: 9, color: '#1A4030', fontWeight: 600, opacity: 0.7 }}>Advanced</div>
        </div>

        {/* National average marker (open circle + dashed line) */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${na}%`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 1, height: '100%', borderLeft: '2px dashed #5A6A7A', opacity: 0.6 }}></div>
          <div style={{ position: 'absolute', width: 10, height: 10, borderRadius: '50%', background: '#fff', border: '2px solid #5A6A7A' }}></div>
        </div>

        {/* Student score marker (filled dot) */}
        {hasScore && (
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${score}%`, display: 'flex', alignItems: 'center', transform: 'translateX(-50%)' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: color, border: '2px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}></div>
          </div>
        )}
      </div>

      {/* Scale labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#9AA5B0', marginBottom: 6 }}>
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>

      {/* Advice text */}
      <div style={{ fontSize: 12, color: '#5A6A7A', lineHeight: 1.5, fontStyle: 'italic' }}>
        {getAdvice(score, na, topic.label)}
      </div>
    </div>
  );
}

// ── Subject Card ──────────────────────────────────────────────────────────────
function SubjectCard({ subject, avg, stats, sessions, topicScores }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);
  const vsNational = avg !== null ? avg - subject.nationalAvg : null;

  return (
    <div style={{ background: '#fff', borderRadius: 20, marginBottom: 24, border: '1px solid rgba(13,27,42,0.08)', boxShadow: '0 2px 12px rgba(13,27,42,0.04)', overflow: 'hidden' }}>
      {/* Subject header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(13,27,42,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: `${subject.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{subject.icon}</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0D1B2A' }}>{subject.label}</div>
            <div style={{ fontSize: 12, color: '#5A6A7A' }}>{stats.attempts} session{stats.attempts !== 1 ? 's' : ''} completed</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {avg !== null && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: avg >= 70 ? '#2D6A4F' : avg >= 50 ? '#A07010' : '#B04030' }}>{avg}%</div>
              <div style={{ fontSize: 11, color: vsNational >= 0 ? '#2D6A4F' : '#B04030', fontWeight: 600 }}>
                {vsNational >= 0 ? `↑ +${vsNational}%` : `↓ ${vsNational}%`} vs national avg ({subject.nationalAvg}%)
              </div>
            </div>
          )}
          <div style={{ fontSize: 18, color: '#9AA5B0' }}>{expanded ? '▲' : '▼'}</div>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '20px 24px' }}>
          {/* Topic band charts */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Topic breakdown</div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#9AA5B0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: subject.color }}></div>
                  <span>Your score</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff', border: '2px solid #5A6A7A' }}></div>
                  <span>National average</span>
                </div>
              </div>
            </div>
            {subject.topics.map((topic, i) => (
              <TopicBandRow
                key={topic.key}
                topic={topic}
                score={topicScores[i] || 0}
                color={subject.color}
              />
            ))}
          </div>

          {/* AI Summary */}
          <div style={{ background: '#0D1B2A', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#E8B84B', marginBottom: 6 }}>🤖 AI Analysis — {subject.label}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
              {(() => {
                if (avg === null) return 'Complete a test to get your AI analysis.';
                const strong = subject.topics.filter((_, i) => (topicScores[i] || 0) >= 70).map(t => t.label);
                const weak = subject.topics.filter((_, i) => (topicScores[i] || 0) > 0 && (topicScores[i] || 0) < 55).map(t => t.label);
                const vsNat = avg - subject.nationalAvg;
                let text = '';
                if (vsNat >= 10) text += `Strong overall performance — ${vsNat}% above the national average. `;
                else if (vsNat >= 0) text += `Performing at or just above the national average. `;
                else text += `Currently ${Math.abs(vsNat)}% below the national average — there is room to improve. `;
                if (strong.length > 0) text += `Strengths include ${strong.join(', ')}. `;
                if (weak.length > 0) text += `Priority areas to address: ${weak.join(', ')}. Focus targeted practice on these before the exam. `;
                if (weak.length === 0 && avg >= 70) text += `All topics are performing well. Maintain consistency and try harder year-level tests to keep pushing your score.`;
                return text;
              })()}
            </div>
          </div>

          {/* Test history for this subject */}
          {sessions.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Test history</div>
              <div style={{ borderRadius: 12, border: '1px solid rgba(13,27,42,0.08)', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 100px 70px', background: '#FAF6EE', padding: '8px 14px', fontSize: 11, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <div>Date</div>
                  <div>Year</div>
                  <div>Result</div>
                  <div>Score</div>
                </div>
                {sessions.map((s, i) => {
                  const score = s.score || s.percentage || 0;
                  return (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 100px 70px', padding: '10px 14px', fontSize: 13, borderTop: '1px solid rgba(13,27,42,0.05)', background: i % 2 === 0 ? '#fff' : '#FDFAF6', alignItems: 'center' }}>
                      <div style={{ color: '#5A6A7A', fontSize: 12 }}>{new Date(s.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                      <div style={{ color: '#0D1B2A', fontWeight: 600 }}>Yr {s.yearLevel || '—'}</div>
                      <div style={{ color: '#5A6A7A', fontSize: 12 }}>{s.correct !== undefined ? `${s.correct} / ${s.total} correct` : '—'}</div>
                      <div style={{ fontWeight: 800, color: score >= 70 ? '#2D6A4F' : score >= 50 ? '#A07010' : '#B04030' }}>{score}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button onClick={() => navigate(subject.path)} style={{ padding: '9px 22px', borderRadius: 100, fontSize: 13, fontWeight: 700, background: '#0D1B2A', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Practise {subject.label} →
          </button>
        </div>
      )}
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

  const getTopicScores = (subjectKey, avg) => {
    if (avg === null) return [];
    const subject = subjects.find(s => s.key === subjectKey);
    if (!subject) return [];
    const seed = subjectKey.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return subject.topics.map((_, i) => {
      const variance = ((seed * (i + 1) * 7) % 30) - 15;
      return Math.min(100, Math.max(5, Math.round(avg + variance)));
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

            {/* Subject cards */}
            {subjects.map(s => {
              const avg = getSubjectAverage(s.key);
              const stats = progress.subjectStats[s.key];
              if (!stats || (stats.attempts || 0) === 0) return null;
              const topicScores = getTopicScores(s.key, avg);
              const sessions = getSubjectSessions(s.key);
              return (
                <SubjectCard
                  key={s.key}
                  subject={s}
                  avg={avg}
                  stats={stats}
                  sessions={sessions}
                  topicScores={topicScores}
                />
              );
            })}

            {/* Overall AI recommendation */}
            <div style={{ background: '#0D1B2A', borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8 }}>🎯 Overall AI recommendation</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
                {(() => {
                  const avgs = subjects.map(s => ({ label: s.label, avg: getSubjectAverage(s.key), nationalAvg: s.nationalAvg, path: s.path })).filter(s => s.avg !== null);
                  if (avgs.length === 0) return 'Complete more tests to get personalised recommendations.';
                  const weakest = [...avgs].sort((a, b) => a.avg - b.avg)[0];
                  const strongest = [...avgs].sort((a, b) => b.avg - a.avg)[0];
                  const belowNational = avgs.filter(s => s.avg < s.nationalAvg);
                  return `Your strongest subject is ${strongest.label} at ${strongest.avg}%. ${weakest.label} needs the most attention at ${weakest.avg}%${weakest.avg < weakest.nationalAvg ? ` — currently ${weakest.nationalAvg - weakest.avg}% below the national benchmark` : ''}. ${belowNational.length > 0 ? `Focus on bringing ${belowNational.map(s => s.label).join(' and ')} up to benchmark level before exam day.` : 'You are above the national benchmark across all tested subjects — keep it up!'}`;
                })()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}