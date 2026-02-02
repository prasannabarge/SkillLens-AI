/**
 * Roadmap Controller
 * Handles roadmap generation, progress tracking, and sharing
 */

const Roadmap = require('../models/Roadmap');
const Analysis = require('../models/Analysis');
const User = require('../models/User');
const roadmapService = require('../services/roadmap.service');

/**
 * Generate learning roadmap from analysis
 * POST /api/roadmap/generate
 */
exports.generateRoadmap = async (req, res, next) => {
    try {
        const { analysisId, customizations } = req.body;

        if (!analysisId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide an analysis ID',
            });
        }

        // Find analysis
        const analysis = await Analysis.findOne({
            _id: analysisId,
            user: req.user.id,
            status: 'completed',
        });

        if (!analysis) {
            return res.status(404).json({
                success: false,
                error: 'Completed analysis not found',
            });
        }

        // Check if roadmap already exists
        const existingRoadmap = await Roadmap.findOne({
            analysis: analysisId,
            user: req.user.id,
        });

        if (existingRoadmap) {
            return res.status(200).json({
                success: true,
                message: 'Roadmap already exists for this analysis',
                roadmap: existingRoadmap,
                existing: true,
            });
        }

        // Generate roadmap content
        console.log(`🗺️ Generating roadmap for ${analysis.targetRole}...`);

        const roadmapData = await roadmapService.generateRoadmap({
            gapSkills: analysis.gapSkills.map(s => s.name),
            targetRole: analysis.targetRole,
            matchScore: analysis.overallMatchScore,
            customizations: customizations || {},
        });

        // Create roadmap
        const roadmap = await Roadmap.create({
            user: req.user.id,
            analysis: analysis._id,
            targetRole: analysis.targetRole,
            targetRoleLabel: analysis.targetRoleLabel || analysis.targetRole,
            title: `${analysis.targetRoleLabel || analysis.targetRole} Learning Path`,
            description: `Personalized learning roadmap to become a ${analysis.targetRoleLabel || analysis.targetRole}`,
            phases: roadmapData.phases,
            totalEstimatedTime: roadmapData.totalEstimatedTime,
            customizations: customizations || {},
        });

        console.log(`✅ Roadmap generated with ${roadmap.totalPhases} phases`);

        res.status(201).json({
            success: true,
            roadmap,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get roadmap by ID
 * GET /api/roadmap/:id
 */
exports.getRoadmap = async (req, res, next) => {
    try {
        const roadmap = await Roadmap.findOne({
            _id: req.params.id,
            $or: [
                { user: req.user.id },
                { sharedWith: req.user.id },
            ],
        }).populate('analysis', 'targetRole overallMatchScore matchedSkills gapSkills');

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                error: 'Roadmap not found',
            });
        }

        res.status(200).json({
            success: true,
            roadmap,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get roadmap by share token (public)
 * GET /api/roadmap/shared/:token
 */
exports.getSharedRoadmap = async (req, res, next) => {
    try {
        const roadmap = await Roadmap.findOne({
            shareToken: req.params.token,
            $or: [{ isPublic: true }, { shareToken: { $exists: true } }],
        })
            .populate('user', 'name avatar')
            .populate('analysis', 'targetRole overallMatchScore');

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                error: 'Shared roadmap not found',
            });
        }

        res.status(200).json({
            success: true,
            roadmap,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get saved roadmaps for current user
 * GET /api/roadmap/saved
 */
exports.getSavedRoadmaps = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const result = await Roadmap.findSavedByUser(req.user.id, {
            page: parseInt(page),
            limit: parseInt(limit),
        });

        res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all user roadmaps
 * GET /api/roadmap/all
 */
exports.getAllRoadmaps = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const query = { user: req.user.id };
        if (status) query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [roadmaps, total] = await Promise.all([
            Roadmap.find(query)
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('analysis', 'targetRole overallMatchScore'),
            Roadmap.countDocuments(query),
        ]);

        res.status(200).json({
            success: true,
            roadmaps,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Save roadmap
 * POST /api/roadmap/:id/save
 */
exports.saveRoadmap = async (req, res, next) => {
    try {
        const roadmap = await Roadmap.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { isSaved: true },
            { new: true }
        );

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                error: 'Roadmap not found',
            });
        }

        // Add to user's saved roadmaps
        await User.findByIdAndUpdate(
            req.user.id,
            { $addToSet: { savedRoadmaps: roadmap._id } }
        );

        res.status(200).json({
            success: true,
            message: 'Roadmap saved successfully',
            roadmap,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Unsave roadmap
 * DELETE /api/roadmap/:id/save
 */
exports.unsaveRoadmap = async (req, res, next) => {
    try {
        const roadmap = await Roadmap.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { isSaved: false },
            { new: true }
        );

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                error: 'Roadmap not found',
            });
        }

        // Remove from user's saved roadmaps
        await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { savedRoadmaps: roadmap._id } }
        );

        res.status(200).json({
            success: true,
            message: 'Roadmap unsaved successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update roadmap progress
 * PUT /api/roadmap/:id/progress
 */
exports.updateProgress = async (req, res, next) => {
    try {
        const { phaseIndex, milestoneIndex, isCompleted, notes } = req.body;

        // Validate indices
        if (phaseIndex === undefined || milestoneIndex === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Please provide phaseIndex and milestoneIndex',
            });
        }

        const roadmap = await Roadmap.findOne({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                error: 'Roadmap not found',
            });
        }

        // Validate phase and milestone exist
        if (!roadmap.phases[phaseIndex] ||
            !roadmap.phases[phaseIndex].milestones[milestoneIndex]) {
            return res.status(400).json({
                success: false,
                error: 'Invalid phase or milestone index',
            });
        }

        if (isCompleted) {
            await roadmap.completeMilestone(phaseIndex, milestoneIndex, notes);
        } else {
            // Mark as incomplete
            roadmap.phases[phaseIndex].milestones[milestoneIndex].isCompleted = false;
            roadmap.phases[phaseIndex].milestones[milestoneIndex].completedAt = null;
            roadmap.calculateProgress();
            await roadmap.save();
        }

        res.status(200).json({
            success: true,
            progress: roadmap.progress,
            currentPhase: roadmap.currentPhase,
            currentMilestone: roadmap.currentMilestone,
            roadmap,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Start roadmap
 * POST /api/roadmap/:id/start
 */
exports.startRoadmap = async (req, res, next) => {
    try {
        const roadmap = await Roadmap.findOne({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                error: 'Roadmap not found',
            });
        }

        if (roadmap.status === 'active') {
            return res.status(400).json({
                success: false,
                error: 'Roadmap is already active',
            });
        }

        await roadmap.start();

        res.status(200).json({
            success: true,
            message: 'Roadmap started',
            roadmap,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Pause roadmap
 * POST /api/roadmap/:id/pause
 */
exports.pauseRoadmap = async (req, res, next) => {
    try {
        const roadmap = await Roadmap.findOne({
            _id: req.params.id,
            user: req.user.id,
            status: 'active',
        });

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                error: 'Active roadmap not found',
            });
        }

        await roadmap.pause();

        res.status(200).json({
            success: true,
            message: 'Roadmap paused',
            roadmap,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Resume roadmap
 * POST /api/roadmap/:id/resume
 */
exports.resumeRoadmap = async (req, res, next) => {
    try {
        const roadmap = await Roadmap.findOne({
            _id: req.params.id,
            user: req.user.id,
            status: 'paused',
        });

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                error: 'Paused roadmap not found',
            });
        }

        await roadmap.resume();

        res.status(200).json({
            success: true,
            message: 'Roadmap resumed',
            roadmap,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Generate share link
 * POST /api/roadmap/:id/share
 */
exports.shareRoadmap = async (req, res, next) => {
    try {
        const { isPublic = false } = req.body;

        const roadmap = await Roadmap.findOne({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                error: 'Roadmap not found',
            });
        }

        // Generate share token
        const shareToken = roadmap.generateShareToken();
        roadmap.isPublic = isPublic;
        await roadmap.save();

        const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/roadmap/shared/${shareToken}`;

        res.status(200).json({
            success: true,
            shareToken,
            shareUrl,
            isPublic,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete roadmap
 * DELETE /api/roadmap/:id
 */
exports.deleteRoadmap = async (req, res, next) => {
    try {
        const roadmap = await Roadmap.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                error: 'Roadmap not found',
            });
        }

        // Remove from user's saved roadmaps
        await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { savedRoadmaps: roadmap._id } }
        );

        res.status(200).json({
            success: true,
            message: 'Roadmap deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get roadmap statistics for current user
 * GET /api/roadmap/stats
 */
exports.getStats = async (req, res, next) => {
    try {
        const stats = await Roadmap.getUserStats(req.user.id);

        res.status(200).json({
            success: true,
            stats,
        });
    } catch (error) {
        next(error);
    }
};
