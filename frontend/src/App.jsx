import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage/HomePage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import ClassDetailPage from './pages/ClassDetailPage/ClassDetailPage';
import SearchPage from './pages/SearchPage/SearchPage';
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
      </Routes>
    </Router>
  );
}

export default App;

