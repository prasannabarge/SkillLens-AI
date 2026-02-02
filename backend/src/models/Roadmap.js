/**
 * Roadmap Model
 * Enhanced MongoDB schema for learning roadmaps
 */

const mongoose = require('mongoose');

// Learning resource sub-document
const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['course', 'article', 'video', 'book', 'project', 'tutorial', 'documentation', 'certification', 'youtube'],
        required: true,
    },
    url: String,
    provider: String,
    duration: String,
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
    },
    isFree: {
        type: Boolean,
        default: true,
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
    },
    description: String,
    // YouTube-specific fields
    thumbnail: String,
    thumbnailHQ: String,
    videoId: String,
    views: String,
}, { _id: false });

// Milestone sub-document
const milestoneSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    skills: [{
        type: String,
    }],
    resources: [resourceSchema],
    estimatedTime: String,
    order: {
        type: Number,
        required: true,
    },
    // Progress tracking
    isCompleted: {
        type: Boolean,
        default: false,
    },
    completedAt: Date,
    startedAt: Date,
    notes: String,
    // Skill verification
    requiresProject: {
        type: Boolean,
        default: false,
    },
    projectIdea: String,
});

// Phase sub-document
const phaseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: String,
    order: {
        type: Number,
        required: true,
    },
    milestones: [milestoneSchema],
    estimatedDuration: String,
    color: {
        type: String,
        default: '#3B82F6', // Default blue
    },
    icon: String,
    // Phase status
    isCompleted: {
        type: Boolean,
        default: false,
    },
    completedAt: Date,
});

const roadmapSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    analysis: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Analysis',
        required: true,
    },
    // Target information
    targetRole: {
        type: String,
        required: true,
    },
    targetRoleLabel: String,
    // Roadmap content
    title: {
        type: String,
        default: function () {
            return `${this.targetRoleLabel || this.targetRole} Learning Path`;
        },
    },
    description: String,
    phases: [phaseSchema],
    // Time estimates
    totalEstimatedTime: String,
    startDate: Date,
    targetCompletionDate: Date,
    actualCompletionDate: Date,
    // Progress tracking
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    currentPhase: {
        type: Number,
        default: 0,
    },
    currentMilestone: {
        type: Number,
        default: 0,
    },
    // Status
    status: {
        type: String,
        enum: ['draft', 'active', 'paused', 'completed', 'abandoned'],
        default: 'draft',
    },
    isSaved: {
        type: Boolean,
        default: false,
    },
    isPublic: {
        type: Boolean,
        default: false,
    },
    // Sharing
    shareToken: String,
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    // Customization
    customizations: {
        weeklyHours: {
            type: Number,
            default: 10,
        },
        preferredResourceTypes: [{
            type: String,
            enum: ['course', 'article', 'video', 'book', 'project', 'tutorial'],
        }],
        excludeProviders: [String],
    },
    // Metadata
    version: {
        type: Number,
        default: 1,
    },
    lastActivityAt: Date,
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.__v;
            return ret;
        },
    },
});

// ============================================
// INDEXES
// ============================================

roadmapSchema.index({ user: 1, createdAt: -1 });
roadmapSchema.index({ user: 1, isSaved: 1 });
roadmapSchema.index({ shareToken: 1 });
roadmapSchema.index({ isPublic: 1, targetRole: 1 });

// ============================================
// VIRTUAL FIELDS
// ============================================

// Total milestones count
roadmapSchema.virtual('totalMilestones').get(function () {
    let count = 0;
    if (this.phases) {
        this.phases.forEach(phase => {
            count += phase.milestones ? phase.milestones.length : 0;
        });
    }
    return count;
});

// Completed milestones count
roadmapSchema.virtual('completedMilestones').get(function () {
    let count = 0;
    if (this.phases) {
        this.phases.forEach(phase => {
            if (phase.milestones) {
                count += phase.milestones.filter(m => m.isCompleted).length;
            }
        });
    }
    return count;
});

// Total phases count
roadmapSchema.virtual('totalPhases').get(function () {
    return this.phases ? this.phases.length : 0;
});

// Is roadmap started
roadmapSchema.virtual('isStarted').get(function () {
    return this.status === 'active' || this.completedMilestones > 0;
});

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Calculate and update progress
 * @returns {number} - Progress percentage
 */
