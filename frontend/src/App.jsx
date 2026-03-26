import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage/AuthPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import HomePage from './pages/HomePage/HomePage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminSetPreviewPage from './pages/Admin/AdminSetPreviewPage';
import StatisticsPage from './pages/Admin/StatisticsPage';
import ClassDetailPage from './pages/ClassDetailPage/ClassDetailPage';
import SearchPage from './pages/SearchPage/SearchPage';
import ComingSoonPage from './pages/ComingSoonPage';
import FoldersPage from './pages/FoldersPage/FoldersPage';
import FolderDetailPage from './pages/FolderDetailPage/FolderDetailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage';
import FlashcardSetsPage from './pages/FlashcardSetsPage/FlashcardSetsPage';
import FlashcardSetDetailsPage from './pages/FlashcardSetDetailsPage/FlashcardSetDetailsPage';
import FlashcardSetForm from './pages/FlashcardSetForm/FlashcardSetForm';
import FlashcardForm from './pages/FlashcardForm/FlashcardForm';
import QuizPage from './pages/QuizPage/QuizPage';
import QuizResultPage from './pages/QuizResultPage/QuizResultPage';
import StudyPage from './pages/StudyPage/StudyPage';
import AdminModerationPage from './pages/AdminModerationPage/AdminModerationPage';

import MainLayout from './components/layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected layout pages */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />

        {/* Flashcard Set Routes */}
        <Route path="/flashcard-sets" element={<FlashcardSetsPage />} />
        <Route path="/flashcard-sets/create" element={<FlashcardSetForm />} />
        <Route path="/flashcard-sets/edit/:setId" element={<FlashcardSetForm />} />
        <Route path="/flashcard-sets/:setId" element={<FlashcardSetDetailsPage />} />

        {/* Individual Flashcard Routes */}
        <Route path="/flashcards/create" element={<FlashcardForm />} />
        <Route path="/flashcards/edit/:cardId" element={<FlashcardForm />} />

        {/* Study and Quiz Routes */}
        <Route path="/study/:setId" element={<StudyPage />} />
        <Route path="/quiz/:setId" element={<QuizPage />} />
        <Route path="/quiz/results/:resultId" element={<QuizResultPage />} />

        {/* Admin Routes */}
        <Route path="/admin/moderation" element={
          <ProtectedRoute roles={['ROLE_ADMIN']}>
            <AdminModerationPage />
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <MainLayout>
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          </MainLayout>
        } />

        <Route path="/admin/users" element={
          <MainLayout activePath="/admin/users">
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          </MainLayout>
        } />

        <Route path="/admin/submissions/flashcards" element={
          <MainLayout activePath="/admin/submissions/flashcards">
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          </MainLayout>
        } />

        <Route path="/admin/submissions/flashcards/:setId" element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <AdminSetPreviewPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/submissions/classes" element={
          <MainLayout activePath="/admin/submissions/classes">
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          </MainLayout>
        } />

        <Route path="/admin/history" element={
          <MainLayout activePath="/admin/history">
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          </MainLayout>
        } />

        <Route path="/admin/stats/flashcards" element={
          <MainLayout activePath="/admin/stats/users">
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <StatisticsPage />
            </ProtectedRoute>
          </MainLayout>
        } />

        <Route path="/admin/stats/users" element={
          <MainLayout activePath="/admin/stats/users">
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <StatisticsPage />
            </ProtectedRoute>
          </MainLayout>
        } />

        <Route path="/admin/stats/classes" element={
          <MainLayout activePath="/admin/stats/users">
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <StatisticsPage />
            </ProtectedRoute>
          </MainLayout>
        } />

        {/* Legacy redirect */}
        <Route path="/admin/dashboard" element={<Navigate to="/admin/users" replace />} />

        <Route path="/classes/:classId" element={
          <MainLayout>
            <ProtectedRoute>
              <ClassDetailPage />
            </ProtectedRoute>
          </MainLayout>
        } />

        <Route path="/search" element={
          <MainLayout>
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          </MainLayout>
        } />

        <Route path="/folders" element={
          <MainLayout>
            <ProtectedRoute>
              <FoldersPage />
            </ProtectedRoute>
          </MainLayout>
        } />

        <Route path="/folders/:folderId" element={
          <MainLayout>
            <ProtectedRoute>
              <FolderDetailPage />
            </ProtectedRoute>
          </MainLayout>
        } />
        {/* Catch-all route for missing pages */}
        <Route path="*" element={<ComingSoonPage />} />
      </Routes>
    </Router>
  );
}

export default App;

