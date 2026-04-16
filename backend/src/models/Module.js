import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  orderInCourse: {
    type: Number,
    required: true,
  },
  estimatedDuration: {
    type: Number, // in hours
    default: 0,
  },
  lessonCount: {
    type: Number,
    default: 0,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
  }],

}, {
  timestamps: true,
});

moduleSchema.index({ course: 1, orderInCourse: 1 });

export default mongoose.model('Module', moduleSchema);
