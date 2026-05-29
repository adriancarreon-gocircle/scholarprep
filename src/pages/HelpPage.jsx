import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Mock Screenshots using SVG ────────────────────────────────────────────────

function MockProgress() {
  return (
    <svg viewBox="0 0 560 320" style={{ width: '100%', borderRadius: 10, border: '1px solid #E5E7EB' }}>
      <rect width="560" height="320" fill="#F5F7FF"/>
      {/* Sidebar */}
      <rect width="140" height="320" fill="#3730A3"/>
      <text x="16" y="28" fontSize="13" fontWeight="800" fill="white" fontFamily="sans-serif">Scholar</text>
      <text x="68" y="28" fontSize="13" fontWeight="800" fill="#A5B4FC" fontFamily="sans-serif">Prep</text>
      {['Home','Mathematics','Reading','General Ability','Writing','Progress'].map((item, i) => (
        <g key={i}>
          <rect x="8" y={50 + i*32} width="124" height="26" rx="6" fill={item==='Progress' ? 'rgba(255,255,255,0.2)' : 'transparent'}/>
          <text x="20" y={67 + i*32} fontSize="11" fill={item==='Progress' ? 'white' : 'rgba(255,255,255,0.65)'} fontFamily="sans-serif">{item}</text>
        </g>
      ))}
      {/* Main area */}
      <text x="155" y="30" fontSize="14" fontWeight="700" fill="#0F172A" fontFamily="sans-serif">Progress Dashboard</text>
      {/* Score cards */}
      {[{label:'Mathematics',score:'78%',grade:'B',color:'#4338CA'},{label:'Reading',score:'71%',grade:'B',color:'#059669'},{label:'General Ability',score:'65%',grade:'C+',color:'#F97316'}].map((c,i) => (
        <g key={i}>
          <rect x={155 + i*130} y="45" width="120" height="70" rx="10" fill="white" stroke="#EEF2FF" strokeWidth="1"/>
          <text x={215 + i*130} y="72" fontSize="22" fontWeight="900" fill={c.color} textAnchor="middle" fontFamily="sans-serif">{c.score}</text>
          <text x={215 + i*130} y="90" fontSize="10" fill="#94A3B8" textAnchor="middle" fontFamily="sans-serif">{c.label}</text>
          <text x={215 + i*130} y="106" fontSize="12" fontWeight="700" fill={c.color} textAnchor="middle" fontFamily="sans-serif">Grade {c.grade}</text>
        </g>
      ))}
      {/* Bar chart area */}
      <rect x="155" y="130" width="390" height="170" rx="10" fill="white" stroke="#EEF2FF" strokeWidth="1"/>
      <text x="170" y="150" fontSize="11" fontWeight="700" fill="#374151" fontFamily="sans-serif">Mathematics — Topic Breakdown</text>
      {[['Numbers',85,'#4338CA'],['Addition',72,'#4338CA'],['Fractions',55,'#F97316'],['Geometry',90,'#059669'],['Algebra',48,'#EF4444']].map(([label,pct,color],i) => (
        <g key={i}>
          <text x="170" y={175 + i*26} fontSize="10" fill="#64748B" fontFamily="sans-serif">{label}</text>
          <rect x="250" y={163 + i*26} width="260" height="14" rx="7" fill="#F1F5F9"/>
          <rect x="250" y={163 + i*26} width={pct*2.6} height="14" rx="7" fill={color}/>
          <text x={518} y={175 + i*26} fontSize="10" fontWeight="700" fill={color} textAnchor="end" fontFamily="sans-serif">{pct}%</text>
        </g>
      ))}
    </svg>
  );
}

