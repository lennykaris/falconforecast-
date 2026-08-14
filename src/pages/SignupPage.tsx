import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const SignupPage: React.FC = () => {
  const { loginWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    const { error } = await loginWithGoogle();
    if (error) {
      setGoogleLoading(false);
    }
    // On success, Supabase redirects the browser to Google, so no further action here.
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

          <p className="text-center text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            We only support sign up with Google — no passwords to remember or leak.
          </p>

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
