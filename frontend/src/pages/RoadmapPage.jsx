/**
 * RoadmapPage Component
 * Chronological learning roadmap with milestone progress, interactive toggles,
 * and curated video/documentation resource cards.
 */

import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    Map,
    CheckCircle2,
    Circle,
    Play,
    BookOpen,
    Video,
    Clock,
    ChevronDown,
    Save,
    Check,
    ArrowRight,
    ExternalLink,
    Sparkles,
    LayoutDashboard,
    ScanSearch,
    Bookmark
} from 'lucide-react'
import { useRoadmap } from '../hooks/useRoadmap'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Progress from '../components/ui/Progress'
import Loading from '../components/ui/Loading'
import ErrorState from '../components/ui/ErrorState'
import SkillBadge from '../components/ui/SkillBadge'
import { toast } from 'sonner'

function RoadmapPage() {
    const { id } = useParams()
    const {
        getRoadmap,
        roadmap,
        loading,
        error,
        updateProgress,
        startRoadmap,
        saveRoadmap
    } = useRoadmap()

    const [expandedPhase, setExpandedPhase] = useState(0)
    const [saving, setSaving] = useState(false)
    const [starting, setStarting] = useState(false)

    useEffect(() => {
        if (id) {
            getRoadmap(id)
        }
    }, [id, getRoadmap])

    const handleMilestoneToggle = async (phaseIndex, milestoneIndex, currentStatus) => {
        try {
            await updateProgress(id, phaseIndex, milestoneIndex, !currentStatus)
            toast.success(!currentStatus ? 'Milestone marked completed' : 'Milestone marked incomplete')
        } catch (err) {
            toast.error(err.message || 'Failed to update milestone progress.')
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await saveRoadmap(id)
            toast.success('Roadmap saved to your library')
        } catch (err) {
            toast.error(err.message || 'Failed to save roadmap')
        } finally {
            setSaving(false)
        }
    }

    const handleStart = async () => {
        setStarting(true)
        try {
            await startRoadmap(id)
            toast.success('Roadmap marked in-progress')
        } catch (err) {
            toast.error(err.message || 'Failed to start roadmap')
        } finally {
            setStarting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-background text-slate-100">
                <Navbar />
                <main className="flex-1 flex items-center justify-center p-6">
                    <Loading size="lg" text="Loading your learning roadmap..." />
                </main>
                <Footer />
            </div>
        )
    }

    if (error || !roadmap) {
        return (
            <div className="min-h-screen flex flex-col bg-background text-slate-100">
                <Navbar />
                <main className="flex-1 flex items-center justify-center p-6">
                    <ErrorState
                        title="Roadmap Not Found"
                        message={error || 'The requested career learning roadmap could not be found.'}
                        secondaryAction={
                            <Link to="/dashboard">
                                <Button size="sm" icon={LayoutDashboard}>
                                    Return to Dashboard
                                </Button>
                            </Link>
                        }
                    />
                </main>
                <Footer />
            </div>
        )
    }

    const phases = roadmap.phases || []
    const totalMilestones = phases.reduce((sum, p) => sum + (p.milestones?.length || 0), 0)
    const completedMilestones = phases.reduce((sum, p) =>
        sum + (p.milestones?.filter(m => m.isCompleted)?.length || 0), 0)
    const overallProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0
    const roleName = roadmap.targetRole ? roadmap.targetRole.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Target Role'

    return (
        <div className="min-h-screen flex flex-col bg-background text-slate-100">
            <Navbar />

            <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8">
                {/* Header Banner */}
                <div className="p-6 sm:p-8 rounded-3xl bg-surface-elevated/90 border border-white/10 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <Badge variant={roadmap.status === 'completed' ? 'success' : 'accent'} size="sm">
                                {roadmap.status ? roadmap.status.replace('_', ' ') : 'Roadmap'}
                            </Badge>
                            {roadmap.difficulty && (
                                <Badge variant="secondary" size="sm">
                                    {roadmap.difficulty}
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                            {roleName} Curriculum
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                {roadmap.totalEstimatedTime || 'Self-paced timeline'}
                            </span>
                            <span>•</span>
                            <span>{phases.length} Phases</span>
                            <span>•</span>
                            <span>{totalMilestones} Milestones</span>
                        </p>
                    </div>

                    {/* Header Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                        {roadmap.status === 'draft' && (
                            <Button
                                variant="primary"
                                onClick={handleStart}
                                loading={starting}
                                icon={Play}
                            >
                                Start Learning
                            </Button>
                        )}
                        <Button
                            variant="secondary"
                            onClick={handleSave}
                            disabled={saving || roadmap.isSaved}
                            icon={roadmap.isSaved ? Check : Bookmark}
                        >
                            {roadmap.isSaved ? 'Saved to Library' : saving ? 'Saving...' : 'Save Roadmap'}
                        </Button>
                    </div>
                </div>

                {/* Overall Velocity Progress */}
                <div className="p-6 rounded-3xl bg-surface-elevated border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-white">Overall Completion</h3>
                            <p className="text-xs text-slate-400">
                                {completedMilestones} of {totalMilestones} milestones completed
                            </p>
                        </div>
                        <span className="text-xl font-bold text-cyan-400 font-numbers">
                            {overallProgress}%
                        </span>
                    </div>
                    <Progress value={overallProgress} size="md" variant="gradient" />
                </div>

                {/* Phased Milestones Accordion */}
                <div className="space-y-4">
                    {phases.map((phase, phaseIndex) => {
                        const phaseMilestones = phase.milestones || []
                        const completedInPhase = phaseMilestones.filter(m => m.isCompleted).length
                        const phaseProgress = phaseMilestones.length > 0
                            ? Math.round((completedInPhase / phaseMilestones.length) * 100)
                            : 0
                        const isExpanded = expandedPhase === phaseIndex
                        const isPhaseComplete = phaseMilestones.length > 0 && completedInPhase === phaseMilestones.length

                        return (
                            <div
                                key={phaseIndex}
                                className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
                                    isExpanded
                                        ? 'bg-surface-elevated border-white/15 shadow-card'
                                        : 'bg-surface-elevated/70 border-white/[0.08] hover:border-white/20'
                                }`}
                            >
                                {/* Phase Header Button */}
                                <button
                                    onClick={() => setExpandedPhase(isExpanded ? -1 : phaseIndex)}
                                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 select-none hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border text-xs font-bold ${
                                            isPhaseComplete
                                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                                : isExpanded
                                                ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                                                : 'bg-surface-overlay border-white/10 text-slate-400'
                                        }`}>
                                            {isPhaseComplete ? <CheckCircle2 className="w-5 h-5" /> : `P${phaseIndex + 1}`}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                                                    {phase.name}
                                                </h3>
                                                {isPhaseComplete && (
                                                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                                        Completed
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 truncate mt-0.5 max-w-xl">
                                                {phase.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="text-right hidden sm:block">
                                            <div className="text-xs font-semibold text-white font-numbers">
                                                {completedInPhase} / {phaseMilestones.length}
                                            </div>
                                            <div className="text-[11px] text-slate-500">
                                                {phase.estimatedDuration || 'Phase duration'}
                                            </div>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                                            isExpanded ? 'rotate-180 text-white' : ''
                                        }`} />
                                    </div>
                                </button>

                                {/* Phase Progress Bar Line */}
                                <div className="px-6 pb-2">
                                    <Progress value={phaseProgress} size="xs" variant={isPhaseComplete ? 'emerald' : 'cyan'} />
                                </div>

                                {/* Expanded Milestones */}
                                {isExpanded && (
                                    <div className="px-5 pb-6 sm:px-6 space-y-4 pt-3 border-t border-white/5">
                                        {phaseMilestones.map((milestone, milestoneIndex) => {
                                            const youtubeResources = milestone.resources?.filter(r => r.type === 'youtube') || []
                                            const docResources = milestone.resources?.filter(r => r.type !== 'youtube') || []

                                            return (
                                                <div
                                                    key={milestoneIndex}
                                                    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-150 ${
                                                        milestone.isCompleted
                                                            ? 'bg-emerald-500/[0.04] border-emerald-500/20'
                                                            : 'bg-surface-overlay/60 border-white/5 hover:border-white/15'
                                                    }`}
                                                >
                                                    {/* Milestone Title Row */}
                                                    <div className="flex items-start gap-3.5">
                                                        <button
                                                            onClick={() => handleMilestoneToggle(phaseIndex, milestoneIndex, milestone.isCompleted)}
                                                            className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                                                                milestone.isCompleted
                                                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                                                    : 'border-white/20 hover:border-cyan-400 bg-surface-elevated'
                                                            }`}
                                                            title={milestone.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                                                        >
                                                            {milestone.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                        </button>

                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                                <h4 className={`text-sm font-semibold ${
                                                                    milestone.isCompleted ? 'text-slate-400 line-through' : 'text-white'
                                                                }`}>
                                                                    {milestone.title}
                                                                </h4>
                                                                {milestone.estimatedTime && (
                                                                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" />
                                                                        {milestone.estimatedTime}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-400 leading-relaxed">
                                                                {milestone.description}
                                                            </p>

                                                            {/* Attached Skills */}
                                                            {milestone.skills?.length > 0 && (
                                                                <div className="flex flex-wrap gap-1.5 pt-2">
                                                                    {milestone.skills.map((skill, i) => (
                                                                        <SkillBadge key={i} skill={skill} type="neutral" />
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Documentation & Courses */}
                                                            {docResources.length > 0 && (
                                                                <div className="pt-3 space-y-1.5">
                                                                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                                                        <BookOpen className="w-3 h-3 text-cyan-400" />
                                                                        <span>Documentation & References</span>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                                                                        {docResources.slice(0, 4).map((resource, i) => (
                                                                            <a
                                                                                key={i}
                                                                                href={resource.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="p-2.5 rounded-xl bg-surface-elevated/70 border border-white/5 hover:border-cyan-500/30 text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group"
                                                                            >
                                                                                <span className="truncate pr-2 font-medium">{resource.title}</span>
                                                                                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* YouTube Video Tutorials Grid */}
                                                            {youtubeResources.length > 0 && (
                                                                <div className="pt-4 space-y-2">
                                                                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                                                        <Video className="w-3 h-3 text-rose-400" />
                                                                        <span>Curated Video Tutorials</span>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                        {youtubeResources.map((video, i) => (
                                                                            <a
                                                                                key={i}
                                                                                href={video.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="group rounded-xl overflow-hidden bg-surface-elevated/90 border border-white/10 hover:border-cyan-500/40 hover:shadow-card transition-all flex flex-col"
                                                                            >
                                                                                {/* Video Thumbnail */}
                                                                                <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                                                                                    {video.thumbnail ? (
                                                                                        <img
                                                                                            src={video.thumbnailHQ || video.thumbnail}
                                                                                            alt={video.title}
                                                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                                                            loading="lazy"
                                                                                        />
                                                                                    ) : (
                                                                                        <div className="w-full h-full flex items-center justify-center bg-surface-overlay text-slate-600">
                                                                                            <Video className="w-8 h-8" />
                                                                                        </div>
                                                                                    )}
                                                                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                                                                                        <div className="w-10 h-10 rounded-full bg-rose-600/90 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                                                                            <Play className="w-4 h-4 ml-0.5 fill-current" />
                                                                                        </div>
                                                                                    </div>
                                                                                    {video.duration && (
                                                                                        <span className="absolute bottom-1.5 right-1.5 bg-black/85 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                                                                                            {video.duration}
                                                                                        </span>
                                                                                    )}
                                                                                </div>

                                                                                {/* Video Meta */}
                                                                                <div className="p-3 flex-1 flex flex-col justify-between">
                                                                                    <h5 className="text-xs font-medium text-white line-clamp-2 group-hover:text-cyan-300 transition-colors">
                                                                                        {video.title}
                                                                                    </h5>
                                                                                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                                                                                        <span className="truncate max-w-[120px]">{video.provider || 'YouTube'}</span>
                                                                                        {video.views && <span>{video.views} views</span>}
                                                                                    </div>
                                                                                </div>
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Bottom Actions */}
                <div className="pt-6 border-t border-white/5 flex flex-wrap items-center justify-center gap-3">
                    <Link to="/dashboard">
                        <Button variant="secondary" icon={LayoutDashboard}>
                            Career Dashboard
                        </Button>
                    </Link>
                    <Link to="/upload">
                        <Button variant="primary" icon={ScanSearch}>
                            Run New Analysis
                        </Button>
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default RoadmapPage
