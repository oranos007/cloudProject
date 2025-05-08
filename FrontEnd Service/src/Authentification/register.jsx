import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Log-regi.css';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      await register({ firstName, lastName, email, password });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join our community</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              id="firstName"
              className="auth-input"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder=" "
              required
            />
            <label htmlFor="firstName" className="auth-label">First Name</label>
          </div>

          <div className="form-group">
            <input
              type="text"
              id="lastName"
              className="auth-input"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder=" "
              required
            />
            <label htmlFor="lastName" className="auth-label">Last Name</label>
          </div>

          <div className="form-group">
            <input
              type="email"
              id="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              required
            />
            <label htmlFor="email" className="auth-label">Email</label>
          </div>

          <div className="form-group">
            <input
              type="password"
              id="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              required
            />
            <label htmlFor="password" className="auth-label">Password</label>
          </div>

          <div className="form-group">
            <input
              type="password"
              id="confirmPassword"
              className="auth-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder=" "
              required
            />
            <label htmlFor="confirmPassword" className="auth-label">Confirm Password</label>
          </div>

          <button
            type="submit"
            className={`auth-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="button-text">Creating Account...</span>
                <div className="button-spinner"></div>
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <a href="/login" className="auth-link">Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default Register;