import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  // User analytics
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    index: true,
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    default: null,
  },

  // Learning metrics
  totalTimeSpent: {
    type: Number, // in seconds
    default: 0,
  },
  sessionsCount: {
    type: Number,
    default: 0,
  },
  lastActivityAt: {
    type: Date,
    default: null,
  },

  // Performance data
  averageScore: {
    type: Number,
    default: 0,
  },
  highestScore: {
    type: Number,
    default: 0,
  },
  lowestScore: {
    type: Number,
    default: 0,
  },
  attemptedQuestions: {
    type: Number,
    default: 0,
  },
  correctAnswers: {
    type: Number,
    default: 0,
  },
  accuracy: {
    type: Number, // percentage
    default: 0,
  },

  // Weak topics (from exam analysis)
  weakTopics: [{
    topic: String,
    accuracy: Number,
    attemptCount: Number,
  }],
  strongTopics: [{
    topic: String,
    accuracy: Number,
    attemptCount: Number,
  }],

  // Engagement metrics
  pagesViewed: {
    type: Number,
    default: 0,
  },
  resourcesDownloaded: {
    type: Number,
    default: 0,
  },
  assignmentsSubmitted: {
    type: Number,
    default: 0,
  },

  // Learning patterns
  preferredLearningTime: {
    type: String, // morning, afternoon, evening, night
    default: null,
  },
  averageSessionDuration: {
    type: Number, // in seconds
    default: 0,
  },
  studyConsistency: {
    type: Number, // 0-100 based on regular activity
    default: 0,
  },

  // Prediction data
  predictionAccuracy: {
    type: Number,
    default: 0,
  },
  likelyGrade: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'F', null],
    default: null,
  },

  // Date range for these analytics
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  },

}, {
  timestamps: true,
});

analyticsSchema.index({ user: 1, course: 1 });
analyticsSchema.index({ course: 1, accuracy: -1 });
analyticsSchema.index({ user: 1, lastActivityAt: -1 });

export default mongoose.model('Analytics', analyticsSchema);
