/**
 * Roadmap Service
 * Generates personalized learning roadmaps based on skill gaps
 */

/**
 * Learning resources database
 * In production, this would be fetched from a database or external API
 */
const LEARNING_RESOURCES = {
    'JavaScript': [
        { title: 'JavaScript: The Complete Guide', type: 'course', provider: 'Udemy', url: 'https://udemy.com', duration: '52 hours', isFree: false },
        { title: 'JavaScript.info', type: 'tutorial', provider: 'javascript.info', url: 'https://javascript.info', isFree: true },
        { title: 'freeCodeCamp JavaScript', type: 'course', provider: 'freeCodeCamp', url: 'https://freecodecamp.org', isFree: true },
    ],
    'TypeScript': [
        { title: 'TypeScript Handbook', type: 'documentation', provider: 'Microsoft', url: 'https://typescriptlang.org/docs', isFree: true },
        { title: 'Understanding TypeScript', type: 'course', provider: 'Udemy', url: 'https://udemy.com', duration: '15 hours', isFree: false },
    ],
    'React': [
        { title: 'React Official Tutorial', type: 'tutorial', provider: 'React', url: 'https://react.dev/learn', isFree: true },
        { title: 'Epic React', type: 'course', provider: 'Kent C. Dodds', url: 'https://epicreact.dev', isFree: false },
        { title: 'React - The Complete Guide', type: 'course', provider: 'Udemy', url: 'https://udemy.com', duration: '48 hours', isFree: false },
    ],
    'Node.js': [
        { title: 'Node.js Documentation', type: 'documentation', provider: 'Node.js', url: 'https://nodejs.org/docs', isFree: true },
        { title: 'The Complete Node.js Developer', type: 'course', provider: 'Udemy', url: 'https://udemy.com', duration: '35 hours', isFree: false },
    ],
    'Python': [
        { title: 'Python for Everybody', type: 'course', provider: 'Coursera', url: 'https://coursera.org', isFree: true },
        { title: 'Automate the Boring Stuff', type: 'book', provider: 'Al Sweigart', url: 'https://automatetheboringstuff.com', isFree: true },
    ],
    'SQL': [
        { title: 'SQL Tutorial', type: 'tutorial', provider: 'W3Schools', url: 'https://w3schools.com/sql', isFree: true },
        { title: 'Complete SQL Bootcamp', type: 'course', provider: 'Udemy', url: 'https://udemy.com', duration: '9 hours', isFree: false },
    ],
    'MongoDB': [
        { title: 'MongoDB University', type: 'course', provider: 'MongoDB', url: 'https://university.mongodb.com', isFree: true },
        { title: 'MongoDB Documentation', type: 'documentation', provider: 'MongoDB', url: 'https://docs.mongodb.com', isFree: true },
    ],
    'Docker': [
        { title: 'Docker Getting Started', type: 'tutorial', provider: 'Docker', url: 'https://docs.docker.com/get-started', isFree: true },
        { title: 'Docker Mastery', type: 'course', provider: 'Udemy', url: 'https://udemy.com', duration: '19 hours', isFree: false },
    ],
    'Kubernetes': [
        { title: 'Kubernetes Documentation', type: 'documentation', provider: 'Kubernetes', url: 'https://kubernetes.io/docs', isFree: true },
        { title: 'CKA Certification Course', type: 'course', provider: 'KodeKloud', url: 'https://kodekloud.com', isFree: false },
    ],
    'AWS': [
        { title: 'AWS Cloud Practitioner', type: 'certification', provider: 'AWS', url: 'https://aws.amazon.com/training', isFree: false },
        { title: 'AWS Free Tier Tutorials', type: 'tutorial', provider: 'AWS', url: 'https://aws.amazon.com/getting-started', isFree: true },
    ],
    'Git': [
        { title: 'Pro Git Book', type: 'book', provider: 'Git', url: 'https://git-scm.com/book', isFree: true },
        { title: 'Git & GitHub Crash Course', type: 'video', provider: 'Traversy Media', url: 'https://youtube.com', duration: '1 hour', isFree: true },
    ],
    'Machine Learning': [
        { title: 'Machine Learning by Andrew Ng', type: 'course', provider: 'Coursera', url: 'https://coursera.org', isFree: true },
        { title: 'Hands-On Machine Learning', type: 'book', provider: "O'Reilly", isFree: false },
    ],
    'TensorFlow': [
        { title: 'TensorFlow Tutorials', type: 'tutorial', provider: 'TensorFlow', url: 'https://tensorflow.org/tutorials', isFree: true },
        { title: 'DeepLearning.AI TensorFlow', type: 'course', provider: 'Coursera', url: 'https://coursera.org', isFree: false },
    ],
    'REST APIs': [
        { title: 'REST API Design Best Practices', type: 'article', provider: 'freeCodeCamp', url: 'https://freecodecamp.org', isFree: true },
        { title: 'Building REST APIs', type: 'project', description: 'Build a complete REST API with authentication', isFree: true },
    ],
    'CI/CD': [
        { title: 'GitHub Actions Docs', type: 'documentation', provider: 'GitHub', url: 'https://docs.github.com/actions', isFree: true },
        { title: 'Jenkins Tutorial', type: 'tutorial', provider: 'Jenkins', url: 'https://jenkins.io/doc', isFree: true },
    ],
};

