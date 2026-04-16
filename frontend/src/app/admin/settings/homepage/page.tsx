'use client';

import { CSSProperties, DragEvent, useEffect, useState } from 'react';
import LMSLayout from '@/components/layouts/LMSLayout';
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

type StatCard = {
  key: 'activeUsers' | 'totalExams' | 'activeExams' | 'totalSubmissions';
  label: string;
  helperText: string;
};

type Branding = {
  institutionName: string;
  portalName: string;
  institutionLogoUrl: string;
  institutionLogoAlt: string;
  portalLogoUrl: string;
  portalLogoAlt: string;
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

type LiveStats = {
  activeUsers: number;
  totalExams: number;
  activeExams: number;
  totalSubmissions: number;
  liveSessions?: number;
};

type ReorderableListKey =
  | 'heroSlides'
  | 'whyCards'
  | 'announcements'
  | 'quickLinks'
  | 'socialLinks'
  | 'statsCards';

type DragState = {
  list: ReorderableListKey;
  index: number;
};

const statKeyOptions: Array<{ value: StatCard['key']; label: string }> = [
  { value: 'activeUsers', label: 'Active users' },
  { value: 'totalExams', label: 'Total exams' },
  { value: 'activeExams', label: 'Active exams' },
  { value: 'totalSubmissions', label: 'Total submissions' },
];

const createEmptyHeroSlide = (): HeroSlide => ({
  badge: 'Learning Platform',
  title: 'New slide title',
  subtitle: 'Slide subtitle',
  imageUrl: '',
  imageAlt: '',
  primaryCtaLabel: 'Log in',
  primaryCtaHref: '/login',
  secondaryCtaLabel: 'Learn more',
  secondaryCtaHref: '/help',
});

const createEmptyWhyCard = (): WhyCard => ({
  icon: 'LMS',
  title: 'New card title',
  description: 'Card description',
  imageUrl: '',
  imageAlt: '',
});

const createEmptyAnnouncement = (): Announcement => ({
  title: 'New announcement',
  message: 'Announcement details',
  imageUrl: '',
  imageAlt: '',
  linkLabel: 'Read more',
  linkHref: '/help',
  isActive: true,
});

const createEmptyLink = (): LinkItem => ({
  label: 'New link',
  href: '/',
});

const createEmptyStatsCard = (): StatCard => ({
  key: 'activeUsers',
  label: 'Active users',
  helperText: 'Total active users',
});

const reorderByIndices = <T,>(items: T[], fromIndex: number, toIndex: number): T[] => {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Unable to read image file.'));
    reader.readAsDataURL(file);
  });

const resizeImageDataUrl = (dataUrl: string, originalType: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const maxDimension = 1400;
      const width = image.width;
      const height = image.height;

      let targetWidth = width;
      let targetHeight = height;

      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        targetWidth = Math.max(1, Math.round(width * ratio));
        targetHeight = Math.max(1, Math.round(height * ratio));
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Unable to process image.'));
        return;
      }

      ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

      const mimeType = originalType === 'image/png' ? 'image/png' : 'image/jpeg';
      const output = mimeType === 'image/jpeg' ? canvas.toDataURL(mimeType, 0.84) : canvas.toDataURL(mimeType);
      resolve(output);
    };

    image.onerror = () => reject(new Error('Invalid image file.'));
    image.src = dataUrl;
  });

const uploadImageAsDataUrl = async (file: File): Promise<string> => {
  const initial = await readFileAsDataUrl(file);

  if (file.size <= 700 * 1024) {
    return initial;
  }

  return resizeImageDataUrl(initial, file.type);
};

const defaultContent: HomeContent = {
  sections: {
    hero: true,
    whyChoose: true,
    stats: true,
    announcements: true,
    quickLinks: true,
    contact: true,
    follow: true,
  },
  heroSlides: [],
  whyCards: [],
  announcements: [],
  quickLinks: [],
  socialLinks: [],
  contact: {
    website: '',
    phone: '',
    email: '',
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
    { key: 'activeUsers', label: 'Active users', helperText: 'Total active users' },
    { key: 'totalExams', label: 'Published examinations', helperText: 'Total exams' },
    { key: 'activeExams', label: 'Live or open examinations', helperText: 'Current active exams' },
    { key: 'totalSubmissions', label: 'Total submissions', helperText: 'All-time submissions' },
  ],
};

