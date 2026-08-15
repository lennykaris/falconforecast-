import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Crown, Mail, Percent, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthSidePanel } from '../components/AuthSidePanel';
import { GoogleSignInButton } from '../components/GoogleSignInButton';

export const SignupPage: React.FC = () => {
  const { signupWithEmail } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error, needsEmailConfirmation } = await signupWithEmail(email, password, name || 'New Member');
    setLoading(false);
    if (error) {
      setError(error.message || 'Could not create your account.');
      return;
    }
    if (needsEmailConfirmation) {
      setAwaitingConfirmation(true);
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
              {awaitingConfirmation ? (
                <div className="text-center space-y-3 py-2">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: 'var(--brand-light)' }}>
                    <Mail className="w-5 h-5" style={{ color: 'var(--brand)' }} />
                  </div>
                  <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Confirm your email</h2>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then log in.
                  </p>
                  <Link
                    to="/login"
                    className="inline-block text-xs font-semibold underline underline-offset-2"
                    style={{ color: 'var(--brand)' }}
                  >
                    Back to Log In
                  </Link>
                </div>
              ) : (
                <>
              <GoogleSignInButton
                label="Continue with Google"
                onSuccess={() => navigate('/dashboard')}
                onError={setError}
              />

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
                </>
              )}
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
