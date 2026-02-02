/**
 * DashboardPage Component
 * User dashboard with stats, recent activity, and quick actions
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useAnalysis } from '../hooks/useAnalysis'
import { useRoadmap } from '../hooks/useRoadmap'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

function DashboardPage() {
    const { user } = useAuth()
    const { getHistory, history, getStats, stats: analysisStats, loading: loadingAnalysis } = useAnalysis()
    const { getSavedRoadmaps, roadmaps, getStats: getRoadmapStats, stats: roadmapStats, loading: loadingRoadmap } = useRoadmap()

    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        getHistory({ limit: 5 })
        getStats()
        getSavedRoadmaps({ limit: 5 })
        getRoadmapStats()
    }, [])

    const loading = loadingAnalysis || loadingRoadmap

    const quickStats = [
        {
            label: 'Analyses',
            value: analysisStats?.totalAnalyses || history.length || 0,
            icon: '📊',
            color: 'text-cyan-400',
        },
        {
            label: 'Avg Match',
            value: `${analysisStats?.averageScore || 0}%`,
            icon: '🎯',
            color: 'text-green-400',
        },
        {
            label: 'Roadmaps',
            value: roadmapStats?.totalRoadmaps || roadmaps.length || 0,
            icon: '🗺️',
            color: 'text-purple-400',
        },
        {
            label: 'Skills Learned',
            value: roadmapStats?.completedMilestones || 0,
            icon: '✨',
            color: 'text-amber-400',
        },
    ]

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
            <Navbar />

            <main className="flex-1 container mx-auto px-6 py-12">
                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'User'}</span>!
                        </h1>
                        <p className="text-slate-400">Track your skill development journey</p>
                    </div>

                    <Link to="/upload" className="btn-primary mt-4 md:mt-0">
                        📄 New Analysis
                    </Link>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {quickStats.map((stat, i) => (
                        <div key={i} className="card p-6 text-center">
                            <span className="text-3xl mb-2 block">{stat.icon}</span>
                            <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                            <div className="text-sm text-slate-400">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex mb-6">
                    <div className="inline-flex bg-slate-800/50 rounded-lg p-1">
                        {['overview', 'analyses', 'roadmaps'].map(tab => (
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
                {loading ? (
                    <div className="card p-12 text-center">
                        <div className="animate-spin w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-slate-400">Loading data...</p>
                    </div>
                ) : (
                    <>
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Recent Analyses */}
                                <div className="card p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold">Recent Analyses</h3>
                                        <Link to="/history" className="text-sm text-cyan-400 hover:text-cyan-300">
                                            View all →
                                        </Link>
                                    </div>

                                    {history.length > 0 ? (
                                        <div className="space-y-3">
                                            {history.slice(0, 3).map((analysis, i) => (
                                                <Link
                                                    key={i}
                                                    to={`/results/${analysis._id}`}
                                                    className="block p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">
                                                                {analysis.targetRole?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                            </p>
                                                            <p className="text-sm text-slate-400">
                                                                {new Date(analysis.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className={`
                                                            text-lg font-bold
                                                            ${analysis.matchScore >= 70 ? 'text-green-400' :
                                                                analysis.matchScore >= 40 ? 'text-amber-400' : 'text-red-400'}
                                                        `}>
                                                            {analysis.matchScore}%
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-slate-400 mb-4">No analyses yet</p>
                                            <Link to="/upload" className="btn-secondary text-sm">
                                                Upload Resume
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Active Roadmaps */}
                                <div className="card p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold">Active Roadmaps</h3>
                                        <Link to="/roadmaps" className="text-sm text-cyan-400 hover:text-cyan-300">
                                            View all →
                                        </Link>
                                    </div>

                                    {roadmaps.length > 0 ? (
                                        <div className="space-y-3">
                                            {roadmaps.slice(0, 3).map((roadmap, i) => {
                                                const progress = roadmap.progress || 0
                                                return (
                                                    <Link
                                                        key={i}
                                                        to={`/roadmap/${roadmap._id}`}
                                                        className="block p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <p className="font-medium">
                                                                {roadmap.targetRole?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                            </p>
                                                            <span className="text-sm text-slate-400">{progress}%</span>
                                                        </div>
                                                        <div className="w-full bg-slate-700 rounded-full h-2">
                                                            <div
                                                                className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
                                                                style={{ width: `${progress}%` }}
                                                            ></div>
                                                        </div>
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-slate-400 mb-4">No roadmaps yet</p>
                                            <Link to="/upload" className="btn-secondary text-sm">
                                                Get Started
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Quick Actions */}
                                <div className="md:col-span-2 card p-6">
                                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <Link to="/upload" className="p-4 bg-slate-800/50 rounded-lg text-center hover:bg-slate-700/50 transition-colors">
                                            <span className="text-2xl block mb-2">📄</span>
                                            <span className="text-sm">Upload Resume</span>
                                        </Link>
                                        <Link to="/history" className="p-4 bg-slate-800/50 rounded-lg text-center hover:bg-slate-700/50 transition-colors">
                                            <span className="text-2xl block mb-2">📊</span>
                                            <span className="text-sm">View History</span>
                                        </Link>
                                        <Link to="/roadmaps" className="p-4 bg-slate-800/50 rounded-lg text-center hover:bg-slate-700/50 transition-colors">
                                            <span className="text-2xl block mb-2">🗺️</span>
                                            <span className="text-sm">My Roadmaps</span>
                                        </Link>
                                        <Link to="/profile" className="p-4 bg-slate-800/50 rounded-lg text-center hover:bg-slate-700/50 transition-colors">
                                            <span className="text-2xl block mb-2">⚙️</span>
                                            <span className="text-sm">Settings</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Analyses Tab */}
                        {activeTab === 'analyses' && (
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold mb-4">All Analyses</h3>
                                {history.length > 0 ? (
                                    <div className="space-y-3">
                                        {history.map((analysis, i) => (
                                            <Link
                                                key={i}
                                                to={`/results/${analysis._id}`}
                                                className="block p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">
                                                            {analysis.targetRole?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </p>
                                                        <p className="text-sm text-slate-400">
                                                            {new Date(analysis.createdAt).toLocaleDateString()} •
                                                            {analysis.matchedSkills?.length || 0} matched •
                                                            {analysis.gapSkills?.length || 0} gaps
                                                        </p>
                                                    </div>
                                                    <div className={`
                                                        text-2xl font-bold
                                                        ${analysis.matchScore >= 70 ? 'text-green-400' :
                                                            analysis.matchScore >= 40 ? 'text-amber-400' : 'text-red-400'}
                                                    `}>
                                                        {analysis.matchScore}%
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-slate-400 mb-4">No analyses found</p>
                                        <Link to="/upload" className="btn-primary">
                                            Upload Your First Resume
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Roadmaps Tab */}
                        {activeTab === 'roadmaps' && (
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold mb-4">All Roadmaps</h3>
                                {roadmaps.length > 0 ? (
                                    <div className="space-y-3">
                                        {roadmaps.map((roadmap, i) => {
                                            const progress = roadmap.progress || 0
                                            return (
                                                <Link
                                                    key={i}
                                                    to={`/roadmap/${roadmap._id}`}
                                                    className="block p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div>
                                                            <p className="font-medium">
                                                                {roadmap.targetRole?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                            </p>
                                                            <p className="text-sm text-slate-400">
                                                                {roadmap.phases?.length || 0} phases • {roadmap.totalEstimatedTime}
                                                            </p>
                                                        </div>
                                                        <span className={`
                                                            px-3 py-1 rounded-full text-sm
                                                            ${roadmap.status === 'in_progress' ? 'bg-cyan-500/20 text-cyan-400' :
                                                                roadmap.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                                    'bg-slate-700 text-slate-400'}
                                                        `}>
                                                            {roadmap.status?.replace('_', ' ') || 'draft'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                                                            <div
                                                                className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
                                                                style={{ width: `${progress}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm text-slate-400 w-12">{progress}%</span>
                                                    </div>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-slate-400 mb-4">No roadmaps found</p>
                                        <Link to="/upload" className="btn-primary">
                                            Create Your First Roadmap
                                        </Link>
                                    </div>
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
