/**
 * API Service
 * Centralized API calls to backend services
 * Enhanced with comprehensive endpoints and error handling
 */

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance with defaults
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        console.error('Request error:', error)
        return Promise.reject(error)
    }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.error || error.message || 'An error occurred'

        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            // Only redirect if not already on auth pages
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                window.location.href = '/login'
            }
        }

        return Promise.reject({
            message,
            status: error.response?.status,
            details: error.response?.data?.details,
        })
    }
)

// ============================================
// AUTH SERVICE
// ============================================
export const authService = {
    login: async (email, password) => {
        const response = await apiClient.post('/auth/login', { email, password })
        if (response.token) {
            localStorage.setItem('token', response.token)
            localStorage.setItem('user', JSON.stringify(response.user))
        }
        return response
    },

    register: async (userData) => {
        const response = await apiClient.post('/auth/register', userData)
        if (response.token) {
            localStorage.setItem('token', response.token)
            localStorage.setItem('user', JSON.stringify(response.user))
        }
        return response
    },

    logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
    },

    getProfile: () => apiClient.get('/auth/profile'),

    updateProfile: (data) => apiClient.put('/auth/profile', data),

    changePassword: (currentPassword, newPassword) =>
        apiClient.put('/auth/password', { currentPassword, newPassword }),

    forgotPassword: (email) =>
        apiClient.post('/auth/forgot-password', { email }),

    resetPassword: (token, password) =>
        apiClient.post(`/auth/reset-password/${token}`, { password }),

    getCurrentUser: () => {
        const user = localStorage.getItem('user')
        return user ? JSON.parse(user) : null
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token')
    },
}

// ============================================
// ANALYSIS SERVICE
// ============================================
export const analysisService = {
    // Analyze resume with target role
    analyzeResume: async (file, targetRole, onUploadProgress) => {
        const formData = new FormData()
        formData.append('resume', file)
        formData.append('targetRole', targetRole)

        return apiClient.post('/analysis/analyze', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: onUploadProgress,
            timeout: 60000, // 60 seconds for file upload
        })
    },

    // Get single analysis by ID
    getAnalysis: (id) => apiClient.get(`/analysis/${id}`),

    // Get user's analysis history
    getHistory: (params = {}) => {
        const queryString = new URLSearchParams(params).toString()
        return apiClient.get(`/analysis/history${queryString ? `?${queryString}` : ''}`)
    },

    // Get analysis statistics
    getStats: () => apiClient.get('/analysis/stats'),

    // Delete an analysis
    deleteAnalysis: (id) => apiClient.delete(`/analysis/${id}`),

    // Re-analyze with different target role
    reanalyze: (id, targetRole) =>
        apiClient.post(`/analysis/${id}/reanalyze`, { targetRole }),

    // Get available job roles
    getRoles: () => apiClient.get('/analysis/roles'),

    // Compare multiple analyses
    compareAnalyses: (analysisIds) =>
        apiClient.post('/analysis/compare', { analysisIds }),
}

// ============================================
// ROADMAP SERVICE
// ============================================
export const roadmapService = {
    // Generate roadmap from analysis
    generateRoadmap: (analysisId, customizations = {}) =>
        apiClient.post('/roadmap/generate', { analysisId, customizations }),

    // Get single roadmap by ID
    getRoadmap: (id) => apiClient.get(`/roadmap/${id}`),

    // Get user's saved roadmaps
    getSavedRoadmaps: (params = {}) => {
        const queryString = new URLSearchParams(params).toString()
        return apiClient.get(`/roadmap/saved${queryString ? `?${queryString}` : ''}`)
    },

    // Get all user's roadmaps
    getAllRoadmaps: (params = {}) => {
        const queryString = new URLSearchParams(params).toString()
        return apiClient.get(`/roadmap/all${queryString ? `?${queryString}` : ''}`)
    },

    // Get roadmap stats
    getStats: () => apiClient.get('/roadmap/stats'),

    // Save roadmap
    saveRoadmap: (id) => apiClient.post(`/roadmap/${id}/save`),

    // Unsave roadmap
    unsaveRoadmap: (id) => apiClient.delete(`/roadmap/${id}/save`),

    // Update progress
    updateProgress: (id, phaseIndex, milestoneIndex, isCompleted, notes = '') =>
        apiClient.put(`/roadmap/${id}/progress`, {
            phaseIndex,
            milestoneIndex,
            isCompleted,
            notes,
        }),

    // Start roadmap
    startRoadmap: (id) => apiClient.post(`/roadmap/${id}/start`),

    // Pause roadmap
    pauseRoadmap: (id) => apiClient.post(`/roadmap/${id}/pause`),

    // Resume roadmap
    resumeRoadmap: (id) => apiClient.post(`/roadmap/${id}/resume`),

    // Share roadmap
    shareRoadmap: (id, isPublic = false) =>
        apiClient.post(`/roadmap/${id}/share`, { isPublic }),

    // Get shared roadmap
    getSharedRoadmap: (token) => apiClient.get(`/roadmap/shared/${token}`),

    // Delete roadmap
    deleteRoadmap: (id) => apiClient.delete(`/roadmap/${id}`),
}

// ============================================
// USER SERVICE
// ============================================
export const userService = {
    // Get dashboard data
    getDashboard: () => apiClient.get('/users/dashboard'),

    // Export user data
    exportData: () => apiClient.get('/users/export'),

    // Update preferences
    updatePreferences: (preferences) =>
        apiClient.put('/users/preferences', { preferences }),
}

export default apiClient
