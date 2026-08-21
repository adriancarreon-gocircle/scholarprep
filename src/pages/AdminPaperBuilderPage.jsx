import React, { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { generateMathsQuestions, generateReadingQuestions, generateGeneralAbilityQuestions, generateEnglishQuestions, generateFreshVariant, matchLocalMathsType, fingerprintQuestion } from '../lib/ai';
import { getCustomTemplates, saveCustomTemplate, savePaperTest, getPaperTests, deletePaperTest, getPooledQuestions, getPoolBucketDepth, refillPoolBucket } from '../lib/progress';
import { QUESTION_BANK, generateFromTemplate, CustomQuestionCreator } from './CustomTestPage';

// ── Admin-only Paper Test Builder ───────────────────────────────────────────
// Mirrors the Custom Test builder (same QUESTION_BANK, same subject → topic →
// question-type drill-down, same saved custom templates) but instead of
// starting an on-screen quiz, it lets an admin review every generated
// question up front, regenerate any that look repeated, then produce a
// printable PDF paper test + blank answer sheet + answer key.
//
// Deliberately admin-only (gated below, and only reachable via a direct
// route — not linked from any subscriber-facing page): unlimited on-demand
// printable papers is meaningfully more value than the $9.99/mo or
// 15c/question offers, and would be trivial to abuse during the 7-day trial.

const YEAR_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const btnStyle = { width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 16, fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const smallBtnStyle = { width: 24, height: 24, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' };

// Phase 2 — try the shared pool before generating live. Any shortfall is
// filled by a live AI/local call (identical to today's behaviour), and the
// freshly-generated top-up is contributed back to the pool for next time.
// Scoped to mathematics for now — same pattern can be extended to
// english/general later. Never blocks the paper on the pool: every pool call
// is best-effort and empty results just mean 100% live generation, same as
// before this existed.
async function getMathsQuestionsPooledOrLive(yearLevel, count, tk, qtk, focusStr, seenFp, localKey) {
  const bucketQtk = qtk === '_topic' ? null : qtk;
  const pooled = await getPooledQuestions('mathematics', tk, bucketQtk, yearLevel, count);
  if (pooled.length >= count) {
    getPoolBucketDepth('mathematics', tk, bucketQtk, yearLevel).then(depth => {
      if (depth < 30) {
        generateMathsQuestions(yearLevel, 10, focusStr, seenFp, localKey)
          .then(fresh => refillPoolBucket('mathematics', tk, bucketQtk, yearLevel, fresh))
          .catch(() => { });
      }
    }).catch(() => { });
    return pooled.slice(0, count);
  }
  const needed = count - pooled.length;
  const live = await generateMathsQuestions(yearLevel, needed, focusStr, seenFp, localKey);
  refillPoolBucket('mathematics', tk, bucketQtk, yearLevel, live).catch(() => { });
  return [...pooled, ...live];
}

// ── Question generation (adapted from CustomTestPage's QuizScreen.generateAllQuestions) ──

async function generateAllPaperQuestions(selection, passages, questionsPerPassage, yearLevel, customTemplates, setMsg, options = {}) {
  const { bypassPool = false, seedFingerprints = [] } = options;
  const allQs = [];
  const groups = [];
  // Accumulated across the whole paper so later calls avoid repeating
  // anything already generated earlier in this same paper — per-call
  // anti-repeat instructions alone can't see across separate calls. Seeded
  // with the CURRENTLY-DISPLAYED questions when this is a "give me a fresh
  // set" regenerate, so live generation actively avoids repeating what's
  // already on screen too, not just avoiding duplicates within the new batch.
  const seenFp = [...seedFingerprints];
  const usedSeeds = [];

  for (const sk of Object.keys(QUESTION_BANK)) {
    const topicSel = selection[sk];
    if (!topicSel) continue;

    if (sk === 'reading') {
      setMsg('Generating reading passages');
      for (let i = 0; i < passages; i++) {
        const data = await generateReadingQuestions(yearLevel, questionsPerPassage, undefined, usedSeeds);
        if (data._seedUsed) usedSeeds.push(data._seedUsed);
        groups.push(data);
      }
      allQs.push(...groups.flatMap(g => g.questions.map(q => ({ ...q, _subj: 'reading' }))));
      continue;
    }

    if (sk === 'custom') {
      for (const [selKey, count] of Object.entries(topicSel)) {
        if (!count || !selKey.startsWith('_custom_')) continue;
        const tmplId = selKey.replace('_custom_', '');
        const tmpl = customTemplates?.find(t => t.id === tmplId);
        if (!tmpl) continue;
        const tmplSubj = (tmpl.subject && tmpl.subject !== 'custom') ? tmpl.subject : 'mathematics';
        const saved = (tmpl.questions || []).map(q => ({ ...q, _subj: q._subj && q._subj !== 'custom' ? q._subj : tmplSubj }));
        if (saved.length >= count) {
          const shuffled = [...saved].sort(() => Math.random() - 0.5);
          allQs.push(...shuffled.slice(0, count));
        } else {
          allQs.push(...saved);
          const needed = count - saved.length;
          if (needed > 0 && tmpl.exampleQuestion && tmpl.exampleQuestion !== '(from image)') {
            setMsg(`Generating ${needed} more question${needed > 1 ? 's' : ''} from "${tmpl.name}"`);
            try {
              const result = await generateFromTemplate(tmpl.exampleQuestion, tmplSubj, tmpl.questionType || null, needed, yearLevel, null, null);
              const extras = (result.questions || []).slice(0, needed).map(q => ({
                ...q, _subj: tmplSubj,
                topic: q.topic || tmplSubj,
                questionType: q.questionType || tmpl.questionType || 'Custom',
              }));
              allQs.push(...extras);
            } catch {
              for (let r = 0; r < needed; r++) allQs.push({ ...saved[r % saved.length], _generatedCopy: true });
            }
          } else {
            for (let r = 0; r < needed; r++) allQs.push({ ...saved[r % saved.length], _generatedCopy: true });
          }
        }
      }
      continue;
    }

    // mathematics / english / general — same exclusion-clause + per-topic/qtype pattern as CustomTestPage
    const allTopicLabels = QUESTION_BANK[sk].topics.map(t => t.label);
    const selectedTopics = new Set();
    for (const [tk] of Object.entries(topicSel)) {
      const tObj = QUESTION_BANK[sk].topics.find(t => t.key === tk);
      if (tObj) selectedTopics.add(tObj.label);
    }
    const excluded = allTopicLabels.filter(l => !selectedTopics.has(l));
    const exclusionClause = excluded.length > 0 ? `\nSTRICTLY FORBIDDEN topics — do NOT generate any of: ${excluded.join(', ')}.` : '';
    const generator = sk === 'mathematics' ? generateMathsQuestions : sk === 'english' ? generateEnglishQuestions : generateGeneralAbilityQuestions;
    const label = sk === 'mathematics' ? 'maths' : sk === 'english' ? 'English' : 'general ability';
    setMsg(`Generating ${label} questions`);

    for (const [tk, qtSel] of Object.entries(topicSel)) {
      for (const [qtk, count] of Object.entries(qtSel)) {
        if (!count) continue;
        const tObj = QUESTION_BANK[sk].topics.find(t => t.key === tk);
        const qtObj = tObj?.questionTypes.find(q => q.key === qtk);
        const focusStr = qtk === '_topic'
          ? `Generate exactly ${count} question${count > 1 ? 's' : ''} ONLY on: "${tObj?.label || tk}" — vary question types within this topic.${exclusionClause}`
          : qtObj
            ? `Generate exactly ${count} question${count > 1 ? 's' : ''} ONLY on: "${tObj?.label} — ${qtObj.label}". Example: ${qtObj.examples?.[0] || ''}${exclusionClause}`
            : null;
        if (!focusStr) continue;
        // Mathematics goes through the shared pool first (Phase 2), UNLESS
        // this is a "give me a fresh set" regenerate (bypassPool) — a pool
        // bucket that's only ever been seeded by THIS paper can otherwise
        // just re-serve the exact same questions back, which defeats the
        // purpose of asking for something new. English/general go straight
        // to the AI generator either way (pooling not extended to them yet).
        const localKey = matchLocalMathsType(tk, qtk);
        const genQs = sk === 'mathematics'
          ? (bypassPool
            ? await generateMathsQuestions(yearLevel, count, focusStr, seenFp, localKey)
            : await getMathsQuestionsPooledOrLive(yearLevel, count, tk, qtk, focusStr, seenFp, localKey))
          : await generator(yearLevel, count, focusStr, seenFp);
        // Still contribute freshly-generated maths questions back to the
        // pool even when bypassing it for THIS request — future users still
        // benefit, this paper just doesn't get served stale content itself.
        if (sk === 'mathematics' && bypassPool) {
          refillPoolBucket('mathematics', tk, qtk === '_topic' ? null : qtk, yearLevel, genQs).catch(() => { });
        }
        seenFp.push(...genQs.map(fingerprintQuestion));
        allQs.push(...genQs.slice(0, count).map(q => ({ ...q, _subj: sk, topic: tk, questionType: q.questionType || qtObj?.label || tObj?.label || tk })));
      }
    }
  }

  return { questions: allQs, passageGroups: groups };
}

// ── Saved papers list ────────────────────────────────────────────────────────

function SavedPapersList({ papers, loading, onOpen, onDelete, onCreateNew, onOpenCreator }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this saved paper? This can\'t be undone.')) return;
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  return (
    <div style={{ maxWidth: 740, margin: '0 auto', padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>Saved papers</h2>
          <p style={{ fontSize: 14, color: '#64748B', margin: '4px 0 0', fontFamily: 'Inter, sans-serif' }}>Open a saved paper to view, edit, or reprint it — or start a new one.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <button onClick={onOpenCreator} style={{ padding: '10px 20px', borderRadius: 100, fontSize: 14, fontWeight: 700, background: '#F97316', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>✨ Question Creator</button>
          <button onClick={onCreateNew} style={{ padding: '10px 20px', borderRadius: 100, fontSize: 14, fontWeight: 700, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>+ New Paper</button>
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', flexDirection: 'column', gap: 14 }}>
          <div style={{ width: 32, height: 32, border: '3px solid #EEF2FF', borderTop: '3px solid #4338CA', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {!loading && papers.length === 0 && (
        <div style={{ background: '#fff', borderRadius: 20, padding: 40, textAlign: 'center', border: '1px solid rgba(67,56,202,0.08)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🗞️</div>
          <div style={{ fontSize: 15, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>No saved papers yet. Build one and hit Save to keep it here.</div>
        </div>
      )}

      {!loading && papers.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {papers.map(p => (
            <div key={p.id} style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', border: '1px solid rgba(67,56,202,0.08)', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 4px rgba(67,56,202,0.04)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 3 }}>{p.title || 'Untitled Paper'}</div>
                <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>
                  Year {p.yearLevel} · {p.questionCount} question{p.questionCount !== 1 ? 's' : ''} · updated {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('en-AU') : '—'}
                </div>
              </div>
              <button onClick={() => onOpen(p)} style={{ padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 700, background: '#EEF2FF', color: '#4338CA', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', flexShrink: 0 }}>Open</button>
              <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} style={{ padding: '8px 14px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#fff', color: '#F43F5E', border: '1.5px solid #FECDD3', cursor: deletingId === p.id ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', flexShrink: 0 }}>
                {deletingId === p.id ? '…' : '🗑'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Builder screen ──────────────────────────────────────────────────────────

function PaperBuilderScreen({ customTemplates, yearLevel, setYearLevel, paperTitle, setPaperTitle, selection, setSelection, passages, setPassages, questionsPerPassage, setQuestionsPerPassage, onGenerate, onBackToList, error }) {
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});
  const [expandedQTypes, setExpandedQTypes] = useState({});

  const getTotalForSubject = (sk) => {
    if (sk === 'reading') return Object.keys(selection.reading || {}).length > 0 ? passages * questionsPerPassage : 0;
    if (sk === 'custom') return Object.values(selection.custom || {}).reduce((s, n) => s + (typeof n === 'number' ? n : 0), 0);
    const s = selection[sk] || {};
    return Object.values(s).reduce((sum, t) => sum + Object.values(t).reduce((a, n) => a + n, 0), 0);
  };
  const totalQuestions = Object.keys(QUESTION_BANK).reduce((sum, sk) => sum + getTotalForSubject(sk), 0);

  const setQtCount = (sk, tk, qtk, count) => setSelection(prev => ({
    ...prev, [sk]: { ...prev[sk], [tk]: { ...(prev[sk]?.[tk] || {}), [qtk]: Math.max(0, count) } }
  }));
  const getQtCount = (sk, tk, qtk) => selection[sk]?.[tk]?.[qtk] || 0;
  const getTopicTotal = (sk, tk) => Object.values(selection[sk]?.[tk] || {}).reduce((s, n) => s + n, 0);
  const toggleReading = () => setSelection(prev => prev.reading ? (({ reading, ...r }) => r)(prev) : { ...prev, reading: { comprehension: { mixed: 1 } } });
  const isReadingSelected = !!selection.reading;

  return (
    <div style={{ maxWidth: 740, margin: '0 auto', padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Build a paper test</h2>
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24, fontFamily: 'Inter, sans-serif' }}>
            Same subjects and custom questions as the student Custom Test builder. Pick your mix, then review and regenerate individual questions before saving or producing the printable PDF.
          </p>
        </div>
        <button onClick={onBackToList} style={{ padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', flexShrink: 0 }}>← Saved papers</button>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, padding: 20, marginBottom: 14, border: '1px solid rgba(67,56,202,0.08)' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 240px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>Paper title</div>
            <input value={paperTitle} onChange={e => setPaperTitle(e.target.value)} placeholder="e.g. Term 3 Selective Entry Practice" style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '10px 12px', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none' }} />
          </div>
          <div style={{ flex: '1 1 240px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>Year level</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {YEAR_LEVELS.map(y => (
                <button key={y} onClick={() => setYearLevel(y)} style={{
                  padding: '6px 0', width: 42, borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  background: yearLevel === y ? '#4338CA' : '#F8F9FF', color: yearLevel === y ? '#fff' : '#64748B',
                  border: yearLevel === y ? 'none' : '1.5px solid rgba(67,56,202,0.1)', fontFamily: 'Inter, sans-serif',
                }}>Yr {y}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {Object.entries(QUESTION_BANK).map(([sk, subj]) => {
        const subjTotal = getTotalForSubject(sk);
        const isExp = expandedSubjects[sk];
        const isReading = sk === 'reading';
        const isCustom = sk === 'custom';
        return (
          <div key={sk} style={{ background: '#fff', borderRadius: 16, marginBottom: 10, border: `1.5px solid ${subjTotal > 0 ? subj.color : 'rgba(67,56,202,0.08)'}`, overflow: 'hidden' }}>
            <div onClick={() => setExpandedSubjects(p => ({ ...p, [sk]: !p[sk] }))} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', cursor: 'pointer', background: subjTotal > 0 ? subj.lightBg : '#fff' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: subj.lightBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{subj.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{subj.label}</div>
                {subjTotal > 0 && <div style={{ fontSize: 12, color: subj.color, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{subjTotal} question{subjTotal !== 1 ? 's' : ''} selected</div>}
              </div>
              <span style={{ fontSize: 11, color: '#94A3B8' }}>{isExp ? '▼' : '▶'}</span>
            </div>

            {isExp && (
              <div style={{ borderTop: '1px solid rgba(67,56,202,0.06)', padding: '8px 0' }}>
                {isCustom ? (
                  (customTemplates || []).length === 0 ? (
                    <div style={{ padding: '20px 24px', color: '#94A3B8', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>No custom questions yet.</div>
                  ) : (
                    <div>
                      {(customTemplates || []).map(tmpl => {
                        const selKey = '_custom_' + tmpl.id;
                        const count = selection['custom']?.[selKey] || 0;
                        return (
                          <div key={tmpl.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 20px', borderBottom: '1px solid #F8FAFC', background: count > 0 ? '#F5F3FF' : '#fff' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', fontFamily: 'Inter, sans-serif', marginBottom: 2 }}>{tmpl.name}</div>
                              <div style={{ fontSize: 11, color: '#7C3AED', fontFamily: 'Inter, sans-serif' }}>
                                {tmpl.subject ? tmpl.subject.charAt(0).toUpperCase() + tmpl.subject.slice(1) : 'Custom'}{tmpl.questionType ? ` · ${tmpl.questionType}` : ''}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginTop: 2 }}>
                              <button onClick={() => setSelection(prev => { const s = { ...prev }; if (!s.custom) s.custom = {}; s.custom[selKey] = Math.max(0, (s.custom[selKey] || 0) - 1); return s; })} style={smallBtnStyle}>-</button>
                              <span style={{ fontSize: 13, fontWeight: 700, color: count > 0 ? '#7C3AED' : '#94A3B8', minWidth: 20, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{count}</span>
                              <button onClick={() => setSelection(prev => { const s = { ...prev }; if (!s.custom) s.custom = {}; s.custom[selKey] = (s.custom[selKey] || 0) + 1; return s; })} style={smallBtnStyle}>+</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : isReading ? (
                  <div style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <input type="checkbox" checked={isReadingSelected} onChange={toggleReading} style={{ width: 18, height: 18, accentColor: subj.color, cursor: 'pointer' }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', fontFamily: 'Inter, sans-serif' }}>Include reading passages in this paper</span>
                    </div>
                    {isReadingSelected && (
                      <div style={{ background: '#F0FDF4', borderRadius: 12, padding: '14px 18px', border: '1px solid rgba(5,150,105,0.15)' }}>
                        {[['Number of passages', passages, setPassages, 1, 5], ['Questions per passage', questionsPerPassage, setQuestionsPerPassage, 1, 10]].map(([lbl, val, setter, min, max], i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i === 0 ? '1px solid rgba(5,150,105,0.1)' : 'none' }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', fontFamily: 'Inter, sans-serif' }}>{lbl}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <button onClick={() => setter(v => Math.max(min, v - 1))} style={btnStyle}>-</button>
                              <span style={{ fontSize: 14, fontWeight: 700, color: subj.color, minWidth: 24, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{val}</span>
                              <button onClick={() => setter(v => Math.min(max, v + 1))} style={btnStyle}>+</button>
                            </div>
                          </div>
                        ))}
                        <div style={{ marginTop: 10, fontSize: 12, color: subj.color, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{passages} x {questionsPerPassage} = {passages * questionsPerPassage} questions total</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {subj.topics.map(topic => {
                      const tTotal = getTopicTotal(sk, topic.key);
                      const tKey = `${sk}.${topic.key}`;
                      const isTExp = expandedTopics[tKey];
                      const topicDirectCount = getQtCount(sk, topic.key, '_topic');
                      return (
                        <div key={topic.key} style={{ borderBottom: '1px solid #F8FAFC' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px 10px 24px' }}>
                            <button onClick={() => setExpandedTopics(p => ({ ...p, [tKey]: !p[tKey] }))} style={{ fontSize: 10, color: isTExp ? subj.color : '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', flexShrink: 0 }}>{isTExp ? '▼' : '▶'}</button>
                            <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#0F172A', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }} onClick={() => setExpandedTopics(p => ({ ...p, [tKey]: !p[tKey] }))}>{topic.label}</span>
                            {tTotal > 0 && <span style={{ fontSize: 12, color: subj.color, fontWeight: 700, fontFamily: 'Inter, sans-serif', marginRight: 4 }}>({tTotal}q)</span>}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <button onClick={() => setQtCount(sk, topic.key, '_topic', topicDirectCount - 1)} style={smallBtnStyle}>-</button>
                              <span style={{ fontSize: 13, fontWeight: 700, color: topicDirectCount > 0 ? subj.color : '#94A3B8', minWidth: 20, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{topicDirectCount}</span>
                              <button onClick={() => setQtCount(sk, topic.key, '_topic', topicDirectCount + 1)} style={smallBtnStyle}>+</button>
                            </div>
                          </div>
                          {isTExp && (
                            <div style={{ background: '#F8FAFF', borderTop: '1px solid #EEF2FF', paddingBottom: 6 }}>
                              {topic.questionTypes.map(qt => {
                                const count = getQtCount(sk, topic.key, qt.key);
                                return (
                                  <div key={qt.key} style={{ padding: '8px 20px 8px 48px', borderBottom: '1px solid #EEF2FF' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <span style={{ flex: 1, fontSize: 13, fontWeight: count > 0 ? 700 : 500, color: count > 0 ? subj.color : '#374151', fontFamily: 'Inter, sans-serif' }}>{qt.label}</span>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <button onClick={() => setQtCount(sk, topic.key, qt.key, count - 1)} style={smallBtnStyle}>-</button>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: count > 0 ? subj.color : '#94A3B8', minWidth: 20, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{count}</span>
                                        <button onClick={() => setQtCount(sk, topic.key, qt.key, count + 1)} style={smallBtnStyle}>+</button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      {error && (
        <div style={{ background: '#FFF1F2', border: '1px solid #FDA4AF', borderRadius: 14, padding: '14px 18px', marginBottom: 16, fontSize: 14, color: '#BE123C', fontFamily: 'Inter, sans-serif' }}>⚠️ {error}</div>
      )}

      <button
        onClick={() => onGenerate()}
        disabled={totalQuestions === 0}
        style={{
          width: '100%', padding: '16px', borderRadius: 100, fontSize: 16, fontWeight: 700, border: 'none',
          background: totalQuestions === 0 ? '#E5E7EB' : '#4338CA', color: totalQuestions === 0 ? '#9CA3AF' : '#fff',
          cursor: totalQuestions === 0 ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif',
          boxShadow: totalQuestions === 0 ? 'none' : '0 4px 16px rgba(67,56,202,0.3)', marginTop: 4,
        }}
      >
        {totalQuestions === 0 ? 'Select at least one question' : `Generate ${totalQuestions} questions →`}
      </button>
    </div>
  );
}

// ── Review + regenerate screen ──────────────────────────────────────────────

function ReviewScreen({ questions, passageGroups, questionsPerPassage, yearLevel, paperTitle, onTitleChange, isSaved, hasSelection, onRegenerateAll, onEditSelection, onBackToList, onQuestionsChange, onDownload, downloading, onSave, saving, justSaved }) {
  const [regeneratingIdx, setRegeneratingIdx] = useState(null);
  // Tracks every variant already shown at each question index this session,
  // so repeated Regenerate clicks on the same question don't cycle back
  // through a small set of favourites.
  const regenHistoryRef = useRef({});
  let readingSeen = 0; // tracks position within the reading section as we render, to know which passage group we're in

  const handleRegenerate = async (idx) => {
    if (regeneratingIdx !== null) return;
    setRegeneratingIdx(idx);
    try {
      const q = questions[idx];
      const subj = q._subj || 'mathematics';
      const history = regenHistoryRef.current[idx] || [];
      const newQ = await generateFreshVariant(q, subj, yearLevel, history);
      if (newQ) {
        regenHistoryRef.current[idx] = [...history, fingerprintQuestion(newQ)];
        const replacement = { ...newQ, _subj: subj, topic: q.topic || newQ.topic, questionType: q.questionType || newQ.questionType };
        const updated = [...questions];
        updated[idx] = replacement;
        onQuestionsChange(updated);
      }
    } catch (e) { /* leave the question as-is if regeneration fails */ }
    setRegeneratingIdx(null);
  };

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ flex: '1 1 320px', minWidth: 0 }}>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>Review questions</h2>
          <input
            value={paperTitle}
            onChange={e => onTitleChange(e.target.value)}
            placeholder="Untitled paper"
            style={{ display: 'block', width: '100%', maxWidth: 380, boxSizing: 'border-box', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '8px 12px', fontSize: 14, fontWeight: 700, color: '#0F172A', fontFamily: 'Inter, sans-serif', outline: 'none', marginBottom: 6 }}
          />
          <p style={{ fontSize: 14, color: '#64748B', margin: 0, fontFamily: 'Inter, sans-serif' }}>
            Year {yearLevel} · {questions.length} questions. Check each answer, regenerate any question that looks repeated, then save and/or generate the PDF.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
          {hasSelection && (
            <button onClick={onRegenerateAll} title="Keep the same subjects/topics/question-types, but generate a brand new set of questions" style={{ padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#F97316', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>🔁 New question set (same selection)</button>
          )}
          <button onClick={onEditSelection} style={{ padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#EEF2FF', color: '#4338CA', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>✏️ Edit selection</button>
          <button onClick={onBackToList} style={{ padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>📁 Saved papers</button>
        </div>
      </div>
      {!hasSelection && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '10px 16px', marginBottom: 12, fontSize: 13, color: '#92400E', fontFamily: 'Inter, sans-serif' }}>
          ℹ️ This paper was saved before selection-editing existed, so its original subject/topic picks weren't stored — "Edit selection" will open blank. Pick your mix there and generate once, and going forward this paper (and every paper saved from now on) will remember its selection, including for a one-click "New question set" like the button above.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '20px 0' }}>
        {questions.map((q, i) => {
          const subj = QUESTION_BANK[q._subj] || QUESTION_BANK.mathematics;
          // Only block regenerate for reading questions that actually share a generated
          // passage (passageGroups.length > 0) — standalone reading-tagged questions
          // launched from the Question Creator have no passage and can regenerate fine.
          const canRegenerate = !(q._subj === 'reading' && passageGroups && passageGroups.length > 0);
          const isRegenerating = regeneratingIdx === i;
          let passageBlock = null;
          if (q._subj === 'reading') {
            const groupIdx = Math.floor(readingSeen / (questionsPerPassage || 5));
            const isFirstOfGroup = readingSeen % (questionsPerPassage || 5) === 0;
            const passage = passageGroups?.[groupIdx]?.passage;
            if (isFirstOfGroup && passage) {
              passageBlock = (
                <div style={{ background: '#F0FDF4', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>📖 {passage.title}</div>
                  <div style={{ fontSize: 13, color: '#374151', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{passage.text}</div>
                </div>
              );
            }
            readingSeen += 1;
          }
          return (
            <React.Fragment key={i}>
              {passageBlock}
              <div style={{ background: '#fff', borderRadius: 14, padding: '14px 18px', border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 1px 4px rgba(67,56,202,0.04)' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ background: subj.color, color: '#fff', borderRadius: 8, padding: '2px 8px', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2, fontFamily: 'Inter, sans-serif' }}>Q{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: subj.color, fontWeight: 700, fontFamily: 'Inter, sans-serif', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {subj.label}{q.questionType ? ` · ${q.questionType}` : ''}
                    </div>
                    <div style={{ fontSize: 14, color: '#0F172A', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, marginBottom: 8 }}>{q.question}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 10px', marginBottom: q.explanation ? 8 : 0 }}>
                      {Object.entries(q.options || {}).map(([key, val]) => (
                        <div key={key} style={{ fontSize: 12, fontFamily: 'Inter, sans-serif', padding: '4px 8px', borderRadius: 6, background: key === q.correct ? '#DCFCE7' : '#F8FAFC', color: key === q.correct ? '#166534' : '#374151', fontWeight: key === q.correct ? 700 : 400, border: `1px solid ${key === q.correct ? '#86EFAC' : '#E5E7EB'}` }}>
                          {key}. {val}
                        </div>
                      ))}
                    </div>
                    {q.explanation && <div style={{ fontSize: 12, color: '#64748B', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>💡 {q.explanation}</div>}
                  </div>
                  <button
                    onClick={() => handleRegenerate(i)}
                    disabled={!canRegenerate || regeneratingIdx !== null}
                    title={canRegenerate ? 'Regenerate this question' : "Reading questions share a passage and can't be regenerated individually"}
                    style={{
                      flexShrink: 0, padding: '6px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, fontFamily: 'Inter, sans-serif',
                      border: `1.5px solid ${canRegenerate ? subj.color : '#E5E7EB'}`, background: '#fff',
                      color: canRegenerate ? subj.color : '#C7CDD6',
                      cursor: !canRegenerate || regeneratingIdx !== null ? 'not-allowed' : 'pointer',
                      opacity: regeneratingIdx !== null && !isRegenerating ? 0.5 : 1,
                    }}
                  >
                    {isRegenerating ? '⏳' : '🔄'} {isRegenerating ? 'Regenerating…' : 'Regenerate'}
                  </button>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={onSave}
          disabled={saving}
          style={{
            flex: '1 1 220px', padding: '16px', borderRadius: 100, fontSize: 16, fontWeight: 700, border: 'none',
            background: saving ? '#E5E7EB' : '#4338CA', color: saving ? '#9CA3AF' : '#fff',
            cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif',
            boxShadow: saving ? 'none' : '0 4px 16px rgba(67,56,202,0.3)',
          }}
        >
          {saving ? 'Saving…' : justSaved ? '✓ Saved' : isSaved ? '💾 Update saved paper' : '💾 Save paper'}
        </button>
        <button
          onClick={onDownload}
          disabled={downloading}
          style={{
            flex: '1 1 220px', padding: '16px', borderRadius: 100, fontSize: 16, fontWeight: 700, border: 'none',
            background: downloading ? '#E5E7EB' : '#F97316', color: downloading ? '#9CA3AF' : '#fff',
            cursor: downloading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif',
            boxShadow: downloading ? 'none' : '0 4px 16px rgba(249,115,22,0.35)',
          }}
        >
          {downloading ? 'Preparing PDF…' : '📄 Generate PDF Paper Test →'}
        </button>
      </div>
    </div>
  );
}

// ── Printable PDF (paper + blank answer sheet + answer key) ────────────────
// Same window.open → document.write → window.print() pattern already used
// in PDFGeneratorPage.jsx — the browser's own "Save as PDF" is the delivery
// mechanism, so this needs no new backend endpoint.

function buildAndPrintPaper(questions, passageGroups, questionsPerPassage, paperTitle, yearLevel) {
  const win = window.open('', '_blank');
  if (!win) return;

  const title = paperTitle?.trim() || 'Custom Practice Test';
  const total = questions.length;

  // Group into subject sections in a stable order, preserving passage grouping for reading.
  const sections = [];
  const seen = new Set();
  questions.forEach(q => {
    const subj = q._subj || 'mathematics';
    if (!seen.has(subj)) { seen.add(subj); sections.push({ subj, label: (QUESTION_BANK[subj] || {}).label || subj, items: [] }); }
    sections.find(s => s.subj === subj).items.push(q);
  });

  let counter = 0;
  const questionsHtml = sections.map(section => {
    let itemsHtml;
    if (section.subj === 'reading') {
      const perPassage = questionsPerPassage || 5;
      const groupsHtml = [];
      for (let g = 0; g * perPassage < section.items.length; g++) {
        const groupItems = section.items.slice(g * perPassage, (g + 1) * perPassage);
        const passage = passageGroups?.[g]?.passage;
        const passageHtml = passage
          ? `<div class="passage"><h2>${passage.title}</h2><p>${(passage.text || '').replace(/\n\n/g, '</p><p>')}</p></div>`
          : '';
        const groupQsHtml = groupItems.map(q => {
          counter += 1;
          return `<div class="question"><p class="q-text">${counter}. ${q.question}</p><div class="options">${Object.entries(q.options || {}).map(([l, t]) => `<p>&nbsp;&nbsp;&nbsp;${l}. ${t}</p>`).join('')}</div></div>`;
        }).join('');
        groupsHtml.push(passageHtml + groupQsHtml);
      }
      itemsHtml = groupsHtml.join('');
    } else {
      itemsHtml = section.items.map(q => {
        counter += 1;
        return `<div class="question"><p class="q-text">${counter}. ${q.question}</p><div class="options">${Object.entries(q.options || {}).map(([l, t]) => `<p>&nbsp;&nbsp;&nbsp;${l}. ${t}</p>`).join('')}</div></div>`;
      }).join('');
    }
    return `<div class="section"><div class="section-title">${section.label}</div>${itemsHtml}</div>`;
  }).join('');

  const answers = (() => {
    let n = 0;
    return questions.map(q => { n += 1; return `${n}. ${q.correct}`; }).join('&nbsp;&nbsp;&nbsp;');
  })();

  const explanations = (() => {
    let n = 0;
    return questions.map(q => { n += 1; return `<p><strong>${n}.</strong> ${q.correct}. ${(q.options || {})[q.correct] || ''} — ${q.explanation || ''}</p>`; }).join('');
  })();

  // Blank bubble answer sheet — vertical A/B/C/D stack per question, matching
  // the existing scan feature's convention (topmost = A, bottommost = D).
  const COLS = 3, ROWS_PER_COL = 20, PER_PAGE = COLS * ROWS_PER_COL;
  const pages = [];
  for (let start = 0; start < total; start += PER_PAGE) pages.push(questions.slice(start, start + PER_PAGE));
  const bubbleSheetHtml = pages.map((pageQs, pageIdx) => {
    const cols = [];
    for (let c = 0; c < COLS; c++) cols.push(pageQs.slice(c * ROWS_PER_COL, (c + 1) * ROWS_PER_COL));
    const colsHtml = cols.map(colQs => {
      const rowsHtml = colQs.map((q, ri) => {
        const num = pageIdx * PER_PAGE + cols.indexOf(colQs) * ROWS_PER_COL + ri + 1;
        return `<div class="bubble-row"><span class="bubble-num">${num}</span><span class="bubble-stack">${['A', 'B', 'C', 'D'].map(l => `<span class="bubble">${l}</span>`).join('')}</span></div>`;
      }).join('');
      return `<div class="bubble-col">${rowsHtml}</div>`;
    }).join('');
    return `<div class="answer-sheet-page"><div class="section-title">Answer Sheet${pages.length > 1 ? ` (${pageIdx + 1}/${pages.length})` : ''}</div><p class="sheet-instructions">Fill in one bubble per question — A is the top bubble, D is the bottom bubble.</p><div class="bubble-grid">${colsHtml}</div></div>`;
  }).join('');

  win.document.write(`<!DOCTYPE html><html><head><title>ScholarPrep — ${title}</title>
    <style>
      body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.6;max-width:800px;margin:0 auto;padding:40px;color:#000}
      .header{text-align:center;border-bottom:2px solid #000;padding-bottom:16px;margin-bottom:24px}
      .header h1{font-size:18pt;margin:0 0 6px}
      .header p{font-size:11pt;margin:2px 0}
      .admin-tag{font-size:10pt;letter-spacing:0.08em;text-transform:uppercase;color:#4338CA;font-weight:bold}
      .meta{display:flex;justify-content:space-between;margin-bottom:24px;font-size:11pt}
      .meta div{border:1px solid #000;padding:6px 12px}
      .section-title{font-size:14pt;font-weight:bold;border-bottom:1.5px solid #000;padding-bottom:6px;margin:28px 0 14px}
      .section:first-of-type .section-title{margin-top:8px}
      .passage{border:1px solid #ccc;padding:16px;margin-bottom:18px;background:#f9f9f9}
      .passage h2{font-size:13pt;margin:0 0 10px;text-align:center}
      .question{margin-bottom:18px;page-break-inside:avoid}
      .q-text{font-weight:bold;margin:0 0 6px}
      .options{margin-left:20px}
      .answers{border-top:2px solid #000;padding-top:16px;margin-top:20px;font-size:11pt}
      .answer-sheet-page{page-break-before:always;padding-top:8px}
      .sheet-instructions{font-size:10pt;color:#333;margin-bottom:18px}
      .bubble-grid{display:flex;gap:28px}
      .bubble-col{flex:1;display:flex;flex-direction:column;gap:10px}
      .bubble-row{display:flex;align-items:center;gap:8px}
      .bubble-num{font-size:10pt;font-weight:bold;width:20px;text-align:right}
      .bubble-stack{display:flex;gap:5px}
      .bubble{display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border:1.2px solid #000;border-radius:50%;font-size:7pt}
      .page-break{page-break-before:always}
      @media print{body{padding:20px}}
    </style></head><body>
    <div class="header">
      <div class="admin-tag">Admin copy — internal use only</div>
      <h1>ScholarPrep — ${title}</h1>
      <p>Year ${yearLevel} Level · ${total} Questions · scholarprep.com.au</p>
    </div>
    <div class="meta"><div>Name: ________________________</div><div>Date: ________________________</div><div>Score: _______ / ${total}</div></div>
    <div class="instructions"><p><strong>Instructions:</strong> Circle the letter of the best answer for each question. There is only one correct answer per question.</p></div>
    ${questionsHtml}
    ${bubbleSheetHtml}
    <div class="answers page-break">
      <div class="section-title">Answer Key</div>
      <p>${answers}</p>
      <h3>Explanations</h3>
      ${explanations}
    </div>
    </body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function AdminPaperBuilderPage() {
  const { isAdmin, loading, yearLevel: accountYearLevel } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState('list');
  const [customTemplates, setCustomTemplates] = useState([]);
  const [savedPapers, setSavedPapers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [selection, setSelection] = useState({});
  const [passages, setPassages] = useState(2);
  const [questionsPerPassage, setQuestionsPerPassage] = useState(5);
  const [yearLevel, setYearLevel] = useState(accountYearLevel || 5);
  const [paperTitle, setPaperTitle] = useState('');

  const [questions, setQuestions] = useState([]);
  const [passageGroups, setPassageGroups] = useState([]);
  const [genQuestionsPerPassage, setGenQuestionsPerPassage] = useState(5);
  const [generatingMsg, setGeneratingMsg] = useState('Generating your questions');
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const [currentPaperId, setCurrentPaperId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      getCustomTemplates().catch(() => []),
      getPaperTests().catch(() => []),
    ]).then(([templates, papers]) => {
      setCustomTemplates(templates);
      setSavedPapers(papers);
      setDataLoading(false);
    });
  }, []);

  if (loading) return null;
  if (!isAdmin) return <Navigate to="/app" replace />;

  const resetForNewPaper = () => {
    setSelection({});
    setPassages(2);
    setQuestionsPerPassage(5);
    setYearLevel(accountYearLevel || 5);
    setPaperTitle('');
    setQuestions([]);
    setPassageGroups([]);
    setCurrentPaperId(null);
    setError('');
    setView('builder');
  };

  const handleOpenPaper = (paper) => {
    setCurrentPaperId(paper.id);
    setPaperTitle(paper.title || '');
    setYearLevel(paper.yearLevel || accountYearLevel || 5);
    setQuestions(paper.questions || []);
    setPassageGroups(paper.passageGroups || []);
    setGenQuestionsPerPassage(paper.questionsPerPassage || 5);
    // Restore the builder selection too — so "Edit selection" from an older
    // saved paper (before this field existed) just opens an empty picker
    // instead of crashing, and a paper saved since can be re-picked exactly.
    setSelection(paper.selection || {});
    setPassages(paper.passages || 2);
    setQuestionsPerPassage(paper.questionsPerPassage || 5);
    setJustSaved(false);
    setView('review');
  };

  const handleDeletePaper = async (id) => {
    await deletePaperTest(id);
    setSavedPapers(prev => prev.filter(p => p.id !== id));
    if (currentPaperId === id) { setCurrentPaperId(null); setView('list'); }
  };

  // ── Custom Question Creator (same component/behaviour as Custom Test page) ──
  const handleSaveTemplate = async (tmpl) => {
    const saved = await saveCustomTemplate(tmpl);
    setCustomTemplates(prev => {
      const idx = prev.findIndex(t => t.id === saved.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
      return [saved, ...prev];
    });
    return saved;
  };

  const handleLaunchFromCreator = (qs, label) => {
    setQuestions(qs.map(q => ({ ...q, _subj: q.topic || 'mathematics' })));
    setPassageGroups([]);
    setGenQuestionsPerPassage(5);
    setPaperTitle(label);
    setCurrentPaperId(null);
    // Not built from a subject/topic selection, so "Edit selection" should
    // open an empty picker rather than whatever was left over in state.
    setSelection({});
    setJustSaved(false);
    setView('review');
  };

  const handleGenerate = async () => {
    setError('');
    setView('generating');
    try {
      const { questions: qs, passageGroups: pg } = await generateAllPaperQuestions(selection, passages, questionsPerPassage, yearLevel, customTemplates, setGeneratingMsg);
      setQuestions(qs);
      setPassageGroups(pg);
      setGenQuestionsPerPassage(questionsPerPassage);
      setJustSaved(false);
      setView('review');
    } catch (e) {
      setError('Failed to generate questions. Please try again.');
      setView('builder');
    }
  };

  // "New question set (same selection)" — regenerate everything using the
  // exact same subjects/topics/question-types, but guarantee a genuinely
  // different set of questions from what's currently on screen. Unlike the
  // initial Generate (which is happy to serve from the shared pool for
  // cost/speed), this bypasses the pool for maths and seeds the anti-repeat
  // history with the current questions, since the whole point of clicking
  // this is "give me something different from what I'm looking at now".
  const handleRegenerateAll = async () => {
    setError('');
    setView('generating');
    try {
      const seedFingerprints = questions.map(fingerprintQuestion);
      const { questions: qs, passageGroups: pg } = await generateAllPaperQuestions(
        selection, passages, questionsPerPassage, yearLevel, customTemplates, setGeneratingMsg,
        { bypassPool: true, seedFingerprints }
      );
      setQuestions(qs);
      setPassageGroups(pg);
      setGenQuestionsPerPassage(questionsPerPassage);
      setJustSaved(false);
      setView('review');
    } catch (e) {
      // ReviewScreen doesn't render the error banner (only the builder does),
      // so on failure fall back to the builder — same as the initial
      // Generate — where the message is actually visible and the selection
      // is still there to just hit Generate again.
      setError('Failed to generate questions. Please try again.');
      setView('builder');
    }
  };

  // Jump back into the builder with the current selection pre-filled — used
  // to re-pick subjects/topics/question-types for a paper already in review
  // (new or previously saved). currentPaperId is left untouched, so hitting
  // Generate then Save updates the same saved paper instead of creating a new one.
  const handleEditSelection = () => {
    setError('');
    setView('builder');
  };

  const handleDownload = () => {
    setDownloading(true);
    try {
      buildAndPrintPaper(questions, passageGroups, genQuestionsPerPassage, paperTitle, yearLevel);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const saved = await savePaperTest({
        id: currentPaperId,
        title: paperTitle,
        yearLevel,
        questions,
        passageGroups,
        questionsPerPassage: genQuestionsPerPassage,
        selection,
        passages,
      });
      setCurrentPaperId(saved.id);
      setSavedPapers(prev => {
        // Keep the full paper data on the cached list entry (not just the
        // summary fields) so re-opening it later in this session — without a
        // page refresh — has everything handleOpenPaper needs, selection included.
        const entry = {
          id: saved.id,
          title: paperTitle?.trim() || 'Untitled Paper',
          yearLevel,
          questions,
          passageGroups,
          questionsPerPassage: genQuestionsPerPassage,
          selection,
          passages,
          questionCount: questions.length,
          createdAt: saved.createdAt,
          updatedAt: new Date().toISOString(),
        };
        const idx = prev.findIndex(p => p.id === saved.id);
        if (idx >= 0) { const next = [...prev]; next[idx] = entry; return next; }
        return [entry, ...prev];
      });
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    } catch (e) {
      setError('Failed to save the paper. Please try again.');
    }
    setSaving(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F7FF' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(67,56,202,0.08)', padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🗞️</div>
        <div>
          <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 800, color: '#0F172A', letterSpacing: -0.3 }}>Paper Test Builder</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>Admin only · generate a printable PDF paper test with answer sheet</div>
        </div>
        <button onClick={() => navigate('/admin')} style={{ marginLeft: 'auto', padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>← Admin dashboard</button>
      </div>

      {dataLoading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 32px', flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 36, height: 36, border: '3px solid #EEF2FF', borderTop: '3px solid #4338CA', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {!dataLoading && view === 'list' && (
        <SavedPapersList
          papers={savedPapers}
          loading={false}
          onOpen={handleOpenPaper}
          onDelete={handleDeletePaper}
          onCreateNew={resetForNewPaper}
          onOpenCreator={() => setView('creator')}
        />
      )}

      {!dataLoading && view === 'creator' && (
        <CustomQuestionCreator
          yearLevel={yearLevel}
          onBack={() => setView('list')}
          onSaveTemplate={handleSaveTemplate}
          onLaunch={handleLaunchFromCreator}
          launchLabel="▶ Review & print"
        />
      )}

      {!dataLoading && view === 'builder' && (
        <PaperBuilderScreen
          customTemplates={customTemplates}
          yearLevel={yearLevel} setYearLevel={setYearLevel}
          paperTitle={paperTitle} setPaperTitle={setPaperTitle}
          selection={selection} setSelection={setSelection}
          passages={passages} setPassages={setPassages}
          questionsPerPassage={questionsPerPassage} setQuestionsPerPassage={setQuestionsPerPassage}
          onGenerate={handleGenerate}
          onBackToList={() => setView('list')}
          error={error}
        />
      )}

      {view === 'generating' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 20, textAlign: 'center', padding: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>📄</div>
          <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 800, color: '#0F172A' }}>{generatingMsg}…</div>
          <div style={{ fontSize: 15, color: '#64748B', maxWidth: 340, lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>This can take a while for larger papers with several subjects.</div>
          <div style={{ width: 40, height: 40, border: '3px solid #EEF2FF', borderTop: '3px solid #4338CA', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {view === 'review' && (
        <ReviewScreen
          questions={questions}
          passageGroups={passageGroups}
          questionsPerPassage={genQuestionsPerPassage}
          yearLevel={yearLevel}
          paperTitle={paperTitle}
          onTitleChange={setPaperTitle}
          isSaved={!!currentPaperId}
          hasSelection={Object.keys(selection || {}).length > 0}
          onRegenerateAll={handleRegenerateAll}
          onEditSelection={handleEditSelection}
          onBackToList={() => setView('list')}
          onQuestionsChange={setQuestions}
          onDownload={handleDownload}
          downloading={downloading}
          onSave={handleSave}
          saving={saving}
          justSaved={justSaved}
        />
      )}
    </div>
  );
}