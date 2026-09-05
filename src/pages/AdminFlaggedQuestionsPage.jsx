import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getFlaggedQuestions, resolveFlaggedQuestion } from '../lib/progress';

// ── Admin-only QA review queue ──────────────────────────────────────────────
// Every question a student disputed ("Disagree with this answer?" in a live
// quiz or results screen) or that ai.js's repairInvalidQuestions() still
// couldn't validate after its regenerate attempts lands in the
// flagged_questions table — this page is the "manual check" half of the QA
// pipeline: automated checks catch structural problems (bad options,
// duplicates) at generation time, this page is where a human confirms
// whether an AI-written answer is actually WRONG, since that's something no
// automated checker in this app can verify for open-ended content.
//
// Same admin-gating pattern as AdminPaperBuilderPage.jsx (isAdmin from
// useAuth, redirect to /app otherwise) and the same reads/writes-through-the-
// server-endpoint pattern the rest of this app uses for cross-user data (see
// api/flagged-questions.js).

const SUBJECT_LABELS = { mathematics: 'Mathematics', english: 'English', general: 'General Ability', reading: 'Reading' };
const SUBJECT_COLORS = { mathematics: '#4338CA', english: '#0EA5E9', general: '#F97316', reading: '#059669' };

const tabStyle = (active) => ({
  padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none',
  background: active ? '#4338CA' : '#F1F5F9', color: active ? '#fff' : '#64748B', fontFamily: 'Inter, sans-serif',
});

function OptionsPreview({ q }) {
  if (q?.visual?.answerFrames) {
    return <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif', fontStyle: 'italic' }}>Picture-pattern question — answer is a drawn shape, not shown here.</div>;
  }
  const opts = q?.options || {};
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 10px' }}>
      {['A', 'B', 'C', 'D'].map(letter => (
        <div key={letter} style={{
          fontSize: 12, fontFamily: 'Inter, sans-serif', padding: '4px 8px', borderRadius: 6,
          background: letter === q.correct ? '#DCFCE7' : '#F8FAFC',
          color: letter === q.correct ? '#166534' : '#374151',
          fontWeight: letter === q.correct ? 700 : 400,
          border: `1px solid ${letter === q.correct ? '#86EFAC' : '#E5E7EB'}`,
        }}>
          {letter}. {opts[letter] ?? '—'}
        </div>
      ))}
    </div>
  );
}

function FlaggedCard({ row, onResolve, onDismiss, busy }) {
  const q = row.question || {};
  const subjColor = SUBJECT_COLORS[row.subject] || '#4338CA';
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 1px 4px rgba(67,56,202,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ background: subjColor, color: '#fff', borderRadius: 8, padding: '2px 10px', fontSize: 11, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
          {SUBJECT_LABELS[row.subject] || row.subject || 'Unknown subject'}
        </span>
        {row.topic && <span style={{ fontSize: 11, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>{row.topic}{row.question_type ? ` · ${row.question_type}` : ''}</span>}
        {row.year_level && <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Year {row.year_level}</span>}
        <span style={{
          marginLeft: 'auto', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
          padding: '2px 8px', borderRadius: 100, fontFamily: 'Inter, sans-serif',
          background: row.source === 'dispute' ? '#FEF3C7' : '#EDE9FE',
          color: row.source === 'dispute' ? '#92400E' : '#5B21B6',
        }}>
          {row.source === 'dispute' ? '🚩 Student report' : '🤖 Auto-detected'}
        </span>
      </div>

      <div style={{ fontSize: 14, color: '#0F172A', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, marginBottom: 8 }}>{q.question}</div>
      <div style={{ marginBottom: 10 }}><OptionsPreview q={q} /></div>

      {row.source === 'dispute' && (
        <div style={{ fontSize: 12, color: '#92400E', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '8px 10px', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>
          Student believes the correct answer is{' '}
          <strong>{row.reported_correct && ['A', 'B', 'C', 'D'].includes(row.reported_correct) ? `${row.reported_correct}. ${q.options?.[row.reported_correct] ?? ''}` : `"${row.reported_correct || '(unspecified)'}"`}</strong>.
        </div>
      )}
      {row.source === 'auto' && Array.isArray(row.issues) && row.issues.length > 0 && (
        <div style={{ fontSize: 12, color: '#5B21B6', background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 8, padding: '8px 10px', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>
          Still failed QA after regenerate attempts:
          <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
            {row.issues.map((issue, i) => <li key={i}>{issue}</li>)}
          </ul>
        </div>
      )}
      {q.explanation && <div style={{ fontSize: 12, color: '#64748B', fontFamily: 'Inter, sans-serif', lineHeight: 1.5, marginBottom: 10 }}>💡 {q.explanation}</div>}

      <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'Inter, sans-serif', marginBottom: 10 }}>
        Flagged {row.created_at ? new Date(row.created_at).toLocaleString('en-AU') : ''}
      </div>

      {row.status === 'open' ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <button disabled={busy} onClick={() => onResolve(row.id)} style={{ padding: '7px 16px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: '#059669', color: '#fff', border: 'none', cursor: busy ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif' }}>✓ Mark resolved</button>
          <button disabled={busy} onClick={() => onDismiss(row.id)} style={{ padding: '7px 16px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: '#fff', color: '#64748B', border: '1.5px solid #E5E7EB', cursor: busy ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif' }}>Dismiss</button>
        </div>
      ) : (
        <div style={{ fontSize: 12, fontWeight: 700, color: row.status === 'resolved' ? '#059669' : '#94A3B8', fontFamily: 'Inter, sans-serif' }}>
          {row.status === 'resolved' ? '✓ Resolved' : 'Dismissed'}
        </div>
      )}
    </div>
  );
}

export default function AdminFlaggedQuestionsPage() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('open');
  const [rows, setRows] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async (st) => {
    setDataLoading(true);
    const data = await getFlaggedQuestions(st);
    setRows(data);
    setDataLoading(false);
  }, []);

  useEffect(() => { load(status); }, [status, load]);

  if (loading) return null;
  if (!isAdmin) return <Navigate to="/app" replace />;

  const handleUpdate = async (id, newStatus) => {
    setBusyId(id);
    const ok = await resolveFlaggedQuestion(id, newStatus);
    if (ok) setRows(prev => prev.filter(r => r.id !== id));
    setBusyId(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F7FF' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(67,56,202,0.08)', padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🚩</div>
        <div>
          <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 800, color: '#0F172A', letterSpacing: -0.3 }}>Flagged Questions</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>Admin only · student reports and auto-detected QA failures</div>
        </div>
        <button onClick={() => navigate('/admin')} style={{ marginLeft: 'auto', padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>← Admin dashboard</button>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: 32 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['open', 'resolved', 'dismissed'].map(st => (
            <button key={st} onClick={() => setStatus(st)} style={tabStyle(status === st)}>
              {st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>

        {dataLoading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #EEF2FF', borderTop: '3px solid #4338CA', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!dataLoading && rows.length === 0 && (
          <div style={{ background: '#fff', borderRadius: 20, padding: 40, textAlign: 'center', border: '1px solid rgba(67,56,202,0.08)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 15, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>Nothing {status === 'open' ? 'flagged right now' : status} — all clear.</div>
          </div>
        )}

        {!dataLoading && rows.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rows.map(row => (
              <FlaggedCard
                key={row.id}
                row={row}
                busy={busyId === row.id}
                onResolve={(id) => handleUpdate(id, 'resolved')}
                onDismiss={(id) => handleUpdate(id, 'dismissed')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
