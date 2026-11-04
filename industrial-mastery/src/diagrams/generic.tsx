import { Arrow, Box, C, Svg, T } from './primitives';

const short = (s: string, n = 70) => {
  const first = s.split(/[:.;—]/)[0].trim();
  const t = first.length > 8 ? first : s;
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
};

/** Process flow built from a lesson's own steps — shown when no bespoke diagram exists. */
export function StepsFlow({ steps, title }: { steps: string[]; title: string }) {
  const items = steps.slice(0, 8);
  const cols = items.length <= 4 ? items.length : Math.ceil(items.length / 2);
  const rows = items.length <= 4 ? 1 : 2;
  const bw = 170, bh = 78, gx = 34, gy = 46;
  const W = cols * bw + (cols - 1) * gx + 40;
  const H = rows * bh + (rows - 1) * gy + 60;
  return (
    <Svg w={W} h={H} title={`${title} — step flow`}>
      {items.map((s, i) => {
        const row = Math.floor(i / cols);
        const colRaw = i % cols;
        const col = row % 2 === 0 ? colRaw : cols - 1 - colRaw; // snake layout
        const x = 20 + col * (bw + gx), y = 30 + row * (bh + gy);
        const next = i + 1 < items.length ? i + 1 : -1;
        let arrow = null;
        if (next >= 0) {
          const nr = Math.floor(next / cols), nc0 = next % cols, nc = nr % 2 === 0 ? nc0 : cols - 1 - nc0;
          const nx = 20 + nc * (bw + gx), ny = 30 + nr * (bh + gy);
          if (nr === row) arrow = <Arrow x1={nc > col ? x + bw : x} y1={y + bh / 2} x2={nc > col ? nx - 2 : nx + bw + 2} y2={ny + bh / 2} />;
          else arrow = <Arrow x1={x + bw / 2} y1={y + bh} x2={nx + bw / 2} y2={ny - 2} />;
        }
        return (
          <g key={i}>
            <Box x={x} y={y} w={bw} h={bh} fill={i === 0 ? C.blue : C.blueLight} stroke={C.blue} color={i === 0 ? C.white : C.navy} size={11} max={26} weight={500} label={short(s)} />
            <circle cx={x + 14} cy={y + 14} r={10} fill={i === 0 ? C.white : C.blue} />
            <T x={x + 14} y={y + 14} size={10} weight={700} fill={i === 0 ? C.blue : C.white}>{String(i + 1)}</T>
            {arrow}
          </g>
        );
      })}
    </Svg>
  );
}

/** Steps arranged as a continuous cycle (PDCA-like). */
export function CycleDiagram({ steps, title, center }: { steps: string[]; title: string; center?: string }) {
  const items = steps.slice(0, 8);
  const W = 560, H = 400, cx = W / 2, cy = H / 2, R = 140;
  const colors = [C.blue, C.green, C.orange, C.blueDark, C.red, C.steelDark, C.blue, C.green];
  return (
    <Svg w={W} h={H} title={`${title} — cycle`}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.line} strokeWidth={14} />
      {items.map((s, i) => {
        const a = (i / items.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
        const a2 = ((i + 0.5) / items.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <g key={i}>
            <path d={`M ${cx + (R + 0) * Math.cos(a2 - 0.12)} ${cy + R * Math.sin(a2 - 0.12)} A ${R} ${R} 0 0 1 ${cx + R * Math.cos(a2 + 0.12)} ${cy + R * Math.sin(a2 + 0.12)}`} fill="none" stroke={C.steelDark} strokeWidth={2} markerEnd="" />
            <rect x={x - 82} y={y - 30} width={164} height={60} rx={10} fill={C.white} stroke={colors[i]} strokeWidth={2} />
            <T x={x} y={y} size={11} max={26} weight={600} fill={C.navy}>{short(s, 60)}</T>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={58} fill={C.blueLight} stroke={C.blue} />
      <T x={cx} y={cy} size={13} weight={700} max={14} fill={C.blueDark}>{center ?? title}</T>
    </Svg>
  );
}

/** Pyramid — ordered levels (most important or largest at the top or bottom). */
export function Pyramid({ levels, title, colors }: { levels: string[]; title: string; colors?: string[] }) {
  const W = 560, H = 60 + levels.length * 58, top = 30;
  const cols = colors ?? [C.green, C.blue, C.blueDark, C.orange, C.red, C.steelDark];
  return (
    <Svg w={W} h={H} title={title}>
      {levels.map((l, i) => {
        const y = top + i * 58, wTop = 80 + i * 76, wBot = 80 + (i + 1) * 76;
        const pts = `${W / 2 - wTop / 2},${y} ${W / 2 + wTop / 2},${y} ${W / 2 + wBot / 2},${y + 54} ${W / 2 - wBot / 2},${y + 54}`;
        return (
          <g key={i}>
            <polygon points={pts} fill={cols[i % cols.length]} opacity={0.92} />
            <T x={W / 2} y={y + 27} size={12} weight={700} fill={C.white} max={Math.floor((wTop + 40) / 7)}>{l}</T>
          </g>
        );
      })}
    </Svg>
  );
}

/** Simple table diagram. */
export function TableDiagram({ title, cols, rows, highlight }: { title: string; cols: string[]; rows: string[][]; highlight?: (r: number, c: number) => string | undefined }) {
  const cw = Math.max(90, Math.floor(760 / cols.length));
  const W = cw * cols.length + 2, rh = 40, H = rh * (rows.length + 1) + 2;
  return (
    <Svg w={W} h={H} title={title}>
      {cols.map((c, i) => (
        <g key={i}>
          <rect x={1 + i * cw} y={1} width={cw} height={rh} fill={C.blueDark} stroke={C.white} />
          <T x={1 + i * cw + cw / 2} y={1 + rh / 2} size={11} weight={700} fill={C.white} max={Math.floor(cw / 6.5)}>{c}</T>
        </g>
      ))}
      {rows.map((r, ri) =>
        r.map((cell, ci) => (
          <g key={`${ri}-${ci}`}>
            <rect x={1 + ci * cw} y={1 + (ri + 1) * rh} width={cw} height={rh} fill={highlight?.(ri, ci) ?? (ri % 2 ? C.bg : C.white)} stroke={C.line} />
            <T x={1 + ci * cw + cw / 2} y={1 + (ri + 1) * rh + rh / 2} size={10.5} weight={500} max={Math.floor(cw / 6)}>{cell}</T>
          </g>
        )),
      )}
    </Svg>
  );
}

/** 2×2 matrix. */
export function Matrix2x2({ title, xLabel, yLabel, cells }: { title: string; xLabel: string; yLabel: string; cells: [string, string, string, string]; }) {
  const W = 520, H = 400, x0 = 70, y0 = 20, s = 200;
  const fills = [C.orangeLight, C.redLight, C.blueLight, C.greenLight];
  return (
    <Svg w={W} h={H} title={title}>
      {cells.map((c, i) => {
        const cx = x0 + (i % 2) * s, cy = y0 + Math.floor(i / 2) * s;
        return <Box key={i} x={cx} y={cy} w={s - 6} h={s - 6} fill={fills[i]} stroke={C.line} label={c} size={13} max={20} />;
      })}
      <T x={x0 + s} y={y0 + 2 * s + 20} size={12} fill={C.muted}>{xLabel + ' →'}</T>
      <g transform={`translate(${x0 - 30}, ${y0 + s}) rotate(-90)`}>
        <T x={0} y={0} size={12} fill={C.muted}>{yLabel + ' →'}</T>
      </g>
    </Svg>
  );
}
