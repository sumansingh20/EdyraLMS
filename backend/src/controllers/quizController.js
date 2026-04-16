import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import Submission from '../models/Submission.js';
import CheatDetection from '../models/CheatDetection.js';
import AuditLog from '../models/AuditLog.js';
import AppError from '../utils/AppError.js';

/* ========== QUIZ/EXAM CONTROLLER ========== */

class QuizController {
  // ============ CREATE EXAM ============
  static async createExam(req, res, next) {
    try {
      const {
        title,
        description,
        courseId,
        duration,
        passingScore,
        attempts,
        shuffleQuestions,
        shuffleOptions,
        showAnswers,
        negativeMarking,
        questionsIds,
      } = req.body;

      const exam = new Exam({
        title,
        description,
        courseId,
        instructorId: req.user._id,
        duration, // in minutes
        passingScore,
        maxAttempts: attempts || 1,
        shuffleQuestions: shuffleQuestions || false,
        shuffleOptions: shuffleOptions || false,
        showAnswersAfterSubmit: showAnswers || false,
        negativeMarking: negativeMarking || false,
        questionIds: questionsIds || [],
      });

      await exam.save();

      // Log action
      await AuditLog.create({
        userId: req.user._id,
        action: 'EXAM_CREATED',
        resource: 'Exam',
        resourceId: exam._id,
        details: { title, courseId },
      });

      res.status(201).json({
        success: true,
        message: 'Exam created successfully',
        data: { exam },
      });
    } catch (error) {
      next(error);
    }
  }

  // ============ GET EXAM ============
  static async getExam(req, res, next) {
    try {
      const { id } = req.params;

      const exam = await Exam.findById(id)
        .populate('courseId', 'title')
        .populate('questionIds')
        .populate('instructorId', 'firstName lastName');

      if (!exam) {
        throw new AppError('Exam not found', 404);
      }

      res.json({
        success: true,
        data: { exam },
      });
    } catch (error) {
      next(error);
    }
  }