roadmapSchema.methods.calculateProgress = function () {
    let completedMilestones = 0;
    let totalMilestones = 0;

    this.phases.forEach((phase, phaseIndex) => {
        let phaseCompleted = true;

        phase.milestones.forEach(milestone => {
            totalMilestones++;
            if (milestone.isCompleted) {
                completedMilestones++;
            } else {
                phaseCompleted = false;
            }
        });

        // Update phase completion status
        this.phases[phaseIndex].isCompleted = phaseCompleted;
        if (phaseCompleted && !this.phases[phaseIndex].completedAt) {
            this.phases[phaseIndex].completedAt = new Date();
        }
    });

    this.progress = totalMilestones > 0
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : 0;

    // Update status if fully completed
    if (this.progress === 100 && this.status !== 'completed') {
        this.status = 'completed';
        this.actualCompletionDate = new Date();
    }

    return this.progress;
};

/**
 * Mark a milestone as completed
 * @param {number} phaseIndex
 * @param {number} milestoneIndex
 * @param {string} notes - Optional completion notes
 */
roadmapSchema.methods.completeMilestone = async function (phaseIndex, milestoneIndex, notes = '') {
    if (this.phases[phaseIndex] && this.phases[phaseIndex].milestones[milestoneIndex]) {
        const milestone = this.phases[phaseIndex].milestones[milestoneIndex];
        milestone.isCompleted = true;
        milestone.completedAt = new Date();
        if (notes) milestone.notes = notes;

        this.lastActivityAt = new Date();
        this.calculateProgress();

        // Update current position
        this.updateCurrentPosition();

        await this.save();
    }
};

/**
 * Start the roadmap
 */
roadmapSchema.methods.start = async function () {
    this.status = 'active';
    this.startDate = new Date();
    this.lastActivityAt = new Date();

    // Mark first milestone as started
    if (this.phases[0] && this.phases[0].milestones[0]) {
        this.phases[0].milestones[0].startedAt = new Date();
    }

    await this.save();
};

/**
 * Pause the roadmap
 */
roadmapSchema.methods.pause = async function () {
    this.status = 'paused';
    this.lastActivityAt = new Date();
    await this.save();
};

/**
 * Resume the roadmap
 */
roadmapSchema.methods.resume = async function () {
    this.status = 'active';
    this.lastActivityAt = new Date();
    await this.save();
};

/**
 * Update current phase and milestone position
 */
roadmapSchema.methods.updateCurrentPosition = function () {
    for (let i = 0; i < this.phases.length; i++) {
        const phase = this.phases[i];
        for (let j = 0; j < phase.milestones.length; j++) {
            if (!phase.milestones[j].isCompleted) {
                this.currentPhase = i;
                this.currentMilestone = j;
                return;
            }
        }
    }
    // All completed
    this.currentPhase = this.phases.length - 1;
    this.currentMilestone = this.phases[this.currentPhase].milestones.length - 1;
};

/**
 * Generate share token
 */
roadmapSchema.methods.generateShareToken = function () {
    const crypto = require('crypto');
    this.shareToken = crypto.randomBytes(16).toString('hex');
    return this.shareToken;
};

// ============================================
// STATIC METHODS
// ============================================

/**
 * Find saved roadmaps for a user
 * @param {string} userId
 * @param {Object} options
 */
roadmapSchema.statics.findSavedByUser = async function (userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [roadmaps, total] = await Promise.all([
        this.find({ user: userId, isSaved: true })
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('analysis', 'targetRole overallMatchScore'),
        this.countDocuments({ user: userId, isSaved: true }),
    ]);

    return {
        roadmaps,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        },
    };
};

/**
 * Find public roadmaps by role
 * @param {string} targetRole
 */
roadmapSchema.statics.findPublicByRole = async function (targetRole, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    return this.find({
        isPublic: true,
        targetRole,
        status: 'completed',
    })
        .sort({ progress: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name avatar');
};

/**
 * Get user roadmap statistics
 * @param {string} userId
 */
roadmapSchema.statics.getUserStats = async function (userId) {
    const stats = await this.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalRoadmaps: { $sum: 1 },
                activeRoadmaps: {
                    $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
                },
                completedRoadmaps: {
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
                },
                avgProgress: { $avg: '$progress' },
            },
        },
    ]);

    return stats[0] || {
        totalRoadmaps: 0,
        activeRoadmaps: 0,
        completedRoadmaps: 0,
        avgProgress: 0,
    };
};

const Roadmap = mongoose.model('Roadmap', roadmapSchema);

module.exports = Roadmap;