/**
 * YouTube Tutorial Database
 * Popular tutorials for each skill with video IDs for thumbnails
 */
const YOUTUBE_TUTORIALS = {
    'JavaScript': [
        {
            title: 'JavaScript Full Course for Beginners',
            channel: 'freeCodeCamp',
            videoId: 'PkZNo7MFNFg',
            duration: '3:26:42',
            views: '15M+',
        },
        {
            title: 'JavaScript Tutorial for Beginners',
            channel: 'Programming with Mosh',
            videoId: 'W6NZfCO5SIk',
            duration: '48:16',
            views: '14M+',
        },
        {
            title: 'Learn JavaScript - Full Course',
            channel: 'Bro Code',
            videoId: '8dWL3wF_OMw',
            duration: '8:00:00',
            views: '3M+',
        },
    ],
    'TypeScript': [
        {
            title: 'TypeScript Tutorial for Beginners',
            channel: 'Programming with Mosh',
            videoId: 'd56mG7DezGs',
            duration: '1:04:28',
            views: '3M+',
        },
        {
            title: 'TypeScript Full Course',
            channel: 'freeCodeCamp',
            videoId: '30LWjhZzg50',
            duration: '1:34:00',
            views: '1M+',
        },
    ],
    'React': [
        {
            title: 'React JS Full Course 2024',
            channel: 'freeCodeCamp',
            videoId: 'bMknfKXIFA8',
            duration: '11:55:27',
            views: '8M+',
        },
        {
            title: 'React Tutorial for Beginners',
            channel: 'Programming with Mosh',
            videoId: 'SqcY0GlETPk',
            duration: '1:20:43',
            views: '5M+',
        },
        {
            title: 'Learn React in 30 Minutes',
            channel: 'Web Dev Simplified',
            videoId: 'hQAHSlTtcmY',
            duration: '30:25',
            views: '2M+',
        },
    ],
    'Node.js': [
        {
            title: 'Node.js Tutorial for Beginners',
            channel: 'Programming with Mosh',
            videoId: 'TlB_eWDSMt4',
            duration: '1:18:16',
            views: '7M+',
        },
        {
            title: 'Node.js Full Course',
            channel: 'freeCodeCamp',
            videoId: 'Oe421EPjeBE',
            duration: '8:16:48',
            views: '4M+',
        },
    ],
    'Python': [
        {
            title: 'Python Full Course for Beginners',
            channel: 'freeCodeCamp',
            videoId: 'rfscVS0vtbw',
            duration: '4:26:51',
            views: '42M+',
        },
        {
            title: 'Python Tutorial - Python for Beginners',
            channel: 'Programming with Mosh',
            videoId: '_uQrJ0TkZlc',
            duration: '6:14:07',
            views: '28M+',
        },
        {
            title: 'Python for Everybody - Full Course',
            channel: 'freeCodeCamp',
            videoId: '8DvywoWv6fI',
            duration: '13:40:09',
            views: '5M+',
        },
    ],
    'SQL': [
        {
            title: 'SQL Tutorial - Full Database Course',
            channel: 'freeCodeCamp',
            videoId: 'HXV3zeQKqGY',
            duration: '4:20:37',
            views: '13M+',
        },
        {
            title: 'MySQL Tutorial for Beginners',
            channel: 'Programming with Mosh',
            videoId: '7S_tz1z_5bA',
            duration: '3:10:20',
            views: '9M+',
        },
    ],
    'MongoDB': [
        {
            title: 'MongoDB Crash Course',
            channel: 'Traversy Media',
            videoId: '-56x56UppqQ',
            duration: '36:43',
            views: '1M+',
        },
        {
            title: 'MongoDB Full Tutorial',
            channel: 'freeCodeCamp',
            videoId: 'c2M-rlkkT5o',
            duration: '1:30:25',
            views: '500K+',
        },
    ],
    'Docker': [
        {
            title: 'Docker Tutorial for Beginners',
            channel: 'TechWorld with Nana',
            videoId: '3c-iBn73dDE',
            duration: '2:46:14',
            views: '5M+',
        },
        {
            title: 'Docker Crash Course',
            channel: 'Traversy Media',
            videoId: 'Kyx2PsuwomE',
            duration: '1:00:57',
            views: '1M+',
        },
    ],
    'Kubernetes': [
        {
            title: 'Kubernetes Tutorial for Beginners',
            channel: 'TechWorld with Nana',
            videoId: 'X48VuDVv0do',
            duration: '3:36:52',
            views: '6M+',
        },
        {
            title: 'Kubernetes Crash Course',
            channel: 'Traversy Media',
            videoId: 's_o8dwzRlu4',
            duration: '1:06:23',
            views: '800K+',
        },
    ],
    'AWS': [
        {
            title: 'AWS Certified Cloud Practitioner',
            channel: 'freeCodeCamp',
            videoId: 'SOTamWNgDKc',
            duration: '13:15:19',
            views: '5M+',
        },
        {
            title: 'AWS Tutorial For Beginners',
            channel: 'Simplilearn',
            videoId: 'k1RI5locZE4',
            duration: '3:48:52',
            views: '2M+',
        },
    ],
    'Git': [
        {
            title: 'Git and GitHub for Beginners',
            channel: 'freeCodeCamp',
            videoId: 'RGOj5yH7evk',
            duration: '1:08:29',
            views: '4M+',
        },
        {
            title: 'Git Tutorial for Beginners',
            channel: 'Programming with Mosh',
            videoId: '8JJ101D3knE',
            duration: '1:09:15',
            views: '3M+',
        },
    ],
    'Machine Learning': [
        {
            title: 'Machine Learning Course for Beginners',
            channel: 'freeCodeCamp',
            videoId: 'NWONeJKn6kc',
            duration: '9:52:19',
            views: '2M+',
        },
        {
            title: 'Machine Learning Full Course',
            channel: 'Edureka',
            videoId: 'GwIo3gDZCVQ',
            duration: '11:39:32',
            views: '3M+',
        },
    ],
    'TensorFlow': [
        {
            title: 'TensorFlow 2.0 Complete Course',
            channel: 'freeCodeCamp',
            videoId: 'tPYj3fFJGjk',
            duration: '6:52:08',
            views: '4M+',
        },
    ],
    'REST APIs': [
        {
            title: 'REST API Tutorial - Build a REST API',
            channel: 'freeCodeCamp',
            videoId: '-MTSQjw5DrM',
            duration: '3:16:56',
            views: '1M+',
        },
        {
            title: 'Building REST APIs with Node.js',
            channel: 'Traversy Media',
            videoId: 'pKd0Rpw7O48',
            duration: '1:38:07',
            views: '2M+',
        },
    ],
    'CI/CD': [
        {
            title: 'GitHub Actions Tutorial',
            channel: 'TechWorld with Nana',
            videoId: 'R8_veQiYBjI',
            duration: '32:30',
            views: '500K+',
        },
        {
            title: 'CI/CD Tutorial for Beginners',
            channel: 'TechWorld with Nana',
            videoId: 'scEDHsr3APg',
            duration: '31:21',
            views: '300K+',
        },
    ],
    'CSS': [
        {
            title: 'CSS Full Course for Beginners',
            channel: 'freeCodeCamp',
            videoId: 'OXGznpKZ_sA',
            duration: '11:08:00',
            views: '3M+',
        },
        {
            title: 'CSS Tutorial - Zero to Hero',
            channel: 'freeCodeCamp',
            videoId: '1Rs2ND1ryYc',
            duration: '6:18:37',
            views: '5M+',
        },
    ],
    'HTML': [
        {
            title: 'HTML Full Course for Beginners',
            channel: 'freeCodeCamp',
            videoId: 'kUMe1FH4CHE',
            duration: '4:07:19',
            views: '6M+',
        },
        {
            title: 'HTML Tutorial for Beginners',
            channel: 'Programming with Mosh',
            videoId: 'qz0aGYrrlhU',
            duration: '1:09:33',
            views: '8M+',
        },
    ],
};

