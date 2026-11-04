import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { buildExam, examById } from '../lib/exams';
import { useProgress } from '../lib/progress';
import { PageHeader } from '../components/ui';
import QuizRunner from '../components/QuizRunner';
import { lessonById } from '../data/lessons';
import NotFound from './NotFound';

export default function AssessmentRun() {
  const { examId = '' } = useParams();
  const exam = examById(examId);
  const { state, recordAssessment } = useProgress();
  const priorAttempts = state.assessments.filter((a) => a.examId === examId).length;
  const [attempt, setAttempt] = useState(priorAttempts);
  const questions = useMemo(() => (exam ? buildExam(exam.id, attempt) : []), [exam, attempt]);
  if (!exam) return <NotFound />;
  return (
    <div className="max-w-4xl">
      <PageHeader crumbs={[{ to: '/assessments', label: 'Assessments' }, { label: exam.title }]} eyebrow="Assessment" title={exam.title} description={`${exam.description} Pass mark ${state.settings.examPassMark}%.`} />
      <QuizRunner
        key={`${exam.id}-${attempt}`}
        questions={questions}
        passMark={state.settings.examPassMark}
        onRetry={() => setAttempt((a) => a + 1)}
        onComplete={(r) => {
          const weak = Array.from(new Set(r.wrongTopics)).map((t) => lessonById(t)?.title ?? t);
          recordAssessment({ examId: exam.id, title: exam.title, score: r.score, correct: r.correct, total: r.total, passed: r.score >= state.settings.examPassMark, weakTopics: weak });
        }}
      />
    </div>
  );
}
