import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthSidePanel } from '../components/AuthSidePanel';
import { GoogleSignInButton } from '../components/GoogleSignInButton';

export const LoginPage: React.FC = () => {
  const { loginWithEmail } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await loginWithEmail(email, password);
    setLoading(false);
    if (error) {
      setError(error.message || 'Invalid email or password.');
      return;
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="grid lg:grid-cols-2 lg:min-h-screen">

        {/* Left: form */}
        <div className="flex items-center justify-center px-5 pt-8 pb-28 md:py-16">
          <div className="w-full max-w-sm space-y-6">

            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--brand)' }}>
                Welcome back
              </p>
              <h1 className="text-2xl font-black font-display" style={{ color: 'var(--text-primary)' }}>
                Log In
              </h1>
            </div>

            <div className="rounded-2xl p-6 border space-y-5 bet-card">
              <GoogleSignInButton
                label="Continue with Google"
                onError={setError}
              />

              <div className="flex items-center gap-3">
                <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
                <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>or continue with email</span>
                <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    className="text-[10px] font-bold uppercase tracking-widest block"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="subscriber@example.com"
                    className="input-field w-full rounded-xl px-4 py-3 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[10px] font-medium underline underline-offset-2"
                      style={{ color: 'var(--brand)' }}
                    >
                      Forgot?
                    </Link>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field w-full rounded-xl px-4 py-3 text-xs"
                  />
                </div>

                {error && (
                  <p className="text-xs font-semibold" style={{ color: '#e11d48' }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 rounded-xl transition-all hover:brightness-110 mt-2 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--brand)' }}
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
              </form>

              <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                No account?{' '}
                <Link
                  to="/signup"
                  className="font-semibold underline underline-offset-2"
                  style={{ color: 'var(--brand)' }}
                >
                  Sign up free
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right: visual panel */}
        <div className="hidden lg:block relative" style={{ backgroundColor: 'var(--bg-surface)', borderLeft: '1px solid var(--border)' }}>
          <AuthSidePanel />
        </div>
      </div>
    </div>
  );
};
