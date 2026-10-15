/**
 * Production Fixes Regression Suite:
 * 1. MongoDB Database Name Case Sensitivity & Canonicalization ('skillLens')
 * 2. Express Trust Proxy & express-rate-limit Proxy Validation ('ERR_ERL_UNEXPECTED_X_FORWARDED_FOR')
 */

const request = require('supertest');
const express = require('express');
const rateLimit = require('express-rate-limit');
const app = require('../src/app');
const config = require('../src/config');
const User = require('../src/models/User');

describe('Production Fixes Regression Suite', () => {
    describe('Issue 1: MongoDB Database Name Consistency', () => {
        it('should configure canonical database name skillLens in config', () => {
            expect(config.database.name).toBe('skillLens');
        });

        it('should ensure database URI targets skillLens or preserves cluster root', () => {
            expect(config.database.uri).not.toMatch(/\/skilllens(?=[/?]|$)/);
        });

        it('should expose skillLens in /health/detailed endpoint', async () => {
            const res = await request(app).get('/health/detailed');
            expect(res.body.database).toBeDefined();
            expect(res.body.database.name).toBe('skillLens');
        });

        it('should allow successful user registration without db case mismatch', async () => {
            const testEmail = `case_test_${Date.now()}@skilllens.app`;
            const mockCreatedUser = {
                _id: '507f1f77bcf86cd799439012',
                name: 'Case Test User',
                email: testEmail,
                role: 'user',
                currentRole: 'student',
                targetRole: 'frontend-developer',
                isActive: true,
                isEmailVerified: false,
                createEmailVerificationToken: jest.fn().mockReturnValue('mock-verification-token'),
                save: jest.fn().mockResolvedValue(true),
                toJSON: () => ({
                    id: '507f1f77bcf86cd799439012',
                    name: 'Case Test User',
                    email: testEmail,
                    role: 'user',
                }),
            };

            const findSpy = jest.spyOn(User, 'findOne').mockResolvedValue(null);
            const createSpy = jest.spyOn(User, 'create').mockResolvedValue(mockCreatedUser);

            const res = await request(app)
                .post('/api/auth/register')
                .set('X-Forwarded-For', '203.0.113.50')
                .send({
                    name: 'Case Test User',
                    email: testEmail,
                    password: 'SecurePassword123!',
                    currentRole: 'student',
                    targetRole: 'frontend-developer',
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
            expect(res.body.user.email).toBe(testEmail);

            findSpy.mockRestore();
            createSpy.mockRestore();
        });
    });

    describe('Issue 2: Express Trust Proxy & express-rate-limit Proxy Handling', () => {
        it('should configure trust proxy to 1 on the Express app', () => {
            expect(app.get('trust proxy')).toBe(1);
        });

        it('should correctly extract client IP from X-Forwarded-For header without throwing ERR_ERL_UNEXPECTED_X_FORWARDED_FOR', async () => {
            // A request passing through Render proxy with X-Forwarded-For
            const res = await request(app)
                .get('/health')
                .set('X-Forwarded-For', '203.0.113.195');

            expect(res.status).toBe(200);
            expect(res.body.status).toBe('ok');
        });

        it('should prevent client IP spoofing by trusting only 1 hop from the right', async () => {
            const testApp = express();
            testApp.set('trust proxy', 1);

            testApp.get('/ip-check', (req, res) => {
                res.json({
                    clientIp: req.ip,
                    ips: req.ips,
                });
            });

            // Attacker passes spoofed IP '198.51.100.99', Render proxy appends real client IP '203.0.113.195'
            const res = await request(testApp)
                .get('/ip-check')
                .set('X-Forwarded-For', '198.51.100.99, 203.0.113.195');

            expect(res.status).toBe(200);
            // With trust proxy: 1, Express trusts only the immediate proxy and extracts the rightmost client IP
            expect(res.body.clientIp).toBe('203.0.113.195');
            expect(res.body.clientIp).not.toBe('198.51.100.99');
        });

        it('should enforce rate limits on authentication routes per client IP', async () => {
            const testApp = express();
            testApp.set('trust proxy', 1);

            const testLimiter = rateLimit({
                windowMs: 60 * 1000,
                max: 3,
                standardHeaders: true,
                legacyHeaders: false,
                message: { error: 'Rate limit exceeded' },
            });

            testApp.post('/api/test-auth', testLimiter, (req, res) => {
                res.status(200).json({ success: true, ip: req.ip });
            });

            const clientA = '203.0.113.10';
            const clientB = '203.0.113.20';

            // Client A makes 3 requests (within limit)
            for (let i = 0; i < 3; i++) {
                const res = await request(testApp)
                    .post('/api/test-auth')
                    .set('X-Forwarded-For', clientA);
                expect(res.status).toBe(200);
            }

            // Client A makes 4th request (should be rate-limited)
            const blockedRes = await request(testApp)
                .post('/api/test-auth')
                .set('X-Forwarded-For', clientA);
            expect(blockedRes.status).toBe(429);
            expect(blockedRes.headers['ratelimit-remaining']).toBe('0');

            // Client B is unaffected by Client A's rate limit
            const clientBRes = await request(testApp)
                .post('/api/test-auth')
                .set('X-Forwarded-For', clientB);
            expect(clientBRes.status).toBe(200);
        });
    });
});
