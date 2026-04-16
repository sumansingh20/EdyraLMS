'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import PublicMoodleShell from '@/components/layouts/PublicMoodleShell';

type LoginMode = 'staff' | 'student';

export default function LoginPage() {
  const { login, dobLogin } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [serverTime, setServerTime] = useState('');
  const [loginMode, setLoginMode] = useState<LoginMode>('student');
  const [showPassword, setShowPassword] = useState(false);

  const [staffForm, setStaffForm] = useState({ email: '', password: '' });
  const [studentForm, setStudentForm] = useState({ studentId: '', dob: '' });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchServerTime = useCallback(async () => {
    try {
      const response = await api.get('/auth/server-time');
      const data = response.data.data || response.data;
      if (data.serverTime) {
        const serverDate = new Date(data.serverTime);
        setServerTime(
          serverDate.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          })
        );
      }
    } catch {
      setServerTime(
        new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchServerTime();
    const timer = setInterval(fetchServerTime, 30000);
    return () => clearInterval(timer);
  }, [mounted, fetchServerTime]);

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const result = await login(staffForm.email, staffForm.password);
      if (result.success && result.user) {
        setSuccess('Login successful. Redirecting...');
        setTimeout(() => {
          if (result.user?.role === 'admin') {
            window.location.href = '/admin/dashboard';
            return;
          }
          if (result.user?.role === 'teacher') {
            window.location.href = '/teacher';
            return;
          }
          window.location.href = '/my';
        }, 500);
      } else {
        setError(result.error || 'Authentication failed. Please check your credentials.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
      setIsSubmitting(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const dobClean = studentForm.dob.replace(/[^0-9]/g, '');
    if (dobClean.length !== 8) {
      setError('Please enter DOB in DDMMYYYY format (example: 01012000).');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await dobLogin(studentForm.studentId, dobClean);
      if (result.success && result.user) {
        setSuccess('Login successful. Redirecting to your dashboard...');
        setTimeout(() => {
          window.location.href = '/my';
        }, 500);
      } else {
        setError(result.error || 'Authentication failed. Please check your Student ID and Date of Birth.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f2f3f7]">
        <p className="text-sm text-[#6b7280]">Loading...</p>
      </div>
    );
  }

  return (
    <PublicMoodleShell heading="Log in" subheading="Center for Educational Technology">
      <div className="mx-auto max-w-5xl rounded-[8px] border border-[#dfe3e8] bg-white shadow-[0_6px_24px_rgba(140,152,164,0.13)]">
        <div className="grid gap-0 lg:grid-cols-12">
          <section className="border-b border-[#e2e8f0] bg-[#f8f9fb] p-6 lg:col-span-5 lg:border-b-0 lg:border-r lg:p-8">
            <h2 className="text-2xl font-bold text-[#1d2125]">Returning to this website?</h2>
            <p className="mt-3 text-sm leading-7 text-[#475569]">
              Students can authenticate using Student ID and DOB format. Staff and administrators can sign in with email credentials.
            </p>
            <div className="mt-5 space-y-2 text-sm text-[#475569]">
              <p>Exam access is validated during your assigned exam window.</p>
              <p>All login attempts and session activity are securely monitored.</p>
              <p>Need support? Visit the help center for recovery and exam-entry guidance.</p>
            </div>
            <p className="mt-6 rounded-md border border-[#e2e8f0] bg-white px-3 py-2 font-mono text-xs text-[#64748b]">
              Server time: {serverTime}
            </p>
          </section>

          <section className="p-6 lg:col-span-7 lg:p-8">
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-md bg-[#eef4ff] p-1">
              <button
                type="button"
                onClick={() => {
                  setLoginMode('student');
                  setError('');
                  setSuccess('');
                }}
                className={`rounded-sm px-3 py-2 text-sm font-semibold transition ${
                  loginMode === 'student' ? 'bg-white text-[#0f47ad] shadow-sm' : 'text-[#64748b] hover:text-[#0f47ad]'
                }`}
              >
                Student Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMode('staff');
                  setError('');
                  setSuccess('');
                }}
                className={`rounded-sm px-3 py-2 text-sm font-semibold transition ${
                  loginMode === 'staff' ? 'bg-white text-[#0f47ad] shadow-sm' : 'text-[#64748b] hover:text-[#0f47ad]'
                }`}
              >
                Staff and Admin
              </button>
            </div>

            {success && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            {loginMode === 'student' && (
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div>
                  <label htmlFor="studentId" className="mb-1.5 block text-sm font-semibold text-[#334155]">
                    Student ID or Roll Number
                  </label>
                  <input
                    id="studentId"
                    type="text"
                    value={studentForm.studentId}
                    onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                    placeholder="Example: STU001"
                    required
                    autoComplete="username"
                    className="moodle-input w-full px-3 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="dob" className="mb-1.5 block text-sm font-semibold text-[#334155]">
                    Date of Birth
                  </label>
                  <input
                    id="dob"
                    type="text"
                    value={studentForm.dob}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 8);
                      setStudentForm({ ...studentForm, dob: val });
                    }}
                    placeholder="DDMMYYYY"
                    required
                    maxLength={8}
                    autoComplete="bday"
                    className="moodle-input w-full px-3 font-mono text-sm tracking-wider"
                  />
                  <p className="mt-1 text-xs text-[#64748b]">Format: DDMMYYYY (example: 01012000)</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="moodle-btn-primary w-full px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            )}

            {loginMode === 'staff' && (
              <form onSubmit={handleStaffSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-[#334155]">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    placeholder="you@institution.edu"
                    required
                    autoComplete="email"
                    className="moodle-input w-full px-3 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-[#334155]">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={staffForm.password}
                      onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                      className="moodle-input w-full px-3 pr-16 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-semibold text-[#64748b] transition hover:bg-[#eef4ff]"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="moodle-btn-primary w-full px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            )}

            <div className="mt-5 rounded-md border border-[#e2e8f0] bg-[#f8f9fb] px-4 py-3 text-xs leading-6 text-[#475569]">
              {loginMode === 'student'
                ? 'Student login is enabled only during assigned exam windows. Unauthorized attempts are logged.'
                : 'This is a secured system. All authentication activity is monitored and audited.'}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 border-t border-[#e2e8f0] pt-4 text-sm">
            <Link href="/forgot-password" className="font-semibold text-[#0f47ad] transition hover:text-[#0a3b8f]">
              Forgot Password
            </Link>
            <span className="text-[#cbd5e1]">|</span>
            <Link href="/help" className="font-semibold text-[#0f47ad] transition hover:text-[#0a3b8f]">
              Help
            </Link>
            <span className="text-[#cbd5e1]">|</span>
            <Link href="/register" className="font-semibold text-[#0f47ad] transition hover:text-[#0a3b8f]">
              Register
            </Link>
          </div>
        </section>
        </div>
      </div>
    </PublicMoodleShell>
  );
}
