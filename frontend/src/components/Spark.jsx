import React from 'react';

// Tiny inline SVG sparkline. Auto-scales to its data; renders nothing until 2+ points.
export function Sparkline({ data = [], color = '#3ad6ff', w = 120, h = 26, fill = true }) {
  if (!data || data.length < 2) return <svg width={w} height={h} />;
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - ((v - min) / span) * (h - 4) - 2]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      {fill && <path d={area} fill={color} opacity="0.12" />}
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.2" fill={color} />
    </svg>
  );
}

// Compact health donut (0-100%).
export function Donut({ pct = 100, size = 54, color }) {
  const r = (size - 8) / 2, c = 2 * Math.PI * r;
  const col = color || (pct >= 95 ? '#2fe08a' : pct >= 85 ? '#ffb020' : '#ff4a5e');
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1c2838" strokeWidth="5" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth="5"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset .6s' }} />
      <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle"
        fontFamily="ui-monospace,monospace" fontSize="12" fontWeight="700" fill="#e6edf5">{Math.round(pct)}</text>
    </svg>
  );
}
