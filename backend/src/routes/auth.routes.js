/**
 * Authentication Routes
 * Handles user registration, login, password management
 */

const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validators');

// Public routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);

// Protected routes (require authentication)
router.use(authenticate); // Apply auth middleware to all routes below

router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.put('/password', authController.changePassword);
router.delete('/account', authController.deleteAccount);

module.exports = router;
