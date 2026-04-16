import Link from 'next/link';
import PublicMoodleShell from '@/components/layouts/PublicMoodleShell';

export default function NotFound() {
  return (
    <PublicMoodleShell heading="Page Not Found" subheading="Resource Unavailable">
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-3 text-5xl font-black text-slate-800">404</div>
        <p className="mb-6 text-sm leading-7 text-slate-600">
          The page you requested does not exist or may have been moved. Use the navigation menu
          above or return to the homepage.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-slate-800">
            Go to Home
          </Link>
          <Link href="/login" className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 no-underline hover:bg-slate-100">
            Sign In
          </Link>
        </div>
      </div>
    </PublicMoodleShell>
  );
}
