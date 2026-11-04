export interface SimMeta {
  id: string;
  title: string;
  department: string;
  description: string;
  learn: string[];
  lessonIds: string[];
}

export const SIMULATIONS: SimMeta[] = [
  { id: 'line-balancing', title: 'Production line balancing', department: 'Production', description: 'Five stations — cutting, facing, chamfering, welding, assembly. Change operation times and operators; see the bottleneck, throughput, line efficiency and idle time update instantly.', learn: ['Bottleneck sets output', 'Line efficiency and balance loss', 'Takt vs cycle time'], lessonIds: ['line-balancing', 'bottleneck-analysis', 'takt-time'] },
  { id: 'oee', title: 'OEE improvement', department: 'Production', description: 'Adjust planned time, downtime, ideal cycle time, output and rejects. See availability, performance, quality and OEE, and test improvement scenarios.', learn: ['Six big losses', 'Which OEE factor to attack first', 'Hidden capacity'], lessonIds: ['oee', 'downtime-analysis'] },
  { id: 'inventory', title: 'Inventory management', department: 'Supply Chain', description: 'Simulate 60 days of seal-kit consumption with variable demand, supplier lead time, reorder point and order quantity. Watch shortages and excess stock.', learn: ['Reorder point and safety stock', 'Service level vs inventory', 'Lead-time effect'], lessonIds: ['reorder-point', 'safety-stock', 'eoq'] },
  { id: 'defect-investigation', title: 'Quality defect investigation', department: 'Quality', description: 'Investigate rising leak-test failures: select causes into a fishbone, collect evidence, run a 5 Why, state the root cause and choose actions — with feedback.', learn: ['Fishbone and 5 Why', 'Evidence before conclusions', 'Effective vs weak actions'], lessonIds: ['root-cause-analysis-rca', '5-why-analysis', 'fishbone-diagram'] },
  { id: 'lean-factory', title: 'Lean factory improvement', department: 'Lean / CI', description: 'A cylinder plant with excess movement, waiting, WIP and a poor layout. Spend a limited budget on lean improvements and see the before/after results.', learn: ['Which tool removes which waste', 'Layout and WIP effect on lead time', 'Prioritising with a budget'], lessonIds: ['waste-elimination', 'cellular-manufacturing', 'kanban'] },
  { id: 'daily-production', title: 'Daily production management', department: 'Production', description: 'Run an 8-hour shift as production manager. Each hour brings an event — shortage, breakdown, quality failure, absence. Decide; see planned vs actual, losses and feedback.', learn: ['Escalation and containment', 'Hourly monitoring', 'Manager decision-making'], lessonIds: ['daily-production-monitoring', 'escalation-and-accountability', 'shop-floor-management'] },
];

export const simById = (id: string) => SIMULATIONS.find((s) => s.id === id);
