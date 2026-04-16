'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import PublicMoodleShell from '@/components/layouts/PublicMoodleShell';

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, isLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && user) {
      router.replace(user.role === 'admin' ? '/admin/dashboard' : '/my');
    }
  }, [mounted, isLoading, user, router]);

  const passwordRequirements = [
    { test: (p: string) => p.length >= 8, text: 'At least 8 characters' },
    { test: (p: string) => /[A-Z]/.test(p), text: 'One uppercase letter' },
    { test: (p: string) => /[a-z]/.test(p), text: 'One lowercase letter' },
    { test: (p: string) => /[0-9]/.test(p), text: 'One number' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const failedRequirements = passwordRequirements.filter((req) => !req.test(formData.password));
    if (failedRequirements.length > 0) {
      setError('Password does not meet all requirements');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        studentId: formData.studentId || undefined,
      });
      if (!result.success) {
        setError(result.error || 'Registration failed');
        return;
      }
      toast.success('Registration successful. Please log in.');
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f2f3f7]">
        <p className="text-sm text-[#6b7280]">Loading...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f2f3f7]">
        <p className="text-sm text-[#6b7280]">Redirecting...</p>
      </div>
    );
  }

  return (
    <PublicMoodleShell heading="Create new account" subheading="Academic Moodle-Style Portal">
      <div className="mx-auto max-w-5xl rounded-[8px] border border-[#dfe3e8] bg-white shadow-[0_6px_24px_rgba(140,152,164,0.13)]">
        <div className="grid gap-0 lg:grid-cols-12">
          <section className="border-b border-[#e2e8f0] bg-[#f8f9fb] p-6 lg:col-span-5 lg:border-b-0 lg:border-r lg:p-8">
            <h2 className="text-2xl font-bold text-[#1d2125]">Create your portal account</h2>
            <p className="mt-3 text-sm leading-7 text-[#475569]">
              Register with your institutional email and profile details. Students can include their Student ID for faster exam mapping.
            </p>
            <div className="mt-6 rounded-md border border-[#e2e8f0] bg-white p-4 text-sm text-[#475569]">
              <p className="font-semibold text-[#1d2125]">Password policy</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {passwordRequirements.map((req) => (
                  <li key={req.text}>{req.text}</li>
                ))}
              </ul>
            </div>
            <Link href="/login" className="mt-5 inline-flex rounded-md border border-[#8f959e] px-4 py-2 text-sm font-semibold text-[#334155] transition hover:bg-[#f8f9fb]">
              Back to Sign In
            </Link>
          </section>

          <section className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 sm:px-8 sm:py-6">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-[#334155]">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@institution.edu"
                required
                autoComplete="email"
                className="moodle-input w-full px-3 text-sm"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="mb-1.5 block text-sm font-semibold text-[#334155]">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  required
                  className="moodle-input w-full px-3 text-sm"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="mb-1.5 block text-sm font-semibold text-[#334155]">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  required
                  className="moodle-input w-full px-3 text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="studentId" className="mb-1.5 block text-sm font-semibold text-[#334155]">
                Student ID (optional)
              </label>
              <input
                id="studentId"
                name="studentId"
                type="text"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="Example: 21BCS001"
                className="moodle-input w-full px-3 text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-[#334155]">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                autoComplete="new-password"
                className="moodle-input w-full px-3 text-sm"
              />
              <ul className="mt-2 space-y-1 text-xs">
                {passwordRequirements.map((req) => {
                  const passed = req.test(formData.password);
                  return (
                    <li key={req.text} className={passed ? 'text-emerald-600' : 'text-[#94a3b8]'}>
                      {passed ? '✓' : '•'} {req.text}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold text-[#334155]">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
                autoComplete="new-password"
                className="moodle-input w-full px-3 text-sm"
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-xs text-rose-600">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="moodle-btn-primary w-full px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-3 border-t border-[#e2e8f0] bg-[#f8f9fb] px-5 py-4 text-sm sm:px-8">
            <span className="text-[#64748b]">Already have an account?</span>
            <Link href="/login" className="font-semibold text-[#0f47ad] transition hover:text-[#0a3b8f]">
              Log in
            </Link>
          </div>
        </section>
        </div>
      </div>
    </PublicMoodleShell>
  );
}
