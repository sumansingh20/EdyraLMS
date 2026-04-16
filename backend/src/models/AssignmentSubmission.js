import mongoose from 'mongoose';

const assignmentSubmissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'Assignment reference is required'],
    index: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student reference is required'],
    index: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },

  // Submission details
  submittedFiles: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    mimeType: String,
  }],
  submissionText: {
    type: String,
    default: '',
  },
  
  // Submission timeline
  submittedAt: {
    type: Date,
    default: null,
  },
  isLateSubmission: {
    type: Boolean,
    default: false,
  },
  daysLate: {
    type: Number,
    default: 0,
  },

  // Resubmission tracking
  resubmissionCount: {
    type: Number,
    default: 1,
  },
  previousSubmissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssignmentSubmission',
    default: null,
  },

  // Grading
  marksObtained: {
    type: Number,
    default: null,
  },
  totalMarks: {
    type: Number,
    default: 0,
  },
  feedback: {
    type: String,
    default: '',
  },
  rubricScores: [{
    criterion: String,
    score: Number,
    maxScore: Number,
  }],
  gradedAt: {
    type: Date,
    default: null,
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  // Plagiarism detection
  plagiarismPercentage: {
    type: Number,
    default: 0,
  },
  plagiarismReport: {
    type: String,
    default: null,
  },

  // Status
  status: {
    type: String,
    enum: ['draft', 'submitted', 'graded', 'late'],
    default: 'draft',
  },

}, {
  timestamps: true,
});

assignmentSubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
assignmentSubmissionSchema.index({ course: 1, student: 1 });
assignmentSubmissionSchema.index({ submittedAt: -1 });

export default mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
