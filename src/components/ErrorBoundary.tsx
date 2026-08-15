import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/** Last-resort fallback UI for uncaught render errors anywhere in the tree.
 * Uses hardcoded colors rather than CSS vars/theme context, since a crash could
 * originate inside a provider this boundary wraps. */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled error caught by ErrorBoundary:', error, info);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: '#ffffff' }}>
          <div className="max-w-sm w-full text-center space-y-5">
            <h1 className="text-2xl font-black font-sans" style={{ color: '#0f172a' }}>
              Something went wrong
            </h1>
            <p className="text-sm font-sans" style={{ color: '#334155' }}>
              An unexpected error occurred. Try reloading — if it keeps happening, let us know what you were doing.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-3.5 text-xs font-bold uppercase tracking-wider text-white rounded-xl transition-all hover:brightness-110"
              style={{ backgroundColor: '#00a8ff' }}
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
