/**
 * Navigation and Authentication Redirect Utilities
 * Protects against open redirects, redirect loops, and broken history states.
 */

const PROTECTED_ROUTE_PREFIXES = [
    '/dashboard',
    '/upload',
    '/results',
    '/roadmap',
]

/**
 * Checks whether a given path is a protected route requiring authentication.
 * @param {string} path 
 * @returns {boolean}
 */
export function isProtectedRoute(path) {
    if (!path || typeof path !== 'string') return false
    return PROTECTED_ROUTE_PREFIXES.some(prefix => path === prefix || path.startsWith(`${prefix}/`))
}

/**
 * Validates and extracts a safe internal application redirect URL.
 * Rejects external protocols, protocol-relative URLs, and auth page loops.
 * 
 * @param {string|object} from - Location state or string path
 * @param {string} fallback - Default safe fallback path (default: '/dashboard')
 * @returns {string} - Verified safe internal route path
 */
export function getSafeRedirectUrl(from, fallback = '/dashboard') {
    let target = ''

    if (typeof from === 'string') {
        target = from.trim()
    } else if (from && typeof from === 'object') {
        const pathname = typeof from.pathname === 'string' ? from.pathname : ''
        const search = typeof from.search === 'string' ? from.search : ''
        const hash = typeof from.hash === 'string' ? from.hash : ''
        target = `${pathname}${search}${hash}`.trim()
    }

    if (!target) {
        return fallback
    }

    // Security check 1: Must be a relative path starting with '/'
    // Rejects 'https://...', 'http://...', 'javascript:...', '//evil.com', '/\\evil.com'
    if (!target.startsWith('/') || target.startsWith('//') || target.startsWith('/\\')) {
        return fallback
    }

    // Security check 2: Prevent colon before query parameter to block obscure scheme injection
    const pathOnly = target.split('?')[0].split('#')[0]
    if (pathOnly.includes(':')) {
        return fallback
    }

    // Security check 3: Never redirect back to login or register (prevents auth loops)
    if (pathOnly === '/login' || pathOnly === '/register') {
        return fallback
    }

    return target
}

/**
 * Safely navigates the user back or to a fallback public page when cancelling authentication.
 * Avoids infinite redirect loops back to protected pages, handles new tabs and direct access.
 * 
 * @param {Function} navigate - React Router navigate function
 * @param {object} location - Current React Router location object
 * @param {string} fallback - Public fallback route (default: '/')
 */
export function handleAuthCancellation(navigate, location, fallback = '/') {
    const fromPath = location.state?.from?.pathname || (typeof location.state?.from === 'string' ? location.state.from : '')

    // If the attempted destination was protected, navigating back to it while unauthenticated
    // would immediately bounce the user back into /login. Safe fallback is public home.
    if (fromPath && isProtectedRoute(fromPath)) {
        navigate(fallback, { replace: true })
        return
    }

    // If there is in-app navigation history (location.key is not 'default' in React Router)
    // and history stack contains previous pages, safely go back.
    if (location?.key && location.key !== 'default' && window.history.length > 1) {
        navigate(-1)
        return
    }

    // Fallback for direct URL entry, new tab, or missing in-app history
    navigate(fallback, { replace: true })
}
