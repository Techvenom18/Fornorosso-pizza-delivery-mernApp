import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import Logo from '../components/Logo';

// Landing page for the link inside the "Verify your email" message.
const VerifyEmail = () => {
  const { token } = useParams();
  const [state, setState] = useState({ status: 'loading', message: '' });

  useEffect(() => {
    let cancelled = false;

    API.get(`/auth/verify-email/${token}`)
      .then((res) => {
        if (!cancelled) setState({ status: 'success', message: res.data.message });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            status: 'error',
            message: err.response?.data?.message || 'Verification failed. Please try again.',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="page-narrow">
      <Logo />
      <div className="auth-card">
        <h2>Email Verification</h2>

        {state.status === 'loading' && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
            Verifying your email...
          </p>
        )}

        {state.status === 'success' && (
          <p className="success-text" style={{ textAlign: 'center' }}>
            {state.message}
          </p>
        )}

        {state.status === 'error' && (
          <p className="error-text" style={{ textAlign: 'center' }}>
            {state.message}
          </p>
        )}

        <p className="link-row" style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/login">Go to login</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
