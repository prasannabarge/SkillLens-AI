/**
 * Global Error Handler Middleware
 * Catches and formats all errors for consistent API responses
 */

const config = require('../config');

// Custom error class for operational errors
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Handle MongoDB CastError (invalid ObjectId)
 */
const handleCastError = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

/**
 * Handle MongoDB duplicate key error
 */
const handleDuplicateKeyError = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field} '${value}' already exists. Please use a different ${field}.`;
    return new AppError(message, 400);
};

/**
 * Handle MongoDB validation error
 */
const handleValidationError = (err) => {
    const errors = Object.values(err.errors).map(el => ({
        field: el.path,
        message: el.message,
    }));

    const message = 'Validation failed';
    const error = new AppError(message, 400);
    error.details = errors;
    return error;
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () => new AppError('Token has expired. Please log in again.', 401);

/**
 * Send error response in development
 */
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        success: false,
        error: err.message,
        status: err.status,
        details: err.details || undefined,
        stack: err.stack,
        fullError: err,
    });
};

/**
 * Send error response in production
 */
const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
            details: err.details || undefined,
        });
    } else {
        // Programming or other unknown error: don't leak error details
        console.error('💥 ERROR:', err);

        res.status(500).json({
            success: false,
            error: 'Something went wrong. Please try again later.',
        });
    }
};

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error in all environments
    if (err.statusCode >= 500) {
        console.error(`💥 [${new Date().toISOString()}] ${err.message}`);
        if (config.isDev) {
            console.error(err.stack);
        }
    }

    if (config.isDev) {
        sendErrorDev(err, res);
    } else {
        let error = { ...err, message: err.message };

        // Handle specific error types
        if (err.name === 'CastError') error = handleCastError(err);
        if (err.code === 11000) error = handleDuplicateKeyError(err);
        if (err.name === 'ValidationError') error = handleValidationError(err);
        if (err.name === 'JsonWebTokenError') error = handleJWTError();
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
};

module.exports = errorHandler;
module.exports.AppError = AppError;
