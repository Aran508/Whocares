import { useEffect, type ComponentType } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ROBOT_LABS } from '../robotics/registry';
import ArmLab from '../robotics/ArmLab';
import WeldingCellLab from '../robotics/WeldingCellLab';
import LogisticsLab from '../robotics/LogisticsLab';
import { PageHeader } from '../components/ui';
import { useProgress } from '../lib/progress';
import NotFound from './NotFound';

const COMPONENTS: Record<string, ComponentType> = { arm: ArmLab, welding: WeldingCellLab, logistics: LogisticsLab };

export default function RoboticsDetail() {
  const { id = '' } = useParams();
  const lab = ROBOT_LABS.find((l) => l.id === id);
  const { log } = useProgress();
  useEffect(() => {
    if (lab) log({ kind: 'simulation', ref: `robot-${lab.id}`, label: lab.title });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lab?.id]);
  if (!lab) return <NotFound />;
  const Comp = COMPONENTS[lab.id];
  const idx = ROBOT_LABS.indexOf(lab);
  const next = ROBOT_LABS[idx + 1];
  return (
    <div>
      <PageHeader crumbs={[{ to: '/robotics', label: 'Robotics lab' }, { label: lab.title }]} eyebrow="Robotics lab" title={lab.title} description={lab.description} />
      <Comp />
      {next && <div className="mt-6"><Link to={`/robotics/${next.id}`} className="btn-secondary">Next: {next.title}</Link></div>}
    </div>
  );
}
