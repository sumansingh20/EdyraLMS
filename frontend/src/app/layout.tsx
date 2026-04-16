import type { Metadata } from 'next';
import { Oxygen } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/providers';
import './globals.css';

const bodyFont = Oxygen({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Moodle: Center for Educational Technology',
  description: 'Center for Educational Technology Moodle portal with learning and secure examination workflows.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={bodyFont.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-[#f2f3f7] text-[#1d2125] antialiased" suppressHydrationWarning>
        <ThemeProvider defaultTheme="light" storageKey="proctorexam-theme">
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'text-sm',
              style: {
                background: '#0f47ad',
                color: '#ffffff',
                borderRadius: '0.5rem',
                padding: '12px 16px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#f9fafb',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#f9fafb',
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
