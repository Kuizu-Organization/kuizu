import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage/HomePage';
import ProtectedRoute from './components/layout/ProtectedRoute';

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
              <div style={{ padding: '40px', maxWidth: '1440px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '32px', marginBottom: '24px' }}>Welcome back to Kuizu!</h1>
                {/* Other dashboard components would go here */}
              </div>
            </ProtectedRoute>
          </MainLayout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
