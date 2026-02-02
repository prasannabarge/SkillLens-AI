/**
 * useAnalysis Hook
 * Manages analysis state and operations
 */

import { useState, useCallback } from 'react'
import { analysisService } from '../services/api'

export function useAnalysis() {
    const [analysis, setAnalysis] = useState(null)
    const [history, setHistory] = useState([])
    const [stats, setStats] = useState(null)
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState(null)

    // Analyze resume
    const analyzeResume = useCallback(async (file, targetRole) => {
        setError(null)
        setUploading(true)
        setUploadProgress(0)

        try {
            const response = await analysisService.analyzeResume(
                file,
                targetRole,
                (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    setUploadProgress(progress)
                }
            )
            setAnalysis(response.analysis)
            setUploading(false)
            return response
        } catch (err) {
            setError(err.message || 'Analysis failed')
            setUploading(false)
            throw err
        }
    }, [])

    // Get single analysis
    const getAnalysis = useCallback(async (id) => {
        setLoading(true)
        setError(null)
        try {
            const response = await analysisService.getAnalysis(id)
            setAnalysis(response.analysis)
            return response.analysis
        } catch (err) {
            setError(err.message || 'Failed to load analysis')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Get analysis history
    const getHistory = useCallback(async (params = {}) => {
        setLoading(true)
        setError(null)
        try {
            const response = await analysisService.getHistory(params)
            setHistory(response.analyses || [])
            return response
        } catch (err) {
            setError(err.message || 'Failed to load history')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Get stats
    const getStats = useCallback(async () => {
        try {
            const response = await analysisService.getStats()
            setStats(response.stats)
            return response.stats
        } catch (err) {
            console.error('Failed to load stats:', err)
            throw err
        }
    }, [])

    // Get available roles
    const getRoles = useCallback(async () => {
        try {
            const response = await analysisService.getRoles()
            const rolesList = response.roles || response || []
            setRoles(rolesList)
            return rolesList
        } catch (err) {
            console.error('Failed to load roles:', err)
            // Return default roles as fallback
            const defaultRoles = [
                { id: 'frontend-developer', label: 'Frontend Developer' },
                { id: 'backend-developer', label: 'Backend Developer' },
                { id: 'fullstack-developer', label: 'Full Stack Developer' },
                { id: 'data-scientist', label: 'Data Scientist' },
                { id: 'devops-engineer', label: 'DevOps Engineer' },
            ]
            setRoles(defaultRoles)
            return defaultRoles
        }
    }, [])

    // Delete analysis
    const deleteAnalysis = useCallback(async (id) => {
        try {
            await analysisService.deleteAnalysis(id)
            setHistory(prev => prev.filter(a => a._id !== id))
            if (analysis?._id === id) {
                setAnalysis(null)
            }
        } catch (err) {
            setError(err.message || 'Failed to delete analysis')
            throw err
        }
    }, [analysis])

    // Clear current analysis
    const clearAnalysis = useCallback(() => {
        setAnalysis(null)
        setError(null)
    }, [])

    return {
        // State
        analysis,
        history,
        stats,
        roles,
        loading,
        uploading,
        uploadProgress,
        error,

        // Actions
        analyzeResume,
        getAnalysis,
        getHistory,
        getStats,
        getRoles,
        deleteAnalysis,
        clearAnalysis,
        clearError: () => setError(null),
    }
}

export default useAnalysis
