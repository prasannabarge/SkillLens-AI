/**
 * Backend Regression & Production Resilience Tests
 * Tests analysis routes, auth, validation, file upload, error handling, and NLP fallback
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const app = require('../src/app');
const config = require('../src/config');
const User = require('../src/models/User');
const Analysis = require('../src/models/Analysis');
const nlpService = require('../src/services/nlp.service');
const { AppError } = require('../src/middleware/errorHandler');

describe('SkillLens Backend & Analysis Pipeline Regression Suite', () => {
    let mockUser;
    let validToken;
    const testPdfPath = path.join(__dirname, 'test_sample.pdf');
    const testTxtPath = path.join(__dirname, 'test_sample.txt');
    const testEmptyPdfPath = path.join(__dirname, 'test_empty.pdf');
    const testInvalidExtPath = path.join(__dirname, 'test_invalid.exe');

    beforeAll(() => {
        // Create test sample files
        fs.writeFileSync(
            testPdfPath,
            '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF'
        );

        fs.writeFileSync(
            testTxtPath,
            'Prasanna Barge\nSkills: JavaScript, TypeScript, React, Node.js, Express, MongoDB, SQL, Git, REST API\nExperience: Senior Full Stack Engineer building modern web apps.'
        );

        fs.writeFileSync(testEmptyPdfPath, '%PDF-1.4 empty');
        fs.writeFileSync(testInvalidExtPath, 'MZ binary executable');

        // Mock authenticated user and token
        mockUser = {
            _id: '507f1f77bcf86cd799439011',
            email: 'test@skilllens.app',
            name: 'Test Engineer',
            role: 'user',
            isActive: true,
        };

        validToken = jwt.sign(
            { id: mockUser._id, email: mockUser.email, role: mockUser.role },
            config.jwt.secret,
            { expiresIn: '1h' }
        );

        // Mock User.findById
        jest.spyOn(User, 'findById').mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser),
        });

        // Mock User.findByIdAndUpdate
        jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValue(mockUser);
    });

    afterAll(() => {
        // Cleanup test files
        [testPdfPath, testTxtPath, testEmptyPdfPath, testInvalidExtPath].forEach((p) => {
            if (fs.existsSync(p)) fs.unlinkSync(p);
        });
        jest.restoreAllMocks();
    });

    describe('1. Backend Availability & Health Endpoints', () => {
        it('GET / should return HTTP 200 with API metadata', async () => {
            const res = await request(app).get('/');
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('SkillLens API');
            expect(res.body.endpoints).toBeDefined();
            expect(res.body.endpoints.analysis).toBe('/api/analysis');
        });

        it('GET /health should return 200 with service info', async () => {
            const res = await request(app).get('/health');
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('ok');
            expect(res.body.service).toBe('skilllens-backend');
        });

        it('GET /health/detailed should report service status and memory', async () => {
            const res = await request(app).get('/health/detailed');
            expect([200, 503]).toContain(res.status);
            expect(res.body.service).toBe('skilllens-backend');
            expect(res.body.database).toBeDefined();
            expect(res.body.database.name).toBe('skillLens');
        });
    });

    describe('2. Job Roles Endpoint & Public Access', () => {
        it('GET /api/analysis/roles should be publicly accessible without authentication', async () => {
            const res = await request(app).get('/api/analysis/roles');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.roles)).toBe(true);
            expect(res.body.roles.length).toBeGreaterThan(0);
        });

        it('should include all required roles including business-analyst and product-analyst', async () => {
            const res = await request(app).get('/api/analysis/roles');
            const roleIds = res.body.roles.map(r => r.id);
            expect(roleIds).toContain('frontend-developer');
            expect(roleIds).toContain('backend-developer');
            expect(roleIds).toContain('fullstack-developer');
            expect(roleIds).toContain('business-analyst');
            expect(roleIds).toContain('product-analyst');
        });
    });

    describe('3. Authentication & Authorization Protections', () => {
        it('POST /api/analysis/analyze should reject requests with no token (401)', async () => {
            const res = await request(app)
                .post('/api/analysis/analyze')
                .field('targetRole', 'frontend-developer');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toMatch(/No token provided/i);
            expect(res.body.requestId).toBeDefined();
        });

        it('POST /api/analysis/analyze should reject requests with an invalid token (401)', async () => {
            const res = await request(app)
                .post('/api/analysis/analyze')
                .set('Authorization', 'Bearer invalid-garbage-token')
                .field('targetRole', 'frontend-developer');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toMatch(/Invalid token/i);
        });
    });

    describe('4. Input Validation & Multipart Upload Protections', () => {
        it('should return 400 when no resume file is attached', async () => {
            const res = await request(app)
                .post('/api/analysis/analyze')
                .set('Authorization', `Bearer ${validToken}`)
                .field('targetRole', 'frontend-developer');

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toMatch(/Validation failed|Please upload a resume file/i);
        });

        it('should return 400 when targetRole is missing', async () => {
            const res = await request(app)
                .post('/api/analysis/analyze')
                .set('Authorization', `Bearer ${validToken}`)
                .attach('resume', testPdfPath);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toMatch(/Validation failed|Target role is required/i);
        });

        it('should return 400 for an invalid / unsupported role', async () => {
            const res = await request(app)
                .post('/api/analysis/analyze')
                .set('Authorization', `Bearer ${validToken}`)
                .attach('resume', testPdfPath)
                .field('targetRole', 'invalid-astronaut-role');

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.details?.[0]?.message).toMatch(/Invalid target role/i);
        });

        it('should accept valid newly added roles business-analyst and product-analyst', async () => {
            jest.spyOn(Analysis, 'findOne').mockResolvedValue(null);
            const mockCreatedAnalysis = {
                _id: '507f1f77bcf86cd799439099',
                complete: jest.fn().mockResolvedValue(true),
                generateSummary: jest.fn().mockReturnValue({ strengths: [], areasToImprove: [], quickWins: [] }),
                save: jest.fn().mockResolvedValue(true),
                overallMatchScore: 75,
                processingTime: 120,
            };
            jest.spyOn(Analysis, 'create').mockResolvedValue(mockCreatedAnalysis);
            jest.spyOn(nlpService, 'analyzeResume').mockResolvedValue({
                extracted_text: 'SQL, Excel, Data Analysis',
                extracted_skills: [{ name: 'SQL' }],
                required_skills: [{ name: 'SQL' }],
                matched_skills: [{ name: 'SQL' }],
                gap_skills: [],
                match_score: 100,
                recommendations: [],
            });

            const res = await request(app)
                .post('/api/analysis/analyze')
                .set('Authorization', `Bearer ${validToken}`)
                .attach('resume', testTxtPath)
                .field('targetRole', 'business-analyst');

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it('should reject unpermitted file extensions with a clear validation error', async () => {
            const res = await request(app)
                .post('/api/analysis/analyze')
                .set('Authorization', `Bearer ${validToken}`)
                .attach('resume', testInvalidExtPath)
                .field('targetRole', 'frontend-developer');

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toMatch(/File type not allowed/i);
        });
    });

    describe('5. NLP Service Downstream Error & Timeout Resilience', () => {
        it('should handle downstream FastAPI 400 validation error cleanly without generic 500', async () => {
            jest.spyOn(Analysis, 'findOne').mockResolvedValue(null);
            const mockCreatedAnalysis = {
                _id: '507f1f77bcf86cd799439099',
                fail: jest.fn().mockResolvedValue(true),
            };
            jest.spyOn(Analysis, 'create').mockResolvedValue(mockCreatedAnalysis);

            // Simulate downstream FastAPI returning 400 for an unreadable/scanned document
            const analyzeSpy = jest.spyOn(nlpService, 'analyzeResume').mockRejectedValue(
                new AppError('Could not extract text from the PDF resume. If this is a scanned document, please upload a text-based file.', 400)
            );

            const res = await request(app)
                .post('/api/analysis/analyze')
                .set('Authorization', `Bearer ${validToken}`)
                .attach('resume', testPdfPath)
                .field('targetRole', 'frontend-developer');

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toMatch(/Could not extract text from the PDF resume/i);
            expect(res.body.error).not.toMatch(/Something went wrong/i);
            expect(mockCreatedAnalysis.fail).toHaveBeenCalled();

            analyzeSpy.mockRestore();
        });

        it('should gracefully fallback when NLP service times out or is unreachable', async () => {
            jest.spyOn(Analysis, 'findOne').mockResolvedValue(null);
            const mockCreatedAnalysis = {
                _id: '507f1f77bcf86cd799439099',
                complete: jest.fn().mockResolvedValue(true),
                generateSummary: jest.fn().mockReturnValue({ strengths: [], areasToImprove: [], quickWins: [] }),
                save: jest.fn().mockResolvedValue(true),
                overallMatchScore: 80,
                processingTime: 150,
            };
            jest.spyOn(Analysis, 'create').mockResolvedValue(mockCreatedAnalysis);

            // Test fallback function directly with a simulated connection timeout
            const timeoutError = new Error('timeout of 60000ms exceeded');
            timeoutError.code = 'ECONNABORTED';
            const axiosSpy = jest.spyOn(require('axios').Axios.prototype, 'post').mockRejectedValue(timeoutError);

            const fallbackResult = await nlpService.analyzeResume(testTxtPath, 'fullstack-developer');
            expect(fallbackResult).toBeDefined();
            expect(fallbackResult.extracted_skills).toBeDefined();
            expect(fallbackResult.matched_skills).toBeDefined();

            axiosSpy.mockRestore();
        });
    });

    describe('6. Request Correlation & Header Verification', () => {
        it('should return matching X-Request-ID header in response', async () => {
            const customReqId = 'custom-correlation-12345';
            const res = await request(app)
                .get('/api/analysis/roles')
                .set('X-Request-ID', customReqId);

            expect(res.status).toBe(200);
            expect(res.headers['x-request-id']).toBe(customReqId);
        });

        it('should generate an X-Request-ID if none is provided', async () => {
            const res = await request(app).get('/api/analysis/roles');
            expect(res.headers['x-request-id']).toBeDefined();
            expect(res.headers['x-request-id'].length).toBeGreaterThan(10);
        });
    });

    describe('7. HTTP 429 Rate Limiting, Bounded Backoff & Duplicate Submission Guards', () => {
        it('POST /api/analysis/analyze should reject duplicate in-flight analysis with HTTP 409 Conflict', async () => {
            // Mock findOne: first call for completed returns null, second call for processing returns in-flight doc
            jest.spyOn(Analysis, 'findOne')
                .mockResolvedValueOnce(null) // completed check
                .mockResolvedValueOnce({
                    _id: '507f1f77bcf86cd799439088',
                    status: 'processing',
                    createdAt: new Date(),
                }); // processing check

            const res = await request(app)
                .post('/api/analysis/analyze')
                .set('Authorization', `Bearer ${validToken}`)
                .attach('resume', testTxtPath)
                .field('targetRole', 'fullstack-developer');

            expect(res.status).toBe(409);
            expect(res.body.success).toBe(false);
            expect(res.body.inProgress).toBe(true);
            expect(res.body.error).toContain('already in progress');
        });

        it('nlpService.analyzeResume should retry on HTTP 429 and succeed when downstream recovers', async () => {
            const rateLimitError = new Error('Request failed with status code 429');
            rateLimitError.response = {
                status: 429,
                headers: { 'retry-after': '0' },
                data: { message: 'Too Many Requests' },
            };

            const successData = {
                extracted_text: 'Test resume text',
                extracted_skills: [{ name: 'JavaScript' }],
                required_skills: [{ name: 'JavaScript' }],
                matched_skills: [{ name: 'JavaScript' }],
                gap_skills: [],
                match_score: 100,
                recommendations: [],
            };

            // First call fails with 429, second call succeeds
            let callCount = 0;
            const clientSpy = jest.spyOn(nlpService.nlpClient, 'post').mockImplementation(() => {
                callCount++;
                if (callCount === 1) {
                    return Promise.reject(rateLimitError);
                }
                return Promise.resolve({ status: 200, data: successData, config: { url: '/api/analyze' } });
            });

            const result = await nlpService.analyzeResume(testTxtPath, 'fullstack-developer', { maxRetries: 1 });
            expect(callCount).toBe(2);
            expect(result).toBeDefined();
            expect(result.match_score).toBe(100);

            clientSpy.mockRestore();
        });

        it('nlpService.analyzeResume should throw user-facing 429 error with Retry-After when retries are exhausted', async () => {
            const rateLimitError = new Error('Request failed with status code 429');
            rateLimitError.response = {
                status: 429,
                headers: { 'retry-after': '5' },
                data: { message: 'Too Many Requests' },
            };

            const clientSpy = jest.spyOn(nlpService.nlpClient, 'post').mockRejectedValue(rateLimitError);

            await expect(
                nlpService.analyzeResume(testTxtPath, 'fullstack-developer', { maxRetries: 0 })
            ).rejects.toMatchObject({
                statusCode: 429,
                message: expect.stringContaining('high demand'),
                retryAfter: '5',
            });

            clientSpy.mockRestore();
        });
    });
});

