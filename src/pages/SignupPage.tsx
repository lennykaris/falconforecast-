import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const SignupPage: React.FC = () => {
  const { signupWithSupabase } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setLoading(true);
      await signupWithSupabase(email, password, name || 'New Member');
      setLoading(false);
      navigate('/dashboard');
    }
  };

  const perks = [
    'Free daily match predictions',
    'Win probability ratings',
    'Form analysis & match rationale',
    'Upgrade to VIP anytime',
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 pt-8 pb-28 md:py-16"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      <div className="w-full max-w-sm space-y-6">

        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--brand)' }}>
            Free account
          </p>
          <h1 className="text-2xl font-black font-display" style={{ color: 'var(--text-primary)' }}>
            Create Account
          </h1>
        </div>

        {/* Perks list */}
        <ul className="space-y-2">
          {perks.map(perk => (
            <li key={perk} className="flex items-center gap-2.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--brand)' }} />
              {perk}
            </li>
          ))}
        </ul>

        {/* Form */}
        <div className="rounded-2xl p-6 bet-card space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest block" style={{ color: 'var(--text-secondary)' }}>
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                className="input-field w-full rounded-xl px-4 py-3 text-xs"
              />
            </div>

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

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest block" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
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
              className="w-full py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 rounded-xl transition-all hover:brightness-110 mt-1 disabled:opacity-50"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              {loading ? 'Creating Account...' : 'Create Free Account'}
            </button>
          </form>

          <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold underline underline-offset-2" style={{ color: 'var(--brand)' }}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

