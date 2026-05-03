import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getWeeklyStats, getSubjectAverage, getRecentSessions } from '../lib/progress';

const subjects = [
  { key: 'mathematics', label: 'Mathematics', icon: '🔢', color: '#E8B84B', bg: '#FEF3D0', path: '/app/maths', desc: 'Number, algebra, measurement & more' },
  { key: 'reading', label: 'Reading Comprehension', icon: '📖', color: '#52B788', bg: '#E8F5EE', path: '/app/reading', desc: 'Passages, inference & vocabulary' },
  { key: 'general', label: 'General Ability', icon: '🧩', color: '#7B61FF', bg: '#EEF0FF', path: '/app/general', desc: 'Verbal & non-verbal reasoning' },
  { key: 'writing', label: 'Writing', icon: '✏️', color: '#E07A5F', bg: '#FEE8E2', path: '/app/writing', desc: 'Narrative & persuasive with AI feedback' },
];

export default function Home() {
  const navigate = useNavigate();
  const { yearLevel, user, demoMode } = useAuth();
  const weekly = getWeeklyStats();
  const recent = getRecentSessions(3);

  const name = demoMode ? 'Student' : user?.user_metadata?.name || 'Student';

  return (
    <div>
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(13,27,42,0.08)', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 900, color: '#0D1B2A' }}>Welcome back, {name} 👋</div>
          <div style={{ fontSize: 14, color: '#5A6A7A', marginTop: 2 }}>Practising at Year {yearLevel} level · What would you like to work on today?</div>
        </div>
      </div>

      <div style={{ padding: 32 }}>
        {/* Weekly stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Tests this week', value: weekly.testsCompleted, suffix: '' },
            { label: 'Average score', value: weekly.avgScore || '—', suffix: weekly.avgScore ? '%' : '' },
            { label: 'Time spent', value: weekly.timeSpent || '—', suffix: weekly.timeSpent ? ' min' : '' }
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', border: '1px solid rgba(13,27,42,0.08)' }}>
              <div style={{ fontSize: 12, color: '#5A6A7A', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#0D1B2A' }}>{s.value}<span style={{ fontSize: 16, color: '#5A6A7A' }}>{s.suffix}</span></div>
            </div>
          ))}
        </div>

        {/* Subject cards */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Choose a subject</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {subjects.map(s => {
              const avg = getSubjectAverage(s.key);
              return (
                <button key={s.key} onClick={() => navigate(s.path)} style={{
                  background: '#fff', border: '1px solid rgba(13,27,42,0.08)',
                  borderRadius: 20, padding: 24, cursor: 'pointer',
                  textAlign: 'left', transition: 'all 0.15s',
                  boxShadow: '0 2px 8px rgba(13,27,42,0.04)'
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{s.icon}</div>
                    {avg !== null && (
                      <div style={{ background: avg >= 70 ? '#E8F5EE' : avg >= 50 ? '#FEF3D0' : '#FDEAEA', color: avg >= 70 ? '#2D6A4F' : avg >= 50 ? '#A07010' : '#B04030', padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                        {avg}%
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#0D1B2A', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 13, color: '#5A6A7A' }}>{s.desc}</div>
                  {avg !== null && (
                    <div style={{ marginTop: 12, height: 4, background: '#F0E8D8', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${avg}%`, background: s.color, borderRadius: 2, transition: 'width 0.5s' }}></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent sessions */}
        {recent.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Recent sessions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recent.map((s, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '14px 20px', border: '1px solid rgba(13,27,42,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 20 }}>{subjects.find(sub => sub.key === s.subject)?.icon || '📝'}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0D1B2A', textTransform: 'capitalize' }}>{s.subject === 'general' ? 'General Ability' : s.subject} · Year {s.yearLevel}</div>
                      <div style={{ fontSize: 12, color: '#5A6A7A' }}>{new Date(s.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: (s.score || s.percentage) >= 70 ? '#2D6A4F' : (s.score || s.percentage) >= 50 ? '#A07010' : '#B04030' }}>
                      {s.score || s.percentage}%
                    </div>
                    {s.correct !== undefined && <div style={{ fontSize: 12, color: '#5A6A7A' }}>{s.correct}/{s.total} correct</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDF promo */}
        <div style={{ marginTop: 32, background: '#0D1B2A', borderRadius: 20, padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>📄 Need a printable test?</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>Generate a professional exam-style PDF — just 15¢ per question, with answers and full explanations included.</div>
          </div>
          <button onClick={() => navigate('/pdf-generator')} style={{ background: '#E8B84B', color: '#0D1B2A', padding: '10px 24px', borderRadius: 100, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 24 }}>
            Generate PDF →
          </button>
        </div>
      </div>
    </div>
  );
}