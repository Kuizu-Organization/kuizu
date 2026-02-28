import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';

import MainLayout from './components/layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />

        {/* Standard layout pages */}
        <Route path="/profile" element={<ProfilePage />} />

        <Route path="/dashboard" element={
          <MainLayout>
            <div style={{ padding: '40px', maxWidth: '1440px', margin: '0 auto' }}>
              <h1 style={{ fontSize: '32px', marginBottom: '24px' }}>Welcome back to Kuizu!</h1>
              {/* Other dashboard components would go here */}
            </div>
          </MainLayout>
        } />

        <Route path="/" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
