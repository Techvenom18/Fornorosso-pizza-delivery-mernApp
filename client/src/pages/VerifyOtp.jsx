import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const email = location.state?.email;
  const loginAs = location.state?.loginAs || 'user';

  // If someone lands here directly without going through login first, send them back.
  if (!email) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/verify-otp', { email, otp });

      if (loginAs === 'admin' && res.data.user.role !== 'admin') {
        setError('This account does not have admin access. Try the User tab on Login instead.');
        setLoading(false);
        return;
      }

      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-narrow">
      <Logo />
      <div className="auth-card">
        <h2>Verify Your Login</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 20 }}>
          We sent a 6-digit code to <strong>{email}</strong>. Enter it below to continue.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            className="input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            required
            style={{ fontSize: '1.4rem', letterSpacing: '0.4em', textAlign: 'center' }}
          />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>
        <p className="link-row">
          Wrong email? <Link to="/login">Go back</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;