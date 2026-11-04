export interface LevelDef {
  level: number;
  name: string;
  minLessons: number;
  minAssessments: number; // passed module tests / exams
  requiresComprehensive?: boolean;
  description: string;
}

export const LEVELS: LevelDef[] = [
  { level: 1, name: 'Industrial Beginner', minLessons: 0, minAssessments: 0, description: 'Starting the journey — learning the language of the factory.' },
  { level: 2, name: 'Production Learner', minLessons: 10, minAssessments: 0, description: 'Understands basic production terms and calculations.' },
  { level: 3, name: 'Industrial Practitioner', minLessons: 40, minAssessments: 2, description: 'Applies production, lean and quality tools on the shop floor.' },
  { level: 4, name: 'Process Improvement Specialist', minLessons: 100, minAssessments: 4, description: 'Leads structured improvement and problem solving.' },
  { level: 5, name: 'Industrial Management Professional', minLessons: 180, minAssessments: 8, description: 'Manages departments through KPIs, systems and people.' },
  { level: 6, name: 'Advanced Plant Management', minLessons: 260, minAssessments: 12, requiresComprehensive: true, description: 'Thinks and decides like a plant head.' },
];

export function computeLevel(completedLessons: number, passedAssessments: number, comprehensivePassed: boolean) {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (
      completedLessons >= l.minLessons &&
      passedAssessments >= l.minAssessments &&
      (!l.requiresComprehensive || comprehensivePassed)
    )
      current = l;
  }
  const next = LEVELS.find((l) => l.level === current.level + 1);
  let progressToNext = 100;
  if (next) {
    const lp = next.minLessons ? Math.min(1, completedLessons / next.minLessons) : 1;
    const ap = next.minAssessments ? Math.min(1, passedAssessments / next.minAssessments) : 1;
    const cp = next.requiresComprehensive ? (comprehensivePassed ? 1 : 0) : 1;
    progressToNext = Math.round(((lp + ap + cp) / 3) * 100);
  }
  return { current, next, progressToNext };
}
