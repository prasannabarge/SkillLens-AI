/**
 * Authentication Middleware
 * JWT verification and role-based access control
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

/**
 * Authenticate user using JWT token
 */
exports.authenticate = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check for token in cookies (for web apps)
        if (!token && req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.',
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, config.jwt.secret);

            // Check if user still exists
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'User no longer exists.',
                });
            }

            // Check if user is active
            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    error: 'Account has been deactivated.',
                });
            }

            // Attach user to request object
            req.user = {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
            };

            next();
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Token has expired. Please log in again.',
                });
            }

            if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid token.',
                });
            }

            throw jwtError;
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Restrict access to specific roles
 * @param {...string} roles - Allowed roles
 */
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required.',
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to perform this action.',
            });
        }

        next();
    };
};

/**
 * Optional authentication
 * Continue without error if no token provided
 */
exports.optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next();
        }

        try {
            const decoded = jwt.verify(token, config.jwt.secret);
            const user = await User.findById(decoded.id).select('-password');

            if (user && user.isActive) {
                req.user = {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            }
        } catch (jwtError) {
            // Ignore token errors for optional auth
            console.log('Optional auth - invalid token ignored');
        }

        next();
    } catch (error) {
        next(error);
    }
};
