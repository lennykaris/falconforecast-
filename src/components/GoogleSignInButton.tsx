import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, string>) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

interface GoogleSignInButtonProps {
  label: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ label, onSuccess, onError }) => {
  const { signInWithGoogleIdToken } = useAuth();
  const hiddenButtonRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;

    const handleCredential = async (response: { credential: string }) => {
      setLoading(true);
      const { error } = await signInWithGoogleIdToken(response.credential);
      setLoading(false);
      if (error) {
        onError(error.message);
      } else {
        onSuccess();
      }
    };

    const init = () => {
      if (cancelled || !window.google || !hiddenButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
      });
      window.google.accounts.id.renderButton(hiddenButtonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
      });
      setReady(true);
    };

    if (window.google) {
      init();
    } else {
      const script = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      script?.addEventListener('load', init);
      return () => script?.removeEventListener('load', init);
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = () => {
    if (!GOOGLE_CLIENT_ID) {
      onError('Google sign-in is not configured.');
      return;
    }
    const realButton = hiddenButtonRef.current?.querySelector<HTMLElement>('div[role="button"]');
    if (realButton) {
      realButton.click();
    } else {
      onError('Google sign-in is still loading — try again in a moment.');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || !ready}
        className="w-full py-3.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2.5 transition-colors hover:brightness-105 disabled:opacity-50"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
          <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
          <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
        </svg>
        {loading ? 'Signing in...' : label}
      </button>
      {/* Google's real button lives here, off-screen — our styled button above proxies a click to it */}
      <div ref={hiddenButtonRef} style={{ position: 'fixed', top: '-1000px', left: '-1000px' }} />
    </>
  );
};
