/**
 * HomePage Component
 * Landing page with hero section and features
 */

import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

function HomePage() {
    const { isAuthenticated } = useAuth()

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <section className="flex-1 flex items-center justify-center px-6 py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-block px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-6">
                        <span className="text-cyan-400 text-sm font-medium">🚀 AI-Powered Career Analysis</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                        <span className="gradient-text">Bridge Your Skill Gap</span>
                        <br />
                        <span className="text-white">Land Your Dream Job</span>
                    </h1>

                    <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                        Upload your resume, discover missing skills for your target role, and get a personalized
                        learning roadmap powered by AI.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to={isAuthenticated ? '/upload' : '/register'}
                            className="btn-primary px-8 py-4 text-lg"
                        >
                            Get Started Free →
                        </Link>
                        <Link
                            to="#features"
                            className="btn-secondary px-8 py-4 text-lg"
                        >
                            Learn More
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-cyan-400">10K+</div>
                            <div className="text-sm text-slate-500">Resumes Analyzed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-400">50+</div>
                            <div className="text-sm text-slate-500">Job Roles</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-400">95%</div>
                            <div className="text-sm text-slate-500">Accuracy</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-slate-800/30">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        How It Works
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="card p-8 text-center">
                            <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl">📄</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Upload Resume</h3>
                            <p className="text-slate-400">
                                Simply upload your resume in PDF, DOC, or TXT format. Our AI will parse it instantly.
                            </p>
                        </div>

                        <div className="card p-8 text-center">
                            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl">🎯</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Get Analysis</h3>
                            <p className="text-slate-400">
                                See your skill match score, identified gaps, and personalized recommendations.
                            </p>
                        </div>

                        <div className="card p-8 text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl">🗺️</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Follow Roadmap</h3>
                            <p className="text-slate-400">
                                Get a tailored learning path with curated resources to bridge your skill gaps.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-6">
                        Ready to Advance Your Career?
                    </h2>
                    <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                        Join thousands of professionals who have used SkillLens to identify and close their skill gaps.
                    </p>
                    <Link
                        to={isAuthenticated ? '/upload' : '/register'}
                        className="btn-primary px-8 py-4 text-lg inline-block"
                    >
                        Start Free Analysis
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    )
}

export default HomePage
