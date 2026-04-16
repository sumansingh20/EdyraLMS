'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

type LinkItem = {
  label: string;
  href: string;
};

type HeroSlide = {
  badge: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
};

type WhyCard = {
  icon: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
};

type Announcement = {
  title: string;
  message: string;
  imageUrl: string;
  imageAlt: string;
  linkLabel: string;
  linkHref: string;
  isActive: boolean;
};

type Branding = {
  institutionName: string;
  portalName: string;
  institutionLogoUrl: string;
  institutionLogoAlt: string;
  portalLogoUrl: string;
  portalLogoAlt: string;
};

type StatCard = {
  key: string;
  label: string;
  helperText: string;
  value?: number;
};

type HomeContent = {
  sections: {
    hero: boolean;
    whyChoose: boolean;
    stats: boolean;
    announcements: boolean;
    quickLinks: boolean;
    contact: boolean;
    follow: boolean;
  };
  heroSlides: HeroSlide[];
  whyCards: WhyCard[];
  announcements: Announcement[];
  quickLinks: LinkItem[];
  socialLinks: LinkItem[];
  contact: {
    website: string;
    phone: string;
    email: string;
  };
  branding: Branding;
  statsCards: StatCard[];
};

const defaultHomeContent: HomeContent = {
  sections: {
    hero: true,
    whyChoose: true,
    stats: true,
    announcements: true,
    quickLinks: true,
    contact: true,
    follow: true,
  },
  heroSlides: [
    {
      badge: 'Learning Platform',
      title: 'Empowering Digital Education Through Structured LMS Experience',
      subtitle: 'A complete academic portal for course delivery, assessments, and learner support.',
      imageUrl: '',
      imageAlt: 'Students using an online learning platform',
      primaryCtaLabel: 'Log in to Portal',
      primaryCtaHref: '/login',
      secondaryCtaLabel: 'Exam Entry',
      secondaryCtaHref: '/exam/login',
    },
    {
      badge: 'Academic Updates',
      title: 'Unified Access to Courses, Announcements, and Examination Workflows',
      subtitle: 'Students and faculty can access a secure and consistent learning environment.',
      imageUrl: '',
      imageAlt: 'Academic updates and classroom collaboration',
      primaryCtaLabel: 'Explore Help',
      primaryCtaHref: '/help',
      secondaryCtaLabel: 'Register',
      secondaryCtaHref: '/register',
    },
  ],
  whyCards: [
    {
      icon: 'MOE',
      title: 'NEP Compliant',
      description: 'Aligned with the NEP 2020 academic framework and modern curriculum progression.',
      imageUrl: '',
      imageAlt: 'NEP-compliant program design',
    },
    {
      icon: 'JOB',
      title: 'Employer Oriented',
      description: 'Learning outcomes are mapped to practical skills expected in current job roles.',
      imageUrl: '',
      imageAlt: 'Employment-focused skill development',
    },
    {
      icon: 'GLO',
      title: 'Global Acceptance',
      description: 'Credit structure and coursework design are benchmarked with global standards.',
      imageUrl: '',
      imageAlt: 'Globally recognized learning framework',
    },
    {
      icon: 'FEE',
      title: 'Affordability',
      description: 'High-quality digital learning access at a sustainable and student-friendly cost.',
      imageUrl: '',
      imageAlt: 'Affordable digital learning model',
    },
  ],
  announcements: [
    {
      title: 'Site announcements',
      message: 'There are no discussion topics yet in this forum.',
      imageUrl: '',
      imageAlt: 'Site announcement',
      linkLabel: 'Contact site support',
      linkHref: '/help',
      isActive: true,
    },
  ],
  quickLinks: [
    { label: 'LMS Home', href: '/' },
    { label: 'Log in', href: '/login' },
    { label: 'Direct Exam Access', href: '/exam/login' },
    { label: 'Help and Documentation', href: '/help' },
  ],
  socialLinks: [
    { label: 'Facebook', href: '#' },
    { label: 'X', href: '#' },
    { label: 'LinkedIn', href: '#' },
    { label: 'YouTube', href: '#' },
    { label: 'Instagram', href: '#' },
  ],
  contact: {
    website: 'https://cet.iitp.ac.in',
    phone: '+91 6115 123 456',
    email: 'cet_off@iitp.ac.in',
  },
  branding: {
    institutionName: 'IIT Patna',
    portalName: 'Center for Educational Technology',
    institutionLogoUrl: '',
    institutionLogoAlt: 'Institution Logo',
    portalLogoUrl: '',
    portalLogoAlt: 'Portal Logo',
  },
  statsCards: [
    { key: 'activeUsers', label: 'Active users accessing resources', helperText: 'Total active users', value: 0 },
    { key: 'totalExams', label: 'Published examinations', helperText: 'Courses and exams available', value: 0 },
    { key: 'activeExams', label: 'Live or open examinations', helperText: 'Current session availability', value: 0 },
    { key: 'totalSubmissions', label: 'Total submissions received', helperText: 'All-time submission volume', value: 0 },
  ],
};

