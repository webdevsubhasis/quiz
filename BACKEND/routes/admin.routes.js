const express = require('express');
const router = express.Router();
const admin = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');

// // All admin routes require token + role admin/owner
// router.use(authMiddleware.verifyToken);
// router.use(authMiddleware.requireAdmin);

// // Subjects
// router.post('/subjects', admin.createSubject);
// router.get('/subjects', admin.getSubjects);
// router.delete('/subjects/:id', admin.deleteSubject);

// // Questions
// router.post('/questions', admin.createQuestion);
// router.get('/questions', admin.getQuestions);
// router.get('/questions/:subjectId', admin.getQuestionsBySubject);
// router.delete('/questions/:id', admin.deleteQuestion);

// stats
router.get('/stats', admin.getStats);

module.exports = router;