function MockMathTest() {
  return (
    <svg viewBox="0 0 560 300" style={{ width: '100%', borderRadius: 10, border: '1px solid #E5E7EB' }}>
      <rect width="560" height="300" fill="#F5F7FF"/>
      <rect width="140" height="300" fill="#3730A3"/>
      <text x="16" y="28" fontSize="13" fontWeight="800" fill="white" fontFamily="sans-serif">Scholar</text>
      <text x="68" y="28" fontSize="13" fontWeight="800" fill="#A5B4FC" fontFamily="sans-serif">Prep</text>
      {['Home','Mathematics','Reading','General Ability','Writing','Progress'].map((item, i) => (
        <text key={i} x="20" y={67 + i*32} fontSize="11" fill={item==='Mathematics' ? 'white' : 'rgba(255,255,255,0.65)'} fontFamily="sans-serif">{item}</text>
      ))}
      {/* Setup card */}
      <rect x="155" y="20" width="390" height="260" rx="12" fill="white" stroke="#EEF2FF" strokeWidth="1"/>
      <text x="340" y="50" fontSize="16" fontWeight="800" fill="#0F172A" textAnchor="middle" fontFamily="sans-serif">Mathematics</text>
      <text x="340" y="68" fontSize="10" fill="#94A3B8" textAnchor="middle" fontFamily="sans-serif">Fresh questions · Year 6 level</text>
      {/* Question count */}
      <text x="175" y="95" fontSize="9" fontWeight="700" fill="#94A3B8" fontFamily="sans-serif">NUMBER OF QUESTIONS</text>
      {[5,10,15,20,30].map((n,i) => (
        <g key={i}>
          <rect x={175 + i*60} y="102" width="50" height="24" rx="12" fill={n===10 ? '#4338CA' : '#F8F9FF'} stroke={n===10 ? 'none' : '#E5E7EB'} strokeWidth="1"/>
          <text x={200 + i*60} y="118" fontSize="11" fontWeight="600" fill={n===10 ? 'white' : '#64748B'} textAnchor="middle" fontFamily="sans-serif">{n}</text>
        </g>
      ))}
      {/* Topic picker */}
      <text x="175" y="148" fontSize="9" fontWeight="700" fill="#94A3B8" fontFamily="sans-serif">PICK SPECIFIC TOPICS</text>
      <rect x="175" y="154" width="350" height="36" rx="8" fill="#F8FAFF" stroke="#EEF2FF" strokeWidth="1"/>
      <text x="190" y="176" fontSize="10" fill="#64748B" fontFamily="sans-serif">Optional — or use random mix above</text>
      <rect x="475" y="160" width="40" height="22" rx="11" fill="#F1F5F9" stroke="#E5E7EB" strokeWidth="1"/>
      <text x="495" y="175" fontSize="9" fill="#64748B" textAnchor="middle" fontFamily="sans-serif">▼ Pick</text>
      {/* Time */}
      <text x="175" y="210" fontSize="9" fontWeight="700" fill="#94A3B8" fontFamily="sans-serif">TIME LIMIT</text>
      {['No timer','10 min','20 min','30 min','45 min'].map((t,i) => (
        <g key={i}>
          <rect x={175 + i*72} y="216" width="64" height="22" rx="11" fill={t==='No timer' ? '#0F172A' : '#F8F9FF'} stroke={t==='No timer' ? 'none' : '#E5E7EB'} strokeWidth="1"/>
          <text x={207 + i*72} y="231" fontSize="9" fontWeight={t==='No timer'?'700':'500'} fill={t==='No timer' ? 'white' : '#64748B'} textAnchor="middle" fontFamily="sans-serif">{t}</text>
        </g>
      ))}
      {/* Generate button */}
      <rect x="175" y="252" width="350" height="20" rx="10" fill="#4338CA"/>
      <text x="350" y="265" fontSize="11" fontWeight="700" fill="white" textAnchor="middle" fontFamily="sans-serif">Generate test →</text>
    </svg>
  );
}

function MockCustomTest() {
  return (
    <svg viewBox="0 0 560 320" style={{ width: '100%', borderRadius: 10, border: '1px solid #E5E7EB' }}>
      <rect width="560" height="320" fill="#F5F7FF"/>
      <rect width="140" height="320" fill="#3730A3"/>
      <text x="16" y="28" fontSize="13" fontWeight="800" fill="white" fontFamily="sans-serif">Scholar</text>
      <text x="68" y="28" fontSize="13" fontWeight="800" fill="#A5B4FC" fontFamily="sans-serif">Prep</text>
      {['Home','Mathematics','Reading','General Ability','Writing','Progress','Custom Test'].map((item, i) => (
        <text key={i} x="20" y={52 + i*32} fontSize="10" fill={item==='Custom Test' ? 'white' : 'rgba(255,255,255,0.65)'} fontFamily="sans-serif">{item}</text>
      ))}
      {/* Header */}
      <text x="165" y="28" fontSize="13" fontWeight="800" fill="#0F172A" fontFamily="sans-serif">Build a custom test</text>
      {/* Saved test cards */}
      {[{name:'Yr 5 Maths — Mixed',subjects:'🔢 Mathematics',q:'15 questions · No timer'},
        {name:'Weekly English Drill',subjects:'📖 Reading · 🧩 General Ability',q:'12 questions · 20 min'},
        {name:'Fractions Focus',subjects:'🔢 Mathematics',q:'10 questions · No timer'}].map((t,i) => (
        <g key={i}>
          <rect x="155" y={45 + i*82} width="392" height="70" rx="10" fill="white" stroke="#EEF2FF" strokeWidth="1"/>
          <text x="175" y={68 + i*82} fontSize="12" fontWeight="700" fill="#0F172A" fontFamily="sans-serif">{t.name}</text>
          <text x="175" y={84 + i*82} fontSize="10" fill="#64748B" fontFamily="sans-serif">{t.subjects} · {t.q}</text>
          {/* Start button */}
          <rect x="465" y={60 + i*82} width="68" height="24" rx="12" fill="#4338CA"/>
          <text x="499" y="75.5" dy={i*82} fontSize="10" fontWeight="700" fill="white" textAnchor="middle" fontFamily="sans-serif">Start →</text>
          {/* Edit / Delete */}
          <rect x="387" y={60 + i*82} width="36" height="24" rx="12" fill="#F1F5F9"/>
          <text x="405" y="75.5" dy={i*82} fontSize="9" fill="#64748B" textAnchor="middle" fontFamily="sans-serif">Edit</text>
          <rect x="426" y={60 + i*82} width="36" height="24" rx="12" fill="#FFF1F2"/>
          <text x="444" y="75.5" dy={i*82} fontSize="9" fill="#EF4444" textAnchor="middle" fontFamily="sans-serif">Del</text>
        </g>
      ))}
      {/* New test button */}
      <rect x="155" y="295" width="392" height="18" rx="9" fill="#4338CA"/>
      <text x="351" y="307" fontSize="10" fontWeight="700" fill="white" textAnchor="middle" fontFamily="sans-serif">+ Build a new test</text>
    </svg>
  );
}