/**
 * Phase templates based on skill count and difficulty
 */
const PHASE_TEMPLATES = {
    foundation: {
        name: 'Foundation',
        description: 'Build a strong foundation with essential skills and concepts',
        color: '#10B981', // Green
        icon: '🎯',
    },
    intermediate: {
        name: 'Core Skills',
        description: 'Develop core competencies required for the role',
        color: '#3B82F6', // Blue
        icon: '📚',
    },
    advanced: {
        name: 'Advanced Topics',
        description: 'Master advanced concepts and specialized skills',
        color: '#8B5CF6', // Purple
        icon: '🚀',
    },
    practical: {
        name: 'Practical Application',
        description: 'Apply your skills through real-world projects',
        color: '#F59E0B', // Amber
        icon: '💻',
    },
    specialization: {
        name: 'Specialization',
        description: 'Deepen expertise in specific areas',
        color: '#EC4899', // Pink
        icon: '⭐',
    },
};

/**
 * Generate a personalized learning roadmap
 * @param {Object} options - Roadmap generation options
 * @param {Array<string>} options.gapSkills - Skills that need to be learned
 * @param {string} options.targetRole - Target job role
 * @param {number} options.matchScore - Current match score (0-100)
 * @param {Object} options.customizations - User customizations
 * @returns {Object} - Generated roadmap data
 */
