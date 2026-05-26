import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { assessHandwritingPhoto } from '../lib/ai';

// ── Helpers ───────────────────────────────────────────────────────────────────

const getBandColor = (pct) => {
  if (pct >= 80) return '#059669';
  if (pct >= 60) return '#4338CA';
  if (pct >= 40) return '#F97316';
  return '#EF4444';
};

const getBandLabel = (pct) => {
  if (pct >= 90) return 'Outstanding';
  if (pct >= 80) return 'Excellent';
  if (pct >= 70) return 'Very Good';
  if (pct >= 60) return 'Good';
  if (pct >= 50) return 'Satisfactory';
  if (pct >= 40) return 'Developing';
  return 'Needs Work';
};

// ── Score Ring ────────────────────────────────────────────────────────────────

function ScoreRing({ pct, size = 80, label }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = getBandColor(pct);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={8} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} />
        <text x={size/2} y={size/2 - 4} textAnchor="middle" fontSize={size < 70 ? 13 : 17}
          fontWeight="800" fill={color} fontFamily="Inter, sans-serif">{pct}%</text>
        <text x={size/2} y={size/2 + 11} textAnchor="middle" fontSize={9}
          fill="#94A3B8" fontFamily="Inter, sans-serif">{getBandLabel(pct)}</text>
      </svg>
      {label && <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', textAlign: 'center', fontFamily: 'Inter, sans-serif', maxWidth: 80 }}>{label}</div>}
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle, color = '#4338CA' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: '#64748B', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

// ── Upload Screen ─────────────────────────────────────────────────────────────

function UploadScreen({ onImageReady }) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [base64, setBase64] = useState(null);
  const [mediaType, setMediaType] = useState('image/jpeg');
  const [writingType, setWritingType] = useState('narrative');
  const fileRef = useRef();
  const cameraRef = useRef();

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setMediaType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setPreview(dataUrl);
      setBase64(dataUrl.split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  }, []);

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 26, fontWeight: 800, color: '#0F172A', marginBottom: 6, letterSpacing: -0.5 }}>
          📷 Photo Writing Feedback
        </div>
        <div style={{ fontSize: 15, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
          Upload or take a photo of your handwritten work and get detailed AI feedback.
        </div>
      </div>

      {/* Writing type */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 20, marginBottom: 14, border: '1px solid rgba(67,56,202,0.08)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontFamily: 'Inter, sans-serif' }}>Writing type</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[{ key: 'narrative', label: '📖 Narrative' }, { key: 'persuasive', label: '💬 Persuasive' }, { key: 'creative', label: '✨ Creative' }, { key: 'informative', label: '📋 Informative' }].map(t => (
            <button key={t.key} onClick={() => setWritingType(t.key)} style={{ padding: '9px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: writingType === t.key ? '#4338CA' : '#F8F9FF', color: writingType === t.key ? '#fff' : '#64748B', border: writingType === t.key ? 'none' : '1.5px solid rgba(67,56,202,0.1)', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !preview && fileRef.current?.click()}
        style={{ background: dragOver ? '#EEF2FF' : preview ? '#F8FAFF' : '#fff', borderRadius: 20, border: `2px dashed ${dragOver ? '#4338CA' : preview ? '#4338CA' : '#CBD5E1'}`, padding: preview ? 16 : 40, cursor: preview ? 'default' : 'pointer', textAlign: 'center', marginBottom: 14, transition: 'all 0.2s', minHeight: preview ? 'auto' : 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      >
        {preview ? (
          <div style={{ width: '100%' }}>
            <img src={preview} alt="Writing preview" style={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 12, marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={(e) => { e.stopPropagation(); setPreview(null); setBase64(null); }} style={{ padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#FFF1F2', color: '#EF4444', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>✕ Remove</button>
              <button onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }} style={{ padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#EEF2FF', color: '#4338CA', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>↺ Change photo</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 6 }}>Drop a photo here</div>
            <div style={{ fontSize: 14, color: '#64748B', fontFamily: 'Inter, sans-serif', marginBottom: 20 }}>or click to choose a file from your device</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }} style={{ padding: '10px 22px', borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#EEF2FF', color: '#4338CA', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>📁 Choose file</button>
              <button onClick={(e) => { e.stopPropagation(); cameraRef.current?.click(); }} style={{ padding: '10px 22px', borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#F0FDF4', color: '#059669', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>📷 Take photo</button>
            </div>
          </>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => processFile(e.target.files[0])} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => processFile(e.target.files[0])} />

      {preview && (
        <button
          onClick={() => onImageReady(base64, mediaType, writingType)}
          style={{ width: '100%', padding: 16, borderRadius: 100, fontSize: 16, fontWeight: 700, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(67,56,202,0.3)', transition: 'all 0.2s' }}
        >
          Get writing feedback →
        </button>
      )}
    </div>
  );
}

// ── Assessment Section ────────────────────────────────────────────────────────

function AssessmentSection({ feedback }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 16, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 2px 12px rgba(67,56,202,0.05)' }}>
      <SectionHeader icon="📊" title="Assessment" subtitle="Scored across 5 criteria" color="#4338CA" />

      {/* Overall score */}
      <div style={{ background: '#EEF2FF', borderRadius: 14, padding: '18px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <ScoreRing pct={feedback.totalPercent} size={90} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>Overall Score</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: getBandColor(feedback.totalPercent), fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{feedback.totalScore} / {feedback.maxTotal}</div>
          <div style={{ fontSize: 14, color: '#374151', fontFamily: 'Inter, sans-serif', marginTop: 6, lineHeight: 1.6 }}>{feedback.overallFeedback}</div>
        </div>
      </div>

      {/* Criteria grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 16 }}>
        {feedback.criteria.map((c, i) => (
          <button key={i} onClick={() => setExpanded(expanded === i ? null : i)} style={{ background: expanded === i ? `${getBandColor(c.percent)}10` : '#F8FAFF', borderRadius: 12, padding: '14px 16px', border: `1.5px solid ${expanded === i ? getBandColor(c.percent) : '#EEF2FF'}`, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', fontFamily: 'Inter, sans-serif' }}>{c.name}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: getBandColor(c.percent), fontFamily: 'Inter, sans-serif' }}>{c.score}/{c.maxScore}</div>
            </div>
            <div style={{ height: 6, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${c.percent}%`, height: '100%', background: getBandColor(c.percent), borderRadius: 3, transition: 'width 0.6s' }} />
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>{c.percent}% — {getBandLabel(c.percent)}</div>
          </button>
        ))}
      </div>

      {/* Expanded criterion detail */}
      {expanded !== null && (
        <div style={{ background: '#F8FAFF', borderRadius: 12, padding: '16px 20px', border: '1px solid #EEF2FF' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 10 }}>{feedback.criteria[expanded].name}</div>
          <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, fontFamily: 'Inter, sans-serif', marginBottom: 12 }}>{feedback.criteria[expanded].feedback}</div>
          {feedback.criteria[expanded].strengths?.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>✓ Strengths</div>
              {feedback.criteria[expanded].strengths.map((s, i) => <div key={i} style={{ fontSize: 13, color: '#374151', padding: '4px 0', fontFamily: 'Inter, sans-serif' }}>• {s}</div>)}
            </div>
          )}
          {feedback.criteria[expanded].improvements?.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#F97316', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>→ To improve</div>
              {feedback.criteria[expanded].improvements.map((s, i) => <div key={i} style={{ fontSize: 13, color: '#374151', padding: '4px 0', fontFamily: 'Inter, sans-serif' }}>• {s}</div>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Transcription Section ─────────────────────────────────────────────────────

function TranscriptionSection({ text, wordCount }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 16, border: '1px solid rgba(67,56,202,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: show ? 16 : 0 }}>
        <SectionHeader icon="📝" title="Transcribed Text" subtitle={`${wordCount || ''} words detected`} color="#6B7280" />
        <button onClick={() => setShow(p => !p)} style={{ padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: '#F8F9FF', color: '#64748B', border: '1px solid #E5E7EB', cursor: 'pointer', fontFamily: 'Inter, sans-serif', flexShrink: 0 }}>{show ? '▲ Hide' : '▼ Show'}</button>
      </div>
      {show && (
        <div style={{ background: '#F8FAFF', borderRadius: 12, padding: '16px 20px', fontSize: 14, color: '#374151', lineHeight: 1.85, whiteSpace: 'pre-line', fontFamily: 'Georgia, serif', border: '1px solid #EEF2FF' }}>
          {text}
        </div>
      )}
    </div>
  );
}

// ── Spelling & Grammar Section ────────────────────────────────────────────────

function SpellingGrammarSection({ spelling, grammar }) {
  const hasContent = (spelling?.length || 0) + (grammar?.length || 0) > 0;
  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 16, border: '1px solid rgba(67,56,202,0.08)' }}>
      <SectionHeader icon="✏️" title="Spelling & Grammar Corrections" subtitle="Errors found and how to fix them" color="#EF4444" />
      {!hasContent && <div style={{ fontSize: 14, color: '#059669', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>🎉 No spelling or grammar errors found!</div>}

      {spelling?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, fontFamily: 'Inter, sans-serif' }}>Spelling</div>
          {spelling.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 14px', background: '#FFF1F2', borderRadius: 10, marginBottom: 6, border: '1px solid #FECDD3' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontSize: 14, color: '#BE123C', fontWeight: 700, fontFamily: 'Inter, sans-serif', textDecoration: 'line-through' }}>{s.original}</span>
                  <span style={{ fontSize: 14, color: '#374151', fontFamily: 'Inter, sans-serif' }}>→</span>
                  <span style={{ fontSize: 14, color: '#059669', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>{s.correction}</span>
                </div>
                {s.rule && <div style={{ fontSize: 12, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>{s.rule}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {grammar?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, fontFamily: 'Inter, sans-serif' }}>Grammar</div>
          {grammar.map((g, i) => (
            <div key={i} style={{ background: '#FFF7ED', borderRadius: 10, padding: '12px 16px', marginBottom: 8, border: '1px solid #FED7AA' }}>
              <div style={{ fontSize: 13, color: '#BE123C', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>
                <span style={{ fontWeight: 700 }}>Original: </span>{g.original}
              </div>
              <div style={{ fontSize: 13, color: '#059669', fontFamily: 'Inter, sans-serif', marginBottom: 6 }}>
                <span style={{ fontWeight: 700 }}>Corrected: </span>{g.corrected}
              </div>
              <div style={{ fontSize: 12, color: '#64748B', fontFamily: 'Inter, sans-serif', fontStyle: 'italic' }}>{g.explanation}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Vocabulary Upgrade Card ───────────────────────────────────────────────────

function VocabUpgradeCard({ item, type, color }) {
  const [chosen, setChosen] = useState(null);
  return (
    <div style={{ background: '#F8FAFF', borderRadius: 12, padding: '14px 16px', marginBottom: 10, border: '1px solid #EEF2FF' }}>
      <div style={{ fontSize: 13, color: '#64748B', fontFamily: 'Georgia, serif', fontStyle: 'italic', marginBottom: 8, lineHeight: 1.65, borderLeft: `3px solid ${color}`, paddingLeft: 10 }}>
        "{item.sentence}"
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Replace <strong style={{ color: '#BE123C' }}>{item.original}</strong> with:</span>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
        {item.options?.map((opt, i) => (
          <button key={i} onClick={() => setChosen(chosen === i ? null : i)} style={{ padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: chosen === i ? color : '#fff', color: chosen === i ? '#fff' : '#374151', border: `1.5px solid ${chosen === i ? color : '#E5E7EB'}`, fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}>{opt}</button>
        ))}
      </div>
      {item.why && <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif', fontStyle: 'italic' }}>💡 {item.why}</div>}
    </div>
  );
}

// ── Vocabulary Section ────────────────────────────────────────────────────────

function VocabularySection({ vocab }) {
  const categories = [
    { key: 'adjectives', label: 'Adjectives', icon: '🎨', color: '#4338CA', desc: 'Replace weak adjectives with more vivid, precise options' },
    { key: 'verbs', label: 'Verbs', icon: '⚡', color: '#059669', desc: 'Replace weak verbs with stronger, more expressive alternatives' },
    { key: 'adverbs', label: 'Adverbs', icon: '🌟', color: '#F97316', desc: 'Add or replace adverbs for more precise expression' },
  ];
  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 16, border: '1px solid rgba(67,56,202,0.08)' }}>
      <SectionHeader icon="💎" title="Vocabulary Upgrades" subtitle="Choose stronger words for each sentence" color="#4338CA" />
      {categories.map(cat => {
        const items = vocab?.[cat.key] || [];
        if (!items.length) return null;
        return (
          <div key={cat.key} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>{cat.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', fontFamily: 'Inter, sans-serif' }}>{cat.label}</div>
                <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>{cat.desc}</div>
              </div>
            </div>
            {items.map((item, i) => <VocabUpgradeCard key={i} item={item} type={cat.key} color={cat.color} />)}
          </div>
        );
      })}
    </div>
  );
}

// ── Sentence Structure Section ────────────────────────────────────────────────

function SentenceUpgradeCard({ upgrade }) {
  const [chosen, setChosen] = useState(null);
  const colors = { 'Simile': '#4338CA', 'Metaphor': '#059669', 'Alliteration': '#F97316', 'Personification': '#8B5CF6', 'Imagery': '#0EA5E9', 'Rhetorical Question': '#EF4444', 'Complex Sentence': '#4338CA', 'Conditional Sentence': '#059669', 'Parallel Structure': '#F97316', 'Contrast': '#8B5CF6', 'Emphasis': '#EF4444', 'Relative Clause': '#0EA5E9', 'Appositive': '#4338CA', 'Cause and Effect': '#059669', 'Conjunction': '#F97316', 'Inverted Order': '#8B5CF6' };
  const color = colors[upgrade.technique] || '#4338CA';
  return (
    <div style={{ background: '#F8FAFF', borderRadius: 14, padding: '16px 18px', marginBottom: 12, border: '1px solid #EEF2FF' }}>
      <div style={{ display: 'inline-block', background: `${color}15`, color, padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, fontFamily: 'Inter, sans-serif', border: `1px solid ${color}30` }}>{upgrade.technique}</div>
      <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>Original sentence:</div>
      <div style={{ fontSize: 13, color: '#64748B', fontFamily: 'Georgia, serif', fontStyle: 'italic', marginBottom: 12, lineHeight: 1.65, background: '#fff', borderRadius: 8, padding: '10px 14px', border: '1px solid #E5E7EB' }}>
        "{upgrade.original}"
      </div>
      <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif', marginBottom: 8 }}>Choose a rewritten version:</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {upgrade.options?.map((opt, i) => (
          <button key={i} onClick={() => setChosen(chosen === i ? null : i)} style={{ padding: '10px 14px', borderRadius: 10, fontSize: 13, cursor: 'pointer', background: chosen === i ? `${color}10` : '#fff', color: '#374151', border: `1.5px solid ${chosen === i ? color : '#E5E7EB'}`, textAlign: 'left', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6, transition: 'all 0.15s' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'normal', fontSize: 11, fontWeight: 700, color: chosen === i ? color : '#94A3B8', marginRight: 8 }}>Option {i + 1}:</span>
            {opt}
          </button>
        ))}
      </div>
      {upgrade.explanation && (
        <div style={{ marginTop: 10, fontSize: 12, color: '#64748B', fontFamily: 'Inter, sans-serif', fontStyle: 'italic', padding: '8px 12px', background: '#fff', borderRadius: 8, border: '1px solid #F1F5F9' }}>
          💡 {upgrade.explanation}
        </div>
      )}
    </div>
  );
}

function SentenceStructureSection({ upgrades }) {
  if (!upgrades?.length) return null;
  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 16, border: '1px solid rgba(67,56,202,0.08)' }}>
      <SectionHeader icon="🏗️" title="Sentence Structure Upgrades" subtitle="See how literary techniques can transform your sentences — pick your favourite version" color="#8B5CF6" />
      <div style={{ background: '#F8F3FF', borderRadius: 12, padding: '12px 16px', marginBottom: 16, border: '1px solid #E9D5FF' }}>
        <div style={{ fontSize: 13, color: '#6D28D9', fontFamily: 'Inter, sans-serif', lineHeight: 1.65 }}>
          <strong>How to use this:</strong> For each sentence, read the original, then explore the rewritten versions using different literary techniques. Click the version you prefer to highlight it — then try incorporating it into your own rewrite.
        </div>
      </div>
      {upgrades.map((u, i) => <SentenceUpgradeCard key={i} upgrade={u} />)}
    </div>
  );
}

// ── Rewrite Pad ───────────────────────────────────────────────────────────────

function RewritePad({ originalText }) {
  const [text, setText] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);
    setWordCount(val.trim() ? val.trim().split(/\s+/).length : 0);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 16, border: '1px solid rgba(67,56,202,0.08)' }}>
      <SectionHeader icon="✍️" title="Your Rewrite" subtitle="Using the suggestions above, rewrite your piece here" color="#059669" />
      <div style={{ background: '#F0FDF4', borderRadius: 12, padding: '12px 16px', marginBottom: 14, border: '1px solid #BBF7D0' }}>
        <div style={{ fontSize: 13, color: '#059669', fontFamily: 'Inter, sans-serif', lineHeight: 1.65 }}>
          <strong>Tip:</strong> Incorporate the vocabulary upgrades and sentence structure techniques you liked. Focus on one section at a time — even improving 3–4 sentences makes a big difference!
        </div>
      </div>
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Start rewriting your piece here, incorporating the suggestions above..."
        rows={12}
        style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1.5px solid #E5E7EB', fontSize: 14, fontFamily: 'Georgia, serif', color: '#0F172A', lineHeight: 1.85, resize: 'vertical', outline: 'none', boxSizing: 'border-box', minHeight: 280 }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>{wordCount} words</div>
        {text && (
          <button onClick={() => { navigator.clipboard?.writeText(text); }} style={{ padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: '#EEF2FF', color: '#4338CA', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            📋 Copy text
          </button>
        )}
      </div>
    </div>
  );
}

// ── Loading Screen ────────────────────────────────────────────────────────────

function LoadingScreen({ dots }) {
  const steps = [
    { icon: '📷', label: 'Reading your handwriting...' },
    { icon: '✏️', label: 'Transcribing the text...' },
    { icon: '📊', label: 'Assessing across 5 criteria...' },
    { icon: '💎', label: 'Finding vocabulary upgrades...' },
    { icon: '🏗️', label: 'Generating sentence improvements...' },
  ];
  const [step, setStep] = useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % steps.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ maxWidth: 480, margin: '80px auto', padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 24 }}>{steps[step].icon}</div>
      <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>Analysing your writing{dots}</div>
      <div style={{ fontSize: 15, color: '#64748B', fontFamily: 'Inter, sans-serif', marginBottom: 32 }}>{steps[step].label}</div>
      <div style={{ background: '#EEF2FF', borderRadius: 12, padding: '14px 20px' }}>
        <div style={{ fontSize: 13, color: '#4338CA', fontFamily: 'Inter, sans-serif' }}>This usually takes 20–40 seconds — we're doing a thorough analysis!</div>
      </div>
      <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: i <= step ? 1 : 0.3, transition: 'opacity 0.4s' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: i < step ? '#059669' : i === step ? '#4338CA' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', flexShrink: 0 }}>
              {i < step ? '✓' : i + 1}
            </div>
            <div style={{ fontSize: 13, color: i === step ? '#4338CA' : '#94A3B8', fontFamily: 'Inter, sans-serif', fontWeight: i === step ? 600 : 400 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function HandwritingFeedbackPage() {
  const { yearLevel, hasAccess } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('upload'); // upload | loading | feedback
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');
  const [dots, setDots] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  React.useEffect(() => {
    if (phase !== 'loading') return;
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(t);
  }, [phase]);

  const handleImageReady = async (base64, mediaType, writingType) => {
    setImagePreview(`data:${mediaType};base64,${base64}`);
    setPhase('loading'); setError('');
    try {
      const result = await assessHandwritingPhoto(base64, mediaType, yearLevel, writingType);
      setFeedback(result);
      setPhase('feedback');
    } catch (e) {
      setError(e.message || 'Failed to analyse the photo. Please try again with a clearer image.');
      setPhase('upload');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F7FF' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(67,56,202,0.08)', padding: '18px 32px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📷</div>
        <div>
          <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 18, fontWeight: 800, color: '#0F172A', letterSpacing: -0.3 }}>Photo Writing Feedback</div>
          <div style={{ fontSize: 13, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Year {yearLevel} · Upload handwritten work for AI feedback</div>
        </div>
        <button onClick={() => navigate('/app/writing')} style={{ marginLeft: 'auto', padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>← Writing</button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ maxWidth: 620, margin: '16px auto 0', padding: '0 24px' }}>
          <div style={{ background: '#FFF1F2', border: '1px solid #FDA4AF', borderRadius: 12, padding: '14px 18px', fontSize: 14, color: '#BE123C', fontFamily: 'Inter, sans-serif' }}>
            ⚠️ {error}
          </div>
        </div>
      )}

      {/* Access check */}
      {!hasAccess ? (
        <div style={{ maxWidth: 520, margin: '60px auto', padding: 32, textAlign: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: 40, border: '1px solid rgba(67,56,202,0.1)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
            <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>Subscribe to access</div>
            <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.7, marginBottom: 28, fontFamily: 'Inter, sans-serif' }}>Photo writing feedback is available with a ScholarPrep subscription.</p>
            <button onClick={() => navigate('/subscribe')} style={{ width: '100%', padding: 14, borderRadius: 100, fontSize: 15, fontWeight: 700, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Subscribe for $9.99/month →</button>
          </div>
        </div>
      ) : (
        <>
          {phase === 'upload' && <UploadScreen onImageReady={handleImageReady} />}
          {phase === 'loading' && <LoadingScreen dots={dots} />}
          {phase === 'feedback' && feedback && (
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 24px 60px' }}>
              {/* Nav tabs */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {[
                  { id: 'assess', label: '📊 Assessment' },
                  { id: 'transcript', label: '📝 Transcription' },
                  { id: 'spelling', label: '✏️ Spelling & Grammar' },
                  { id: 'vocab', label: '💎 Vocabulary' },
                  { id: 'sentences', label: '🏗️ Sentences' },
                  { id: 'rewrite', label: '✍️ Rewrite' },
                ].map(tab => (
                  <a key={tab.id} href={`#${tab.id}`} style={{ padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: '#fff', color: '#4338CA', border: '1.5px solid #C7D2FE', textDecoration: 'none', fontFamily: 'Inter, sans-serif' }}>{tab.label}</a>
                ))}
              </div>

              <div id="assess"><AssessmentSection feedback={feedback} /></div>
              <div id="transcript"><TranscriptionSection text={feedback.transcribedText} wordCount={feedback.wordCount} /></div>
              <div id="spelling"><SpellingGrammarSection spelling={feedback.spellingErrors} grammar={feedback.grammarErrors} /></div>
              <div id="vocab"><VocabularySection vocab={feedback.vocabularyUpgrades} /></div>
              <div id="sentences"><SentenceStructureSection upgrades={feedback.sentenceStructureUpgrades} /></div>
              <div id="rewrite"><RewritePad originalText={feedback.transcribedText} /></div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setPhase('upload'); setFeedback(null); }} style={{ flex: 1, padding: 14, borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#EEF2FF', color: '#4338CA', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>📷 Try another photo</button>
                <button onClick={() => navigate('/app/writing')} style={{ flex: 1, padding: 14, borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#F1F5F9', color: '#374151', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>← Back to Writing</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
