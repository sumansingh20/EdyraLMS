import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true,
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    default: null,
  },
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  content: {
    type: String,
    default: '',
  },
  contentType: {
    type: String,
    enum: ['video', 'article', 'quiz', 'assignment', 'interactive', 'mixed'],
    default: 'article',
  },
  videoUrl: String,
  videoDuration: Number,
  resourceUrl: String,
  resourceType: String,
  
  learningObjectives: [String],
  duration: {
    type: Number, // in minutes
    default: 0,
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  orderInCourse: {
    type: Number,
    default: 0,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },

}, {
  timestamps: true,
});

lessonSchema.index({ course: 1, orderInCourse: 1 });

export default mongoose.model('Lesson', lessonSchema);
