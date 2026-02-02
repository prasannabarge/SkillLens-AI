/**
 * Analysis Controller
 * Handles resume upload, skill analysis, and analysis management
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const Analysis = require('../models/Analysis');
const User = require('../models/User');
const nlpService = require('../services/nlp.service');
const config = require('../config');

/**
 * Analyze resume
 * POST /api/analysis/analyze
 */
exports.analyzeResume = async (req, res, next) => {
    const startTime = Date.now();
    let analysis = null;

    try {
        // Validate file upload
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload a resume file',
            });
        }

        const { targetRole } = req.body;
        if (!targetRole) {
            return res.status(400).json({
                success: false,
                error: 'Please select a target role',
            });
        }

        const filePath = req.file.path;
        const fileBuffer = await fs.readFile(filePath);

        // Generate file hash for duplicate detection
        const fileHash = crypto
            .createHash('md5')
            .update(fileBuffer)
            .digest('hex');

        // Check for recent duplicate analysis
        const existingAnalysis = await Analysis.findOne({
            user: req.user.id,
            resumeHash: fileHash,
            targetRole,
            status: 'completed',
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
        });

        if (existingAnalysis) {
            // Clean up uploaded file
            await fs.unlink(filePath);

            return res.status(200).json({
                success: true,
                message: 'Analysis found from recent upload',
                analysis: existingAnalysis,
                cached: true,
            });
        }

        // Create analysis record
        analysis = await Analysis.create({
            user: req.user.id,
            resumeFileName: req.file.originalname,
            resumeFileSize: req.file.size,
            resumeMimeType: req.file.mimetype,
            resumeText: '', // Will be populated by NLP service
            resumeHash: fileHash,
            targetRole,
            status: 'processing',
        });

        // Send to NLP service for processing
        console.log(`📝 Sending resume to NLP service for analysis...`);

        const nlpResult = await nlpService.analyzeResume(filePath, targetRole);

        // Update analysis with results
        await analysis.complete({
            extractedText: nlpResult.extracted_text,
            extractedSkills: nlpResult.extracted_skills?.map(skill => ({
                name: skill.name || skill,
                level: skill.level || 'intermediate',
                confidence: skill.confidence || 0.7,
                category: skill.category || 'other',
            })) || [],
            requiredSkills: nlpResult.required_skills?.map(skill => ({
                name: skill.name || skill,
                level: skill.level || 'intermediate',
                category: skill.category || 'other',
            })) || [],
            matchedSkills: nlpResult.matched_skills?.map(skill => ({
                name: skill.name || skill,
                level: skill.level || 'intermediate',
            })) || [],
            gapSkills: nlpResult.gap_skills?.map(skill => ({
                name: skill.name || skill,
                level: skill.level || 'beginner',
            })) || [],
            matchScore: nlpResult.match_score || 0,
            recommendations: nlpResult.recommendations || [],
        });

        // Generate summary
        analysis.generateSummary();
        analysis.processingTime = Date.now() - startTime;
        await analysis.save();

        // Add analysis to user's history
        await User.findByIdAndUpdate(
            req.user.id,
            { $push: { analyses: analysis._id } }
        );

        // Clean up uploaded file
        await fs.unlink(filePath);

        console.log(`✅ Analysis completed in ${analysis.processingTime}ms`);

        res.status(201).json({
            success: true,
            analysis,
        });
    } catch (error) {
        // Mark analysis as failed if it was created
        if (analysis) {
            await analysis.fail(error.message);
        }

        // Clean up file if it exists
        if (req.file && req.file.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error cleaning up file:', unlinkError);
            }
        }

        next(error);
    }
};

/**
 * Get analysis history for current user
 * GET /api/analysis/history
 */
