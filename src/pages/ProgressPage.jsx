import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getProgress, getSubjectAverage, getWeeklyStats, getRecentSessions } from '../lib/progress';

const subjects = [
  { key: 'mathematics', label: 'Mathematics', icon: '🔢', color: '#E8B84B', path: '/app/maths',
    topics: ['Number operations','Fractions & decimals','Percentages','Geometry','Measurement','Time & distance','Word problems','Algebra'] },
  { key: 'reading', label: 'Reading Comprehension', icon: '📖', color: '#52B788', path: '/app/reading',
    topics: ['Literal comprehension','Inference','Vocabulary in context','Main idea','Author\'s purpose','Text type identification'] },
  { key: 'general', label: 'General Ability', icon: '🧩', color: '#7B61FF', path: '/app/general',
    topics: ['Verbal analogies','Number sequences','Letter patterns','Odd one out','Logic problems','Spatial reasoning'] },
  { key: 'writing', label: 'Writing', icon: '✏️', color: '#E07A5F', path: '/app/writing',
    topics: ['Ideas & content','Structure & organisation','Language & vocabulary','Sentence structure','Punctuation & spelling'] }
];

export default function ProgressPage() {
  const navigate = useNavigate();
  const { yearLevel } = useAuth();
  const progress = getProgress();
  const weekly = getWeeklyStats();
  const recent = getRecentSessions(10);
  const totalTests = progress.sessions.length;
  const overallAvg = totalTests > 0
    ? Math.round(progress.sessions.reduce((s, sess) => s + (sess.score || sess.percentage || 0), 0) / totalTests)
    : null;

  const getSubjectSessions = (key) => recent.filter(s => s.subject === key).slice(0, 5);

  return (
    <div>
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(13,27,42,0.08)', padding: '20px 32px' }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 900, color: '#0D1B2A' }}>📊 Progress Report</div>
        <div style={{ fontSize: 14, color: '#5A6A7A', marginTop: 2 }}>Track your performance across all subjects</div>
      </div>

      <div style={{ padding: 32 }}>
        {totalTests === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 900, color: '#0D1B2A', marginBottom: 8 }}>No results yet</div>
            <div style={{ fontSize: 15, color: '#5A6A7A', marginBottom: 24 }}>Complete your first practice test to start tracking progress</div>
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
                { label: 'Time spent', value: `${Math.round(totalTests * 15)}m` }
              ].map((s, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid rgba(13,27,42,0.08)' }}>
                  <div style={{ fontSize: 11, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#0D1B2A' }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Subject breakdown */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Performance by subject</div>
            </div>
            {subjects.map(s => {
              const avg = getSubjectAverage(s.key);
              const stats = progress.subjectStats[s.key];
              const sessions = getSubjectSessions(s.key);
              if (!stats || (stats.attempts || 0) === 0) return null;

              return (
                <div key={s.key} style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(13,27,42,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{s.icon}</div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#0D1B2A' }}>{s.label}</div>
                        <div style={{ fontSize: 12, color: '#5A6A7A' }}>{stats.attempts} session{stats.attempts !== 1 ? 's' : ''} completed</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 28, fontWeight: 700, color: avg >= 70 ? '#2D6A4F' : avg >= 50 ? '#A07010' : '#B04030' }}>{avg}%</div>
                      <div style={{ fontSize: 12, color: '#5A6A7A' }}>average</div>
                    </div>
                  </div>

                  <div style={{ height: 8, background: '#F0E8D8', borderRadius: 4, marginBottom: 16, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${avg}%`, background: s.color, borderRadius: 4, transition: 'width 0.5s' }}></div>
                  </div>

                  {/* Recent session scores */}
                  {sessions.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#5A6A7A', marginBottom: 8 }}>Recent scores</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {sessions.map((sess, i) => (
                          <div key={i} style={{
                            padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                            background: (sess.score || sess.percentage) >= 70 ? '#E8F5EE' : (sess.score || sess.percentage) >= 50 ? '#FEF3D0' : '#FDEAEA',
                            color: (sess.score || sess.percentage) >= 70 ? '#2D6A4F' : (sess.score || sess.percentage) >= 50 ? '#A07010' : '#B04030'
                          }}>
                            {sess.score || sess.percentage}%
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button onClick={() => navigate(s.path)} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#FAF6EE', color: '#0D1B2A', border: '1px solid rgba(13,27,42,0.12)', cursor: 'pointer' }}>
                    Practise {s.label} →
                  </button>
                </div>
              );
            })}

            {/* Recent sessions table */}
            {recent.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Session history</div>
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(13,27,42,0.08)', overflow: 'hidden' }}>
                  {recent.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < recent.length - 1 ? '1px solid rgba(13,27,42,0.05)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ fontSize: 20 }}>{subjects.find(sub => sub.key === s.subject)?.icon || '📝'}</div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#0D1B2A', textTransform: 'capitalize' }}>
                            {s.subject === 'general' ? 'General Ability' : s.subject} {s.type ? `· ${s.type}` : ''} · Year {s.yearLevel}
                          </div>
                          <div style={{ fontSize: 12, color: '#5A6A7A' }}>{new Date(s.date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: (s.score || s.percentage) >= 70 ? '#2D6A4F' : (s.score || s.percentage) >= 50 ? '#A07010' : '#B04030' }}>
                          {s.score || s.percentage}%
                        </div>
                        {s.correct !== undefined && <div style={{ fontSize: 12, color: '#5A6A7A' }}>{s.correct}/{s.total}</div>}
                        {s.totalScore !== undefined && <div style={{ fontSize: 12, color: '#5A6A7A' }}>{s.totalScore}/{s.maxScore}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div style={{ marginTop: 24, background: '#0D1B2A', borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8 }}>🎯 Focus recommendations</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                {(() => {
                  const avgs = subjects.map(s => ({ label: s.label, avg: getSubjectAverage(s.key), path: s.path })).filter(s => s.avg !== null);
                  if (avgs.length === 0) return 'Complete more tests to get personalised recommendations.';
                  const weakest = avgs.sort((a, b) => a.avg - b.avg)[0];
                  return `Based on your results, focus more practice on ${weakest.label} (${weakest.avg}% average). Aim for 70%+ across all subjects before exam day.`;
                })()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