export default function HomepageContentSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [content, setContent] = useState<HomeContent>(defaultContent);
  const [liveStats, setLiveStats] = useState<LiveStats>({
    activeUsers: 0,
    totalExams: 0,
    activeExams: 0,
    totalSubmissions: 0,
    liveSessions: 0,
  });
  const [uploading, setUploading] = useState('');
  const [dragState, setDragState] = useState<DragState | null>(null);

  const fetchContent = async () => {
    try {
      const response = await api.get('/admin/homepage-content');
      const payload = response.data?.data?.content;
      const stats = response.data?.data?.liveStats;

      if (payload) {
        const nextContent: HomeContent = {
          ...defaultContent,
          ...payload,
          sections: { ...defaultContent.sections, ...(payload.sections || {}) },
          contact: { ...defaultContent.contact, ...(payload.contact || {}) },
          branding: { ...defaultContent.branding, ...(payload.branding || {}) },
          heroSlides: Array.isArray(payload.heroSlides) ? payload.heroSlides : [],
          whyCards: Array.isArray(payload.whyCards) ? payload.whyCards : [],
          announcements: Array.isArray(payload.announcements) ? payload.announcements : [],
          quickLinks: Array.isArray(payload.quickLinks) ? payload.quickLinks : [],
          socialLinks: Array.isArray(payload.socialLinks) ? payload.socialLinks : [],
          statsCards: Array.isArray(payload.statsCards) ? payload.statsCards : defaultContent.statsCards,
        };

        setContent(nextContent);
      }

      if (stats) {
        setLiveStats(stats);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to fetch homepage content.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const saveContent = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/admin/homepage-content', content);
      setMessage({ type: 'success', text: 'Homepage content updated successfully.' });
      await fetchContent();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || err.message || 'Failed to save homepage content.' });
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (key: keyof HomeContent['sections']) => {
    setContent((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [key]: !prev.sections[key],
      },
    }));
  };

  const beginDrag = (list: ReorderableListKey, index: number) => {
    setDragState({ list, index });
  };

  const endDrag = () => {
    setDragState(null);
  };

  const allowDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const dropOn = (list: ReorderableListKey, toIndex: number) => {
    if (!dragState || dragState.list !== list || dragState.index === toIndex) {
      return;
    }

    setContent((prev) => {
      switch (list) {
        case 'heroSlides':
          return { ...prev, heroSlides: reorderByIndices(prev.heroSlides, dragState.index, toIndex) };
        case 'whyCards':
          return { ...prev, whyCards: reorderByIndices(prev.whyCards, dragState.index, toIndex) };
        case 'announcements':
          return { ...prev, announcements: reorderByIndices(prev.announcements, dragState.index, toIndex) };
        case 'quickLinks':
          return { ...prev, quickLinks: reorderByIndices(prev.quickLinks, dragState.index, toIndex) };
        case 'socialLinks':
          return { ...prev, socialLinks: reorderByIndices(prev.socialLinks, dragState.index, toIndex) };
        case 'statsCards':
          return { ...prev, statsCards: reorderByIndices(prev.statsCards, dragState.index, toIndex) };
        default:
          return prev;
      }
    });

    setDragState(null);
  };

  const getCardStyle = (list: ReorderableListKey, index: number): CSSProperties => {
    const base: CSSProperties = {
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: 16,
      display: 'grid',
      gap: 12,
      transition: 'all 0.2s ease',
      background: 'var(--bg-primary)',
    };

    if (dragState?.list === list && dragState.index === index) {
      return {
        ...base,
        opacity: 0.58,
        borderStyle: 'dashed',
      };
    }

    if (dragState?.list === list && dragState.index !== index) {
      return {
        ...base,
        borderColor: 'var(--primary)',
      };
    }

    return base;
  };

  const updateHeroSlide = (index: number, field: keyof HeroSlide, value: string) => {
    setContent((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.map((slide, i) => (i === index ? { ...slide, [field]: value } : slide)),
    }));
  };

  const updateWhyCard = (index: number, field: keyof WhyCard, value: string) => {
    setContent((prev) => ({
      ...prev,
      whyCards: prev.whyCards.map((card, i) => (i === index ? { ...card, [field]: value } : card)),
    }));
  };

  const updateAnnouncement = (index: number, field: keyof Announcement, value: string | boolean) => {
    setContent((prev) => ({
      ...prev,
      announcements: prev.announcements.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  const updateQuickLink = (index: number, field: keyof LinkItem, value: string) => {
    setContent((prev) => ({
      ...prev,
      quickLinks: prev.quickLinks.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  const updateSocialLink = (index: number, field: keyof LinkItem, value: string) => {
    setContent((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  const updateStatsCard = (index: number, field: keyof StatCard, value: string) => {
    setContent((prev) => ({
      ...prev,
      statsCards: prev.statsCards.map((item, i) => {
        if (i !== index) {
          return item;
        }

        if (field === 'key') {
          return { ...item, key: value as StatCard['key'] };
        }

        if (field === 'label') {
          return { ...item, label: value };
        }

        return { ...item, helperText: value };
      }),
    }));
  };

  const updateBranding = (field: keyof Branding, value: string) => {
    setContent((prev) => ({
      ...prev,
      branding: {
        ...prev.branding,
        [field]: value,
      },
    }));
  };

  const uploadHeroImage = async (index: number, file: File) => {
    setUploading(`hero-${index}`);
    setMessage({ type: '', text: '' });

    try {
      const imageUrl = await uploadImageAsDataUrl(file);
      updateHeroSlide(index, 'imageUrl', imageUrl);
      if (!content.heroSlides[index]?.imageAlt) {
        updateHeroSlide(index, 'imageAlt', content.heroSlides[index]?.title || 'Hero slide image');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to upload image.' });
    } finally {
      setUploading('');
    }
  };

  const uploadWhyCardImage = async (index: number, file: File) => {
    setUploading(`why-${index}`);
    setMessage({ type: '', text: '' });

    try {
      const imageUrl = await uploadImageAsDataUrl(file);
      updateWhyCard(index, 'imageUrl', imageUrl);
      if (!content.whyCards[index]?.imageAlt) {
        updateWhyCard(index, 'imageAlt', content.whyCards[index]?.title || 'Section card image');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to upload image.' });
    } finally {
      setUploading('');
    }
  };

  const uploadAnnouncementImage = async (index: number, file: File) => {
    setUploading(`announcement-${index}`);
    setMessage({ type: '', text: '' });

    try {
      const imageUrl = await uploadImageAsDataUrl(file);
      updateAnnouncement(index, 'imageUrl', imageUrl);
      if (!content.announcements[index]?.imageAlt) {
        updateAnnouncement(index, 'imageAlt', content.announcements[index]?.title || 'Announcement image');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to upload image.' });
    } finally {
      setUploading('');
    }
  };

  const uploadBrandingLogo = async (
    file: File,
    urlField: 'institutionLogoUrl' | 'portalLogoUrl',
    altField: 'institutionLogoAlt' | 'portalLogoAlt',
    fallbackAlt: string
  ) => {
    setUploading(`branding-${urlField}`);
    setMessage({ type: '', text: '' });

    try {
      const imageUrl = await uploadImageAsDataUrl(file);
      updateBranding(urlField, imageUrl);
      if (!content.branding[altField]) {
        updateBranding(altField, fallbackAlt);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to upload logo.' });
    } finally {
      setUploading('');
    }
  };

  if (loading) {
    return (
      <LMSLayout pageTitle="Homepage Content Settings">
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading homepage content...</div>
      </LMSLayout>
    );
  }

  return (
    <LMSLayout
      pageTitle="Homepage Content Settings"
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Settings', href: '/admin/settings' },
        { label: 'Homepage Content' },
      ]}
    >
      {message.text && (
        <div className={`lms-alert lms-alert-${message.type}`} style={{ marginBottom: 16 }}>
          {message.text}
        </div>
      )}

      <div className="lms-card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <h3 style={{ fontWeight: 600, color: 'var(--primary)' }}>Live Homepage Stats</h3>
        </div>
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <div className="lms-info-box">
            <div className="lms-info-box-title">Active Users</div>
            <div className="lms-info-box-value">{liveStats.activeUsers}</div>
          </div>
          <div className="lms-info-box">
            <div className="lms-info-box-title">Total Exams</div>
            <div className="lms-info-box-value">{liveStats.totalExams}</div>
          </div>
          <div className="lms-info-box">
            <div className="lms-info-box-title">Active Exams</div>
            <div className="lms-info-box-value">{liveStats.activeExams}</div>
          </div>
          <div className="lms-info-box">
            <div className="lms-info-box-title">Total Submissions</div>
            <div className="lms-info-box-value">{liveStats.totalSubmissions}</div>
          </div>
        </div>
      </div>

      <div className="lms-card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <h3 style={{ fontWeight: 600, color: 'var(--primary)' }}>Branding and Logos</h3>
        </div>
        <div style={{ padding: 20, display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            <div className="lms-form-group">
              <label className="lms-label">Institution Name</label>
              <input className="lms-input" value={content.branding.institutionName} onChange={(e) => updateBranding('institutionName', e.target.value)} />
            </div>
            <div className="lms-form-group">
              <label className="lms-label">Portal Name</label>
              <input className="lms-input" value={content.branding.portalName} onChange={(e) => updateBranding('portalName', e.target.value)} />
            </div>
          </div>

          <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12, display: 'grid', gap: 10 }}>
            <p style={{ fontWeight: 600 }}>Institution Logo</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    uploadBrandingLogo(file, 'institutionLogoUrl', 'institutionLogoAlt', 'Institution logo');
                  }
                }}
              />
              <button type="button" className="lms-btn lms-btn-secondary" onClick={() => updateBranding('institutionLogoUrl', '')} disabled={!content.branding.institutionLogoUrl}>
                Clear Logo
              </button>
              {uploading === 'branding-institutionLogoUrl' && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Uploading...</span>}
            </div>
            {content.branding.institutionLogoUrl && (
              <img src={content.branding.institutionLogoUrl} alt={content.branding.institutionLogoAlt || 'Institution logo'} style={{ maxWidth: 220, maxHeight: 90, objectFit: 'contain', border: '1px solid var(--border)', borderRadius: 8, background: 'white', padding: 6 }} />
            )}
            <div className="lms-form-group">
              <label className="lms-label">Institution Logo Alt Text</label>
              <input className="lms-input" value={content.branding.institutionLogoAlt} onChange={(e) => updateBranding('institutionLogoAlt', e.target.value)} />
            </div>
          </div>

          <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12, display: 'grid', gap: 10 }}>
            <p style={{ fontWeight: 600 }}>Portal Logo</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    uploadBrandingLogo(file, 'portalLogoUrl', 'portalLogoAlt', 'Portal logo');
                  }
                }}
              />
              <button type="button" className="lms-btn lms-btn-secondary" onClick={() => updateBranding('portalLogoUrl', '')} disabled={!content.branding.portalLogoUrl}>
                Clear Logo
              </button>
              {uploading === 'branding-portalLogoUrl' && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Uploading...</span>}
            </div>
            {content.branding.portalLogoUrl && (
              <img src={content.branding.portalLogoUrl} alt={content.branding.portalLogoAlt || 'Portal logo'} style={{ maxWidth: 220, maxHeight: 90, objectFit: 'contain', border: '1px solid var(--border)', borderRadius: 8, background: 'white', padding: 6 }} />
            )}
            <div className="lms-form-group">
              <label className="lms-label">Portal Logo Alt Text</label>
              <input className="lms-input" value={content.branding.portalLogoAlt} onChange={(e) => updateBranding('portalLogoAlt', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="lms-card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <h3 style={{ fontWeight: 600, color: 'var(--primary)' }}>Section Visibility</h3>
        </div>
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {(Object.keys(content.sections) as Array<keyof HomeContent['sections']>).map((key) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={content.sections[key]} onChange={() => toggleSection(key)} />
              <span>{key}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="lms-card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <h3 style={{ fontWeight: 600, color: 'var(--primary)' }}>Contact Block</h3>
        </div>
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          <div className="lms-form-group">
            <label className="lms-label">Website</label>
            <input
              type="text"
              className="lms-input"
              value={content.contact.website}
              onChange={(e) => setContent((prev) => ({ ...prev, contact: { ...prev.contact, website: e.target.value } }))}
            />
          </div>
          <div className="lms-form-group">
            <label className="lms-label">Phone</label>
            <input
              type="text"
              className="lms-input"
              value={content.contact.phone}
              onChange={(e) => setContent((prev) => ({ ...prev, contact: { ...prev.contact, phone: e.target.value } }))}
            />
          </div>
          <div className="lms-form-group">
            <label className="lms-label">Email</label>
            <input
              type="text"
              className="lms-input"
              value={content.contact.email}
              onChange={(e) => setContent((prev) => ({ ...prev, contact: { ...prev.contact, email: e.target.value } }))}
            />
          </div>
        </div>
      </div>

      <div className="lms-card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <h3 style={{ fontWeight: 600, color: 'var(--primary)' }}>Hero Carousel Slides</h3>
        </div>
        <div style={{ padding: 20, display: 'grid', gap: 16 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Drag cards by the handle to reorder.</p>
          {content.heroSlides.map((slide, index) => (
            <div
              key={`hero-slide-${index}`}
              style={getCardStyle('heroSlides', index)}
              onDragOver={allowDrop}
              onDrop={() => dropOn('heroSlides', index)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <h4 style={{ fontWeight: 600 }}>Slide {index + 1}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    draggable
                    onDragStart={() => beginDrag('heroSlides', index)}
                    onDragEnd={endDrag}
                    style={{ padding: '6px 10px', borderRadius: 6, background: 'var(--bg-secondary)', border: '1px dashed var(--border)', cursor: 'grab', fontSize: 12 }}
                  >
                    Drag
                  </div>
                  <button type="button" className="lms-btn lms-btn-danger" onClick={() => setContent((prev) => ({ ...prev, heroSlides: prev.heroSlides.filter((_, i) => i !== index) }))}>
                    Remove
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <div className="lms-form-group">
                  <label className="lms-label">Badge</label>
                  <input className="lms-input" value={slide.badge} onChange={(e) => updateHeroSlide(index, 'badge', e.target.value)} />
                </div>
                <div className="lms-form-group">
                  <label className="lms-label">Title</label>
                  <input className="lms-input" value={slide.title} onChange={(e) => updateHeroSlide(index, 'title', e.target.value)} />
                </div>
                <div className="lms-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="lms-label">Subtitle</label>
                  <textarea className="lms-textarea" rows={3} value={slide.subtitle} onChange={(e) => updateHeroSlide(index, 'subtitle', e.target.value)} />
                </div>
              </div>

              <div style={{ border: '1px dashed var(--border)', borderRadius: 10, padding: 12, background: 'var(--bg-secondary)' }}>
                <p style={{ marginBottom: 8, color: 'var(--text-muted)', fontSize: 13 }}>Slide Image</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        uploadHeroImage(index, file);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="lms-btn lms-btn-secondary"
                    onClick={() => updateHeroSlide(index, 'imageUrl', '')}
                    disabled={!slide.imageUrl}
                  >
                    Clear Image
                  </button>
                  {uploading === `hero-${index}` && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Uploading...</span>}
                </div>
                {slide.imageUrl && (
                  <img
                    src={slide.imageUrl}
                    alt={slide.imageAlt || slide.title}
                    style={{ marginTop: 10, width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
                  />
                )}
                <div className="lms-form-group" style={{ marginTop: 10 }}>
                  <label className="lms-label">Image Alt Text</label>
                  <input className="lms-input" value={slide.imageAlt || ''} onChange={(e) => updateHeroSlide(index, 'imageAlt', e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <div className="lms-form-group">
                  <label className="lms-label">Primary Button Label</label>
                  <input className="lms-input" value={slide.primaryCtaLabel} onChange={(e) => updateHeroSlide(index, 'primaryCtaLabel', e.target.value)} />
                </div>
                <div className="lms-form-group">
                  <label className="lms-label">Primary Button Link</label>
                  <input className="lms-input" value={slide.primaryCtaHref} onChange={(e) => updateHeroSlide(index, 'primaryCtaHref', e.target.value)} />
                </div>
                <div className="lms-form-group">
                  <label className="lms-label">Secondary Button Label</label>
                  <input className="lms-input" value={slide.secondaryCtaLabel} onChange={(e) => updateHeroSlide(index, 'secondaryCtaLabel', e.target.value)} />
                </div>
                <div className="lms-form-group">
                  <label className="lms-label">Secondary Button Link</label>
                  <input className="lms-input" value={slide.secondaryCtaHref} onChange={(e) => updateHeroSlide(index, 'secondaryCtaHref', e.target.value)} />
                </div>
              </div>
            </div>
          ))}

          <button type="button" className="lms-btn lms-btn-secondary" onClick={() => setContent((prev) => ({ ...prev, heroSlides: [...prev.heroSlides, createEmptyHeroSlide()] }))}>
            Add Hero Slide
          </button>
        </div>
      </div>

      <div className="lms-card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <h3 style={{ fontWeight: 600, color: 'var(--primary)' }}>Why Choose Cards</h3>
        </div>
        <div style={{ padding: 20, display: 'grid', gap: 16 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Drag cards by the handle to reorder.</p>
          {content.whyCards.map((card, index) => (
            <div
              key={`why-card-${index}`}
              style={getCardStyle('whyCards', index)}
              onDragOver={allowDrop}
              onDrop={() => dropOn('whyCards', index)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <h4 style={{ fontWeight: 600 }}>Card {index + 1}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    draggable
                    onDragStart={() => beginDrag('whyCards', index)}
                    onDragEnd={endDrag}
                    style={{ padding: '6px 10px', borderRadius: 6, background: 'var(--bg-secondary)', border: '1px dashed var(--border)', cursor: 'grab', fontSize: 12 }}
                  >
                    Drag
                  </div>
                  <button type="button" className="lms-btn lms-btn-danger" onClick={() => setContent((prev) => ({ ...prev, whyCards: prev.whyCards.filter((_, i) => i !== index) }))}>
                    Remove
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <div className="lms-form-group">
                  <label className="lms-label">Icon Text</label>
                  <input className="lms-input" value={card.icon} onChange={(e) => updateWhyCard(index, 'icon', e.target.value)} />
                </div>
                <div className="lms-form-group">
                  <label className="lms-label">Title</label>
                  <input className="lms-input" value={card.title} onChange={(e) => updateWhyCard(index, 'title', e.target.value)} />
                </div>
                <div className="lms-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="lms-label">Description</label>
                  <textarea className="lms-textarea" rows={3} value={card.description} onChange={(e) => updateWhyCard(index, 'description', e.target.value)} />
                </div>
              </div>

              <div style={{ border: '1px dashed var(--border)', borderRadius: 10, padding: 12, background: 'var(--bg-secondary)' }}>
                <p style={{ marginBottom: 8, color: 'var(--text-muted)', fontSize: 13 }}>Card Image</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        uploadWhyCardImage(index, file);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="lms-btn lms-btn-secondary"
                    onClick={() => updateWhyCard(index, 'imageUrl', '')}
                    disabled={!card.imageUrl}
                  >
                    Clear Image
                  </button>
                  {uploading === `why-${index}` && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Uploading...</span>}
                </div>
                {card.imageUrl && (
                  <img
                    src={card.imageUrl}
                    alt={card.imageAlt || card.title}
                    style={{ marginTop: 10, width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
                  />
                )}
                <div className="lms-form-group" style={{ marginTop: 10 }}>
                  <label className="lms-label">Image Alt Text</label>
                  <input className="lms-input" value={card.imageAlt || ''} onChange={(e) => updateWhyCard(index, 'imageAlt', e.target.value)} />
                </div>
              </div>
            </div>
          ))}

          <button type="button" className="lms-btn lms-btn-secondary" onClick={() => setContent((prev) => ({ ...prev, whyCards: [...prev.whyCards, createEmptyWhyCard()] }))}>
            Add Why Card
          </button>
        </div>
      </div>

      <div className="lms-card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <h3 style={{ fontWeight: 600, color: 'var(--primary)' }}>Announcements</h3>
        </div>
        <div style={{ padding: 20, display: 'grid', gap: 16 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Drag cards by the handle to reorder.</p>
          {content.announcements.map((item, index) => (
            <div
              key={`announcement-${index}`}
              style={getCardStyle('announcements', index)}
              onDragOver={allowDrop}
              onDrop={() => dropOn('announcements', index)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <h4 style={{ fontWeight: 600 }}>Announcement {index + 1}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    draggable
                    onDragStart={() => beginDrag('announcements', index)}
                    onDragEnd={endDrag}
                    style={{ padding: '6px 10px', borderRadius: 6, background: 'var(--bg-secondary)', border: '1px dashed var(--border)', cursor: 'grab', fontSize: 12 }}
                  >
                    Drag
                  </div>
                  <button type="button" className="lms-btn lms-btn-danger" onClick={() => setContent((prev) => ({ ...prev, announcements: prev.announcements.filter((_, i) => i !== index) }))}>
                    Remove
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <div className="lms-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="lms-label">Title</label>
                  <input className="lms-input" value={item.title} onChange={(e) => updateAnnouncement(index, 'title', e.target.value)} />
                </div>
                <div className="lms-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="lms-label">Message</label>
                  <textarea className="lms-textarea" rows={3} value={item.message} onChange={(e) => updateAnnouncement(index, 'message', e.target.value)} />
                </div>
              </div>

              <div style={{ border: '1px dashed var(--border)', borderRadius: 10, padding: 12, background: 'var(--bg-secondary)' }}>
                <p style={{ marginBottom: 8, color: 'var(--text-muted)', fontSize: 13 }}>Announcement Image</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        uploadAnnouncementImage(index, file);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="lms-btn lms-btn-secondary"
                    onClick={() => updateAnnouncement(index, 'imageUrl', '')}
                    disabled={!item.imageUrl}
                  >
                    Clear Image
                  </button>
                  {uploading === `announcement-${index}` && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Uploading...</span>}
                </div>
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.imageAlt || item.title}
                    style={{ marginTop: 10, width: '100%', maxHeight: 170, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
                  />
                )}
                <div className="lms-form-group" style={{ marginTop: 10 }}>
                  <label className="lms-label">Image Alt Text</label>
                  <input className="lms-input" value={item.imageAlt || ''} onChange={(e) => updateAnnouncement(index, 'imageAlt', e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <div className="lms-form-group">
                  <label className="lms-label">Link Label</label>
                  <input className="lms-input" value={item.linkLabel} onChange={(e) => updateAnnouncement(index, 'linkLabel', e.target.value)} />
                </div>
                <div className="lms-form-group">
                  <label className="lms-label">Link URL</label>
                  <input className="lms-input" value={item.linkHref} onChange={(e) => updateAnnouncement(index, 'linkHref', e.target.value)} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={item.isActive} onChange={(e) => updateAnnouncement(index, 'isActive', e.target.checked)} />
                  Active Announcement
                </label>
              </div>
            </div>
          ))}

          <button type="button" className="lms-btn lms-btn-secondary" onClick={() => setContent((prev) => ({ ...prev, announcements: [...prev.announcements, createEmptyAnnouncement()] }))}>
            Add Announcement
          </button>
        </div>
      </div>

      <div className="lms-card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <h3 style={{ fontWeight: 600, color: 'var(--primary)' }}>Quick Links</h3>
        </div>
        <div style={{ padding: 20, display: 'grid', gap: 16 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Drag rows by the handle to reorder.</p>
          {content.quickLinks.map((link, index) => (
            <div
              key={`quick-link-${index}`}
              style={getCardStyle('quickLinks', index)}
              onDragOver={allowDrop}
              onDrop={() => dropOn('quickLinks', index)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <h4 style={{ fontWeight: 600 }}>Quick Link {index + 1}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    draggable
                    onDragStart={() => beginDrag('quickLinks', index)}
                    onDragEnd={endDrag}
                    style={{ padding: '6px 10px', borderRadius: 6, background: 'var(--bg-secondary)', border: '1px dashed var(--border)', cursor: 'grab', fontSize: 12 }}
                  >
                    Drag
                  </div>
                  <button type="button" className="lms-btn lms-btn-danger" onClick={() => setContent((prev) => ({ ...prev, quickLinks: prev.quickLinks.filter((_, i) => i !== index) }))}>
                    Remove
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <div className="lms-form-group">
                  <label className="lms-label">Label</label>
                  <input className="lms-input" value={link.label} onChange={(e) => updateQuickLink(index, 'label', e.target.value)} />
                </div>
                <div className="lms-form-group">
                  <label className="lms-label">URL</label>
                  <input className="lms-input" value={link.href} onChange={(e) => updateQuickLink(index, 'href', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="lms-btn lms-btn-secondary" onClick={() => setContent((prev) => ({ ...prev, quickLinks: [...prev.quickLinks, createEmptyLink()] }))}>
            Add Quick Link
          </button>
        </div>
      </div>

      <div className="lms-card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <h3 style={{ fontWeight: 600, color: 'var(--primary)' }}>Social Links</h3>
        </div>
        <div style={{ padding: 20, display: 'grid', gap: 16 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Drag rows by the handle to reorder.</p>
          {content.socialLinks.map((link, index) => (
            <div
              key={`social-link-${index}`}
              style={getCardStyle('socialLinks', index)}
              onDragOver={allowDrop}
              onDrop={() => dropOn('socialLinks', index)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <h4 style={{ fontWeight: 600 }}>Social Link {index + 1}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    draggable
                    onDragStart={() => beginDrag('socialLinks', index)}
                    onDragEnd={endDrag}
                    style={{ padding: '6px 10px', borderRadius: 6, background: 'var(--bg-secondary)', border: '1px dashed var(--border)', cursor: 'grab', fontSize: 12 }}
                  >
                    Drag
                  </div>
                  <button type="button" className="lms-btn lms-btn-danger" onClick={() => setContent((prev) => ({ ...prev, socialLinks: prev.socialLinks.filter((_, i) => i !== index) }))}>
                    Remove
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <div className="lms-form-group">
                  <label className="lms-label">Label</label>
                  <input className="lms-input" value={link.label} onChange={(e) => updateSocialLink(index, 'label', e.target.value)} />
                </div>
                <div className="lms-form-group">
                  <label className="lms-label">URL</label>
                  <input className="lms-input" value={link.href} onChange={(e) => updateSocialLink(index, 'href', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="lms-btn lms-btn-secondary" onClick={() => setContent((prev) => ({ ...prev, socialLinks: [...prev.socialLinks, createEmptyLink()] }))}>
            Add Social Link
          </button>
        </div>
      </div>

      <div className="lms-card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <h3 style={{ fontWeight: 600, color: 'var(--primary)' }}>Stats Cards</h3>
        </div>
        <div style={{ padding: 20, display: 'grid', gap: 16 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Drag rows by the handle to reorder.</p>
          {content.statsCards.map((card, index) => (
            <div
              key={`stats-card-${index}`}
              style={getCardStyle('statsCards', index)}
              onDragOver={allowDrop}
              onDrop={() => dropOn('statsCards', index)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <h4 style={{ fontWeight: 600 }}>Stats Card {index + 1}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    draggable
                    onDragStart={() => beginDrag('statsCards', index)}
                    onDragEnd={endDrag}
                    style={{ padding: '6px 10px', borderRadius: 6, background: 'var(--bg-secondary)', border: '1px dashed var(--border)', cursor: 'grab', fontSize: 12 }}
                  >
                    Drag
                  </div>
                  <button type="button" className="lms-btn lms-btn-danger" onClick={() => setContent((prev) => ({ ...prev, statsCards: prev.statsCards.filter((_, i) => i !== index) }))}>
                    Remove
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <div className="lms-form-group">
                  <label className="lms-label">Stats Source</label>
                  <select className="lms-input" value={card.key} onChange={(e) => updateStatsCard(index, 'key', e.target.value)}>
                    {statKeyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="lms-form-group">
                  <label className="lms-label">Label</label>
                  <input className="lms-input" value={card.label} onChange={(e) => updateStatsCard(index, 'label', e.target.value)} />
                </div>
                <div className="lms-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="lms-label">Helper Text</label>
                  <input className="lms-input" value={card.helperText} onChange={(e) => updateStatsCard(index, 'helperText', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="lms-btn lms-btn-secondary" onClick={() => setContent((prev) => ({ ...prev, statsCards: [...prev.statsCards, createEmptyStatsCard()] }))}>
            Add Stats Card
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <button className="lms-btn lms-btn-primary" onClick={saveContent} disabled={saving}>
          {saving ? 'Saving...' : 'Save Homepage Content'}
        </button>
      </div>
    </LMSLayout>
  );
}