function MockWritingFeedback() {
  return (
    <svg viewBox="0 0 560 320" style={{ width: '100%', borderRadius: 10, border: '1px solid #E5E7EB' }}>
      <rect width="560" height="320" fill="#F5F7FF"/>
      <rect width="140" height="320" fill="#3730A3"/>
      <text x="16" y="28" fontSize="13" fontWeight="800" fill="white" fontFamily="sans-serif">Scholar</text>
      <text x="68" y="28" fontSize="13" fontWeight="800" fill="#A5B4FC" fontFamily="sans-serif">Prep</text>
      {/* Photo feedback header */}
      <text x="160" y="28" fontSize="12" fontWeight="800" fill="#0F172A" fontFamily="sans-serif">📷 Photo Writing Feedback</text>
      {/* Score rings */}
      {[{label:'Ideas',pct:82,color:'#059669'},{label:'Structure',pct:68,color:'#4338CA'},{label:'Language',pct:75,color:'#4338CA'},{label:'Sentences',pct:60,color:'#F97316'},{label:'Spelling',pct:90,color:'#059669'}].map((c,i) => (
        <g key={i}>
          <circle cx={185 + i*76} cy={72} r="26" fill="none" stroke="#E5E7EB" strokeWidth="5"/>
          <circle cx={185 + i*76} cy={72} r="26" fill="none" stroke={c.color} strokeWidth="5"
            strokeDasharray={`${c.pct*1.63} 163`} strokeLinecap="round"
            transform={`rotate(-90 ${185+i*76} 72)`}/>
          <text x={185+i*76} y="69" fontSize="11" fontWeight="800" fill={c.color} textAnchor="middle" fontFamily="sans-serif">{c.pct}%</text>
          <text x={185+i*76} y="82" fontSize="8" fill="#94A3B8" textAnchor="middle" fontFamily="sans-serif">{c.label}</text>
        </g>
      ))}
      {/* Vocabulary upgrades section */}
      <rect x="155" y="110" width="390" height="80" rx="10" fill="white" stroke="#EEF2FF" strokeWidth="1"/>
      <text x="175" y="130" fontSize="11" fontWeight="800" fill="#0F172A" fontFamily="sans-serif">💎 Vocabulary Upgrades</text>
      <text x="175" y="148" fontSize="9" fill="#64748B" fontFamily="sans-serif">Sentence: "The dog ran quickly through the old garden."</text>
      <text x="175" y="162" fontSize="9" fill="#94A3B8" fontFamily="sans-serif">Replace "old" with:</text>
      {['weathered','overgrown','neglected'].map((w,i) => (
        <g key={i}>
          <rect x={175 + i*92} y="168" width="84" height="18" rx="9" fill={i===0 ? '#4338CA' : '#F8F9FF'} stroke={i===0 ? 'none' : '#E5E7EB'} strokeWidth="1"/>
          <text x={217 + i*92} y="180" fontSize="9" fontWeight={i===0 ? '700' : '500'} fill={i===0 ? 'white' : '#374151'} textAnchor="middle" fontFamily="sans-serif">{w}</text>
        </g>
      ))}
      {/* Sentence upgrade section */}
      <rect x="155" y="200" width="390" height="108" rx="10" fill="white" stroke="#EEF2FF" strokeWidth="1"/>
      <text x="175" y="220" fontSize="11" fontWeight="800" fill="#0F172A" fontFamily="sans-serif">🏗️ Sentence Structure Upgrades</text>
      <rect x="175" y="228" width="60" height="14" rx="7" fill="#EEF2FF"/>
      <text x="205" y="238" fontSize="8" fontWeight="700" fill="#4338CA" textAnchor="middle" fontFamily="sans-serif">SIMILE</text>
      <text x="175" y="256" fontSize="8" fill="#94A3B8" fontFamily="sans-serif">Original: "She was happy about winning."</text>
      <text x="175" y="270" fontSize="8" fontWeight="600" fill="#374151" fontFamily="sans-serif">Option 1: "She glowed like a firefly, buzzing with joy after winning."</text>
      <text x="175" y="284" fontSize="8" fontWeight="600" fill="#374151" fontFamily="sans-serif">Option 2: "Her smile spread like sunlight after her victory."</text>
      <rect x="175" y="290" width="76" height="14" rx="7" fill="#EEF2FF"/>
      <text x="213" y="300" fontSize="8" fontWeight="700" fill="#4338CA" textAnchor="middle" fontFamily="sans-serif">RHETORICAL Q.</text>
    </svg>
  );
}

