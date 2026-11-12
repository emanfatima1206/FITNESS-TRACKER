import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { authApi } from '../../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message || 'Failed to submit reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Activity size={22} />
          </div>
          <h1>Fitness Tracker</h1>
        </div>
        <div className="auth-card">
          {sent ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  background: 'var(--color-primary-light)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <CheckCircle size={28} color="var(--color-primary)" />
              </div>
              <h2 style={{ marginBottom: 8 }}>Check your email</h2>
              <p style={{ marginBottom: 24 }}>
                We sent a password reset link to <strong>{email}</strong>
              </p>
              <Link to="/login" className="btn btn-primary w-full btn-lg">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2>Reset password</h2>
              <p>Enter your email and we&apos;ll send you a reset link</p>

              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius)',
                    background: 'var(--color-danger-light)',
                    color: 'var(--color-danger)',
                    fontSize: '0.8125rem',
                    marginBottom: 16,
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail
                      size={16}
                      style={{
                        position: 'absolute',
                        left: 11,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--color-text-muted)',
                      }}
                    />
                    <input
                      type="email"
                      className="form-control"
                      style={{ paddingLeft: 36 }}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner" style={{ width: 16, height: 16 }} /> Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
        <div className="auth-footer">
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
