/**
 * RegisterPage Component
 * User registration with backend integration
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

function RegisterPage() {
    const navigate = useNavigate()
    const { register, loading, error, clearError } = useAuth()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        currentRole: '',
        targetRole: '',
    })
    const [formError, setFormError] = useState('')

    const roles = [
        { id: 'frontend-developer', label: 'Frontend Developer' },
        { id: 'backend-developer', label: 'Backend Developer' },
        { id: 'fullstack-developer', label: 'Full Stack Developer' },
        { id: 'data-scientist', label: 'Data Scientist' },
        { id: 'devops-engineer', label: 'DevOps Engineer' },
        { id: 'ml-engineer', label: 'ML Engineer' },
        { id: 'product-manager', label: 'Product Manager' },
        { id: 'other', label: 'Other' },
    ]

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setFormError('')
        clearError()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setFormError('')

        // Validation
        if (!formData.name || !formData.email || !formData.password) {
            setFormError('Please fill in all required fields')
            return
        }

        if (formData.password.length < 8) {
            setFormError('Password must be at least 8 characters')
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setFormError('Passwords do not match')
            return
        }

        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                currentRole: formData.currentRole,
                targetRole: formData.targetRole,
            })
            navigate('/dashboard')
        } catch (err) {
            setFormError(err.message || 'Registration failed. Please try again.')
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <div className="card p-8">
                        <h1 className="text-3xl font-bold text-center mb-2">
                            Create Account
                        </h1>
                        <p className="text-slate-400 text-center mb-8">
                            Start your skill development journey
                        </p>

                        {(formError || error) && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
                                {formError || error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-white placeholder-slate-500"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-white placeholder-slate-500"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                        Password *
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-white placeholder-slate-500"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                                        Confirm *
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-white placeholder-slate-500"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="currentRole" className="block text-sm font-medium text-slate-300 mb-2">
                                    Current Role (Optional)
                                </label>
                                <select
                                    id="currentRole"
                                    name="currentRole"
                                    value={formData.currentRole}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-white"
                                >
                                    <option value="">Select your current role</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="targetRole" className="block text-sm font-medium text-slate-300 mb-2">
                                    Target Role (Optional)
                                </label>
                                <select
                                    id="targetRole"
                                    name="targetRole"
                                    value={formData.targetRole}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-white"
                                >
                                    <option value="">Select your target role</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.label}</option>
                                    ))}
                                </select>
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
                                        Creating account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-slate-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default RegisterPage
