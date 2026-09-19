/**
 * ResultPage Component
 * Intelligence report showcasing skill match score, gap analysis, and roadmap trigger
 */

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
    ScanSearch,
    Map,
    CheckCircle2,
    AlertCircle,
    Layers,
    Sparkles,
    FileText,
    ArrowRight,
    Compass,
    TrendingUp,
    FolderSearch,
    ExternalLink
} from 'lucide-react'
import { useAnalysis } from '../hooks/useAnalysis'
import { useRoadmap } from '../hooks/useRoadmap'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import MatchScore from '../components/ui/MatchScore'
import SkillBadge from '../components/ui/SkillBadge'
import Loading from '../components/ui/Loading'
import ErrorState from '../components/ui/ErrorState'
import { toast } from 'sonner'

function ResultPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { getAnalysis, analysis, loading, error } = useAnalysis()
    const { generateRoadmap, generating } = useRoadmap()
    const [activeTab, setActiveTab] = useState('overview')
    const [roadmapError, setRoadmapError] = useState(null)

    useEffect(() => {
        if (id) {
            getAnalysis(id)
        }
    }, [id, getAnalysis])

    const handleGenerateRoadmap = async () => {
        setRoadmapError(null)
        try {
            const response = await generateRoadmap(id)
            const roadmapId = response?.roadmap?._id || response?.roadmap?.id || response?._id
            if (roadmapId) {
                toast.success('Learning roadmap synthesized!')
                navigate(`/roadmap/${roadmapId}`)
            } else {
                setRoadmapError('Roadmap was generated but no ID was returned from server.')
                toast.error('Roadmap generated without an ID.')
            }
        } catch (err) {
            const msg = err.message || 'Failed to generate roadmap. Please try again.'
            setRoadmapError(msg)
            toast.error(msg)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-background text-slate-100">
                <Navbar />
                <main className="flex-1 flex items-center justify-center p-6">
                    <Loading size="lg" text="Retrieving career analysis results..." />
                </main>
                <Footer />
            </div>
        )
    }

    if (error || !analysis) {
        return (
            <div className="min-h-screen flex flex-col bg-background text-slate-100">
                <Navbar />
                <main className="flex-1 flex items-center justify-center p-6">
                    <ErrorState
                        title="Analysis Report Not Found"
                        message={error || 'The requested resume analysis could not be located.'}
                        secondaryAction={
                            <Link to="/upload">
                                <Button size="sm" icon={ScanSearch}>
                                    Upload New Resume
                                </Button>
                            </Link>
                        }
                    />
                </main>
                <Footer />
            </div>
        )
    }

    const matchScore = analysis.overallMatchScore ?? analysis.matchScore ?? 0
    const matchedSkills = analysis.matchedSkills || []
    const gapSkills = analysis.gapSkills || []
    const extractedSkills = analysis.extractedSkills || []
    const recommendations = analysis.recommendations || []
    const roleTitle = analysis.targetRoleLabel || (analysis.targetRole ? analysis.targetRole.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Target Role')

    // Group skills by category if available
    const categoryGroups = {}
    matchedSkills.forEach(s => {
        const cat = typeof s === 'object' && s.category ? s.category : 'General'
        if (!categoryGroups[cat]) categoryGroups[cat] = { matched: [], gaps: [] }
        categoryGroups[cat].matched.push(typeof s === 'string' ? s : s.name)
    })
    gapSkills.forEach(s => {
        const cat = typeof s === 'object' && s.category ? s.category : 'General'
        if (!categoryGroups[cat]) categoryGroups[cat] = { matched: [], gaps: [] }
        categoryGroups[cat].gaps.push(typeof s === 'string' ? s : s.name)
    })

    const tabs = [
        { id: 'overview', label: 'Overview', count: null },
        { id: 'matched', label: 'Matched Skills', count: matchedSkills.length },
        { id: 'gaps', label: 'Skill Gaps', count: gapSkills.length },
        { id: 'extracted', label: 'All Extracted', count: extractedSkills.length },
    ]

    return (
        <div className="min-h-screen flex flex-col bg-background text-slate-100">
            <Navbar />

            <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8">
                {/* Hero Card with Match Score */}
                <div className="p-6 sm:p-10 rounded-3xl bg-surface-elevated/90 border border-white/10 shadow-card">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        {/* Radial Gauge */}
                        <div className="lg:col-span-4 flex justify-center">
                            <MatchScore
                                score={matchScore}
                                size={160}
                                strokeWidth={12}
                                subtitle={`${matchScore}% Role Match`}
                            />
                        </div>

                        {/* Summary & Meta */}
                        <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
                            <div className="space-y-1">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-medium">
                                    <Compass className="w-3.5 h-3.5" />
                                    <span>Benchmark: {roleTitle}</span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                                    Analysis & Competency Assessment
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-400">
                                    Document: <span className="text-slate-200">{analysis.resumeFileName || 'Resume.pdf'}</span>
                                    {analysis.createdAt && (
                                        <span> • Analyzed on {new Date(analysis.createdAt).toLocaleDateString()}</span>
                                    )}
                                </p>
                            </div>

                            {/* Key Stats Bar */}
                            <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg mx-auto lg:mx-0">
                                <div className="p-3.5 rounded-2xl bg-surface-overlay border border-white/5 text-center lg:text-left">
                                    <div className="text-xs text-slate-400">Matched</div>
                                    <div className="text-xl font-bold text-emerald-400 font-numbers">{matchedSkills.length}</div>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-surface-overlay border border-white/5 text-center lg:text-left">
                                    <div className="text-xs text-slate-400">Gaps</div>
                                    <div className="text-xl font-bold text-amber-400 font-numbers">{gapSkills.length}</div>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-surface-overlay border border-white/5 text-center lg:text-left">
                                    <div className="text-xs text-slate-400">Extracted</div>
                                    <div className="text-xl font-bold text-cyan-400 font-numbers">{extractedSkills.length}</div>
                                </div>
                            </div>

                            {/* Action CTA */}
                            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                                <Button
                                    variant="primary"
                                    onClick={handleGenerateRoadmap}
                                    loading={generating}
                                    loadingText="Synthesizing Roadmap..."
                                    icon={Map}
                                    disabled={generating}
                                >
                                    Generate Learning Roadmap
                                </Button>
                                <Link to="/upload">
                                    <Button variant="secondary" icon={ScanSearch}>
                                        New Analysis
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {roadmapError && (
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-3">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                        <span>{roadmapError}</span>
                    </div>
                )}

                {/* Tabs Navigation */}
                <div className="flex items-center justify-center sm:justify-start border-b border-white/10 pb-px gap-2 overflow-x-auto">
                    {tabs.map((tab) => {
                        const isCurrent = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center gap-2 select-none shrink-0 ${
                                    isCurrent
                                        ? 'bg-white/10 text-white shadow-sm border border-white/10'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <span>{tab.label}</span>
                                {tab.count !== null && (
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                        isCurrent ? 'bg-cyan-500/20 text-cyan-300' : 'bg-surface-overlay text-slate-500'
                                    }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Tab 1: Overview */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Recommendations */}
                        <div className="p-6 sm:p-8 rounded-3xl bg-surface-elevated border border-white/10 space-y-4">
                            <h3 className="text-base font-semibold text-white flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-cyan-400" />
                                Priority Recommendations
                            </h3>
                            {recommendations.length > 0 ? (
                                <div className="space-y-3">
                                    {recommendations.map((rec, i) => {
                                        const skillName = typeof rec === 'string' ? rec : rec.skill
                                        const reason = typeof rec === 'string' ? null : rec.reason
                                        const priority = typeof rec === 'string' ? 'medium' : rec.priority || 'medium'
                                        return (
                                            <div
                                                key={i}
                                                className="p-4 rounded-2xl bg-surface-overlay/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-semibold text-white">{skillName}</span>
                                                        <Badge
                                                            variant={priority === 'high' ? 'destructive' : priority === 'medium' ? 'warning' : 'info'}
                                                            size="sm"
                                                        >
                                                            {priority} priority
                                                        </Badge>
                                                    </div>
                                                    {reason && (
                                                        <p className="text-xs text-slate-400">{reason}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400">
                                    Your skills strongly align with this target role. Review your roadmaps to refine advanced proficiencies.
                                </p>
                            )}
                        </div>

                        {/* Category Matrix */}
                        {Object.keys(categoryGroups).length > 0 && (
                            <div className="p-6 sm:p-8 rounded-3xl bg-surface-elevated border border-white/10 space-y-4">
                                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-emerald-400" />
                                    Categorized Skill Alignment
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(categoryGroups).map(([cat, data]) => (
                                        <div key={cat} className="p-4 rounded-2xl bg-surface-overlay/60 border border-white/5 space-y-3">
                                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                                <span className="text-xs font-semibold text-slate-200 capitalize">{cat.replace('_', ' ')}</span>
                                                <span className="text-[11px] text-slate-400 font-numbers">
                                                    {data.matched.length} matched / {data.gaps.length} gaps
                                                </span>
                                            </div>
                                            {data.matched.length > 0 && (
                                                <div>
                                                    <span className="text-[11px] text-slate-400 font-medium block mb-1.5">Matched:</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {data.matched.map(s => <SkillBadge key={s} skill={s} type="matched" />)}
                                                    </div>
                                                </div>
                                            )}
                                            {data.gaps.length > 0 && (
                                                <div className="pt-1">
                                                    <span className="text-[11px] text-slate-400 font-medium block mb-1.5">Gaps to develop:</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {data.gaps.map(s => <SkillBadge key={s} skill={s} type="gap" />)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 2: Matched Skills */}
                {activeTab === 'matched' && (
                    <div className="p-6 sm:p-8 rounded-3xl bg-surface-elevated border border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-white flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                Skills You Already Possess ({matchedSkills.length})
                            </h3>
                        </div>
                        <p className="text-xs text-slate-400">
                            These competencies were detected in your resume and meet standard requirements for {roleTitle}.
                        </p>
                        {matchedSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {matchedSkills.map((skill, i) => (
                                    <SkillBadge
                                        key={i}
                                        skill={skill}
                                        type="matched"
                                        showLevel={true}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 py-6 text-center">No matching skills detected for this specific target role.</p>
                        )}
                    </div>
                )}

                {/* Tab 3: Skill Gaps */}
                {activeTab === 'gaps' && (
                    <div className="p-6 sm:p-8 rounded-3xl bg-surface-elevated border border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-white flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-400" />
                                Target Competency Gaps ({gapSkills.length})
                            </h3>
                        </div>
                        <p className="text-xs text-slate-400">
                            These skills are required for {roleTitle} but were not identified in your resume. Prioritize these in your learning roadmap.
                        </p>
                        {gapSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {gapSkills.map((skill, i) => (
                                    <SkillBadge
                                        key={i}
                                        skill={skill}
                                        type="gap"
                                        showLevel={true}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center space-y-2">
                                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                                <h4 className="text-sm font-semibold text-white">Full Role Alignment!</h4>
                                <p className="text-xs text-slate-400">No competency gaps were identified for this role.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 4: All Extracted */}
                {activeTab === 'extracted' && (
                    <div className="p-6 sm:p-8 rounded-3xl bg-surface-elevated border border-white/10 space-y-4">
                        <h3 className="text-base font-semibold text-white flex items-center gap-2">
                            <Layers className="w-4 h-4 text-cyan-400" />
                            All Extracted Resume Skills ({extractedSkills.length})
                        </h3>
                        <p className="text-xs text-slate-400">
                            Complete technical inventory parsed from your resume across all domains.
                        </p>
                        {extractedSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {extractedSkills.map((skill, i) => (
                                    <SkillBadge
                                        key={i}
                                        skill={skill}
                                        type="extracted"
                                        showLevel={true}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 py-6 text-center">No skills were extracted from the document.</p>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}

export default ResultPage
