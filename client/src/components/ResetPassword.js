import React, { useState, useContext, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { ThemeContext } from '../App';
import { Link } from 'react-router-dom';
import '../styles/auth.css';

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const { resetPassword, loading } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Ensure body class is set correctly
  useEffect(() => {
    document.body.className = theme;
    return () => {
      document.body.className = '';
    };
  }, [theme]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!email) {
      setMessage('Please enter your email address');
      setIsError(true);
      return;
    }

    const success = await resetPassword(email);
    if (success) {
      setMessage('Password reset instructions have been sent to your email');
      setIsError(false);
    } else {
      setMessage('Failed to send reset instructions. Please try again.');
      setIsError(true);
    }
  };

  return (
    <div className={`auth-container ${theme}`}>
      <button 
        className="theme-toggle-auth" 
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
      
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p className="auth-subtitle">Enter your email to receive reset instructions</p>

        {message && (
          <div className={`auth-message ${isError ? 'auth-error' : 'auth-success'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Instructions'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remember your password? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword; 