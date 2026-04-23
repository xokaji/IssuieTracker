const express = require('express');
const { body } = require('express-validator');
const {
  getIssues, getStats, getIssue, createIssue,
  updateIssue, deleteIssue, addComment, deleteComment
} = require('../controllers/issueController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const issueValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').optional().isLength({ max: 5000 }),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('severity').optional().isIn(['minor', 'moderate', 'major', 'critical']),
  body('type').optional().isIn(['bug', 'feature', 'improvement', 'task', 'question']),
];

router.use(protect);

router.get('/stats', getStats);
router.get('/', getIssues);
router.get('/:id', getIssue);
router.post('/', issueValidation, createIssue);
router.put('/:id', updateIssue);
router.delete('/:id', deleteIssue);
router.post('/:id/comments', body('content').trim().notEmpty(), addComment);
router.delete('/:id/comments/:commentId', deleteComment);

module.exports = router;
