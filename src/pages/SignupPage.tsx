import { useState, useCallback, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useError } from '../hooks/useError';
import { signup } from '../services/api';

export function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [aptNum, setAptNum] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { error, setError, clearError } = useError();
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email.trim() || !password.trim() || !firstName.trim() || !lastName.trim() || !address.trim() || !state.trim() || !zipCode.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const userData = await signup({
        email,
        password,
        firstName,
        lastName,
        address,
        aptNum: aptNum.trim() || undefined,
        state,
        zipCode,
      });
      setUser(userData);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, firstName, lastName, address, aptNum, state, zipCode, clearError, setError, setUser, navigate]);

  const isFormValid = email.trim() && password.trim() && firstName.trim() && lastName.trim() && address.trim() && state.trim() && zipCode.trim();

  return (
    <div className="signup-page">
      <Link to="/" className="back-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </Link>
      
      <div className="signup-container">
        <h1>Before we start...Let's get to know each other!</h1>
        
        <form className="signup-form" onSubmit={handleSubmit}>
          <h2 className="form-section-title">Enter Account Information</h2>
          
          <div className="form-fields">
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
            
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isLoading}
              required
            />
            
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isLoading}
              required
            />
            
            <input
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isLoading}
              required
            />
            
            <div className="address-row">
              <input
                type="text"
                placeholder="Apt. Num"
                value={aptNum}
                onChange={(e) => setAptNum(e.target.value)}
                disabled={isLoading}
                className="apt-input"
              />
              
              <input
                type="text"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                disabled={isLoading}
                required
                className="state-input"
              />
              
              <input
                type="text"
                placeholder="Zip Code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                disabled={isLoading}
                required
                className="zip-input"
              />
            </div>
          </div>
          
          {error && (
            <div className="error-message">{error}</div>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? 'Loading...' : 'Enter'}
          </button>
        </form>
        
        <div className="auth-link">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