  // ============ GET EXAM FOR ATTEMPT (Removes answers) ============
  static async getExamForAttempt(req, res, next) {
    try {
      const { id } = req.params;

      const exam = await Exam.findById(id).populate('questionIds');

      if (!exam) {
        throw new AppError('Exam not found', 404);
      }

      // Remove correct answers from response
      const questions = exam.questionIds.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        // correctAnswer NOT included
        marks: q.marks,
      }));

      // Shuffle if required
      let shuffledQuestions = questions;
      if (exam.shuffleQuestions) {
        shuffledQuestions = questions.sort(() => Math.random() - 0.5);
      }

      // Shuffle options if required
      if (exam.shuffleOptions) {
        shuffledQuestions = shuffledQuestions.map((q) => ({
          ...q,
          options: q.options.sort(() => Math.random() - 0.5),
        }));
      }

      // Check how many times student has attempted
      const attempts = await Submission.countDocuments({
        examId: id,
        studentId: req.user._id,
      });

      if (attempts >= exam.maxAttempts) {
        throw new AppError(`Maximum ${exam.maxAttempts} attempts exceeded`, 400);
      }

      res.json({
        success: true,
        data: {
          exam: {
            _id: exam._id,
            title: exam.title,
            description: exam.description,
            duration: exam.duration,
            totalMarks: exam.questionIds.reduce((sum, q) => sum + q.marks, 0),
            questions: shuffledQuestions,
            attemptsLeft: exam.maxAttempts - attempts,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ============ SUBMIT EXAM ============
  static async submitExam(req, res, next) {
    try {
      const { examId, answers, timeSpent, cheatingFlags } = req.body;

      // Validate exam exists
      const exam = await Exam.findById(examId).populate('questionIds');
      if (!exam) {
        throw new AppError('Exam not found', 404);
      }

      // Calculate score
      let score = 0;
      const detailedResults = [];

      for (const answer of answers) {
        const question = exam.questionIds.find((q) => q._id.toString() === answer.questionId);

        if (!question) continue;

        let isCorrect = false;

        if (question.questionType === 'mcq') {
          isCorrect = answer.selectedOption === question.correctAnswer;
        } else if (question.questionType === 'multiple_correct') {
          isCorrect =
            JSON.stringify(answer.selectedOptions.sort()) ===
            JSON.stringify(question.correctAnswers.sort());
        }

        const marks = isCorrect ? question.marks : exam.negativeMarking ? -question.marks / 4 : 0;
        score += marks;

        detailedResults.push({
          questionId: question._id,
          selectedAnswer: answer.selectedOption || answer.selectedOptions,
          correctAnswer: question.correctAnswer || question.correctAnswers,
          isCorrect,
          marksObtained: marks,
        });
      }

      // Record submission
      const submission = new Submission({
        examId,
        studentId: req.user._id,
        answers,
        score: Math.max(0, score), // Ensure score doesn't go below 0
        isPassed: score >= exam.passingScore,
        timeSpent,
        detailedResults,
        submittedAt: new Date(),
      });

      await submission.save();

      // Log cheating flags if any
      if (cheatingFlags && Object.values(cheatingFlags).some((flag) => flag)) {
        await CheatDetection.create({
          examId,
          studentId: req.user._id,
          submissionId: submission._id,
          flags: cheatingFlags,
          suspicionLevel: 'medium',
          status: 'flagged',
        });
      }

      // Log action
      await AuditLog.create({
        userId: req.user._id,
        action: 'EXAM_SUBMITTED',
        resource: 'Submission',
        resourceId: submission._id,
        details: { examId, score },
      });

      res.json({
        success: true,
        message: 'Exam submitted successfully',
        data: {
          submission,
          showAnswers: exam.showAnswersAfterSubmit,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ============ GET SUBMISSIONS ============
  static async getSubmissions(req, res, next) {
    try {
      const { examId, page = 1, limit = 10 } = req.query;

      const query = { examId };

      // Teachers see all submissions for their exams
      const exam = await Exam.findById(examId);
      if (exam.instructorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        query.studentId = req.user._id; // Students see only their own
      }

      const submissions = await Submission.find(query)
        .populate('studentId', 'firstName lastName email')
        .populate('examId', 'title')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ submittedAt: -1 });

      const total = await Submission.countDocuments(query);

      res.json({
        success: true,
        data: {
          submissions,
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

  // ============ GET RESULT ============
  static async getResult(req, res, next) {
    try {
      const { submissionId } = req.params;

      const submission = await Submission.findById(submissionId)
        .populate('examId')
        .populate('studentId', 'firstName lastName');

      if (!submission) {
        throw new AppError('Submission not found', 404);
      }

      // Check authorization
      if (
        submission.studentId._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin'
      ) {
        throw new AppError('Not authorized to view this result', 403);
      }

      res.json({
        success: true,
        data: { submission },
      });
    } catch (error) {
      next(error);
    }
  }

  // ============ UPDATE EXAM ============
  static async updateExam(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const exam = await Exam.findById(id);
      if (!exam) {
        throw new AppError('Exam not found', 404);
      }

      // Check authorization
      if (exam.instructorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new AppError('Not authorized', 403);
      }

      const updatedExam = await Exam.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });

      res.json({
        success: true,
        message: 'Exam updated successfully',
        data: { exam: updatedExam },
      });
    } catch (error) {
      next(error);
    }
  }

  // ============ DELETE EXAM ============
  static async deleteExam(req, res, next) {
    try {
      const { id } = req.params;

      const exam = await Exam.findById(id);
      if (!exam) {
        throw new AppError('Exam not found', 404);
      }

      // Check authorization
      if (exam.instructorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new AppError('Not authorized', 403);
      }

      await Exam.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Exam deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // ============ GET LEADERBOARD ============
  static async getLeaderboard(req, res, next) {
    try {
      const { examId, limit = 10 } = req.query;

      const leaderboard = await Submission.find({ examId })
        .populate('studentId', 'firstName lastName')
        .sort({ score: -1, submittedAt: 1 })
        .limit(limit);

      res.json({
        success: true,
        data: { leaderboard },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default QuizController;
