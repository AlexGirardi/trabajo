import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeModeProvider } from './themeContext';
import { I18nProvider } from './i18n';
import { Layout } from './components/Layout/Layout';
import DashboardPage from './pages/DashboardPage';
import CoursesPage from './pages/CoursesPage';
import GenerateExamPage from './pages/GenerateExamPage';
import ExamsPage from './pages/ExamsPage';
import TakeExamPage from './pages/TakeExamPage';
import ExamResultsPage from './pages/ExamResultsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <I18nProvider>
      <ThemeModeProvider>
        <CssBaseline />
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/generate-exam" element={<GenerateExamPage />} />
              <Route path="/exams" element={<ExamsPage />} />
              <Route path="/take-exam/:examId" element={<TakeExamPage />} />
              <Route path="/exam-results" element={<ExamResultsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeModeProvider>
    </I18nProvider>
  );
}

export default App;
