/**
 * User Controller
 * Handles user management and admin operations
 */

const User = require('../models/User');
const Analysis = require('../models/Analysis');
const Roadmap = require('../models/Roadmap');
const config = require('../config');

/**
 * Get current user dashboard data
 * GET /api/users/dashboard
 */
exports.getDashboard = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get user data
        const user = await User.findById(userId)
            .select('name email currentRole targetRole createdAt lastLogin');

        // Get analysis stats
        const analysisStats = await Analysis.getUserStats(userId);

        // Get roadmap stats
        const roadmapStats = await Roadmap.getUserStats(userId);

        // Get recent activity (last 5 analyses and roadmap updates)
        const [recentAnalyses, recentRoadmaps] = await Promise.all([
            Analysis.find({ user: userId })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('targetRole overallMatchScore status createdAt'),
            Roadmap.find({ user: userId })
                .sort({ updatedAt: -1 })
                .limit(5)
                .select('title targetRole progress status updatedAt'),
        ]);

        res.status(200).json({
            success: true,
            dashboard: {
                user: {
                    name: user.name,
                    email: user.email,
                    currentRole: user.currentRole,
                    targetRole: user.targetRole,
                    memberSince: user.createdAt,
                    lastLogin: user.lastLogin,
                },
                stats: {
                    analyses: {
                        total: analysisStats.totalAnalyses || 0,
                        avgMatchScore: Math.round(analysisStats.avgMatchScore || 0),
                        highestScore: analysisStats.highestScore || 0,
                        skillsIdentified: analysisStats.totalSkillsIdentified || 0,
                        gapsIdentified: analysisStats.totalGapsIdentified || 0,
                    },
                    roadmaps: {
                        total: roadmapStats.totalRoadmaps || 0,
                        active: roadmapStats.activeRoadmaps || 0,
                        completed: roadmapStats.completedRoadmaps || 0,
                        avgProgress: Math.round(roadmapStats.avgProgress || 0),
                    },
                },
                recentActivity: {
                    analyses: recentAnalyses,
                    roadmaps: recentRoadmaps,
                },
                roleBreakdown: analysisStats.roleDistribution || [],
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user by ID (Admin only)
 * GET /api/users/:id
 */
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .populate({
                path: 'analyses',
                select: 'targetRole overallMatchScore status createdAt',
                options: { limit: 10, sort: { createdAt: -1 } },
            })
            .populate({
                path: 'savedRoadmaps',
                select: 'title progress status',
                options: { limit: 10, sort: { updatedAt: -1 } },
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
 * Get all users (Admin only)
 * GET /api/users
 */
exports.getAllUsers = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            role,
            isActive,
            sortBy = 'createdAt',
            order = 'desc',
        } = req.query;

        // Build query
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        if (role) query.role = role;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOrder = order === 'asc' ? 1 : -1;

        const [users, total] = await Promise.all([
            User.find(query)
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(parseInt(limit))
                .select('-password'),
            User.countDocuments(query),
        ]);

        res.status(200).json({
            success: true,
            users,
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
 * Update user (Admin only)
 * PUT /api/users/:id
 */
exports.updateUser = async (req, res, next) => {
    try {
        const allowedFields = ['name', 'role', 'isActive', 'isEmailVerified'];
        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

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
 * Delete user (Admin only)
 * DELETE /api/users/:id
 */
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete your own account',
            });
        }

        // Delete associated data
        await Promise.all([
            Analysis.deleteMany({ user: user._id }),
            Roadmap.deleteMany({ user: user._id }),
            User.findByIdAndDelete(user._id),
        ]);

        res.status(200).json({
            success: true,
            message: 'User and associated data deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get system statistics (Admin only)
 * GET /api/users/admin/stats
 */
exports.getAdminStats = async (req, res, next) => {
    try {
        // Get user stats
        const userStats = await User.getStats();

        // Get total analyses
        const analysisCount = await Analysis.countDocuments();
        const completedAnalysisCount = await Analysis.countDocuments({ status: 'completed' });

        // Get total roadmaps
        const roadmapCount = await Roadmap.countDocuments();
        const completedRoadmapCount = await Roadmap.countDocuments({ status: 'completed' });

        // Get recent signups (last 7 days)
        const recentSignups = await User.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        });

        // Get popular roles
        const popularRoles = await Analysis.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: '$targetRole', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]);

        res.status(200).json({
            success: true,
            stats: {
                users: {
                    ...userStats,
                    recentSignups,
                },
                analyses: {
                    total: analysisCount,
                    completed: completedAnalysisCount,
                },
                roadmaps: {
                    total: roadmapCount,
                    completed: completedRoadmapCount,
                },
                popularRoles,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Export user data (GDPR compliance)
 * GET /api/users/export
 */
exports.exportUserData = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get all user data
        const [user, analyses, roadmaps] = await Promise.all([
            User.findById(userId).select('-password'),
            Analysis.find({ user: userId }).select('-nlpResponse -resumeHash'),
            Roadmap.find({ user: userId }),
        ]);

        const exportData = {
            exportDate: new Date().toISOString(),
            user: user.toJSON(),
            analyses: analyses.map(a => a.toJSON()),
            roadmaps: roadmaps.map(r => r.toJSON()),
        };

        // Set headers for file download
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=skilllens-data-export-${userId}.json`);

        res.status(200).json(exportData);
    } catch (error) {
        next(error);
    }
};

/**
 * Update user preferences
 * PUT /api/users/preferences
 */
exports.updatePreferences = async (req, res, next) => {
    try {
        const { preferences } = req.body;

        if (!preferences || typeof preferences !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'Invalid preferences format',
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { preferences },
            { new: true }
        ).select('preferences');

        res.status(200).json({
            success: true,
            preferences: user.preferences,
        });
    } catch (error) {
        next(error);
    }
};
