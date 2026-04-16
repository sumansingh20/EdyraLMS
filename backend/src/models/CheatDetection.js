import mongoose from 'mongoose';

const cheatDetectionSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
    index: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    required: true,
  },

  // Cheat detection flags
  tabSwitchCount: {
    type: Number,
    default: 0,
  },
  windowBlurCount: {
    type: Number,
    default: 0,
  },
  rightClickAttempts: {
    type: Number,
    default: 0,
  },
  copyPasteAttempts: {
    type: Number,
    default: 0,
  },
  fullscreenExitCount: {
    type: Number,
    default: 0,
  },
  suspiciousMouseMovement: {
    type: Boolean,
    default: false,
  },
  multipleDeviceDetected: {
    type: Boolean,
    default: false,
  },
  
  // Browser/Device info
  userAgent: String,
  ipAddress: String,
  ipHash: String,
  screenResolution: String,
  deviceFingerprint: String,

  // WebRTC/Webcam data (if enabled)
  faceDetected: {
    type: Boolean,
    default: false,
  },
  multipleFacesDetected: {
    type: Boolean,
    default: false,
  },
  faceVisiblePercentage: {
    type: Number,
    default: 0,
  },
  faceNotVisibleIntervals: [{
    startTime: Date,
    endTime: Date,
    duration: Number, // in seconds
  }],

  // Keyboard/Typing patterns
  averageTypingSpeed: {
    type: Number,
    default: 0,
  },
  keyboardPattern: {
    type: String,
    default: null,
  },
  typingAnomalies: [{
    detectedAt: Date,
    anomalyType: String, // e.g., 'unusual_speed', 'pause_pattern_change'
    severity: String, // low, medium, high
  }],

  // Network anomalies
  networkInterruptions: {
    type: Number,
    default: 0,
  },
  requestAnomalies: {
    type: Number,
    default: 0,
  },

  // Proctoring monitoring data
  monitoringLog: [{
    timestamp: Date,
    eventType: String, // tab_switch, window_blur, copy_paste, etc.
    severity: String, // low, medium, high
    details: mongoose.Schema.Types.Mixed,
  }],

  // Risk assessment
  overallRiskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
  },
  flaggedForManualReview: {
    type: Boolean,
    default: false,
  },
  manualReviewStatus: {
    type: String,
    enum: ['pending', 'reviewed', 'approved', 'flagged'],
    default: 'pending',
  },
  manualReviewNotes: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  // Consequences
  isMarkedForCheating: {
    type: Boolean,
    default: false,
  },
  submissionStatus: {
    type: String,
    enum: ['normal', 'suspicious', 'flagged', 'rejected'],
    default: 'normal',
  },

}, {
  timestamps: true,
});

cheatDetectionSchema.index({ exam: 1, student: 1 });
cheatDetectionSchema.index({ riskLevel: 1 });
cheatDetectionSchema.index({ flaggedForManualReview: 1 });

export default mongoose.model('CheatDetection', cheatDetectionSchema);
