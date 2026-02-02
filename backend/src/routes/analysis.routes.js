/**
 * Analysis Routes
 * Handles resume upload and skill gap analysis
 */

const express = require('express');
const router = express.Router();

const analysisController = require('../controllers/analysis.controller');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validateAnalysis } = require('../middleware/validators');

// All routes require authentication
router.use(authenticate);

// Get available job roles (no auth required for this)
router.get('/roles', analysisController.getRoles);

// Analyze resume
router.post(
    '/analyze',
    upload.single('resume'),
    validateAnalysis,
    analysisController.analyzeResume
);

// Get user's analysis history
router.get('/history', analysisController.getHistory);

// Get user's analysis statistics
router.get('/stats', analysisController.getStats);

// Compare multiple analyses
router.post('/compare', analysisController.compareAnalyses);

// Get single analysis by ID
router.get('/:id', analysisController.getAnalysis);

// Re-analyze with different target role
router.post('/:id/reanalyze', analysisController.reanalyze);

// Delete analysis
router.delete('/:id', analysisController.deleteAnalysis);

module.exports = router;
