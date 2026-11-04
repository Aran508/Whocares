# Industrial Mastery

The complete industrial management, production, quality and engineering learning academy — a React + TypeScript single-page app.

## Run

```bash
cd industrial-mastery
npm install
npm run dev        # development server
npm run build      # typecheck + production build (dist/)
npm test           # 67 unit tests (data integrity, calculators, simulations, robotics, exams)
```

Deploys as a static site (Vercel rewrite included in `vercel.json`).

## What is inside

| Area | Content |
|---|---|
| Curriculum | 13 modules (A–M), 295 authored lessons (308 module entries incl. cross-listed), each with the 20-part lesson structure and a 5-question test |
| Calculators | 33 calculators with validation, units, formulas, assumptions, step-by-step working and interpretation |
| Simulations | Line balancing, OEE, inventory, defect investigation, lean factory, daily production management |
| Robotics lab | 3 environments: articulated arm kinematics & pick-and-place, robotic welding cell, AGV/AMR + cobot palletising; plus a robot-family catalogue |
| Case studies | 25 realistic (fictional) factory problems; solution revealed only after the learner decides |
| Glossary | 400+ terms with full form, easy pronunciation (and browser text-to-speech), meaning, example |
| Templates | 30 editable templates with sample data; export CSV / Excel / print-to-PDF |
| Assessments | 13 module tests, comprehensive exam, case assessment, calculation drill (match, diagram, calc, scenario, MCQ, T/F) |
| Progress | Completion = studied + quiz ≥ pass mark; 6 learning levels; dashboard charts from real stored data |

## Architecture

```
src/
  data/            course content (modules, lessons/*.ts, glossary, cases, templates)
  calculators/     calculator engine + definitions (pure)
  simulations/     simulation logic (pure) + components
  robotics/        kinematics / A* / welding / palletising logic (pure) + lab components
  diagrams/        SVG diagram library (60+ bespoke diagrams + generated flows)
  illustrations/   original industrial scene illustrations
  lib/             progress store (storage adapter), quiz & exam engines, search, levels
  pages/ components/
```

Progress persists in `localStorage` through a `StorageAdapter` interface (`src/lib/storage.ts`) so a database can be plugged in later. New lessons are added by appending to the module files in `src/data/lessons/`.

All illustrations are original SVG artwork; no external images, logos or real company factories are depicted.
