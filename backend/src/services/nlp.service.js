/**
 * NLP Service Client
 * Communicates with the Python FastAPI NLP microservice
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Create axios instance for NLP service
const nlpClient = axios.create({
    baseURL: config.nlpService.baseUrl,
    timeout: config.nlpService.timeout,
    headers: {
        'Accept': 'application/json',
    },
});

// Request interceptor for logging
nlpClient.interceptors.request.use(
    (request) => {
        console.log(`📡 NLP Request: ${request.method?.toUpperCase()} ${request.url}`);
        return request;
    },
    (error) => {
        console.error('❌ NLP Request Error:', error.message);
        return Promise.reject(error);
    }
);

// Response interceptor for logging
nlpClient.interceptors.response.use(
    (response) => {
        console.log(`✅ NLP Response: ${response.status} from ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('❌ NLP Response Error:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', JSON.stringify(error.response.data));
        }
        return Promise.reject(error);
    }
);

/**
 * Check if NLP service is healthy
 * @returns {Promise<boolean>}
 */
exports.healthCheck = async () => {
    try {
        const response = await nlpClient.get(config.nlpService.endpoints.health);
        return response.data.status === 'healthy' || response.status === 200;
    } catch (error) {
        console.error('NLP Service health check failed:', error.message);
        return false;
    }
};

/**
 * Analyze resume file
 * @param {string} filePath - Path to the resume file
 * @param {string} targetRole - Target job role
 * @returns {Promise<Object>} - Analysis results
 */
exports.analyzeResume = async (filePath, targetRole) => {
    try {
        // Create form data for file upload
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));
        formData.append('target_role', targetRole);

        const response = await nlpClient.post(
            config.nlpService.endpoints.analyze,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                },
            }
        );

        return response.data;
    } catch (error) {
        // Handle NLP service unavailability gracefully
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            console.warn('⚠️ NLP Service unavailable, using fallback analysis');
            return generateFallbackAnalysis(filePath, targetRole);
        }

        throw new Error(`NLP analysis failed: ${error.message}`);
    }
};

/**
 * Match skills against a target role
 * @param {Array<string>} skills - List of skill names
 * @param {string} targetRole - Target job role
 * @returns {Promise<Object>} - Matching results
 */
exports.matchSkills = async (skills, targetRole) => {
    try {
        const response = await nlpClient.post(
            config.nlpService.endpoints.match,
            {
                skills,
                target_role: targetRole,
            }
        );

        return response.data;
    } catch (error) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            console.warn('⚠️ NLP Service unavailable, using fallback matching');
            return generateFallbackMatching(skills, targetRole);
        }

        throw new Error(`Skill matching failed: ${error.message}`);
    }
};

/**
 * Get skills for a specific job role
 * @param {string} roleId - Role identifier
 * @returns {Promise<Object>} - Role skills
 */
exports.getRoleSkills = async (roleId) => {
    try {
        const response = await nlpClient.get(`${config.nlpService.endpoints.skills}/${roleId}`);
        return response.data;
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            return getLocalRoleSkills(roleId);
        }
        throw new Error(`Failed to get role skills: ${error.message}`);
    }
};

/**
 * Get all available job roles
 * @returns {Promise<Array>} - List of job roles
 */
exports.getJobRoles = async () => {
    try {
        const response = await nlpClient.get(config.nlpService.endpoints.roles || '/api/roles');
        return response.data;
    } catch (error) {
        console.warn('⚠️ Using local job roles data');
        return getLocalJobRoles();
    }
};

// ============================================
// FALLBACK FUNCTIONS (when NLP service is unavailable)
// ============================================

/**
 * Local job roles database
 */
