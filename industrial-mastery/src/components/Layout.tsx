import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  BadgeCheck, Bookmark, Bot, BookOpen, Briefcase, Building2, Calculator, ClipboardCheck, Factory, FileSpreadsheet, FileText, FlaskConical, GanttChart, LayoutDashboard, Lightbulb, LineChart, Menu, Recycle, Ruler, Search, SearchCheck, Settings, ShieldAlert, SpellCheck, TrendingUp, Truck, Wrench, X,
} from 'lucide-react';
import { useStats } from '../lib/stats';

const NAV: { to: string; label: string; icon: ReactNode; group?: string }[] = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/academy', label: 'Learning Academy', icon: <BookOpen size={18} /> },
  { to: '/modules/fundamentals', label: 'Fundamentals', icon: <Building2 size={18} />, group: 'Courses' },
  { to: '/modules/production', label: 'Production Management', icon: <Factory size={18} />, group: 'Courses' },
  { to: '/modules/quality', label: 'Quality Management', icon: <BadgeCheck size={18} />, group: 'Courses' },
  { to: '/modules/lean', label: 'Lean Manufacturing', icon: <Recycle size={18} />, group: 'Courses' },
  { to: '/modules/industrial-engineering', label: 'Industrial Engineering', icon: <Ruler size={18} />, group: 'Courses' },
  { to: '/modules/problem-solving', label: 'Problem Solving', icon: <SearchCheck size={18} />, group: 'Courses' },
  { to: '/modules/maintenance', label: 'Maintenance Management', icon: <Wrench size={18} />, group: 'Courses' },
  { to: '/modules/supply-chain', label: 'Supply Chain Management', icon: <Truck size={18} />, group: 'Courses' },
  { to: '/modules/documentation', label: 'Engineering Documentation', icon: <FileText size={18} />, group: 'Courses' },
  { to: '/modules/npd', label: 'NPD Management', icon: <Lightbulb size={18} />, group: 'Courses' },
  { to: '/modules/project-management', label: 'Project Management', icon: <GanttChart size={18} />, group: 'Courses' },
  { to: '/modules/safety', label: 'Industrial Safety', icon: <ShieldAlert size={18} />, group: 'Courses' },
  { to: '/modules/advanced', label: 'Advanced Management', icon: <TrendingUp size={18} />, group: 'Courses' },
  { to: '/cases', label: 'Practical Case Studies', icon: <Briefcase size={18} />, group: 'Practice' },
  { to: '/simulations', label: 'Simulation Lab', icon: <FlaskConical size={18} />, group: 'Practice' },
  { to: '/robotics', label: 'Robotics Lab', icon: <Bot size={18} />, group: 'Practice' },
  { to: '/calculators', label: 'Industrial Calculators', icon: <Calculator size={18} />, group: 'Practice' },
  { to: '/templates', label: 'Templates & Downloads', icon: <FileSpreadsheet size={18} />, group: 'Resources' },
  { to: '/glossary', label: 'Glossary & Pronunciation', icon: <SpellCheck size={18} />, group: 'Resources' },
  { to: '/assessments', label: 'Assessments', icon: <ClipboardCheck size={18} />, group: 'Resources' },
  { to: '/progress', label: 'My Learning Progress', icon: <LineChart size={18} />, group: 'Resources' },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  let lastGroup: string | undefined;
  return (
    <nav aria-label="Main" className="flex h-full flex-col">
      <Link to="/" onClick={onNavigate} className="flex items-center gap-2.5 px-5 py-5 border-b border-navy-800">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600">
          <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden><path d="M6 24V13l5 3v-3l5 3v-3l5 3V8h4v16z" fill="#fff" /></svg>
        </span>
        <span className="leading-tight">
          <span className="block text-[15px] font-bold tracking-wide text-white">INDUSTRIAL MASTERY</span>
          <span className="block text-[11px] text-navy-300">Management & Engineering Academy</span>
        </span>
      </Link>
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {NAV.map((n) => {
          const header = n.group && n.group !== lastGroup ? n.group : null;
          lastGroup = n.group ?? lastGroup;
          return (
            <div key={n.to}>
              {header && <p className="mt-4 mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-navy-400">{header}</p>}
              <NavLink
                to={n.to}
                end={n.to === '/'}
                onClick={onNavigate}
                className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors ${isActive ? 'bg-brand-600 text-white' : 'text-navy-200 hover:bg-navy-800 hover:text-white'}`}
              >
                {n.icon}
                <span className="truncate">{n.label}</span>
              </NavLink>
            </div>
          );
        })}
      </div>
      <p className="px-5 py-3 text-[11px] text-navy-400 border-t border-navy-800">Progress is saved in this browser.</p>
    </nav>
  );
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  const stats = useStats();
  const nav = useNavigate();
  const loc = useLocation();
  const [q, setQ] = useState('');
  useEffect(() => {
    if (loc.pathname === '/search') setQ(new URLSearchParams(loc.search).get('q') ?? '');
  }, [loc]);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    nav(`/search?q=${encodeURIComponent(q.trim())}`);
  };
  return (
    <header className="sticky top-0 z-30 border-b border-navy-100 bg-white/95 backdrop-blur no-print">
      <div className="flex items-center gap-3 px-4 py-2.5 md:px-6">
        <button className="btn-ghost lg:hidden -ml-2 px-2" onClick={onMenu} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <form onSubmit={submit} className="relative flex-1 max-w-xl" role="search">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
          <input value={q} onChange={(e) => setQ(e.target.value)} className="input pl-9 bg-navy-50/60 border-transparent focus:bg-white" placeholder="Search lessons, glossary, calculators, templates…" aria-label="Search all topics" />
        </form>
        <div className="hidden md:flex items-center gap-3 pl-2">
          <Link to="/progress" className="text-right leading-tight" title="Current learning level">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-navy-400">Level {stats.level.current.level}</span>
            <span className="block text-xs font-semibold text-navy-800">{stats.level.current.name}</span>
          </Link>
          <div className="w-28" title={`${stats.completedCount} of ${stats.totalLessons} lessons completed`}>
            <div className="flex justify-between text-[11px] text-navy-400"><span>Progress</span><span>{stats.overallPct}%</span></div>
            <div className="mt-1 h-1.5 rounded-full bg-navy-100"><div className="h-full rounded-full bg-ok-500" style={{ width: `${Math.max(stats.overallPct, stats.completedCount ? 2 : 0)}%` }} /></div>
          </div>
        </div>
        <NavLink to="/bookmarks" className={({ isActive }) => `btn-ghost px-2 ${isActive ? 'text-brand-600' : ''}`} aria-label="Bookmarks" title="Bookmarks">
          <Bookmark size={19} />
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `btn-ghost px-2 ${isActive ? 'text-brand-600' : ''}`} aria-label="Settings" title="Settings">
          <Settings size={19} />
        </NavLink>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc.pathname]);
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-navy-900 lg:block no-print">
        <Sidebar />
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden no-print">
          <div className="absolute inset-0 bg-navy-900/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-navy-900 shadow-lift">
            <button className="absolute right-3 top-4 text-navy-300 hover:text-white" onClick={() => setOpen(false)} aria-label="Close menu">
              <X size={20} />
            </button>
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
      <div className="lg:pl-64">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="mx-auto max-w-[1280px] px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>
    </div>
  );
}
