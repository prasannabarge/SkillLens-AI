/**
 * User Routes
 * Handles user management and admin operations
 */

const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const { authenticate, restrictTo } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// User routes
router.get('/dashboard', userController.getDashboard);
router.get('/export', userController.exportUserData);
router.put('/preferences', userController.updatePreferences);

// Admin-only routes
router.get('/admin/stats', restrictTo('admin'), userController.getAdminStats);
router.get('/', restrictTo('admin'), userController.getAllUsers);
router.get('/:id', restrictTo('admin'), userController.getUser);
router.put('/:id', restrictTo('admin'), userController.updateUser);
router.delete('/:id', restrictTo('admin'), userController.deleteUser);

module.exports = router;
