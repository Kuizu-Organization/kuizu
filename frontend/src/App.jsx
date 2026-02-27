import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/" element={<Navigate to="/auth" replace />} />
        {/* Placeholder for dashboard */}
        <Route path="/dashboard" element={
          <div style={{ padding: '20px' }}>
            <h1>Welcome to Kuizu Dashboard!</h1>
            <button onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/auth';
            }}>Logout</button>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
