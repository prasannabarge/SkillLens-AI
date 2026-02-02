/**
 * useRoadmap Hook
 * Manages roadmap state and operations
 */

import { useState, useCallback } from 'react'
import { roadmapService } from '../services/api'

export function useRoadmap() {
    const [roadmap, setRoadmap] = useState(null)
    const [roadmaps, setRoadmaps] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [error, setError] = useState(null)

    // Generate roadmap from analysis
    const generateRoadmap = useCallback(async (analysisId, customizations = {}) => {
        setGenerating(true)
        setError(null)
        try {
            const response = await roadmapService.generateRoadmap(analysisId, customizations)
            setRoadmap(response.roadmap)
            return response
        } catch (err) {
            setError(err.message || 'Failed to generate roadmap')
            throw err
        } finally {
            setGenerating(false)
        }
    }, [])

    // Get single roadmap
    const getRoadmap = useCallback(async (id) => {
        setLoading(true)
        setError(null)
        try {
            const response = await roadmapService.getRoadmap(id)
            setRoadmap(response.roadmap)
            return response.roadmap
        } catch (err) {
            setError(err.message || 'Failed to load roadmap')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Get saved roadmaps
    const getSavedRoadmaps = useCallback(async (params = {}) => {
        setLoading(true)
        try {
            const response = await roadmapService.getSavedRoadmaps(params)
            setRoadmaps(response.roadmaps || [])
            return response
        } catch (err) {
            setError(err.message || 'Failed to load roadmaps')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Get all roadmaps
    const getAllRoadmaps = useCallback(async (params = {}) => {
        setLoading(true)
        try {
            const response = await roadmapService.getAllRoadmaps(params)
            setRoadmaps(response.roadmaps || [])
            return response
        } catch (err) {
            setError(err.message || 'Failed to load roadmaps')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Get stats
    const getStats = useCallback(async () => {
        try {
            const response = await roadmapService.getStats()
            setStats(response.stats)
            return response.stats
        } catch (err) {
            console.error('Failed to load stats:', err)
        }
    }, [])

    // Update milestone progress
    const updateProgress = useCallback(async (id, phaseIndex, milestoneIndex, isCompleted, notes = '') => {
        try {
            const response = await roadmapService.updateProgress(
                id,
                phaseIndex,
                milestoneIndex,
                isCompleted,
                notes
            )
            setRoadmap(response.roadmap)
            return response
        } catch (err) {
            setError(err.message || 'Failed to update progress')
            throw err
        }
    }, [])

    // Start roadmap
    const startRoadmap = useCallback(async (id) => {
        try {
            const response = await roadmapService.startRoadmap(id)
            setRoadmap(response.roadmap)
            return response
        } catch (err) {
            setError(err.message || 'Failed to start roadmap')
            throw err
        }
    }, [])

    // Pause roadmap
    const pauseRoadmap = useCallback(async (id) => {
        try {
            const response = await roadmapService.pauseRoadmap(id)
            setRoadmap(response.roadmap)
            return response
        } catch (err) {
            setError(err.message || 'Failed to pause roadmap')
            throw err
        }
    }, [])

    // Resume roadmap
    const resumeRoadmap = useCallback(async (id) => {
        try {
            const response = await roadmapService.resumeRoadmap(id)
            setRoadmap(response.roadmap)
            return response
        } catch (err) {
            setError(err.message || 'Failed to resume roadmap')
            throw err
        }
    }, [])

    // Save roadmap
    const saveRoadmap = useCallback(async (id) => {
        try {
            const response = await roadmapService.saveRoadmap(id)
            if (roadmap && roadmap._id === id) {
                setRoadmap({ ...roadmap, isSaved: true })
            }
            return response
        } catch (err) {
            setError(err.message || 'Failed to save roadmap')
            throw err
        }
    }, [roadmap])

    // Delete roadmap
    const deleteRoadmap = useCallback(async (id) => {
        try {
            await roadmapService.deleteRoadmap(id)
            setRoadmaps(prev => prev.filter(r => r._id !== id))
            if (roadmap?._id === id) {
                setRoadmap(null)
            }
        } catch (err) {
            setError(err.message || 'Failed to delete roadmap')
            throw err
        }
    }, [roadmap])

    // Clear current roadmap
    const clearRoadmap = useCallback(() => {
        setRoadmap(null)
        setError(null)
    }, [])

    return {
        // State
        roadmap,
        roadmaps,
        stats,
        loading,
        generating,
        error,

        // Actions
        generateRoadmap,
        getRoadmap,
        getSavedRoadmaps,
        getAllRoadmaps,
        getStats,
        updateProgress,
        startRoadmap,
        pauseRoadmap,
        resumeRoadmap,
        saveRoadmap,
        deleteRoadmap,
        clearRoadmap,
        clearError: () => setError(null),
    }
}

export default useRoadmap
