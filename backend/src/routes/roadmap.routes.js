/**
 * Roadmap Routes
 * Handles learning roadmap generation and progress tracking
 */

const express = require('express');
const router = express.Router();

const roadmapController = require('../controllers/roadmap.controller');
const { authenticate } = require('../middleware/auth');

// Public route for shared roadmaps
router.get('/shared/:token', roadmapController.getSharedRoadmap);

// All other routes require authentication
router.use(authenticate);

// Generate new roadmap from analysis
router.post('/generate', roadmapController.generateRoadmap);

// Get user's saved roadmaps
router.get('/saved', roadmapController.getSavedRoadmaps);

// Get all user's roadmaps
router.get('/all', roadmapController.getAllRoadmaps);

// Get user's roadmap statistics
router.get('/stats', roadmapController.getStats);

// Get single roadmap by ID
router.get('/:id', roadmapController.getRoadmap);

// Save roadmap
router.post('/:id/save', roadmapController.saveRoadmap);

// Unsave roadmap
router.delete('/:id/save', roadmapController.unsaveRoadmap);

// Update roadmap progress
router.put('/:id/progress', roadmapController.updateProgress);

// Start roadmap
router.post('/:id/start', roadmapController.startRoadmap);

// Pause roadmap
router.post('/:id/pause', roadmapController.pauseRoadmap);

// Resume roadmap
router.post('/:id/resume', roadmapController.resumeRoadmap);

// Generate share link
router.post('/:id/share', roadmapController.shareRoadmap);

// Delete roadmap
router.delete('/:id', roadmapController.deleteRoadmap);

module.exports = router;
