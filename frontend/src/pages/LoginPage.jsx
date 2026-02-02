/**
 * LoginPage Component
 * User login with backend authentication
 */

import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { login, loading, error, clearError } = useAuth()

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
    const [formError, setFormError] = useState('')

    const from = location.state?.from?.pathname || '/dashboard'

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setFormError('')
        clearError()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setFormError('')

        // Basic validation
        if (!formData.email || !formData.password) {
            setFormError('Please fill in all fields')
            return
        }

        try {
            await login(formData.email, formData.password)
            navigate(from, { replace: true })
        } catch (err) {
            setFormError(err.message || 'Login failed. Please check your credentials.')
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <div className="card p-8">
                        <h1 className="text-3xl font-bold text-center mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-slate-400 text-center mb-8">
                            Sign in to continue to SkillLens
                        </p>

                        {(formError || error) && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
                                {formError || error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-white placeholder-slate-500"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-white placeholder-slate-500"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                                    />
                                    <span className="ml-2 text-sm text-slate-400">Remember me</span>
                                </label>
                                <Link to="/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300">
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-3 flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-slate-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium">
                                Sign up free
                            </Link>
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default LoginPage
