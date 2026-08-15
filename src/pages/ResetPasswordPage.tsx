import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const ResetPasswordPage: React.FC = () => {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const [ready, setReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Clicking the emailed reset link lands here with a recovery token in the URL,
  // which the Supabase client turns into a temporary session automatically.
  useEffect(() => {
    let settled = false;
    const markReady = () => {
      if (!settled) {
        settled = true;
        setReady(true);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) markReady();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) markReady();
    });

    const timeout = setTimeout(() => {
      if (!settled) setInvalidLink(true);
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess(true);
    setTimeout(() => navigate('/login'), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--brand)' }}>
            Reset password
          </p>
          <h1 className="text-2xl font-black font-display" style={{ color: 'var(--text-primary)' }}>
            Set New Password
          </h1>
        </div>

        <div className="rounded-2xl p-6 border space-y-5 bet-card">
          {invalidLink ? (
            <div className="text-center space-y-3 py-2">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                This reset link is invalid or has expired. Request a new one.
              </p>
              <Link
                to="/forgot-password"
                className="inline-block text-xs font-semibold underline underline-offset-2"
                style={{ color: 'var(--brand)' }}
              >
                Request New Link
              </Link>
            </div>
          ) : success ? (
            <div className="text-center space-y-3 py-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Password updated. Redirecting you to log in...
              </p>
            </div>
          ) : !ready ? (
            <div className="text-center py-4">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Verifying link...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest block" style={{ color: 'var(--text-secondary)' }}>
                  New Password
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

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest block" style={{ color: 'var(--text-secondary)' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
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
                className="w-full py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 rounded-xl transition-all hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--brand)' }}
              >
                <KeyRound className="w-3.5 h-3.5" />
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
