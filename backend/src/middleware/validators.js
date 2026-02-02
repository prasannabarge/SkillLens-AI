/**
 * Validation Middleware
 * Input validation for API requests
 */

/**
 * Validate user registration input
 */
exports.validateRegistration = (req, res, next) => {
    const errors = [];
    const { name, email, password } = req.body;

    // Name validation
    if (!name || typeof name !== 'string') {
        errors.push({ field: 'name', message: 'Name is required' });
    } else if (name.length < 2) {
        errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
    } else if (name.length > 50) {
        errors.push({ field: 'name', message: 'Name cannot exceed 50 characters' });
    }

    // Email validation
    if (!email || typeof email !== 'string') {
        errors.push({ field: 'email', message: 'Email is required' });
    } else if (!isValidEmail(email)) {
        errors.push({ field: 'email', message: 'Please provide a valid email address' });
    }

    // Password validation
    if (!password || typeof password !== 'string') {
        errors.push({ field: 'password', message: 'Password is required' });
    } else {
        const passwordErrors = validatePassword(password);
        errors.push(...passwordErrors);
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors,
        });
    }

    next();
};

/**
 * Validate login input
 */
exports.validateLogin = (req, res, next) => {
    const errors = [];
    const { email, password } = req.body;

    if (!email || typeof email !== 'string') {
        errors.push({ field: 'email', message: 'Email is required' });
    }

    if (!password || typeof password !== 'string') {
        errors.push({ field: 'password', message: 'Password is required' });
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors,
        });
    }

    next();
};

/**
 * Validate analysis request
 */
exports.validateAnalysis = (req, res, next) => {
    const errors = [];
    const { targetRole } = req.body;

    // Check if file was uploaded
    if (!req.file) {
        errors.push({ field: 'resume', message: 'Resume file is required' });
    }

    // Validate target role
    if (!targetRole || typeof targetRole !== 'string') {
        errors.push({ field: 'targetRole', message: 'Target role is required' });
    } else {
        const validRoles = [
            'frontend-developer',
            'backend-developer',
            'fullstack-developer',
            'data-scientist',
            'data-analyst',
            'devops-engineer',
            'ml-engineer',
            'cloud-architect',
            'product-manager',
            'ui-ux-designer',
        ];

        if (!validRoles.includes(targetRole)) {
            errors.push({
                field: 'targetRole',
                message: `Invalid target role. Valid options: ${validRoles.join(', ')}`,
            });
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors,
        });
    }

    next();
};

/**
 * Validate roadmap generation request
 */
exports.validateRoadmapGeneration = (req, res, next) => {
    const errors = [];
    const { analysisId } = req.body;

    if (!analysisId || typeof analysisId !== 'string') {
        errors.push({ field: 'analysisId', message: 'Analysis ID is required' });
    } else if (!isValidObjectId(analysisId)) {
        errors.push({ field: 'analysisId', message: 'Invalid analysis ID format' });
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors,
        });
    }

    next();
};

/**
 * Validate progress update request
 */
exports.validateProgressUpdate = (req, res, next) => {
    const errors = [];
    const { phaseIndex, milestoneIndex, isCompleted } = req.body;

    if (phaseIndex === undefined || typeof phaseIndex !== 'number' || phaseIndex < 0) {
        errors.push({ field: 'phaseIndex', message: 'Valid phase index is required' });
    }

    if (milestoneIndex === undefined || typeof milestoneIndex !== 'number' || milestoneIndex < 0) {
        errors.push({ field: 'milestoneIndex', message: 'Valid milestone index is required' });
    }

    if (isCompleted !== undefined && typeof isCompleted !== 'boolean') {
        errors.push({ field: 'isCompleted', message: 'isCompleted must be a boolean' });
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors,
        });
    }

    next();
};

/**
 * Validate MongoDB ObjectId
 */
exports.validateObjectId = (paramName = 'id') => {
    return (req, res, next) => {
        const id = req.params[paramName];

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                error: `Invalid ${paramName} format`,
            });
        }

        next();
    };
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 */
function validatePassword(password) {
    const errors = [];

    if (password.length < 8) {
        errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
    }

    if (password.length > 128) {
        errors.push({ field: 'password', message: 'Password cannot exceed 128 characters' });
    }

    // Optional: Add more password strength requirements
    // if (!/[A-Z]/.test(password)) {
    //     errors.push({ field: 'password', message: 'Password must contain an uppercase letter' });
    // }
    // if (!/[a-z]/.test(password)) {
    //     errors.push({ field: 'password', message: 'Password must contain a lowercase letter' });
    // }
    // if (!/[0-9]/.test(password)) {
    //     errors.push({ field: 'password', message: 'Password must contain a number' });
    // }

    return errors;
}

/**
 * Check if string is valid MongoDB ObjectId
 */
function isValidObjectId(id) {
    if (!id || typeof id !== 'string') return false;
    return /^[0-9a-fA-F]{24}$/.test(id);
}
