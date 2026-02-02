/**
 * Application constants
 */

// API Endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        PROFILE: '/auth/profile',
    },
    ANALYSIS: {
        ANALYZE: '/analysis/analyze',
        HISTORY: '/analysis/history',
        GET: (id) => `/analysis/${id}`,
    },
    ROADMAP: {
        GENERATE: '/roadmap/generate',
        GET: (id) => `/roadmap/${id}`,
        SAVE: (id) => `/roadmap/${id}/save`,
        SAVED: '/roadmap/saved',
    },
}

// Job Roles
export const JOB_ROLES = [
    { id: 'frontend-developer', label: 'Frontend Developer' },
    { id: 'backend-developer', label: 'Backend Developer' },
    { id: 'fullstack-developer', label: 'Full Stack Developer' },
    { id: 'data-scientist', label: 'Data Scientist' },
    { id: 'data-analyst', label: 'Data Analyst' },
    { id: 'devops-engineer', label: 'DevOps Engineer' },
    { id: 'ml-engineer', label: 'Machine Learning Engineer' },
    { id: 'cloud-architect', label: 'Cloud Architect' },
    { id: 'product-manager', label: 'Product Manager' },
    { id: 'ui-ux-designer', label: 'UI/UX Designer' },
]

// Supported file types for resume upload
export const SUPPORTED_FILE_TYPES = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt'],
}

// Max file size (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024

// Skill levels
export const SKILL_LEVELS = {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
    EXPERT: 'expert',
}
