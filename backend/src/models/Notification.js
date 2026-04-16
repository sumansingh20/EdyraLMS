import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  // Notification content
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: [
      'exam_schedule',
      'assignment_due',
      'course_enrolled',
      'grade_published',
      'message',
      'announcement',
      'system',
      'admin_notice',
      'assignment_submitted',
      'exam_result',
    ],
    default: 'system',
  },

  // Reference to related objects
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['course', 'exam', 'assignment', 'user'],
    },
    entityId: mongoose.Schema.Types.ObjectId,
  },

  // Action URL
  actionUrl: String,

  // Status
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
    default: null,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },

  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },

  // Delivery channels
  emailSent: {
    type: Boolean,
    default: false,
  },
  pushSent: {
    type: Boolean,
    default: false,
  },
  smsSent: {
    type: Boolean,
    default: false,
  },

}, {
  timestamps: true,
});

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });

export default mongoose.model('Notification', notificationSchema);
