import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Login() {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login(username, password);
    if (!result.success) {
      setError(result.error || 'Access denied!');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.auth.register({ username, password, displayName });

      if (!data?.token) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      localStorage.setItem('friendzone_token', data.token);
      localStorage.setItem('friendzone_user', JSON.stringify(data.user));
      window.location.reload();
    } catch (err) {
      setError('Something went wrong. Try again.');
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setUsername('');
    setPassword('');
    setDisplayName('');
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-mascot">🦊</div>
          <h1>FRIEND ZONE</h1>
          <p>{isRegister ? 'Create your account' : 'Welcome back!'}</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        {isRegister ? (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
                minLength={3}
              />
            </div>
            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should we call you?"
              />
            </div>
            <div className="form-group password-input">
              <label>Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                minLength={8}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'CREATE ACCOUNT'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                required
              />
            </div>
            <div className="form-group password-input">
              <label>Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'LOGIN'}
            </button>
          </form>
        )}

        <div className="login-toggle">
          <button type="button" className="toggle-btn" onClick={switchMode}>
            {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
          </button>
        </div>

        <div className="login-footer">
          {isRegister ? 'Join the crew! 💫' : 'Welcome back! 👋'}
        </div>
      </div>

      <style>{`
        .login-toggle {
          text-align: center;
          margin-top: 16px;
        }
        
        .toggle-btn {
          background: none;
          border: none;
          color: var(--secondary);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          text-decoration: underline;
          font-family: 'Outfit', sans-serif;
        }
        
        .toggle-btn:hover {
          color: var(--primary);
        }

        .password-input {
          position: relative;
        }

        .password-input input {
          padding-right: 50px;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          padding: 4px 8px;
          opacity: 0.6;
          transition: opacity 0.2s;
        }

        .password-toggle:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
