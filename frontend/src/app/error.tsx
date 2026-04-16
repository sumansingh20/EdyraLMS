'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PublicMoodleShell from '@/components/layouts/PublicMoodleShell';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  // Extract a user-friendly message from the error
  const getUserMessage = () => {
    const msg = error?.message || '';
    if (msg.includes('toUpperCase') || msg.includes('toLowerCase') || msg.includes('Cannot read properties of undefined') || msg.includes('Cannot read properties of null')) {
      return 'A data loading error occurred. Some information may be temporarily unavailable.';
    }
    if (msg.includes('fetch') || msg.includes('network') || msg.includes('ECONNREFUSED')) {
      return 'Unable to connect to the server. Please check your connection and try again.';
    }
    if (msg.includes('401') || msg.includes('Unauthorized')) {
      return 'Your session has expired. Please log in again.';
    }
    if (msg.includes('403') || msg.includes('Forbidden')) {
      return 'You do not have permission to access this page.';
    }
    if (msg.includes('404') || msg.includes('Not Found')) {
      return 'The requested resource was not found.';
    }
    return 'An unexpected error occurred. Please try again.';
  };

  return (
    <PublicMoodleShell heading="Something Went Wrong" subheading="Application Error">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="mb-5 text-sm leading-7 text-slate-600">{getUserMessage()}</p>

        {error?.message && (
          <div className="mb-5 text-left">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs font-semibold text-cyan-700 underline"
            >
              {showDetails ? 'Hide Details' : 'Show Error Details'}
            </button>
            {showDetails && (
              <div className="mt-2 max-h-32 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                <code>{error.message}</code>
                {error.digest && <div className="mt-1 text-slate-500">Error ID: {error.digest}</div>}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              try {
                reset();
              } catch {
                window.location.reload();
              }
            }}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Reload Page
          </button>
          <Link href="/" className="rounded-lg border border-cyan-700 px-5 py-2.5 text-sm font-semibold text-cyan-700 no-underline hover:bg-cyan-50">
            Go to Home
          </Link>
        </div>
      </div>
    </PublicMoodleShell>
  );
}
