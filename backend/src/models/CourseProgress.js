import mongoose from 'mongoose';

const courseProgressSchema = new mongoose.Schema({
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
  },

  // Overall progress
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'paused'],
    default: 'not_started',
  },

  // Lesson progress
  lessonsViewed: {
    type: Number,
    default: 0,
  },
  lessonsCompleted: {
    type: Number,
    default: 0,
  },
  totalLessons: {
    type: Number,
    default: 0,
  },

  // Module progress
  modulesCompleted: {
    type: Number,
    default: 0,
  },
  totalModules: {
    type: Number,
    default: 0,
  },

  // Time tracking
  totalTimeSpent: {
    type: Number, // in seconds
    default: 0,
  },
  estimatedTimeRemaining: {
    type: Number, // in seconds
    default: 0,
  },
  lastAccessedAt: {
    type: Date,
    default: null,
  },

  // Performance
  averageQuizScore: {
    type: Number,
    default: 0,
  },
  averageAssignmentScore: {
    type: Number,
    default: 0,
  },
  overallScore: {
    type: Number,
    default: 0,
  },

  // Viewed lessons tracking
  viewedLessons: [{
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    viewedAt: Date,
    completedAt: {
      type: Date,
      default: null,
    },
    timeSpentSeconds: Number,
    isCompleted: Boolean,
  }],

  // Quiz attempts
  quizAttempts: [{
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
    },
    attemptNumber: Number,
    score: Number,
    attemptedAt: Date,
  }],

  // Dates
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },

}, {
  timestamps: true,
});

courseProgressSchema.index({ student: 1, course: 1 }, { unique: true });
courseProgressSchema.index({ student: 1, completionPercentage: -1 });

export default mongoose.model('CourseProgress', courseProgressSchema);
