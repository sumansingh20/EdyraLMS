'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type Branding = {
  institutionName: string;
  portalName: string;
  institutionLogoUrl: string;
  institutionLogoAlt: string;
  portalLogoUrl: string;
  portalLogoAlt: string;
};

type PublicMoodleShellProps = {
  children: React.ReactNode;
  heading: string;
  subheading?: string;
};

const defaultBranding: Branding = {
  institutionName: 'IIT Patna',
  portalName: 'Center for Educational Technology',
  institutionLogoUrl: '',
  institutionLogoAlt: 'Institution Logo',
  portalLogoUrl: '',
  portalLogoAlt: 'Portal Logo',
};

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/login', label: 'Login' },
  { href: '/register', label: 'Register' },
  { href: '/help', label: 'Help' },
  { href: '/exam/login', label: 'Exam Login' },
];

function toCrumb(pathname: string): string {
  const item = pathname.split('/').filter(Boolean).pop() || '';
  if (!item) {
    return 'Home';
  }
  return item.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function PublicMoodleShell({ children, heading, subheading }: PublicMoodleShellProps) {
  const pathname = usePathname();
  const [branding, setBranding] = useState<Branding>(defaultBranding);

  useEffect(() => {
    const loadBranding = async () => {
      try {
        const response = await fetch('/api/public/homepage');
        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        const serverBranding = payload?.data?.content?.branding;
        if (serverBranding) {
          setBranding((prev) => ({ ...prev, ...serverBranding }));
        }
      } catch {
        // Keep defaults when branding endpoint is unavailable.
      }
    };

    loadBranding();
  }, []);

  return (
    <div className="min-h-screen bg-[#f2f3f7] text-[#1d2125]">
      <header className="sticky top-0 z-40 bg-white shadow-[0_6px_24px_rgba(140,152,164,0.13)]">
        <div className="mx-auto flex min-h-[70px] w-full flex-wrap items-center justify-between gap-4 px-[15px] py-3">
          <Link href="/" className="flex items-center gap-3 no-underline">
            {branding.portalLogoUrl ? (
              <div className="flex h-11 w-20 items-center justify-center rounded-[8px] border border-[#d6dee9] bg-white px-2">
                <img
                  src={branding.portalLogoUrl}
                  alt={branding.portalLogoAlt || 'Portal logo'}
                  className="max-h-9 w-auto object-contain"
                />
              </div>
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-[#0f47ad] text-sm font-bold tracking-wider text-white">
                LMS
              </div>
            )}

            <div>
              <p className="text-base font-bold text-[#1d2125] sm:text-lg">{branding.portalName || 'Center for Educational Technology'}</p>
              <p className="text-xs text-[#64748b]">{branding.institutionName || 'IIT Patna'}</p>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-sm border border-transparent px-3 py-2 text-sm no-underline transition ${
                    active
                      ? 'border-[#cfd8e3] bg-[#eef4ff] text-[#0f47ad]'
                      : 'text-[#4b5563] hover:border-[#dfe3e8] hover:bg-[#f8f9fb] hover:text-[#0f47ad]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <div className="border-b border-[#dfe3e8] bg-[#f8f9fb]">
        <div className="mx-auto w-full px-[15px] py-2 text-xs text-[#64748b]">
          <Link href="/" className="font-semibold text-[#0f47ad] no-underline">Home</Link>
          {pathname !== '/' && <span> / {toCrumb(pathname)}</span>}
        </div>
      </div>

      <main className="mx-auto w-full px-[15px] py-8">
        <section className="mb-6 rounded-[8px] border border-[#dfe3e8] bg-white px-6 py-5 shadow-[0_6px_24px_rgba(140,152,164,0.13)]">
          <h1 className="border-l-4 border-[#0f47ad] pl-3 text-2xl font-bold text-[#1d2125]">{heading}</h1>
          {subheading && <p className="mt-2 text-sm text-[#64748b]">{subheading}</p>}
        </section>
        {children}
      </main>

      <footer className="bg-[#282829]">
        <div className="mx-auto flex w-full flex-wrap items-center justify-between gap-3 px-[15px] py-4 text-xs text-white">
          <p>&copy; {new Date().getFullYear()} {branding.portalName || 'Center for Educational Technology'}</p>
          <p>{branding.institutionName || 'IIT Patna'}</p>
        </div>
      </footer>
    </div>
  );
}
