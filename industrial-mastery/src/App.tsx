import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Academy = lazy(() => import('./pages/Academy'));
const ModulePage = lazy(() => import('./pages/ModulePage'));
const LessonPage = lazy(() => import('./pages/LessonPage'));
const CalculatorsPage = lazy(() => import('./pages/Calculators'));
const CalculatorDetail = lazy(() => import('./pages/CalculatorDetail'));
const SimulationsPage = lazy(() => import('./pages/Simulations'));
const SimulationDetail = lazy(() => import('./pages/SimulationDetail'));
const RoboticsPage = lazy(() => import('./pages/Robotics'));
const RoboticsDetail = lazy(() => import('./pages/RoboticsDetail'));
const CasesPage = lazy(() => import('./pages/Cases'));
const CaseDetail = lazy(() => import('./pages/CaseDetail'));
const TemplatesPage = lazy(() => import('./pages/Templates'));
const TemplateDetail = lazy(() => import('./pages/TemplateDetail'));
const GlossaryPage = lazy(() => import('./pages/Glossary'));
const AssessmentsPage = lazy(() => import('./pages/Assessments'));
const AssessmentRun = lazy(() => import('./pages/AssessmentRun'));
const ProgressPage = lazy(() => import('./pages/Progress'));
const BookmarksPage = lazy(() => import('./pages/Bookmarks'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const SearchPage = lazy(() => import('./pages/Search'));
const NotFound = lazy(() => import('./pages/NotFound'));

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-24 text-navy-400 text-sm" role="status">
      <span className="h-4 w-4 mr-3 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <ScrollTop />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/academy" element={<Academy />} />
          <Route path="/modules/:slug" element={<ModulePage />} />
          <Route path="/lessons/:id" element={<LessonPage />} />
          <Route path="/calculators" element={<CalculatorsPage />} />
          <Route path="/calculators/:id" element={<CalculatorDetail />} />
          <Route path="/simulations" element={<SimulationsPage />} />
          <Route path="/simulations/:id" element={<SimulationDetail />} />
          <Route path="/robotics" element={<RoboticsPage />} />
          <Route path="/robotics/:id" element={<RoboticsDetail />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/cases/:id" element={<CaseDetail />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/templates/:id" element={<TemplateDetail />} />
          <Route path="/glossary" element={<GlossaryPage />} />
          <Route path="/assessments" element={<AssessmentsPage />} />
          <Route path="/assessments/:examId" element={<AssessmentRun />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
