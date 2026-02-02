/**
 * ResultPage Component
 * Displays skill gap analysis results
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAnalysis } from '../hooks/useAnalysis'
import { useRoadmap } from '../hooks/useRoadmap'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

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
            // Handle both response.roadmap._id and response.roadmap.id
            const roadmapId = response?.roadmap?._id || response?.roadmap?.id || response?._id
            if (roadmapId) {
                navigate(`/roadmap/${roadmapId}`)
            } else {
                setRoadmapError('Roadmap was generated but no ID was returned')
                console.error('Response structure:', response)
            }
        } catch (err) {
            console.error('Failed to generate roadmap:', err)
            setRoadmapError(err.message || 'Failed to generate roadmap. Please try again.')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-slate-400">Loading analysis results...</p>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    if (error || !analysis) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center card p-8 max-w-md">
                        <div className="text-6xl mb-4">❌</div>
                        <h2 className="text-2xl font-bold mb-2">Analysis Not Found</h2>
                        <p className="text-slate-400 mb-6">{error || 'The analysis you requested could not be found.'}</p>
                        <Link to="/upload" className="btn-primary">
                            Upload New Resume
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    const matchScore = analysis.overallMatchScore || analysis.matchScore || 0
    const matchedSkills = analysis.matchedSkills || []
    const gapSkills = analysis.gapSkills || []
    const skillsExtracted = analysis.extractedSkills || []

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
            <Navbar />

            <main className="flex-1 container mx-auto px-6 py-12">
                {/* Header with Score */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-6 gradient-text">
                        Analysis Results
                    </h1>

                    <div className="inline-flex items-center justify-center p-8 bg-slate-800/50 rounded-2xl border border-slate-700">
                        <div className="relative w-40 h-40">
                            {/* Circular Progress */}
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="80" cy="80" r="70"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="none"
                                    className="text-slate-700"
                                />
                                <circle
                                    cx="80" cy="80" r="70"
                                    stroke="url(#scoreGradient)"
                                    strokeWidth="12"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray={440}
                                    strokeDashoffset={440 - (440 * matchScore) / 100}
                                    className="transition-all duration-1000"
                                />
                                <defs>
                                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#06b6d4" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold">{matchScore}%</span>
                                <span className="text-sm text-slate-400">Match</span>
                            </div>
                        </div>

                        <div className="ml-8 text-left">
                            <p className="text-lg text-slate-300 mb-2">
                                Target: <span className="font-semibold text-white">{analysis.targetRole?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                            </p>
                            <p className="text-slate-400">
                                {matchedSkills.length} matched • {gapSkills.length} gaps identified
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex bg-slate-800/50 rounded-lg p-1">
                        {['overview', 'matched', 'gaps', 'extracted'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                                    px-6 py-2 rounded-lg font-medium transition-all capitalize
                                    ${activeTab === tab
                                        ? 'bg-cyan-500 text-white'
                                        : 'text-slate-400 hover:text-white'
                                    }
                                `}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="max-w-4xl mx-auto">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="card p-6 text-center">
                                <div className="text-4xl font-bold text-green-400 mb-2">{matchedSkills.length}</div>
                                <div className="text-slate-400">Skills Matched</div>
                            </div>
                            <div className="card p-6 text-center">
                                <div className="text-4xl font-bold text-amber-400 mb-2">{gapSkills.length}</div>
                                <div className="text-slate-400">Skill Gaps</div>
                            </div>
                            <div className="card p-6 text-center">
                                <div className="text-4xl font-bold text-cyan-400 mb-2">{skillsExtracted.length}</div>
                                <div className="text-slate-400">Skills Found</div>
                            </div>

                            <div className="md:col-span-3 card p-6">
                                <h3 className="text-xl font-semibold mb-4">💡 Recommendations</h3>
                                {analysis.recommendations?.length > 0 ? (
                                    <ul className="space-y-3">
                                        {analysis.recommendations.slice(0, 5).map((rec, i) => (
                                            <li key={i} className="flex items-start">
                                                <span className="text-cyan-400 mr-3">→</span>
                                                <span className="text-slate-300">
                                                    {typeof rec === 'string' ? rec : rec.reason || `Learn ${rec.skill}`}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-slate-400">Great job! Your skills match well with the target role.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Matched Skills Tab */}
                    {activeTab === 'matched' && (
                        <div className="card p-6">
                            <h3 className="text-xl font-semibold mb-6 flex items-center">
                                <span className="text-2xl mr-3">✅</span>
                                Skills You Have ({matchedSkills.length})
                            </h3>
                            {matchedSkills.length > 0 ? (
                                <div className="flex flex-wrap gap-3">
                                    {matchedSkills.map((skill, i) => (
                                        <span key={i} className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30">
                                            {typeof skill === 'string' ? skill : skill.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-400">No matching skills found for this role.</p>
                            )}
                        </div>
                    )}

                    {/* Gap Skills Tab */}
                    {activeTab === 'gaps' && (
                        <div className="card p-6">
                            <h3 className="text-xl font-semibold mb-6 flex items-center">
                                <span className="text-2xl mr-3">🎯</span>
                                Skills to Learn ({gapSkills.length})
                            </h3>
                            {gapSkills.length > 0 ? (
                                <div className="flex flex-wrap gap-3">
                                    {gapSkills.map((skill, i) => (
                                        <span key={i} className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
                                            {typeof skill === 'string' ? skill : skill.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-400">No skill gaps identified. You're ready for this role!</p>
                            )}
                        </div>
                    )}

                    {/* Extracted Skills Tab */}
                    {activeTab === 'extracted' && (
                        <div className="card p-6">
                            <h3 className="text-xl font-semibold mb-6 flex items-center">
                                <span className="text-2xl mr-3">📋</span>
                                All Extracted Skills ({skillsExtracted.length})
                            </h3>
                            {skillsExtracted.length > 0 ? (
                                <div className="flex flex-wrap gap-3">
                                    {skillsExtracted.map((skill, i) => (
                                        <span key={i} className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg">
                                            {typeof skill === 'string' ? skill : skill.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-400">No skills were extracted from your resume.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                {/* Error Display */}
                {roadmapError && (
                    <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
                        <p className="text-red-400 text-center">
                            ⚠️ {roadmapError}
                        </p>
                    </div>
                )}

                <div className="flex justify-center gap-4 mt-12">
                    <Link to="/upload" className="btn-secondary px-8 py-3">
                        📄 New Analysis
                    </Link>
                    <button
                        onClick={handleGenerateRoadmap}
                        disabled={generating || gapSkills.length === 0}
                        className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {generating ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </>
                        ) : (
                            '🗺️ Generate Learning Roadmap'
                        )}
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default ResultPage
