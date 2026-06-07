import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LATEST_UPDATES = [
  {
    version: 'June 2025',
    badge: '🆕 Latest',
    badgeColor: '#10b981',
    title: 'Custom Subject & Question Creator',
    items: [
      'Build tests from your own questions — type them or photograph them',
      'Custom subject card now appears across all test builders',
      'Save question templates and reuse them any time',
    ],
  },
  {
    version: 'June 2025',
    badge: '📊 Progress',
    badgeColor: '#6366f1',
    title: 'Progress Dashboard Upgrade',
    items: [
      'Score trend charts now show your improvement over time',
      'Question Type breakdown sits beside each subject chart',
      'Needs Work & Strongest lists across all subjects',
    ],
  },
  {
    version: 'May 2025',
    badge: '✍️ Writing',
    badgeColor: '#f97316',
    title: 'Photo Writing Feedback',
    items: [
      'Upload a photo of your handwritten work for instant feedback',
      'Vocabulary upgrades, sentence rewrites, spelling corrections',
      'Works on mobile — use your camera directly',
    ],
  },
];

const FEATURES = [
  {
    icon: '🎯',
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.08)',
    route: '/app/maths',
    title: 'Practice Tests',
    tagline: 'Fresh questions every session',
    description:
      'Practise Maths, Reading, General Ability, and English with questions generated just for your year level. Choose your topic, question count, and timer — or go full exam mode.',
    steps: ['Pick a subject and year level', 'Choose topics and question count', 'Review answers as you go or wait till the end'],
    mockup: 'practice',
  },
  {
    icon: '✍️',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.08)',
    route: '/app/writing',
    title: 'Writing Practice',
    tagline: 'Narrative & Persuasive with feedback',
    description:
      'Get a timed writing prompt and submit your response for detailed scoring across 5 criteria. Or photograph your handwritten work for vocabulary upgrades and sentence rewrites.',
    steps: ['Choose narrative or persuasive', 'Write under a 25-minute timer', 'Get scored feedback and an ideal answer'],
    mockup: 'writing',
  },
  {
    icon: '📊',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    route: '/app/progress',
    title: 'Progress Dashboard',
    tagline: 'See exactly where to focus',
    description:
      'Track your score trends over time, see which topics need the most work, and compare your performance against the national average — broken down by subject and question type.',
    steps: ['Complete a few practice tests', 'Open Progress to see your scores', 'Focus on topics in "Needs Work"'],
    mockup: 'progress',
  },
  {
    icon: '🏆',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    route: '/app/simulated-exam',
    title: 'Simulated Exams',
    tagline: 'ACER · AAST · Edutest · NAPLAN',
    description:
      'Full exam-style tests that mirror the real scholarship papers. ACER, AAST, Edutest, and NAPLAN — each with the right subjects, question types, and difficulty.',
    steps: ['Choose your target exam', 'Complete all sections in order', 'Review your full exam performance'],
    mockup: 'exam',
  },
  {
    icon: '✨',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.08)',
    route: '/app/custom-test',
    title: 'Custom Tests',
    tagline: 'Build exactly what you need',
    description:
      'Mix any combination of subjects, topics, and question types into one test. Create tests from your own questions — type them or upload a photo. Save and reuse your favourites.',
    steps: ['Tap Custom Tests and click Build a test', 'Pick subjects and topics with + / −', 'Save it to reuse or just generate and go'],
    mockup: 'custom',
  },
  {
    icon: '📝',
    color: '#0ea5e9',
    bg: 'rgba(14,165,233,0.08)',
    route: '/app/simulated-exam',
    title: 'PDF Generator',
    tagline: 'Print-ready practice papers',
    description:
      'Generate a printable PDF of practice questions for any topic and year level. Pay per paper — no subscription needed. Perfect for offline revision or classroom use.',
    steps: ['Go to PDF Generator', 'Choose subject, topic, year and count', 'Pay once and download your paper'],
    mockup: 'pdf',
  },
];

