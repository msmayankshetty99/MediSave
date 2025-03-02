import './App.css';
import Expenses from './Expenses';
import Dashboard from './Dashboard';
import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FaHeartbeat, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import Login from './components/Login';
import Signup from './components/Signup';
import ResetPassword from './components/ResetPassword';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './AuthContext';
import usePageTitle from './hooks/usePageTitle';
import ChatBox from './components/ChatBox';

// Create a theme context
export const ThemeContext = createContext();

// Sidenav component with logout functionality
function Sidenav({ theme, toggleTheme, isMobileOpen, setIsMobileOpen }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    if (window.innerWidth <= 768) {
      setIsMobileOpen(false);
    }
  };

  return (
    <nav className={`sidenav ${isMobileOpen ? 'open' : ''}`}>
      <div className="sidenav-header">
        <h2><FaHeartbeat className="medisave-icon" /> MediSave</h2>
      </div>
      <ul className="sidenav-menu">
        <li>
          <NavLink 
            to="/expenses" 
            className={({ isActive }) => isActive ? "active" : ""}
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">💰</span>
            Expenses
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => isActive ? "active" : ""}
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/profile" 
            className={({ isActive }) => isActive ? "active" : ""}
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">👤</span>
            Profile
          </NavLink>
        </li>
      </ul>
      <div className="sidenav-footer">
        <ChatBox />
        
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

// Layout component to conditionally render sidenav
function AppLayout({ theme, toggleTheme, children }) {
  const location = useLocation();
  const authRoutes = ['/login', '/signup', '/reset-password'];
  const showSidenav = !authRoutes.includes(location.pathname);
  const isAuthPage = authRoutes.includes(location.pathname);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Use the custom hook to set the page title
  usePageTitle();

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Close sidebar when clicking outside
  const handleOverlayClick = () => {
    setIsMobileOpen(false);
  };

  // Close sidebar when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`app-container ${isAuthPage ? 'auth-page' : ''}`}>
      {showSidenav && (
        <>
          <button 
            className="mobile-toggle" 
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            {isMobileOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div 
            className={`sidebar-overlay ${isMobileOpen ? 'active' : ''}`} 
            onClick={handleOverlayClick}
          ></div>
          <Sidenav 
            theme={theme} 
            toggleTheme={toggleTheme} 
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
          />
        </>
      )}
      <main className="main-content">
        {children}
      </main>
    </div>
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
            <Routes>
              <Route path="*" element={
                <AppLayout theme={theme} toggleTheme={toggleTheme}>
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
                    
                    {/* Redirect to expenses if authenticated, otherwise to login */}
                    <Route path="/" element={<Navigate to="/expenses" replace />} />
                    
                    {/* Fallback for unknown routes */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AppLayout>
              } />
            </Routes>
          </div>
        </Router>
      </ThemeContext.Provider>
    </AuthProvider>
  );
}

export default App;
