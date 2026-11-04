import type { GlossaryTerm } from '../types';
import { LESSONS } from './lessons';
import { moduleById } from './modules';

// [term, full form, pronunciation, meaning, department, example, related (;-separated)]
type Row = [string, string, string, string, string, string, string];

const ROWS: Row[] = [
  ['Heijunka', 'Production levelling', 'Hay-jun-kah', 'Levelling the volume and mix of production over time so the workload is even.', 'Lean / CI', 'Making 63, 80 and 100 mm cylinders every day in a repeating pattern instead of one size per day.', 'Kanban;Mura;SMED'],
  ['Hoshin Kanri', 'Policy deployment', 'Hoh-shin Kahn-ree', 'Strategic planning that aligns everyone to a few breakthrough objectives.', 'Management', 'A plant goal "lead time −50%" cascaded into SMED, cells and Kanban projects.', 'Balanced Scorecard;Catchball;X-matrix'],
  ['Gemba', 'The actual place', 'Gem-bah', 'The place where value is created — the shop floor.', 'Lean / CI', 'Going to the welding cell to see the problem rather than reading a report.', 'Gemba Walk;Genchi Genbutsu'],
  ['Genchi Genbutsu', 'Go and see the actual thing', 'Gen-chee Gen-boo-tsoo', 'Go to the source to observe facts directly before deciding.', 'Lean / CI', 'Inspecting the failed seal and the installation tool yourself.', 'Gemba;Root Cause Analysis (RCA)'],
  ['Jidoka', 'Automation with a human touch', 'Jee-doh-kah', 'Stopping a process automatically when an abnormality occurs so defects are not passed on.', 'Lean / CI', 'Leak-test bench locks a failed cylinder in a red cage.', 'Andon;Poka-Yoke'],
  ['Muda', 'Waste', 'Moo-dah', 'Any activity that consumes resources without adding value.', 'Lean / CI', 'Moving tubes 300 m between buildings.', 'TIMWOODS;Mura;Muri'],
  ['Mura', 'Unevenness', 'Moo-rah', 'Variation or unevenness in workload or flow.', 'Lean / CI', 'Paint shop receiving 60 cylinders on Friday and 10 on Monday.', 'Heijunka;Muda;Muri'],
  ['Muri', 'Overburden', 'Moo-ree', 'Overloading people or machines beyond reasonable limits.', 'Lean / CI', 'Fitters lifting 45 kg tubes by hand.', 'Ergonomics;Muda;Mura'],
  ['Poka-Yoke', 'Mistake-proofing', 'Poh-kah Yoh-keh', 'A device or method that prevents or immediately detects an error.', 'Quality', 'A fixture that only accepts the correct piston diameter.', 'Jidoka;Zero Defect Philosophy'],
  ['Kaizen', 'Change for the better', 'Kye-zen', 'Continuous, small improvements by everyone.', 'Lean / CI', 'A welder adds a stop block to the fixture.', 'PDCA Cycle;Continuous Improvement'],
  ['Ishikawa', 'Cause-and-effect diagram', 'Ee-shee-kah-wah', 'Fishbone diagram that groups possible causes into categories (6M).', 'Quality', 'Fishbone of leak causes: Man, Machine, Method, Material, Measurement, Environment.', 'Fishbone Diagram;5 Why Analysis'],
  ['FMEA', 'Failure Mode and Effects Analysis', 'F-M-E-A (fee-mee-ah)', 'Structured risk analysis of how things can fail, how bad, how likely and how detectable.', 'Quality', 'Welding PFMEA identifies lack of fusion with RPN 216.', 'PFMEA;DFMEA;Control Plan'],
  ['Metrology', '', 'Meh-trol-uh-jee', 'The science of measurement, including instruments, standards and uncertainty.', 'Quality', 'The metrology lab calibrates bore gauges against setting rings.', 'Calibration Management;MSA'],
  ['Ergonomics', '', 'Er-guh-nom-iks', 'Designing work to fit the human body and its capabilities.', 'Industrial Engineering', 'Adjustable-height assembly benches.', 'Human Factors Engineering;Muri'],
  ['Interoperability', '', 'In-ter-op-er-uh-bil-ih-tee', 'The ability of different systems or machines to exchange and use information.', 'Engineering', 'A test bench sending results directly to the ERP and traceability system via OPC UA.', 'Industry 4.0;Traceability'],
  ['Traceability', '', 'Tray-suh-bil-ih-tee', 'The ability to trace the history, location and use of a product or material.', 'Quality', 'Serial number linked to tube heat number, welder ID and test record.', 'Material Traceability;Traceability Records'],
  ['Standardization', '', 'Stan-der-dye-zay-shun', 'Establishing and following a common best method or specification.', 'Lean / CI', 'All assembly benches use the same seal-fitting method and tools.', 'Standardized Work;SOP'],
  ['Optimization', '', 'Op-tih-my-zay-shun', 'Finding the best solution under given constraints.', 'Industrial Engineering', 'Choosing the product mix that maximises profit per honing hour.', 'Resource Optimization'],
  ['Synchronization', '', 'Sin-kruh-nye-zay-shun', 'Making processes operate at the same pace or timing.', 'Production', 'All stations working to the same takt time.', 'Takt Time;Line Balancing'],
  ['Reconciliation', '', 'Rek-un-sil-ee-ay-shun', 'Comparing two sets of records to make sure they agree and explaining differences.', 'Supply Chain', 'Material issued vs consumed + scrap + returned.', 'Material Reconciliation;Stock Accuracy'],
  ['Reliability', '', 'Ree-lye-uh-bil-ih-tee', 'Probability that equipment performs without failure for a given time.', 'Maintenance', 'A robot with MTBF 400 h has 98% probability of running an 8-hour shift without failure.', 'MTBF;Equipment Reliability'],
  ['Capability', '', 'Kay-puh-bil-ih-tee', 'The ability of a process to produce within specification (Cp, Cpk).', 'Quality', 'Bore honing Cpk 1.4.', 'Cp and Cpk;Process Capability'],
  ['Variability', '', 'Vair-ee-uh-bil-ih-tee', 'How much a process output differs from part to part.', 'Quality', 'Bore diameters ranging from 80.010 to 80.040 mm.', 'Six Sigma;Statistical Process Control (SPC)'],
  ['Productivity', '', 'Proh-duk-tiv-ih-tee', 'Output per unit of input.', 'Production', '0.22 cylinders per labour hour.', 'Labour Productivity;Machine Productivity'],
  ['Accountability', '', 'Uh-kown-tuh-bil-ih-tee', 'Being answerable for the result of a task or decision.', 'Management', 'One named owner per CAPA action.', 'RACI Matrix;Escalation and Accountability'],
  ['Operational Excellence', 'OpEx', 'Op-er-ay-shun-ul Ek-suh-lens', 'A state where everyone sees and improves the flow of value every day.', 'Management', 'Daily management, problem solving and standard work across the plant.', 'Lean Manufacturing Principles;Continuous Improvement'],
  ['Andon', 'Signal lamp', 'An-don', 'Visual/audible signal to call for help when a problem occurs.', 'Lean / CI', 'Button at the test bench pages the quality engineer.', 'Jidoka;Escalation'],
  ['Kanban', 'Signal card', 'Kahn-bahn', 'A signal that authorises production or movement of a quantity of parts.', 'Lean / CI', 'Seal-kit bin card sent to stores for refill.', 'Pull System;Supermarket System'],
  ['Takt', 'Beat / rhythm (German)', 'Tahkt', 'The pace of production required by customer demand.', 'Production', 'Takt 22.5 min per cylinder.', 'Takt Time;Cycle Time'],
  ['Yamazumi', 'Stack-up chart', 'Yah-mah-zoo-mee', 'Stacked bar chart of work content per station.', 'Industrial Engineering', 'Yamazumi shows the test station above takt.', 'Line Balancing'],
  ['Jishu Hozen', 'Autonomous maintenance', 'Jee-shoo Hoh-zen', 'Operators performing basic maintenance of their own equipment.', 'Maintenance', 'Welding operators clean torches and check gas flow daily.', 'TPM;Autonomous Maintenance'],
  ['Kobetsu Kaizen', 'Focused improvement', 'Koh-bet-soo Kye-zen', 'TPM pillar where teams eliminate specific major losses.', 'Maintenance', 'Team reduces honing stone-change losses.', 'TPM;OEE'],
  ['Hansei', 'Self-reflection', 'Hahn-say', 'Honest reflection on what went wrong to improve.', 'Management', 'Annual Hoshin reflection meeting.', 'Hoshin Kanri;Lessons Learned'],
  ['Nemawashi', 'Laying the groundwork', 'Neh-mah-wah-shee', 'Informally discussing a proposal with stakeholders to build consensus before a decision.', 'Management', 'Discussing a relayout with supervisors before the formal meeting.', 'Change Management;Stakeholder Management'],
  ['Yokoten', 'Horizontal deployment', 'Yoh-koh-ten', 'Copying a proven improvement or lesson to similar processes.', 'Lean / CI', 'Applying the seal sleeve fix to all cylinder families.', 'Preventive Action;Lessons Learned'],
  ['Hanedashi', 'Auto-eject', 'Hah-neh-dah-shee', 'Machine automatically unloads the part so the operator only loads.', 'Lean / CI', 'Lathe ejects the piston after machining.', 'Cellular Manufacturing'],
  ['Chaku-Chaku', 'Load-load', 'Chah-koo Chah-koo', 'A cell where the operator just loads parts from machine to machine.', 'Lean / CI', 'Rod cell operator walks and loads each machine.', 'Cellular Manufacturing;One-Piece Flow'],
  ['Mizusumashi', 'Water spider', 'Mee-zoo-soo-mah-shee', 'A material handler who replenishes lines on a fixed route.', 'Lean / CI', 'Tugger driver delivering seal kits every hour.', 'Milk Run'],
  ['Shitsuke', 'Sustain', 'Shit-soo-keh', 'The fifth S: making 5S a habit.', 'Lean / CI', 'Weekly 5S audit and recognition.', '5S Methodology'],
  ['Seiri', 'Sort', 'Say-ree', 'The first S: remove unneeded items.', 'Lean / CI', 'Red-tagging unused fixtures.', '5S Methodology'],
  ['Seiton', 'Set in order', 'Say-ton', 'The second S: a place for everything.', 'Lean / CI', 'Shadow board for spanners.', '5S Methodology'],
  ['Seiso', 'Shine', 'Say-soh', 'The third S: clean and inspect.', 'Lean / CI', 'Cleaning the test bench reveals a small leak.', '5S Methodology'],
  ['Seiketsu', 'Standardise', 'Say-ket-soo', 'The fourth S: standards to maintain the first three S.', 'Lean / CI', 'Photo standard of the organised bench.', '5S Methodology'],
  ['Obeya', 'Big room', 'Oh-bay-yah', 'A war room with visual project information for fast decisions.', 'Engineering', 'NPD obeya with Kanban and issue boards.', 'NPD Kanban'],
  ['Catchball', '', 'Katch-bawl', 'Two-way negotiation of targets between management levels in Hoshin Kanri.', 'Management', 'Department heads discussing feasibility of lead-time targets.', 'Hoshin Kanri'],
  ['X-Matrix', '', 'Eks may-triks', 'One-page Hoshin chart linking objectives, priorities, KPIs and owners.', 'Management', 'Plant X-matrix with 3 breakthrough objectives.', 'Hoshin Kanri'],
  ['TIMWOODS', 'Transportation, Inventory, Motion, Waiting, Overproduction, Overprocessing, Defects, Skills', 'Tim-woods', 'Memory aid for the 8 wastes.', 'Lean / CI', 'Waste walk checklist.', 'Waste Elimination;Muda'],
  ['DOE', 'Design of Experiments', 'D-O-E', 'Statistical method of changing several factors in planned trials to find their effects.', 'Quality', 'DOE on spray distance and pressure to reduce paint runs.', 'Six Sigma'],
  ['ANOVA', 'Analysis of Variance', 'Uh-noh-vah', 'Statistical test comparing means of several groups.', 'Quality', 'ANOVA Gauge R&R.', 'Gauge R&R'],
  ['AQL', 'Acceptance Quality Limit', 'A-Q-L', 'Worst tolerable defect level in sampling inspection.', 'Quality', 'AQL 0.65 for major defects.', 'Incoming Quality Control (IQC)'],
  ['PPAP', 'Production Part Approval Process', 'Pee-pap', 'Customer approval package proving the supplier process can produce conforming parts.', 'Quality', 'PPAP with capability, MSA and control plan for the boom cylinder.', 'APQP'],
  ['SIPOC', 'Suppliers, Inputs, Process, Outputs, Customers', 'Sye-pok', 'High-level process map used in Define phase.', 'Quality', 'SIPOC for leak testing.', 'DMAIC'],
  ['CTQ', 'Critical to Quality', 'C-T-Q', 'A measurable characteristic important to the customer.', 'Quality', 'Bore finish Ra ≤ 0.4 µm.', 'Six Sigma'],
  ['DPMO', 'Defects Per Million Opportunities', 'D-P-M-O', 'Defect rate normalised by opportunities.', 'Quality', '3.4 DPMO = six sigma.', 'Six Sigma'],
  ['RTY', 'Rolled Throughput Yield', 'R-T-Y', 'Probability of passing all process steps first time.', 'Quality', '98% × 95% × 97% = 90.3%.', 'First Pass Yield'],
  ['FPY', 'First Pass Yield', 'F-P-Y', 'Share of units passing a step without rework.', 'Quality', 'Leak-test FPY 97%.', 'Rejection Analysis'],
  ['MRB', 'Material Review Board', 'M-R-B', 'Team that decides disposition of non-conforming material.', 'Quality', 'MRB decides rework of under-thickness paint.', 'Non-Conformance Report (NCR)'],
  ['RPN', 'Risk Priority Number', 'R-P-N', 'Severity × Occurrence × Detection in FMEA.', 'Quality', 'RPN 216 for lack of fusion.', 'FMEA'],
  ['Ra', 'Arithmetic mean roughness', 'R-A', 'Average surface roughness value in micrometres.', 'Quality', 'Honed bore Ra 0.2–0.4 µm.', 'Process Sheet'],
  ['Honing', '', 'Hoh-ning', 'Abrasive finishing of a bore to precise size, roundness and cross-hatch finish.', 'Production', 'Cylinder tube honed to Ø80 H8.', 'Process Sheet'],
  ['Burnishing', '', 'Bur-nish-ing', 'Cold-working a surface with rollers to improve finish and hardness without removing material.', 'Production', 'Roller burnishing of cylinder tubes as an alternative to honing.', 'Honing'],
  ['Chamfer', '', 'Cham-fer', 'An angled edge cut on a part to remove sharp corners.', 'Engineering', '15° × 2 mm chamfer on rod end prevents seal damage.', 'Design Review'],
  ['Gland', '', 'Gland', 'Cylinder end part that guides the rod and houses rod seals and wiper.', 'Engineering', 'Gland tightened to 450 Nm.', 'BOM Management'],
  ['Hydrostatic Test', '', 'Hye-droh-stat-ik test', 'Pressure test with liquid to check strength and leak-tightness.', 'Quality', '1.5 × working pressure for 3 minutes.', 'Final Quality Control (FQC)'],
  ['Heat Number', '', 'Heet num-ber', 'Identification of the steel melt batch, used for traceability.', 'Supply Chain', 'Tube heat H5521 on mill certificate.', 'Material Traceability'],
  ['HAZ', 'Heat-Affected Zone', 'H-A-Z (haz)', 'Base metal near a weld whose properties changed due to heat.', 'Engineering', 'Hardness check of HAZ in PQR.', 'Welding Procedure Specification (WPS)'],
  ['GMAW', 'Gas Metal Arc Welding (MIG/MAG)', 'G-M-A-W', 'Arc welding with continuous wire electrode and shielding gas.', 'Production', 'Port boss welding by GMAW robot.', 'WPS'],
  ['GTAW', 'Gas Tungsten Arc Welding (TIG)', 'G-T-A-W', 'Arc welding with non-consumable tungsten electrode.', 'Production', 'Root pass on thin tubes.', 'WPS'],
  ['NDT', 'Non-Destructive Testing', 'N-D-T', 'Testing without damaging the part — UT, RT, MPI, DPT.', 'Quality', 'Dye penetrant test of base weld.', 'Failure Analysis'],
  ['DFT', 'Dry Film Thickness', 'D-F-T', 'Thickness of cured paint coating.', 'Quality', 'Paint DFT ≥ 80 µm.', 'Final Quality Control (FQC)'],
  ['CNC', 'Computer Numerical Control', 'C-N-C', 'Machine tool controlled by programmed instructions.', 'Production', 'CNC lathe for piston machining.', 'Process Sheet'],
  ['VMC', 'Vertical Machining Centre', 'V-M-C', 'CNC milling machine with vertical spindle.', 'Production', 'Port drilling on VMC.', 'CNC'],
  ['PLC', 'Programmable Logic Controller', 'P-L-C', 'Industrial computer controlling machines and processes.', 'Maintenance', 'Test bench PLC controls pressure and timer.', 'Interoperability'],
  ['SCADA', 'Supervisory Control and Data Acquisition', 'Skay-dah', 'System for monitoring and controlling industrial processes.', 'Maintenance', 'Paint plant oven temperatures on SCADA.', 'PLC'],
  ['MES', 'Manufacturing Execution System', 'M-E-S', 'Software that tracks and controls production on the shop floor.', 'Production', 'MES records each cylinder operation.', 'Traceability'],
  ['ERP', 'Enterprise Resource Planning', 'E-R-P', 'Integrated business software (orders, MRP, inventory, finance).', 'Supply Chain', 'MRP run in ERP.', 'Material Requirements Planning (MRP)'],
  ['CMMS', 'Computerised Maintenance Management System', 'C-M-M-S', 'Software for maintenance work orders, PM and history.', 'Maintenance', 'PM schedule in CMMS.', 'Machine History Records'],
  ['PLM', 'Product Lifecycle Management', 'P-L-M', 'Software managing product data, drawings and changes.', 'Engineering', 'ECN workflow in PLM.', 'Engineering Change Management'],
  ['RCM', 'Reliability-Centred Maintenance', 'R-C-M', 'Method to choose maintenance tasks based on failure consequences.', 'Maintenance', 'RCM study of test bench.', 'Failure Mode Analysis'],
  ['P-F Interval', 'Potential failure to Functional failure interval', 'P-F in-ter-vul', 'Time between detectable degradation and actual failure.', 'Maintenance', 'Vibration rise 6 weeks before bearing failure.', 'Predictive Maintenance'],
  ['Accumulator', '', 'Uh-kyoo-myoo-lay-ter', 'Hydraulic component that stores pressurised fluid energy.', 'Maintenance', 'Accumulator must be bled before press maintenance.', 'Lockout/Tagout (LOTO)'],
  ['ISO 45001', '', 'Eye-so forty-five-thousand-one', 'International standard for occupational health and safety management.', 'Safety', 'HIRA required by ISO 45001.', 'HIRA'],
  ['ISO 14001', '', 'Eye-so fourteen-thousand-one', 'International standard for environmental management systems.', 'Safety', 'Paint sludge disposal procedure.', 'Chemical Safety'],
  ['IATF 16949', '', 'I-A-T-F sixteen-nine-four-nine', 'Automotive quality management system standard based on ISO 9001.', 'Quality', 'Automotive supplier certification.', 'ISO 9001;APQP'],
  ['SDS', 'Safety Data Sheet', 'S-D-S', 'Document describing hazards and safe handling of a chemical.', 'Safety', 'SDS for paint thinner at the paint booth.', 'Chemical Safety'],
  ['LTIFR', 'Lost Time Injury Frequency Rate', 'L-T-I-F-R', 'Lost-time injuries per million hours worked.', 'Safety', 'LTIFR 1.8.', 'Safety KPI'],
  ['REBA', 'Rapid Entire Body Assessment', 'Ree-bah', 'Ergonomic posture assessment tool.', 'Safety', 'REBA score 9 for tube loading.', 'Ergonomic Risk'],
  ['RULA', 'Rapid Upper Limb Assessment', 'Roo-lah', 'Ergonomic assessment of upper body postures.', 'Safety', 'RULA for gland tightening.', 'Ergonomic Risk'],
  ['HAZOP', 'Hazard and Operability Study', 'Haz-op', 'Systematic study of process deviations using guidewords.', 'Safety', 'HAZOP of paint solvent recovery.', 'What-If Analysis'],
  ['S&OP', 'Sales and Operations Planning', 'S-and-O-P', 'Monthly process balancing demand and supply plans.', 'Supply Chain', 'S&OP decides second shift on honing.', 'Production Planning'],
  ['MPS', 'Master Production Schedule', 'M-P-S', 'Plan of finished products by period.', 'Production', '200 cylinders in week 14.', 'MRP'],
  ['BOM', 'Bill of Materials', 'B-O-M (bomb)', 'Structured list of components for a product.', 'Engineering', 'Cylinder BOM with seal kit.', 'BOM Management'],
  ['OTIF', 'On Time In Full', 'Oh-tif', 'Share of deliveries arriving on time and complete.', 'Supply Chain', 'Supplier OTIF 92%.', 'Supplier Delivery Performance'],
  ['OTD', 'On-Time Delivery', 'O-T-D', 'Share of orders delivered on or before promised date.', 'Production', 'OTD 95%.', 'KPI'],
  ['MOQ', 'Minimum Order Quantity', 'M-O-Q', 'Smallest quantity a supplier will sell.', 'Supply Chain', 'Seal MOQ 500 pieces.', 'EOQ'],
  ['VMI', 'Vendor-Managed Inventory', 'V-M-I', 'Supplier manages stock levels at customer site.', 'Supply Chain', 'Fastener VMI racks.', 'Inventory Management'],
  ['PFEP', 'Plan For Every Part', 'P-F-E-P', 'Database defining supply method, container and route for each part.', 'Supply Chain', 'PFEP for assembly line.', 'Material Flow Management'],
  ['CONWIP', 'Constant Work In Process', 'Kon-wip', 'Pull system limiting total WIP in a line.', 'Production', 'Max 20 jobs in the machining line.', 'Pull System'],
  ['DBR', 'Drum-Buffer-Rope', 'D-B-R', 'TOC scheduling: constraint sets pace, buffer protects it, rope limits release.', 'Production', 'Test bench is the drum.', 'Theory of Constraints (TOC)'],
  ['Little’s Law', '', 'Lit-ulz law', 'WIP = Throughput × Lead time.', 'Production', '600 units ÷ 50/day = 12 days.', 'Lead Time;WIP'],
  ['Pitch', '', 'Pich', 'Takt time × pack-out quantity; interval for releasing work.', 'Lean / CI', 'Pitch 30 min at the pacemaker.', 'Heijunka'],
  ['Pacemaker', '', 'Pays-may-ker', 'The single scheduled process that sets the pace for the value stream.', 'Lean / CI', 'Assembly is the pacemaker.', 'Pull System'],
  ['SMED', 'Single-Minute Exchange of Die', 'Smed', 'Method for reducing changeover to under 10 minutes.', 'Lean / CI', 'Welding fixture change 50 → 12 min.', 'Changeover Time'],
  ['OEE', 'Overall Equipment Effectiveness', 'O-E-E', 'Availability × Performance × Quality.', 'Production', 'Honing OEE 71%.', 'TPM'],
  ['TPM', 'Total Productive Maintenance', 'T-P-M', 'Plant-wide equipment care programme with 8 pillars.', 'Maintenance', 'TPM model machine.', 'OEE;Autonomous Maintenance'],
  ['MTBF', 'Mean Time Between Failures', 'M-T-B-F', 'Average operating time between failures.', 'Maintenance', 'Robot MTBF 400 h.', 'MTTR'],
  ['MTTR', 'Mean Time To Repair', 'M-T-T-R', 'Average time to repair.', 'Maintenance', 'Pump MTTR 3 h.', 'MTBF'],
  ['CAPA', 'Corrective and Preventive Action', 'Kay-pah', 'System to remove causes of actual and potential problems.', 'Quality', 'CAPA after wrong-bin mix-up.', '8D Problem Solving'],
  ['8D', 'Eight Disciplines', 'Eight-D', 'Team problem-solving method for complaints.', 'Quality', '8D for leaking boom cylinders.', 'CAPA'],
  ['NCR', 'Non-Conformance Report', 'N-C-R', 'Record of a non-conforming item and its disposition.', 'Quality', 'NCR for low paint DFT.', 'MRB'],
  ['SPC', 'Statistical Process Control', 'S-P-C', 'Using control charts to monitor processes.', 'Quality', 'X̄-R chart on bore diameter.', 'Control Charts'],
  ['MSA', 'Measurement System Analysis', 'M-S-A', 'Evaluating measurement error.', 'Quality', 'Gauge R&R 8%.', 'Gauge R&R'],
  ['UCL / LCL', 'Upper / Lower Control Limit', 'U-C-L / L-C-L', 'Statistical limits (±3σ) on a control chart — not specification limits.', 'Quality', 'UCL 80.026 mm.', 'Control Charts'],
  ['USL / LSL', 'Upper / Lower Specification Limit', 'U-S-L / L-S-L', 'Tolerance limits from the drawing or customer.', 'Quality', 'Bore 80.000–80.046 mm.', 'Cp and Cpk'],
  ['Sigma (σ)', 'Standard deviation', 'Sig-mah', 'Measure of spread of data around the mean.', 'Quality', 'σ = 0.005 mm.', 'Six Sigma'],
  ['WPS', 'Welding Procedure Specification', 'W-P-S', 'Qualified welding recipe.', 'Engineering', 'WPS-07 GMAW.', 'PQR;WQR'],
  ['PQR', 'Procedure Qualification Record', 'P-Q-R', 'Test record qualifying a WPS.', 'Engineering', 'PQR-07 bend tests passed.', 'WPS'],
  ['WQR', 'Welder Qualification Record', 'W-Q-R', 'Record proving a welder’s qualification.', 'Engineering', 'W-14 qualified 1G–3G.', 'WPS'],
  ['ECR', 'Engineering Change Request', 'E-C-R', 'Request to change design or process.', 'Engineering', 'ECR-118 rod chamfer.', 'ECN'],
  ['ECN', 'Engineering Change Notice', 'E-C-N', 'Approved instruction implementing a change.', 'Engineering', 'ECN-118 effective WO-2400.', 'ECR'],
  ['DCR', 'Document Change Request', 'D-C-R', 'Request to change a controlled document.', 'Engineering', 'DCR for leak-test WI.', 'Document Revision Control'],
  ['MDR', 'Master Document Register', 'M-D-R', 'List of all controlled documents and revisions.', 'Engineering', 'MDR entry WI-ASM-04 rev 03.', 'Document Control System'],
  ['APQP', 'Advanced Product Quality Planning', 'A-P-Q-P', 'Five-phase quality planning framework for NPD.', 'Engineering', 'APQP for boom cylinder.', 'PPAP'],
  ['SOP (Start of Production)', 'Start of Production', 'S-O-P', 'Date serial production begins (different from Standard Operating Procedure).', 'Engineering', 'SOP in month 9.', 'NPD Fundamentals'],
  ['DVP&R', 'Design Verification Plan and Report', 'D-V-P-and-R', 'Plan and results of design tests.', 'Engineering', 'Impulse test 1 million cycles.', 'Design Validation'],
  ['DFM / DFA', 'Design for Manufacturing / Assembly', 'D-F-M / D-F-A', 'Designing products to be easy to make and assemble.', 'Engineering', 'Reducing part count in a gland.', 'Design Review'],
  ['FEA', 'Finite Element Analysis', 'F-E-A', 'Computer simulation of stresses and deformations.', 'Engineering', 'FEA of clevis.', 'Engineering Validation'],
  ['EVM', 'Earned Value Management', 'E-V-M', 'Project control comparing planned value, earned value and actual cost.', 'Management', 'CPI 0.91.', 'Project Cost Management'],
  ['CPI / SPI', 'Cost / Schedule Performance Index', 'C-P-I / S-P-I', 'EV ÷ AC and EV ÷ PV.', 'Management', 'SPI 0.8 = behind schedule.', 'EVM'],
  ['WBS', 'Work Breakdown Structure', 'W-B-S', 'Hierarchy of project deliverables.', 'Management', 'Test bench WBS.', 'Gantt Chart'],
  ['EMV', 'Expected Monetary Value', 'E-M-V', 'Probability-weighted average outcome.', 'Management', 'EMV ₹19.5 L/yr.', 'Decision Analysis'],
  ['NPV', 'Net Present Value', 'N-P-V', 'Sum of discounted future cash flows minus investment.', 'Management', 'NPV of robot cell at 12%.', 'ROI'],
  ['TCO', 'Total Cost of Ownership', 'T-C-O', 'Full life cost of an asset or purchase.', 'Management', 'Seal supplier B lower TCO.', 'Cost-Benefit Analysis'],
  ['SWOT', 'Strengths, Weaknesses, Opportunities, Threats', 'Swot', 'Strategic analysis grid.', 'Management', 'SWOT for plant strategy.', 'Strategic Planning'],
  ['PESTLE', 'Political, Economic, Social, Technological, Legal, Environmental', 'Pest-ul', 'Framework for analysing the external environment.', 'Management', 'Electrification trend for excavators.', 'Strategic Planning'],
  ['ADKAR', 'Awareness, Desire, Knowledge, Ability, Reinforcement', 'Ad-kar', 'Individual change management model.', 'Management', 'Training traceability scanning.', 'Change Management'],
  ['Cobot', 'Collaborative robot', 'Koh-bot', 'Robot designed to work safely near people with force limiting.', 'Engineering', 'Cobot palletising cylinders at end of line.', 'Industrial Robots'],
  ['AGV', 'Automated Guided Vehicle', 'A-G-V', 'Driverless vehicle following fixed guidance (tape, magnets).', 'Supply Chain', 'AGV moves tubes from honing to welding.', 'AMR'],
  ['AMR', 'Autonomous Mobile Robot', 'A-M-R', 'Mobile robot that navigates freely using sensors and maps.', 'Supply Chain', 'AMR delivers seal kits around obstacles.', 'AGV'],
  ['SCARA', 'Selective Compliance Assembly Robot Arm', 'Skah-rah', 'Fast 4-axis robot for horizontal pick-and-place.', 'Engineering', 'SCARA inserting O-rings.', 'Industrial Robots'],
  ['Delta Robot', 'Parallel robot', 'Del-tah roh-bot', 'Very fast parallel-arm robot for light picking.', 'Engineering', 'Picking small fittings from a conveyor.', 'Industrial Robots'],
  ['TCP', 'Tool Centre Point', 'T-C-P', 'The reference point at the tip of a robot tool that is programmed and moved.', 'Engineering', 'Welding torch tip TCP calibration.', 'Robot Programming'],
  ['DOF', 'Degrees of Freedom', 'D-O-F', 'Number of independent axes of motion of a robot.', 'Engineering', 'Articulated robot with 6 DOF.', 'Industrial Robots'],
  ['Teach Pendant', '', 'Teech pen-dunt', 'Handheld device to jog and program a robot.', 'Engineering', 'Teaching weld points with the pendant.', 'Robot Programming'],
  ['Forward Kinematics', '', 'For-werd kin-uh-mat-iks', 'Calculating tool position from joint angles.', 'Engineering', 'Joint angles → TCP X, Y.', 'Inverse Kinematics'],
  ['Inverse Kinematics', '', 'In-vers kin-uh-mat-iks', 'Calculating joint angles needed to reach a tool position.', 'Engineering', 'Target point → required joint angles.', 'Forward Kinematics'],
  ['Payload', '', 'Pay-lohd', 'Maximum mass a robot can handle including the gripper.', 'Engineering', '20 kg payload for tube handling.', 'Industrial Robots'],
  ['Repeatability', '', 'Ree-peet-uh-bil-ih-tee', 'How precisely a robot returns to the same point (e.g., ±0.05 mm).', 'Engineering', 'Welding robot ±0.08 mm.', 'Industrial Robots'],
  ['Light Curtain', '', 'Lyte kur-tun', 'Safety sensor with infrared beams that stops a machine when interrupted.', 'Safety', 'Light curtain at robot cell loading station.', 'Machine Guarding'],
  ['Industry 4.0', 'Fourth industrial revolution', 'In-dus-tree four-point-oh', 'Digitally connected, data-driven manufacturing (IoT, analytics, automation).', 'Management', 'Connected test benches and OEE dashboards.', 'Interoperability;MES'],
  ['Digital Twin', '', 'Dij-ih-tul twin', 'A virtual model of a physical asset or process updated with real data.', 'Engineering', 'Simulating a new cell before installation.', 'Industry 4.0'],
];

