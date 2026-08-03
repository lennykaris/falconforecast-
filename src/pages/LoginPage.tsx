import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { loginWithSupabase, loginWithPreset } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setLoading(true);
      await loginWithSupabase(email, password);
      setLoading(false);
      navigate('/dashboard');
    }
  };

  const handleQuickLogin = (preset: 'free' | 'vip' | 'admin') => {
    loginWithPreset(preset);
    if (preset === 'admin') navigate('/admin');
    else navigate('/dashboard');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 pt-8 pb-28 md:py-16"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      <div className="w-full max-w-sm space-y-6">

        {/* Header */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--brand)' }}>
            Welcome back
          </p>
          <h1 className="text-2xl font-black font-display" style={{ color: 'var(--text-primary)' }}>
            Log In
          </h1>
        </div>

        {/* Demo shortcuts */}
        <div
          className="rounded-xl p-4 border space-y-3"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Demo Profiles
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'free' as const, label: 'Free User' },
              { key: 'vip' as const, label: 'VIP Pro' },
              { key: 'admin' as const, label: 'Admin' },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleQuickLogin(key)}
                className="py-2 rounded-lg text-[11px] font-semibold border transition-colors"
                style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div
          className="rounded-2xl p-6 border space-y-5 bet-card"
        >
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
                <a
                  href="#forgot"
                  className="text-[10px] font-medium underline underline-offset-2"
                  style={{ color: 'var(--brand)' }}
                >
                  Forgot?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field w-full rounded-xl px-4 py-3 text-xs"
              />
            </div>

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
  );
};

