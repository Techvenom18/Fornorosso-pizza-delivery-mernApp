import { useState } from 'react';
import API from '../api/axios';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await API.post('/subscribers', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong - try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="newsletter">
      <div className="newsletter-title">Get deals in your inbox</div>
      {submitted ? (
        <p className="newsletter-success">You're on the list — check your inbox for today's offer!</p>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="newsletter-form">
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ marginBottom: 0 }}
            />
            <button type="submit" className="btn btn-primary btn-small" disabled={loading}>
              {loading ? 'Sending...' : 'Notify Me'}
            </button>
          </form>
          {error && <p className="error-text" style={{ marginTop: 8, marginBottom: 0 }}>{error}</p>}
        </>
      )}
    </div>
  );
};

export default Newsletter;