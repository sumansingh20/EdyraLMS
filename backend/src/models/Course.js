import mongoose from 'mongoose';

// Sub-schema for course content (video, PDF, notes, etc.)
const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Content title is required'],
    trim: true,
    maxlength: [200, 'Content title cannot exceed 200 characters'],
  },
  type: {
    type: String,
    enum: ['video', 'pdf', 'text', 'document', 'assignment'],
    required: true,
  },
  description: String,
  url: String, // S3 URL or similar
  fileSize: Number, // in bytes
  duration: Number, // for videos, in seconds
  displayOrder: {
    type: Number,
    default: 0,
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: true });

// Sub-schema for course sections (modules)
const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Section title is required'],
    trim: true,
    maxlength: [150, 'Section title cannot exceed 150 characters'],
  },
  description: String,
  displayOrder: {
    type: Number,
    default: 0,
  },
  content: [contentSchema],
  totalDuration: Number, // total duration of all content in seconds
  isLocked: {
    type: Boolean,
    default: false,
  },
  lockAfter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course.sections', // Lock until previous section is completed
  },
  displayAt: Date, // When section becomes available
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: true });

const courseSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Course title cannot exceed 200 characters'],
    index: true,
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [5000, 'Course description cannot exceed 5000 characters'],
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters'],
  },

  // Media
  thumbnail: {
    type: String,
    default: 'https://via.placeholder.com/300x200',
  },
  bannerImage: String,

  // Instructor/Teacher
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required'],
    index: true,
  },
  coInstructors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],

  // Organization
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true,
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],

  // Content
  sections: [sectionSchema],
  totalLectures: {
    type: Number,
    default: 0,
  },
  totalDuration: {
    type: Number,
    default: 0, // in seconds
  },

  // Pricing & Enrollment
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative'],
  },
  currency: {
    type: String,
    default: 'USD',
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%'],
  },
  enrollmentCode: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
  },
  maxEnrollments: {
    type: Number,
    default: null, // null = unlimited
  },
  enrollmentCount: {
    type: Number,
    default: 0,
  },

  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'suspended'],
    default: 'draft',
    index: true,
  },
  isPublished: {
    type: Boolean,
    default: false,
    index: true,
  },
  publishedAt: Date,

  // Enrollment Settings
  enrollmentType: {
    type: String,
    enum: ['open', 'request', 'code', 'approved'],
    default: 'open',
  },
  requiresApproval: {
    type: Boolean,
    default: false,
  },

  // Learning Settings
  language: {
    type: String,
    default: 'en',
  },
  learningOutcomes: [String],
  requirements: [String],
  skillLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },

  // Deadlines
  startDate: Date,
  endDate: Date,

  // Ratings & Reviews
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  totalStudents: {
    type: Number,
    default: 0,
  },

  // Metadata
  keywords: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
  certificateAvailable: {
    type: Boolean,
    default: false,
  },
  certificateTemplate: String,
  passingScore: {
    type: Number,
    default: 70,
    min: [0, 'Passing score cannot be less than 0'],
    max: [100, 'Passing score cannot be more than 100'],
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  publishedAt: Date,
}, { timestamps: true });

// Indexes
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ instructor: 1, status: 1 });
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ isPublished: 1, isActive: 1 });

// Pre-save middleware
courseSchema.pre('save', function(next) {
  // Generate slug from title
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  // Calculate total duration
  let totalDuration = 0;
  this.sections.forEach(section => {
    section.content.forEach(content => {
      if (content.duration) {
        totalDuration += content.duration;
      }
    });
  });
  this.totalDuration = totalDuration;
  this.totalLectures = this.sections.reduce((sum, section) => sum + section.content.length, 0);

  next();
});

// Methods
courseSchema.methods.addSection = function(section) {
  section.displayOrder = this.sections.length;
  this.sections.push(section);
  return this.save();
};

courseSchema.methods.addContent = function(sectionId, content) {
  const section = this.sections.id(sectionId);
  if (!section) throw new Error('Section not found');
  content.displayOrder = section.content.length;
  section.content.push(content);
  return this.save();
};

courseSchema.methods.removeSection = function(sectionId) {
  this.sections.id(sectionId).remove();
  return this.save();
};

courseSchema.methods.removeContent = function(sectionId, contentId) {
  const section = this.sections.id(sectionId);
  if (!section) throw new Error('Section not found');
  section.content.id(contentId).remove();
  return this.save();
};

courseSchema.methods.publish = function() {
  if (!this.sections.length) {
    throw new Error('Course must have at least one section with content');
  }
  this.isPublished = true;
  this.status = 'published';
  this.publishedAt = new Date();
  return this.save();
};

courseSchema.methods.canEnroll = function() {
  if (!this.isPublished) return false;
  if (this.maxEnrollments && this.enrollmentCount >= this.maxEnrollments) return false;
  if (this.startDate && this.startDate > new Date()) return false;
  return true;
};

export default mongoose.model('Course', courseSchema);
