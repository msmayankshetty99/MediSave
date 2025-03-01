import './App.css';
import Expenses from './Expenses';
import Dashboard from './Dashboard';
import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import { FaHeartbeat } from 'react-icons/fa';

// Create a theme context
export const ThemeContext = createContext();

function App() {
  // Get theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  // Update body class and localStorage when theme changes
  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Router>
        <div className={`App ${theme}`}>
          <div className="app-container">
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
              </ul>
              <div className="sidenav-footer">
                <button 
                  className="theme-toggle-sidenav" 
                  onClick={toggleTheme}
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                </button>
              </div>
            </nav>
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Expenses />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </ThemeContext.Provider>
  );
}

export default App;
