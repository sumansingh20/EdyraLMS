import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true,
  },
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true,
  },

  // Certificate details
  certificateCode: {
    type: String,
    unique: true,
    required: true,
  },
  title: {
    type: String,
    default: 'Certificate of Completion',
  },
  issuedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: null, // null = never expires
  },

  // Performance metrics
  finalScore: {
    type: Number,
    required: true,
  },
  finalGrade: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'F'],
    required: true,
  },
  completionTime: {
    type: Number, // in hours
    default: 0,
  },

  // Certificate URLs
  certificateUrl: {
    type: String,
    default: null,
  },
  verificationUrl: {
    type: String,
    default: null,
  },

  // Verification
  isVerified: {
    type: Boolean,
    default: true,
  },
  verificationCode: String,

  // Status
  status: {
    type: String,
    enum: ['active', 'revoked', 'expired'],
    default: 'active',
  },
  revocationReason: String,

}, {
  timestamps: true,
});

certificateSchema.index({ certificateCode: 1 });
certificateSchema.index({ student: 1, course: 1 });
certificateSchema.index({ status: 1 });

export default mongoose.model('Certificate', certificateSchema);
