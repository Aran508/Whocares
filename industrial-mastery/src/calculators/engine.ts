// Calculator engine — pure functions, no UI. Each calculator declares inputs
// (with units converted to a base unit) and a compute() that returns the
// answer, every calculation step and an interpretation.

export interface UnitOption {
  label: string;
  factor: number; // multiply entered value by factor to get base unit
}

export interface CalcInput {
  key: string;
  label: string;
  type?: 'number' | 'list' | 'select';
  default: number | string;
  unit?: string; // fixed unit label (no conversion)
  units?: UnitOption[]; // selectable units; first is default
  min?: number;
  max?: number;
  integer?: boolean;
  help?: string;
  options?: { label: string; value: string }[]; // for select
  placeholder?: string;
}

export interface CalcResult {
  headline: { label: string; value: string };
  extra?: { label: string; value: string }[];
  steps: string[];
  interpretation: string;
  status?: 'good' | 'warn' | 'bad' | 'neutral';
  chart?: { label: string; value: number; color?: string }[];
}

export type Values = Record<string, number | string>;

export interface CalculatorDef {
  id: string;
  title: string;
  category: 'Production' | 'Quality' | 'Maintenance' | 'Inventory' | 'Finance';
  description: string;
  formula: string;
  assumptions: string[];
  example: string;
  inputs: CalcInput[];
  compute: (v: Values) => CalcResult;
  lessonId?: string;
}

export class CalcError extends Error {}

export const TIME_MIN: UnitOption[] = [
  { label: 'min', factor: 1 },
  { label: 'h', factor: 60 },
  { label: 's', factor: 1 / 60 },
];
export const TIME_SEC: UnitOption[] = [
  { label: 's', factor: 1 },
  { label: 'min', factor: 60 },
  { label: 'h', factor: 3600 },
];
export const TIME_HOUR: UnitOption[] = [
  { label: 'h', factor: 1 },
  { label: 'min', factor: 1 / 60 },
  { label: 'days (24 h)', factor: 24 },
];

export const r = (n: number, dp = 2) => {
  if (!isFinite(n)) return '—';
  const v = Math.round(n * 10 ** dp) / 10 ** dp;
  return v.toLocaleString('en-US', { maximumFractionDigits: dp });
};
export const p = (n: number, dp = 1) => `${r(n, dp)}%`;

/** Validate and convert raw string inputs. Returns converted values or a map of errors. */
export function validate(def: CalculatorDef, raw: Record<string, string>, unitSel: Record<string, number>) {
  const errors: Record<string, string> = {};
  const values: Values = {};
  for (const inp of def.inputs) {
    const s = (raw[inp.key] ?? '').toString().trim();
    if (inp.type === 'list' || inp.type === 'select') {
      if (!s) errors[inp.key] = 'Required';
      values[inp.key] = s;
      continue;
    }
    if (s === '') {
      errors[inp.key] = 'Required';
      continue;
    }
    const n = Number(s.replace(/,/g, ''));
    if (!isFinite(n)) {
      errors[inp.key] = 'Enter a valid number';
      continue;
    }
    if (inp.integer && !Number.isInteger(n)) {
      errors[inp.key] = 'Enter a whole number';
      continue;
    }
    if (inp.min !== undefined && n < inp.min) {
      errors[inp.key] = `Must be ≥ ${inp.min}`;
      continue;
    }
    if (inp.max !== undefined && n > inp.max) {
      errors[inp.key] = `Must be ≤ ${inp.max}`;
      continue;
    }
    const factor = inp.units ? inp.units[unitSel[inp.key] ?? 0]?.factor ?? 1 : 1;
    values[inp.key] = n * factor;
  }
  return { values, errors };
}

/** Parse "label: number" lines, or comma-separated numbers. */
export function parseLabelledList(s: string, minItems = 1): { label: string; value: number }[] {
  const lines = s
    .split(/\n|;/)
    .map((x) => x.trim())
    .filter(Boolean);
  const out: { label: string; value: number }[] = [];
  if (lines.length === 1 && !lines[0].includes(':')) {
    lines[0].split(',').forEach((t, i) => {
      const n = Number(t.trim());
      if (!isFinite(n) || t.trim() === '') throw new CalcError(`"${t.trim()}" is not a number`);
      out.push({ label: `Item ${i + 1}`, value: n });
    });
  } else {
    for (const line of lines) {
      const idx = line.lastIndexOf(':');
      if (idx < 0) throw new CalcError(`Line "${line}" must be in the form  name: value`);
      const label = line.slice(0, idx).trim() || `Item ${out.length + 1}`;
      const n = Number(line.slice(idx + 1).trim().replace(/,/g, ''));
      if (!isFinite(n)) throw new CalcError(`Value on line "${line}" is not a number`);
      out.push({ label, value: n });
    }
  }
  if (out.length < minItems) throw new CalcError(`Enter at least ${minItems} items`);
  if (out.some((x) => x.value < 0)) throw new CalcError('Values cannot be negative');
  return out;
}

/** Inverse standard normal CDF (Acklam's algorithm, |error| < 1.2e-9). */
export function invNorm(pr: number): number {
  if (pr <= 0 || pr >= 1) throw new CalcError('Probability must be between 0 and 1');
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const pl = 0.02425;
  let q: number, rr: number;
  if (pr < pl) {
    q = Math.sqrt(-2 * Math.log(pr));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (pr <= 1 - pl) {
    q = pr - 0.5;
    rr = q * q;
    return ((((((a[0] * rr + a[1]) * rr + a[2]) * rr + a[3]) * rr + a[4]) * rr + a[5]) * q) / (((((b[0] * rr + b[1]) * rr + b[2]) * rr + b[3]) * rr + b[4]) * rr + 1);
  }
  q = Math.sqrt(-2 * Math.log(1 - pr));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}

export function runCalc(def: CalculatorDef, values: Values): CalcResult | { error: string } {
  try {
    return def.compute(values);
  } catch (e) {
    if (e instanceof CalcError) return { error: e.message };
    throw e;
  }
}
