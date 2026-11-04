import { useEffect, type ComponentType } from 'react';
import { Link, useParams } from 'react-router-dom';
import { simById } from '../simulations/registry';
import { lessonById } from '../data/lessons';
import { PageHeader } from '../components/ui';
import { useProgress } from '../lib/progress';
import LineBalancingSim from '../simulations/LineBalancingSim';
import OeeSim from '../simulations/OeeSim';
import InventorySim from '../simulations/InventorySim';
import DefectInvestigationSim from '../simulations/DefectInvestigationSim';
import LeanFactorySim from '../simulations/LeanFactorySim';
import DailyProductionSim from '../simulations/DailyProductionSim';
import NotFound from './NotFound';

const COMPONENTS: Record<string, ComponentType> = {
  'line-balancing': LineBalancingSim,
  oee: OeeSim,
  inventory: InventorySim,
  'defect-investigation': DefectInvestigationSim,
  'lean-factory': LeanFactorySim,
  'daily-production': DailyProductionSim,
};

export default function SimulationDetail() {
  const { id = '' } = useParams();
  const s = simById(id);
  const { log } = useProgress();
  useEffect(() => {
    if (s) log({ kind: 'simulation', ref: s.id, label: s.title });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s?.id]);
  if (!s || !COMPONENTS[s.id]) return <NotFound />;
  const Comp = COMPONENTS[s.id];
  return (
    <div>
      <PageHeader crumbs={[{ to: '/simulations', label: 'Simulation lab' }, { label: s.title }]} eyebrow={`Simulation · ${s.department}`} title={s.title} description={s.description} />
      <Comp />
      <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-navy-500">Related lessons:</span>
        {s.lessonIds.map((id) => { const l = lessonById(id); return l ? <Link key={id} to={`/lessons/${id}`} className="chip border border-brand-200 bg-white px-3 py-1 text-brand-700">{l.title}</Link> : null; })}
      </div>
    </div>
  );
}