export default function HomePage() {
  const { isAuthenticated, user, isLoading, checkAuth } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [homeContent, setHomeContent] = useState<HomeContent>(defaultHomeContent);

  useEffect(() => {
    const verify = async () => {
      await checkAuth();
      setAuthChecked(true);
    };
    verify();
  }, [checkAuth]);

  useEffect(() => {
    const fetchHomepage = async () => {
      try {
        const response = await api.get('/public/homepage');
        const data = response.data?.data?.content;
        if (data) {
          setHomeContent({
            ...defaultHomeContent,
            ...data,
            sections: { ...defaultHomeContent.sections, ...(data.sections || {}) },
            contact: { ...defaultHomeContent.contact, ...(data.contact || {}) },
            branding: { ...defaultHomeContent.branding, ...(data.branding || {}) },
            heroSlides: Array.isArray(data.heroSlides) && data.heroSlides.length > 0 ? data.heroSlides : defaultHomeContent.heroSlides,
            whyCards: Array.isArray(data.whyCards) && data.whyCards.length > 0 ? data.whyCards : defaultHomeContent.whyCards,
            announcements: Array.isArray(data.announcements) ? data.announcements : defaultHomeContent.announcements,
            quickLinks: Array.isArray(data.quickLinks) && data.quickLinks.length > 0 ? data.quickLinks : defaultHomeContent.quickLinks,
            socialLinks: Array.isArray(data.socialLinks) && data.socialLinks.length > 0 ? data.socialLinks : defaultHomeContent.socialLinks,
            statsCards: Array.isArray(data.statsCards) && data.statsCards.length > 0 ? data.statsCards : defaultHomeContent.statsCards,
          });
        }
      } catch {
        setHomeContent(defaultHomeContent);
      }
    };

    fetchHomepage();
  }, []);

  useEffect(() => {
    if (isAuthenticated || homeContent.heroSlides.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % homeContent.heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [homeContent.heroSlides, isAuthenticated]);

  if (!authChecked || isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', borderColor: '#dee2e6', borderTopColor: '#1d4f91' }} />
          <p style={{ color: '#6c757d', fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    const dashboardUrl = user.role === 'admin' ? '/admin/dashboard' : user.role === 'teacher' ? '/teacher' : '/my';

    return (
      <div className="min-h-screen bg-[#f2f3f7] text-[#1d2125]">
        <header className="sticky top-0 z-40 bg-white shadow-[0_6px_24px_rgba(140,152,164,0.13)]">
          <div className="mx-auto flex min-h-[70px] max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <p className="text-xs tracking-wide text-[#64748b] sm:text-sm">Academic Learning Management Portal</p>
            <div className="flex items-center gap-5 text-xs sm:text-sm">
              <span className="text-[#64748b]">
                Signed in as <strong className="text-[#1d2125]">{user.firstName} {user.lastName}</strong>
              </span>
              <Link href={dashboardUrl} className="font-semibold text-[#0f47ad] transition hover:text-[#0a3b8f]">
                My Dashboard
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto flex min-h-[calc(100vh-56px)] max-w-4xl items-center px-4 py-10 sm:px-6 lg:px-8">
          <section className="w-full rounded-[8px] border border-[#dfe3e8] bg-white p-8 shadow-[0_6px_24px_rgba(140,152,164,0.13)] sm:p-10">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#64748b]">Welcome Back</p>
            <h1 className="text-3xl font-bold text-[#1d2125] sm:text-4xl">Continue to your role dashboard</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#475569] sm:text-base">
              Your session is active and your account role is{' '}
              <strong className="capitalize text-[#1d2125]">{user.role}</strong>. Continue to manage exams,
              submissions, and reports from your dashboard.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={dashboardUrl}
                className="rounded-md bg-[#0f47ad] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0a3b8f]"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/help"
                className="rounded-md border border-[#8f959e] px-6 py-3 text-sm font-semibold text-[#334155] transition hover:bg-[#f8f9fb]"
              >
                Help Center
              </Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  const activeAnnouncements = homeContent.announcements.filter((item) => item.isActive !== false);
  const currentSlide = homeContent.heroSlides[carouselIndex] || defaultHomeContent.heroSlides[0];

  return (
    <div className="min-h-screen bg-[#f2f3f7] text-[#1d2125]">
      <header className="sticky top-0 z-40 bg-white shadow-[0_6px_24px_rgba(140,152,164,0.13)]">
        <div className="mx-auto flex min-h-[70px] max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 no-underline">
            {homeContent.branding.portalLogoUrl ? (
              <div className="flex h-11 w-20 items-center justify-center rounded-[8px] border border-[#d6dee9] bg-white px-2">
                <img
                  src={homeContent.branding.portalLogoUrl}
                  alt={homeContent.branding.portalLogoAlt || 'Portal logo'}
                  className="max-h-9 w-auto object-contain"
                />
              </div>
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-[#0f47ad] text-sm font-bold tracking-wider text-white">
                LMS
              </div>
            )}
            <div>
              <p className="text-base font-bold text-[#1d2125] sm:text-lg">{homeContent.branding.portalName || 'Center for Educational Technology'}</p>
              <p className="text-xs text-[#64748b]">{homeContent.branding.institutionName || 'IIT Patna'}</p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            {homeContent.branding.institutionLogoUrl && (
              <div className="hidden h-10 w-24 items-center justify-center rounded-[8px] border border-[#d6dee9] bg-white px-2 sm:flex">
                <img
                  src={homeContent.branding.institutionLogoUrl}
                  alt={homeContent.branding.institutionLogoAlt || 'Institution logo'}
                  className="max-h-8 w-auto object-contain"
                />
              </div>
            )}
            <Link
              href="/login"
              className="rounded-md bg-[#0f47ad] px-4 py-2 font-semibold text-white no-underline transition hover:bg-[#0a3b8f]"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-md border border-[#8f959e] px-4 py-2 font-semibold text-[#334155] no-underline transition hover:bg-[#f8f9fb]"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <nav className="border-b border-[#e2e8f0] bg-[#f8f9fb]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-1 px-4 py-1 sm:px-6 lg:px-8">
          <Link href="/" className="rounded-sm border-b-2 border-[#0f47ad] bg-white px-3 py-2 text-sm font-semibold text-[#0f47ad] no-underline transition">
            Home
          </Link>
          <Link href="https://cet.iitp.ac.in/" className="rounded-sm border-b-2 border-transparent px-3 py-2 text-sm text-[#475569] no-underline transition hover:border-[#cbd5e1] hover:bg-white hover:text-[#0f47ad]">
            Institution
          </Link>
          <Link href="https://library.iitp.ac.in/" className="rounded-sm border-b-2 border-transparent px-3 py-2 text-sm text-[#475569] no-underline transition hover:border-[#cbd5e1] hover:bg-white hover:text-[#0f47ad]">
            Central Library
          </Link>
          <Link href="/exam/login" className="rounded-sm border-b-2 border-transparent px-3 py-2 text-sm text-[#475569] no-underline transition hover:border-[#cbd5e1] hover:bg-white hover:text-[#0f47ad]">
            Exam Login
          </Link>
        </div>
      </nav>

      {homeContent.sections.hero && (
      <section className="relative overflow-hidden border-b border-[#dfe3e8] bg-white text-[#1d2125]">

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-16">
          <div className="lg:col-span-7">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#64748b]">{currentSlide.badge}</p>
            <h1 className="text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">{currentSlide.title}</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#4b5563] sm:text-base">
              {currentSlide.subtitle}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={currentSlide.primaryCtaHref} className="rounded-md bg-[#f9cb4f] px-6 py-3 text-sm font-semibold text-[#1d2125] no-underline transition hover:bg-[#ffe39a]">
                {currentSlide.primaryCtaLabel}
              </Link>
              <Link href={currentSlide.secondaryCtaHref} className="rounded-md border border-[#d0d7de] px-6 py-3 text-sm font-semibold text-[#1d2125] no-underline transition hover:bg-[#f8f9fb]">
                {currentSlide.secondaryCtaLabel}
              </Link>
            </div>

            {homeContent.heroSlides.length > 1 && (
              <div className="mt-6 flex items-center gap-2">
                {homeContent.heroSlides.map((slide, index) => (
                  <button
                    key={slide.title + index}
                    type="button"
                    onClick={() => setCarouselIndex(index)}
                    className={`h-2.5 rounded-full transition-all ${index === carouselIndex ? 'w-8 bg-[#0f47ad]' : 'w-2.5 bg-[#cfd8e3]'}`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-md border border-[#dfe3e8] bg-white p-4 shadow-[0_6px_24px_rgba(140,152,164,0.13)]">
              <div className="mb-3 flex items-center justify-between text-xs text-[#6b7280]">
                <span>Slide {carouselIndex + 1} / {homeContent.heroSlides.length}</span>
                <span>{currentSlide.badge || 'Academic Updates'}</span>
              </div>
              {currentSlide.imageUrl ? (
                <div className="relative h-32 overflow-hidden rounded-md border border-white/25 sm:h-36">
                  <img
                    src={currentSlide.imageUrl}
                    alt={currentSlide.imageAlt || currentSlide.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/25" />
                  <p className="absolute left-3 top-3 text-xs uppercase tracking-[0.18em] text-white">Featured</p>
                </div>
              ) : (
                <div className="h-32 rounded-md border border-[#dfe3e8] bg-[#f8f9fb] p-4 sm:h-36">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#64748b]">Featured</p>
                  <p className="mt-2 text-lg font-bold leading-tight text-[#1d2125]">{currentSlide.title}</p>
                </div>
              )}
              <div className="mt-3 h-24 rounded-md border border-[#dfe3e8] bg-[#f8f9fb] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#64748b]">Spotlight</p>
                <p className="mt-2 text-sm font-semibold leading-snug text-[#1d2125]">{currentSlide.subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      <main>
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {homeContent.sections.whyChoose && (
          <div className="mb-8 rounded-md border border-[#dfe3e8] bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-black text-[#1d2125] sm:text-3xl">Why choose this LMS setup?</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#4b5563] sm:text-base">
              Structured to reflect institutional learning workflows with course delivery, examination tracking,
              and clear learner support channels.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {homeContent.whyCards.map((card) => (
                <article key={card.title} className="rounded-md border border-[#dfe3e8] bg-[#f8f9fb] p-4 transition hover:-translate-y-1 hover:bg-white hover:shadow-md">
                  {card.imageUrl && (
                    <div className="mb-3 h-28 overflow-hidden rounded-md border border-[#dfe3e8] bg-white">
                      <img src={card.imageUrl} alt={card.imageAlt || card.title} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="mb-3 inline-flex rounded-sm bg-[#0f47ad] px-2 py-1 text-xs font-bold tracking-widest text-white">
                    {card.icon}
                  </div>
                  <h3 className="text-base font-bold text-[#1d2125]">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#4b5563]">{card.description}</p>
                </article>
              ))}
            </div>
          </div>
          )}

          {homeContent.sections.stats && (
          <div className="mb-8 rounded-md border border-[#dfe3e8] bg-white p-6 sm:p-8">
            <div className="grid gap-6 md:grid-cols-4 md:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#64748b]">Platform Snapshot</p>
                <h3 className="mt-2 text-xl font-black text-[#1d2125] sm:text-2xl">Online Learning at Scale</h3>
              </div>

              {homeContent.statsCards.map((stat) => (
                <div key={stat.key} className="rounded-md border border-[#dfe3e8] bg-[#f8f9fb] p-4">
                  <p className="text-3xl font-black text-[#0f47ad]">{(stat.value || 0).toLocaleString('en-IN')}</p>
                  <p className="mt-1 text-sm text-[#4b5563]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          )}

          <div className="grid gap-6 lg:grid-cols-12">
            <section className="space-y-6 lg:col-span-8">
              {homeContent.sections.announcements && (
              <article className="rounded-md border border-[#dfe3e8] bg-white">
                <div className="border-b border-[#dfe3e8] px-5 py-4">
                  <h3 className="text-lg font-bold text-[#1d2125]">Site Announcements</h3>
                </div>
                <div className="space-y-4 px-5 py-5">
                  {activeAnnouncements.length === 0 && (
                    <div className="rounded-md border border-[#dfe3e8] bg-[#f8f9fb] p-4">
                      <p className="text-sm font-semibold text-[#1d2125]">There are no discussion topics yet in this forum.</p>
                    </div>
                  )}
                  {activeAnnouncements.map((item, index) => (
                    <div key={item.title + index} className="rounded-md border border-[#dfe3e8] bg-[#f8f9fb] p-4">
                      {item.imageUrl && (
                        <div className="mb-3 h-40 overflow-hidden rounded-md border border-[#dfe3e8] bg-white">
                          <img src={item.imageUrl} alt={item.imageAlt || item.title} className="h-full w-full object-cover" />
                        </div>
                      )}
                      <p className="text-sm font-semibold text-[#1d2125]">{item.title}</p>
                      <p className="mt-1 text-sm text-[#4b5563]">{item.message}</p>
                      {item.linkLabel && (
                        <Link href={item.linkHref || '/help'} className="mt-2 inline-flex text-sm font-semibold text-[#0f47ad] no-underline transition hover:text-[#0a3b8f]">
                          {item.linkLabel}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </article>
              )}

              {homeContent.sections.quickLinks && (
              <article className="rounded-md border border-[#dfe3e8] bg-white">
                <div className="border-b border-[#dfe3e8] px-5 py-4">
                  <h3 className="text-lg font-bold text-[#1d2125]">Additional Links</h3>
                </div>
                <div className="grid gap-3 px-5 py-5 sm:grid-cols-2">
                  {homeContent.quickLinks.map((quick, index) => (
                    <Link key={quick.label + index} href={quick.href || '#'} className="rounded-md border border-[#c4d1df] px-4 py-3 text-sm font-semibold text-[#0f47ad] no-underline transition hover:bg-[#f2f6fb]">
                      {quick.label}
                    </Link>
                  ))}
                </div>
              </article>
              )}
            </section>

            <aside className="space-y-6 lg:col-span-4">
              <article className="rounded-md border border-[#dfe3e8] bg-white">
                <div className="border-b border-[#dfe3e8] px-5 py-4">
                  <h3 className="text-lg font-bold text-[#1d2125]">Portal Login</h3>
                </div>
                <div className="space-y-3 px-5 py-5">
                  <p className="text-sm leading-6 text-[#4b5563]">You are not logged in. Use your institutional credentials to continue.</p>
                  <Link href="/login" className="inline-flex w-full items-center justify-center rounded-md bg-[#0f47ad] px-4 py-2.5 text-sm font-semibold text-white no-underline transition hover:bg-[#0a3b8f]">
                    Log in
                  </Link>
                </div>
              </article>

              {homeContent.sections.contact && (
              <article className="rounded-md border border-[#dfe3e8] bg-white">
                <div className="border-b border-[#dfe3e8] px-5 py-4">
                  <h3 className="text-lg font-bold text-[#1d2125]">Contact Us</h3>
                </div>
                <div className="space-y-3 px-5 py-5 text-sm text-[#4b5563]">
                  <p>Web: {homeContent.contact.website}</p>
                  <p>Phone: {homeContent.contact.phone}</p>
                  <p>Email: {homeContent.contact.email}</p>
                </div>
              </article>
              )}

              {homeContent.sections.follow && (
              <article className="rounded-md border border-[#dfe3e8] bg-white">
                <div className="border-b border-[#dfe3e8] px-5 py-4">
                  <h3 className="text-lg font-bold text-[#1d2125]">Follow Us</h3>
                </div>
                <div className="flex flex-wrap gap-2 px-5 py-5">
                  {homeContent.socialLinks.map((social) => (
                    <Link
                      key={social.label + social.href}
                      href={social.href}
                      className="rounded-sm border border-[#c4d1df] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#0f47ad] no-underline transition hover:bg-[#f2f6fb]"
                    >
                      {social.label}
                    </Link>
                  ))}
                </div>
              </article>
              )}
            </aside>
          </div>
        </section>
      </main>

      <footer className="bg-[#282829]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-white sm:px-6 lg:px-8">
          <p>
            You are not logged in. <Link href="/login" className="font-semibold text-[#93c5fd]">Log in</Link>
          </p>
          <p className="text-right">Powered by Moodle-compatible academic workflow design.</p>
        </div>
      </footer>
    </div>
  );
}
