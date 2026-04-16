import Link from 'next/link';
import PublicMoodleShell from '@/components/layouts/PublicMoodleShell';

const examRules = [
  {
    title: 'Secure Browser Discipline',
    desc: 'Do not switch tabs, open other windows, or trigger blocked shortcuts during exam sessions.',
  },
  {
    title: 'Strict Timer Compliance',
    desc: 'Each exam has a fixed duration and auto-submission occurs when the timer reaches zero.',
  },
  {
    title: 'Violation Monitoring',
    desc: 'Copy/paste, right-click, and navigation attempts are monitored and may trigger penalties.',
  },
  {
    title: 'Auto-Save Reliability',
    desc: 'Answers are synchronized during the session so progress can be recovered after reconnecting.',
  },
  {
    title: 'Question Navigation',
    desc: 'You can move between questions and return to review marked responses before final submit.',
  },
  {
    title: 'Session Integrity',
    desc: 'Exam sessions are bound to authenticated identity and monitored for suspicious behavior.',
  },
];

const faqs = [
  {
    q: 'What format should I use for Date of Birth login?',
    a: 'Use DDMMYYYY unless your institution has explicitly announced a different format.',
  },
  {
    q: 'My account is locked. What should I do?',
    a: 'Wait for lockout duration to end or contact the exam administration team for manual unlock.',
  },
  {
    q: 'I got disconnected during exam. Can I resume?',
    a: 'Yes, if your exam window is still active. Re-login and continue from saved progress.',
  },
  {
    q: 'Can I revisit previous questions?',
    a: 'Yes, unless exam configuration limits navigation for that specific paper.',
  },
  {
    q: 'What if I close the exam tab accidentally?',
    a: 'Re-login immediately. The event may be recorded as a violation depending on exam policy.',
  },
];

export default function HelpPage() {
  return (
    <PublicMoodleShell heading="Help and documentation" subheading="Support desk and exam guidance">
      <section className="mb-8 rounded-[8px] border border-[#dfe3e8] bg-white p-6 shadow-[0_6px_24px_rgba(140,152,164,0.13)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">Support Desk</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-[#1d2125] sm:text-4xl">Help and Examination Guidance</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#4b5563] sm:text-base">
            Use this page for quick-start instructions, exam rules, and issue-resolution references for students, teachers, and administrators.
        </p>
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <article className="moodle-card p-5 sm:p-6">
          <h2 className="text-xl font-bold text-[#1d2125]">Quick Start for Students</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-[#475569]">
              <li>Log in with Student ID and Date of Birth format assigned by your institution.</li>
              <li>Open My Exams and verify exam window timing before attempting.</li>
              <li>Read all instructions and keep the exam screen active throughout.</li>
              <li>Answer questions and review marked items before final submission.</li>
              <li>Check your results and review visibility after evaluation is released.</li>
          </ol>
        </article>

        <article className="moodle-card p-5 sm:p-6">
          <h2 className="text-xl font-bold text-[#1d2125]">Quick Start for Teachers</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-[#475569]">
              <li>Create and configure exams with schedule, duration, and security controls.</li>
              <li>Maintain question banks and ensure final paper quality before publishing.</li>
              <li>Monitor live exam activity and intervene using authorized controls if needed.</li>
              <li>Review submission data, violations, and question-level performance insights.</li>
              <li>Publish results and provide guided feedback where applicable.</li>
          </ol>
        </article>
      </section>

      <section className="moodle-card mb-8 p-5 sm:p-6">
        <h2 className="text-xl font-bold text-[#1d2125]">Exam Rules and Policy</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {examRules.map((rule) => (
              <article key={rule.title} className="rounded-md border border-[#e2e8f0] bg-[#f8f9fb] p-4">
                <h3 className="text-sm font-bold text-[#1d2125]">{rule.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#475569]">{rule.desc}</p>
              </article>
            ))}
        </div>
      </section>

      <section className="moodle-card mb-8 p-5 sm:p-6">
        <h2 className="text-xl font-bold text-[#1d2125]">Frequently Asked Questions</h2>
        <div className="mt-4 space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="rounded-md border border-[#e2e8f0] bg-[#f8f9fb] p-4">
                <summary className="cursor-pointer text-sm font-semibold text-[#1d2125]">{faq.q}</summary>
                <p className="mt-2 text-sm leading-6 text-[#475569]">{faq.a}</p>
              </details>
            ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="moodle-card p-5 sm:p-6">
          <h2 className="text-xl font-bold text-[#1d2125]">Contact Support</h2>
          <p className="mt-3 text-sm leading-7 text-[#475569]">Email: support@proctoredexam.com</p>
          <p className="text-sm leading-7 text-[#475569]">Phone: +91-XXX-XXXXXXX (exam hours)</p>
        </article>

        <article className="moodle-card p-5 sm:p-6">
          <h2 className="text-xl font-bold text-[#1d2125]">Quick Actions</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/" className="rounded-md border border-[#8f959e] px-4 py-2 text-sm font-semibold text-[#334155] transition hover:bg-[#f8f9fb]">
                Back to Home
            </Link>
            <Link href="/login" className="moodle-btn-primary rounded-md px-4 py-2 text-sm font-semibold transition">
                Login to Portal
            </Link>
          </div>
        </article>
      </section>
    </PublicMoodleShell>
  );
}