function MockSimulatedExam() {
  return (
    <svg viewBox="0 0 560 280" style={{ width: '100%', borderRadius: 10, border: '1px solid #E5E7EB' }}>
      <rect width="560" height="280" fill="#F5F7FF"/>
      <rect width="140" height="280" fill="#3730A3"/>
      <text x="16" y="28" fontSize="13" fontWeight="800" fill="white" fontFamily="sans-serif">Scholar</text>
      <text x="68" y="28" fontSize="13" fontWeight="800" fill="#A5B4FC" fontFamily="sans-serif">Prep</text>
      <text x="165" y="30" fontSize="14" fontWeight="800" fill="#0F172A" fontFamily="sans-serif">Simulated Exam</text>
      <text x="165" y="46" fontSize="10" fill="#94A3B8" fontFamily="sans-serif">Choose your exam type and sit a full practice test</text>
      {/* Exam type cards */}
      {[{name:'ACER',color:'#4338CA',desc:'Scholarship exam','sections':'Maths · Reading · Humanities · Written Expr.'},
        {name:'Edutest',color:'#059669',desc:'Selective entry','sections':'Maths · Reading · Verbal · Numerical'},
        {name:'AAST',color:'#F97316',desc:'Selective schools','sections':'Maths · English · General Ability'},
        {name:'NAPLAN',color:'#8B5CF6',desc:'National testing','sections':'Numeracy · Reading · Language'}].map((e,i) => (
        <g key={i}>
          <rect x={155 + (i%2)*196} y={65 + Math.floor(i/2)*100} width="184" height="88" rx="12" fill="white" stroke="#EEF2FF" strokeWidth="1"/>
          <rect x={165 + (i%2)*196} y={80 + Math.floor(i/2)*100} width="40" height="18" rx="9" fill={e.color}/>
          <text x={185 + (i%2)*196} y={92 + Math.floor(i/2)*100} fontSize="9" fontWeight="800" fill="white" textAnchor="middle" fontFamily="sans-serif">{e.name}</text>
          <text x={165 + (i%2)*196} y={112 + Math.floor(i/2)*100} fontSize="11" fontWeight="700" fill="#0F172A" fontFamily="sans-serif">{e.desc}</text>
          <text x={165 + (i%2)*196} y={126 + Math.floor(i/2)*100} fontSize="9" fill="#64748B" fontFamily="sans-serif">{e.sections}</text>
          <rect x={255 + (i%2)*196} y={127 + Math.floor(i/2)*100} width="72" height="18" rx="9" fill={e.color}/>
          <text x={291 + (i%2)*196} y={139 + Math.floor(i/2)*100} fontSize="9" fontWeight="700" fill="white" textAnchor="middle" fontFamily="sans-serif">Start exam →</text>
        </g>
      ))}
    </svg>
  );
}

function MockReading() {
  return (
    <svg viewBox="0 0 560 300" style={{ width: '100%', borderRadius: 10, border: '1px solid #E5E7EB' }}>
      <rect width="560" height="300" fill="#F5F7FF"/>
      <rect width="140" height="300" fill="#3730A3"/>
      <text x="16" y="28" fontSize="13" fontWeight="800" fill="white" fontFamily="sans-serif">Scholar</text>
      <text x="68" y="28" fontSize="13" fontWeight="800" fill="#A5B4FC" fontFamily="sans-serif">Prep</text>
      {/* passage */}
      <rect x="155" y="15" width="392" height="115" rx="10" fill="white" stroke="#D1FAE5" strokeWidth="1.5"/>
      <text x="170" y="34" fontSize="10" fontWeight="700" fill="#059669" fontFamily="sans-serif">PASSAGE 1 OF 2</text>
      <text x="170" y="50" fontSize="12" fontWeight="800" fill="#0F172A" fontFamily="sans-serif">The Sky Painter</text>
      <text x="170" y="66" fontSize="9" fill="#374151" fontFamily="sans-serif">Every evening, Mia climbed to the rooftop of the old lighthouse to watch the</text>
      <text x="170" y="78" fontSize="9" fill="#374151" fontFamily="sans-serif">sky change colour. Her grandfather had taught her to read the clouds — not</text>
      <text x="170" y="90" fontSize="9" fill="#374151" fontFamily="sans-serif">just to predict weather, but to find stories hidden in the shapes. "Each cloud</text>
      <text x="170" y="102" fontSize="9" fill="#374151" fontFamily="sans-serif">is a sentence," he would say. "Together they write the sky's diary."</text>
      <text x="170" y="118" fontSize="9" fill="#94A3B8" fontFamily="sans-serif">📖 Show passage (for Q2 onwards)</text>
      {/* question */}
      <rect x="155" y="140" width="392" height="148" rx="10" fill="white" stroke="#EEF2FF" strokeWidth="1"/>
      <text x="170" y="162" fontSize="11" fontWeight="600" fill="#0F172A" fontFamily="sans-serif">Q1. What did Mia's grandfather teach her about clouds?</text>
      {['A. How to predict tomorrow\'s weather','B. How to find stories hidden in their shapes','C. How to paint pictures inspired by the sky','D. How to navigate using cloud formations'].map((opt,i) => (
        <g key={i}>
          <rect x="170" y={172 + i*26} width="360" height="20" rx="8" fill={i===1 ? '#ECFDF5' : '#F8F9FF'} stroke={i===1 ? '#6EE7B7' : '#E5E7EB'} strokeWidth="1"/>
          <text x="182" y={186 + i*26} fontSize="9" fill={i===1 ? '#059669' : '#64748B'} fontFamily="sans-serif">{opt}</text>
          {i===1 && <text x="520" y={186 + i*26} fontSize="9" fill="#059669" textAnchor="middle" fontFamily="sans-serif">✓</text>}
        </g>
      ))}
    </svg>
  );
}

