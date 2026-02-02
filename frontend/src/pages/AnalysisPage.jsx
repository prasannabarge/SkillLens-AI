/**
 * AnalysisPage Component
 * Displays skill analysis results and skill gap visualization
 * Features: Skill comparison chart, gap analysis, recommendations
 */

import Navbar from '../components/layout/Navbar'

function AnalysisPage() {
    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="container mx-auto px-6 py-12">
                <h1 className="text-4xl font-bold text-center mb-8">
                    Skill Analysis Results
                </h1>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Your Skills Card */}
                    <div className="card p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-primary-400">
                            Your Skills
                        </h2>
                        {/* Skill list will be populated from API */}
                        <p className="text-slate-400">
                            Skills extracted from your resume will appear here.
                        </p>
                    </div>

                    {/* Required Skills Card */}
                    <div className="card p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-accent-400">
                            Required Skills
                        </h2>
                        {/* Required skills for target role */}
                        <p className="text-slate-400">
                            Skills required for your target role will appear here.
                        </p>
                    </div>
                </div>

                {/* Skill Gap Visualization */}
                <div className="card p-8 mt-8">
                    <h2 className="text-2xl font-semibold mb-6">Skill Gap Analysis</h2>
                    {/* Chart component will go here - using recharts */}
                    <div className="h-64 flex items-center justify-center text-slate-500">
                        Skill gap visualization chart will be rendered here
                    </div>
                </div>

                {/* Action Button */}
                <div className="text-center mt-8">
                    <a href="/roadmap" className="btn-primary">
                        Generate Learning Roadmap
                    </a>
                </div>
            </main>
        </div>
    )
}

export default AnalysisPage
