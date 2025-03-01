import './App.css';
import Expenses from './Expenses';
import Dashboard from './Dashboard';
import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { FaHeartbeat, FaSignOutAlt } from 'react-icons/fa';
import Login from './components/Login';
import Signup from './components/Signup';
import ResetPassword from './components/ResetPassword';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './AuthContext';

// Create a theme context
export const ThemeContext = createContext();

// Sidenav component with logout functionality
function Sidenav({ theme, toggleTheme }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="sidenav">
      <div className="sidenav-header">
        <h2><FaHeartbeat className="medisave-icon" /> MediSave</h2>
      </div>
      <ul className="sidenav-menu">
        <li>
          <NavLink to="/expenses" className={({ isActive }) => isActive ? "active" : ""}>
            <span className="nav-icon">💰</span>
            Expenses
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
            <span className="nav-icon">📊</span>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>
            <span className="nav-icon">👤</span>
            Profile
          </NavLink>
        </li>
      </ul>
      <div className="sidenav-footer">
        <button 
          className="theme-toggle-sidenav" 
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
        
        <button 
          className="logout-button" 
          onClick={handleLogout}
        >
          <FaSignOutAlt className="logout-icon" /> Sign Out
        </button>
      </div>
    </nav>
  );
}

function App() {
  // Get theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  // Update body class and localStorage when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <AuthProvider>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <Router>
          <div className={`App ${theme}`}>
            <div className="app-container">
              <Routes>
                <Route path="/login" element={null} />
                <Route path="/signup" element={null} />
                <Route path="/reset-password" element={null} />
                <Route path="*" element={<Sidenav theme={theme} toggleTheme={toggleTheme} />} />
              </Routes>
              
              <main className="main-content">
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  
                  {/* Protected routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/expenses" element={<Expenses />} />
                    <Route path="/profile" element={<Profile />} />
                  </Route>
                  
                  {/* Redirect to dashboard if authenticated, otherwise to login */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Fallback for unknown routes */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      </ThemeContext.Provider>
    </AuthProvider>
  );
}

export default App;