const JOB_ROLES = {
    'frontend-developer': {
        id: 'frontend-developer',
        label: 'Frontend Developer',
        skills: [
            { name: 'JavaScript', level: 'advanced' },
            { name: 'React', level: 'advanced' },
            { name: 'TypeScript', level: 'intermediate' },
            { name: 'CSS', level: 'advanced' },
            { name: 'HTML', level: 'advanced' },
            { name: 'Git', level: 'intermediate' },
            { name: 'Webpack', level: 'intermediate' },
            { name: 'REST APIs', level: 'intermediate' },
        ],
    },
    'backend-developer': {
        id: 'backend-developer',
        label: 'Backend Developer',
        skills: [
            { name: 'Node.js', level: 'advanced' },
            { name: 'Python', level: 'intermediate' },
            { name: 'SQL', level: 'advanced' },
            { name: 'MongoDB', level: 'intermediate' },
            { name: 'REST APIs', level: 'advanced' },
            { name: 'Docker', level: 'intermediate' },
            { name: 'Git', level: 'intermediate' },
        ],
    },
    'fullstack-developer': {
        id: 'fullstack-developer',
        label: 'Full Stack Developer',
        skills: [
            { name: 'JavaScript', level: 'advanced' },
            { name: 'React', level: 'advanced' },
            { name: 'Node.js', level: 'advanced' },
            { name: 'SQL', level: 'intermediate' },
            { name: 'MongoDB', level: 'intermediate' },
            { name: 'Docker', level: 'intermediate' },
            { name: 'Git', level: 'advanced' },
        ],
    },
    'data-scientist': {
        id: 'data-scientist',
        label: 'Data Scientist',
        skills: [
            { name: 'Python', level: 'advanced' },
            { name: 'Machine Learning', level: 'advanced' },
            { name: 'SQL', level: 'intermediate' },
            { name: 'Statistics', level: 'advanced' },
            { name: 'TensorFlow', level: 'intermediate' },
            { name: 'Pandas', level: 'advanced' },
            { name: 'Data Visualization', level: 'intermediate' },
        ],
    },
    'devops-engineer': {
        id: 'devops-engineer',
        label: 'DevOps Engineer',
        skills: [
            { name: 'Docker', level: 'advanced' },
            { name: 'Kubernetes', level: 'advanced' },
            { name: 'AWS', level: 'advanced' },
            { name: 'CI/CD', level: 'advanced' },
            { name: 'Linux', level: 'advanced' },
            { name: 'Python', level: 'intermediate' },
            { name: 'Terraform', level: 'intermediate' },
        ],
    },
};

/**
 * Extract skills from text using pattern matching
 */
const SKILL_PATTERNS = [
    /\b(javascript|js)\b/gi,
    /\b(typescript|ts)\b/gi,
    /\b(python)\b/gi,
    /\b(java)\b/gi,
    /\b(react|react\.js|reactjs)\b/gi,
    /\b(node|node\.js|nodejs)\b/gi,
    /\b(angular)\b/gi,
    /\b(vue|vue\.js|vuejs)\b/gi,
    /\b(html5?)\b/gi,
    /\b(css3?|scss|sass)\b/gi,
    /\b(sql|mysql|postgresql|postgres)\b/gi,
    /\b(mongodb|nosql)\b/gi,
    /\b(docker)\b/gi,
    /\b(kubernetes|k8s)\b/gi,
    /\b(aws|amazon web services)\b/gi,
    /\b(azure)\b/gi,
    /\b(gcp|google cloud)\b/gi,
    /\b(git|github|gitlab)\b/gi,
    /\b(ci\/cd|jenkins|circleci)\b/gi,
    /\b(rest api|restful|graphql)\b/gi,
    /\b(machine learning|ml)\b/gi,
    /\b(tensorflow|pytorch)\b/gi,
    /\b(pandas|numpy)\b/gi,
    /\b(agile|scrum)\b/gi,
];

const SKILL_NAMES = {
    'javascript': 'JavaScript',
    'js': 'JavaScript',
    'typescript': 'TypeScript',
    'ts': 'TypeScript',
    'python': 'Python',
    'java': 'Java',
    'react': 'React',
    'react.js': 'React',
    'reactjs': 'React',
    'node': 'Node.js',
    'node.js': 'Node.js',
    'nodejs': 'Node.js',
    'angular': 'Angular',
    'vue': 'Vue.js',
    'vue.js': 'Vue.js',
    'vuejs': 'Vue.js',
    'html': 'HTML',
    'html5': 'HTML',
    'css': 'CSS',
    'css3': 'CSS',
    'scss': 'CSS/SCSS',
    'sass': 'CSS/SCSS',
    'sql': 'SQL',
    'mysql': 'MySQL',
    'postgresql': 'PostgreSQL',
    'postgres': 'PostgreSQL',
    'mongodb': 'MongoDB',
    'nosql': 'NoSQL',
    'docker': 'Docker',
    'kubernetes': 'Kubernetes',
    'k8s': 'Kubernetes',
    'aws': 'AWS',
    'amazon web services': 'AWS',
    'azure': 'Azure',
    'gcp': 'Google Cloud',
    'google cloud': 'Google Cloud',
    'git': 'Git',
    'github': 'Git',
    'gitlab': 'Git',
    'ci/cd': 'CI/CD',
    'jenkins': 'CI/CD',
    'circleci': 'CI/CD',
    'rest api': 'REST APIs',
    'restful': 'REST APIs',
    'graphql': 'GraphQL',
    'machine learning': 'Machine Learning',
    'ml': 'Machine Learning',
    'tensorflow': 'TensorFlow',
    'pytorch': 'PyTorch',
    'pandas': 'Pandas',
    'numpy': 'NumPy',
    'agile': 'Agile',
    'scrum': 'Scrum',
};

