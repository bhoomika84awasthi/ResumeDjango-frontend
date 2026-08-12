import React, { useState, useContext } from 'react';
import './Auth.css';
import { AuthContext } from './AuthContext';

function Login({ onLoginSuccess }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { setToken } = useContext(AuthContext);

  // Convert email to username (extract part before @)
  const getLoginUsername = (input) => {
    if (input.includes('@')) {
      return input.split('@')[0];
    }
    return input;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const url = mode === 'login'
      ? 'http://localhost:8000/api-token-auth/'
      : 'http://localhost:8000/api/register/';

    let payload;
    if (mode === 'login') {
      // For login, convert email to username if needed
      const loginUsername = getLoginUsername(username);
      payload = { username: loginUsername, password };
    } else {
      payload = { username, email, password };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (mode === 'register') {
          // Registration successful - show success message and switch to login
          setSuccess('✓ Account created successfully! Please log in with your credentials.');
          setUsername('');
          setEmail('');
          setPassword('');
          setTimeout(() => {
            setMode('login');
            setSuccess('');
          }, 2000);
        } else {
          // Login successful - proceed to app
          setToken(data.token);
          localStorage.setItem('token', data.token);
          localStorage.setItem('username', getLoginUsername(username));
          onLoginSuccess();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Invalid credentials');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Resume Analyzer</h1>
        <div className="auth-toggle">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => {
              setMode('login');
              setError('');
              setSuccess('');
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => {
              setMode('register');
              setError('');
              setSuccess('');
            }}
          >
            Register
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder={mode === 'login' ? 'Username or email (e.g., john or john@gmail.com)' : 'Choose a username'}
            />
          </div>
          {mode === 'register' && (
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? (mode === 'login' ? 'Logging in...' : 'Registering...') : (mode === 'login' ? 'Login' : 'Register')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
