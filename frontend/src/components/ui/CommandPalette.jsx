import React, { useEffect } from 'react'
import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    UploadCloud,
    Compass,
    FileText,
    User,
    LogOut,
    Search,
    Sparkles,
    ArrowRight
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export function CommandPalette({ open, setOpen, onOpenProfile }) {
    const navigate = useNavigate()
    const { isAuthenticated, logout } = useAuth()

    useEffect(() => {
        const down = (e) => {
            if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName))) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [setOpen])

    if (!open) return null

    const handleSelect = (callback) => {
        setOpen(false)
        callback()
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
            <div
                className="fixed inset-0"
                onClick={() => setOpen(false)}
            />
            <div className="relative w-full max-w-xl bg-surface-elevated border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <Command className="w-full">
                    <div className="flex items-center px-4 border-b border-white/10">
                        <Search className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
                        <Command.Input
                            placeholder="Type a command or search..."
                            className="w-full py-4 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                            autoFocus
                        />
                        <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-surface-overlay rounded border border-white/10">
                            ESC
                        </kbd>
                    </div>

                    <Command.List className="max-h-80 overflow-y-auto p-2 text-sm">
                        <Command.Empty className="py-6 text-center text-xs text-slate-500">
                            No results found.
                        </Command.Empty>

                        <Command.Group heading={<span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1.5 block">Navigation</span>}>
                            <Command.Item
                                onSelect={() => handleSelect(() => navigate('/'))}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-surface-hover cursor-pointer transition-colors aria-selected:bg-surface-hover aria-selected:text-white"
                            >
                                <Sparkles className="w-4 h-4 text-cyan-400" />
                                <span>Home</span>
                            </Command.Item>

                            {isAuthenticated ? (
                                <>
                                    <Command.Item
                                        onSelect={() => handleSelect(() => navigate('/dashboard'))}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-surface-hover cursor-pointer transition-colors aria-selected:bg-surface-hover aria-selected:text-white"
                                    >
                                        <LayoutDashboard className="w-4 h-4 text-sky-400" />
                                        <span>Career Dashboard</span>
                                    </Command.Item>
                                    <Command.Item
                                        onSelect={() => handleSelect(() => navigate('/upload'))}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-surface-hover cursor-pointer transition-colors aria-selected:bg-surface-hover aria-selected:text-white"
                                    >
                                        <UploadCloud className="w-4 h-4 text-emerald-400" />
                                        <span>Analyze Resume</span>
                                    </Command.Item>
                                </>
                            ) : (
                                <>
                                    <Command.Item
                                        onSelect={() => handleSelect(() => navigate('/login'))}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-surface-hover cursor-pointer transition-colors aria-selected:bg-surface-hover aria-selected:text-white"
                                    >
                                        <User className="w-4 h-4 text-slate-400" />
                                        <span>Sign In</span>
                                    </Command.Item>
                                    <Command.Item
                                        onSelect={() => handleSelect(() => navigate('/register'))}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-surface-hover cursor-pointer transition-colors aria-selected:bg-surface-hover aria-selected:text-white"
                                    >
                                        <ArrowRight className="w-4 h-4 text-cyan-400" />
                                        <span>Create Account</span>
                                    </Command.Item>
                                </>
                            )}
                        </Command.Group>

                        {isAuthenticated && (
                            <Command.Group heading={<span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1.5 block">Account</span>}>
                                <Command.Item
                                    onSelect={() => handleSelect(() => onOpenProfile?.())}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-surface-hover cursor-pointer transition-colors aria-selected:bg-surface-hover aria-selected:text-white"
                                >
                                    <User className="w-4 h-4 text-slate-400" />
                                    <span>Profile & Target Roles</span>
                                </Command.Item>
                                <Command.Item
                                    onSelect={() => handleSelect(logout)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer transition-colors aria-selected:bg-rose-500/10"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Sign Out</span>
                                </Command.Item>
                            </Command.Group>
                        )}
                    </Command.List>

                    <div className="p-3 border-t border-white/5 bg-surface-base/50 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                            <span>Navigate with</span>
                            <kbd className="px-1.5 py-0.5 bg-surface-overlay rounded border border-white/10 text-[10px]">↑</kbd>
                            <kbd className="px-1.5 py-0.5 bg-surface-overlay rounded border border-white/10 text-[10px]">↓</kbd>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>Select with</span>
                            <kbd className="px-1.5 py-0.5 bg-surface-overlay rounded border border-white/10 text-[10px]">↵</kbd>
                        </div>
                    </div>
                </Command>
            </div>
        </div>
    )
}

export default CommandPalette
