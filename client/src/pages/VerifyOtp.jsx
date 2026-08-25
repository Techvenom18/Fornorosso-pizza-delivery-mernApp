import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Logo from '../components/Logo';

const VerifyOtp = () => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();

  const email = location.state?.email;
  const loginAs = location.state?.loginAs || 'user';
  const password = location.state?.password;

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!email) {
    navigate('/login');
    return null;
  }

  const handleDigitChange = (index, value) => {
    const clean = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);

    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (next.every((d) => d !== '') && next.join('').length === 6) {
      submitOtp(next.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      e.preventDefault();
      const next = pasted.split('');
      setDigits(next);
      submitOtp(pasted);
    }
  };

  const submitOtp = async (otp) => {
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
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!password) {
      showToast('Please go back and log in again to resend a code', 'error');
      return;
    }
    setResending(true);
    try {
      await API.post('/auth/login', { email, password });
      showToast('New code sent', 'success');
      setResendCooldown(30);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      showToast('Failed to resend code', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="page-narrow">
      <Logo />
      <div className="auth-card">
        <h2>Verify Your Login</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 24 }}>
          We sent a 6-digit code to <strong>{email}</strong>. Enter it below to continue.
        </p>

        <div className="otp-boxes" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              className="otp-box"
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading}
            />
          ))}
        </div>

        {error && <p className="error-text" style={{ textAlign: 'center' }}>{error}</p>}
        {loading && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Verifying...</p>}

        <div className="otp-resend-row">
          {resendCooldown > 0 ? (
            <span className="otp-resend-timer">Resend code in {resendCooldown}s</span>
          ) : (
            <button className="otp-resend-btn" onClick={handleResend} disabled={resending}>
              {resending ? 'Sending...' : 'Resend Code'}
            </button>
          )}
        </div>

        <p className="link-row" style={{ textAlign: 'center' }}>
          Wrong email? <Link to="/login">Go back</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;