const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const User = require('../models/User');
const Team = require('../models/Team');

// Create Task
exports.createTask = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('teamId')
    .optional()
    .isMongoId()
    .withMessage('Invalid team ID'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, dueDate, priority, teamId, assignedTo, tags, project } = req.body;

      // Verify team exists if teamId is provided
      if (teamId) {
        const team = await Team.findById(teamId);
        if (!team) {
          return res.status(404).json({ error: 'Team not found' });
        }
      }

      const task = new Task({
        title,
        description,
        dueDate,
        priority: priority || 'medium',
        createdBy: req.user._id,
        team: teamId || null,
        project: project || null,
        tags: tags || [],
        assignedTo: assignedTo || []
      });

      await task.save();
      await task.populate('createdBy', 'username email firstName lastName');
      await task.populate('assignedTo', 'username email firstName lastName');

      res.status(201).json({
        message: 'Task created successfully',
        task
      });
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }
];

// Get All Tasks with filtering and sorting
exports.getTasks = async (req, res) => {
  try {
    const { status, priority, assignedTo, teamId, search, sortBy = '-createdAt', page = 1, limit = 10 } = req.query;

    let filter = {};

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by priority
    if (priority) {
      filter.priority = priority;
    }

    // Filter by assigned to user
    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    // Filter by team
    if (teamId) {
      filter.team = teamId;
    }

    // Search in title and description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Add filter to only show tasks the user is part of
    filter.$or = filter.$or || [];
    filter.$or.push(
      { createdBy: req.user._id },
      { assignedTo: req.user._id },
      { 'team.members.userId': req.user._id }
    );

    const skip = (page - 1) * limit;

    const tasks = await Task.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'username email firstName lastName')
      .populate('assignedTo', 'username email firstName lastName')
      .populate('team', 'name');

    const total = await Task.countDocuments(filter);

    res.status(200).json({
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Get Single Task
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('createdBy', 'username email firstName lastName')
      .populate('assignedTo', 'username email firstName lastName')
      .populate('team', 'name')
      .populate({
        path: 'comments',
        populate: [
          { path: 'author', select: 'username email firstName lastName' },
          { path: 'attachments' }
        ]
      })
      .populate('attachments');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({ task });
  } catch (error) {
    console.error('Get task by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

// Update Task
exports.updateTask = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(['open', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const task = await Task.findById(req.params.taskId);

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Check if user has permission to update
      const isCreator = task.createdBy.toString() === req.user._id.toString();
      const isAssigned = task.assignedTo.some(id => id.toString() === req.user._id.toString());

      if (!isCreator && !isAssigned && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'You do not have permission to update this task' });
      }

      const { title, description, status, priority, dueDate, assignedTo, tags } = req.body;

      // Handle task completion
      if (status === 'completed' && task.status !== 'completed') {
        task.completedAt = new Date();
        task.completedBy = req.user._id;
      }

      // Update fields
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate) task.dueDate = dueDate;
      if (assignedTo) task.assignedTo = assignedTo;
      if (tags) task.tags = tags;

      await task.save();
      await task.populate('createdBy', 'username email firstName lastName');
      await task.populate('assignedTo', 'username email firstName lastName');

      res.status(200).json({
        message: 'Task updated successfully',
        task
      });
    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  }
];

// Delete Task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user has permission to delete
    if (task.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to delete this task' });
    }

    await Task.findByIdAndDelete(req.params.taskId);

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

// Mark Task as Completed
exports.completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.status = 'completed';
    task.completedAt = new Date();
    task.completedBy = req.user._id;
    await task.save();

    res.status(200).json({
      message: 'Task marked as completed',
      task
    });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ error: 'Failed to complete task' });
  }
};

// Assign Task to User
exports.assignTask = [
  body('assignedTo')
    .isArray()
    .withMessage('assignedTo must be an array of user IDs')
    .custom(value => {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error('At least one user must be assigned');
      }
      return true;
    }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { assignedTo } = req.body;
      const task = await Task.findById(req.params.taskId);

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Verify all users exist
      const users = await User.find({ _id: { $in: assignedTo } });
      if (users.length !== assignedTo.length) {
        return res.status(400).json({ error: 'One or more users do not exist' });
      }

      task.assignedTo = assignedTo;
      await task.save();
      await task.populate('assignedTo', 'username email firstName lastName');

      res.status(200).json({
        message: 'Task assigned successfully',
        task
      });
    } catch (error) {
      console.error('Assign task error:', error);
      res.status(500).json({ error: 'Failed to assign task' });
    }
  }
];
