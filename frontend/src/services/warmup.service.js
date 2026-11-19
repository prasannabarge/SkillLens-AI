/**
 * Cloud Microservices Warmup Service
 * Preemptively wakes up Render-hosted Backend and Python NLP microservices
 * on initial application launch to prevent cold-start HTTP 429 / 504 errors.
 */

import { analysisService } from './api'

// Track in-memory warm-up lifecycle
let warmupStarted = false
let warmupCompleted = false

/**
 * Defensive origin sanitizer: extracts purely the origin and strips subpaths/slashes
 * Follows defensive engineering standards (new URL(raw.trim()).origin)
 *
 * @param {string|undefined} rawUrl - Environment variable or fallback URL
 * @param {string} fallbackOrigin - Default origin if parsing fails
 * @returns {string} Sanitized root origin
 */
const sanitizeOrigin = (rawUrl, fallbackOrigin) => {
    if (!rawUrl || typeof rawUrl !== 'string') return fallbackOrigin
    try {
        const trimmed = rawUrl.trim()
        if (!trimmed) return fallbackOrigin
        return new URL(trimmed).origin
    } catch {
        return fallbackOrigin.replace(/\/+$/, '')
    }
}

// Extracted root origins with safe defaults
const NLP_ORIGIN = sanitizeOrigin(
    import.meta.env.VITE_NLP_SERVICE_URL,
    'https://skilllens-ai-l14p.onrender.com'
)

const BACKEND_ORIGIN = sanitizeOrigin(
    import.meta.env.VITE_API_URL,
    'https://skilllens-backend-4se9.onrender.com'
)

/**
 * Silently warms up backend and Python NLP services in the background.
 * - Completely asynchronous & non-blocking
 * - Swallows any errors to ensure 0% impact on UI or user navigation
 * - Guards against rapid redundant bursts within a session
 */
export async function warmUpCloudServices() {
    // Avoid spamming if already warmed up within the past 10 minutes
    try {
        const lastPing = sessionStorage.getItem('skilllens_warmup_ts')
        const now = Date.now()
        if (lastPing && (now - parseInt(lastPing, 10)) < 10 * 60 * 1000) {
            return
        }
    } catch (_) {
        // Ignore sessionStorage security/disabled errors (e.g. strict private browsing)
    }

    if (warmupStarted) return
    warmupStarted = true

    try {
        sessionStorage.setItem('skilllens_warmup_ts', Date.now().toString())
    } catch (_) {}

    // 1. Direct Ping to Python AI NLP microservice on Render
    // Uses mode: 'no-cors' so the browser dispatches the HTTP request regardless of CORS preflights.
    // Render receives the request and starts warming up Uvicorn, PyTorch, spaCy, and Sentence-Transformers.
    const pingNlpMicroservice = async () => {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 15000)
            await fetch(`${NLP_ORIGIN}/health`, {
                method: 'GET',
                mode: 'no-cors',
                cache: 'no-store',
                signal: controller.signal,
            })
            clearTimeout(timeoutId)
        } catch (_) {
            // Silently swallow - goal is to trigger server spin-up
        }
    }

    // 2. Direct Ping to Node.js Backend on Render
    const pingBackendService = async () => {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 15000)
            await fetch(`${BACKEND_ORIGIN}/health`, {
                method: 'GET',
                mode: 'no-cors',
                cache: 'no-store',
                signal: controller.signal,
            })
            clearTimeout(timeoutId)
        } catch (_) {
            // Silently swallow
        }
    }

    // 3. Handshake via Backend to prefetch job roles and trigger internal downstream NLP ping
    const pingRolesHandshake = async () => {
        try {
            await analysisService.getRoles()
        } catch (_) {
            // Handled gracefully with local fallback inside analysisService
        }
    }

    // Run all pings concurrently in the background
    Promise.allSettled([
        pingNlpMicroservice(),
        pingBackendService(),
        pingRolesHandshake(),
    ]).then(() => {
        warmupCompleted = true
    }).catch(() => {})
}

export default warmUpCloudServices
