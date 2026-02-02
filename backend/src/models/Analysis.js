/**
 * Analysis Model
 * Enhanced MongoDB schema for skill analysis results
 */

const mongoose = require('mongoose');

// Skill sub-document schema
const skillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate',
    },
    category: {
        type: String,
        enum: ['programming', 'frontend', 'backend', 'database', 'cloud_devops', 'data_ml', 'tools', 'soft_skills', 'other'],
        default: 'other',
    },
    confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.7,
    },
    yearsOfExperience: Number,
}, { _id: false });

// Recommendation sub-document schema
const recommendationSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        required: true,
    },
    reason: String,
    resources: [{
        title: String,
        url: String,
        type: {
            type: String,
            enum: ['course', 'article', 'video', 'book', 'tutorial', 'project'],
        },
    }],
}, { _id: false });

const analysisSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    // Resume information
    resumeFileName: {
        type: String,
        required: true,
    },
    resumeFileSize: Number,
    resumeMimeType: String,
    resumeText: {
        type: String,
        required: false, // Populated after NLP processing
        default: '',
    },
    resumeHash: {
        type: String,
        index: true, // For detecting duplicate resumes
    },
    // Target role
    targetRole: {
        type: String,
        required: true,
        index: true,
    },
    targetRoleLabel: String,
    // Extracted and analyzed skills
    extractedSkills: [skillSchema],
    requiredSkills: [skillSchema],
    matchedSkills: [skillSchema],
    gapSkills: [skillSchema],
    // Scores
    overallMatchScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    skillCoverage: {
        type: Number,
        min: 0,
        max: 100,
    },
    // Recommendations
    recommendations: [recommendationSchema],
    // Analysis summary
    summary: {
        strengths: [String],
        areasToImprove: [String],
        quickWins: [String], // Easy skills to acquire
    },
    // Processing metadata
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending',
        index: true,
    },
    processingTime: {
        type: Number, // in milliseconds
    },
    errorMessage: String,
    // NLP service response (for debugging)
    nlpResponse: {
        type: mongoose.Schema.Types.Mixed,
        select: false, // Don't include by default
    },
    // Versioning for schema changes
    schemaVersion: {
        type: Number,
        default: 1,
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.__v;
            delete ret.nlpResponse;
            return ret;
        },
    },
});

// ============================================
// INDEXES
// ============================================

analysisSchema.index({ user: 1, createdAt: -1 });
analysisSchema.index({ status: 1, createdAt: -1 });
analysisSchema.index({ targetRole: 1, overallMatchScore: -1 });

// ============================================
// VIRTUAL FIELDS
// ============================================

// Calculate number of gap skills
analysisSchema.virtual('gapCount').get(function () {
    return this.gapSkills ? this.gapSkills.length : 0;
});

// Calculate number of matched skills
analysisSchema.virtual('matchCount').get(function () {
    return this.matchedSkills ? this.matchedSkills.length : 0;
});

// Get skill match ratio as string
analysisSchema.virtual('matchRatio').get(function () {
    const matched = this.matchedSkills ? this.matchedSkills.length : 0;
    const total = this.requiredSkills ? this.requiredSkills.length : 0;
    return total > 0 ? `${matched}/${total}` : '0/0';
});

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Mark analysis as completed
 * @param {Object} results - Analysis results from NLP service
 */
analysisSchema.methods.complete = async function (results) {
    this.extractedSkills = results.extractedSkills || [];
    this.requiredSkills = results.requiredSkills || [];
    this.matchedSkills = results.matchedSkills || [];
    this.gapSkills = results.gapSkills || [];
    this.overallMatchScore = results.matchScore || 0;
    this.recommendations = results.recommendations || [];
    this.resumeText = results.extractedText || this.resumeText;
    this.status = 'completed';

    // Calculate skill coverage
    if (this.requiredSkills.length > 0) {
        this.skillCoverage = (this.matchedSkills.length / this.requiredSkills.length) * 100;
    }

    await this.save();
};

/**
 * Mark analysis as failed
 * @param {string} error - Error message
 */
analysisSchema.methods.fail = async function (error) {
    this.status = 'failed';
    this.errorMessage = error;
    await this.save();
};

/**
 * Generate analysis summary
 */
analysisSchema.methods.generateSummary = function () {
    const strengths = [];
    const areasToImprove = [];
    const quickWins = [];

    // Find strengths (high confidence matched skills)
    this.matchedSkills
        .filter(s => s.confidence > 0.8)
        .slice(0, 5)
        .forEach(s => strengths.push(s.name));

    // Find areas to improve (high priority gaps)
    this.recommendations
        .filter(r => r.priority === 'high')
        .slice(0, 3)
        .forEach(r => areasToImprove.push(r.skill));

    // Find quick wins (low/medium priority, beginner level gaps)
    this.gapSkills
        .filter(s => s.level === 'beginner')
        .slice(0, 3)
        .forEach(s => quickWins.push(s.name));

    this.summary = { strengths, areasToImprove, quickWins };
    return this.summary;
};

// ============================================
// STATIC METHODS
// ============================================

/**
 * Get analyses for a user with pagination
 * @param {string} userId
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>}
 */
analysisSchema.statics.findByUser = async function (userId, options = {}) {
    const {
        page = 1,
        limit = 10,
        status = null,
        targetRole = null,
    } = options;

    const query = { user: userId };
    if (status) query.status = status;
    if (targetRole) query.targetRole = targetRole;

    const skip = (page - 1) * limit;

    const [analyses, total] = await Promise.all([
        this.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-resumeText'),
        this.countDocuments(query),
    ]);

    return {
        analyses,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
            hasMore: page * limit < total,
        },
    };
};

/**
 * Get analysis statistics for a user
 * @param {string} userId
 * @returns {Promise<Object>}
 */
analysisSchema.statics.getUserStats = async function (userId) {
    const stats = await this.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId), status: 'completed' } },
        {
            $group: {
                _id: null,
                totalAnalyses: { $sum: 1 },
                avgMatchScore: { $avg: '$overallMatchScore' },
                highestScore: { $max: '$overallMatchScore' },
                totalSkillsIdentified: { $sum: { $size: '$extractedSkills' } },
                totalGapsIdentified: { $sum: { $size: '$gapSkills' } },
            },
        },
    ]);

    // Get role distribution
    const roleDistribution = await this.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: '$targetRole',
                count: { $sum: 1 },
            },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
    ]);

    return {
        ...(stats[0] || {
            totalAnalyses: 0,
            avgMatchScore: 0,
            highestScore: 0,
            totalSkillsIdentified: 0,
            totalGapsIdentified: 0,
        }),
        roleDistribution,
    };
};

const Analysis = mongoose.model('Analysis', analysisSchema);

module.exports = Analysis;
