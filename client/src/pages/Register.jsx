import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import Logo from '../components/Logo';
import CountdownTimer from '../components/CountdownTimer';
import { getTodaysOffer } from '../data/offers';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const todaysOffer = getTodaysOffer();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await API.post('/auth/register', formData);
      setSuccess(res.data.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-split">
      <div className="auth-split-left">
        <Logo />
        <div className="auth-split-form">
          <h2>Create your account</h2>
          <form onSubmit={handleSubmit}>
            <label className="auth-label">Full Name</label>
            <input
              className="input"
              type="text"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <label className="auth-label">Email</label>
            <input
              className="input"
              type="email"
              name="email"
              placeholder="mail@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <label className="auth-label">Password</label>
            <input
              className="input"
              type="password"
              name="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">{success}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Register
            </button>
          </form>

          <div className="auth-divider"><span>Or continue with</span></div>

          <button
            type="button"
            className="btn google-btn"
            onClick={() => alert('Google Sign-Up is not connected yet — this button is a placeholder for now.')}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.36 0-4.36-1.6-5.07-3.74H.9v2.33A9 9 0 009 18z"/>
              <path fill="#FBBC05" d="M3.93 10.68A5.4 5.4 0 013.64 9c0-.58.1-1.15.29-1.68V4.99H.9A9 9 0 000 9c0 1.45.35 2.83.9 4.01l3.03-2.33z"/>
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.9 4.99l3.03 2.33C4.64 5.18 6.64 3.58 9 3.58z"/>
            </svg>
            Sign up with Google
          </button>

          <p className="link-row">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>

      <div className="auth-split-right">
        <div className="auth-promo-card">
          <div className="auth-promo-top">
            <h2 className="auth-promo-title">Join FornoRosso</h2>
            <p className="auth-promo-subtitle">
              Create an account to build your perfect pizza, save favorites, and track every order live.
            </p>
          </div>

          <div className="auth-promo-middle">
            <div className="auth-promo-countdown-label">Today's offer ends in</div>
            <CountdownTimer />
          </div>

          <div className="auth-promo-offer">
            <div className="auth-promo-offer-icon">
              <svg className="live-flame" viewBox="0 0 40 50" width="26" height="32">
                <path className="flame-outer" d="M20 2 C10 15 6 22 6 32 C6 42 13 48 20 48 C27 48 34 42 34 32 C34 24 30 18 26 12 C26 20 22 22 20 18 C17 12 20 6 20 2 Z" />
                <path className="flame-inner" d="M20 16 C15 24 13 29 13 34 C13 40 16 44 20 44 C24 44 27 40 27 34 C27 29 24 25 22 21 C22 26 19 27 18 24 C17 20 20 18 20 16 Z" />
              </svg>
            </div>
            <div>
              <div className="auth-promo-offer-label">Today's Offer</div>
              <div className="auth-promo-offer-text">{todaysOffer}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;