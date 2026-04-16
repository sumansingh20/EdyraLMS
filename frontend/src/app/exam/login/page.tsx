'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import PublicMoodleShell from '@/components/layouts/PublicMoodleShell';

type ExamDetails = {
  examId: string;
  title: string;
  duration: number;
  totalQuestions: number;
  sessionToken: string;
};

const instructionItems = [
  'Do not switch tabs, minimize the window, or open other applications during the exam.',
  'Do not use blocked shortcuts like copy, paste, or right-click actions.',
  'Your exam is auto-submitted when the timer expires. Extensions are not guaranteed.',
  'Excess violations can automatically terminate your session based on exam policy.',
  'Answers are synced during the attempt, but stable internet is strongly recommended.',
  'Session access is bound to your identity and device context for exam integrity.',
];

export default function ExamLoginPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [examCode, setExamCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showDeviceTransfer, setShowDeviceTransfer] = useState(false);
  const [deviceTransferPassword, setDeviceTransferPassword] = useState('');
  const [examDetails, setExamDetails] = useState<ExamDetails | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      const fingerprint = result.visitorId;

      const response = await fetch(`${API_URL}/exam-engine/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-browser-fingerprint': fingerprint,
        },
        body: JSON.stringify({
          examId: examCode,
          userId,
          password,
          fingerprint,
          deviceTransferPassword: showDeviceTransfer ? deviceTransferPassword : undefined,
        }),
      });

      if (!response.ok && response.status >= 500) {
        setError('Server error. Please try again later.');
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (!data.success) {
        if (data.reason === 'exam_not_started') {
          const mins = Math.floor(data.startsIn / 60);
          const secs = data.startsIn % 60;
          setError(`Exam has not started yet. Starts in ${mins}m ${secs}s`);
        } else if (data.reason === 'exam_ended') {
          setError('This exam has ended.');
        } else if (data.reason === 'batch_not_active') {
          setError(data.message || 'Your batch is not active yet. Please wait.');
        } else if (data.reason === 'not_enrolled') {
          setError('You are not enrolled in this exam.');
        } else if (data.reason === 'device_transfer_available') {
          setShowDeviceTransfer(true);
          setError(data.message || 'You have an active session on another device. Enter device transfer password to continue.');
        } else if (data.reason === 'session_exists') {
          const resolvedExamId = data.examId || examCode;
          sessionStorage.setItem(`exam_session_${resolvedExamId}`, data.sessionToken);
          router.push(`/exam/${resolvedExamId}/attempt`);
          return;
        } else {
          setError(data.message || 'Login failed. Please check your credentials.');
        }
        setLoading(false);
        return;
      }

      const resolvedExamId = data.examId || examCode;
      sessionStorage.setItem(`exam_session_${resolvedExamId}`, data.sessionToken);

      if (data.resumed || data.deviceTransferred) {
        router.push(`/exam/${resolvedExamId}/attempt`);
        return;
      }

      setExamDetails({
        examId: data.examId,
        title: data.title || 'Examination',
        duration: data.duration,
        totalQuestions: data.totalQuestions,
        sessionToken: data.sessionToken,
      });
      setShowInstructions(true);
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection failed. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const startExam = () => {
    if (!examDetails) return;
    router.push(`/exam/${examDetails.examId}/attempt`);
  };

  if (showInstructions && examDetails) {
    return (
      <PublicMoodleShell heading="Exam Session Verification" subheading="Read all instructions before starting">
        <section className="mx-auto max-w-5xl rounded-[8px] border border-[#e2e8f0] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.08)]">
          <div className="border-b border-[#e2e8f0] px-6 py-6 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f47ad]">Exam Ready</p>
            <h1 className="mt-2 text-3xl font-bold text-[#1f2933]">{examDetails.title}</h1>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <span className="rounded-md bg-[#f8f9fb] px-3 py-1 font-semibold text-[#475569]">Duration: {examDetails.duration} minutes</span>
                <span className="rounded-md bg-[#f8f9fb] px-3 py-1 font-semibold text-[#475569]">Questions: {examDetails.totalQuestions}</span>
              </div>
          </div>

          <div className="px-6 py-6 sm:px-8">
            <h2 className="text-xl font-bold text-[#1f2933]">Important Instructions</h2>
            <ul className="mt-4 space-y-3">
                {instructionItems.map((item, index) => (
                  <li key={item} className="flex items-start gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8f9fb] px-4 py-3 text-sm leading-6 text-[#475569]">
                    <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#0f47ad] text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
            </ul>

            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              By clicking Start Exam, you confirm compliance with exam policy and monitoring rules.
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowInstructions(false);
                  const resolvedExamId = examDetails.examId || examCode;
                  sessionStorage.removeItem(`exam_session_${resolvedExamId}`);
                  setExamDetails(null);
                }}
                className="rounded-[9.6px] border border-[#8f959e] px-5 py-2.5 text-sm font-semibold text-[#334155] transition hover:bg-[#f8f9fb]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={startExam}
                className="moodle-btn-primary rounded-[9.6px] px-5 py-2.5 text-sm font-semibold transition"
              >
                Start Exam
              </button>
            </div>
          </div>
        </section>
      </PublicMoodleShell>
    );
  }

  return (
    <PublicMoodleShell heading="Exam candidate login" subheading="Direct exam access gateway">
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="rounded-[8px] bg-[#0f47ad] p-6 text-white shadow-[0_2px_8px_rgba(15,23,42,0.08)] lg:col-span-5 lg:p-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#dbe8f7]">Exam Gateway</p>
          <h1 className="text-3xl font-bold leading-tight">Secure proctored exam login</h1>
          <p className="mt-4 text-sm leading-7 text-[#e9f2fc]">
            Candidate identity, browser fingerprint, and session context are validated before exam entry.
          </p>

          <div className="mt-6 space-y-3 text-sm text-[#e9f2fc]">
            <p className="rounded-lg border border-white/20 bg-white/10 px-4 py-3">Use the exact exam code issued by your institution.</p>
            <p className="rounded-lg border border-white/20 bg-white/10 px-4 py-3">DOB-based password format depends on exam policy.</p>
            <p className="rounded-lg border border-white/20 bg-white/10 px-4 py-3">Do not attempt login from multiple devices simultaneously.</p>
          </div>
        </section>

        <section className="rounded-[8px] border border-[#e2e8f0] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.08)] lg:col-span-7">
          <div className="border-b border-[#e2e8f0] px-5 py-5 sm:px-8">
            <h2 className="text-2xl font-bold text-[#1f2933]">Exam Portal Login</h2>
            <p className="mt-1 text-sm text-[#64748b]">Enter exam credentials to access your scheduled attempt.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 px-5 py-5 sm:px-8 sm:py-6">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="examCode" className="mb-1.5 block text-sm font-semibold text-[#334155]">
                Exam Code
              </label>
              <input
                id="examCode"
                type="text"
                value={examCode}
                onChange={(e) => setExamCode(e.target.value)}
                placeholder="Enter exam code"
                required
                className="moodle-input w-full px-3 text-sm"
              />
            </div>

            <div>
              <label htmlFor="userId" className="mb-1.5 block text-sm font-semibold text-[#334155]">
                Student ID or Email
              </label>
              <input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your student ID or email"
                required
                className="moodle-input w-full px-3 text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-[#334155]">
                Password (Date of Birth)
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="DD-MM-YYYY or DDMMYYYY"
                required
                className="moodle-input w-full px-3 text-sm"
              />
              <p className="mt-1 text-xs text-[#64748b]">Enter DOB in the format shared by your institution.</p>
            </div>

            {showDeviceTransfer && (
              <div>
                <label htmlFor="deviceTransferPassword" className="mb-1.5 block text-sm font-semibold text-[#334155]">
                  Device Transfer Password
                </label>
                <input
                  id="deviceTransferPassword"
                  type="password"
                  value={deviceTransferPassword}
                  onChange={(e) => setDeviceTransferPassword(e.target.value)}
                  placeholder="Enter transfer password"
                  className="moodle-input w-full px-3 text-sm"
                />
                <p className="mt-1 text-xs text-amber-700">Use password provided by admin to migrate session to this device.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="moodle-btn-primary w-full rounded-[9.6px] px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Verifying...' : 'Login to Exam'}
            </button>

            <div className="rounded-lg border border-[#dbe8f7] bg-[#f0f6ff] px-4 py-3 text-xs leading-6 text-[#1e3a8a]">
              This system uses fingerprint and IP checks. All activity is monitored and logged for academic integrity.
            </div>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-3 border-t border-[#e2e8f0] bg-[#f8f9fb] px-5 py-4 text-sm sm:px-8">
            <Link href="/login" className="font-semibold text-[#0f47ad] transition hover:text-[#0a3b8f]">
              Staff Sign In
            </Link>
            <span className="text-[#cbd5e1]">|</span>
            <Link href="/help" className="font-semibold text-[#0f47ad] transition hover:text-[#0a3b8f]">
              Help
            </Link>
            <span className="text-[#cbd5e1]">|</span>
            <Link href="/" className="font-semibold text-[#0f47ad] transition hover:text-[#0a3b8f]">
              Home
            </Link>
          </div>
        </section>
      </div>
    </PublicMoodleShell>
  );
}
