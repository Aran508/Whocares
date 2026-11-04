import type { ModuleMeta } from '../types';

export const MODULES: ModuleMeta[] = [
  {
    id: 'A', slug: 'fundamentals', title: 'Fundamentals of Industrial Management', short: 'Fundamentals',
    department: 'Management', icon: 'Building2',
    description: 'How a factory is organised, who decides what, and how an experienced plant head runs the whole site through KPIs, daily management and accountability.',
    outcome: 'Understand the structure of a manufacturing plant and the management system that keeps it running.',
  },
  {
    id: 'B', slug: 'production', title: 'Production Management', short: 'Production',
    department: 'Production', icon: 'Factory',
    description: 'Planning, scheduling and controlling output: capacity, takt and cycle time, OEE, line balancing, bottlenecks, MRP and daily production monitoring.',
    outcome: 'Plan and control a production line using correct time definitions and loss analysis.',
    crossListed: ['smed', 'heijunka', 'just-in-time'],
  },
  {
    id: 'C', slug: 'lean', title: 'Lean Manufacturing', short: 'Lean',
    department: 'Lean / CI', icon: 'Recycle',
    description: 'The Toyota Production System and its tools: 5S, Kaizen, Kanban, Jidoka, VSM, the 8 wastes (TIMWOODS), pull systems and lean implementation strategy.',
    outcome: 'See waste, design flow and pull, and lead lean improvement on the shop floor.',
  },
  {
    id: 'D', slug: 'quality', title: 'Quality Management', short: 'Quality',
    department: 'Quality', icon: 'BadgeCheck',
    description: 'From inspection to prevention: IQC/IPQC/FQC, SPC, Cp/Cpk, MSA, FMEA, control plans, CAPA, 8D, cost of quality, ISO 9001 and zero defects.',
    outcome: 'Measure, control and improve quality using statistical and systematic methods.',
  },
  {
    id: 'E', slug: 'problem-solving', title: 'Industrial Problem Solving', short: 'Problem Solving',
    department: 'Quality', icon: 'SearchCheck',
    description: 'Structured root-cause methods — 5 Why, Fishbone, 8D, A3, PDCA, FTA — with realistic investigations and the difference between symptoms, causes and countermeasures.',
    outcome: 'Investigate any shop-floor problem to its true root cause and prevent recurrence.',
    crossListed: ['dmaic', 'pareto-analysis', '8d-problem-solving', 'capa', 'lessons-learned', 'risk-assessment'],
  },
  {
    id: 'F', slug: 'industrial-engineering', title: 'Industrial Engineering', short: 'Industrial Engg.',
    department: 'Industrial Engineering', icon: 'Ruler',
    description: 'Method study, work measurement, ergonomics, plant layout, material handling, Yamazumi, spaghetti diagrams, process charts and value engineering.',
    outcome: 'Design efficient work methods, layouts and balanced lines.',
    crossListed: ['sop', 'work-instruction', 'operation-process-chart'],
  },
  {
    id: 'G', slug: 'maintenance', title: 'Maintenance Management', short: 'Maintenance',
    department: 'Maintenance', icon: 'Wrench',
    description: 'Breakdown to predictive maintenance, TPM, MTBF/MTTR, availability, spare parts, lubrication and maintenance cost control on CNCs, presses, welders, compressors and pumps.',
    outcome: 'Run a maintenance system that maximises reliability at the right cost.',
  },
  {
    id: 'H', slug: 'supply-chain', title: 'Supply Chain & Material Management', short: 'Supply Chain',
    department: 'Supply Chain', icon: 'Truck',
    description: 'Procurement, supplier performance, inventory classification (ABC/FSN/VED), EOQ, safety stock, reorder point, warehousing, traceability and reconciliation.',
    outcome: 'Keep the right material, in the right quantity, at the right place, at the lowest total cost.',
  },
  {
    id: 'I', slug: 'documentation', title: 'Engineering Documentation', short: 'Documentation',
    department: 'Engineering', icon: 'FileText',
    description: 'SOPs, work instructions, process sheets, WPS/PQR/WQR, ECR/ECN, revision control, BOM and routing, traceability and the full document lifecycle.',
    outcome: 'Create, control and audit engineering documents that the shop floor can trust.',
    crossListed: ['control-plan'],
  },
  {
    id: 'J', slug: 'npd', title: 'NPD — New Product Development', short: 'NPD',
    department: 'Engineering', icon: 'Lightbulb',
    description: 'APQP, stage-gate, prototypes, validation, design review, pilot production and handover — followed through a hydraulic cylinder development project.',
    outcome: 'Take a new product from concept to stable serial production.',
    crossListed: ['first-article-inspection'],
  },
  {
    id: 'K', slug: 'project-management', title: 'Project Management', short: 'Projects',
    department: 'Management', icon: 'GanttChart',
    description: 'Charter, scope, WBS, Gantt, CPM/PERT, RACI, risk register, cost control, monitoring, closure, Agile and Waterfall for industrial projects.',
    outcome: 'Deliver plant projects on time, on budget and to scope.',
  },
  {
    id: 'L', slug: 'safety', title: 'Industrial Safety', short: 'Safety',
    department: 'Safety', icon: 'ShieldAlert',
    description: 'Hazard identification, HIRA, JSA, hierarchy of controls, LOTO, machine guarding, welding/electrical/chemical/fire safety, permits and incident investigation.',
    outcome: 'Identify and control hazards so that every person goes home safe.',
  },
  {
    id: 'M', slug: 'advanced', title: 'Advanced Industrial Management', short: 'Advanced Mgmt.',
    department: 'Management', icon: 'TrendingUp',
    description: 'Hoshin Kanri, balanced scorecard, operational excellence, ROI and TCO, change management, leadership and plant-level strategic management.',
    outcome: 'Set direction for a plant and align every department to it.',
  },
];

export const moduleById = (id: string) => MODULES.find((m) => m.id === id);
export const moduleBySlug = (slug: string) => MODULES.find((m) => m.slug === slug || m.id === slug);

export const DEPARTMENTS = Array.from(new Set(MODULES.map((m) => m.department)));
