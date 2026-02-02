/**
 * User Model
 * Enhanced MongoDB schema with full functionality
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false, // Don't include password by default in queries
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    avatar: {
        type: String,
        default: null,
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    currentRole: {
        type: String,
        trim: true,
    },
    targetRole: {
        type: String,
        trim: true,
    },
    analyses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Analysis',
    }],
    savedRoadmaps: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Roadmap',
    }],
    // Account status
    isActive: {
        type: Boolean,
        default: true,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    // Password reset
    passwordResetToken: String,
    passwordResetExpires: Date,
    // Email verification
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    // Tracking
    lastLogin: Date,
    loginCount: {
        type: Number,
        default: 0,
    },
    // Preferences
    preferences: {
        emailNotifications: {
            type: Boolean,
            default: true,
        },
        weeklyProgress: {
            type: Boolean,
            default: true,
        },
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.passwordResetToken;
            delete ret.passwordResetExpires;
            delete ret.emailVerificationToken;
            delete ret.emailVerificationExpires;
            delete ret.__v;
            return ret;
        },
    },
    toObject: { virtuals: true },
});

// ============================================
// INDEXES
// ============================================

// Note: email index is already created via unique: true on the field
userSchema.index({ createdAt: -1 });

// ============================================
// VIRTUAL FIELDS
// ============================================

// Get total number of analyses
userSchema.virtual('analysisCount').get(function () {
    return this.analyses ? this.analyses.length : 0;
});

// Get total saved roadmaps
userSchema.virtual('roadmapCount').get(function () {
    return this.savedRoadmaps ? this.savedRoadmaps.length : 0;
});

// ============================================
// PRE-SAVE MIDDLEWARE
// ============================================

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Only hash if password is modified
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Compare password with hashed password
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Generate password reset token
 * @returns {string} - Reset token
 */
userSchema.methods.createPasswordResetToken = function () {
    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash and save to database
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expiration (10 minutes)
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    // Return unhashed token (to be sent via email)
    return resetToken;
};

/**
 * Generate email verification token
 * @returns {string} - Verification token
 */
userSchema.methods.createEmailVerificationToken = function () {
    const verificationToken = crypto.randomBytes(32).toString('hex');

    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    return verificationToken;
};

/**
 * Update last login timestamp
 */
userSchema.methods.recordLogin = async function () {
    this.lastLogin = new Date();
    this.loginCount += 1;
    await this.save({ validateBeforeSave: false });
};

// ============================================
// STATIC METHODS
// ============================================

/**
 * Find user by email with password
 * @param {string} email
 * @returns {Promise<User>}
 */
userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email }).select('+password');
};

/**
 * Find user by password reset token
 * @param {string} token - Unhashed token
 * @returns {Promise<User>}
 */
userSchema.statics.findByPasswordResetToken = function (token) {
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    return this.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
};

/**
 * Get user statistics
 * @returns {Promise<Object>}
 */
userSchema.statics.getStats = async function () {
    const stats = await this.aggregate([
        {
            $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                activeUsers: {
                    $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
                },
                verifiedUsers: {
                    $sum: { $cond: [{ $eq: ['$isEmailVerified', true] }, 1, 0] },
                },
            },
        },
    ]);

    return stats[0] || { totalUsers: 0, activeUsers: 0, verifiedUsers: 0 };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
