import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck, ChevronRight, Volume2 } from 'lucide-react';
import { useProgress } from '../lib/progress';
import type { Level } from '../types';

export function PageHeader({ eyebrow, title, description, actions, crumbs }: { eyebrow?: string; title: string; description?: ReactNode; actions?: ReactNode; crumbs?: { to?: string; label: string }[] }) {
  return (
    <header className="mb-6">
      {crumbs && (
        <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-xs text-navy-400">
          {crumbs.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              {c.to ? <Link to={c.to} className="hover:text-brand-600">{c.label}</Link> : <span className="text-navy-600">{c.label}</span>}
              {i < crumbs.length - 1 && <ChevronRight size={12} />}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          {eyebrow && <p className="section-title mb-1">{eyebrow}</p>}
          <h1 className="text-2xl md:text-[28px] font-bold tracking-tight">{title}</h1>
          {description && <div className="mt-1.5 text-navy-500 max-w-3xl">{description}</div>}
        </div>
        {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}

export function Card({ children, className = '', as: As = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'section' | 'article' }) {
  return <As className={`card ${className}`}>{children}</As>;
}

export function ProgressBar({ value, color = 'bg-brand-600', className = '', label }: { value: number; color?: string; className?: string; label?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-2 w-full rounded-full bg-navy-100 overflow-hidden ${className}`} role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${v}%` }} />
    </div>
  );
}

export function LevelBadge({ level }: { level: Level }) {
  const cls = level === 'Beginner' ? 'bg-ok-50 text-ok-700' : level === 'Intermediate' ? 'bg-brand-50 text-brand-700' : 'bg-warn-50 text-warn-700';
  return <span className={`chip ${cls}`}>{level}</span>;
}

export function Stat({ label, value, sub, icon }: { label: string; value: ReactNode; sub?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">{label}</p>
        {icon && <span className="text-brand-600">{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-bold text-navy-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-navy-400">{sub}</p>}
    </div>
  );
}

export function BookmarkButton({ itemKey, label = 'Bookmark' }: { itemKey: string; label?: string }) {
  const { isBookmarked, toggleBookmark } = useProgress();
  const on = isBookmarked(itemKey);
  return (
    <button type="button" className={on ? 'btn-secondary border-brand-300 text-brand-700' : 'btn-secondary'} onClick={() => toggleBookmark(itemKey)} aria-pressed={on}>
      {on ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
      {on ? 'Bookmarked' : label}
    </button>
  );
}

export function speak(text: string) {
  try {
    if (!('speechSynthesis' in window)) return false;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

export function SpeakButton({ text, label }: { text: string; label: string }) {
  if (typeof window !== 'undefined' && !('speechSynthesis' in window)) return null;
  return (
    <button type="button" onClick={() => speak(text)} className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-brand-600 hover:bg-brand-50" aria-label={`Listen: ${label}`} title="Listen">
      <Volume2 size={15} />
    </button>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="card p-8 text-center">
      <p className="font-semibold text-navy-800">{title}</p>
      {children && <div className="mt-1 text-sm text-navy-500">{children}</div>}
    </div>
  );
}

export function Callout({ tone = 'info', title, children, icon }: { tone?: 'info' | 'warn' | 'bad' | 'ok' | 'manager'; title?: string; children: ReactNode; icon?: ReactNode }) {
  const map = {
    info: 'bg-brand-50 border-brand-200 text-navy-800',
    warn: 'bg-warn-50 border-warn-100 text-navy-800',
    bad: 'bg-bad-50 border-bad-100 text-navy-800',
    ok: 'bg-ok-50 border-ok-100 text-navy-800',
    manager: 'bg-navy-900 border-navy-900 text-white',
  };
  return (
    <div className={`rounded-xl border p-4 ${map[tone]}`}>
      {title && (
        <p className={`flex items-center gap-2 text-sm font-bold ${tone === 'manager' ? 'text-white' : 'text-navy-900'}`}>
          {icon}
          {title}
        </p>
      )}
      <div className={title ? 'mt-1.5 text-sm leading-relaxed' : 'text-sm leading-relaxed'}>{children}</div>
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="inline-flex flex-wrap gap-1 rounded-lg bg-navy-50 p-1">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)} className={`rounded-md px-3 py-1.5 text-sm font-medium ${value === t.id ? 'bg-white text-navy-900 shadow-card' : 'text-navy-500 hover:text-navy-800'}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function toCsv(columns: string[], rows: string[][]) {
  const esc = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  return '﻿' + [columns, ...rows].map((r) => r.map((c) => esc(c ?? '')).join(',')).join('\r\n');
}

export function toExcelHtml(title: string, columns: string[], rows: string[][]) {
  const esc = (s: string) => (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"><title>${esc(title)}</title></head><body><table border="1"><tr>${columns.map((c) => `<th style="background:#19489a;color:#fff">${esc(c)}</th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table></body></html>`;
}
