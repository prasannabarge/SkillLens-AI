/**
 * Express Application Configuration
 * Enhanced with comprehensive middleware and error handling
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const config = require('./config');
const { getConnectionStatus } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth.routes');
const analysisRoutes = require('./routes/analysis.routes');
const roadmapRoutes = require('./routes/roadmap.routes');
const userRoutes = require('./routes/user.routes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet for security headers
app.use(helmet({
    contentSecurityPolicy: config.isProd,
    crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (config.cors.origins.includes(origin)) {
            callback(null, true);
        } else if (config.isDev) {
            // Allow all origins in development
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: config.cors.credentials,
    methods: config.cors.methods,
    allowedHeaders: config.cors.allowedHeaders,
}));

// ============================================
// RATE LIMITING
// ============================================

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: { error: config.rateLimit.message },
    standardHeaders: config.rateLimit.standardHeaders,
    legacyHeaders: config.rateLimit.legacyHeaders,
});

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per window
    message: { error: 'Too many authentication attempts, please try again later.' },
});

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ============================================
// BODY PARSING
// ============================================

app.use(express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    },
}));

app.use(express.urlencoded({
    extended: true,
    limit: '10mb',
}));

// ============================================
// LOGGING
// ============================================

if (config.env !== 'test') {
    app.use(morgan(config.logging.format, {
        skip: (req) => req.url === '/health', // Skip health check logging
    }));
}

// ============================================
// STATIC FILES
// ============================================

// Serve uploaded files (if needed)
app.use('/uploads', express.static(path.join(__dirname, '..', config.upload.uploadDir)));

// ============================================
// HEALTH CHECK ENDPOINTS
// ============================================

// Simple health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'skilllens-backend',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.env,
    });
});

// Detailed health check with database status
app.get('/health/detailed', (req, res) => {
    const dbStatus = getConnectionStatus();

    res.status(dbStatus === 'connected' ? 200 : 503).json({
        status: dbStatus === 'connected' ? 'ok' : 'degraded',
        service: 'skilllens-backend',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.env,
        database: {
            status: dbStatus,
        },
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
        },
    });
});

// ============================================
// API ROUTES
// ============================================

// API version prefix
const API_PREFIX = '/api';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/analysis`, analysisRoutes);
app.use(`${API_PREFIX}/roadmap`, roadmapRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);

// ============================================
// ROOT ENDPOINT
// ============================================

app.get('/', (req, res) => {
    res.json({
        name: 'SkillLens API',
        version: '1.0.0',
        description: 'AI-powered career skill analyzer API',
        documentation: '/health',
        endpoints: {
            auth: `${API_PREFIX}/auth`,
            analysis: `${API_PREFIX}/analysis`,
            roadmap: `${API_PREFIX}/roadmap`,
            users: `${API_PREFIX}/users`,
        },
    });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler - must be after all routes
app.use((req, res, next) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method,
        suggestion: 'Check the API documentation at /health',
    });
});

// Global error handler - must be last
app.use(errorHandler);

module.exports = app;