function PracticeMockup() {
  return (
    <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', borderRadius: 10 }}>
      <rect width="320" height="200" fill="#f8f7ff" rx="10" />
      <rect x="12" y="12" width="296" height="36" fill="#6366f1" rx="8" />
      <text x="160" y="34" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">Mathematics — Year 5</text>
      <rect x="12" y="58" width="220" height="60" fill="white" rx="8" />
      <text x="24" y="78" fill="#1e1b4b" fontSize="11" fontWeight="600" fontFamily="Plus Jakarta Sans, sans-serif">Question 3 of 10</text>
      <text x="24" y="96" fill="#374151" fontSize="10" fontFamily="Inter, sans-serif">What is the area of a rectangle</text>
      <text x="24" y="110" fill="#374151" fontSize="10" fontFamily="Inter, sans-serif">with length 8 cm and width 5 cm?</text>
      <rect x="244" y="58" width="64" height="60" fill="white" rx="8" />
      <text x="276" y="82" textAnchor="middle" fill="#6366f1" fontSize="20" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">4:32</text>
      <text x="276" y="98" textAnchor="middle" fill="#9ca3af" fontSize="9" fontFamily="Inter, sans-serif">remaining</text>
      {[['A', '13 cm²', false], ['B', '40 cm²', true], ['C', '26 cm²', false], ['D', '30 cm²', false]].map(([ltr, txt, correct], i) => (
        <g key={ltr}>
          <rect x="12" y={128 + i * 16} width="200" height="13" fill={correct ? '#6366f1' : 'white'} rx="6" />
          <text x="22" y={138 + i * 16} fill={correct ? 'white' : '#6366f1'} fontSize="9" fontWeight="700" fontFamily="Inter, sans-serif">{ltr}</text>
          <text x="38" y={138 + i * 16} fill={correct ? 'white' : '#374151'} fontSize="9" fontFamily="Inter, sans-serif">{txt}</text>
        </g>
      ))}
      <rect x="224" y="128" width="84" height="40" fill="#f97316" rx="8" />
      <text x="266" y="150" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">Next →</text>
    </svg>
  );
}

function WritingMockup() {
  return (
    <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', borderRadius: 10 }}>
      <rect width="320" height="200" fill="#fff7ed" rx="10" />
      <rect x="12" y="12" width="296" height="36" fill="#f97316" rx="8" />
      <text x="160" y="34" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">Writing Feedback — Criteria</text>
      {[['Ideas & Content', 4], ['Structure', 5], ['Vocabulary', 3], ['Sentence Fluency', 4], ['Conventions', 5]].map(([label, score], i) => (
        <g key={label}>
          <text x="24" y={62 + i * 28} fill="#374151" fontSize="9" fontFamily="Inter, sans-serif">{label}</text>
          <rect x="120" y={51 + i * 28} width="140" height="10" fill="#fed7aa" rx="5" />
          <rect x="120" y={51 + i * 28} width={140 * score / 5} height="10" fill="#f97316" rx="5" />
          <text x="268" y={62 + i * 28} fill="#f97316" fontSize="10" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">{score}/5</text>
          <text x="284" y={62 + i * 28} fill="#9ca3af" fontSize="9" fontFamily="Inter, sans-serif">★</text>
        </g>
      ))}
    </svg>
  );
}

function ProgressMockup() {
  const bars = [72, 88, 65, 91, 58, 80, 76, 94];
  const labels = ['Num', 'Add', 'Sub', 'Mul', 'Frac', 'Dec', 'Geo', 'Alg'];
  return (
    <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', borderRadius: 10 }}>
      <rect width="320" height="200" fill="#f0fdf4" rx="10" />
      <rect x="12" y="12" width="296" height="28" fill="#10b981" rx="8" />
      <text x="160" y="30" textAnchor="middle" fill="white" fontSize="12" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">Mathematics — Progress</text>
      <text x="24" y="58" fill="#374151" fontSize="10" fontWeight="600" fontFamily="Plus Jakarta Sans, sans-serif">Topic Scores</text>
      {bars.map((h, i) => {
        const x = 24 + i * 35;
        const barH = (h / 100) * 80;
        const color = h >= 80 ? '#10b981' : h >= 65 ? '#6366f1' : '#f97316';
        return (
          <g key={i}>
            <rect x={x} y={145 - barH} width="22" height={barH} fill={color} rx="4" opacity="0.85" />
            <text x={x + 11} y="160" textAnchor="middle" fill="#6b7280" fontSize="7" fontFamily="Inter, sans-serif">{labels[i]}</text>
            <text x={x + 11} y={142 - barH} textAnchor="middle" fill={color} fontSize="8" fontWeight="700" fontFamily="Inter, sans-serif">{h}%</text>
          </g>
        );
      })}
      <rect x="12" y="170" width="296" height="20" fill="white" rx="6" />
      <text x="24" y="183" fill="#6b7280" fontSize="8" fontFamily="Inter, sans-serif">Overall score vs national average</text>
      <text x="280" y="183" fill="#10b981" fontSize="9" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">+12%</text>
    </svg>
  );
}

