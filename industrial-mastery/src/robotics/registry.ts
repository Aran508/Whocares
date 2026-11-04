export interface RobotLab { id: string; title: string; description: string; learn: string[] }

export const ROBOT_LABS: RobotLab[] = [
  { id: 'arm', title: 'Environment 1 — Articulated robot arm & pick-and-place', description: 'Jog a robot arm joint by joint, see forward and inverse kinematics live, then program a pick-and-place cycle on a teach pendant and measure its cycle time.', learn: ['Joints, TCP and workspace', 'Forward & inverse kinematics', 'Teach-pendant programming', 'Cycle time of point-to-point moves'] },
  { id: 'welding', title: 'Environment 2 — Robotic welding cell', description: 'Program the seams of a hydraulic cylinder, set welding parameters against the WPS, complete the safety checks and run the cell. See heat input, weld defects and cycle time vs takt.', learn: ['WPS parameters & heat input', 'Weld defects and their causes', 'Cell safety interlocks', 'Arc-on ratio and takt'] },
  { id: 'logistics', title: 'Environment 3 — Mobile robots & cobot palletising', description: 'Compare an AGV on a fixed guide path with an AMR that plans its own route around obstacles, then set up a collaborative robot palletising cylinder cartons.', learn: ['AGV vs AMR navigation', 'Path planning (A*)', 'Cobot speed & separation', 'Pallet patterns and throughput'] },
];

export interface RobotType { name: string; axes: string; payload: string; reach: string; uses: string; pros: string; cons: string; draw: string }

export const ROBOT_TYPES: RobotType[] = [
  { name: 'Articulated (6-axis)', axes: '6 rotary joints', payload: '3–1,300 kg', reach: '0.5–3.5 m', uses: 'Welding, machine tending, painting, handling heavy cylinders', pros: 'Very flexible, large workspace, any orientation', cons: 'Complex programming, needs guarding, higher cost', draw: 'articulated' },
  { name: 'SCARA', axes: '3 rotary + 1 vertical (4 axes)', payload: '1–20 kg', reach: '0.2–1.2 m', uses: 'Fast assembly, O-ring insertion, screw driving', pros: 'Very fast and rigid in the horizontal plane', cons: 'Limited vertical motion and tilt', draw: 'scara' },
  { name: 'Delta (parallel)', axes: '3–4 axes, parallel arms', payload: '0.5–15 kg', reach: '0.4–1.6 m dia.', uses: 'High-speed picking of small fittings from conveyors', pros: 'Extremely fast (100+ picks/min)', cons: 'Small payload and workspace', draw: 'delta' },
  { name: 'Cartesian / gantry', axes: '3 linear axes (X-Y-Z)', payload: '5–5,000 kg', reach: 'Up to tens of metres', uses: 'Loading long tubes, CNC loading, palletising heavy loads', pros: 'Simple, accurate, scalable to large areas', cons: 'Large footprint, limited orientation', draw: 'gantry' },
  { name: 'Collaborative (cobot)', axes: '6–7 rotary joints with force sensing', payload: '3–35 kg', reach: '0.5–1.7 m', uses: 'Palletising, screw-driving, inspection next to people', pros: 'Works near people, quick to redeploy', cons: 'Slower; risk assessment still required', draw: 'cobot' },
  { name: 'AGV', axes: 'Mobile, fixed guidance', payload: '100–60,000 kg', reach: 'Plant-wide routes', uses: 'Moving tubes and pallets on fixed routes', pros: 'Predictable, proven, lower cost', cons: 'Stops at obstacles; route changes need re-taping', draw: 'agv' },
  { name: 'AMR', axes: 'Mobile, autonomous navigation', payload: '50–1,500 kg', reach: 'Plant-wide, dynamic', uses: 'Line-side delivery of kits in changing layouts', pros: 'Re-routes around obstacles, flexible', cons: 'Higher cost, needs maps and Wi-Fi', draw: 'amr' },
  { name: 'Painting robot', axes: '6–7 axes, explosion-proof', payload: '5–15 kg', reach: '1.5–3 m', uses: 'Spray painting cylinders with consistent film thickness', pros: 'Consistent DFT, less overspray, removes people from solvent', cons: 'Explosion-proof design is costly', draw: 'articulated' },
];
