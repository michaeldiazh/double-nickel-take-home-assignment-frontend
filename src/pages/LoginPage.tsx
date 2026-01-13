import { useState, useCallback, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useError } from '../hooks/useError';
import { login } from '../services/api';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { error, setError, clearError } = useError();
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      const userData = await login({ email, password });
      setUser(userData);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, clearError, setError, setUser, navigate]);

  return (
    <div className="login-page">
      <Link to="/" className="back-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </Link>
      
      <div className="login-container">
        <h1>Welcome Back!</h1>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
          
          {error && (
            <div className="error-message">{error}</div>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading || !email.trim() || !password.trim()}
          >
            {isLoading ? 'Loading...' : 'Enter'}
          </button>
        </form>
        
        <div className="auth-link">
          <p>Don't have an account? <Link to="/sign-up">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
}
