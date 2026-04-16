const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const courseController = require('../controllers/courseController');
const { validateCourse, validateEnrollment } = require('../middleware/validation');

// Public routes
router.get('/public', courseController.getPublicCourses);
router.get('/:courseId', courseController.getCourseById);

// Teacher/Admin routes
router.post('/', authenticate, authorize(['teacher', 'admin']), validateCourse, courseController.createCourse);
router.put('/:courseId', authenticate, authorize(['teacher', 'admin']), validateCourse, courseController.updateCourse);
router.delete('/:courseId', authenticate, authorize(['teacher', 'admin']), courseController.deleteCourse);

// Enrollment routes
router.post('/:courseId/enroll', authenticate, validateEnrollment, courseController.enrollCourse);
router.post('/:courseId/enroll-with-code', authenticate, courseController.enrollWithCode);
router.get('/:courseId/students', authenticate, authorize(['teacher', 'admin']), courseController.getCourseStudents);
router.get('/:courseId/progress', authenticate, courseController.getCourseProgress);

// Content management
router.post('/:courseId/sections', authenticate, authorize(['teacher', 'admin']), courseController.createSection);
router.post('/:courseId/sections/:sectionId/lessons', authenticate, authorize(['teacher', 'admin']), courseController.createLesson);
router.post('/:courseId/upload-resource', authenticate, authorize(['teacher', 'admin']), courseController.uploadResource);

// Get enrolled courses
router.get('/my/enrolled', authenticate, courseController.getEnrolledCourses);

module.exports = router;