exports.generateRoadmap = async (options) => {
    const { gapSkills, targetRole, matchScore, customizations = {} } = options;
    const {
        weeklyHours = 10,
        preferredResourceTypes = ['course', 'tutorial', 'documentation'],
    } = customizations;

    // Categorize skills by difficulty/priority
    const { beginner, intermediate, advanced } = categorizeSkills(gapSkills);

    // Generate phases
    const phases = [];
    let order = 1;

    // Phase 1: Foundation (beginner skills)
    if (beginner.length > 0) {
        phases.push(createPhase(
            PHASE_TEMPLATES.foundation,
            beginner,
            order++,
            preferredResourceTypes
        ));
    }

    // Phase 2: Core Skills (intermediate skills)
    if (intermediate.length > 0) {
        phases.push(createPhase(
            PHASE_TEMPLATES.intermediate,
            intermediate,
            order++,
            preferredResourceTypes
        ));
    }

    // Phase 3: Advanced Topics
    if (advanced.length > 0) {
        phases.push(createPhase(
            PHASE_TEMPLATES.advanced,
            advanced,
            order++,
            preferredResourceTypes
        ));
    }

    // Phase 4: Practical Application (always include)
    phases.push(createProjectPhase(gapSkills, targetRole, order++));

    // Calculate total time
    const totalWeeks = phases.reduce((total, phase) => {
        const weeks = parseInt(phase.estimatedDuration) || 2;
        return total + weeks;
    }, 0);

    const totalEstimatedTime = formatDuration(totalWeeks);

    return {
        phases,
        totalEstimatedTime,
        weeklyHours,
        skillCount: gapSkills.length,
        phaseCount: phases.length,
    };
};

/**
 * Categorize skills by difficulty level
 */
function categorizeSkills(skills) {
    const beginner = [];
    const intermediate = [];
    const advanced = [];

    // Skill difficulty mapping
    const difficultyMap = {
        'HTML': 'beginner',
        'CSS': 'beginner',
        'Git': 'beginner',
        'JavaScript': 'intermediate',
        'TypeScript': 'intermediate',
        'Python': 'intermediate',
        'SQL': 'intermediate',
        'React': 'intermediate',
        'Node.js': 'intermediate',
        'MongoDB': 'intermediate',
        'REST APIs': 'intermediate',
        'Docker': 'advanced',
        'Kubernetes': 'advanced',
        'AWS': 'advanced',
        'Machine Learning': 'advanced',
        'TensorFlow': 'advanced',
        'CI/CD': 'advanced',
    };

    skills.forEach(skill => {
        const difficulty = difficultyMap[skill] || 'intermediate';

        switch (difficulty) {
            case 'beginner':
                beginner.push(skill);
                break;
            case 'advanced':
                advanced.push(skill);
                break;
            default:
                intermediate.push(skill);
        }
    });

    return { beginner, intermediate, advanced };
}

