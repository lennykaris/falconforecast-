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
const SCRIPT_LOAD_TIMEOUT_MS = 6000;

interface GoogleSignInButtonProps {
  label: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

/** Renders Google's own Sign-In button directly — no hidden-button/proxy-click trick.
 * That approach relied on Google internally emitting a `div[role="button"]`, which turned
 * out not to be guaranteed across browsers/account states in the real world. This is the
 * officially-supported path: Google's actual button is what the user actually clicks. */
export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ label, onError, onSuccess }) => {
  const { signInWithGoogleIdToken } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const [rendered, setRendered] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || initializedRef.current) return;
    let cancelled = false;

    const handleCredential = async (response: { credential: string }) => {
      const { error } = await signInWithGoogleIdToken(response.credential);
      if (error) onError(error.message);
      else onSuccess();
    };

    const init = () => {
      if (cancelled || initializedRef.current || !window.google || !containerRef.current) return;
      initializedRef.current = true;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
      });

      const width = Math.round(containerRef.current.getBoundingClientRect().width) || 320;
      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        text: label.toLowerCase().includes('sign up') ? 'signup_with' : 'continue_with',
        logo_alignment: 'center',
        width: String(Math.min(width, 400)),
      });
      setRendered(true);
    };

    if (window.google) {
      init();
    } else {
      const script = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      script?.addEventListener('load', init);
      const timeout = setTimeout(() => {
        if (!cancelled && !initializedRef.current) setTimedOut(true);
      }, SCRIPT_LOAD_TIMEOUT_MS);
      return () => {
        script?.removeEventListener('load', init);
        clearTimeout(timeout);
      };
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="w-full">
      <div ref={containerRef} className="w-full flex justify-center" style={{ minHeight: rendered ? undefined : '44px' }} />
      {!rendered && !timedOut && (
        <div
          className="w-full py-3.5 rounded-xl text-xs font-semibold text-center border"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-elevated)' }}
        >
          Loading Google Sign-In...
        </div>
      )}
      {timedOut && !rendered && (
        <p className="text-xs font-semibold text-center" style={{ color: '#e11d48' }}>
          Couldn't load Google Sign-In — an ad blocker or extension may be blocking accounts.google.com. Try disabling it, or use email below.
        </p>
      )}
    </div>
  );
};
