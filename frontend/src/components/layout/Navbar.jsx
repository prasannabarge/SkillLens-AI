/**
 * Navbar Component
 * Main navigation with auth-aware menu
 */

import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function Navbar() {
    const location = useLocation()
    const { isAuthenticated, user, logout } = useAuth()

    const isActive = (path) => location.pathname === path

    return (
        <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-2xl">🔍</span>
                        <span className="text-xl font-bold gradient-text">SkillLens</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            to="/"
                            className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            Home
                        </Link>

                        {isAuthenticated && (
                            <>
                                <Link
                                    to="/dashboard"
                                    className={`text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/upload"
                                    className={`text-sm font-medium transition-colors ${isActive('/upload') ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    Analyze
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Auth Actions */}
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                <span className="hidden sm:inline text-sm text-slate-400">
                                    Hi, {user?.name?.split(' ')[0] || 'User'}
                                </span>
                                <button
                                    onClick={logout}
                                    className="text-sm text-slate-400 hover:text-white transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-sm text-slate-400 hover:text-white transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link to="/register" className="btn-primary text-sm px-4 py-2">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