/**
 * Create a learning phase
 */
function createPhase(template, skills, order, preferredResourceTypes) {
    const milestones = skills.map((skill, index) => ({
        title: `Learn ${skill}`,
        description: `Master the fundamentals and best practices of ${skill}`,
        skills: [skill],
        resources: getResourcesForSkill(skill, preferredResourceTypes),
        estimatedTime: estimateSkillTime(skill),
        order: index + 1,
        isCompleted: false,
        requiresProject: index === skills.length - 1, // Last milestone requires project
        projectIdea: index === skills.length - 1
            ? generateProjectIdea(skills)
            : null,
    }));

    const totalWeeks = milestones.reduce((sum, m) => {
        const weeks = parseInt(m.estimatedTime) || 1;
        return sum + weeks;
    }, 0);

    return {
        name: template.name,
        description: template.description,
        order,
        milestones,
        estimatedDuration: `${totalWeeks} weeks`,
        color: template.color,
        icon: template.icon,
        isCompleted: false,
    };
}

/**
 * Create project-based phase
 */
function createProjectPhase(skills, targetRole, order) {
    const projectType = getProjectTypeForRole(targetRole);

    return {
        name: PHASE_TEMPLATES.practical.name,
        description: PHASE_TEMPLATES.practical.description,
        order,
        milestones: [
            {
                title: 'Set Up Development Environment',
                description: 'Configure your local development environment with all necessary tools',
                skills: ['Git', 'Development Environment'],
                resources: [
                    { title: 'VS Code Setup Guide', type: 'tutorial', url: 'https://code.visualstudio.com/docs/setup', isFree: true },
                ],
                estimatedTime: '3 days',
                order: 1,
                isCompleted: false,
            },
            {
                title: `Build ${projectType.name}`,
                description: projectType.description,
                skills: skills.slice(0, 5),
                resources: [],
                estimatedTime: '2 weeks',
                order: 2,
                isCompleted: false,
                requiresProject: true,
                projectIdea: projectType.idea,
            },
            {
                title: 'Portfolio & Documentation',
                description: 'Document your project and add it to your portfolio',
                skills: ['Technical Writing', 'Portfolio'],
                resources: [
                    { title: 'How to Write a Great README', type: 'article', url: 'https://github.com/matiassingers/awesome-readme', isFree: true },
                ],
                estimatedTime: '3 days',
                order: 3,
                isCompleted: false,
            },
        ],
        estimatedDuration: '3 weeks',
        color: PHASE_TEMPLATES.practical.color,
        icon: PHASE_TEMPLATES.practical.icon,
        isCompleted: false,
    };
}

/**
 * Get resources for a specific skill (including YouTube tutorials)
 * Returns a flat array with both documentation and YouTube video resources
 */
function getResourcesForSkill(skill, preferredTypes) {
    const resources = LEARNING_RESOURCES[skill] || [];

    // Filter by preferred types and limit documentation resources
    const documentationResources = resources
        .filter(r => preferredTypes.length === 0 || preferredTypes.includes(r.type))
        .slice(0, 2)
        .map(r => ({
            title: r.title,
            type: r.type || 'tutorial',
            provider: r.provider,
            url: r.url || '#',
            duration: r.duration,
            isFree: r.isFree !== undefined ? r.isFree : true,
            difficulty: 'beginner',
            rating: 4.5,
        }));

    // Get YouTube tutorials and format them with required fields
    const youtubeResources = getYoutubeTutorialsForSkill(skill);

    // Combine both into a single flat array
    return [...documentationResources, ...youtubeResources];
}

/**
 * Get YouTube tutorials for a specific skill
 * Returns array with required fields (title, type) for Roadmap model
 */
