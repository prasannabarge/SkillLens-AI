/**
 * File Upload Middleware
 * Handles resume file uploads using Multer
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Ensure upload directory exists
const uploadDir = path.resolve(config.upload.uploadDir);
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`📁 Created upload directory: ${uploadDir}`);
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9]/g, '_')
            .substring(0, 50);
        cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    },
});

// File filter
const fileFilter = (req, file, cb) => {
    // Check MIME type
    if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed. Allowed types: ${config.upload.allowedExtensions.join(', ')}`), false);
    }
};

// Create multer instance
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: config.upload.maxSize,
        files: 1,
    },
});

// Error handling wrapper
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: `File too large. Maximum size is ${config.upload.maxSize / (1024 * 1024)}MB`,
            });
        }

        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Too many files uploaded. Only 1 file allowed.',
            });
        }

        return res.status(400).json({
            success: false,
            error: err.message,
        });
    }

    if (err) {
        return res.status(400).json({
            success: false,
            error: err.message,
        });
    }

    next();
};

// Export middleware with error handling
module.exports = {
    single: (fieldName) => {
        return (req, res, next) => {
            upload.single(fieldName)(req, res, (err) => {
                handleUploadError(err, req, res, next);
            });
        };
    },
    array: (fieldName, maxCount) => {
        return (req, res, next) => {
            upload.array(fieldName, maxCount)(req, res, (err) => {
                handleUploadError(err, req, res, next);
            });
        };
    },
};
