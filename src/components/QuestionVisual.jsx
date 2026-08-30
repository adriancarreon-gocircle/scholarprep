import React from 'react';
import ReactDOMServer from 'react-dom/server';

// ── Bar Chart ─────────────────────────────────────────────────────────────────

function BarChart({ visual }) {
  const { data = [], title, yLabel, color = '#4338CA' } = visual;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const chartH = 160;
  const chartW = Math.max(data.length * 60, 240);
  const barW = 36;
  const gap = (chartW - data.length * barW) / (data.length + 1);

  return (
    <div style={{ background: '#F8FAFF', borderRadius: 14, padding: '16px 20px', marginBottom: 16, border: '1px solid rgba(67,56,202,0.1)' }}>
      {title && <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>{title}</div>}
      <svg width="100%" viewBox={`0 0 ${chartW + 40} ${chartH + 50}`} style={{ overflow: 'visible', maxWidth: 480, display: 'block', margin: '0 auto' }}>
        {/* Y axis gridlines and labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
          const y = chartH - frac * chartH;
          const val = Math.round(frac * maxVal);
          return (
            <g key={i}>
              <line x1={30} y1={y} x2={chartW + 30} y2={y} stroke="#E5E7EB" strokeWidth={1} strokeDasharray={i === 0 ? '0' : '3,3'} />
              <text x={24} y={y + 4} fontSize={10} fill="#94A3B8" textAnchor="end" fontFamily="Inter, sans-serif">{val}</text>
            </g>
          );
        })}
        {/* Y axis label */}
        {yLabel && <text x={8} y={chartH / 2} fontSize={10} fill="#94A3B8" textAnchor="middle" transform={`rotate(-90, 8, ${chartH / 2})`} fontFamily="Inter, sans-serif">{yLabel}</text>}
        {/* Bars */}
        {data.map((d, i) => {
          const barH = Math.max((d.value / maxVal) * chartH, 2);
          const x = 30 + gap + i * (barW + gap);
          const y = chartH - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} rx={4} fill={color} opacity={0.85} />
              {/* Value label on top */}
              <text x={x + barW / 2} y={y - 4} fontSize={11} fontWeight="700" fill={color} textAnchor="middle" fontFamily="Inter, sans-serif">{d.value}</text>
              {/* X axis label */}
              <text x={x + barW / 2} y={chartH + 16} fontSize={11} fill="#374151" textAnchor="middle" fontFamily="Inter, sans-serif">{d.label}</text>
            </g>
          );
        })}
        {/* X axis line */}
        <line x1={30} y1={chartH} x2={chartW + 30} y2={chartH} stroke="#94A3B8" strokeWidth={1.5} />
      </svg>
    </div>
  );
}

// ── Line Graph ────────────────────────────────────────────────────────────────

function LineGraph({ visual }) {
  const { data = [], title, yLabel, color = '#059669' } = visual;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const chartH = 150;
  const chartW = 320;
  const stepX = chartW / (data.length - 1 || 1);

  const points = data.map((d, i) => ({
    x: 30 + i * stepX,
    y: chartH - (d.value / maxVal) * chartH,
    label: d.label,
    value: d.value,
  }));

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div style={{ background: '#F0FDF4', borderRadius: 14, padding: '16px 20px', marginBottom: 16, border: '1px solid rgba(5,150,105,0.15)' }}>
      {title && <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>{title}</div>}
      <svg width="100%" viewBox={`0 0 ${chartW + 40} ${chartH + 50}`} style={{ overflow: 'visible', maxWidth: 440, display: 'block', margin: '0 auto' }}>
        {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
          const y = chartH - frac * chartH;
          const val = Math.round(frac * maxVal);
          return (
            <g key={i}>
              <line x1={30} y1={y} x2={chartW + 30} y2={y} stroke="#D1FAE5" strokeWidth={1} />
              <text x={24} y={y + 4} fontSize={10} fill="#94A3B8" textAnchor="end" fontFamily="Inter, sans-serif">{val}</text>
            </g>
          );
        })}
        {yLabel && <text x={8} y={chartH / 2} fontSize={10} fill="#94A3B8" textAnchor="middle" transform={`rotate(-90, 8, ${chartH / 2})`} fontFamily="Inter, sans-serif">{yLabel}</text>}
        <polyline points={polyline} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={5} fill="#fff" stroke={color} strokeWidth={2.5} />
            <text x={p.x} y={p.y - 10} fontSize={11} fontWeight="700" fill={color} textAnchor="middle" fontFamily="Inter, sans-serif">{p.value}</text>
            <text x={p.x} y={chartH + 16} fontSize={11} fill="#374151" textAnchor="middle" fontFamily="Inter, sans-serif">{p.label}</text>
          </g>
        ))}
        <line x1={30} y1={chartH} x2={chartW + 30} y2={chartH} stroke="#94A3B8" strokeWidth={1.5} />
      </svg>
    </div>
  );
}

// ── Pie Chart ─────────────────────────────────────────────────────────────────

