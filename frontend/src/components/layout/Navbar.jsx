import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    ScanSearch,
    LayoutDashboard,
    UploadCloud,
    User,
    LogOut,
    Menu,
    X,
    Command as CommandIcon,
    ChevronDown,
    Sparkles
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useShell } from '../../App'
import Button from '../ui/Button'
import { cn } from '../../utils/cn'

export function Navbar({ onOpenCommandPalette, onOpenProfile }) {
    const location = useLocation()
    const navigate = useNavigate()
    const { isAuthenticated, user, logout } = useAuth()
    const shell = useShell()
    const handleOpenCommandPalette = onOpenCommandPalette || shell?.openCommandPalette
    const handleOpenProfile = onOpenProfile || shell?.openProfile
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [userDropdownOpen, setUserDropdownOpen] = useState(false)

    const isActive = (path) => {
        if (path === '/' && location.pathname === '/') return true
        if (path !== '/' && location.pathname.startsWith(path)) return true
        return false
    }

    const navLinks = [
        { label: 'Home', path: '/', public: true },
        { label: 'Dashboard', path: '/dashboard', authRequired: true, icon: LayoutDashboard },
        { label: 'Analyze Resume', path: '/upload', authRequired: true, icon: UploadCloud },
    ]

    const handleLogout = () => {
        setUserDropdownOpen(false)
        setMobileMenuOpen(false)
        logout()
    }

    return (
        <header className="sticky top-0 z-40 w-full border-b border-white/[0.07] bg-background/80 backdrop-blur-xl transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand / Logo */}
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2.5 group">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 flex items-center justify-center text-white shadow-glow-cyan group-hover:scale-105 transition-transform">
                                <ScanSearch className="w-5 h-5 stroke-[2.2]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                                    SkillLens
                                    <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                                        AI
                                    </span>
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navLinks.map((item) => {
                                if (item.authRequired && !isAuthenticated) return null
                                const active = isActive(item.path)
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={cn(
                                            'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 relative select-none',
                                            active
                                                ? 'text-white bg-white/10 shadow-sm'
                                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Command Palette Trigger */}
                        <button
                            onClick={handleOpenCommandPalette}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-slate-400 bg-surface-elevated/90 hover:bg-surface-hover border border-white/10 hover:border-white/20 transition-all select-none"
                            title="Quick Command (Cmd + K)"
                        >
                            <CommandIcon className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Quick search</span>
                            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-overlay text-slate-400 border border-white/10">
                                ⌘K
                            </kbd>
                        </button>

                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-surface-elevated/70 hover:bg-surface-hover border border-white/10 transition-all select-none"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-sky-600 text-white flex items-center justify-center text-xs font-semibold">
                                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div className="text-left hidden lg:block">
                                        <p className="text-xs font-medium text-white leading-tight">
                                            {user?.name?.split(' ')[0] || 'User'}
                                        </p>
                                        <p className="text-[10px] text-slate-400 leading-tight">
                                            {user?.targetRole ? user.targetRole.replace('-', ' ') : 'Account'}
                                        </p>
                                    </div>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                                </button>

                                {/* Dropdown Menu */}
                                {userDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setUserDropdownOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-56 bg-surface-elevated border border-white/10 rounded-2xl shadow-2xl p-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
                                            <div className="px-3 py-2 border-b border-white/5 mb-1">
                                                <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
                                                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setUserDropdownOpen(false)
                                                    handleOpenProfile?.()
                                                }}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-surface-hover rounded-xl transition-colors text-left"
                                            >
                                                <User className="w-4 h-4 text-cyan-400" />
                                                <span>Profile & Target Roles</span>
                                            </button>
                                            <Link
                                                to="/dashboard"
                                                onClick={() => setUserDropdownOpen(false)}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-surface-hover rounded-xl transition-colors text-left"
                                            >
                                                <LayoutDashboard className="w-4 h-4 text-sky-400" />
                                                <span>Career Dashboard</span>
                                            </Link>
                                            <div className="h-px bg-white/5 my-1" />
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors text-left"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Sign out</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn-primary text-xs px-4 py-2"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-2 md:hidden">
                        <button
                            onClick={handleOpenCommandPalette}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
                            aria-label="Search"
                        >
                            <CommandIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
                            aria-label="Toggle Menu"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150">
                    <div className="space-y-1">
                        {navLinks.map((item) => {
                            if (item.authRequired && !isAuthenticated) return null
                            const active = isActive(item.path)
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                        'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                                        active
                                            ? 'text-white bg-white/10'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    )}
                                >
                                    {item.icon && <item.icon className="w-4 h-4 text-cyan-400" />}
                                    <span>{item.label}</span>
                                </Link>
                            )
                        })}
                    </div>

                    <div className="pt-3 border-t border-white/5 space-y-2">
                        {isAuthenticated ? (
                            <>
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false)
                                        handleOpenProfile?.()
                                    }}
                                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5"
                                >
                                    <User className="w-4 h-4 text-cyan-400" />
                                    <span>Profile & Target Roles</span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Sign Out</span>
                                </button>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <Link
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="btn-secondary text-center text-xs py-2.5"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="btn-primary text-center text-xs py-2.5"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}

export default Navbar