function getYoutubeTutorialsForSkill(skill) {
    const tutorials = YOUTUBE_TUTORIALS[skill] || [];

    return tutorials.slice(0, 2).map(video => ({
        title: video.title,
        type: 'youtube',
        provider: video.channel,
        url: `https://www.youtube.com/watch?v=${video.videoId}`,
        thumbnail: `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`,
        thumbnailHQ: `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`,
        duration: video.duration,
        views: video.views,
        videoId: video.videoId,
        isFree: true,
    }));
}

/**
 * Estimate time to learn a skill
 */
function estimateSkillTime(skill) {
    const timeEstimates = {
        'HTML': '1 week',
        'CSS': '2 weeks',
        'Git': '1 week',
        'JavaScript': '4 weeks',
        'TypeScript': '2 weeks',
        'Python': '3 weeks',
        'SQL': '2 weeks',
        'React': '3 weeks',
        'Node.js': '3 weeks',
        'MongoDB': '2 weeks',
        'REST APIs': '2 weeks',
        'Docker': '2 weeks',
        'Kubernetes': '3 weeks',
        'AWS': '4 weeks',
        'Machine Learning': '6 weeks',
        'TensorFlow': '4 weeks',
        'CI/CD': '2 weeks',
    };

    return timeEstimates[skill] || '2 weeks';
}

/**
 * Generate a project idea based on skills
 */
function generateProjectIdea(skills) {
    const skillSet = new Set(skills.map(s => s.toLowerCase()));

    if (skillSet.has('react') || skillSet.has('javascript')) {
        return 'Build a personal portfolio website with interactive components';
    } else if (skillSet.has('python') && skillSet.has('machine learning')) {
        return 'Create a sentiment analysis tool for social media posts';
    } else if (skillSet.has('node.js') && skillSet.has('mongodb')) {
        return 'Build a RESTful API for a blog or e-commerce platform';
    } else if (skillSet.has('docker') || skillSet.has('kubernetes')) {
        return 'Containerize and deploy a multi-service application';
    }

    return 'Build a full-stack application incorporating your new skills';
}

/**
 * Get project type based on target role
 */
function getProjectTypeForRole(targetRole) {
    const projects = {
        'frontend-developer': {
            name: 'Interactive Web Application',
            description: 'Build a responsive, interactive web application showcasing modern frontend skills',
            idea: 'Create a weather dashboard with real-time data, charts, and responsive design',
        },
        'backend-developer': {
            name: 'RESTful API Service',
            description: 'Build a complete API with authentication, database integration, and documentation',
            idea: 'Create an API for a task management system with user authentication',
        },
        'fullstack-developer': {
            name: 'Full-Stack Application',
            description: 'Build an end-to-end application with frontend, backend, and database',
            idea: 'Create a job board application with search, filters, and user accounts',
        },
        'data-scientist': {
            name: 'Data Analysis Project',
            description: 'Analyze a real dataset and present findings with visualizations',
            idea: 'Analyze and visualize a public dataset to derive actionable insights',
        },
        'devops-engineer': {
            name: 'CI/CD Pipeline',
            description: 'Set up a complete CI/CD pipeline with containerization',
            idea: 'Create an automated deployment pipeline for a microservices application',
        },
    };

    return projects[targetRole] || projects['fullstack-developer'];
}

/**
 * Format duration in human-readable format
 */
function formatDuration(weeks) {
    if (weeks < 4) {
        return `${weeks} weeks`;
    } else if (weeks < 8) {
        return `${Math.round(weeks / 4)} month`;
    } else {
        return `${Math.round(weeks / 4)} months`;
    }
}

/**
 * Get recommended resources for multiple skills
 * @param {Array<string>} skills - List of skill names
 * @param {Object} preferences - User preferences
 * @returns {Array<Object>} - Curated resources
 */
exports.getRecommendedResources = (skills, preferences = {}) => {
    const { maxPerSkill = 2, types = [] } = preferences;
    const recommendations = [];

    skills.forEach(skill => {
        const resources = LEARNING_RESOURCES[skill] || [];
        const filtered = types.length > 0
            ? resources.filter(r => types.includes(r.type))
            : resources;

        recommendations.push(
            ...filtered.slice(0, maxPerSkill).map(r => ({
                ...r,
                skill,
            }))
        );
    });

    return recommendations;
};