function ExamMockup() {
  return (
    <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', borderRadius: 10 }}>
      <rect width="320" height="200" fill="#faf5ff" rx="10" />
      <rect x="12" y="12" width="296" height="36" fill="#8b5cf6" rx="8" />
      <text x="160" y="30" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">Simulated Exams</text>
      <text x="160" y="44" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="8" fontFamily="Inter, sans-serif">Choose your target exam below</text>
      {[
        ['ACER', '#8b5cf6', 'Maths · Reading · Written Expression'],
        ['Edutest', '#6366f1', 'Maths · Verbal · Numerical'],
        ['AAST', '#ec4899', 'Mathematics · English · General Ability'],
        ['NAPLAN', '#0ea5e9', 'Numeracy · Reading · Language'],
      ].map(([name, color, sub], i) => (
        <g key={name}>
          <rect x="12" y={58 + i * 34} width="296" height="28" fill="white" rx="8" />
          <rect x="12" y={58 + i * 34} width="6" height="28" fill={color} rx="3" />
          <text x="28" y={75 + i * 34} fill="#1e1b4b" fontSize="11" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">{name}</text>
          <text x="85" y={75 + i * 34} fill="#9ca3af" fontSize="8" fontFamily="Inter, sans-serif">{sub}</text>
          <text x="296" y={75 + i * 34} textAnchor="end" fill={color} fontSize="11" fontFamily="Plus Jakarta Sans, sans-serif">→</text>
        </g>
      ))}
    </svg>
  );
}

function CustomMockup() {
  return (
    <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', borderRadius: 10 }}>
      <rect width="320" height="200" fill="#fdf2f8" rx="10" />
      <rect x="12" y="12" width="296" height="28" fill="#ec4899" rx="8" />
      <text x="160" y="30" textAnchor="middle" fill="white" fontSize="12" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">Build a Custom Test</text>
      {[
        ['Mathematics', '#6366f1', ['Addition +3', 'Fractions +2']],
        ['English', '#10b981', ['Spelling +5']],
        ['✨ Custom', '#ec4899', ['My hard questions +4']],
      ].map(([subj, color, chips], i) => (
        <g key={subj}>
          <rect x="12" y={48 + i * 48} width="296" height="38" fill="white" rx="8" />
          <text x="24" y={70 + i * 48} fill={color} fontSize="10" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">{subj}</text>
          {chips.map((chip, j) => (
            <g key={j}>
              <rect x={80 + j * 100} y={58 + i * 48} width={chip.length * 5.5 + 10} height="16" fill={color} rx="8" opacity="0.15" />
              <text x={85 + j * 100} y={70 + i * 48} fill={color} fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif">{chip}</text>
            </g>
          ))}
        </g>
      ))}
      <rect x="12" y="196" width="296" height="0" fill="transparent" />
      <rect x="80" y="162" width="160" height="26" fill="#ec4899" rx="10" />
      <text x="160" y="178" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">✨ Generate Test</text>
    </svg>
  );
}

function PDFMockup() {
  return (
    <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', borderRadius: 10 }}>
      <rect width="320" height="200" fill="#f0f9ff" rx="10" />
      <rect x="12" y="12" width="296" height="28" fill="#0ea5e9" rx="8" />
      <text x="160" y="30" textAnchor="middle" fill="white" fontSize="12" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">PDF Practice Paper Generator</text>
      <rect x="80" y="50" width="160" height="100" fill="white" rx="8" stroke="#bae6fd" strokeWidth="1.5" />
      <rect x="90" y="58" width="140" height="8" fill="#bae6fd" rx="4" />
      {[0, 1, 2, 3, 4].map(i => (
        <g key={i}>
          <text x="94" y={82 + i * 14} fill="#374151" fontSize="8" fontFamily="Inter, sans-serif">{i + 1}.</text>
          <rect x="103" y={75 + i * 14} width={80 + Math.random() * 40 | 0} height="7" fill="#e0f2fe" rx="3" />
        </g>
      ))}
      <rect x="104" y="158" width="112" height="24" fill="#0ea5e9" rx="10" />
      <text x="160" y="173" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">⬇ Download PDF</text>
    </svg>
  );
}

const MOCKUP_MAP = {
  practice: PracticeMockup,
  writing: WritingMockup,
  progress: ProgressMockup,
  exam: ExamMockup,
  custom: CustomMockup,
  pdf: PDFMockup,
};

