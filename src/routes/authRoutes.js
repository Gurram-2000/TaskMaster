const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Public Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected Routes
router.use(authenticate);

router.get('/me', authController.getCurrentUser);
router.put('/profile', authController.updateProfile);
router.post('/change-password', authController.changePassword);
router.post('/logout', authController.logout);

module.exports = router;
