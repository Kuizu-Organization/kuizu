import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage/HomePage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminSetPreviewPage from './pages/Admin/AdminSetPreviewPage';
import ClassDetailPage from './pages/ClassDetailPage/ClassDetailPage';
import SearchPage from './pages/SearchPage/SearchPage';
import ComingSoonPage from './pages/ComingSoonPage';
import FoldersPage from './pages/FoldersPage/FoldersPage';
import FolderDetailPage from './pages/FolderDetailPage/FolderDetailPage';

import MainLayout from './components/layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected layout pages */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
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
          <MainLayout activePath="/admin/stats/flashcards">
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          </MainLayout>
        } />

        <Route path="/admin/stats/system" element={
          <MainLayout activePath="/admin/stats/system">
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminDashboard />
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

