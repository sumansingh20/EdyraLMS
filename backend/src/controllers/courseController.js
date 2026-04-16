import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Category from '../models/Category.js';
import AuditLog from '../models/AuditLog.js';
import AppError from '../utils/AppError.js';

/* ========== COURSE CONTROLLER ========== */

class CourseController {
  // ============ CREATE COURSE (Teacher/Admin) ============
  static async createCourse(req, res, next) {
    try {
      const { title, description, categoryId, thumbnail, price } = req.body;

      // Check if category exists
      if (categoryId) {
        const category = await Category.findById(categoryId);
        if (!category) {
          throw new AppError('Category not found', 404);
        }
      }

      const course = new Course({
        title,
        description,
        categoryId,
        thumbnail,
        price: price || 0,
        instructorId: req.user._id,
        status: 'draft',
      });

      await course.save();

      // Log action
      await AuditLog.create({
        userId: req.user._id,
        action: 'COURSE_CREATED',
        resource: 'Course',
        resourceId: course._id,
        details: { title },
      });

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: { course },
      });
    } catch (error) {
      next(error);
    }
  }

  // ============ GET ALL COURSES ============
  static async getAllCourses(req, res, next) {
    try {
      const { categoryId, status, page = 1, limit = 10, search } = req.query;

      const query = {};

      if (categoryId) query.categoryId = categoryId;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const courses = await Course.find(query)
        .populate('categoryId', 'name')
        .populate('instructorId', 'firstName lastName email')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await Course.countDocuments(query);

      res.json({
        success: true,
        data: {
          courses,
          pagination: {
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ============ GET COURSE BY ID ============
  static async getCourseById(req, res, next) {
    try {
      const { id } = req.params;

      const course = await Course.findById(id)
        .populate('categoryId')
        .populate('instructorId', 'firstName lastName email profilePhoto')
        .populate('modules');

      if (!course) {
        throw new AppError('Course not found', 404);
      }

      // Get enrollment count
      const enrollmentCount = await Enrollment.countDocuments({ courseId: id });

      res.json({
        success: true,
        data: {
          course,
          enrollmentCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ============ UPDATE COURSE ============
  static async updateCourse(req, res, next) {
    try {
      const { id } = req.params;
      const { title, description, categoryId, thumbnail, price, status } = req.body;

      const course = await Course.findById(id);
      if (!course) {
        throw new AppError('Course not found', 404);
      }

      // Check authorization (only instructor or admin can update)
      if (course.instructorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new AppError('Not authorized to update this course', 403);
      }

      // Check category if provided
      if (categoryId) {
        const category = await Category.findById(categoryId);
        if (!category) {
          throw new AppError('Category not found', 404);
        }
      }

      const updatedCourse = await Course.findByIdAndUpdate(
        id,
        {
          title,
          description,
          categoryId,
          thumbnail,
          price,
          status,
        },
        { new: true, runValidators: true }
      );

      // Log action
      await AuditLog.create({
        userId: req.user._id,
        action: 'COURSE_UPDATED',
        resource: 'Course',
        resourceId: id,
        details: { title },
      });

      res.json({
        success: true,
        message: 'Course updated successfully',
        data: { course: updatedCourse },
      });
    } catch (error) {
      next(error);
    }
  }

  // ============ DELETE COURSE ============
  static async deleteCourse(req, res, next) {
    try {
      const { id } = req.params;

      const course = await Course.findById(id);
      if (!course) {
        throw new AppError('Course not found', 404);
      }

      // Check authorization
      if (course.instructorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new AppError('Not authorized to delete this course', 403);
      }

      await Course.findByIdAndDelete(id);

      // Log action
      await AuditLog.create({
        userId: req.user._id,
        action: 'COURSE_DELETED',
        resource: 'Course',
        resourceId: id,
      });

      res.json({
        success: true,
        message: 'Course deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // ============ PUBLISH COURSE ============
  static async publishCourse(req, res, next) {
    try {
      const { id } = req.params;

      const course = await Course.findById(id);
      if (!course) {
        throw new AppError('Course not found', 404);
      }

      // Check authorization
      if (course.instructorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new AppError('Not authorized to publish this course', 403);
      }

      course.status = 'published';
      course.publishedAt = new Date();
      await course.save();

      // Log action
      await AuditLog.create({
        userId: req.user._id,
        action: 'COURSE_PUBLISHED',
        resource: 'Course',
        resourceId: id,
      });

      res.json({
        success: true,
        message: 'Course published successfully',
        data: { course },
      });
    } catch (error) {
      next(error);
    }
  }

  // ============ GET COURSE STATS ============
  static async getCourseStats(req, res, next) {
    try {
      const { id } = req.params;

      const course = await Course.findById(id);
      if (!course) {
        throw new AppError('Course not found', 404);
      }

      // Check authorization
      if (course.instructorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new AppError('Not authorized to view stats', 403);
      }

      const enrollmentCount = await Enrollment.countDocuments({ courseId: id });
      const completionRate = 0; // TODO: Calculate based on progress

      res.json({
        success: true,
        data: {
          enrollmentCount,
          completionRate,
          revenue: enrollmentCount * (course.price || 0),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ============ ADD COURSE CONTENT ============
  static async addContent(req, res, next) {
    try {
      const { courseId } = req.params;
      const { title, type, url, duration } = req.body;

      const course = await Course.findById(courseId);
      if (!course) {
        throw new AppError('Course not found', 404);
      }

      // Check authorization
      if (course.instructorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new AppError('Not authorized', 403);
      }

      course.content.push({
        title,
        type, // 'video', 'pdf', 'document'
        url,
        duration,
        uploadedAt: new Date(),
      });

      await course.save();

      res.json({
        success: true,
        message: 'Content added successfully',
        data: { course },
      });
    } catch (error) {
      next(error);
    }
  }

  // ============ GET INSTRUCTOR COURSES ============
  static async getInstructorCourses(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const courses = await Course.find({ instructorId: req.user._id })
        .populate('categoryId')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await Course.countDocuments({ instructorId: req.user._id });

      res.json({
        success: true,
        data: {
          courses,
          pagination: {
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CourseController;
