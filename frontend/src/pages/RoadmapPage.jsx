/**
 * RoadmapPage Component
 * Displays and manages learning roadmap with progress tracking
 */

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useRoadmap } from '../hooks/useRoadmap'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

function RoadmapPage() {
    const { id } = useParams()
    const {
        getRoadmap,
        roadmap,
        loading,
        error,
        updateProgress,
        startRoadmap,
        pauseRoadmap,
        resumeRoadmap,
        saveRoadmap
    } = useRoadmap()

    const [expandedPhase, setExpandedPhase] = useState(0)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (id) {
            getRoadmap(id)
        }
    }, [id, getRoadmap])

    const handleMilestoneToggle = async (phaseIndex, milestoneIndex, currentStatus) => {
        try {
            await updateProgress(id, phaseIndex, milestoneIndex, !currentStatus)
        } catch (err) {
            console.error('Failed to update progress:', err)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await saveRoadmap(id)
        } catch (err) {
            console.error('Failed to save:', err)
        } finally {
            setSaving(false)
        }
    }

    const handleStart = async () => {
        try {
            await startRoadmap(id)
        } catch (err) {
            console.error('Failed to start:', err)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-slate-400">Loading roadmap...</p>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    if (error || !roadmap) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center card p-8 max-w-md">
                        <div className="text-6xl mb-4">🗺️</div>
                        <h2 className="text-2xl font-bold mb-2">Roadmap Not Found</h2>
                        <p className="text-slate-400 mb-6">{error || 'The roadmap you requested could not be found.'}</p>
                        <Link to="/dashboard" className="btn-primary">
                            Go to Dashboard
                        </Link>
                    </div>
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

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
            <Navbar />

            <main className="flex-1 container mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold gradient-text mb-2">
                            Your Learning Roadmap
                        </h1>
                        <p className="text-slate-400">
                            {roadmap.targetRole?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} • {roadmap.totalEstimatedTime || 'Flexible timeline'}
                        </p>
                    </div>

                    <div className="flex gap-3 mt-4 md:mt-0">
                        {roadmap.status === 'draft' && (
                            <button onClick={handleStart} className="btn-primary">
                                🚀 Start Learning
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving || roadmap.isSaved}
                            className="btn-secondary disabled:opacity-50"
                        >
                            {roadmap.isSaved ? '✓ Saved' : saving ? 'Saving...' : '💾 Save'}
                        </button>
                    </div>
                </div>

                {/* Progress Overview */}
                <div className="card p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Overall Progress</h3>
                        <span className="text-2xl font-bold text-cyan-400">{overallProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-4 mb-2">
                        <div
                            className="bg-gradient-to-r from-cyan-500 to-purple-500 h-4 rounded-full transition-all duration-500"
                            style={{ width: `${overallProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-slate-400">
                        {completedMilestones} of {totalMilestones} milestones completed
                    </p>
                </div>

                {/* Phases */}
                <div className="space-y-4">
                    {phases.map((phase, phaseIndex) => {
                        const phaseMilestones = phase.milestones || []
                        const completedInPhase = phaseMilestones.filter(m => m.isCompleted).length
                        const phaseProgress = phaseMilestones.length > 0
                            ? Math.round((completedInPhase / phaseMilestones.length) * 100)
                            : 0
                        const isExpanded = expandedPhase === phaseIndex

                        return (
                            <div key={phaseIndex} className="card overflow-hidden">
                                {/* Phase Header */}
                                <button
                                    onClick={() => setExpandedPhase(isExpanded ? -1 : phaseIndex)}
                                    className="w-full p-6 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <span className="text-3xl mr-4">{phase.icon || '📚'}</span>
                                        <div className="text-left">
                                            <h3 className="text-lg font-semibold">{phase.name}</h3>
                                            <p className="text-sm text-slate-400">{phase.description}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-sm font-medium">{completedInPhase}/{phaseMilestones.length}</div>
                                            <div className="text-xs text-slate-500">{phase.estimatedDuration}</div>
                                        </div>
                                        <svg
                                            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </button>

                                {/* Phase Progress Bar */}
                                <div className="px-6 pb-2">
                                    <div className="w-full bg-slate-700 rounded-full h-1">
                                        <div
                                            className="bg-gradient-to-r from-cyan-500 to-purple-500 h-1 rounded-full transition-all duration-500"
                                            style={{ width: `${phaseProgress}%`, backgroundColor: phase.color }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Milestones */}
                                {isExpanded && (
                                    <div className="px-6 pb-6 space-y-3">
                                        {phaseMilestones.map((milestone, milestoneIndex) => (
                                            <div
                                                key={milestoneIndex}
                                                className={`
                                                    p-4 rounded-lg border transition-all
                                                    ${milestone.isCompleted
                                                        ? 'bg-green-500/10 border-green-500/30'
                                                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-start">
                                                    <button
                                                        onClick={() => handleMilestoneToggle(phaseIndex, milestoneIndex, milestone.isCompleted)}
                                                        className={`
                                                            w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 mt-0.5 flex-shrink-0 transition-all
                                                            ${milestone.isCompleted
                                                                ? 'bg-green-500 border-green-500 text-white'
                                                                : 'border-slate-500 hover:border-cyan-500'
                                                            }
                                                        `}
                                                    >
                                                        {milestone.isCompleted && '✓'}
                                                    </button>

                                                    <div className="flex-1">
                                                        <h4 className={`font-medium ${milestone.isCompleted ? 'line-through text-slate-400' : ''}`}>
                                                            {milestone.title}
                                                        </h4>
                                                        <p className="text-sm text-slate-400 mt-1">{milestone.description}</p>

                                                        {/* Skills */}
                                                        {milestone.skills?.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mt-3">
                                                                {milestone.skills.map((skill, i) => (
                                                                    <span key={i} className="px-2 py-1 text-xs bg-slate-700 rounded">
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Documentation & Courses - filter out youtube type */}
                                                        {milestone.resources?.filter(r => r.type !== 'youtube')?.length > 0 && (
                                                            <div className="mt-3">
                                                                <p className="text-xs text-slate-500 mb-2">📚 Documentation & Courses:</p>
                                                                <div className="space-y-1">
                                                                    {milestone.resources.filter(r => r.type !== 'youtube').slice(0, 3).map((resource, i) => (
                                                                        <a
                                                                            key={i}
                                                                            href={resource.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="block text-sm text-cyan-400 hover:text-cyan-300"
                                                                        >
                                                                            {resource.title} ({resource.type})
                                                                            {resource.isFree && <span className="ml-2 text-green-400 text-xs">FREE</span>}
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* YouTube Videos Section - filter type='youtube' */}
                                                        {milestone.resources?.filter(r => r.type === 'youtube')?.length > 0 && (
                                                            <div className="mt-4">
                                                                <p className="text-xs text-slate-500 mb-3">🎬 YouTube Tutorials:</p>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                    {milestone.resources.filter(r => r.type === 'youtube').map((video, i) => (
                                                                        <a
                                                                            key={i}
                                                                            href={video.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="group relative block rounded-lg overflow-hidden bg-slate-800 hover:bg-slate-700 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20"
                                                                        >
                                                                            {/* Thumbnail */}
                                                                            <div className="relative aspect-video">
                                                                                <img
                                                                                    src={video.thumbnail}
                                                                                    alt={video.title}
                                                                                    className="w-full h-full object-cover"
                                                                                    loading="lazy"
                                                                                />
                                                                                {/* Play Button Overlay */}
                                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                                                                                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                                                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                                                            <path d="M8 5v14l11-7z" />
                                                                                        </svg>
                                                                                    </div>
                                                                                </div>
                                                                                {/* Duration Badge */}
                                                                                <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                                                                                    {video.duration}
                                                                                </span>
                                                                            </div>

                                                                            {/* Video Info */}
                                                                            <div className="p-3">
                                                                                <h5 className="text-sm font-medium text-white line-clamp-2 group-hover:text-cyan-300 transition-colors">
                                                                                    {video.title}
                                                                                </h5>
                                                                                <div className="flex items-center justify-between mt-2">
                                                                                    <span className="text-xs text-slate-400">{video.provider}</span>
                                                                                    <span className="text-xs text-slate-500">{video.views} views</span>
                                                                                </div>
                                                                            </div>
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <span className="text-sm text-slate-500 ml-4">
                                                        {milestone.estimatedTime}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Bottom Actions */}
                <div className="flex justify-center gap-4 mt-12">
                    <Link to="/dashboard" className="btn-secondary px-8 py-3">
                        📊 Dashboard
                    </Link>
                    <Link to="/upload" className="btn-primary px-8 py-3">
                        📄 New Analysis
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default RoadmapPage
