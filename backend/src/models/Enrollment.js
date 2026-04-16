import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course reference is required'],
    index: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student reference is required'],
    index: true,
  },
  
  // Enrollment method
  enrollmentMethod: {
    type: String,
    enum: ['code', 'request', 'direct', 'admin'],
    default: 'direct',
  },
  
  // Enrollment status
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped', 'suspended'],
    default: 'active',
  },
  
  // Progress tracking
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  coursesCompleted: {
    type: Boolean,
    default: false,
  },
  certificateEarned: {
    type: Boolean,
    default: false,
  },
  certificateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate',
    default: null,
  },
  
  // Performance
  overallGrade: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'F', null],
    default: null,
  },
  totalMarksObtained: {
    type: Number,
    default: 0,
  },
  
  // Content progress
  sectionsViewed: {
    type: Number,
    default: 0,
  },
  totalSections: {
    type: Number,
    default: 0,
  },
  
  // Dates
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
  lastAccessedAt: {
    type: Date,
    default: null,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  
  // Audit flag
  isAudit: {
    type: Boolean,
    default: false,
  },

}, {
  timestamps: true,
});

enrollmentSchema.index({ course: 1, student: 1 }, { unique: true });
enrollmentSchema.index({ student: 1, status: 1 });
enrollmentSchema.index({ course: 1, status: 1 });

// Methods
enrollmentSchema.methods.updateProgress = async function(sectionsViewed, totalSections) {
  this.sectionsViewed = sectionsViewed;
  this.totalSections = totalSections;
  this.completionPercentage = Math.round((sectionsViewed / totalSections) * 100);
  if (this.completionPercentage === 100) {
    this.coursesCompleted = true;
    this.completedAt = new Date();
    this.status = 'completed';
  }
  return this.save();
};

// Statics
enrollmentSchema.statics.getEnrollmentStats = async function(courseId) {
  const stats = await this.aggregate([
    { $match: { course: mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: null,
        totalStudents: { $sum: 1 },
        activeStudents: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        completedStudents: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        dropoutStudents: { $sum: { $cond: [{ $eq: ['$status', 'dropped'] }, 1, 0] } },
        avgCompletion: { $avg: '$completionPercentage' },
      },
    },
  ]);
  return stats[0] || {};
};

export default mongoose.model('Enrollment', enrollmentSchema);

export default mongoose.model('Enrollment', enrollmentSchema);
