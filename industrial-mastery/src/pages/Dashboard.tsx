import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Line, LineChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRight, Award, BookOpen, Bookmark, CheckCircle2, Clock, GraduationCap, Layers, Target } from 'lucide-react';
import { useProgress, isLessonComplete } from '../lib/progress';
import { useStats } from '../lib/stats';
import { LESSONS, lessonById, ownLessonsOfModule } from '../data/lessons';
import { MODULES, moduleById } from '../data/modules';
import { Card, LevelBadge, PageHeader, ProgressBar, Stat } from '../components/ui';
import { LEVELS } from '../lib/levels';
import { timeAgo } from '../lib/format';
import ModuleIcon from '../components/ModuleIcon';

const DAY = 86400000;

export default function Dashboard() {
  const { state } = useProgress();
  const stats = useStats();

  const weekly = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = now.getTime() - 6 * DAY;
    return Array.from({ length: 7 }, (_, i) => {
      const dayStart = start + i * DAY;
      const ev = state.activity.filter((e) => e.at >= dayStart && e.at < dayStart + DAY);
      return {
        day: new Date(dayStart).toLocaleDateString('en-US', { weekday: 'short' }),
        minutes: Math.round(ev.reduce((a, e) => a + (e.seconds ?? 0), 0) / 60),
        activities: ev.filter((e) => e.kind !== 'lesson').length,
      };
    });
  }, [state.activity]);

  const assessmentTrend = useMemo(
    () => [
      ...Object.entries(state.lessons).filter(([, l]) => l.quiz).map(([id, l]) => ({ at: l.quiz!.at, score: l.quiz!.score, name: lessonById(id)?.title ?? id, kind: 'Lesson quiz' })),
      ...state.assessments.map((a) => ({ at: a.at, score: a.score, name: a.title, kind: 'Assessment' })),
    ]
      .sort((a, b) => a.at - b.at)
      .slice(-15)
      .map((x, i) => ({ ...x, idx: i + 1 })),
    [state],
  );

  const recent = state.history.map((h) => ({ ...h, lesson: lessonById(h.id) })).filter((h) => h.lesson).slice(0, 5);
  const continueLesson = recent.find((h) => !isLessonComplete(state.lessons[h.id], state.settings))?.lesson;
  const recommended = useMemo(() => {
    const mod = state.currentModule ?? 'A';
    const inMod = ownLessonsOfModule(mod).filter((l) => !stats.completed.has(l.id) && l.id !== continueLesson?.id);
    const rest = LESSONS.filter((l) => l.level === 'Beginner' && !stats.completed.has(l.id) && l.moduleId !== mod);
    return [...inMod, ...rest].slice(0, 4);
  }, [state.currentModule, stats.completed, continueLesson]);
  const bookmarks = state.bookmarks.filter((b) => !b.includes(':')).map((id) => lessonById(id)).filter(Boolean).slice(0, 5);

  const firstName = state.settings.learnerName.trim().split(' ')[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Learning dashboard"
        title={firstName ? `Welcome back, ${firstName}` : 'Welcome to Industrial Mastery'}
        description="Your progress across 13 industrial management courses. Every number below is calculated from your own completed lessons, quizzes and assessments."
        actions={
          <Link to={continueLesson ? `/lessons/${continueLesson.id}` : `/lessons/${recommended[0]?.id ?? LESSONS[0].id}`} className="btn-primary">
            {continueLesson ? 'Continue learning' : 'Start learning'} <ArrowRight size={16} />
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <Stat label="Courses" value={stats.totalCourses} icon={<Layers size={18} />} />
        <Stat label="Lessons" value={stats.totalLessons} icon={<BookOpen size={18} />} />
        <Stat label="Completed" value={stats.completedCount} sub={`${stats.overallPct}% of curriculum`} icon={<CheckCircle2 size={18} />} />
        <Stat label="Progress" value={`${stats.overallPct}%`} icon={<Target size={18} />} />
        <Stat label="Learning hours" value={stats.hours.toFixed(1)} sub="time on lesson pages" icon={<Clock size={18} />} />
        <Stat label="Quiz average" value={stats.quizCount ? `${stats.quizAvg}%` : '—'} sub={`${stats.quizCount} lesson quizzes`} icon={<Award size={18} />} />
        <Stat label="Level" value={stats.level.current.level} sub={stats.level.current.name} icon={<GraduationCap size={18} />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="section-title">Current level</p>
              <h2 className="mt-1 text-lg font-bold">Level {stats.level.current.level} — {stats.level.current.name}</h2>
              <p className="text-sm text-navy-500">{stats.level.current.description}</p>
            </div>
            {stats.level.next && (
              <div className="text-right text-sm text-navy-500">
                Next: <span className="font-semibold text-navy-800">{stats.level.next.name}</span>
                <br />
                needs {stats.level.next.minLessons} lessons, {stats.level.next.minAssessments} passed assessments{stats.level.next.requiresComprehensive ? ' and the comprehensive exam' : ''}
              </div>
            )}
          </div>
          <ProgressBar value={stats.level.progressToNext} className="mt-4" color="bg-ok-500" label="Progress to next level" />
          <ol className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-6">
            {LEVELS.map((l) => (
              <li key={l.level} className={`rounded-lg border px-2 py-2 text-center text-[11px] leading-tight ${l.level <= stats.level.current.level ? 'border-ok-100 bg-ok-50 text-ok-700' : 'border-navy-100 text-navy-400'}`}>
                <span className="block text-base font-bold">{l.level}</span>
                {l.name}
              </li>
            ))}
          </ol>
        </Card>
        <Card className="p-5">
          <p className="section-title">Continue learning</p>
          {continueLesson ? (
            <Link to={`/lessons/${continueLesson.id}`} className="mt-2 block rounded-lg border border-navy-100 p-3 hover:border-brand-300">
              <p className="text-xs text-navy-400">{moduleById(continueLesson.moduleId)?.title}</p>
              <p className="font-semibold">{continueLesson.title}</p>
              <p className="mt-1 text-xs text-navy-500">{state.lessons[continueLesson.id]?.studied ? 'Studied — take the knowledge test to complete it' : 'Finish reading, then take the knowledge test'}</p>
            </Link>
          ) : (
            <p className="mt-2 text-sm text-navy-500">No lesson in progress. Pick a recommended lesson below or browse the Learning Academy.</p>
          )}
          <p className="section-title mt-5">Recommended next</p>
          <ul className="mt-2 space-y-1.5">
            {recommended.map((l) => (
              <li key={l.id}>
                <Link to={`/lessons/${l.id}`} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-navy-50">
                  <span className="truncate">{l.title}</span>
                  <LevelBadge level={l.level} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-bold">Weekly learning activity</h2>
          <p className="text-xs text-navy-400">Minutes on lesson pages per day (last 7 days)</p>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4eaf4" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6f84a8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6f84a8' }} axisLine={false} tickLine={false} allowDecimals={false} width={30} />
                <Tooltip cursor={{ fill: '#eef5ff' }} />
                <Bar dataKey="minutes" name="Minutes" fill="#2a6fdb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold">Knowledge assessment performance</h2>
          <p className="text-xs text-navy-400">Your last {assessmentTrend.length || 0} quiz and assessment scores</p>
          <div className="mt-3 h-56">
            {assessmentTrend.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={assessmentTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4eaf4" vertical={false} />
                  <XAxis dataKey="idx" tick={{ fontSize: 12, fill: '#6f84a8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#6f84a8' }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip formatter={(v: number) => `${v}%`} labelFormatter={(_, p) => (p?.[0]?.payload ? `${p[0].payload.kind}: ${p[0].payload.name}` : '')} />
                  <Line type="monotone" dataKey="score" stroke="#1f9d5c" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-sm text-navy-400">Complete a lesson quiz to see your performance trend.</div>
            )}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold">Course completion</h2>
          <p className="text-xs text-navy-400">Completed lessons per course (completion needs reading + passing the quiz)</p>
          <div className="mt-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.perModule.map((m) => ({ name: m.module.short, pct: m.pct, done: m.done, total: m.total }))} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4eaf4" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#6f84a8' }} axisLine={false} tickLine={false} unit="%" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#4c6187' }} width={100} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number, _n, p) => [`${v}% (${p.payload.done}/${p.payload.total})`, 'Completed']} />
                <Bar dataKey="pct" fill="#1f9d5c" radius={[0, 4, 4, 0]} background={{ fill: '#f3f6fb' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold">Learning progress by department</h2>
          <p className="text-xs text-navy-400">Share of each department's lessons you have completed</p>
          <div className="mt-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={stats.byDept.map((d) => ({ dept: d.dept, pct: d.pct }))} outerRadius="72%">
                <PolarGrid stroke="#c9d4e6" />
                <PolarAngleAxis dataKey="dept" tick={{ fontSize: 11, fill: '#4c6187' }} />
                <Radar dataKey="pct" stroke="#2a6fdb" fill="#2a6fdb" fillOpacity={0.3} />
                <Tooltip formatter={(v: number) => `${v}%`} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <h2 className="font-bold">Recently visited</h2>
          {recent.length ? (
            <ul className="mt-3 space-y-2">
              {recent.map((h) => (
                <li key={h.id}>
                  <Link to={`/lessons/${h.id}`} className="flex items-center justify-between gap-2 text-sm hover:text-brand-700">
                    <span className="truncate">{h.lesson!.title}</span>
                    <span className="shrink-0 text-xs text-navy-400">{timeAgo(h.at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-navy-400">Lessons you open will appear here.</p>
          )}
        </Card>
        <Card className="p-5">
          <h2 className="flex items-center gap-2 font-bold"><Bookmark size={16} /> Saved topics</h2>
          {bookmarks.length ? (
            <ul className="mt-3 space-y-2">
              {bookmarks.map((l) => (
                <li key={l!.id}><Link to={`/lessons/${l!.id}`} className="text-sm hover:text-brand-700">{l!.title}</Link></li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-navy-400">Use the bookmark button on any lesson to save it here.</p>
          )}
          <Link to="/bookmarks" className="mt-3 inline-block text-sm font-medium text-brand-600">All bookmarks →</Link>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold">Courses</h2>
          <ul className="mt-3 space-y-2.5">
            {stats.perModule.slice(0, 6).map((m) => (
              <li key={m.module.id}>
                <Link to={`/modules/${m.module.slug}`} className="flex items-center gap-3 text-sm hover:text-brand-700">
                  <ModuleIcon name={m.module.icon} size={16} className="text-brand-600 shrink-0" />
                  <span className="flex-1 truncate">{m.module.title}</span>
                  <span className="text-xs text-navy-400">{m.done}/{m.total}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/academy" className="mt-3 inline-block text-sm font-medium text-brand-600">All {MODULES.length} courses →</Link>
        </Card>
      </div>
    </div>
  );
}
