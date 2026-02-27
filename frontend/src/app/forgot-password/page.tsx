'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

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
      <main className="login-main">
        <div className="login-container">
          <div className="login-box">
            <div className="login-box-header">
              <div className="login-box-title">Forgotten Password</div>
              <div className="login-box-subtitle">
                {submitted
                  ? 'Check your email for reset instructions'
                  : 'Enter your email address to reset your password'}
              </div>
            </div>

            <div className="login-box-body">
              {submitted ? (
                <div>
                  <div className="login-notice">
                    If an account exists with the email address you entered, you will receive
                    an email with instructions on how to reset your password.
                  </div>
                  <div className="login-notice" style={{ marginTop: '12px' }}>
                    If you do not receive an email within a few minutes, please check your
                    spam folder or try again.
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="login-field">
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your registered email address"
                      required
                      autoComplete="email"
                    />
                    <div className="login-field-hint">
                      Enter the email address associated with your account
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="login-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Reset Password'}
                  </button>
                </form>
              )}
            </div>

            <div className="login-box-footer">
              <Link href="/login">Return to login</Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="login-footer">
        <p>&copy; 2026 ProctoredExam. All rights reserved.</p>
        <p style={{ marginTop: '4px' }}>
          For technical support, contact: support@proctoredexam.com | +91-XXX-XXXXXXX
        </p>
      </footer>
    </div>
  );
}
