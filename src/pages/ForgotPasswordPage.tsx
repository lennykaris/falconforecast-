import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await sendPasswordReset(email);
    setLoading(false);
    if (error) {
      setError(error.message || 'Could not send reset link.');
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--brand)' }}>
            Reset password
          </p>
          <h1 className="text-2xl font-black font-display" style={{ color: 'var(--text-primary)' }}>
            Forgot Password
          </h1>
        </div>

        <div className="rounded-2xl p-6 border space-y-5 bet-card">
          {sent ? (
            <div className="text-center space-y-3 py-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: 'var(--brand-light)' }}>
                <Mail className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                If an account exists for <strong>{email}</strong>, we've sent a password reset link. Check your inbox.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest block" style={{ color: 'var(--text-secondary)' }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field w-full rounded-xl px-4 py-3 text-xs"
                />
              </div>

              {error && (
                <p className="text-xs font-semibold" style={{ color: '#e11d48' }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 rounded-xl transition-all hover:brightness-110 disabled:opacity-50"
                style={{ backgroundColor: 'var(--brand)' }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            <Link to="/login" className="font-semibold underline underline-offset-2" style={{ color: 'var(--brand)' }}>
              Back to Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
