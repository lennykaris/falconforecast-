import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Crown, Percent, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthSidePanel } from '../components/AuthSidePanel';

export const SignupPage: React.FC = () => {
  const { loginWithGoogle, signupWithEmail } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignup = async () => {
    setError(null);
    setGoogleLoading(true);
    const { error } = await loginWithGoogle();
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
    // On success, Supabase redirects the browser to Google, so no further action here.
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signupWithEmail(email, password, name || 'New Member');
    setLoading(false);
    if (error) {
      setError(error.message || 'Could not create your account.');
      return;
    }
    navigate('/dashboard');
  };

  const perks = [
    { icon: Target, label: 'Free daily match predictions' },
    { icon: Percent, label: 'Win probability ratings' },
    { icon: Activity, label: 'Form analysis & match rationale' },
    { icon: Crown, label: 'Upgrade to VIP anytime' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="grid lg:grid-cols-2 lg:min-h-screen">

        {/* Left: form */}
        <div className="flex items-center justify-center px-5 pt-8 pb-28 md:py-16">
          <div className="w-full max-w-sm space-y-6">

            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--brand)' }}>
                Free account
              </p>
              <h1 className="text-2xl font-black font-display" style={{ color: 'var(--text-primary)' }}>
                Create Account
              </h1>
            </div>

            {/* Perks */}
            <div className="grid grid-cols-2 gap-2.5">
              {perks.map(perk => (
                <div
                  key={perk.label}
                  className="flex items-start gap-2 rounded-xl p-3 border"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}
                >
                  <perk.icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--brand)' }} />
                  <span className="text-[11px] font-semibold leading-snug" style={{ color: 'var(--text-secondary)' }}>
                    {perk.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="rounded-2xl p-6 bet-card space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={googleLoading}
                className="w-full py-3.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2.5 transition-colors hover:brightness-105 disabled:opacity-50"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
              >
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                </svg>
                {googleLoading ? 'Redirecting...' : 'Continue with Google'}
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
                <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>or continue with email</span>
                <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
              </div>

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
                    required
                    minLength={6}
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

        {/* Right: visual panel */}
        <div className="hidden lg:block relative" style={{ backgroundColor: 'var(--bg-surface)', borderLeft: '1px solid var(--border)' }}>
          <AuthSidePanel />
        </div>
      </div>
    </div>
  );
};