// ── Section Data ──────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'getting-started', label: '🚀 Getting Started', icon: '🚀' },
  { id: 'year-level', label: '📅 Year Level', icon: '📅' },
  { id: 'mathematics', label: '🔢 Mathematics', icon: '🔢' },
  { id: 'reading', label: '📖 Reading', icon: '📖' },
  { id: 'general-ability', label: '🧩 General Ability', icon: '🧩' },
  { id: 'writing', label: '✏️ Writing', icon: '✏️' },
  { id: 'photo-feedback', label: '📷 Photo Feedback', icon: '📷' },
  { id: 'progress', label: '📊 Progress', icon: '📊' },
  { id: 'custom-test', label: '🎯 Custom Tests', icon: '🎯' },
  { id: 'simulated-exam', label: '🏆 Simulated Exam', icon: '🏆' },
  { id: 'tips', label: '💡 Study Tips', icon: '💡' },
];

function Step({ number, text }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
      <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#4338CA', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0, fontFamily: 'Inter, sans-serif' }}>{number}</div>
      <div style={{ fontSize: 14, color: '#374151', fontFamily: 'Inter, sans-serif', lineHeight: 1.65, paddingTop: 3 }}>{text}</div>
    </div>
  );
}

function Tip({ icon, text }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 14px', background: '#EEF2FF', borderRadius: 10, marginBottom: 8, border: '1px solid #C7D2FE' }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
      <div style={{ fontSize: 13, color: '#374151', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>{text}</div>
    </div>
  );
}

function SectionCard({ id, title, subtitle, mock, children }) {
  return (
    <div id={id} style={{ marginBottom: 48 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 800, color: '#0F172A', margin: '0 0 4px', letterSpacing: -0.3 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 14, color: '#64748B', margin: 0, fontFamily: 'Inter, sans-serif' }}>{subtitle}</p>}
      </div>
      {mock && <div style={{ marginBottom: 20 }}>{mock}</div>}
      {children}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function HelpPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('getting-started');

  useEffect(() => {
    const handleScroll = () => {
      const sections = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean);
      for (const section of sections.reverse()) {
        if (section.getBoundingClientRect().top <= 120) {
          setActiveSection(section.id);
          return;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(id);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F7FF', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(67,56,202,0.08)', padding: '18px 32px', display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>❓</div>
        <div>
          <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 18, fontWeight: 800, color: '#0F172A', letterSpacing: -0.3 }}>Help & User Guide</div>
          <div style={{ fontSize: 13, color: '#94A3B8' }}>Everything you need to know about ScholarPrep</div>
        </div>
        <button onClick={() => navigate(-1)} style={{ marginLeft: 'auto', padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer' }}>← Back</button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, alignItems: 'start' }}>
        {/* Sticky nav */}
        <nav style={{ position: 'sticky', top: 88, background: '#fff', borderRadius: 16, padding: 16, border: '1px solid rgba(67,56,202,0.08)', boxShadow: '0 2px 8px rgba(67,56,202,0.05)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Contents</div>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => scrollTo(s.id)} style={{ width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 8, fontSize: 13, fontWeight: activeSection === s.id ? 700 : 400, background: activeSection === s.id ? '#EEF2FF' : 'transparent', color: activeSection === s.id ? '#4338CA' : '#374151', border: 'none', cursor: 'pointer', marginBottom: 2, transition: 'all 0.15s' }}>
              {s.label}
            </button>
          ))}
          <div style={{ borderTop: '1px solid #F1F5F9', marginTop: 12, paddingTop: 12 }}>
            <button onClick={() => navigate('/support')} style={{ width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 8, fontSize: 13, fontWeight: 500, background: '#F0FDF4', color: '#059669', border: 'none', cursor: 'pointer' }}>
              💬 Contact Support
            </button>
          </div>
        </nav>

        {/* Content */}
        <div>
          {/* Getting Started */}
          <SectionCard id="getting-started" title="🚀 Getting Started" subtitle="Set up your account and begin practising in under 2 minutes">
            <Step number="1" text="Sign up with your email address and create a password. You'll receive a confirmation email to verify your account." />
            <Step number="2" text="Select your Year Level in the sidebar on the left — this ensures all questions are calibrated to the right difficulty for your child." />
            <Step number="3" text="Choose a subject from the sidebar: Mathematics, Reading, General Ability, or Writing." />
            <Step number="4" text="Select the number of questions, time limit, and answer review mode, then click Generate test." />
            <Step number="5" text="Answer the questions. In Review as I go mode, you'll see the correct answer and explanation after each question. In Exam mode, you'll see all results at the end." />
            <Tip icon="💡" text="Start with a 10-question practice test in Review as I go mode so your child gets immediate feedback on every question." />
            <Tip icon="🎯" text="Change the Year Level at any time using the buttons in the sidebar — great for starting slightly below level to build confidence." />
          </SectionCard>

          {/* Year Level */}
          <SectionCard id="year-level" title="📅 Setting Your Year Level" subtitle="Questions adapt to the right difficulty automatically">
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, margin: '0 0 16px' }}>ScholarPrep supports Year 1 through Year 11. All questions — their difficulty, vocabulary, and mathematical complexity — are automatically adjusted based on the selected year level.</p>
            <div style={{ background: '#fff', borderRadius: 12, padding: 18, border: '1px solid #EEF2FF', marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Yr 1','Yr 2','Yr 3','Yr 4','Yr 5','Yr 6','Yr 7','Yr 8','Yr 9','Yr 10','Yr 11'].map((yr,i) => (
                  <div key={i} style={{ padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: yr === 'Yr 6' ? '#4338CA' : '#F8F9FF', color: yr === 'Yr 6' ? '#fff' : '#64748B', border: yr === 'Yr 6' ? 'none' : '1px solid #E5E7EB' }}>{yr}</div>
                ))}
              </div>
            </div>
            <Tip icon="📌" text="Select the current school year, not the target year. The questions are already calibrated for scholarship exam difficulty at each level." />
            <Tip icon="🔁" text="You can switch year levels mid-session. The sidebar always shows which level is active (highlighted in indigo)." />
          </SectionCard>

          {/* Mathematics */}
          <SectionCard id="mathematics" title="🔢 Mathematics Practice" subtitle="Fresh questions every session — never the same test twice" mock={<MockMathTest />}>
            <Step number="1" text="Navigate to Mathematics in the sidebar." />
            <Step number="2" text="Choose how many questions: 5, 10, 15, 20, or 30." />
            <Step number="3" text="Optionally expand Pick specific topics to choose exactly which topics to practise (e.g. only Fractions and Decimals). Use the + / − buttons to set how many questions per topic." />
            <Step number="4" text="Set a time limit if you want exam-like conditions — or leave it on No timer for relaxed practice." />
            <Step number="5" text="Choose Review as I go to see answers immediately, or Exam mode to see everything at the end." />
            <Step number="6" text="Click Generate test. Fresh questions are created in about 20 seconds." />
            <Tip icon="📊" text="Questions include visual diagrams for charts, perimeter shapes, money, thermometers and counting problems — just like real ACER and Edutest exams." />
            <Tip icon="🎯" text="Use the topic picker to target specific weaknesses identified in your Progress Dashboard." />
          </SectionCard>

          {/* Reading */}
          <SectionCard id="reading" title="📖 Reading Comprehension" subtitle="Fresh passages on different themes every session" mock={<MockReading />}>
            <Step number="1" text="Go to Reading in the sidebar." />
            <Step number="2" text="Set the number of passages (1–5) and questions per passage (1–10). For exam practice, 2 passages × 5 questions is typical." />
            <Step number="3" text="Optionally choose a passage theme (Environment, Science, Poetry, History, Fiction, etc.) or leave it random." />
            <Step number="4" text="Click Generate test. A new passage is written fresh each time." />
            <Step number="5" text="The passage appears above the first question. For later questions in the same passage, click Show passage to see it again." />
            <Tip icon="📖" text="Passages are generated from 100 unique story seeds across 10 themes — you're unlikely to see the same passage twice." />
            <Tip icon="🔍" text="Questions test Literal comprehension, Inference, Vocabulary in context, Main idea, and Author's purpose — all the question types found in real scholarship exams." />
          </SectionCard>

          {/* General Ability */}
          <SectionCard id="general-ability" title="🧩 General Ability" subtitle="Number patterns, verbal reasoning, logic and picture patterns">
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, marginBottom: 16 }}>General Ability tests the core reasoning skills used in ACER, AAST and Edutest scholarship exams. Questions are generated fresh each session with strict variety rules so you never see the same pattern twice.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[{icon:'🔢',title:'Number Patterns',desc:'Single digit steps, doubling, tripling, up-down alternating, Fibonacci'},
                {icon:'🔤',title:'Verbal Reasoning',desc:'Word analogies, odd one out, synonyms, antonyms, letter patterns'},
                {icon:'🧠',title:'Logic & Reasoning',desc:'Draw conclusions, find info in text, order steps, coding'},
                {icon:'🎨',title:'Picture Patterns',desc:'Shape sequences, fill patterns, count patterns, rotation patterns'}].map((c,i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: '1px solid #EEF2FF' }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{c.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>{c.desc}</div>
                </div>
              ))}
            </div>
            <Tip icon="🎨" text="Picture Pattern questions show a sequence of shape frames — select which shape logically comes next. Answer options are shown as actual shapes, not text descriptions." />
          </SectionCard>

          {/* Writing */}
          <SectionCard id="writing" title="✏️ Writing Practice" subtitle="Timed writing prompts with scored feedback across 5 criteria">
            <Step number="1" text="Go to Writing in the sidebar." />
            <Step number="2" text="Choose Narrative (story) or Persuasive (argument) writing type." />
            <Step number="3" text="Optionally choose a theme (Environment, History, Sport, etc.) or let it generate a random one." />
            <Step number="4" text="Click Get writing prompt to receive a fresh exam-style prompt." />
            <Step number="5" text="Set a timer (15, 20, 25 or 30 minutes) to simulate real exam conditions, then write your response in the text box." />
            <Step number="6" text="Click Submit when done. Your writing is scored across 5 criteria: Ideas, Structure, Language, Sentence structure, and Spelling & Punctuation." />
            <Step number="7" text="View an Ideal answer to see what a top-scoring response looks like for the same prompt." />
            <Tip icon="⏱️" text="Set the timer to match your actual exam conditions. NAPLAN and most scholarship exams allow 25–40 minutes for writing tasks." />
            <Tip icon="📝" text="Use the photo feedback feature to get feedback on handwritten work — perfect after completing a practice exam on paper." />
          </SectionCard>

          {/* Photo Feedback */}
          <SectionCard id="photo-feedback" title="📷 Photo Writing Feedback" subtitle="Upload a photo of handwritten work for detailed feedback" mock={<MockWritingFeedback />}>
            <Step number="1" text="Go to Writing and click the Photo Feedback — New! card at the top." />
            <Step number="2" text="Select the writing type (Narrative, Persuasive, Creative, or Informative)." />
            <Step number="3" text="Upload a photo of the handwritten work — drag and drop, click Choose file, or tap Use camera on mobile." />
            <Step number="4" text="Click Get writing feedback. The system reads the handwriting, transcribes it, and analyses it (takes about 30 seconds)." />
            <Step number="5" text="Review the feedback across 6 sections: Assessment scores, Transcribed text, Spelling & Grammar corrections, Vocabulary upgrades, Sentence structure upgrades, and a Rewrite pad." />
            <Step number="6" text="In the Vocabulary section, tap word options to choose stronger adjectives, verbs and adverbs. In the Sentence Structure section, choose from 2 rewritten versions of each sentence using techniques like Simile, Alliteration and Metaphor." />
            <Step number="7" text="Use the Rewrite pad at the bottom to rewrite the piece incorporating your chosen improvements." />
            <Tip icon="📸" text="For best results, photograph in good lighting with the page flat. Write clearly — the system can read most handwriting styles." />
            <Tip icon="✏️" text="After getting feedback, always attempt the rewrite yourself rather than just reading the suggestions. Writing it out is where the real learning happens." />
          </SectionCard>

          {/* Progress */}
          <SectionCard id="progress" title="📊 Progress Dashboard" subtitle="Track performance over time across all subjects" mock={<MockProgress />}>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, marginBottom: 16 }}>The Progress Dashboard records every test you complete and tracks scores by subject and topic over time. Your results are compared to national averages for your year level.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[{icon:'📈',title:'Overall score',desc:'Your weighted average across all sessions per subject'},
                {icon:'🗂️',title:'Topic breakdown',desc:'See exactly which topics are strong and which need work'},
                {icon:'📋',title:'Test history',desc:'Every session logged with date, score, grade and year level'}].map((c,i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: '1px solid #EEF2FF', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{c.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5 }}>{c.desc}</div>
                </div>
              ))}
            </div>
            <Tip icon="📊" text="Use the topic breakdown to guide your next practice session — focus on the red bars (low scores) rather than topics you're already strong in." />
            <Tip icon="🏆" text="Aim to improve your score by at least 5% per week. Consistent daily practice of 15–20 minutes is more effective than one long session per week." />
          </SectionCard>

          {/* Custom Test */}
          <SectionCard id="custom-test" title="🎯 Custom Tests" subtitle="Build, save and reuse your own practice tests" mock={<MockCustomTest />}>
            <Step number="1" text="Go to Custom Test in the sidebar. Saved tests appear here for reuse." />
            <Step number="2" text="Click Build a test (or + New test) to open the builder." />
            <Step number="3" text="Expand a subject (Mathematics, Reading, or General Ability) by clicking it." />
            <Step number="4" text="Expand a topic (e.g. Fractions) — use the + / − on the topic row to add questions from any question type, OR expand the topic further to pick a specific question type and see example questions." />
            <Step number="5" text="Mix subjects freely — add Maths questions AND Reading passages in the same test." />
            <Step number="6" text="Set a timer and answer review mode, then either Generate test now (no saving) or give it a name to Save and reuse later." />
            <Tip icon="💾" text="Saving is optional. If you just want to practise specific topics quickly, build the test and click Generate test now — no name required." />
            <Tip icon="🔁" text="Saved tests appear in your list and can be started, edited or deleted at any time. Great for weekly revision routines." />
            <Tip icon="👀" text="Expand any question type to see real example questions from the question bank before adding them — so you know exactly what you're practising." />
          </SectionCard>

          {/* Simulated Exam */}
          <SectionCard id="simulated-exam" title="🏆 Simulated Exams" subtitle="Full-length practice exams in ACER, Edutest, AAST and NAPLAN format" mock={<MockSimulatedExam />}>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, marginBottom: 16 }}>Simulated Exams replicate the format, timing and question types of real Australian scholarship exams. Each exam includes the correct number of sections and questions for that test.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[{name:'ACER',color:'#4338CA',secs:'4 sections · Maths, Reading, Humanities, Written Expression'},
                {name:'Edutest',color:'#059669',secs:'4 sections · Maths, Reading, Verbal Reasoning, Numerical'},
                {name:'AAST',color:'#F97316',secs:'3 sections · Mathematics, English, General Ability'},
                {name:'NAPLAN',color:'#8B5CF6',secs:'3 sections · Numeracy, Reading, Language Conventions'}].map((e,i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: `1px solid ${e.color}30` }}>
                  <div style={{ display: 'inline-block', background: e.color, color: '#fff', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 800, marginBottom: 8 }}>{e.name}</div>
                  <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>{e.secs}</div>
                </div>
              ))}
            </div>
            <Tip icon="⏰" text="Always do simulated exams with the timer on and in Exam mode — this is the most realistic preparation for the actual test day." />
            <Tip icon="📅" text="Do at least 2–3 full simulated exams in the weeks before your exam. They help with time management as much as content." />
          </SectionCard>

          {/* Study Tips */}
          <SectionCard id="tips" title="💡 Study Tips for Scholarship Success">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                {icon:'📅', title:'Start early', desc:'Begin preparation at least 6 months before the exam. Consistent daily practice beats last-minute cramming.'},
                {icon:'⏱️', title:'Practise under time pressure', desc:'Use the timer feature regularly. Scholarship exams are time-pressured — speed and accuracy both matter.'},
                {icon:'📊', title:'Review your errors', desc:'Read every explanation for wrong answers. Understanding why you got something wrong is more valuable than getting it right.'},
                {icon:'🎯', title:'Target your weak topics', desc:'Check the Progress Dashboard weekly and spend extra time on topics with the lowest scores.'},
                {icon:'✏️', title:'Write regularly', desc:'Do at least one timed writing task per week. Use the photo feedback feature for handwritten practice.'},
                {icon:'🏆', title:'Do full mock exams', desc:'Do a complete Simulated Exam every 2–3 weeks. This builds the stamina needed for a 2–3 hour real exam.'},
                {icon:'🔁', title:'Vary your practice', desc:'Alternate between subjects each day rather than doing the same subject repeatedly — variety improves retention.'},
                {icon:'😴', title:'Rest matters', desc:'Regular sleep and breaks are essential. A well-rested brain performs significantly better on exam day.'},
              ].map((t,i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', border: '1px solid #EEF2FF' }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{t.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>{t.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, background: '#EEF2FF', borderRadius: 14, padding: '20px 24px', border: '1px solid #C7D2FE' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#4338CA', marginBottom: 8 }}>Still have questions?</div>
              <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 14 }}>We're here to help. Use the Support page to send us a message and we'll get back to you within 1–2 business days.</div>
              <button onClick={() => navigate('/support')} style={{ padding: '10px 24px', borderRadius: 100, fontSize: 14, fontWeight: 700, background: '#4338CA', color: '#fff', border: 'none', cursor: 'pointer' }}>
                💬 Contact Support →
              </button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
