/**
 * Application Configuration
 * Centralized configuration with validation
 */

// Validate required environment variables
const validateEnv = () => {
    const required = ['MONGODB_URI', 'JWT_SECRET'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0 && process.env.NODE_ENV === 'production') {
        console.error('❌ Missing required environment variables:', missing.join(', '));
        process.exit(1);
    }

    // Warn about default JWT secret in development
    if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-minimum-32-characters-long') {
        console.warn('⚠️ WARNING: Using default JWT secret. Change this in production!');
    }
};

// Run validation
validateEnv();

const config = {
    // Environment
    env: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV !== 'production',
    isProd: process.env.NODE_ENV === 'production',

    // Server
    server: {
        port: parseInt(process.env.PORT, 10) || 5000,
        host: process.env.HOST || 'localhost',
    },

    // Database
    database: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/skilllens',
        name: process.env.DB_NAME || 'skilllens',
    },

    // JWT Configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-minimum-32-characters-long',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
        algorithm: 'HS256',
    },

    // NLP Service Configuration
    nlpService: {
        baseUrl: process.env.NLP_SERVICE_URL || 'http://localhost:8000',
        timeout: parseInt(process.env.NLP_SERVICE_TIMEOUT, 10) || 30000,
        endpoints: {
            analyze: '/api/analyze',
            match: '/api/match',
            skills: '/api/skills',
            roles: '/api/roles',
            health: '/health',
        },
    },

    // File Upload Configuration
    upload: {
        maxSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB
        uploadDir: process.env.UPLOAD_DIR || './uploads',
        allowedMimeTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
        ],
        allowedExtensions: ['.pdf', '.doc', '.docx', '.txt'],
    },

    // CORS Configuration
    cors: {
        origins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    },

    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
    },

    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'debug',
        format: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
    },

    // Password Reset
    passwordReset: {
        expiresInMinutes: parseInt(process.env.PASSWORD_RESET_EXPIRES, 10) || 10,
    },

    // Email Configuration (optional)
    email: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from: process.env.EMAIL_FROM || 'SkillLens <noreply@skilllens.app>',
    },

    // Pagination defaults
    pagination: {
        defaultLimit: 10,
        maxLimit: 100,
    },
};

module.exports = config;