const ACRONYM = /^[A-Z0-9&/\-]{2,8}$/;

function pronounce(term: string): string {
  const core = term.replace(/\s*\(.*?\)\s*/g, '').trim();
  if (ACRONYM.test(core)) return core.split('').filter((c) => /[A-Z0-9]/.test(c)).join('-');
  return 'Plain English — say as written';
}

function build(): GlossaryTerm[] {
  const out: GlossaryTerm[] = ROWS.map(([term, fullForm, pr, meaning, dept, ex, rel]) => ({
    term, fullForm: fullForm || undefined, pronunciation: pr, meaning, department: dept, example: ex, related: rel.split(';').filter(Boolean),
  }));
  const seen = new Set(out.map((t) => t.term.toLowerCase()));
  for (const l of LESSONS) {
    const key = l.title.toLowerCase();
    if (seen.has(key)) {
      const existing = out.find((t) => t.term.toLowerCase() === key);
      if (existing) existing.lessonId = l.id;
      continue;
    }
    seen.add(key);
    out.push({
      term: l.title,
      fullForm: l.fullForm,
      pronunciation: l.pronunciation ?? pronounce(l.title),
      meaning: l.definition,
      department: moduleById(l.moduleId)?.department ?? 'General',
      example: l.example,
      related: l.related.slice(0, 3),
      lessonId: l.id,
    });
  }
  // link hand-written acronyms to lessons where the lesson title contains the acronym
  for (const t of out) {
    if (t.lessonId) continue;
    const match = LESSONS.find((l) => l.title.toLowerCase() === t.term.toLowerCase() || l.title.includes(`(${t.term})`) || l.title.startsWith(t.term + ' '));
    if (match) t.lessonId = match.id;
  }
  return out.sort((a, b) => a.term.localeCompare(b.term));
}

export const GLOSSARY: GlossaryTerm[] = build();
export const GLOSSARY_DEPARTMENTS = Array.from(new Set(GLOSSARY.map((g) => g.department))).sort();
