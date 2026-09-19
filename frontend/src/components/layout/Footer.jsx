import React from 'react'
import { Link } from 'react-router-dom'
import { ScanSearch, CheckCircle2, Github, ExternalLink } from 'lucide-react'

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t border-white/[0.07] bg-surface-base/80 backdrop-blur-md text-slate-400 text-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Col 1: Brand */}
                    <div className="space-y-4 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-glow-cyan-sm">
                                <ScanSearch className="w-4 h-4" />
                            </div>
                            <span className="text-base font-bold text-white tracking-tight">
                                SkillLens <span className="text-cyan-400">AI</span>
                            </span>
                        </Link>
                        <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
                            AI-powered career intelligence platform designed to extract skills, benchmark against industry roles, and generate precision learning roadmaps.
                        </p>
                        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[11px] font-medium">All systems operational</span>
                        </div>
                    </div>

                    {/* Col 2: Product */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Product</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/upload" className="hover:text-white transition-colors">Resume Analyzer</Link>
                            </li>
                            <li>
                                <Link to="/dashboard" className="hover:text-white transition-colors">Career Dashboard</Link>
                            </li>
                            <li>
                                <Link to="/upload" className="hover:text-white transition-colors">Skill Gap Benchmark</Link>
                            </li>
                            <li>
                                <Link to="/dashboard" className="hover:text-white transition-colors">Curated Roadmaps</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Col 3: Capabilities */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Analysis Roles</h4>
                        <ul className="space-y-2">
                            <li><span className="text-slate-400">Full Stack Engineer</span></li>
                            <li><span className="text-slate-400">DevOps & Cloud Architect</span></li>
                            <li><span className="text-slate-400">Data Scientist & AI Engineer</span></li>
                            <li><span className="text-slate-400">Frontend & Backend Specialist</span></li>
                        </ul>
                    </div>

                    {/* Col 4: Trust & Legal */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Security & Privacy</h4>
                        <ul className="space-y-2">
                            <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="#terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                            <li><span className="text-slate-500">Zero Resume Data Retention</span></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-xs">
                        © {currentYear} SkillLens AI. Precision Career Intelligence.
                    </p>
                    <div className="flex items-center gap-6 text-slate-500">
                        <span>WCAG 2.2 AA Compliant</span>
                        <span>•</span>
                        <span>Enterprise Grade Security</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