exports.getHistory = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, targetRole } = req.query;

        const result = await Analysis.findByUser(req.user.id, {
            page: parseInt(page),
            limit: Math.min(parseInt(limit), config.pagination.maxLimit),
            status,
            targetRole,
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
 * Get single analysis by ID
 * GET /api/analysis/:id
 */
exports.getAnalysis = async (req, res, next) => {
    try {
        const analysis = await Analysis.findOne({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!analysis) {
            return res.status(404).json({
                success: false,
                error: 'Analysis not found',
            });
        }

        res.status(200).json({
            success: true,
            analysis,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete analysis
 * DELETE /api/analysis/:id
 */
exports.deleteAnalysis = async (req, res, next) => {
    try {
        const analysis = await Analysis.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!analysis) {
            return res.status(404).json({
                success: false,
                error: 'Analysis not found',
            });
        }

        // Remove from user's analyses array
        await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { analyses: analysis._id } }
        );

        res.status(200).json({
            success: true,
            message: 'Analysis deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get analysis statistics for current user
 * GET /api/analysis/stats
 */
exports.getStats = async (req, res, next) => {
    try {
        const stats = await Analysis.getUserStats(req.user.id);

        res.status(200).json({
            success: true,
            stats,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Re-analyze with different target role
 * POST /api/analysis/:id/reanalyze
 */
exports.reanalyze = async (req, res, next) => {
    try {
        const { targetRole } = req.body;

        if (!targetRole) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a target role',
            });
        }

        // Find original analysis
        const originalAnalysis = await Analysis.findOne({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!originalAnalysis) {
            return res.status(404).json({
                success: false,
                error: 'Analysis not found',
            });
        }

        // Create new analysis with same resume text
        const newAnalysis = await Analysis.create({
            user: req.user.id,
            resumeFileName: originalAnalysis.resumeFileName,
            resumeFileSize: originalAnalysis.resumeFileSize,
            resumeMimeType: originalAnalysis.resumeMimeType,
            resumeText: originalAnalysis.resumeText,
            resumeHash: originalAnalysis.resumeHash,
            targetRole,
            status: 'processing',
        });

        // Get skills match for new role
        const nlpResult = await nlpService.matchSkills(
            originalAnalysis.extractedSkills.map(s => s.name),
            targetRole
        );

        await newAnalysis.complete({
            extractedText: originalAnalysis.resumeText,
            extractedSkills: originalAnalysis.extractedSkills,
            requiredSkills: nlpResult.required_skills || [],
            matchedSkills: nlpResult.matched_skills || [],
            gapSkills: nlpResult.gap_skills || [],
            matchScore: nlpResult.match_score || 0,
        });

        // Add to user's history
        await User.findByIdAndUpdate(
            req.user.id,
            { $push: { analyses: newAnalysis._id } }
        );

        res.status(201).json({
            success: true,
            analysis: newAnalysis,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get available job roles
 * GET /api/analysis/roles
 */
exports.getRoles = async (req, res, next) => {
    try {
        const roles = await nlpService.getJobRoles();

        res.status(200).json({
            success: true,
            roles,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Compare multiple analyses
 * POST /api/analysis/compare
 */
exports.compareAnalyses = async (req, res, next) => {
    try {
        const { analysisIds } = req.body;

        if (!analysisIds || !Array.isArray(analysisIds) || analysisIds.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Please provide at least 2 analysis IDs to compare',
            });
        }

        const analyses = await Analysis.find({
            _id: { $in: analysisIds },
            user: req.user.id,
        }).select('targetRole targetRoleLabel overallMatchScore matchedSkills gapSkills createdAt');

        if (analyses.length !== analysisIds.length) {
            return res.status(404).json({
                success: false,
                error: 'One or more analyses not found',
            });
        }

        // Build comparison data
        const comparison = {
            analyses: analyses.map(a => ({
                id: a._id,
                targetRole: a.targetRole,
                targetRoleLabel: a.targetRoleLabel,
                matchScore: a.overallMatchScore,
                matchedCount: a.matchedSkills.length,
                gapCount: a.gapSkills.length,
                createdAt: a.createdAt,
            })),
            bestMatch: analyses.reduce((best, a) =>
                a.overallMatchScore > best.overallMatchScore ? a : best
            ),
            commonGaps: findCommonSkills(analyses.map(a => a.gapSkills.map(s => s.name))),
            commonMatches: findCommonSkills(analyses.map(a => a.matchedSkills.map(s => s.name))),
        };

        res.status(200).json({
            success: true,
            comparison,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Helper function to find common skills across analyses
 */
function findCommonSkills(skillArrays) {
    if (skillArrays.length === 0) return [];

    let common = new Set(skillArrays[0]);
    for (let i = 1; i < skillArrays.length; i++) {
        common = new Set([...common].filter(x => skillArrays[i].includes(x)));
    }
    return [...common];
}