function PieChart({ visual }) {
  const { data = [], title } = visual;
  const COLORS = ['#4338CA', '#059669', '#F97316', '#F43F5E', '#8B5CF6', '#0EA5E9'];
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const cx = 90, cy = 90, r = 75;

  let currentAngle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(currentAngle);
    const y1 = cy + r * Math.sin(currentAngle);
    currentAngle += angle;
    const x2 = cx + r * Math.cos(currentAngle);
    const y2 = cy + r * Math.sin(currentAngle);
    const midAngle = currentAngle - angle / 2;
    const labelR = r * 0.65;
    return {
      d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${angle > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`,
      color: COLORS[i % COLORS.length],
      label: d.label,
      labelX: cx + labelR * Math.cos(midAngle),
      labelY: cy + labelR * Math.sin(midAngle),
      pct: Math.round((d.value / total) * 100),
      value: d.value,
    };
  });

  return (
    <div style={{ background: '#F8FAFF', borderRadius: 14, padding: '16px 20px', marginBottom: 16, border: '1px solid rgba(67,56,202,0.1)' }}>
      {title && <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>{title}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        <svg width={180} height={180} viewBox="0 0 180 180">
          {slices.map((s, i) => (
            <g key={i}>
              <path d={s.d} fill={s.color} stroke="#fff" strokeWidth={2} />
              {s.pct >= 8 && (
                <text x={s.labelX} y={s.labelY} fontSize={11} fontWeight="700" fill="#fff" textAnchor="middle" dominantBaseline="middle" fontFamily="Inter, sans-serif">
                  {s.pct}%
                </text>
              )}
            </g>
          ))}
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {slices.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0 }} />
              <div style={{ fontSize: 13, color: '#374151', fontFamily: 'Inter, sans-serif' }}>{s.label}: <strong>{s.value}</strong> ({s.pct}%)</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Shape Diagram ─────────────────────────────────────────────────────────────

function ShapeDiagram({ visual }) {
  const { shape, dimensions = {}, color = '#4338CA', title } = visual;

  const renderShape = () => {
    if (shape === 'rectangle') {
      const { width = 12, height = 8 } = dimensions;
      return (
        <svg width="100%" viewBox="0 0 280 180" style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}>
          <rect x={40} y={40} width={200} height={100} rx={4} fill={`${color}15`} stroke={color} strokeWidth={2.5} />
          {/* Width label (bottom) */}
          <line x1={40} y1={160} x2={240} y2={160} stroke={color} strokeWidth={1.5} markerEnd="url(#arrow)" />
          <text x={140} y={175} fontSize={13} fontWeight="700" fill={color} textAnchor="middle" fontFamily="Inter, sans-serif">{width} cm</text>
          {/* Height label (right) */}
          <text x={258} y={95} fontSize={13} fontWeight="700" fill={color} textAnchor="middle" fontFamily="Inter, sans-serif" transform="rotate(90, 258, 95)">{height} cm</text>
          <line x1={252} y1={40} x2={252} y2={140} stroke={color} strokeWidth={1.5} />
          {/* Right angle marks */}
          <polyline points="52,40 52,52 40,52" fill="none" stroke={color} strokeWidth={1.5} />
        </svg>
      );
    }
    if (shape === 'triangle') {
      const { base = 10, height = 8, sideA, sideB } = dimensions;
      return (
        <svg width="100%" viewBox="0 0 280 180" style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}>
          <polygon points="140,30 40,150 240,150" fill={`${color}15`} stroke={color} strokeWidth={2.5} />
          {/* Base label */}
          <text x={140} y={170} fontSize={13} fontWeight="700" fill={color} textAnchor="middle" fontFamily="Inter, sans-serif">{base} cm</text>
          {/* Height label */}
          <line x1={140} y1={30} x2={140} y2={150} stroke={color} strokeWidth={1.5} strokeDasharray="4,4" />
          <text x={148} y={95} fontSize={13} fontWeight="700" fill={color} textAnchor="start" fontFamily="Inter, sans-serif">{height} cm</text>
          {/* Right angle at height foot */}
          <polyline points="140,138 128,138 128,150" fill="none" stroke={color} strokeWidth={1.5} />
          {sideA && <text x={78} y={96} fontSize={12} fill={color} textAnchor="middle" fontFamily="Inter, sans-serif" transform="rotate(-52, 78, 96)">{sideA} cm</text>}
          {sideB && <text x={200} y={96} fontSize={12} fill={color} textAnchor="middle" fontFamily="Inter, sans-serif" transform="rotate(52, 200, 96)">{sideB} cm</text>}
        </svg>
      );
    }
    if (shape === 'circle') {
      const { radius, diameter } = dimensions;
      const d = diameter || radius * 2;
      return (
        <svg width="100%" viewBox="0 0 220 180" style={{ maxWidth: 260, display: 'block', margin: '0 auto' }}>
          <circle cx={110} cy={90} r={70} fill={`${color}15`} stroke={color} strokeWidth={2.5} />
          <line x1={40} y1={90} x2={180} y2={90} stroke={color} strokeWidth={1.5} strokeDasharray="4,4" />
          <circle cx={110} cy={90} r={4} fill={color} />
          <text x={110} y={80} fontSize={13} fontWeight="700" fill={color} textAnchor="middle" fontFamily="Inter, sans-serif">d = {d} cm</text>
          {radius && <text x={110} y={105} fontSize={12} fill={color} textAnchor="middle" fontFamily="Inter, sans-serif">r = {radius} cm</text>}
        </svg>
      );
    }
    if (shape === 'quadrilateral' || shape === 'irregular') {
      const { sides = [10, 7, 8, 5] } = dimensions;
      // Draw an irregular quadrilateral with 4 different-length sides
      // Points roughly positioned to look irregular
      const pts = [[60, 30], [230, 50], [200, 150], [40, 140]];
      const polyPts = pts.map(p => p.join(',')).join(' ');
      // Midpoints for side labels
      const midpoints = [
        [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2 - 14],
        [(pts[1][0] + pts[2][0]) / 2 + 18, (pts[1][1] + pts[2][1]) / 2],
        [(pts[2][0] + pts[3][0]) / 2, (pts[2][1] + pts[3][1]) / 2 + 14],
        [(pts[3][0] + pts[0][0]) / 2 - 18, (pts[3][1] + pts[0][1]) / 2],
      ];
      return (
        <svg width="100%" viewBox="0 0 280 180" style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}>
          <polygon points={polyPts} fill={`${color}15`} stroke={color} strokeWidth={2.5} />
          {sides.map((s, i) => (
            <text key={i} x={midpoints[i][0]} y={midpoints[i][1]} fontSize={12} fontWeight="700" fill={color} textAnchor="middle" fontFamily="Inter, sans-serif">{s} cm</text>
          ))}
        </svg>
      );
    }
    if (shape === 'compound') {
      const { parts = [] } = dimensions;
      return (
        <svg width="100%" viewBox="0 0 280 180" style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}>
          {/* L-shape compound */}
          <polygon points="40,40 200,40 200,100 130,100 130,150 40,150" fill={`${color}15`} stroke={color} strokeWidth={2.5} />
          {parts.map((p, i) => (
            <text key={i} x={p.x} y={p.y} fontSize={12} fontWeight="700" fill={color} textAnchor="middle" fontFamily="Inter, sans-serif">{p.label}</text>
          ))}
        </svg>
      );
    }
    return null;
  };

  return (
    <div style={{ background: '#F8FAFF', borderRadius: 14, padding: '16px 20px', marginBottom: 16, border: '1px solid rgba(67,56,202,0.1)' }}>
      {title && <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8, fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>{title}</div>}
      {renderShape()}
    </div>
  );
}

// ── Money Counter ─────────────────────────────────────────────────────────────

function MoneyVisual({ visual }) {
  const { coins = [], notes = [], title } = visual;

  const COIN_STYLES = {
    '5c': { r: 18, fill: '#C0C0C0', stroke: '#999', label: '5c' },
    '10c': { r: 18, fill: '#C0C0C0', stroke: '#999', label: '10c' },
    '20c': { r: 21, fill: '#C0C0C0', stroke: '#999', label: '20c' },
    '50c': { r: 24, fill: '#C0C0C0', stroke: '#999', label: '50c' },
    '$1': { r: 22, fill: '#DAA520', stroke: '#B8860B', label: '$1' },
    '$2': { r: 20, fill: '#DAA520', stroke: '#B8860B', label: '$2' },
  };

  const NOTE_STYLES = {
    '$5': { fill: '#C8E6C9', stroke: '#66BB6A', label: '$5' },
    '$10': { fill: '#B3E5FC', stroke: '#29B6F6', label: '$10' },
    '$20': { fill: '#FFF9C4', stroke: '#FDD835', label: '$20' },
    '$50': { fill: '#FFCCBC', stroke: '#FF7043', label: '$50' },
    '$100': { fill: '#E1BEE7', stroke: '#AB47BC', label: '$100' },
  };

  // Layout coins in rows of 5
  const coinList = coins.flatMap(c => Array(c.count).fill(c.denom));
  const noteList = notes.flatMap(n => Array(n.count).fill(n.denom));

  return (
    <div style={{ background: '#FFFBEB', borderRadius: 14, padding: '16px 20px', marginBottom: 16, border: '1px solid rgba(218,165,32,0.25)' }}>
      {title && <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>{title}</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
        {/* Notes */}
        {noteList.map((denom, i) => {
          const s = NOTE_STYLES[denom] || { fill: '#eee', stroke: '#ccc', label: denom };
          return (
            <div key={`n${i}`} style={{ width: 72, height: 36, background: s.fill, border: `2px solid ${s.stroke}`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#374151', fontFamily: 'Inter, sans-serif', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              {s.label}
            </div>
          );
        })}
        {/* Coins */}
        {coinList.map((denom, i) => {
          const s = COIN_STYLES[denom] || { r: 20, fill: '#ccc', stroke: '#aaa', label: denom };
          return (
            <div key={`c${i}`} style={{ width: s.r * 2, height: s.r * 2, borderRadius: '50%', background: s.fill, border: `3px solid ${s.stroke}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 10, color: '#374151', fontFamily: 'Inter, sans-serif', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
              {s.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Counting Objects ──────────────────────────────────────────────────────────

const OBJECT_EMOJIS = {
  apple: '🍎', orange: '🍊', banana: '🍌', star: '⭐', heart: '❤️',
  ball: '⚽', flower: '🌸', fish: '🐟', bird: '🐦', car: '🚗',
  book: '📚', pencil: '✏️', cookie: '🍪', egg: '🥚', leaf: '🍃',
  circle: '🔵', square: '🟦', triangle: '🔺', diamond: '💎', dot: '⚫',
};

function CountingObjects({ visual }) {
  const { groups = [], title, object = 'apple' } = visual;
  const emoji = OBJECT_EMOJIS[object] || '⭐';

  return (
    <div style={{ background: '#FFF7ED', borderRadius: 14, padding: '16px 20px', marginBottom: 16, border: '1px solid rgba(249,115,22,0.15)' }}>
      {title && <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>{title}</div>}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        {groups.map((g, gi) => (
          <div key={gi} style={{ textAlign: 'center' }}>
            {g.label && <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>{g.label}</div>}
            <div style={{ background: '#fff', borderRadius: 10, padding: '10px 12px', border: '1.5px solid rgba(249,115,22,0.2)', display: 'grid', gridTemplateColumns: `repeat(${Math.min(g.count, 5)}, 1fr)`, gap: 4, minWidth: 60 }}>
              {Array(g.count).fill(0).map((_, i) => (
                <span key={i} style={{ fontSize: 20, lineHeight: 1 }}>{g.emoji || emoji}</span>
              ))}
            </div>
            {g.showCount === false ? null : (
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>
                {g.count} {g.label || object}{g.count !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Number Line ───────────────────────────────────────────────────────────────

function NumberLine({ visual }) {
  const { min = 0, max = 10, marked = [], highlighted, title, fractions } = visual;
  const w = 320;
  const scale = w / (max - min);

  return (
    <div style={{ background: '#F8FAFF', borderRadius: 14, padding: '20px 24px', marginBottom: 16, border: '1px solid rgba(67,56,202,0.1)' }}>
      {title && <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 16, fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>{title}</div>}
      <svg width="100%" viewBox="0 0 380 70" style={{ maxWidth: 440, display: 'block', margin: '0 auto' }}>
        {/* Main line */}
        <line x1={30} y1={35} x2={350} y2={35} stroke="#374151" strokeWidth={2} />
        {/* Arrow ends */}
        <polygon points="350,35 342,30 342,40" fill="#374151" />
        <polygon points="30,35 38,30 38,40" fill="#374151" />
        {/* Tick marks and labels */}
        {Array.from({ length: max - min + 1 }, (_, i) => {
          const val = min + i;
          const x = 30 + i * scale;
          const isHighlighted = highlighted === val;
          return (
            <g key={i}>
              <line x1={x} y1={28} x2={x} y2={42} stroke={isHighlighted ? '#4338CA' : '#374151'} strokeWidth={isHighlighted ? 2.5 : 1.5} />
              <text x={x} y={58} fontSize={12} fontWeight={isHighlighted ? '700' : '400'} fill={isHighlighted ? '#4338CA' : '#374151'} textAnchor="middle" fontFamily="Inter, sans-serif">
                {fractions ? fractions[i] || val : val}
              </text>
              {isHighlighted && <circle cx={x} cy={35} r={7} fill="#4338CA" />}
            </g>
          );
        })}
        {/* Marked positions */}
        {marked.map((m, i) => {
          const x = 30 + (m.value - min) * scale;
          return (
            <g key={i}>
              <circle cx={x} cy={35} r={6} fill={m.color || '#F97316'} />
              {m.label && <text x={x} y={18} fontSize={11} fontWeight="700" fill={m.color || '#F97316'} textAnchor="middle" fontFamily="Inter, sans-serif">{m.label}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Thermometer ───────────────────────────────────────────────────────────────

function Thermometer({ visual }) {
  const { value, unit = 'C', min = 0, max = 50, title, color = '#EF4444', dual = false } = visual;
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const bulbY = 160;
  const tubeTop = 20;
  const tubeH = bulbY - tubeTop - 10;
  const fillH = pct * tubeH;
  const fillY = bulbY - 10 - fillH;
  const cToF = (c) => c * 9 / 5 + 32;

  // Generate tick marks (left column — always in `unit`, i.e. °C for a dual thermometer)
  const ticks = [];
  const tickCount = 10;
  for (let i = 0; i <= tickCount; i++) {
    const tickVal = min + (i / tickCount) * (max - min);
    const tickY = bulbY - 10 - (i / tickCount) * tubeH;
    const isMajor = i % 2 === 0;
    ticks.push({ val: Math.round(tickVal), y: tickY, major: isMajor });
  }

  // Right-hand Fahrenheit column, only rendered when `dual` is set — same
  // tube positions as the left column, just relabelled in °F.
  const tubeCx = dual ? 80 : 60;
  const svgW = dual ? 160 : 120;

  return (
    <div style={{ background: '#FFF5F5', borderRadius: 14, padding: '16px 20px', marginBottom: 16, border: '1px solid rgba(239,68,68,0.15)', textAlign: 'center' }}>
      {title && <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, fontFamily: 'Inter, sans-serif' }}>{title}</div>}
      <svg width={svgW} height={190} viewBox={`0 0 ${svgW} 190`} style={{ display: 'block', margin: '0 auto' }}>
        {/* Tube outline */}
        <rect x={tubeCx - 8} y={tubeTop} width={16} height={tubeH + 10} rx={8} fill="#fff" stroke="#CBD5E1" strokeWidth={2} />
        {/* Mercury fill */}
        <rect x={tubeCx - 4} y={fillY} width={8} height={fillH} rx={2} fill={color} />
        {/* Bulb */}
        <circle cx={tubeCx} cy={bulbY + 10} r={14} fill={color} stroke={color} strokeWidth={2} />
        {/* Left tick marks (Celsius, or the single unit when not dual) */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={t.major ? tubeCx - 20 : tubeCx - 16} y1={t.y} x2={tubeCx - 8} y2={t.y} stroke="#94A3B8" strokeWidth={t.major ? 1.5 : 1} />
            {t.major && <text x={tubeCx - 24} y={t.y + 4} fontSize={10} fill="#374151" textAnchor="end" fontFamily="Inter, sans-serif">{t.val}°</text>}
          </g>
        ))}
        {/* Right-hand Fahrenheit ticks — dual mode only */}
        {dual && ticks.map((t, i) => (
          <g key={`f${i}`}>
            <line x1={tubeCx + 8} y1={t.y} x2={t.major ? tubeCx + 20 : tubeCx + 16} y2={t.y} stroke="#94A3B8" strokeWidth={t.major ? 1.5 : 1} />
            {t.major && <text x={tubeCx + 24} y={t.y + 4} fontSize={10} fill="#374151" textAnchor="start" fontFamily="Inter, sans-serif">{Math.round(cToF(t.val))}°</text>}
          </g>
        ))}
        {/* Unit label(s) */}
        {dual ? (
          <>
            <text x={tubeCx - 28} y={30} fontSize={12} fontWeight="700" fill={color} textAnchor="end" fontFamily="Inter, sans-serif">°C</text>
            <text x={tubeCx + 28} y={30} fontSize={12} fontWeight="700" fill={color} textAnchor="start" fontFamily="Inter, sans-serif">°F</text>
          </>
        ) : (
          <text x={tubeCx + 20} y={30} fontSize={13} fontWeight="700" fill={color} fontFamily="Inter, sans-serif">{unit === 'C' ? '°C' : '°F'}</text>
        )}
      </svg>
    </div>
  );
}

// ── Analog Clock ──────────────────────────────────────────────────────────────

function ClockFace({ visual }) {
  const { hour = 3, minute = 0, title, color = '#4338CA' } = visual;
  const h12 = ((Math.floor(hour) % 12) + 12) % 12;
  const cx = 90, cy = 90, r = 76;
  const minuteAngle = (minute / 60) * 360;
  const hourAngle = (h12 / 12) * 360 + (minute / 60) * 30;

  const toXY = (angleDeg, len) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return [cx + len * Math.cos(rad), cy + len * Math.sin(rad)];
  };
  const [mx, my] = toXY(minuteAngle, 58);
  const [hx, hy] = toXY(hourAngle, 40);

  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = i * 30;
    const isMajor = true; // every hour mark is major on a 12-hour face
    const [x1, y1] = toXY(angle, r - 4);
    const [x2, y2] = toXY(angle, r - 13);
    const [nx, ny] = toXY(angle, r - 24);
    return { x1, y1, x2, y2, nx, ny, num: i === 0 ? 12 : i, isMajor };
  });

  return (
    <div style={{ background: '#F8FAFF', borderRadius: 14, padding: '16px 20px', marginBottom: 16, border: '1px solid rgba(67,56,202,0.1)', textAlign: 'center' }}>
      {title && <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, fontFamily: 'Inter, sans-serif' }}>{title}</div>}
      <svg width={180} height={180} viewBox="0 0 180 180" style={{ display: 'block', margin: '0 auto' }}>
        <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={color} strokeWidth={3} />
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={color} strokeWidth={2} strokeLinecap="round" />
            <text x={t.nx} y={t.ny} fontSize={13} fontWeight="700" fill="#374151" textAnchor="middle" dominantBaseline="middle" fontFamily="Inter, sans-serif">{t.num}</text>
          </g>
        ))}
        {/* Hour hand */}
        <line x1={cx} y1={cy} x2={hx} y2={hy} stroke={color} strokeWidth={4.5} strokeLinecap="round" />
        {/* Minute hand */}
        <line x1={cx} y1={cy} x2={mx} y2={my} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={4.5} fill={color} />
      </svg>
    </div>
  );
}

// ── 3D Cubes ──────────────────────────────────────────────────────────────────

function CubesVisual({ visual }) {
  const { dimensions = {}, title, color = '#4338CA' } = visual;
  const { length = 3, width = 2, height = 2 } = dimensions;

  // Isometric cube drawing
  const cubeW = 28;
  const cubeH = 16;
  const isoX = cubeW;
  const isoY = cubeH;

  const darkColor = color;
  const midColor = color + 'CC';
  const lightColor = color + '66';

  // Calculate total grid size
  const totalW = (length + width) * (cubeW / 2) + 40;
  const totalH = (length + width) * (cubeH / 2) + height * cubeH + 40;

  // Draw a single isometric cube at grid position
  const drawCube = (gx, gy, gz) => {
    const ox = 20 + (gx - gy) * (cubeW / 2) + width * (cubeW / 2);
    const oy = totalH - 20 - gz * cubeH - (gx + gy) * (cubeH / 2);

    const topPoints = [
      [ox, oy - cubeH / 2],
      [ox + cubeW / 2, oy],
      [ox, oy + cubeH / 2],
      [ox - cubeW / 2, oy],
    ].map(p => p.join(',')).join(' ');

    const rightPoints = [
      [ox, oy + cubeH / 2],
      [ox + cubeW / 2, oy],
      [ox + cubeW / 2, oy + cubeH],
      [ox, oy + cubeH * 1.5],
    ].map(p => p.join(',')).join(' ');

    const leftPoints = [
      [ox, oy + cubeH / 2],
      [ox - cubeW / 2, oy],
      [ox - cubeW / 2, oy + cubeH],
      [ox, oy + cubeH * 1.5],
    ].map(p => p.join(',')).join(' ');

    return (
      <g key={`${gx}-${gy}-${gz}`}>
        <polygon points={leftPoints} fill={lightColor} stroke="#fff" strokeWidth={1} />
        <polygon points={rightPoints} fill={midColor} stroke="#fff" strokeWidth={1} />
        <polygon points={topPoints} fill={darkColor} stroke="#fff" strokeWidth={1} />
      </g>
    );
  };

  const cubes = [];
  for (let z = 0; z < height; z++) {
    for (let x = 0; x < length; x++) {
      for (let y = 0; y < width; y++) {
        cubes.push(drawCube(x, y, z));
      }
    }
  }

  return (
    <div style={{ background: '#F8FAFF', borderRadius: 14, padding: '16px 20px', marginBottom: 16, border: '1px solid rgba(67,56,202,0.1)', textAlign: 'center' }}>
      {title && <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>{title}</div>}
      <svg width="100%" viewBox={`0 0 ${totalW} ${totalH}`} style={{ maxWidth: 320, display: 'block', margin: '0 auto', overflow: 'visible' }}>
        {cubes}
      </svg>
      <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'Inter, sans-serif', marginTop: 4 }}>
        Length: {length} · Width: {width} · Height: {height}
      </div>
    </div>
  );
}

// ── Compound Shapes (L, T, U, Staircase, Reverse-L) ──────────────────────────
// Each shape template uses fixed geometry; AI provides the side measurements.
// Label positions are carefully placed to avoid overlapping lines.

const COMPOUND_TEMPLATES = {
  // L-shape (top-right notch removed — like screenshot 5)
  lshape: {
    points: '50,20 220,20 220,90 140,90 140,170 50,170',
    rightAngles: [
      [50, 32, 62, 32, 62, 20], [208, 20, 208, 32, 220, 32],
      [220, 78, 208, 78, 208, 90], [140, 102, 128, 102, 128, 90],
      [128, 170, 128, 158, 140, 158], [50, 158, 62, 158, 62, 170],
    ],
    labels: [
      { x: 135, y: 10, anchor: 'middle', side: 0 },  // top — above shape
      { x: 228, y: 55, anchor: 'start', side: 1 },  // right-top — outside right
      { x: 183, y: 83, anchor: 'middle', side: 2 },  // step horizontal — just above step
      { x: 148, y: 130, anchor: 'start', side: 3 },  // right-bottom — just right of inner edge
      { x: 95, y: 178, anchor: 'middle', side: 4 },  // bottom — below shape
      { x: 40, y: 95, anchor: 'end', side: 5 },  // left — outside left
    ],
    defaultSides: ['7cm', '4cm', '3cm', '2.5cm', '3cm', '9cm'],
  },
  // Reverse-L (notch bottom-left — like screenshot 4)
  rlshape: {
    points: '50,20 220,20 220,170 120,170 120,90 50,90',
    rightAngles: [
      [50, 32, 62, 32, 62, 20], [208, 20, 208, 32, 220, 32],
      [220, 158, 208, 158, 208, 170], [120, 158, 132, 158, 132, 170],
      [120, 78, 132, 78, 132, 90], [50, 78, 62, 78, 62, 90],
    ],
    labels: [
      { x: 135, y: 10, anchor: 'middle', side: 0 },  // top — above shape
      { x: 228, y: 95, anchor: 'start', side: 1 },  // right — outside right edge
      { x: 170, y: 178, anchor: 'middle', side: 2 },  // bottom-right — below shape
      { x: 128, y: 130, anchor: 'start', side: 3 },  // inner-right vertical — right of inner step
      { x: 172, y: 83, anchor: 'middle', side: 4 },  // inner-top horizontal — above inner step
      { x: 40, y: 55, anchor: 'end', side: 5 },  // left — outside left
    ],
    defaultSides: ['9cm', '6cm', '4cm', '4cm', '3cm', '4cm'],
  },
  // U-shape (notch at top-centre — like screenshot 1)
  ushape: {
    points: '30,170 30,20 90,20 90,100 160,100 160,20 220,20 220,170',
    rightAngles: [
      [30, 32, 42, 32, 42, 20], [90, 32, 78, 32, 78, 20],
      [90, 88, 78, 88, 78, 100], [160, 88, 172, 88, 172, 100],
      [160, 32, 172, 32, 172, 20], [220, 32, 208, 32, 208, 20],
    ],
    labels: [
      { x: 60, y: 11, anchor: 'middle', side: 0 },  // top-left
      { x: 125, y: 108, anchor: 'middle', side: 1 },  // inner-bottom
      { x: 190, y: 11, anchor: 'middle', side: 2 },  // top-right
      { x: 228, y: 95, anchor: 'start', side: 3 },  // right
      { x: 125, y: 178, anchor: 'middle', side: 4 },  // bottom
      { x: 22, y: 95, anchor: 'end', side: 5 },  // left
    ],
    defaultSides: ['4cm', '6cm', '4cm', '8cm', '12cm', '8cm'],
  },
  // T-shape / plus (like screenshot 5: bump on top)
  tshape: {
    points: '30,170 30,90 80,90 80,20 160,20 160,90 220,90 220,170',
    rightAngles: [
      [30, 102, 42, 102, 42, 90], [80, 102, 68, 102, 68, 90],
      [80, 32, 68, 32, 68, 20], [160, 32, 172, 32, 172, 20],
      [160, 102, 172, 102, 172, 90], [220, 102, 208, 102, 208, 90],
      [30, 158, 42, 158, 42, 170], [220, 158, 208, 158, 208, 170],
    ],
    labels: [
      { x: 120, y: 11, anchor: 'middle', side: 0 },  // top (bump top)
      { x: 168, y: 55, anchor: 'start', side: 1 },  // bump-right
      { x: 192, y: 82, anchor: 'middle', side: 2 },  // right-inner-top
      { x: 228, y: 130, anchor: 'start', side: 3 },  // right
      { x: 125, y: 178, anchor: 'middle', side: 4 },  // bottom
      { x: 22, y: 130, anchor: 'end', side: 5 },  // left
      { x: 52, y: 82, anchor: 'end', side: 6 },  // left-inner-top
      { x: 72, y: 55, anchor: 'end', side: 7 },  // bump-left
    ],
    defaultSides: ['4cm', '4cm', '2cm', '3m', '6cm', '3m', '2cm', '4cm'],
  },
  // Staircase (like screenshot 2: ascending steps right to left)
  staircase: {
    points: '30,190 30,150 70,150 70,110 110,110 110,70 150,70 150,30 220,30 220,190',
    rightAngles: [
      [30, 178, 42, 178, 42, 190],
      [70, 138, 58, 138, 58, 150], [70, 110, 82, 110, 82, 122],
      [110, 98, 98, 98, 98, 110], [110, 70, 122, 70, 122, 82],
      [150, 58, 138, 58, 138, 70], [150, 30, 162, 30, 162, 42],
      [220, 42, 208, 42, 208, 30], [220, 178, 208, 178, 208, 190],
    ],
    labels: [
      { x: 185, y: 21, anchor: 'middle', side: 0 },  // top
      { x: 228, y: 110, anchor: 'start', side: 1 },  // right
      { x: 125, y: 198, anchor: 'middle', side: 2 },  // bottom
      { x: 22, y: 170, anchor: 'end', side: 3 },  // left-bottom
      { x: 48, y: 155, anchor: 'middle', side: 4 },  // step1-h
      { x: 62, y: 132, anchor: 'end', side: 5 },  // step1-v
      { x: 88, y: 115, anchor: 'middle', side: 6 },  // step2-h
      { x: 102, y: 92, anchor: 'end', side: 7 },  // step2-v
    ],
    defaultSides: ['6cm', '10cm', '10cm', '4cm', '2cm', '2cm', '2cm', '2cm'],
  },
};

function LShape({ visual }) {
  const { dimensions = {}, title, color = '#4338CA' } = visual;
  const { template = 'lshape', sides } = dimensions;
  const tmpl = COMPOUND_TEMPLATES[template] || COMPOUND_TEMPLATES.lshape;
  const sideLabels = sides && sides.length > 0 ? sides : tmpl.defaultSides;
  // Determine which sides to hide (show as unknown)
  const hiddenSides = dimensions.hiddenSides || [];

  const viewH = template === 'staircase' ? 210 : template === 'tshape' ? 210 : 200;

  return (
    <div style={{ background: '#F8FAFF', borderRadius: 14, padding: '16px 20px', marginBottom: 16, border: '1px solid rgba(67,56,202,0.1)' }}>
      {title && <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8, fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>{title}</div>}
      <svg width="100%" viewBox={`-10 -10 270 ${viewH}`} style={{ maxWidth: 360, display: 'block', margin: '0 auto', overflow: 'visible' }}>
        {/* Shape fill and outline */}
        <polygon points={tmpl.points} fill={`${color}15`} stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
        {/* Right-angle markers */}
        {(tmpl.rightAngles || []).map((ra, i) => (
          <polyline key={i} points={`${ra[0]},${ra[1]} ${ra[2]},${ra[3]} ${ra[4]},${ra[5]}`} fill="none" stroke={color} strokeWidth={1.2} />
        ))}
        {/* Side length labels */}
        {tmpl.labels.map((lbl, i) => {
          const sideIdx = lbl.side ?? i;
          const isHidden = hiddenSides.includes(sideIdx);
          const text = isHidden ? '?' : (sideLabels[sideIdx] ?? sideLabels[i] ?? '');
          return (
            <text key={i} x={lbl.x} y={lbl.y} fontSize={11} fontWeight="700"
              fill={isHidden ? '#F97316' : color}
              textAnchor={lbl.anchor} fontFamily="Inter, sans-serif" dominantBaseline="middle">
              {text}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ── Irregular Polygon (free-form, non-rectilinear perimeter shapes) ─────────
// Unlike LShape's fixed rectilinear templates (right angles only), this takes
// an arbitrary simple polygon as a list of normalised (0-1) points, so the AI
// can describe any irregular shape — angled sides included — with its own
// per-side length labels, matching reference shapes that aren't pure L/U/T/
// staircase outlines.

function PolygonShape({ visual }) {
  const { points = [], sides = [], title, color = '#4338CA' } = visual;
  const W = 280, H = 190, pad = 34;
  if (!points.length) return null;
  const px = points.map(([x, y]) => [pad + x * (W - 2 * pad), pad + y * (H - 2 * pad)]);
  const n = px.length;
  const polyPts = px.map(p => p.join(',')).join(' ');
  const centroid = [px.reduce((s, p) => s + p[0], 0) / n, px.reduce((s, p) => s + p[1], 0) / n];

  const labels = px.map((p, i) => {
    const q = px[(i + 1) % n];
    const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
    const dx = mx - centroid[0], dy = my - centroid[1];
    const len = Math.hypot(dx, dy) || 1;
    return { x: mx + (dx / len) * 15, y: my + (dy / len) * 15, text: sides[i] ?? '' };
  });

  return (
    <div style={{ background: '#F8FAFF', borderRadius: 14, padding: '16px 20px', marginBottom: 16, border: '1px solid rgba(67,56,202,0.1)' }}>
      {title && <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8, fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>{title}</div>}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: 340, display: 'block', margin: '0 auto', overflow: 'visible' }}>
        <polygon points={polyPts} fill={`${color}15`} stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
        {labels.map((lbl, i) => (
          <text key={i} x={lbl.x} y={lbl.y} fontSize={12} fontWeight="700" fill={color} textAnchor="middle" dominantBaseline="middle" fontFamily="Inter, sans-serif">
            {lbl.text}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ── Picture Pattern Sequence ──────────────────────────────────────────────────

export const SHAPE_RENDERERS = {
  triangle: (cx, cy, sz, f, s) => `<polygon points="${cx},${cy - sz} ${cx - sz},${cy + sz} ${cx + sz},${cy + sz}" fill="${f}" stroke="${s}" stroke-width="1.5"/>`,
  triangle_down: (cx, cy, sz, f, s) => `<polygon points="${cx},${cy + sz} ${cx - sz},${cy - sz} ${cx + sz},${cy - sz}" fill="${f}" stroke="${s}" stroke-width="1.5"/>`,
  square: (cx, cy, sz, f, s) => `<rect x="${cx - sz}" y="${cy - sz}" width="${sz * 2}" height="${sz * 2}" fill="${f}" stroke="${s}" stroke-width="1.5"/>`,
  square_small: (cx, cy, sz, f, s) => `<rect x="${cx - sz * 0.5}" y="${cy - sz * 0.5}" width="${sz}" height="${sz}" fill="${f}" stroke="${s}" stroke-width="1.5"/>`,
  circle: (cx, cy, sz, f, s) => `<circle cx="${cx}" cy="${cy}" r="${sz}" fill="${f}" stroke="${s}" stroke-width="1.5"/>`,
  circle_thick: (cx, cy, sz, f, s) => `<circle cx="${cx}" cy="${cy}" r="${sz}" fill="${f}" stroke="${s}" stroke-width="4"/>`,
  diamond: (cx, cy, sz, f, s) => `<polygon points="${cx},${cy - sz} ${cx + sz},${cy} ${cx},${cy + sz} ${cx - sz},${cy}" fill="${f}" stroke="${s}" stroke-width="1.5"/>`,
  star: (cx, cy, sz, f, s) => {
    const pts = Array.from({ length: 10 }, (_, i) => { const a = (i * Math.PI / 5) - Math.PI / 2, r = i % 2 === 0 ? sz : sz * 0.4; return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`; }).join(' ');
    return `<polygon points="${pts}" fill="${f}" stroke="${s}" stroke-width="1.5"/>`;
  },
  arrow_right: (cx, cy, sz, f, s) => `<polygon points="${cx + sz},${cy} ${cx},${cy - sz * 0.6} ${cx},${cy - sz * 0.25} ${cx - sz},${cy - sz * 0.25} ${cx - sz},${cy + sz * 0.25} ${cx},${cy + sz * 0.25} ${cx},${cy + sz * 0.6}" fill="${f}" stroke="${s}" stroke-width="1.5"/>`,
  arrow_down: (cx, cy, sz, f, s) => `<polygon points="${cx},${cy + sz} ${cx - sz * 0.6},${cy} ${cx - sz * 0.25},${cy} ${cx - sz * 0.25},${cy - sz} ${cx + sz * 0.25},${cy - sz} ${cx + sz * 0.25},${cy} ${cx + sz * 0.6},${cy}" fill="${f}" stroke="${s}" stroke-width="1.5"/>`,
  arrow_up: (cx, cy, sz, f, s) => `<polygon points="${cx},${cy - sz} ${cx - sz * 0.6},${cy} ${cx - sz * 0.25},${cy} ${cx - sz * 0.25},${cy + sz} ${cx + sz * 0.25},${cy + sz} ${cx + sz * 0.25},${cy} ${cx + sz * 0.6},${cy}" fill="${f}" stroke="${s}" stroke-width="1.5"/>`,
  arrow_left: (cx, cy, sz, f, s) => `<polygon points="${cx - sz},${cy} ${cx},${cy - sz * 0.6} ${cx},${cy - sz * 0.25} ${cx + sz},${cy - sz * 0.25} ${cx + sz},${cy + sz * 0.25} ${cx},${cy + sz * 0.25} ${cx},${cy + sz * 0.6}" fill="${f}" stroke="${s}" stroke-width="1.5"/>`,
  cross_x: (cx, cy, sz, f, s) => {
    const t = sz * 0.25;
    return `<path d="M${cx - t},${cy - sz} h${t * 2} v${sz - t} h${sz - t} v${t * 2} h${-(sz - t)} v${sz - t} h${-t * 2} v${-(sz - t)} h${-(sz - t)} v${-t * 2} h${sz - t} z" fill="${f}" stroke="${s}" stroke-width="1"/>`;
  },
  smiley: (cx, cy, sz, f, s) => `<circle cx="${cx}" cy="${cy}" r="${sz}" fill="${f}" stroke="${s}" stroke-width="1.5"/><circle cx="${cx - sz * 0.3}" cy="${cy - sz * 0.2}" r="${sz * 0.12}" fill="${s}" stroke="none"/><circle cx="${cx + sz * 0.3}" cy="${cy - sz * 0.2}" r="${sz * 0.12}" fill="${s}" stroke="none"/><path d="M${cx - sz * 0.3},${cy + sz * 0.1} Q${cx},${cy + sz * 0.45} ${cx + sz * 0.3},${cy + sz * 0.1}" fill="none" stroke="${s}" stroke-width="1.5"/>`,
  sad: (cx, cy, sz, f, s) => `<circle cx="${cx}" cy="${cy}" r="${sz}" fill="${f}" stroke="${s}" stroke-width="1.5"/><circle cx="${cx - sz * 0.3}" cy="${cy - sz * 0.2}" r="${sz * 0.12}" fill="${s}" stroke="none"/><circle cx="${cx + sz * 0.3}" cy="${cy - sz * 0.2}" r="${sz * 0.12}" fill="${s}" stroke="none"/><path d="M${cx - sz * 0.3},${cy + sz * 0.35} Q${cx},${cy + sz * 0.05} ${cx + sz * 0.3},${cy + sz * 0.35}" fill="none" stroke="${s}" stroke-width="1.5"/>`,
  // Added for the auto-generated General Ability "shape pattern" families
  // (sequences of 3D solids, nesting, path-direction rotation, glyph
  // rotation/reflection, and quadrant-rotation cell content).
  heart: (cx, cy, sz, f, s) => `<path d="M${cx},${cy + sz * 0.6} C${cx - sz * 1.2},${cy - sz * 0.3} ${cx - sz * 0.5},${cy - sz * 1.1} ${cx},${cy - sz * 0.35} C${cx + sz * 0.5},${cy - sz * 1.1} ${cx + sz * 1.2},${cy - sz * 0.3} ${cx},${cy + sz * 0.6} Z" fill="${f}" stroke="${s}" stroke-width="1.4"/>`,
  leaf: (cx, cy, sz, f, s) => `<path d="M${cx},${cy - sz} Q${cx + sz * 0.7},${cy} ${cx},${cy + sz} Q${cx - sz * 0.7},${cy} ${cx},${cy - sz} Z" fill="${f}" stroke="${s}" stroke-width="1.4"/>`,
  notched_bar: (cx, cy, sz, f, s) => { const w = sz * 0.55, h = sz * 1.1; return `<rect x="${cx - w}" y="${cy - h}" width="${w * 2}" height="${h * 2}" fill="${f === 'none' ? '#fff' : f}" stroke="${s}" stroke-width="1.6"/><line x1="${cx - w}" y1="${cy + h}" x2="${cx + w}" y2="${cy - h}" stroke="${s}" stroke-width="1.6"/>`; },
  elbow_arrow: (cx, cy, sz, f, s) => { const x0 = cx - sz * 0.5, y0 = cy - sz * 0.9, x1 = cx - sz * 0.5, y1 = cy + sz * 0.5, x2 = cx + sz * 0.6, y2 = cy + sz * 0.5; return `<path d="M${x0},${y0} L${x1},${y1} L${x2},${y2}" fill="none" stroke="${s}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><polygon points="${x2},${y2 - sz * 0.28} ${x2},${y2 + sz * 0.28} ${x2 + sz * 0.4},${y2}" fill="${s}"/>`; },
  cuboid: (cx, cy, sz, f) => { const w = sz, h = sz * 0.8, d = sz * 0.45; const fx = cx - w, fy = cy - h + d; const c = f === 'none' ? '#D97706' : f; return `<polygon points="${fx},${fy} ${fx + d},${fy - d} ${fx + w * 2 - d + d},${fy - d} ${fx + w * 2 - d},${fy}" fill="#FCD34D" stroke="${c}" stroke-width="1.4"/><polygon points="${fx + w * 2 - d},${fy} ${fx + w * 2 - d + d},${fy - d} ${fx + w * 2 - d + d},${fy - d + h * 2 - d} ${fx + w * 2 - d},${fy + h * 2 - d}" fill="#F59E0B" stroke="${c}" stroke-width="1.4"/><rect x="${fx}" y="${fy}" width="${w * 2 - d}" height="${h * 2 - d}" fill="#FDE68A" stroke="${c}" stroke-width="1.4"/>`; },
  cylinder: (cx, cy, sz) => { const w = sz * 0.8, h = sz * 1.0; const c = '#2563EB'; return `<rect x="${cx - w}" y="${cy - h}" width="${w * 2}" height="${h * 2}" fill="#93C5FD" stroke="none"/><line x1="${cx - w}" y1="${cy - h}" x2="${cx - w}" y2="${cy + h}" stroke="${c}" stroke-width="1.4"/><line x1="${cx + w}" y1="${cy - h}" x2="${cx + w}" y2="${cy + h}" stroke="${c}" stroke-width="1.4"/><path d="M${cx - w},${cy + h} A${w},${w * 0.4} 0 0 0 ${cx + w},${cy + h}" fill="none" stroke="${c}" stroke-width="1.4"/><ellipse cx="${cx}" cy="${cy - h}" rx="${w}" ry="${w * 0.4}" fill="#93C5FD" stroke="${c}" stroke-width="1.4"/>`; },
  cone: (cx, cy, sz) => { const w = sz * 0.8, h = sz * 1.2; const c = '#DC2626'; return `<polygon points="${cx},${cy - h} ${cx - w},${cy + h * 0.4} ${cx + w},${cy + h * 0.4}" fill="#FCA5A5" stroke="${c}" stroke-width="1.4"/><ellipse cx="${cx}" cy="${cy + h * 0.4}" rx="${w}" ry="${w * 0.35}" fill="#FCA5A5" stroke="${c}" stroke-width="1.4"/>`; },
};

// Draws N concentric triangle outlines (used by the "nesting progression"
// pattern family), filling the innermost one when `filled` is set. Handled
// separately from SHAPE_RENDERERS because it needs extra params beyond the
// uniform (cx,cy,sz,fill,stroke) signature.
function renderNestedTriangleSvg(cx, cy, sz, nestCount, filled, color) {
  let out = '';
  for (let i = 0; i < nestCount; i++) {
    const s2 = sz * (1 - i * 0.22);
    const isInner = i === nestCount - 1;
    const fill = (isInner && filled) ? color : 'none';
    out += `<polygon points="${cx},${cy - s2} ${cx - s2},${cy + s2} ${cx + s2},${cy + s2}" fill="${fill}" stroke="${color}" stroke-width="1.5"/>`;
  }
  return out;
}

// Auto-lays-out N copies of a shape within a frame (used by "growing count"
// patterns, so the AI only has to specify a count rather than hand-placing
// each copy's x/y).
function layoutPositions(count, layout, boxW, boxH) {
  if (count <= 1) return [[boxW / 2, boxH / 2]];
  if (layout === 'row') return Array.from({ length: count }, (_, i) => [(i + 0.5) / count * boxW, boxH / 2]);
  const cols = Math.ceil(Math.sqrt(count)), rows = Math.ceil(count / cols), pts = [];
  for (let i = 0; i < count; i++) { const r = Math.floor(i / cols), c = i % cols; pts.push([(c + 0.5) / cols * boxW, (r + 0.5) / rows * boxH]); }
  return pts;
}

// Renders one shape spec, handling the "text" and "nested_triangle" special
// cases, generic per-shape rotation/flip, and count/layout auto-repeat.
function renderShapeSvg(sh, boxW, boxH) {
  if (sh.type === 'text') {
    return `<text x="${(sh.x ?? 0.5) * boxW}" y="${(sh.y ?? 0.5) * boxH}" font-size="${(sh.size ?? 0.34) * Math.min(boxW, boxH)}" font-weight="700" fill="${sh.color || '#374151'}" text-anchor="middle" dominant-baseline="middle" font-family="Inter, sans-serif">${sh.text}</text>`;
  }
  if (sh.type === 'nested_triangle') {
    return renderNestedTriangleSvg((sh.x ?? 0.5) * boxW, (sh.y ?? 0.5) * boxH, (sh.size ?? 0.34) * Math.min(boxW, boxH), sh.nestCount || 3, !!sh.filled, sh.stroke || '#374151');
  }
  const renderer = SHAPE_RENDERERS[sh.type];
  if (!renderer) return '';
  const count = sh.count || 1;
  const positions = count > 1 ? layoutPositions(count, sh.layout, boxW, boxH) : [[(sh.x ?? 0.5) * boxW, (sh.y ?? 0.5) * boxH]];
  const sz = (sh.size ?? 0.3) * Math.min(boxW, boxH) * (count > 1 ? Math.max(0.55, 1 / Math.sqrt(count)) : 1);
  return positions.map(([px, py]) => {
    let svg = renderer(px, py, sz, sh.fill || 'none', sh.stroke || '#374151');
    let t = '';
    if (sh.flip === 'h') t += `translate(${2 * px},0) scale(-1,1) `;
    if (sh.flip === 'v') t += `translate(0,${2 * py}) scale(1,-1) `;
    if (sh.rotation) t += `rotate(${sh.rotation} ${px} ${py}) `;
    return t ? `<g transform="${t}">${svg}</g>` : svg;
  }).join('');
}

// Renders an optional full-frame background shape (hexagon/circle/square,
// with fill and rotation) used by the "attribute cycling" pattern family —
// drawn behind a frame's shapes so markers sit on top of it.
function renderBgShapeSvg(bg, boxW, boxH) {
  if (!bg) return '';
  const cx = boxW / 2, cy = boxH / 2, r = Math.min(boxW, boxH) * 0.44;
  let shapeSvg;
  if (bg.shape === 'circle') shapeSvg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${bg.fill || 'none'}" stroke="${bg.stroke || '#374151'}" stroke-width="1.8"/>`;
  else if (bg.shape === 'square') shapeSvg = `<rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" fill="${bg.fill || 'none'}" stroke="${bg.stroke || '#374151'}" stroke-width="1.8"/>`;
  else { const n = bg.sides || 6; const pts = polygonVertices(n, cx, cy, r).map(p => p.join(',')).join(' '); shapeSvg = `<polygon points="${pts}" fill="${bg.fill || 'none'}" stroke="${bg.stroke || '#374151'}" stroke-width="1.8"/>`; }
  return bg.rotation ? `<g transform="rotate(${bg.rotation} ${cx} ${cy})">${shapeSvg}</g>` : shapeSvg;
}

// Combines a frame's optional background shape with its shapes array — the
// single shared implementation used by the React renderers below AND the
// plain-string print builders, so the two can never drift apart.
function renderShapesFrameSvg(frame, boxW, boxH) {
  return renderBgShapeSvg(frame.bgShape, boxW, boxH) + (frame.shapes || []).map(sh => renderShapeSvg(sh, boxW, boxH)).join('');
}

// ── Rotation-around-polygon helper ───────────────────────────────────────────
// Renders a small set of symbols placed at N vertices of a K-sided polygon —
// used for "symbols rotate around a fixed shape" pattern questions (extracted
// from, or generated to match, a photo of that style of question). A frame in
// this style carries {polygonSides, elements:[{type,color,vertex}, ...]}
// instead of the older {shapes:[{type,x,y,size,fill,stroke}]} format — both
// are supported side by side, picked per-frame by which fields are present.
export function polygonVertices(n, cx, cy, r) {
  const pts = [];
  for (let k = 0; k < n; k++) {
    const a = (-90 + k * (360 / n)) * Math.PI / 180;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

export function renderRotationFrameSvg(frame, boxW, boxH) {
  const cx = boxW / 2, cy = boxH / 2;
  const r = Math.min(boxW, boxH) * 0.38;
  const n = frame.polygonSides;
  const verts = polygonVertices(n, cx, cy, r);
  const outline = verts.map(p => p.join(',')).join(' ');
  const elems = (frame.elements || []).map(el => {
    const renderer = SHAPE_RENDERERS[el.type];
    if (!renderer) return '';
    const v = verts[((el.vertex % n) + n) % n];
    const sz = Math.min(boxW, boxH) * 0.16;
    const col = el.color || '#374151';
    return renderer(v[0], v[1], sz, col, col);
  }).join('');
  return `<polygon points="${outline}" fill="none" stroke="#94A3B8" stroke-width="1.6"/>${elems}`;
}

// ── Plain-string SVG builders (for the printed/PDF paper, which is built as a
// raw HTML string rather than rendered by React) ─────────────────────────────
function frameInnerSvgString(frame, boxW, boxH) {
  if (!frame) return '';
  if (frame.polygonSides) return renderRotationFrameSvg(frame, boxW, boxH);
  return renderShapesFrameSvg(frame, boxW, boxH);
}

// Renders the "What comes next?" sequence-of-frames strip (visual.frames) as
// a standalone HTML/SVG string, matching PicturePattern's on-screen layout.
export function renderPicturePatternSvgString(visual) {
  const { frames = [], title } = visual || {};
  if (!frames.length) return '';
  const frameW = 54, frameH = 54, gap = 6, pad = 6;
  const totalW = frames.length * (frameW + gap) - gap + pad * 2;
  const framesSvg = frames.map(frame => {
    const isBlank = frame.isBlank;
    if (isBlank) {
      return `<rect width="${frameW}" height="${frameH}" rx="4" fill="#EEF2FF" stroke="#4338CA" stroke-width="2" stroke-dasharray="4,3"/><text x="${frameW / 2}" y="${frameH / 2}" font-size="24" font-weight="800" fill="#4338CA" text-anchor="middle" dominant-baseline="middle" font-family="Inter, sans-serif">?</text>`;
    }
    return `<rect width="${frameW}" height="${frameH}" rx="4" fill="#fff" stroke="#94A3B8" stroke-width="1.5"/>${frameInnerSvgString(frame, frameW, frameH)}`;
  }).map((inner, fi) => `<g transform="translate(${pad + fi * (frameW + gap)}, ${pad})">${inner}</g>`).join('');
  return `<div style="margin:8px 0 12px;">${title ? `<div style="font-size:11pt;font-weight:bold;margin-bottom:6px;">${title}</div>` : ''}<svg viewBox="0 0 ${totalW} ${frameH + pad * 2}" width="${Math.min(totalW, 380)}" height="${(frameH + pad * 2) * Math.min(totalW, 380) / totalW}">${framesSvg}</svg></div>`;
}

// Renders one answer-option frame (visual.answerFrames[letter]) as a
// standalone SVG string, matching the PatternFrame component's look.
export function renderAnswerFrameSvgString(frame, size = 48) {
  if (!frame) return '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="vertical-align:middle;"><rect x="1" y="1" width="${size - 2}" height="${size - 2}" rx="6" fill="#fff" stroke="#94A3B8" stroke-width="1.5"/>${frameInnerSvgString(frame, size, size)}</svg>`;
}

function PicturePattern({ visual }) {
  const { frames = [], title } = visual;
  const frameW = 54, frameH = 54, gap = 6, pad = 6;
  const totalW = frames.length * (frameW + gap) - gap + pad * 2;

  return (
    <div style={{ background: '#F8FAFF', borderRadius: 14, padding: '14px 10px', marginBottom: 16, border: '1px solid rgba(67,56,202,0.1)', overflowX: 'auto' }}>
      {title && <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8, fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>{title}</div>}
      <svg width="100%" viewBox={`0 0 ${totalW} ${frameH + pad * 2}`}
        style={{ minWidth: Math.min(totalW, 320), maxWidth: 480, display: 'block', margin: '0 auto' }}>
        {frames.map((frame, fi) => {
          const fx = pad + fi * (frameW + gap);
          const fy = pad;
          const isBlank = frame.isBlank;
          return (
            <g key={fi}>
              <rect x={fx} y={fy} width={frameW} height={frameH} rx={4}
                fill={isBlank ? '#EEF2FF' : '#fff'}
                stroke={isBlank ? '#4338CA' : '#94A3B8'}
                strokeWidth={isBlank ? 2 : 1.5}
                strokeDasharray={isBlank ? '4,3' : 'none'}
              />
              {isBlank && (
                <text x={fx + frameW / 2} y={fy + frameH / 2} fontSize={24} fontWeight="800" fill="#4338CA"
                  textAnchor="middle" dominantBaseline="middle" fontFamily="Inter, sans-serif">?</text>
              )}
              {!isBlank && (
                <g transform={`translate(${fx}, ${fy})`} dangerouslySetInnerHTML={{ __html: frameInnerSvgString(frame, frameW, frameH) }} />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Single Pattern Frame (for answer options) ─────────────────────────────────
export function PatternFrame({ frame, size = 48, selected, correct, revealed, color = '#4338CA' }) {
  if (!frame) return null;
  const fw = size, fh = size;
  let bg = '#fff', stroke = '#CBD5E1', sw = 1.5;
  if (revealed) {
    if (correct) { bg = '#ECFDF5'; stroke = '#059669'; }
    else if (selected) { bg = '#FFF1F2'; stroke = '#FDA4AF'; }
  } else if (selected) { bg = '#EEF2FF'; stroke = color; sw = 2; }

  return (
    <svg width={fw} height={fh} viewBox={`0 0 ${fw} ${fh}`} style={{ flexShrink: 0 }}>
      <rect x={1} y={1} width={fw - 2} height={fh - 2} rx={6} fill={bg} stroke={stroke} strokeWidth={sw} />
      <g dangerouslySetInnerHTML={{ __html: frameInnerSvgString(frame, fw, fh) }} />
    </svg>
  );
}

// ── Quadrant Rotation ─────────────────────────────────────────────────────────
// A 2x2 grid where a single "unit design" (cellMarks: lines/arcs/dots/shapes,
// normalized 0-1 within one cell) is rotated/mirrored per quadrant. The AI
// only supplies the unit design plus a rotation/flip transform per quadrant —
// this renderer does the actual geometry, which is far more reliable than
// asking the AI to hand-draw 4 separate cells. One quadrant is left blank
// (the question), and answerFrames maps each MCQ letter to a candidate
// transform for that blank cell (reusing the same cellMarks).
function renderCellMarksSvg(marks, transform, boxW, boxH) {
  const inner = (marks || []).map(m => {
    if (m.kind === 'line') return `<line x1="${m.x1 * boxW}" y1="${m.y1 * boxH}" x2="${m.x2 * boxW}" y2="${m.y2 * boxH}" stroke="${m.stroke || '#374151'}" stroke-width="${m.strokeWidth || 1.6}"/>`;
    if (m.kind === 'arc') {
      const x1 = m.x1 * boxW, y1 = m.y1 * boxH, x2 = m.x2 * boxW, y2 = m.y2 * boxH;
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len, bulge = (m.bulge ?? 0.3) * Math.min(boxW, boxH);
      return `<path d="M${x1},${y1} Q${mx + nx * bulge},${my + ny * bulge} ${x2},${y2}" fill="none" stroke="${m.stroke || '#374151'}" stroke-width="${m.strokeWidth || 1.6}"/>`;
    }
    if (m.kind === 'dot' || m.kind === 'circle') {
      const r = (m.r ?? 0.055) * Math.min(boxW, boxH);
      return `<circle cx="${m.x * boxW}" cy="${m.y * boxH}" r="${r}" fill="${m.fill || m.stroke || '#374151'}" stroke="${m.stroke || '#374151'}" stroke-width="1.2"/>`;
    }
    if (m.kind === 'shape') {
      const renderer = SHAPE_RENDERERS[m.shapeType];
      if (!renderer) return '';
      const sz = (m.size ?? 0.22) * Math.min(boxW, boxH);
      return renderer(m.x * boxW, m.y * boxH, sz, m.fill || 'none', m.stroke || '#374151');
    }
    return '';
  }).join('');
  const cx = boxW / 2, cy = boxH / 2;
  let t = '';
  if (transform?.flip === 'h') t += `translate(${2 * cx},0) scale(-1,1) `;
  if (transform?.flip === 'v') t += `translate(0,${2 * cy}) scale(1,-1) `;
  if (transform?.rotation) t += `rotate(${transform.rotation} ${cx} ${cy}) `;
  return t ? `<g transform="${t}">${inner}</g>` : inner;
}

export function renderQuadrantGridSvgString(visual, boxSize = 200) {
  const cellSize = boxSize / 2;
  const cellsSvg = [0, 1, 2, 3].map(i => {
    const row = Math.floor(i / 2), col = i % 2, x = col * cellSize, y = row * cellSize;
    if (i === visual.blankQuadrant) {
      return `<g transform="translate(${x},${y})"><rect width="${cellSize}" height="${cellSize}" fill="#EEF2FF" stroke="#4338CA" stroke-width="2" stroke-dasharray="5,4"/><text x="${cellSize / 2}" y="${cellSize / 2}" font-size="26" font-weight="800" fill="#4338CA" text-anchor="middle" dominant-baseline="middle">?</text></g>`;
    }
    const t = (visual.quadrantTransforms || [])[i] || {};
    return `<g transform="translate(${x},${y})"><rect width="${cellSize}" height="${cellSize}" fill="#fff" stroke="#94A3B8" stroke-width="1.5"/>${renderCellMarksSvg(visual.cellMarks, t, cellSize, cellSize)}</g>`;
  }).join('');
  return `<svg width="${boxSize}" height="${boxSize}" viewBox="0 0 ${boxSize} ${boxSize}">${cellsSvg}</svg>`;
}

// Print/PDF version of the quadrant grid, with an optional title above it —
// the quadrantpattern counterpart to renderPicturePatternSvgString.
export function renderQuadrantBlockSvgString(visual) {
  const boxSize = 150;
  return `<div style="margin:8px 0 12px;">${visual.title ? `<div style="font-size:11pt;font-weight:bold;margin-bottom:6px;">${visual.title}</div>` : ''}${renderQuadrantGridSvgString(visual, boxSize)}</div>`;
}

export function renderQuadrantAnswerSvgString(cellMarks, transform, size = 48) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="vertical-align:middle;"><rect x="1" y="1" width="${size - 2}" height="${size - 2}" rx="6" fill="#fff" stroke="#94A3B8" stroke-width="1.5"/>${renderCellMarksSvg(cellMarks, transform, size, size)}</svg>`;
}

function QuadrantPattern({ visual }) {
  const boxSize = 200;
  return (
    <div style={{ background: '#F8FAFF', borderRadius: 14, padding: '14px 10px', marginBottom: 16, border: '1px solid rgba(67,56,202,0.1)' }}>
      {visual.title && <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8, fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>{visual.title}</div>}
      <div style={{ display: 'flex', justifyContent: 'center' }} dangerouslySetInnerHTML={{ __html: renderQuadrantGridSvgString(visual, boxSize) }} />
    </div>
  );
}

// The quadrantpattern counterpart to PatternFrame — renders one MCQ answer
// choice (a candidate transform of the puzzle's cellMarks) as a single cell.
export function QuadrantAnswerCell({ cellMarks, transform, size = 48, selected, correct, revealed, color = '#4338CA' }) {
  let bg = '#fff', stroke = '#CBD5E1', sw = 1.5;
  if (revealed) {
    if (correct) { bg = '#ECFDF5'; stroke = '#059669'; }
    else if (selected) { bg = '#FFF1F2'; stroke = '#FDA4AF'; }
  } else if (selected) { bg = '#EEF2FF'; stroke = color; sw = 2; }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <rect x={1} y={1} width={size - 2} height={size - 2} rx={6} fill={bg} stroke={stroke} strokeWidth={sw} />
      <g dangerouslySetInnerHTML={{ __html: renderCellMarksSvg(cellMarks, transform, size, size) }} />
    </svg>
  );
}

// ── Unified answer-option helpers ──────────────────────────────────────────
// A question's visual.answerFrames values mean different things depending on
// visual.type: for 'picturepattern' (rotation-around-shape or plain shapes)
// each value is a self-contained frame, rendered by PatternFrame; for
// 'quadrantpattern' each value is just a {rotation,flip} transform applied to
// visual.cellMarks, rendered by QuadrantAnswerCell. These two helpers pick
// the right one so call sites don't need to branch on visual.type themselves.
export function AnswerCell({ visual, val, size = 48, selected, correct, revealed, color = '#4338CA' }) {
  if (visual?.type === 'quadrantpattern') {
    return <QuadrantAnswerCell cellMarks={visual.cellMarks} transform={val} size={size} selected={selected} correct={correct} revealed={revealed} color={color} />;
  }
  return <PatternFrame frame={val} size={size} selected={selected} correct={correct} revealed={revealed} color={color} />;
}

export function renderAnswerCellSvgString(visual, val, size = 48) {
  if (visual?.type === 'quadrantpattern') return renderQuadrantAnswerSvgString(visual.cellMarks, val, size);
  return renderAnswerFrameSvgString(val, size);
}

// Print/PDF version of the main puzzle visual (frames strip or quadrant
// grid) — the single entry point buildAndPrintPaper should call.
export function renderPatternVisualSvgString(visual) {
  if (!visual) return '';
  if (visual.type === 'quadrantpattern') return renderQuadrantBlockSvgString(visual);
  if (visual.type === 'picturepattern') return renderPicturePatternSvgString(visual);
  // Every other visual type (bar/line/pie charts, shape/lshape/polygon,
  // thermometer, clock, cubes, money, counting, numberline) had no bespoke
  // string builder here at all, so buildAndPrintPaper's document.write()
  // pathway (AdminPaperBuilderPage.jsx) silently printed nothing for them —
  // the picture would show correctly in the on-screen preview (which renders
  // <QuestionVisual> as real React) but vanish from the printed/PDF paper.
  // Render the exact same component to a static HTML/SVG string instead of
  // hand-duplicating each type's markup — guarantees the print output always
  // matches the live preview pixel-for-pixel, for every current and future
  // visual type, with no separate implementation to keep in sync.
  try {
    return ReactDOMServer.renderToStaticMarkup(<QuestionVisual visual={visual} />);
  } catch {
    return '';
  }
}

export default function QuestionVisual({ visual }) {
  if (!visual || !visual.type) return null;

  switch (visual.type) {
    case 'barchart': return <BarChart visual={visual} />;
    case 'linegraph': return <LineGraph visual={visual} />;
    case 'piechart': return <PieChart visual={visual} />;
    case 'shape': return <ShapeDiagram visual={visual} />;
    case 'lshape': return <LShape visual={visual} />;
    case 'polygon': return <PolygonShape visual={visual} />;
    case 'clock': return <ClockFace visual={visual} />;
    case 'money': return <MoneyVisual visual={visual} />;
    case 'counting': return <CountingObjects visual={visual} />;
    case 'numberline': return <NumberLine visual={visual} />;
    case 'thermometer': return <Thermometer visual={visual} />;
    case 'cubes': return <CubesVisual visual={visual} />;
    case 'picturepattern': return <PicturePattern visual={visual} />;
    case 'quadrantpattern': return <QuadrantPattern visual={visual} />;
    default: return null;
  }
}