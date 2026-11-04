export const fmt = (n: number, dp = 2): string => {
  if (!isFinite(n)) return '—';
  const r = Math.round(n * 10 ** dp) / 10 ** dp;
  return r.toLocaleString('en-US', { maximumFractionDigits: dp });
};
export const pct = (n: number, dp = 1) => `${fmt(n, dp)}%`;
export const timeAgo = (ts: number): string => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
};
export const hours = (seconds: number) => fmt(seconds / 3600, 1);