/**
 * Generate fallback analysis when NLP service is unavailable
 */
async function generateFallbackAnalysis(filePath, targetRole) {
    // Read file content (simple text extraction for .txt files)
    let text = '';
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.txt') {
        text = fs.readFileSync(filePath, 'utf-8');
    } else {
        // For PDF/DOCX, we'd need proper parsing - return basic response
        text = 'Unable to parse file without NLP service';
    }

    // Extract skills from text
    const extractedSkills = extractSkillsFromText(text);

    // Get required skills for role
    const roleData = JOB_ROLES[targetRole] || JOB_ROLES['fullstack-developer'];
    const requiredSkills = roleData.skills;

    // Calculate matches and gaps
    const matched = [];
    const gaps = [];

    requiredSkills.forEach(reqSkill => {
        const found = extractedSkills.find(
            s => s.name.toLowerCase() === reqSkill.name.toLowerCase()
        );

        if (found) {
            matched.push({ ...reqSkill, confidence: 0.8 });
        } else {
            gaps.push(reqSkill);
        }
    });

    const matchScore = requiredSkills.length > 0
        ? Math.round((matched.length / requiredSkills.length) * 100)
        : 0;

    return {
        extracted_text: text,
        extracted_skills: extractedSkills,
        required_skills: requiredSkills,
        matched_skills: matched,
        gap_skills: gaps,
        match_score: matchScore,
        recommendations: gaps.slice(0, 5).map(skill => ({
            skill: skill.name,
            priority: 'high',
            reason: `${skill.name} is a key requirement for ${roleData.label}`,
        })),
    };
}

/**
 * Extract skills from text using patterns
 */
function extractSkillsFromText(text) {
    const skills = new Set();

    SKILL_PATTERNS.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
            matches.forEach(match => {
                const normalized = SKILL_NAMES[match.toLowerCase()];
                if (normalized) {
                    skills.add(normalized);
                }
            });
        }
    });

    return Array.from(skills).map(name => ({
        name,
        level: 'intermediate',
        confidence: 0.7,
    }));
}

/**
 * Fallback skill matching
 */
function generateFallbackMatching(skills, targetRole) {
    const roleData = JOB_ROLES[targetRole] || JOB_ROLES['fullstack-developer'];
    const requiredSkills = roleData.skills;

    const matched = [];
    const gaps = [];

    requiredSkills.forEach(reqSkill => {
        const found = skills.find(s => s.toLowerCase() === reqSkill.name.toLowerCase());
        if (found) {
            matched.push(reqSkill);
        } else {
            gaps.push(reqSkill);
        }
    });

    const matchScore = requiredSkills.length > 0
        ? Math.round((matched.length / requiredSkills.length) * 100)
        : 0;

    return {
        required_skills: requiredSkills,
        matched_skills: matched,
        gap_skills: gaps,
        match_score: matchScore,
    };
}

/**
 * Get local role skills
 */
function getLocalRoleSkills(roleId) {
    const role = JOB_ROLES[roleId];
    if (!role) {
        throw new Error(`Role ${roleId} not found`);
    }
    return role;
}

/**
 * Get all local job roles
 */
function getLocalJobRoles() {
    return Object.values(JOB_ROLES).map(role => ({
        id: role.id,
        label: role.label,
        skillCount: role.skills.length,
    }));
}
