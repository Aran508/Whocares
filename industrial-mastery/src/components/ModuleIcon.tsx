import { BadgeCheck, Building2, Factory, FileText, GanttChart, Lightbulb, Recycle, Ruler, SearchCheck, ShieldAlert, TrendingUp, Truck, Wrench } from 'lucide-react';

const MAP = { Building2, Factory, Recycle, BadgeCheck, SearchCheck, Ruler, Wrench, Truck, FileText, Lightbulb, GanttChart, ShieldAlert, TrendingUp };

export default function ModuleIcon({ name, size = 20, className = '' }: { name: string; size?: number; className?: string }) {
  const I = MAP[name as keyof typeof MAP] ?? Factory;
  return <I size={size} className={className} />;
}
