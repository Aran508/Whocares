import type { Lesson, Question } from '../types';
import { hashString, mulberry32, pick, shuffle } from './rng';

const BAD_MANAGER_PRACTICES = [
  'Wait for the month-end report before discussing the issue, so that the data is complete.',
  'Ask the operator to be more careful and close the issue on the same day.',
  'Apply the method once for the audit and then return to the old way of working.',
  'Delegate the topic completely to a junior engineer and never review the results.',
  'Focus only on output quantity and treat quality and safety losses as unavoidable.',
  'Decide in the meeting room based on opinion instead of visiting the shop floor.',
  'Add inventory and overtime to hide the problem from the customer.',
  'Change several variables at the same time so the result appears faster.',
  'Set the target once a year and avoid reviewing it until the next year.',
  'Measure everything but take no action on the measurements.',
];

const GOOD_PRACTICES = [
  'Verifying facts at the Gemba (actual workplace) before drawing conclusions.',
  'Assigning a clear owner and target date to each action.',
  'Checking the result with data after implementation.',
  'Training the people who will use the method before roll-out.',
  'Standardising the improvement once it has been proven.',
  'Involving the operators who know the process in the analysis.',
  'Starting with a pilot area before expanding plant-wide.',
  'Reviewing the indicator regularly at a fixed meeting.',
];

function mcq(
  id: string,
  prompt: string,
  correct: string,
  distractors: string[],
  explanation: string,
  topic: string,
  rand: () => number,
  extra: Partial<Question> = {},
): Question {
  const opts = shuffle([correct, ...distractors.slice(0, 3)], rand);
  return { id, type: 'mcq', prompt, options: opts, answer: opts.indexOf(correct), explanation, topic, ...extra };
}

const firstSentence = (s: string) => {
  const m = s.match(/^(.+?[.!?])(\s|$)/);
  return (m ? m[1] : s).trim();
};

/**
 * Builds the five-question knowledge test of a lesson. Questions are derived
 * from the lesson's own content, with distractors taken from sibling lessons
 * in the same module, so every answer can be verified against the lesson text.
 */
export function buildLessonQuiz(lesson: Lesson, siblings: Lesson[], seedSalt = ''): Question[] {
  const rand = mulberry32(hashString(lesson.id + seedSalt));
  const others = siblings.filter((l) => l.id !== lesson.id);
  const qs: Question[] = [];
  const base = lesson.id;

  // Q1 — definition
  qs.push(
    mcq(
      `${base}-q1`,
      `Which statement best describes "${lesson.title}"?`,
      lesson.definition,
      pick(others, 3, rand).map((o) => o.definition),
      `${lesson.title}: ${lesson.definition}`,
      lesson.id,
      rand,
    ),
  );

  // Q2 — purpose
  qs.push(
    mcq(
      `${base}-q2`,
      `Why does "${lesson.title}" exist? Choose the main purpose.`,
      firstSentence(lesson.why),
      pick(others, 3, rand).map((o) => firstSentence(o.why)),
      lesson.why,
      lesson.id,
      rand,
    ),
  );

  // Q3 — true / false
  const useTrue = rand() > 0.5 && lesson.advantages.length > 0;
  if (useTrue) {
    const adv = lesson.advantages[Math.floor(rand() * lesson.advantages.length)];
    qs.push({
      id: `${base}-q3`, type: 'truefalse',
      prompt: `True or false: "${adv}" is an advantage of ${lesson.title}.`,
      options: ['True', 'False'], answer: 0,
      explanation: `True. Listed advantages of ${lesson.title}: ${lesson.advantages.join('; ')}.`,
      topic: lesson.id,
    });
  } else {
    const mis = lesson.mistakes[Math.floor(rand() * lesson.mistakes.length)];
    qs.push({
      id: `${base}-q3`, type: 'truefalse',
      prompt: `True or false: "${mis}" is a recommended good practice when applying ${lesson.title}.`,
      options: ['True', 'False'], answer: 1,
      explanation: `False. This is one of the common mistakes listed for ${lesson.title}.`,
      topic: lesson.id,
    });
  }

  // Q4 — manager's perspective
  qs.push(
    mcq(
      `${base}-q4`,
      `Which approach reflects how an experienced manager uses ${lesson.title}?`,
      firstSentence(lesson.manager),
      pick(BAD_MANAGER_PRACTICES, 3, rand),
      `Manager's insight: ${lesson.manager}`,
      lesson.id,
      rand,
      { type: 'scenario' },
    ),
  );

  // Q5 — calculation, full form, or mistake spotting
  if (lesson.calcQuestion) {
    const [q, correct, wrong, expl] = lesson.calcQuestion;
    qs.push(mcq(`${base}-q5`, q, correct, wrong, expl, lesson.id, rand, { type: 'calc' }));
  } else if (lesson.fullForm) {
    const pool = siblings.filter((o) => o.fullForm && o.fullForm !== lesson.fullForm).map((o) => o.fullForm!) as string[];
    const fallback = ['Total Process Measurement', 'Standard Quality Procedure', 'Material Release Plan', 'Statistical Output Control', 'General Process Review', 'Production Order Record'];
    const ds = pick(pool.length >= 3 ? pool : [...pool, ...fallback], 3, rand);
    qs.push(mcq(`${base}-q5`, `What is the full form of the term used in "${lesson.title}"?`, lesson.fullForm, ds, `Full form: ${lesson.fullForm}.`, lesson.id, rand));
  } else {
    const mis = lesson.mistakes[Math.floor(rand() * lesson.mistakes.length)];
    qs.push(
      mcq(
        `${base}-q5`,
        `Which of the following is a COMMON MISTAKE when applying ${lesson.title}?`,
        mis,
        pick(GOOD_PRACTICES, 3, rand),
        `"${mis}" is a listed common mistake. The other options are good practice.`,
        lesson.id,
        rand,
      ),
    );
  }

  return qs.map((q) => ({ ...q, moduleId: lesson.moduleId }));
}

export function scoreAnswers(questions: Question[], answers: Record<string, number | number[]>) {
  let correct = 0;
  const wrongTopics: string[] = [];
  for (const q of questions) {
    const a = answers[q.id];
    let ok = false;
    if (q.type === 'match') {
      const map = q.answer as number[];
      ok = Array.isArray(a) && map.every((v, i) => a[i] === v);
    } else ok = a === q.answer;
    if (ok) correct++;
    else wrongTopics.push(q.topic);
  }
  const total = questions.length;
  return { correct, total, score: total ? Math.round((correct / total) * 100) : 0, wrongTopics };
}
