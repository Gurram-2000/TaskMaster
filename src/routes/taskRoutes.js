const express = require('express');
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All task routes are protected
router.use(authenticate);

// CRUD Operations
router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/:taskId', taskController.getTaskById);
router.put('/:taskId', taskController.updateTask);
router.delete('/:taskId', taskController.deleteTask);

// Task-specific operations
router.patch('/:taskId/complete', taskController.completeTask);
router.post('/:taskId/assign', taskController.assignTask);

module.exports = router;
