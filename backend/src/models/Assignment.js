import mongoose from 'mongoose';

const submissionFileSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number, // in bytes
  },
  mimeType: {
    type: String,
  },
}, { _id: true });

const assignmentSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course reference is required'],
    index: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher reference is required'],
  },
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required'],
    trim: true,
  },
  instructions: {
    type: String,
    default: '',
  },
  // File attachment from teacher
  attachments: [submissionFileSchema],
  
  // Deadline and submission settings
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
  },
  allowLateSubmission: {
    type: Boolean,
    default: true,
  },
  lateDueDateWithPenalty: {
    type: Date,
    default: null,
  },
  latePenaltyPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },

  // Assignment settings
  totalMarks: {
    type: Number,
    default: 100,
    min: 0,
  },
  allowResubmission: {
    type: Boolean,
    default: false,
  },
  maxResubmissionCount: {
    type: Number,
    default: 1,
  },
  // Accepted file formats
  acceptedFileTypes: [{
    type: String,
    default: 'pdf,doc,docx,txt',
  }],
  maxFileSize: {
    type: Number, // in MB
    default: 10,
  },
  
  // Status
  isPublished: {
    type: Boolean,
    default: true,
  },
  isGraded: {
    type: Boolean,
    default: false,
  },

  // Visibility
  visibleFrom: {
    type: Date,
    default: Date.now,
  },
  visibleUntil: {
    type: Date,
    default: null,
  },

  // Metadata
  totalSubmissions: {
    type: Number,
    default: 0,
  },
  gradedSubmissions: {
    type: Number,
    default: 0,
  },

}, {
  timestamps: true,
});

assignmentSchema.index({ course: 1, dueDate: 1 });
assignmentSchema.index({ teacher: 1 });

// Pre-save validation
assignmentSchema.pre('save', function(next) {
  if (this.lateDueDateWithPenalty && this.lateDueDateWithPenalty < this.dueDate) {
    return next(new Error('Late due date must be after the original due date'));
  }
  next();
});

export default mongoose.model('Assignment', assignmentSchema);
