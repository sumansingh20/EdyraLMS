import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema({
  label: { type: String, trim: true, default: '' },
  href: { type: String, trim: true, default: '#' },
}, { _id: false });

const heroSlideSchema = new mongoose.Schema({
  badge: { type: String, trim: true, default: '' },
  title: { type: String, trim: true, required: true },
  subtitle: { type: String, trim: true, default: '' },
  imageUrl: { type: String, trim: true, default: '' },
  imageAlt: { type: String, trim: true, default: '' },
  primaryCtaLabel: { type: String, trim: true, default: 'Log in to Portal' },
  primaryCtaHref: { type: String, trim: true, default: '/login' },
  secondaryCtaLabel: { type: String, trim: true, default: 'Exam Entry' },
  secondaryCtaHref: { type: String, trim: true, default: '/exam/login' },
}, { _id: false });

const whyCardSchema = new mongoose.Schema({
  icon: { type: String, trim: true, default: 'LMS' },
  title: { type: String, trim: true, required: true },
  description: { type: String, trim: true, default: '' },
  imageUrl: { type: String, trim: true, default: '' },
  imageAlt: { type: String, trim: true, default: '' },
}, { _id: false });

const announcementSchema = new mongoose.Schema({
  title: { type: String, trim: true, required: true },
  message: { type: String, trim: true, default: '' },
  imageUrl: { type: String, trim: true, default: '' },
  imageAlt: { type: String, trim: true, default: '' },
  linkLabel: { type: String, trim: true, default: '' },
  linkHref: { type: String, trim: true, default: '/help' },
  isActive: { type: Boolean, default: true },
}, { _id: false });

const statsCardSchema = new mongoose.Schema({
  key: {
    type: String,
    enum: ['activeUsers', 'totalExams', 'activeExams', 'totalSubmissions'],
    required: true,
  },
  label: { type: String, trim: true, required: true },
  helperText: { type: String, trim: true, default: '' },
}, { _id: false });

const homePageContentSchema = new mongoose.Schema({
  singletonKey: {
    type: String,
    default: 'default',
    unique: true,
    immutable: true,
  },
  sections: {
    hero: { type: Boolean, default: true },
    whyChoose: { type: Boolean, default: true },
    stats: { type: Boolean, default: true },
    announcements: { type: Boolean, default: true },
    quickLinks: { type: Boolean, default: true },
    contact: { type: Boolean, default: true },
    follow: { type: Boolean, default: true },
  },
  heroSlides: {
    type: [heroSlideSchema],
    default: [],
  },
  whyCards: {
    type: [whyCardSchema],
    default: [],
  },
  announcements: {
    type: [announcementSchema],
    default: [],
  },
  quickLinks: {
    type: [linkSchema],
    default: [],
  },
  socialLinks: {
    type: [linkSchema],
    default: [],
  },
  contact: {
    website: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
  },
  branding: {
    institutionName: { type: String, trim: true, default: '' },
    portalName: { type: String, trim: true, default: '' },
    institutionLogoUrl: { type: String, trim: true, default: '' },
    institutionLogoAlt: { type: String, trim: true, default: '' },
    portalLogoUrl: { type: String, trim: true, default: '' },
    portalLogoAlt: { type: String, trim: true, default: '' },
  },
  statsCards: {
    type: [statsCardSchema],
    default: [],
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});

const HomePageContent = mongoose.model('HomePageContent', homePageContentSchema);

export default HomePageContent;