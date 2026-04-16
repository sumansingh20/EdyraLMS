'use client';

import Link from 'next/link';
import PublicMoodleShell from '@/components/layouts/PublicMoodleShell';

export default function ForbiddenPage() {
  return (
    <PublicMoodleShell heading="Access Forbidden" subheading="Authorization Required">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-3 text-5xl font-black text-amber-600">403</div>
        <p className="mb-6 text-sm leading-7 text-slate-600">
          You do not have permission to access this resource. This can happen when your role,
          session status, or exam window constraints do not match the requested page.
        </p>

        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900">
          <p className="mb-1 font-semibold">Possible reasons</p>
          <ul className="list-disc pl-5">
            <li>Your session has expired</li>
            <li>You are not assigned to this exam route</li>
            <li>The exam window has not started yet</li>
            <li>Your account has temporary access restrictions</li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/login" className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-slate-800">
            Sign In Again
          </Link>
          <Link href="/" className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 no-underline hover:bg-slate-100">
            Go to Home
          </Link>
        </div>
      </div>
    </PublicMoodleShell>
  );
}
