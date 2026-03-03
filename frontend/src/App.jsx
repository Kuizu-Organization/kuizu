import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
// import HomePage from './pages/HomePage';
import ProtectedRoute from './components/layout/ProtectedRoute';

import MainLayout from './components/layout';
import { ToastProvider } from './context/ToastContext';
import { HomePage } from './pages';

// Placeholders for deleted pages
const AuthPage = () => <div style={{ padding: '20px' }}>Auth Page Placeholder</div>;
const ProfilePage = () => <div style={{ padding: '20px' }}>Profile Page Placeholder</div>;

const HomePage = () => <div style={{ padding: '20px' }}>Home Page Placeholder</div>;

function App() {
  return (
    <ToastProvider>
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
            <ProtectedRoute>
              <MainLayout>
                <div style={{ padding: '40px', maxWidth: '1440px', margin: '0 auto' }}>
                  <h1 style={{ fontSize: '32px', marginBottom: '24px' }}>Welcome back to Kuizu!</h1>
                  {/* Other dashboard components would go here */}
                </div>
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
