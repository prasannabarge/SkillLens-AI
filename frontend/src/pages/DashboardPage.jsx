/**
 * DashboardPage Component
 * Command Center for Career Intelligence, Analytics, History, and Roadmaps
 */

import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
    LayoutDashboard,
    ScanSearch,
    Map,
    FileText,
    CheckCircle2,
    Sparkles,
    TrendingUp,
    Settings,
    ArrowRight,
    Clock,
    Trash2,
    Search,
    Plus,
    Compass,
    ExternalLink
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useAnalysis } from '../hooks/useAnalysis'
import { useRoadmap } from '../hooks/useRoadmap'
import { useShell } from '../App'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Progress from '../components/ui/Progress'
import EmptyState from '../components/ui/EmptyState'
import { SkeletonCard } from '../components/ui/Skeleton'
import { toast } from 'sonner'

function DashboardPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const { user } = useAuth()
    const shell = useShell()
    const {
        getHistory,
        history,
        getStats,
        stats: analysisStats,
        deleteAnalysis,
        loading: loadingAnalysis
    } = useAnalysis()
    const {
        getSavedRoadmaps,
        roadmaps,
        getStats: getRoadmapStats,
        stats: roadmapStats,
        deleteRoadmap,
        loading: loadingRoadmap
    } = useRoadmap()

    const initialTab = searchParams.get('tab') || 'overview'
    const [activeTab, setActiveTab] = useState(initialTab)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        getHistory({ limit: 20 })
        getStats()
        getSavedRoadmaps({ limit: 20 })
        getRoadmapStats()
    }, [getHistory, getStats, getSavedRoadmaps, getRoadmapStats])

    const handleTabChange = (tabId) => {
        setActiveTab(tabId)
        setSearchParams({ tab: tabId })
    }

    const handleDeleteAnalysis = async (e, id) => {
        e.preventDefault()
        e.stopPropagation()
        if (window.confirm('Are you sure you want to remove this analysis record?')) {
            try {
                await deleteAnalysis(id)
                toast.success('Analysis record deleted.')
            } catch (err) {
                toast.error(err.message || 'Failed to delete analysis.')
            }
        }
    }

    const handleDeleteRoadmap = async (e, id) => {
        e.preventDefault()
        e.stopPropagation()
        if (window.confirm('Are you sure you want to delete this roadmap?')) {
            try {
                await deleteRoadmap(id)
                toast.success('Roadmap deleted.')
            } catch (err) {
                toast.error(err.message || 'Failed to delete roadmap.')
            }
        }
    }

    const loading = loadingAnalysis || loadingRoadmap
    const userFirstName = user?.name ? user.name.split(' ')[0] : 'Engineer'
    const targetRoleName = user?.targetRole ? user.targetRole.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Software Engineer'

    const quickStats = [
        {
            label: 'Total Analyses',
            value: analysisStats?.totalAnalyses ?? history.length,
            icon: FileText,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10',
            border: 'border-cyan-500/20',
        },
        {
            label: 'Average Match',
            value: `${analysisStats?.averageScore || (history.length > 0 ? Math.round(history.reduce((a, b) => a + (b.matchScore || 0), 0) / history.length) : 0)}%`,
            icon: Sparkles,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
        },
        {
            label: 'Active Roadmaps',
            value: roadmapStats?.totalRoadmaps ?? roadmaps.length,
            icon: Map,
            color: 'text-sky-400',
            bg: 'bg-sky-500/10',
            border: 'border-sky-500/20',
        },
        {
            label: 'Milestones Completed',
            value: roadmapStats?.completedMilestones ?? 0,
            icon: CheckCircle2,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
        },
    ]

    // Filter analyses
    const filteredHistory = history.filter(a => {
        if (!searchQuery) return true
        const role = a.targetRole || ''
        const name = a.resumeFileName || ''
        return role.toLowerCase().includes(searchQuery.toLowerCase()) || name.toLowerCase().includes(searchQuery.toLowerCase())
    })

    return (
        <div className="min-h-screen flex flex-col bg-background text-slate-100">
            <Navbar />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
                {/* Career Target Banner */}
                <div className="p-6 sm:p-8 rounded-3xl bg-surface-elevated/90 border border-white/10 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 font-medium">
                            <Compass className="w-3.5 h-3.5" />
                            <span>Career Target: {targetRoleName}</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                            Welcome back, {userFirstName}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400">
                            Command center for tracking technical skills, benchmark gaps, and roadmap milestones.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <Link to="/upload">
                            <Button variant="primary" icon={ScanSearch}>
                                Analyze Resume
                            </Button>
                        </Link>
                        <Button
                            variant="secondary"
                            onClick={() => shell?.openProfile?.()}
                            icon={Settings}
                        >
                            Profile
                        </Button>
                    </div>
                </div>

                {/* Metric Quick Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickStats.map((stat, i) => {
                        const Icon = stat.icon
                        return (
                            <div
                                key={i}
                                className="p-5 rounded-2xl bg-surface-elevated/80 border border-white/[0.08] hover:border-white/15 transition-all space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-400">{stat.label}</span>
                                    <div className={`w-8 h-8 rounded-xl ${stat.bg} ${stat.border} border flex items-center justify-center ${stat.color}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold font-numbers tracking-tight text-white">
                                    {stat.value}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Tabs Switcher */}
                <div className="flex items-center border-b border-white/10 gap-2 pb-px overflow-x-auto">
                    {[
                        { id: 'overview', label: 'Overview' },
                        { id: 'analyses', label: `All Analyses (${history.length})` },
                        { id: 'roadmaps', label: `Saved Roadmaps (${roadmaps.length})` },
                    ].map((tab) => {
                        const isCurrent = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 select-none shrink-0 ${
                                    isCurrent
                                        ? 'bg-white/10 text-white shadow-sm border border-white/10 font-semibold'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                {/* Tab Content */}
                {loading && history.length === 0 && roadmaps.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                ) : (
                    <>
                        {/* 1. Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Left Column: Recent Analyses */}
                                <div className="lg:col-span-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-cyan-400" />
                                            Recent Resume Analyses
                                        </h3>
                                        {history.length > 0 && (
                                            <button
                                                onClick={() => handleTabChange('analyses')}
                                                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                                            >
                                                <span>View all</span>
                                                <ArrowRight className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>

                                    {history.length > 0 ? (
                                        <div className="space-y-3">
                                            {history.slice(0, 4).map((analysis) => {
                                                const score = analysis.matchScore ?? analysis.overallMatchScore ?? 0
                                                const roleName = analysis.targetRoleLabel || (analysis.targetRole ? analysis.targetRole.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Role')

                                                return (
                                                    <Link
                                                        key={analysis._id}
                                                        to={`/results/${analysis._id}`}
                                                        className="block p-4 rounded-2xl bg-surface-elevated/80 border border-white/[0.08] hover:border-cyan-500/40 hover:bg-surface-hover transition-all group"
                                                    >
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="space-y-1 min-w-0">
                                                                <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                                                                    {roleName}
                                                                </div>
                                                                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                                                                    <span>{analysis.resumeFileName || 'Resume.pdf'}</span>
                                                                    <span>•</span>
                                                                    <span>{new Date(analysis.createdAt).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-3 shrink-0">
                                                                <div className={`px-2.5 py-1 rounded-xl text-xs font-bold font-numbers border ${
                                                                    score >= 70
                                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                                        : score >= 40
                                                                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                                }`}>
                                                                    {score}% Match
                                                                </div>
                                                                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                                                            </div>
                                                        </div>
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <EmptyState
                                            icon={FileText}
                                            title="No resume analyses yet"
                                            description="Upload your resume to receive an automated skill gap report."
                                            action={
                                                <Link to="/upload">
                                                    <Button size="sm" icon={ScanSearch}>
                                                        Upload Resume
                                                    </Button>
                                                </Link>
                                            }
                                            className="p-8 border border-white/5 rounded-2xl bg-surface-elevated/40"
                                        />
                                    )}
                                </div>

                                {/* Right Column: Active Roadmaps */}
                                <div className="lg:col-span-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                            <Map className="w-4 h-4 text-sky-400" />
                                            Active Learning Roadmaps
                                        </h3>
                                        {roadmaps.length > 0 && (
                                            <button
                                                onClick={() => handleTabChange('roadmaps')}
                                                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                                            >
                                                <span>View all</span>
                                                <ArrowRight className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>

                                    {roadmaps.length > 0 ? (
                                        <div className="space-y-3">
                                            {roadmaps.slice(0, 4).map((roadmap) => {
                                                const progress = roadmap.progress || 0
                                                const role = roadmap.targetRole ? roadmap.targetRole.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Role'

                                                return (
                                                    <Link
                                                        key={roadmap._id}
                                                        to={`/roadmap/${roadmap._id}`}
                                                        className="block p-4 rounded-2xl bg-surface-elevated/80 border border-white/[0.08] hover:border-cyan-500/40 hover:bg-surface-hover transition-all group"
                                                    >
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                                                                    {role} Curriculum
                                                                </div>
                                                                <Badge
                                                                    variant={roadmap.status === 'completed' ? 'success' : 'secondary'}
                                                                    size="sm"
                                                                >
                                                                    {roadmap.status?.replace('_', ' ') || 'draft'}
                                                                </Badge>
                                                            </div>
                                                            <Progress value={progress} size="xs" showLabel={true} />
                                                        </div>
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <EmptyState
                                            icon={Map}
                                            title="No roadmaps created"
                                            description="Run a resume analysis to automatically synthesize a step-by-step roadmap."
                                            action={
                                                <Link to="/upload">
                                                    <Button size="sm" icon={ScanSearch}>
                                                        Begin Analysis
                                                    </Button>
                                                </Link>
                                            }
                                            className="p-8 border border-white/5 rounded-2xl bg-surface-elevated/40"
                                        />
                                    )}
                                </div>

                                {/* Quick Actions Row */}
                                <div className="lg:col-span-12 p-6 rounded-3xl bg-surface-elevated/80 border border-white/10 space-y-4">
                                    <h3 className="text-sm font-semibold text-white">Quick Actions</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <Link
                                            to="/upload"
                                            className="p-4 rounded-2xl bg-surface-overlay/80 border border-white/5 hover:border-cyan-500/30 hover:bg-surface-hover transition-all text-center space-y-2 group"
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                                                <ScanSearch className="w-4 h-4" />
                                            </div>
                                            <div className="text-xs font-medium text-slate-300 group-hover:text-white">
                                                Analyze Resume
                                            </div>
                                        </Link>

                                        <button
                                            onClick={() => handleTabChange('analyses')}
                                            className="p-4 rounded-2xl bg-surface-overlay/80 border border-white/5 hover:border-cyan-500/30 hover:bg-surface-hover transition-all text-center space-y-2 group"
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div className="text-xs font-medium text-slate-300 group-hover:text-white">
                                                Analysis History
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => handleTabChange('roadmaps')}
                                            className="p-4 rounded-2xl bg-surface-overlay/80 border border-white/5 hover:border-cyan-500/30 hover:bg-surface-hover transition-all text-center space-y-2 group"
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                                                <Map className="w-4 h-4" />
                                            </div>
                                            <div className="text-xs font-medium text-slate-300 group-hover:text-white">
                                                My Roadmaps
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => shell?.openProfile?.()}
                                            className="p-4 rounded-2xl bg-surface-overlay/80 border border-white/5 hover:border-cyan-500/30 hover:bg-surface-hover transition-all text-center space-y-2 group"
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                                                <Settings className="w-4 h-4" />
                                            </div>
                                            <div className="text-xs font-medium text-slate-300 group-hover:text-white">
                                                Career Settings
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Analyses Tab */}
                        {activeTab === 'analyses' && (
                            <div className="p-6 sm:p-8 rounded-3xl bg-surface-elevated border border-white/10 space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-base font-semibold text-white">All Resume Analyses</h3>
                                        <p className="text-xs text-slate-400">Complete historical log of parsed resumes and benchmark results</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                placeholder="Search by role or file..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-8 pr-3 py-1.5 bg-surface-overlay border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-52"
                                            />
                                        </div>
                                        <Link to="/upload">
                                            <Button size="sm" icon={Plus}>
                                                New Analysis
                                            </Button>
                                        </Link>
                                    </div>
                                </div>

                                {filteredHistory.length > 0 ? (
                                    <div className="space-y-3">
                                        {filteredHistory.map((analysis) => {
                                            const score = analysis.matchScore ?? analysis.overallMatchScore ?? 0
                                            const role = analysis.targetRoleLabel || (analysis.targetRole ? analysis.targetRole.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Role')

                                            return (
                                                <Link
                                                    key={analysis._id}
                                                    to={`/results/${analysis._id}`}
                                                    className="p-4 rounded-2xl bg-surface-overlay/70 border border-white/5 hover:border-cyan-500/40 hover:bg-surface-hover transition-all flex items-center justify-between gap-4 group"
                                                >
                                                    <div className="space-y-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                                                                {role}
                                                            </span>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                                score >= 70
                                                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                                                    : score >= 40
                                                                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                                                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                                            }`}>
                                                                {score}% Match
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-400 flex items-center gap-2">
                                                            <span>{analysis.resumeFileName || 'Resume.pdf'}</span>
                                                            <span>•</span>
                                                            <span>{analysis.matchedSkills?.length || 0} matched</span>
                                                            <span>•</span>
                                                            <span>{analysis.gapSkills?.length || 0} gaps</span>
                                                            <span>•</span>
                                                            <span>{new Date(analysis.createdAt).toLocaleDateString()}</span>
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => handleDeleteAnalysis(e, analysis._id)}
                                                            className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                                            title="Delete analysis"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                                                    </div>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={FileText}
                                        title="No analyses found"
                                        description="No resume analyses match your query. Upload a resume to create your first report."
                                        action={
                                            <Link to="/upload">
                                                <Button size="sm" icon={ScanSearch}>
                                                    Upload Resume
                                                </Button>
                                            </Link>
                                        }
                                    />
                                )}
                            </div>
                        )}

                        {/* 3. Roadmaps Tab */}
                        {activeTab === 'roadmaps' && (
                            <div className="p-6 sm:p-8 rounded-3xl bg-surface-elevated border border-white/10 space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-base font-semibold text-white">All Career Roadmaps</h3>
                                        <p className="text-xs text-slate-400">Curricula and phased milestones generated for your target roles</p>
                                    </div>
                                    <Link to="/upload">
                                        <Button size="sm" icon={Plus}>
                                            Create New Roadmap
                                        </Button>
                                    </Link>
                                </div>

                                {roadmaps.length > 0 ? (
                                    <div className="space-y-3">
                                        {roadmaps.map((roadmap) => {
                                            const progress = roadmap.progress || 0
                                            const role = roadmap.targetRole ? roadmap.targetRole.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Role'

                                            return (
                                                <Link
                                                    key={roadmap._id}
                                                    to={`/roadmap/${roadmap._id}`}
                                                    className="p-5 rounded-2xl bg-surface-overlay/70 border border-white/5 hover:border-cyan-500/40 hover:bg-surface-hover transition-all block group"
                                                >
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="space-y-1">
                                                                <div className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                                                                    {role} Curriculum
                                                                </div>
                                                                <p className="text-xs text-slate-400">
                                                                    {roadmap.phases?.length || 0} Phases • {roadmap.totalEstimatedTime || 'Self-paced'}
                                                                </p>
                                                            </div>

                                                            <div className="flex items-center gap-3">
                                                                <Badge
                                                                    variant={roadmap.status === 'completed' ? 'success' : 'secondary'}
                                                                    size="sm"
                                                                >
                                                                    {roadmap.status?.replace('_', ' ') || 'draft'}
                                                                </Badge>
                                                                <button
                                                                    onClick={(e) => handleDeleteRoadmap(e, roadmap._id)}
                                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                                                    title="Delete roadmap"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <Progress value={progress} size="sm" showLabel={true} />
                                                    </div>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={Map}
                                        title="No learning roadmaps found"
                                        description="Generate a roadmap from an existing analysis to begin structured skill acquisition."
                                        action={
                                            <Link to="/upload">
                                                <Button size="sm" icon={ScanSearch}>
                                                    Run Analysis
                                                </Button>
                                            </Link>
                                        }
                                    />
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    )
}

export default DashboardPage
