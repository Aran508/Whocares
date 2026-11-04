import type { ReactNode } from 'react';

export const C = {
  navy: '#0f1b33',
  ink: '#273656',
  muted: '#6f84a8',
  line: '#c9d4e6',
  bg: '#f3f6fb',
  blue: '#2a6fdb',
  blueDark: '#19489a',
  blueLight: '#d9e8ff',
  green: '#1f9d5c',
  greenLight: '#d1f5e1',
  orange: '#e5830f',
  orangeLight: '#ffeacc',
  red: '#d63a3a',
  redLight: '#ffdcdc',
  white: '#ffffff',
  steel: '#9fb0cd',
  steelDark: '#4c6187',
};

export function wrap(text: string, max: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) {
      if (cur) lines.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

export function T({ x, y, children, size = 12, weight = 500, fill = C.ink, anchor = 'middle', max, lh = 1.25 }: { x: number; y: number; children: string; size?: number; weight?: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; max?: number; lh?: number }) {
  const lines = max ? wrap(children, max) : [children];
  const off = ((lines.length - 1) * size * lh) / 2;
  return (
    <text x={x} y={y - off} fontSize={size} fontWeight={weight} fill={fill} textAnchor={anchor} dominantBaseline="middle" fontFamily="Inter, system-ui, sans-serif">
      {lines.map((l, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : size * lh}>
          {l}
        </tspan>
      ))}
    </text>
  );
}

export function Box({ x, y, w, h, label, fill = C.blueLight, stroke = C.blue, color = C.navy, size = 12, max, rx = 8, weight = 600 }: { x: number; y: number; w: number; h: number; label?: string; fill?: string; stroke?: string; color?: string; size?: number; max?: number; rx?: number; weight?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} stroke={stroke} strokeWidth={1.5} />
      {label && (
        <T x={x + w / 2} y={y + h / 2} size={size} fill={color} weight={weight} max={max ?? Math.max(6, Math.floor(w / (size * 0.58)))}>
          {label}
        </T>
      )}
    </g>
  );
}

export function Arrow({ x1, y1, x2, y2, color = C.steelDark, width = 1.6, dashed, head = true }: { x1: number; y1: number; x2: number; y2: number; color?: string; width?: number; dashed?: boolean; head?: boolean }) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const hl = 8;
  const hx1 = x2 - hl * Math.cos(ang - 0.4), hy1 = y2 - hl * Math.sin(ang - 0.4);
  const hx2 = x2 - hl * Math.cos(ang + 0.4), hy2 = y2 - hl * Math.sin(ang + 0.4);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeDasharray={dashed ? '5 4' : undefined} />
      {head && <polygon points={`${x2},${y2} ${hx1},${hy1} ${hx2},${hy2}`} fill={color} />}
    </g>
  );
}

export function Svg({ w, h, children, title }: { w: number; h: number; children: ReactNode; title: string }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={title} className="w-full h-auto" style={{ maxHeight: 460 }}>
      <title>{title}</title>
      {children}
    </svg>
  );
}

export function Label({ x, y, text, color = C.muted, size = 11, anchor = 'middle' as const }: { x: number; y: number; text: string; color?: string; size?: number; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <text x={x} y={y} fontSize={size} fill={color} textAnchor={anchor} fontFamily="Inter, system-ui, sans-serif" dominantBaseline="middle">
      {text}
    </text>
  );
}

/** Good/bad badge used in before/after illustrations. */
export function Verdict({ x, y, ok, text }: { x: number; y: number; ok: boolean; text: string }) {
  return (
    <g>
      <rect x={x} y={y} width={text.length * 7 + 26} height={22} rx={11} fill={ok ? C.greenLight : C.redLight} stroke={ok ? C.green : C.red} />
      <text x={x + 12} y={y + 11.5} fontSize={12} fontWeight={700} fill={ok ? C.green : C.red} dominantBaseline="middle" fontFamily="Inter, sans-serif">
        {ok ? '✓' : '✕'} {text}
      </text>
    </g>
  );
}
