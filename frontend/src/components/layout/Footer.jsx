/**
 * Footer Component
 * Simple footer with links
 */

import { Link } from 'react-router-dom'

function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-slate-900/50 border-t border-slate-800 py-8">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🔍</span>
                        <span className="font-semibold gradient-text">SkillLens</span>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-slate-400">
                        <Link to="/" className="hover:text-white transition-colors">Home</Link>
                        <Link to="/upload" className="hover:text-white transition-colors">Analyze</Link>
                        <a href="#" className="hover:text-white transition-colors">About</a>
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                    </div>

                    <p className="text-sm text-slate-500">
                        © {currentYear} SkillLens. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