function FeatureCard({ feature, index }) {
  const navigate = useNavigate();
  const MockupComp = MOCKUP_MAP[feature.mockup];
  const isEven = index % 2 === 0;

  return (
    <div style={{
      display: 'flex',
      flexDirection: isEven ? 'row' : 'row-reverse',
      gap: 32,
      alignItems: 'center',
      padding: '36px 0',
      borderBottom: '1px solid rgba(99,102,241,0.08)',
    }}>
      {/* Text side */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: feature.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0,
          }}>{feature.icon}</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1e1b4b', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {feature.title}
            </div>
            <div style={{ fontSize: 12, color: feature.color, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {feature.tagline}
            </div>
          </div>
        </div>
        <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.65, marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>
          {feature.description}
        </p>
        <div style={{ marginBottom: 20 }}>
          {feature.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 6 }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: feature.color, color: 'white',
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 1,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>{i + 1}</div>
              <span style={{ fontSize: 13, color: '#374151', fontFamily: "'Inter', sans-serif" }}>{step}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate(feature.route)}
          style={{
            background: feature.color, color: 'white',
            border: 'none', borderRadius: 10,
            padding: '10px 20px', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.target.style.opacity = '0.85'}
          onMouseLeave={e => e.target.style.opacity = '1'}
        >
          Go to {feature.title} →
        </button>
      </div>

      {/* Mockup side */}
      <div style={{
        flex: 1,
        background: feature.bg,
        borderRadius: 14,
        padding: 16,
        border: `1px solid ${feature.color}22`,
      }}>
        {MockupComp && <MockupComp />}
      </div>
    </div>
  );
}

export default function WelcomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [activeUpdate, setActiveUpdate] = useState(0);
  const [visible, setVisible] = useState(false);

  const firstName = user?.user_metadata?.name?.split(' ')[0] || 'there';

  useEffect(() => {
    // Fade-in on mount
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Auto-cycle updates banner
  useEffect(() => {
    const t = setInterval(() => setActiveUpdate(a => (a + 1) % LATEST_UPDATES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    navigate('/app');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f7ff 0%, #eef2ff 50%, #f0fdf4 100%)',
      fontFamily: "'Inter', sans-serif",
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.5s ease',
    }}>
      {/* Top bar removed — sidebar nav handles navigation */}

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* ─── Hero ─── */}
        <div style={{
          textAlign: 'center',
          padding: '60px 0 40px',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 100, padding: '6px 16px',
            marginBottom: 24,
          }}>
            <span style={{ fontSize: 14 }}>👋</span>
            <span style={{ fontSize: 13, color: '#6366f1', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Welcome back, {firstName}!
            </span>
          </div>
          <h1 style={{
            fontSize: 44, fontWeight: 800, color: '#1e1b4b',
            lineHeight: 1.15, margin: '0 0 16px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: '-0.02em',
          }}>
            Your exam prep,<br />
            <span style={{
              background: 'linear-gradient(135deg, #6366f1, #f97316)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>personalised & powerful</span>
          </h1>
          <p style={{
            fontSize: 17, color: '#4b5563', maxWidth: 560, margin: '0 auto 28px',
            lineHeight: 1.7, fontFamily: "'Inter', sans-serif",
          }}>
            ScholarPrep generates fresh practice questions every session, tracks your progress, and helps you focus on exactly what needs work — built for ACER, AAST, Edutest and NAPLAN.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              ['🎯', 'Practice Tests'],
              ['📊', 'Progress Tracking'],
              ['🏆', 'Simulated Exams'],
              ['✨', 'Custom Builder'],
            ].map(([icon, label]) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'white', borderRadius: 100,
                padding: '6px 14px',
                border: '1px solid rgba(99,102,241,0.15)',
                fontSize: 12, color: '#374151', fontWeight: 500,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                fontFamily: "'Inter', sans-serif",
              }}>
                <span>{icon}</span>{label}
              </div>
            ))}
          </div>
        </div>

        {/* ─── Latest Updates Banner ─── */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          border: '1px solid rgba(99,102,241,0.15)',
          overflow: 'hidden',
          marginBottom: 48,
          boxShadow: '0 4px 24px rgba(99,102,241,0.08)',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
            padding: '14px 24px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 16 }}>🚀</span>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              What's New
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              {LATEST_UPDATES.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setActiveUpdate(i)}
                  style={{
                    width: i === activeUpdate ? 20 : 6,
                    height: 6, borderRadius: 3,
                    background: i === activeUpdate ? '#f97316' : 'rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.35s ease',
                  }}
                />
              ))}
            </div>
          </div>
          <div style={{ padding: '20px 24px' }}>
            {LATEST_UPDATES.map((upd, i) => (
              <div
                key={i}
                style={{
                  display: i === activeUpdate ? 'block' : 'none',
                  animation: 'fadeIn 0.3s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    background: upd.badgeColor, color: 'white',
                    fontSize: 11, fontWeight: 700, borderRadius: 100,
                    padding: '3px 10px', fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>{upd.badge}</div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#1e1b4b', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {upd.title}
                  </span>
                  <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 'auto', fontFamily: "'Inter', sans-serif" }}>
                    {upd.version}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {upd.items.map((item, j) => (
                    <div key={j} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: '#f8f7ff', borderRadius: 8,
                      padding: '6px 12px', fontSize: 13, color: '#374151',
                      fontFamily: "'Inter', sans-serif",
                    }}>
                      <span style={{ color: upd.badgeColor, fontWeight: 700 }}>✓</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Quick Start ─── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{
            fontSize: 22, fontWeight: 800, color: '#1e1b4b',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            marginBottom: 6,
          }}>Quick Start</h2>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20, fontFamily: "'Inter', sans-serif" }}>
            Jump straight into a session
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 12,
          }}>
            {[
              { icon: '🎯', label: 'Maths', sub: 'Practice test', route: '/app/maths', color: '#6366f1' },
              { icon: '📖', label: 'Reading', sub: 'Practice test', route: '/app/reading', color: '#0ea5e9' },
              { icon: '🧠', label: 'General Ability', sub: 'Practice test', route: '/app/general', color: '#8b5cf6' },
              { icon: '✏️', label: 'English', sub: 'Practice test', route: '/app/english', color: '#10b981' },
              { icon: '✍️', label: 'Writing', sub: 'Get feedback', route: '/app/writing', color: '#f97316' },
              { icon: '🏆', label: 'Simulated Exam', sub: 'Full paper', route: '/app/simulated-exam', color: '#ec4899' },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => navigate(item.route)}
                style={{
                  background: 'white', border: `2px solid ${item.color}22`,
                  borderRadius: 12, padding: '16px 12px',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.18s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = item.color;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 6px 20px ${item.color}22`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = `${item.color}22`;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: "'Inter', sans-serif" }}>
                  {item.sub}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ─── Feature Guide ─── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{
            fontSize: 22, fontWeight: 800, color: '#1e1b4b',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            marginBottom: 6,
          }}>How to Guide</h2>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 0, fontFamily: "'Inter', sans-serif" }}>
            A guide to every feature and how to use it
          </p>
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>

        {/* ─── Tips Banner ─── */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 60%, #6366f1 100%)',
          borderRadius: 20,
          padding: '36px 40px',
          color: 'white',
          marginBottom: 48,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 200, height: 200,
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '50%',
          }} />
          <div style={{
            position: 'absolute', bottom: -60, left: '40%',
            width: 280, height: 280,
            background: 'rgba(249,115,22,0.08)',
            borderRadius: '50%',
          }} />
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, fontFamily: "'Plus Jakarta Sans', sans-serif", position: 'relative' }}>
            💡 Study Tips for Scholarship Success
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, position: 'relative' }}>
            {[
              ['🗓️ Consistency over cramming', 'Short daily sessions of 20–30 minutes beat long weekend study binges every time.'],
              ['📈 Track your weaknesses', 'Check the Progress Dashboard weekly — focus your next session on "Needs Work" topics.'],
              ['🏆 Simulate the real thing', 'Do at least 2 full simulated exams before your scholarship test date.'],
              ['✍️ Practice handwriting too', 'Use Photo Feedback to get scored on your actual handwritten work — exactly as examiners see it.'],
            ].map(([title, tip]) => (
              <div key={title} style={{
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 12, padding: '16px 18px',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</div>
                <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>{tip}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Bottom CTA ─── */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>
            Need help? Visit the full user guide any time via the <strong>?</strong> button in the bottom right corner.
          </p>
          <button
            onClick={handleDismiss}
            style={{
              background: 'linear-gradient(135deg, #4338CA, #6366f1)',
              color: 'white', border: 'none', borderRadius: 12,
              padding: '14px 36px', fontSize: 15, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.35)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.3)';
            }}
          >
            Let's go! → Open Dashboard
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}