const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Attachment = require('../models/Attachment');
const Task = require('../models/Task');

// Create Comment
exports.createComment = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
  body('taskId')
    .isMongoId()
    .withMessage('Invalid task ID'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { content, taskId, mentions } = req.body;

      // Verify task exists
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const comment = new Comment({
        content,
        task: taskId,
        author: req.user._id,
        mentions: mentions || []
      });

      await comment.save();
      await comment.populate('author', 'username email firstName lastName');
      await comment.populate('mentions', 'username email firstName lastName');

      // Add comment to task
      task.comments.push(comment._id);
      await task.save();

      res.status(201).json({
        message: 'Comment created successfully',
        comment
      });
    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  }
];

// Get Comments for Task
exports.getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Verify task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const skip = (page - 1) * limit;

    const comments = await Comment.find({ task: taskId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username email firstName lastName profilePicture')
      .populate('mentions', 'username email firstName lastName')
      .populate('attachments');

    const total = await Comment.countDocuments({ task: taskId });

    res.status(200).json({
      comments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// Update Comment
exports.updateComment = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { commentId } = req.params;
      const { content } = req.body;

      const comment = await Comment.findById(commentId);

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Check if user is the author
      if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'You can only edit your own comments' });
      }

      comment.content = content;
      comment.isEdited = true;
      comment.editedAt = new Date();
      await comment.save();
      await comment.populate('author', 'username email firstName lastName profilePicture');

      res.status(200).json({
        message: 'Comment updated successfully',
        comment
      });
    } catch (error) {
      console.error('Update comment error:', error);
      res.status(500).json({ error: 'Failed to update comment' });
    }
  }
];

// Delete Comment
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    // Remove comment from task
    await Task.findByIdAndUpdate(comment.task, { $pull: { comments: comment._id } });

    // Delete attachments associated with comment
    if (comment.attachments && comment.attachments.length > 0) {
      await Attachment.deleteMany({ _id: { $in: comment.attachments } });
    }

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

// Add Mention to Comment
exports.addMention = [
  body('mentions')
    .isArray()
    .withMessage('mentions must be an array')
    .custom(value => {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error('At least one user must be mentioned');
      }
      return true;
    }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { commentId } = req.params;
      const { mentions } = req.body;

      const comment = await Comment.findById(commentId);

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Check if user is the author
      if (comment.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'You can only modify your own comments' });
      }

      comment.mentions = mentions;
      await comment.save();
      await comment.populate('mentions', 'username email firstName lastName');

      res.status(200).json({
        message: 'Mentions added successfully',
        comment
      });
    } catch (error) {
      console.error('Add mention error:', error);
      res.status(500).json({ error: 'Failed to add mentions' });
    }
  }
];
