import React from 'react';

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
  const { value, unit = 'C', min = 0, max = 50, title, color = '#EF4444' } = visual;
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const bulbY = 160;
  const tubeTop = 20;
  const tubeH = bulbY - tubeTop - 10;
  const fillH = pct * tubeH;
  const fillY = bulbY - 10 - fillH;

  // Generate tick marks
  const ticks = [];
  const tickCount = 10;
  for (let i = 0; i <= tickCount; i++) {
    const tickVal = min + (i / tickCount) * (max - min);
    const tickY = bulbY - 10 - (i / tickCount) * tubeH;
    const isMajor = i % 2 === 0;
    ticks.push({ val: Math.round(tickVal), y: tickY, major: isMajor });
  }

  return (
    <div style={{ background: '#FFF5F5', borderRadius: 14, padding: '16px 20px', marginBottom: 16, border: '1px solid rgba(239,68,68,0.15)', textAlign: 'center' }}>
      {title && <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, fontFamily: 'Inter, sans-serif' }}>{title}</div>}
      <svg width={120} height={190} viewBox="0 0 120 190" style={{ display: 'block', margin: '0 auto' }}>
        {/* Tube outline */}
        <rect x={52} y={tubeTop} width={16} height={tubeH + 10} rx={8} fill="#fff" stroke="#CBD5E1" strokeWidth={2} />
        {/* Mercury fill */}
        <rect x={56} y={fillY} width={8} height={fillH} rx={2} fill={color} />
        {/* Bulb */}
        <circle cx={60} cy={bulbY + 10} r={14} fill={color} stroke={color} strokeWidth={2} />
        {/* Tick marks */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={t.major ? 40 : 44} y1={t.y} x2={52} y2={t.y} stroke="#94A3B8" strokeWidth={t.major ? 1.5 : 1} />
            {t.major && <text x={36} y={t.y + 4} fontSize={10} fill="#374151" textAnchor="end" fontFamily="Inter, sans-serif">{t.val}°</text>}
          </g>
        ))}
        {/* Unit label */}
        <text x={80} y={30} fontSize={13} fontWeight="700" fill={color} fontFamily="Inter, sans-serif">{unit === 'C' ? '°C' : '°F'}</text>
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

// ── L-Shape / Compound Shape ──────────────────────────────────────────────────

function LShape({ visual }) {
  const { dimensions = {}, title, color = '#4338CA' } = visual;
  const { parts = [] } = dimensions;

  return (
    <div style={{ background: '#F8FAFF', borderRadius: 14, padding: '16px 20px', marginBottom: 16, border: '1px solid rgba(67,56,202,0.1)' }}>
      {title && <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8, fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>{title}</div>}
      <svg width="100%" viewBox="0 0 280 180" style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}>
        {/* L-shape */}
        <polygon points="40,20 200,20 200,90 130,90 130,160 40,160" fill={`${color}15`} stroke={color} strokeWidth={2.5} />
        {/* Right angle markers */}
        <polyline points="200,78 188,78 188,90" fill="none" stroke={color} strokeWidth={1.5} />
        <polyline points="118,90 118,102 130,102" fill="none" stroke={color} strokeWidth={1.5} />
        <polyline points="40,148 52,148 52,160" fill="none" stroke={color} strokeWidth={1.5} />
        <polyline points="40,32 52,32 52,20" fill="none" stroke={color} strokeWidth={1.5} />
        {/* Labels */}
        {parts.map((p, i) => (
          <text key={i} x={p.x} y={p.y} fontSize={12} fontWeight="700" fill={color} textAnchor="middle" fontFamily="Inter, sans-serif">{p.label}</text>
        ))}
        {/* Default labels if none provided */}
        {parts.length === 0 && <>
          <text x={120} y={12} fontSize={12} fontWeight="700" fill={color} textAnchor="middle" fontFamily="Inter, sans-serif">8cm</text>
          <text x={210} y={55} fontSize={12} fontWeight="700" fill={color} textAnchor="start" fontFamily="Inter, sans-serif">4cm</text>
          <text x={168} y={105} fontSize={12} fontWeight="700" fill={color} textAnchor="middle" fontFamily="Inter, sans-serif">4cm</text>
          <text x={120} y={135} fontSize={12} fontWeight="700" fill={color} textAnchor="middle" fontFamily="Inter, sans-serif">3cm</text>
          <text x={28} y={95} fontSize={12} fontWeight="700" fill={color} textAnchor="middle" fontFamily="Inter, sans-serif" transform="rotate(-90,28,95)">8cm</text>
          <text x={145} y={130} fontSize={12} fontWeight="700" fill={color} textAnchor="middle" fontFamily="Inter, sans-serif" transform="rotate(-90,145,130)">4cm</text>
        </>}
      </svg>
    </div>
  );
}



export default function QuestionVisual({ visual }) {
  if (!visual || !visual.type) return null;

  switch (visual.type) {
    case 'barchart': return <BarChart visual={visual} />;
    case 'linegraph': return <LineGraph visual={visual} />;
    case 'piechart': return <PieChart visual={visual} />;
    case 'shape': return <ShapeDiagram visual={visual} />;
    case 'lshape': return <LShape visual={visual} />;
    case 'money': return <MoneyVisual visual={visual} />;
    case 'counting': return <CountingObjects visual={visual} />;
    case 'numberline': return <NumberLine visual={visual} />;
    case 'thermometer': return <Thermometer visual={visual} />;
    case 'cubes': return <CubesVisual visual={visual} />;
    default: return null;
  }
}