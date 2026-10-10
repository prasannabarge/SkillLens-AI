import assert from 'node:assert/strict'
import { getSafeRedirectUrl, isProtectedRoute, handleAuthCancellation } from './navigation.js'

console.log('Testing navigation utilities...')

// 1. isProtectedRoute tests
assert.equal(isProtectedRoute('/dashboard'), true, 'dashboard is protected')
assert.equal(isProtectedRoute('/upload'), true, 'upload is protected')
assert.equal(isProtectedRoute('/results/123'), true, 'results/:id is protected')
assert.equal(isProtectedRoute('/roadmap/abc'), true, 'roadmap/:id is protected')
assert.equal(isProtectedRoute('/'), false, 'home is not protected')
assert.equal(isProtectedRoute('/login'), false, 'login is not protected')
assert.equal(isProtectedRoute('/register'), false, 'register is not protected')
assert.equal(isProtectedRoute(null), false, 'null is not protected')
assert.equal(isProtectedRoute(''), false, 'empty is not protected')
console.log('✓ isProtectedRoute passed all assertions')

// 2. getSafeRedirectUrl tests
// Normal relative paths
assert.equal(getSafeRedirectUrl('/upload'), '/upload')
assert.equal(getSafeRedirectUrl('/dashboard'), '/dashboard')
assert.equal(getSafeRedirectUrl({ pathname: '/upload' }), '/upload')
assert.equal(getSafeRedirectUrl({ pathname: '/results/1', search: '?view=full' }), '/results/1?view=full')

// Fallback cases
assert.equal(getSafeRedirectUrl(null), '/dashboard')
assert.equal(getSafeRedirectUrl(undefined), '/dashboard')
assert.equal(getSafeRedirectUrl(''), '/dashboard')
assert.equal(getSafeRedirectUrl(null, '/'), '/')

// Security & Open Redirect protections
assert.equal(getSafeRedirectUrl('https://evil.com'), '/dashboard', 'Blocks external https protocol')
assert.equal(getSafeRedirectUrl('http://evil.com'), '/dashboard', 'Blocks external http protocol')
assert.equal(getSafeRedirectUrl('//evil.com/path'), '/dashboard', 'Blocks protocol-relative URLs')
assert.equal(getSafeRedirectUrl('/\\evil.com'), '/dashboard', 'Blocks backslash bypass')
assert.equal(getSafeRedirectUrl('javascript:alert(1)'), '/dashboard', 'Blocks javascript: pseudo-protocol')

// Auth loop protections
assert.equal(getSafeRedirectUrl('/login'), '/dashboard', 'Blocks loop back to /login')
assert.equal(getSafeRedirectUrl('/register'), '/dashboard', 'Blocks loop back to /register')
assert.equal(getSafeRedirectUrl({ pathname: '/login' }), '/dashboard', 'Blocks object loop back to /login')

console.log('✓ getSafeRedirectUrl passed all security and redirection tests')

// 3. handleAuthCancellation tests
// Case A: From a protected route -> safely navigates to public fallback ('/')
let navigatedTo = null
let navOptions = null
const mockNavigate = (to, opts) => {
    navigatedTo = to
    navOptions = opts
}

// Subtest: Unauthenticated user cancelling when redirected from /upload
handleAuthCancellation(mockNavigate, { state: { from: { pathname: '/upload' } }, key: 'abc123' }, '/')
assert.equal(navigatedTo, '/', 'Cancelling from protected route falls back to home')
assert.equal(navOptions?.replace, true, 'Uses replace to avoid loop')

// Subtest: Direct URL access / new tab (key is default)
navigatedTo = null
navOptions = null
handleAuthCancellation(mockNavigate, { state: null, key: 'default' }, '/')
assert.equal(navigatedTo, '/', 'Direct URL / new tab falls back to home')
assert.equal(navOptions?.replace, true, 'Uses replace for direct access')

// Subtest: In-app navigation from valid public page
globalThis.window = { history: { length: 3 } }
navigatedTo = null
navOptions = null
handleAuthCancellation(mockNavigate, { state: null, key: 'route456' }, '/')
assert.equal(navigatedTo, -1, 'In-app navigation history safely uses navigate(-1)')

console.log('✓ handleAuthCancellation passed all scenario tests')
console.log('All navigation security tests passed successfully!')
