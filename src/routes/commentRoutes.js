const express = require('express');
const commentController = require('../controllers/commentController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All comment routes are protected
router.use(authenticate);

// Comment CRUD
router.post('/', commentController.createComment);
router.get('/task/:taskId', commentController.getCommentsByTask);
router.put('/:commentId', commentController.updateComment);
router.delete('/:commentId', commentController.deleteComment);

// Mentions
router.post('/:commentId/mentions', commentController.addMention);

module.exports = router;
