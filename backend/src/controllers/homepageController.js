import { AuditLog, Exam, ExamSession, HomePageContent, Submission, User } from '../models/index.js';

const defaultContent = () => ({
  singletonKey: 'default',
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
      imageAlt: 'Students using the LMS portal',
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
      imageAlt: 'Academic announcements and updates',
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
      imageAlt: 'NEP compliant education structure',
    },
    {
      icon: 'JOB',
      title: 'Employer Oriented',
      description: 'Learning outcomes are mapped to practical skills expected in current job roles.',
      imageUrl: '',
      imageAlt: 'Employer oriented curriculum',
    },
    {
      icon: 'GLO',
      title: 'Global Acceptance',
      description: 'Credit structure and coursework design are benchmarked with global standards.',
      imageUrl: '',
      imageAlt: 'Global acceptance of program',
    },
    {
      icon: 'FEE',
      title: 'Affordability',
      description: 'High-quality digital learning access at a sustainable and student-friendly cost.',
      imageUrl: '',
      imageAlt: 'Affordable digital learning',
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
    institutionName: 'CET - IIT Patna',
    portalName: 'Academic Moodle-Style Portal',
    institutionLogoUrl: '',
    institutionLogoAlt: 'Institution Logo',
    portalLogoUrl: '',
    portalLogoAlt: 'Portal Logo',
  },
  statsCards: [
    {
      key: 'activeUsers',
      label: 'Active users accessing resources',
      helperText: 'Total active users across the platform',
    },
    {
      key: 'totalExams',
      label: 'Published examinations',
      helperText: 'Exams available in the system',
    },
    {
      key: 'activeExams',
      label: 'Live or open examinations',
      helperText: 'Current exam availability snapshot',
    },
    {
      key: 'totalSubmissions',
      label: 'Total submissions received',
      helperText: 'All-time submissions across exams',
    },
  ],
});

const getOrCreateContent = async () => {
  const initial = defaultContent();
  const content = await HomePageContent.findOneAndUpdate(
    { singletonKey: 'default' },
    { $setOnInsert: initial },
    { new: true, upsert: true }
  );
  return content;
};

const getLiveStats = async () => {
  const [activeUsers, totalExams, activeExams, totalSubmissions, liveSessions] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Exam.countDocuments(),
    Exam.countDocuments({ status: { $in: ['published', 'ongoing'] } }),
    Submission.countDocuments(),
    ExamSession.countDocuments({ status: 'active' }),
  ]);

  return {
    activeUsers,
    totalExams,
    activeExams,
    totalSubmissions,
    liveSessions,
  };
};

const normalizePayload = (payload = {}) => {
  const base = defaultContent();
  const next = { ...base, ...payload };

  next.sections = { ...base.sections, ...(payload.sections || {}) };
  next.contact = { ...base.contact, ...(payload.contact || {}) };
  next.branding = { ...base.branding, ...(payload.branding || {}) };

  next.heroSlides = Array.isArray(payload.heroSlides) ? payload.heroSlides.slice(0, 8) : base.heroSlides;
  next.whyCards = Array.isArray(payload.whyCards) ? payload.whyCards.slice(0, 8) : base.whyCards;
  next.announcements = Array.isArray(payload.announcements) ? payload.announcements.slice(0, 15) : base.announcements;
  next.quickLinks = Array.isArray(payload.quickLinks) ? payload.quickLinks.slice(0, 12) : base.quickLinks;
  next.socialLinks = Array.isArray(payload.socialLinks) ? payload.socialLinks.slice(0, 8) : base.socialLinks;
  next.statsCards = Array.isArray(payload.statsCards) ? payload.statsCards.slice(0, 6) : base.statsCards;

  return next;
};

export const getPublicHomepage = async (req, res, next) => {
  try {
    const contentDoc = await getOrCreateContent();
    const liveStats = await getLiveStats();
    const content = contentDoc.toObject();

    const statsCards = (content.statsCards || []).map((card) => ({
      ...card,
      value: liveStats[card.key] ?? 0,
    }));

    res.json({
      success: true,
      data: {
        content: {
          ...content,
          statsCards,
        },
        liveStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminHomepageContent = async (req, res, next) => {
  try {
    const contentDoc = await getOrCreateContent();
    const liveStats = await getLiveStats();

    res.json({
      success: true,
      data: {
        content: contentDoc,
        liveStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminHomepageContent = async (req, res, next) => {
  try {
    const normalized = normalizePayload(req.body || {});

    const updated = await HomePageContent.findOneAndUpdate(
      { singletonKey: 'default' },
      {
        $set: {
          ...normalized,
          updatedBy: req.user?._id || null,
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    await AuditLog.log({
      user: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'system-settings-updated',
      targetType: 'system',
      details: {
        setting: 'homepage-content',
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
    });

    res.json({
      success: true,
      message: 'Homepage content updated successfully.',
      data: {
        content: updated,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getPublicHomepage,
  getAdminHomepageContent,
  updateAdminHomepageContent,
};