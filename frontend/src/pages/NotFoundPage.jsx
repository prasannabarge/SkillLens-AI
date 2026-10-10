/**
 * NotFoundPage (404) Component
 * Provides a clear, user-friendly 404 state for genuinely nonexistent URLs,
 * with safe recovery navigation options back to valid application routes.
 */

import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Compass, Home, ArrowLeft, LayoutDashboard, UploadCloud, LogIn } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'

function NotFoundPage() {
    const navigate = useNavigate()

    const handleGoBack = () => {
        if (window.history.length > 1) {
            navigate(-1)
        } else {
            navigate('/', { replace: true })
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-background text-slate-100">
            <Navbar />

            <main className="flex-1 flex items-center justify-center px-4 py-20 relative">
                {/* Background Ambient Glow */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="w-full max-w-xl relative z-10 text-center space-y-8">
                    {/* 404 Badge & Icon */}
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-surface-elevated border border-white/10 shadow-2xl text-cyan-400 mb-2">
                        <Compass className="w-10 h-10 animate-pulse stroke-[1.8]" />
                    </div>

                    <div className="space-y-3">
                        <span className="text-xs font-mono font-semibold tracking-widest text-cyan-400 uppercase px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                            Error 404 • Not Found
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                            Page Does Not Exist
                        </h1>
                        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                            The route you requested cannot be found. It may have been moved, removed, or the address was typed incorrectly.
                        </p>
                    </div>

                    {/* Primary Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <Button
                            id="btn-notfound-home"
                            variant="primary"
                            size="md"
                            icon={Home}
                            onClick={() => navigate('/')}
                        >
                            Back to Home
                        </Button>
                        <Button
                            id="btn-notfound-back"
                            variant="secondary"
                            size="md"
                            icon={ArrowLeft}
                            onClick={handleGoBack}
                        >
                            Previous Page
                        </Button>
                    </div>

                    {/* Quick Links to Valid App Routes */}
                    <div className="pt-8 border-t border-white/5">
                        <p className="text-xs font-medium text-slate-400 mb-4">
                            Explore available destinations:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                            <Link
                                to="/"
                                className="p-3 rounded-2xl bg-surface-elevated/60 hover:bg-surface-hover border border-white/5 hover:border-white/15 transition-all group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Home className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                                    <div>
                                        <p className="text-xs font-semibold text-white">Home</p>
                                        <p className="text-[11px] text-slate-400">Main overview</p>
                                    </div>
                                </div>
                            </Link>
                            <Link
                                to="/upload"
                                className="p-3 rounded-2xl bg-surface-elevated/60 hover:bg-surface-hover border border-white/5 hover:border-white/15 transition-all group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <UploadCloud className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                                    <div>
                                        <p className="text-xs font-semibold text-white">Analyze</p>
                                        <p className="text-[11px] text-slate-400">Resume parser</p>
                                    </div>
                                </div>
                            </Link>
                            <Link
                                to="/dashboard"
                                className="p-3 rounded-2xl bg-surface-elevated/60 hover:bg-surface-hover border border-white/5 hover:border-white/15 transition-all group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <LayoutDashboard className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                                    <div>
                                        <p className="text-xs font-semibold text-white">Dashboard</p>
                                        <p className="text-[11px] text-slate-400">Career matrix</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default NotFoundPage
