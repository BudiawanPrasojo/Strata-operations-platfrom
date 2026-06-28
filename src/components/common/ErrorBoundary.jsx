/**
 * ErrorBoundary.jsx
 *
 * Catches unhandled runtime errors in the React tree (e.g. Supabase failures,
 * unexpected nulls in complex components) so the entire app does not white-screen.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 */

import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production this would go to Sentry / logging service
    console.error('[STRATA ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-8">
        <div className="flex items-center gap-3 text-amber-400">
          <AlertTriangle size={24} />
          <span className="font-mono text-sm tracking-widest uppercase">
            Component Error
          </span>
        </div>

        <p className="text-sm text-graphite-400 text-center max-w-sm">
          Something went wrong loading this section. This is likely a temporary issue.
        </p>

        {this.state.error && (
          <p className="text-xs font-mono text-graphite-500 bg-graphite-800/40 px-3 py-2 rounded border border-graphite-700/40 max-w-sm text-center break-all">
            {this.state.error.message}
          </p>
        )}

        <button
          onClick={this.handleReset}
          className="flex items-center gap-2 px-4 py-2 text-xs font-mono tracking-wider border border-graphite-700/50 text-graphite-300 hover:border-amber-500/50 hover:text-amber-400 transition-colors rounded"
        >
          <RefreshCw size={12} />
          Try again
        </button>
      </div>
    );
  }
}
