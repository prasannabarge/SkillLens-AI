/**
 * Authentication Controller
 * Handles user registration, login, password reset, and profile management
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const config = require('../config');

/**
 * Generate JWT token
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role,
        },
        config.jwt.secret,
        {
            expiresIn: config.jwt.expiresIn,
            algorithm: config.jwt.algorithm,
        }
    );
};

/**
 * Send token response
 * @param {Object} user - User object
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 */
const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user);

    // Remove sensitive data
    const userData = user.toJSON();

    res.status(statusCode).json({
        success: true,
        token,
        user: userData,
    });
};

/**
 * Register new user
 * POST /api/auth/register
 */
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, currentRole, targetRole } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'An account with this email already exists',
            });
        }

        // Create new user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            currentRole,
            targetRole,
        });

        // Generate email verification token (placeholder for email service)
        const verificationToken = user.createEmailVerificationToken();
        await user.save({ validateBeforeSave: false });

        console.log(`User registered: ${email}, verification token: ${verificationToken}`);

        // TODO: Send verification email when email service is implemented

        sendTokenResponse(user, 201, res);
    } catch (error) {
        next(error);
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide email and password',
            });
        }

        // Find user with password
        const user = await User.findByEmail(email.toLowerCase());

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Account has been deactivated. Please contact support.',
            });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
        }

        // Record login
        await user.recordLogin();

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user profile
 * GET /api/auth/profile
 */
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .populate({
                path: 'analyses',
                select: 'targetRole overallMatchScore status createdAt',
                options: { limit: 5, sort: { createdAt: -1 } },
            })
            .populate({
                path: 'savedRoadmaps',
                select: 'title targetRole progress status',
                options: { limit: 5, sort: { updatedAt: -1 } },
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 */
exports.updateProfile = async (req, res, next) => {
    try {
        // Fields allowed to update
        const allowedFields = ['name', 'bio', 'currentRole', 'targetRole', 'preferences'];
        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Change password
 * PUT /api/auth/password
 */
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Please provide current and new password',
            });
        }

        // Get user with password
        const user = await User.findById(req.user.id).select('+password');

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect',
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

/**
 * Forgot password - request reset token
 * POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Don't reveal if email exists
            return res.status(200).json({
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent.',
            });
        }

        // Generate reset token
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // TODO: Send reset email when email service is implemented
        console.log(`Password reset token for ${email}: ${resetToken}`);

        res.status(200).json({
            success: true,
            message: 'If an account exists with this email, a password reset link has been sent.',
            // Only in development - remove in production
            ...(config.isDev && { resetToken }),
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Reset password with token
 * POST /api/auth/reset-password/:token
 */
exports.resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Find user by reset token
        const user = await User.findByPasswordResetToken(token);

        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired reset token',
            });
        }

        // Update password
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

/**
 * Verify email
 * GET /api/auth/verify-email/:token
 */
exports.verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;

        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired verification token',
            });
        }

        // Verify email
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete account
 * DELETE /api/auth/account
 */
exports.deleteAccount = async (req, res, next) => {
    try {
        const { password } = req.body;

        // Get user with password
        const user = await User.findById(req.user.id).select('+password');

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Password is incorrect',
            });
        }

        // Soft delete - deactivate account
        user.isActive = false;
        user.email = `deleted_${user._id}_${user.email}`;
        await user.save({ validateBeforeSave: false });

        // Alternatively, hard delete:
        // await User.findByIdAndDelete(req.user.id);

        res.status(200).json({
            success: true,
            message: 'Account deactivated successfully',
        });
    } catch (error) {
        next(error);
    }
};
