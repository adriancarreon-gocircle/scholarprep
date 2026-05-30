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
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fontSize={size < 70 ? 13 : 17}
          fontWeight="800" fill={color} fontFamily="Inter, sans-serif">{pct}%</text>
        <text x={size / 2} y={size / 2 + 11} textAnchor="middle" fontSize={9}
          fill="#94A3B8" fontFamily="Inter, sans-serif">{getBandLabel(pct)}</text>
      </svg>
      {label && <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', textAlign: 'center', fontFamily: 'Inter, sans-serif', maxWidth: 80 }}>{label}</div>}
    </div>
  );
}

// ── In-page Camera ────────────────────────────────────────────────────────────
function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef();
  const canvasRef = useRef();
  const streamRef = useRef();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => { videoRef.current.play(); setReady(true); };
        }
      } catch (e) {
        setError('Could not access camera. Please allow camera permission or use "Choose file" instead.');
      }
    };
    start();
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      const reader = new FileReader();
      reader.onload = (e) => onCapture(e.target.result.split(',')[1], 'image/jpeg');
      reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.92);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 640 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'Inter, sans-serif' }}>📷 Position your writing in the frame</div>
          <button onClick={onClose} style={{ padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>✕ Cancel</button>
        </div>
        {error ? (
          <div style={{ background: '#FFF1F2', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#BE123C', fontFamily: 'Inter, sans-serif', marginBottom: 12 }}>{error}</div>
            <button onClick={onClose} style={{ padding: '10px 24px', borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#000' }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', display: 'block', maxHeight: '60vh', objectFit: 'contain' }} />
              {!ready && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}><div style={{ fontSize: 14, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Starting camera...</div></div>}
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div style={{ marginTop: 16, display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={onClose} style={{ padding: '12px 24px', borderRadius: 100, fontSize: 14, fontWeight: 600, background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
              <button onClick={handleCapture} disabled={!ready} style={{ padding: '12px 32px', borderRadius: 100, fontSize: 15, fontWeight: 700, background: ready ? '#4338CA' : '#64748B', color: '#fff', border: 'none', cursor: ready ? 'pointer' : 'default', fontFamily: 'Inter, sans-serif' }}>📸 Take photo</button>
            </div>
          </>
        )}
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
  const [showCamera, setShowCamera] = useState(false);
  const fileRef = useRef();

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setMediaType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => { setPreview(e.target.result); setBase64(e.target.result.split(',')[1]); };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  }, []);

  const handleCameraCapture = (b64, mType) => {
    setBase64(b64); setMediaType(mType);
    setPreview(`data:${mType};base64,${b64}`);
    setShowCamera(false);
  };

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: 32 }}>
      {showCamera && <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 26, fontWeight: 800, color: '#0F172A', marginBottom: 6, letterSpacing: -0.5 }}>📷 Photo Writing Feedback</div>
        <div style={{ fontSize: 15, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>Upload or take a photo of your handwritten work for line-by-line feedback.</div>
      </div>
      <div style={{ background: '#fff', borderRadius: 16, padding: 20, marginBottom: 14, border: '1px solid rgba(67,56,202,0.08)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontFamily: 'Inter, sans-serif' }}>Writing type</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[{ key: 'narrative', label: '📖 Narrative' }, { key: 'persuasive', label: '💬 Persuasive' }, { key: 'creative', label: '✨ Creative' }, { key: 'informative', label: '📋 Informative' }].map(t => (
            <button key={t.key} onClick={() => setWritingType(t.key)} style={{ padding: '9px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: writingType === t.key ? '#4338CA' : '#F8F9FF', color: writingType === t.key ? '#fff' : '#64748B', border: writingType === t.key ? 'none' : '1.5px solid rgba(67,56,202,0.1)', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}>{t.label}</button>
          ))}
        </div>
      </div>
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
              <button onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }} style={{ padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#EEF2FF', color: '#4338CA', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>📁 Change</button>
              <button onClick={(e) => { e.stopPropagation(); setShowCamera(true); }} style={{ padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#F0FDF4', color: '#059669', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>📷 Retake</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 6 }}>Drop a photo here</div>
            <div style={{ fontSize: 14, color: '#64748B', fontFamily: 'Inter, sans-serif', marginBottom: 20 }}>or use the buttons below</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }} style={{ padding: '10px 22px', borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#EEF2FF', color: '#4338CA', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>📁 Choose file</button>
              <button onClick={(e) => { e.stopPropagation(); setShowCamera(true); }} style={{ padding: '10px 22px', borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#F0FDF4', color: '#059669', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>📷 Use camera</button>
            </div>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => processFile(e.target.files[0])} />
      {preview && (
        <button onClick={() => onImageReady(base64, mediaType, writingType)} style={{ width: '100%', padding: 16, borderRadius: 100, fontSize: 16, fontWeight: 700, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(67,56,202,0.3)' }}>
          Get writing feedback →
        </button>
      )}
    </div>
  );
}

// ── Score Summary ─────────────────────────────────────────────────────────────
function ScoreSummary({ feedback }) {
  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 20, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 2px 12px rgba(67,56,202,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#4338CA15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📊</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Assessment</div>
          <div style={{ fontSize: 13, color: '#64748B', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>Scored across 5 criteria</div>
        </div>
      </div>
      <div style={{ background: '#EEF2FF', borderRadius: 14, padding: '18px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <ScoreRing pct={feedback.totalPercent} size={90} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>Overall Score</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: getBandColor(feedback.totalPercent), fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{feedback.totalScore} / {feedback.maxTotal}</div>
          <div style={{ fontSize: 14, color: '#374151', fontFamily: 'Inter, sans-serif', marginTop: 6, lineHeight: 1.6 }}>{feedback.overallFeedback}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
        {feedback.criteria.map((c, i) => (
          <div key={i} style={{ background: '#F8FAFF', borderRadius: 12, padding: '12px 14px', border: '1px solid #EEF2FF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', fontFamily: 'Inter, sans-serif' }}>{c.name}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: getBandColor(c.percent), fontFamily: 'Inter, sans-serif' }}>{c.score}/{c.maxScore}</div>
            </div>
            <div style={{ height: 5, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${c.percent}%`, height: '100%', background: getBandColor(c.percent), borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>{getBandLabel(c.percent)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sentence-by-sentence feedback view ───────────────────────────────────────
// Uses the sentences[] array returned directly by the AI — no heuristic matching needed
function SentenceFeedback({ feedback }) {
  const sentences = feedback.sentences || [];
  const TECH_COLORS = {
    'Simile': '#4338CA', 'Metaphor': '#059669', 'Alliteration': '#F97316',
    'Personification': '#8B5CF6', 'Imagery': '#0EA5E9', 'Rhetorical Question': '#EF4444',
    'Complex Sentence': '#4338CA', 'Conditional Sentence': '#059669',
    'Parallel Structure': '#F97316', 'Contrast': '#8B5CF6',
    'Emphasis': '#EF4444', 'Inverted Order': '#0EA5E9',
  };
  const getTechColor = (t) => TECH_COLORS[t] || '#4338CA';

  if (sentences.length === 0) {
    return (
      <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 20, border: '1px solid rgba(67,56,202,0.08)' }}>
        <div style={{ fontSize: 14, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>No sentence-level feedback available.</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 20, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 2px 12px rgba(67,56,202,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#F0FDF415', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📝</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Line-by-Line Feedback</div>
          <div style={{ fontSize: 13, color: '#64748B', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>All feedback for each sentence in order — rewrite as you go</div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20, padding: '10px 14px', background: '#F8FAFF', borderRadius: 10, border: '1px solid #EEF2FF' }}>
        {[['✏️ Spelling', '#FFF1F2', '#BE123C'], ['📐 Grammar', '#FFF7ED', '#C2410C'], ['💎 Vocab upgrade', '#F0FDF4', '#059669'], ['🏗️ Rewrite option', '#F5F3FF', '#7C3AED']].map(([label, bg, color]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: bg, border: `1.5px solid ${color}` }} />
            <span style={{ fontSize: 11, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>{label}</span>
          </div>
        ))}
      </div>

      {sentences.map((s, idx) => {
        const hasSpelling = (s.spellingErrors || []).length > 0;
        const hasGrammar = (s.grammarErrors || []).length > 0;
        const hasVocab = (s.vocabUpgrades || []).length > 0;
        const hasStructure = (s.structureUpgrades || []).length > 0;
        const hasAny = hasSpelling || hasGrammar || hasVocab || hasStructure;

        return (
          <div key={idx} style={{ marginBottom: 24, borderBottom: idx < sentences.length - 1 ? '1px solid #F1F5F9' : 'none', paddingBottom: 24 }}>
            {/* Sentence number + text */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: hasAny ? 12 : 0 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#4338CA', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2, fontFamily: 'Inter, sans-serif' }}>{idx + 1}</div>
              <div style={{ fontSize: 15, color: '#0F172A', fontFamily: 'Georgia, serif', lineHeight: 1.75, flex: 1 }}>{s.sentence}</div>
            </div>

            {!hasAny && (
              <div style={{ marginLeft: 34, fontSize: 12, color: '#059669', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>✓ No issues — well done!</div>
            )}

            {/* Spelling */}
            {(s.spellingErrors || []).map((e, i) => (
              <div key={`sp${i}`} style={{ marginLeft: 34, marginBottom: 8, background: '#FFF1F2', borderRadius: 10, padding: '10px 14px', border: '1px solid #FECDD3' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#BE123C', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5, fontFamily: 'Inter, sans-serif' }}>✏️ Spelling</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, color: '#BE123C', fontWeight: 700, fontFamily: 'Inter, sans-serif', textDecoration: 'line-through' }}>{e.original}</span>
                  <span style={{ fontSize: 14, color: '#374151' }}>→</span>
                  <span style={{ fontSize: 14, color: '#059669', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>{e.correction}</span>
                </div>
                {e.rule && <div style={{ fontSize: 12, color: '#64748B', fontFamily: 'Inter, sans-serif', marginTop: 4, fontStyle: 'italic' }}>{e.rule}</div>}
              </div>
            ))}

            {/* Grammar */}
            {(s.grammarErrors || []).map((g, i) => (
              <div key={`gr${i}`} style={{ marginLeft: 34, marginBottom: 8, background: '#FFF7ED', borderRadius: 10, padding: '10px 14px', border: '1px solid #FED7AA' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5, fontFamily: 'Inter, sans-serif' }}>📐 Grammar</div>
                <div style={{ fontSize: 13, color: '#BE123C', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}><span style={{ fontWeight: 700 }}>Original: </span>{g.original}</div>
                <div style={{ fontSize: 13, color: '#059669', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}><span style={{ fontWeight: 700 }}>Corrected: </span>{g.corrected}</div>
                {g.explanation && <div style={{ fontSize: 12, color: '#64748B', fontFamily: 'Inter, sans-serif', fontStyle: 'italic' }}>{g.explanation}</div>}
              </div>
            ))}

            {/* Vocab upgrades */}
            {(s.vocabUpgrades || []).map((item, i) => (
              <VocabCard key={`vc${i}`} item={item} />
            ))}

            {/* Structure rewrites */}
            {(s.structureUpgrades || []).map((u, i) => (
              <StructureCard key={`sc${i}`} upgrade={u} techColor={getTechColor(u.technique)} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ── Vocab card (inline) ───────────────────────────────────────────────────────
function VocabCard({ item }) {
  const [chosen, setChosen] = useState(null);
  const typeLabel = item.type || 'Vocab';
  return (
    <div style={{ marginLeft: 34, marginBottom: 8, background: '#F0FDF4', borderRadius: 10, padding: '10px 14px', border: '1px solid #BBF7D0' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>💎 Vocab upgrade — replace <span style={{ color: '#BE123C', textDecoration: 'underline dotted' }}>{item.original}</span></div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
        {(item.options || []).map((opt, i) => (
          <button key={i} onClick={() => setChosen(chosen === i ? null : i)} style={{ padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: chosen === i ? '#059669' : '#fff', color: chosen === i ? '#fff' : '#374151', border: `1.5px solid ${chosen === i ? '#059669' : '#BBF7D0'}`, fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}>{opt}</button>
        ))}
      </div>
      {item.why && <div style={{ fontSize: 11, color: '#64748B', fontFamily: 'Inter, sans-serif', fontStyle: 'italic' }}>💡 {item.why}</div>}
    </div>
  );
}

// ── Structure rewrite card (inline) ──────────────────────────────────────────
function StructureCard({ upgrade, techColor }) {
  const [chosen, setChosen] = useState(null);
  const versions = upgrade.rewritten || upgrade.options || [];
  return (
    <div style={{ marginLeft: 34, marginBottom: 8, background: '#F5F3FF', borderRadius: 10, padding: '10px 14px', border: '1px solid #DDD6FE' }}>
      <div style={{ marginBottom: 8 }}>
        <span style={{ display: 'inline-block', background: `${techColor}15`, color: techColor, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Inter, sans-serif', border: `1px solid ${techColor}30` }}>🏗️ {upgrade.technique}</span>
      </div>
      <div style={{ fontSize: 12, color: '#6D28D9', fontFamily: 'Inter, sans-serif', marginBottom: 6 }}>Choose a rewritten version:</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {versions.map((opt, i) => (
          <button key={i} onClick={() => setChosen(chosen === i ? null : i)} style={{ padding: '9px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: chosen === i ? `${techColor}10` : '#fff', color: '#374151', border: `1.5px solid ${chosen === i ? techColor : '#DDD6FE'}`, textAlign: 'left', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6, transition: 'all 0.15s' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'normal', fontSize: 10, fontWeight: 700, color: chosen === i ? techColor : '#94A3B8', marginRight: 6 }}>Option {i + 1}:</span>
            {opt}
          </button>
        ))}
      </div>
      {upgrade.explanation && <div style={{ marginTop: 8, fontSize: 11, color: '#64748B', fontFamily: 'Inter, sans-serif', fontStyle: 'italic' }}>💡 {upgrade.explanation}</div>}
    </div>
  );
}

// ── Rewrite Pad ───────────────────────────────────────────────────────────────
function RewritePad() {
  const [text, setText] = useState('');
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 16, border: '1px solid rgba(67,56,202,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#05996915', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>✍️</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Your Rewrite</div>
          <div style={{ fontSize: 13, color: '#64748B', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>Work through the passage sentence by sentence using the feedback above</div>
        </div>
      </div>
      <div style={{ background: '#F0FDF4', borderRadius: 12, padding: '12px 16px', marginBottom: 14, border: '1px solid #BBF7D0', fontSize: 13, color: '#059669', fontFamily: 'Inter, sans-serif', lineHeight: 1.65 }}>
        <strong>Tip:</strong> Start from sentence 1 and work down. Fix spelling and grammar first, then swap in your chosen vocabulary upgrades, then apply any sentence structure techniques you liked.
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Start rewriting here, sentence by sentence..." rows={12} style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1.5px solid #E5E7EB', fontSize: 14, fontFamily: 'Georgia, serif', color: '#0F172A', lineHeight: 1.85, resize: 'vertical', outline: 'none', boxSizing: 'border-box', minHeight: 280 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>{wordCount} words</div>
        {text && <button onClick={() => navigator.clipboard?.writeText(text)} style={{ padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: '#EEF2FF', color: '#4338CA', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>📋 Copy text</button>}
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
      <div style={{ background: '#EEF2FF', borderRadius: 12, padding: '14px 20px', marginBottom: 32 }}>
        <div style={{ fontSize: 13, color: '#4338CA', fontFamily: 'Inter, sans-serif' }}>This usually takes 20–40 seconds — we're doing a thorough analysis!</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: i <= step ? 1 : 0.3, transition: 'opacity 0.4s' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: i < step ? '#059669' : i === step ? '#4338CA' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', flexShrink: 0 }}>{i < step ? '✓' : i + 1}</div>
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
  const [phase, setPhase] = useState('upload');
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');
  const [dots, setDots] = useState('');

  React.useEffect(() => {
    if (phase !== 'loading') return;
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(t);
  }, [phase]);

  const handleImageReady = async (base64, mediaType, writingType) => {
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
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(67,56,202,0.08)', padding: '18px 32px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📷</div>
        <div>
          <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 18, fontWeight: 800, color: '#0F172A', letterSpacing: -0.3 }}>Photo Writing Feedback</div>
          <div style={{ fontSize: 13, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Year {yearLevel} · Line-by-line feedback</div>
        </div>
        <button onClick={() => navigate('/app/writing')} style={{ marginLeft: 'auto', padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>← Writing</button>
      </div>

      {error && (
        <div style={{ maxWidth: 620, margin: '16px auto 0', padding: '0 24px' }}>
          <div style={{ background: '#FFF1F2', border: '1px solid #FDA4AF', borderRadius: 12, padding: '14px 18px', fontSize: 14, color: '#BE123C', fontFamily: 'Inter, sans-serif' }}>⚠️ {error}</div>
        </div>
      )}

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
              {/* Score summary at top */}
              <ScoreSummary feedback={feedback} />

              {/* Line-by-line feedback — main new layout */}
              <SentenceFeedback feedback={feedback} />

              {/* Rewrite pad */}
              <RewritePad />

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