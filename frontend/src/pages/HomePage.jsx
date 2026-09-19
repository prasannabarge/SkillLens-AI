/**
 * HomePage Component
 * 2026 World-Class Landing Page for SkillLens AI Career Intelligence
 */

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    ScanSearch,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    Layers,
    Map,
    TrendingUp,
    FileText,
    Cpu,
    Video,
    ShieldCheck,
    Compass,
    Sparkles
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import MatchScore from '../components/ui/MatchScore'
import SkillBadge from '../components/ui/SkillBadge'
import { JOB_ROLES } from '../utils/constants'

function HomePage() {
    const { isAuthenticated } = useAuth()
    const [selectedRolePreview, setSelectedRolePreview] = useState('fullstack-developer')

    const pipelineSteps = [
        {
            number: '01',
            title: 'Resume Ingestion',
            description: 'Extract raw text, employment history, and technical competencies across PDF, Word, and text formats.',
            icon: FileText,
            detail: 'Multi-format document parsing with semantic text normalization.',
        },
        {
            number: '02',
            title: 'Skill Extraction',
            description: 'Identify technical stacks, frameworks, libraries, cloud tools, and proficiencies with confidence scoring.',
            icon: Cpu,
            detail: 'Identifies both explicitly named technologies and implicit competencies.',
        },
        {
            number: '03',
            title: 'Role Benchmarking',
            description: 'Compare detected skills against live industry requirements for your specific target career role.',
            icon: ScanSearch,
            detail: 'Detects high-priority competency gaps and exact skill overlaps.',
        },
        {
            number: '04',
            title: 'Precision Roadmap',
            description: 'Generates chronological learning phases with vetted tutorials, documentation, and progress tracking.',
            icon: Map,
            detail: 'Step-by-step milestones curated with high-yield video tutorials.',
        },
    ]

    const previewRoles = {
        'fullstack-developer': {
            roleName: 'Full Stack Engineer',
            score: 84,
            matched: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'REST APIs', 'Git'],
            gaps: ['Docker', 'Kubernetes', 'Redis', 'GraphQL'],
            recommendation: 'Priority focus: Container orchestration (Docker & K8s) will close 70% of your remaining gap.',
        },
        'devops-engineer': {
            roleName: 'DevOps Engineer',
            score: 68,
            matched: ['Linux', 'Bash', 'Docker', 'AWS', 'Python', 'Git', 'CI/CD Pipelines'],
            gaps: ['Terraform', 'Kubernetes', 'Prometheus', 'ArgoCD'],
            recommendation: 'Priority focus: Infrastructure as Code (Terraform) and Kubernetes cluster management.',
        },
        'data-scientist': {
            roleName: 'Data Scientist',
            score: 76,
            matched: ['Python', 'Pandas', 'NumPy', 'Scikit-Learn', 'SQL', 'Data Visualization'],
            gaps: ['PyTorch', 'MLflow', 'Docker', 'Spark'],
            recommendation: 'Priority focus: Deep learning foundations with PyTorch and production ML deployment pipelines.',
        },
    }

    const currentPreview = previewRoles[selectedRolePreview] || previewRoles['fullstack-developer']

    return (
        <div className="min-h-screen flex flex-col bg-background text-slate-100">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-white/[0.06]">
                {/* Background Ambient Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40">
                    <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full bg-cyan-500/20 blur-[100px]" />
                    <div className="absolute top-20 right-1/4 w-72 h-72 rounded-full bg-sky-600/15 blur-[120px]" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                        {/* Left: Value Proposition */}
                        <div className="lg:col-span-6 space-y-6 text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated/90 border border-white/10 text-xs text-slate-300">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                <span className="font-medium text-slate-200">Career Intelligence Platform</span>
                                <span className="text-slate-500">•</span>
                                <span className="text-cyan-400">2026 Edition</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                                Benchmark your resume. <br />
                                <span className="gradient-text">Close your skill gaps.</span>
                            </h1>

                            <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl">
                                SkillLens analyzes your resume against target career requirements, pinpoints exact competency deficits, and builds a phased learning roadmap with curated engineering resources.
                            </p>

                            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <Link to={isAuthenticated ? '/upload' : '/register'}>
                                    <Button
                                        size="lg"
                                        icon={ScanSearch}
                                        className="w-full sm:w-auto"
                                    >
                                        Analyze Your Resume
                                    </Button>
                                </Link>
                                <a href="#pipeline">
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        className="w-full sm:w-auto"
                                    >
                                        Explore How It Works
                                    </Button>
                                </a>
                            </div>

                            {/* Trust Signals */}
                            <div className="pt-6 border-t border-white/5 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                                    <span>Private & Secure Ingestion</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-emerald-400" />
                                    <span>Multi-Role Career Benchmarks</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Video className="w-4 h-4 text-sky-400" />
                                    <span>Verified Video Curation</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Interactive Product Intelligence Preview */}
                        <div className="lg:col-span-6">
                            <div className="relative mx-auto max-w-lg lg:max-w-none">
                                {/* Lens Ambient Frame */}
                                <div className="p-1 rounded-3xl bg-gradient-to-b from-white/15 via-white/5 to-white/0 shadow-2xl">
                                    <div className="bg-surface-elevated/95 backdrop-blur-2xl rounded-[22px] border border-white/10 p-6 sm:p-8 space-y-6">
                                        {/* Mock Header */}
                                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                                                    <ScanSearch className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Live Intelligence Preview</div>
                                                    <div className="text-sm font-semibold text-white">{currentPreview.roleName}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                {Object.keys(previewRoles).map((roleKey) => (
                                                    <button
                                                        key={roleKey}
                                                        onClick={() => setSelectedRolePreview(roleKey)}
                                                        className={`text-[11px] px-2.5 py-1 rounded-lg transition-all ${
                                                            selectedRolePreview === roleKey
                                                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium'
                                                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                                        }`}
                                                    >
                                                        {roleKey === 'fullstack-developer' ? 'Full Stack' : roleKey === 'devops-engineer' ? 'DevOps' : 'Data Sci'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Score Gauge & Quick Metrics */}
                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                                            <div className="sm:col-span-5 flex justify-center">
                                                <MatchScore score={currentPreview.score} size={130} />
                                            </div>
                                            <div className="sm:col-span-7 space-y-3">
                                                <div className="p-3 rounded-xl bg-surface-overlay/70 border border-white/5 flex items-center justify-between">
                                                    <span className="text-xs text-slate-400">Skills Matched</span>
                                                    <span className="text-sm font-semibold text-emerald-400 font-numbers">{currentPreview.matched.length} Skills</span>
                                                </div>
                                                <div className="p-3 rounded-xl bg-surface-overlay/70 border border-white/5 flex items-center justify-between">
                                                    <span className="text-xs text-slate-400">Identified Gaps</span>
                                                    <span className="text-sm font-semibold text-amber-400 font-numbers">{currentPreview.gaps.length} Missing</span>
                                                </div>
                                                <div className="p-3 rounded-xl bg-surface-overlay/70 border border-white/5 flex items-center justify-between">
                                                    <span className="text-xs text-slate-400">Roadmap Velocity</span>
                                                    <span className="text-sm font-semibold text-cyan-400">4 Phased Stages</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Skill Tags Comparison */}
                                        <div className="space-y-3 pt-2">
                                            <div>
                                                <span className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                                    Competencies Detected in Resume:
                                                </span>
                                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                    {currentPreview.matched.map((s) => (
                                                        <SkillBadge key={s} skill={s} type="matched" />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <span className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                                                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                                                    Target Gap Priorities to Acquire:
                                                </span>
                                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                    {currentPreview.gaps.map((s) => (
                                                        <SkillBadge key={s} skill={s} type="gap" />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Intelligence Recommendation */}
                                        <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200/90 leading-relaxed flex items-start gap-2.5">
                                            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                                            <span>{currentPreview.recommendation}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pipeline Section: How SkillLens Works */}
            <section id="pipeline" className="py-20 border-b border-white/[0.06] bg-surface-base/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-xs text-cyan-300 font-medium">
                            <span>System Pipeline</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                            From raw resume to verifiable mastery
                        </h2>
                        <p className="text-sm sm:text-base text-slate-400">
                            Our architecture decomposes career transitions into four deterministic, transparent stages.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {pipelineSteps.map((step) => {
                            const Icon = step.icon
                            return (
                                <div
                                    key={step.number}
                                    className="p-6 rounded-2xl bg-surface-elevated/70 border border-white/[0.08] hover:border-cyan-500/30 transition-all duration-200 flex flex-col justify-between group"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-surface-overlay flex items-center justify-center text-cyan-400 border border-white/5 group-hover:scale-105 transition-transform">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs font-mono font-bold text-slate-500">{step.number}</span>
                                        </div>
                                        <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
                                        <p className="text-xs text-slate-400 leading-relaxed mb-4">{step.description}</p>
                                    </div>
                                    <div className="pt-4 border-t border-white/5 text-[11px] text-slate-500 leading-normal">
                                        {step.detail}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Supported Roles Section */}
            <section className="py-20 border-b border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
                        <h2 className="text-3xl font-bold tracking-tight text-white">
                            Supported Career Roles
                        </h2>
                        <p className="text-sm text-slate-400">
                            Pre-configured competency taxonomies updated for modern engineering requirements.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
                        {JOB_ROLES.map((role) => (
                            <Link
                                key={role.id}
                                to={isAuthenticated ? `/upload?role=${role.id}` : '/register'}
                                className="p-3.5 rounded-xl bg-surface-elevated/70 border border-white/5 hover:border-cyan-500/30 hover:bg-surface-hover transition-all text-center group"
                            >
                                <div className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
                                    {role.label}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action Banner */}
            <section className="py-20 relative overflow-hidden">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-surface-elevated to-surface-overlay border border-white/10 shadow-2xl space-y-6">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white max-w-xl mx-auto">
                            Ready to assess your career competency?
                        </h2>
                        <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
                            Upload your resume for immediate parsing, benchmark against top-tier roles, and start your tailored roadmap today.
                        </p>
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link to={isAuthenticated ? '/upload' : '/register'}>
                                <Button size="lg" icon={ScanSearch}>
                                    Start Resume Analysis
                                </Button>
                            </Link>
                            {!isAuthenticated && (
                                <Link to="/login">
                                    <Button variant="secondary" size="lg">
                                        Sign In to Existing Account
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}

export default HomePage
