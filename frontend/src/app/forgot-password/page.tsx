'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import PublicMoodleShell from '@/components/layouts/PublicMoodleShell';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Password reset email sent');
    } catch (error: any) {
      // Show success even on error to prevent email enumeration
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicMoodleShell heading="Forgotten Password" subheading="Account Recovery">
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="mb-5 text-sm text-slate-600">
          Enter your registered email address. If an account exists, reset instructions will be sent securely.
        </p>

        {submitted ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              If an account exists with this email, a reset link has been sent.
            </div>
            <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-xs text-cyan-800">
              Check spam/junk folder if you do not receive the email within a few minutes.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
            >
              {isSubmitting ? 'Sending...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500">
          <Link href="/login" className="font-semibold text-cyan-700 no-underline hover:text-cyan-800">Return to Sign In</Link>
          <span>|</span>
          <Link href="/help" className="font-semibold text-cyan-700 no-underline hover:text-cyan-800">Help</Link>
          <span>|</span>
          <Link href="/" className="font-semibold text-cyan-700 no-underline hover:text-cyan-800">Home</Link>
        </div>
      </div>
    </PublicMoodleShell>
  );
}
