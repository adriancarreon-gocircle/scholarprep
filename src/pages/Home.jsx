import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getWeeklyStats, getSubjectAverage, getRecentSessions } from '../lib/progress';

const subjects = [
  { key: 'mathematics', label: 'Mathematics', icon: '🔢', color: '#4338CA', bg: '#EEF2FF', path: '/app/maths', desc: 'Number, algebra, measurement & more' },
  { key: 'reading', label: 'Reading Comprehension', icon: '📖', color: '#059669', bg: '#ECFDF5', path: '/app/reading', desc: 'Passages, inference & vocabulary' },
  { key: 'general', label: 'General Ability', icon: '🧩', color: '#F97316', bg: '#FFF7ED', path: '/app/general', desc: 'Verbal & non-verbal reasoning' },
  { key: 'writing', label: 'Writing', icon: '✏️', color: '#F43F5E', bg: '#FFF1F2', path: '/app/writing', desc: 'Narrative & persuasive with detailed feedback' },
];

export default function Home() {
  const navigate = useNavigate();
  const { yearLevel, user, demoMode } = useAuth();
  const [weekly, setWeekly] = useState({ testsCompleted: 0, avgScore: 0, timeSpent: 0 });
  const [subjectAverages, setSubjectAverages] = useState({});
  const [recent, setRecent] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const name = demoMode ? 'Student' : user?.user_metadata?.name || user?.email?.split('@')[0] || 'Student';

  useEffect(() => {
    const loadStats = async () => {
      setLoadingStats(true);
      try {
        const [weeklyData, recentData, ...averages] = await Promise.all([
          getWeeklyStats(),
          getRecentSessions(3),
          ...subjects.map(s => getSubjectAverage(s.key))
        ]);
        setWeekly(weeklyData);
        setRecent(recentData);
        const avgs = {};
        subjects.forEach((s, i) => { avgs[s.key] = averages[i]; });
        setSubjectAverages(avgs);
      } catch (e) {
        console.error('Failed to load stats:', e);
      }
      setLoadingStats(false);
    };
    loadStats();
  }, [user]);

  return (
    <div>
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(67,56,202,0.08)', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 900, color: '#0F172A', letterSpacing: -0.5 }}>Welcome back, {name} 👋</div>
          <div style={{ fontSize: 14, color: '#64748B', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>Practising at Year {yearLevel} level · What would you like to work on today?</div>
        </div>
      </div>

      <div style={{ padding: 32 }}>
        {/* Weekly stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Tests this week', value: loadingStats ? '—' : weekly.testsCompleted, suffix: '' },
            { label: 'Average score', value: loadingStats ? '—' : (weekly.avgScore || '—'), suffix: weekly.avgScore ? '%' : '' },
            { label: 'Time spent', value: loadingStats ? '—' : (weekly.timeSpent || '—'), suffix: weekly.timeSpent ? ' min' : '' }
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 2px 8px rgba(67,56,202,0.04)' }}>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>{s.label}</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.value}<span style={{ fontSize: 16, color: '#94A3B8' }}>{s.suffix}</span></div>
            </div>
          ))}
        </div>

        {/* Subject cards */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16, fontFamily: 'Inter, sans-serif' }}>Choose a subject</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {subjects.map(s => {
              const avg = subjectAverages[s.key];
              return (
                <button key={s.key} onClick={() => navigate(s.path)} style={{
                  background: '#fff', border: '1px solid rgba(67,56,202,0.08)',
                  borderRadius: 20, padding: 24, cursor: 'pointer',
                  textAlign: 'left', transition: 'all 0.15s',
                  boxShadow: '0 2px 8px rgba(67,56,202,0.04)'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(67,56,202,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(67,56,202,0.04)'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{s.icon}</div>
                    {avg !== null && avg !== undefined && (
                      <div style={{ background: avg >= 70 ? '#ECFDF5' : avg >= 50 ? '#EEF2FF' : '#FFF1F2', color: avg >= 70 ? '#059669' : avg >= 50 ? '#4338CA' : '#F43F5E', padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
                        {avg}%
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 4, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.label}</div>
                  <div style={{ fontSize: 13, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>{s.desc}</div>
                  {avg !== null && avg !== undefined && (
                    <div style={{ marginTop: 12, height: 4, background: '#F1F5F9', borderRadius: 2, overflow: 'hidden' }}>
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
            <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16, fontFamily: 'Inter, sans-serif' }}>Recent sessions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recent.map((s, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '14px 20px', border: '1px solid rgba(67,56,202,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(67,56,202,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 20 }}>{subjects.find(sub => sub.key === s.subject)?.icon || '📝'}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', textTransform: 'capitalize', fontFamily: 'Inter, sans-serif' }}>
                        {s.subject === 'general' ? 'General Ability' : s.subject} · Year {s.yearLevel}
                      </div>
                      <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>
                        {new Date(s.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif', color: (s.score || s.percentage) >= 70 ? '#059669' : (s.score || s.percentage) >= 50 ? '#4338CA' : '#F43F5E' }}>
                      {s.score || s.percentage}%
                    </div>
                    {s.correct !== undefined && s.total !== undefined && (
                      <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>{s.correct}/{s.total} correct</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDF promo */}
        <div style={{ marginTop: 32, background: '#3730A3', borderRadius: 20, padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>📄 Need a printable test?</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter, sans-serif' }}>Generate a professional exam-style PDF — just 15¢ per question, with answers and full explanations included.</div>
          </div>
          <button onClick={() => navigate('/pdf-generator')} style={{ background: '#F97316', color: '#fff', padding: '10px 24px', borderRadius: 100, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}>
            Generate PDF →
          </button>
        </div>
      </div>
    </div>
  );
}