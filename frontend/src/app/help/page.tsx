import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="login-page">
      {/* Institutional Header */}
      <header className="login-header">
        <div className="login-header-inner">
          <div className="login-logo">
            <span className="login-logo-text">PE</span>
          </div>
          <div className="login-institute">
            <div className="login-institute-name">ProctoredExam</div>
            <div className="login-institute-sub">Secure Exam Portal</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px 16px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <h1 className="lms-section-title" style={{ fontSize: '1.75rem', marginBottom: '8px', textAlign: 'center' }}>
            Help &amp; Support
          </h1>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '32px' }}>
            Everything you need to know about using ProctoredExam
          </p>

          {/* Quick Start Guide */}
          <section className="lms-section" style={{ marginBottom: '32px' }}>
            <h2 className="lms-section-title">Quick Start Guide</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '16px' }}>
              <div className="lms-card" style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '12px', fontWeight: 600, fontSize: '1.1rem' }}>Students</h3>
                <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                  <li>Login with your Student ID and Date of Birth</li>
                  <li>Go to <strong>My Exams</strong> to see available exams</li>
                  <li>Click on an exam to view instructions</li>
                  <li>Start the exam when the window opens</li>
                  <li>Submit before the timer runs out</li>
                </ol>
              </div>
              <div className="lms-card" style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '12px', fontWeight: 600, fontSize: '1.1rem' }}>Teachers</h3>
                <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                  <li>Login with your email and password</li>
                  <li>Create exams from the <strong>Exams</strong> section</li>
                  <li>Add questions to your question bank</li>
                  <li>Monitor live exams in real-time</li>
                  <li>View results and violation reports</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Exam Rules */}
          <section className="lms-section" style={{ marginBottom: '32px' }}>
            <h2 className="lms-section-title">Exam Rules &amp; Instructions</h2>
            <div className="lms-info-box" style={{ marginTop: '16px', padding: '24px', lineHeight: '1.7' }}>
              <div style={{ marginBottom: '16px' }}>
                <strong>Secure Browser</strong>
                <p>Do not switch tabs, open new windows, or use keyboard shortcuts during the exam. All actions are monitored.</p>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Time Limit</strong>
                <p>Each exam has a strict time limit. Your exam will be auto-submitted when the timer expires.</p>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Violations</strong>
                <p>Tab switching, copy-paste, right-click, and other suspicious activities are flagged as violations. Too many violations may lead to auto-termination.</p>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Question Navigation</strong>
                <p>Use the question palette to navigate between questions. You can mark questions for review and return to them later.</p>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Auto-Save</strong>
                <p>Your answers are automatically saved. If you lose connection, you can resume from where you left off.</p>
              </div>
              <div>
                <strong>Calculator</strong>
                <p>If enabled by the teacher, an on-screen calculator is available during the exam.</p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="lms-section" style={{ marginBottom: '32px' }}>
            <h2 className="lms-section-title">Frequently Asked Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <details className="lms-card" style={{ padding: '16px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>What format should I enter my Date of Birth?</summary>
                <p style={{ marginTop: '8px', lineHeight: '1.6' }}>
                  Enter as DDMMYYYY. For example, if your birthday is June 15, 1995, enter <strong>15061995</strong>.
                </p>
              </details>
              <details className="lms-card" style={{ padding: '16px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>My account is locked. What should I do?</summary>
                <p style={{ marginTop: '8px', lineHeight: '1.6' }}>
                  After 5 failed login attempts, accounts are temporarily locked. Wait for the lockout period (2 hours) or contact your exam administrator.
                </p>
              </details>
              <details className="lms-card" style={{ padding: '16px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>I got disconnected during my exam. Can I resume?</summary>
                <p style={{ marginTop: '8px', lineHeight: '1.6' }}>
                  Yes. Log back in and navigate to the exam. Your answers are auto-saved and you can continue from where you left off, provided the exam time hasn&apos;t expired.
                </p>
              </details>
              <details className="lms-card" style={{ padding: '16px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Can I go back to previous questions?</summary>
                <p style={{ marginTop: '8px', lineHeight: '1.6' }}>
                  Yes, you can navigate freely between questions using the question palette on the side.
                </p>
              </details>
              <details className="lms-card" style={{ padding: '16px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>What happens if I accidentally close the browser?</summary>
                <p style={{ marginTop: '8px', lineHeight: '1.6' }}>
                  A tab-switch violation will be recorded. Log back in immediately and resume the exam. Multiple violations may result in exam termination.
                </p>
              </details>
            </div>
          </section>

          {/* Contact Support */}
          <section className="lms-section" style={{ marginBottom: '32px' }}>
            <h2 className="lms-section-title">Contact Support</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div className="lms-card" style={{ padding: '20px' }}>
                <strong>Email</strong>
                <p style={{ marginTop: '4px' }}>support@proctoredexam.com</p>
              </div>
              <div className="lms-card" style={{ padding: '20px' }}>
                <strong>Phone</strong>
                <p style={{ marginTop: '4px' }}>+91-XXX-XXXXXXX (During exam hours)</p>
              </div>
            </div>
          </section>

          {/* Back Links */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
            <Link href="/" className="lms-card" style={{ padding: '10px 24px', textDecoration: 'none', fontWeight: 500, textAlign: 'center' }}>
              Back to Home
            </Link>
            <Link href="/login" className="lms-card" style={{ padding: '10px 24px', textDecoration: 'none', fontWeight: 500, textAlign: 'center', background: '#1e40af', color: '#fff' }}>
              Login to Portal
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '0.85rem', borderTop: '1px solid #e2e8f0' }}>
        <p>&copy; {new Date().getFullYear()} ProctoredExam. All rights reserved.</p>
      </footer>
    </div>
  );
}
