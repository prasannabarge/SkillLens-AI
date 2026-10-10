/**
 * RegisterPage Component
 * Seamless user account onboarding with career role targets
 */

import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, Briefcase, Compass, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { JOB_ROLES } from '../utils/constants'
import { getSafeRedirectUrl, handleAuthCancellation } from '../utils/navigation'
import { toast } from 'sonner'

function RegisterPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { register, loading, error, clearError, isAuthenticated } = useAuth()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        currentRole: '',
        targetRole: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [formError, setFormError] = useState('')

    const safeFrom = getSafeRedirectUrl(location.state?.from, '/dashboard')

    // Redirect already authenticated users away from the register page
    useEffect(() => {
        if (!loading && isAuthenticated) {
            navigate(safeFrom, { replace: true })
        }
    }, [isAuthenticated, loading, navigate, safeFrom])

    const handleCancel = () => {
        handleAuthCancellation(navigate, location, '/')
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setFormError('')
        clearError()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setFormError('')

        if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
            setFormError('Please fill in all required fields.')
            return
        }

        if (formData.password.length < 8) {
            setFormError('Password must be at least 8 characters long.')
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setFormError('Passwords do not match.')
            return
        }

        try {
            await register({
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
                currentRole: formData.currentRole,
                targetRole: formData.targetRole,
            })
            toast.success('Account created successfully!')
            navigate(safeFrom, { replace: true })
        } catch (err) {
            const msg = err.message || 'Registration failed. Please check your information and try again.'
            setFormError(msg)
            toast.error(msg)
        }
    }

    const isPasswordLongEnough = formData.password.length >= 8
    const doPasswordsMatch = formData.password && formData.password === formData.confirmPassword

    return (
        <div className="min-h-screen flex flex-col bg-background text-slate-100">
            <Navbar />

            <main className="flex-1 flex items-center justify-center px-4 py-16 relative">
                {/* Background Ambient */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="w-full max-w-lg relative z-10">
                    {/* In-app Back Navigation Link */}
                    <button
                        id="btn-register-back"
                        type="button"
                        onClick={handleCancel}
                        className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors group mb-3 select-none"
                        aria-label="Back to application"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Application</span>
                    </button>

                    <div className="bg-surface-elevated/90 border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
                        <div className="text-center space-y-1.5">
                            <h1 className="text-2xl font-bold tracking-tight text-white">
                                Create Your Account
                            </h1>
                            <p className="text-xs text-slate-400">
                                Begin assessing your technical competencies and building career roadmaps
                            </p>
                        </div>

                        {(formError || error) && (
                            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2.5 animate-in fade-in duration-150">
                                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                                <span>{formError || error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Full Name"
                                name="name"
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                icon={User}
                                placeholder="Alex Mercer"
                                autoComplete="name"
                                required
                            />

                            <Input
                                label="Email Address"
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                icon={Mail}
                                placeholder="alex@domain.com"
                                autoComplete="email"
                                required
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    id="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    icon={Lock}
                                    placeholder="Min 8 characters"
                                    autoComplete="new-password"
                                    required
                                    rightSlot={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-slate-400 hover:text-slate-200 transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                    }
                                />

                                <Input
                                    label="Confirm Password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    id="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    icon={Lock}
                                    placeholder="Re-enter password"
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            {/* Password hints */}
                            {formData.password && (
                                <div className="flex items-center gap-4 text-[11px] text-slate-400 px-1">
                                    <span className={`flex items-center gap-1 ${isPasswordLongEnough ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        <CheckCircle2 className="w-3 h-3" /> 8+ characters
                                    </span>
                                    {formData.confirmPassword && (
                                        <span className={`flex items-center gap-1 ${doPasswordsMatch ? 'text-emerald-400' : 'text-amber-400'}`}>
                                            <CheckCircle2 className="w-3 h-3" /> Passwords match
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                <div>
                                    <label htmlFor="currentRole" className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                        Current Role (Optional)
                                    </label>
                                    <select
                                        id="currentRole"
                                        name="currentRole"
                                        value={formData.currentRole}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 bg-surface-elevated border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all"
                                    >
                                        <option value="">Select current role</option>
                                        {JOB_ROLES.map(role => (
                                            <option key={role.id} value={role.id}>{role.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="targetRole" className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                                        <Compass className="w-3.5 h-3.5 text-cyan-400" />
                                        Target Role (Optional)
                                    </label>
                                    <select
                                        id="targetRole"
                                        name="targetRole"
                                        value={formData.targetRole}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 bg-surface-elevated border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all"
                                    >
                                        <option value="">Select target role</option>
                                        {JOB_ROLES.map(role => (
                                            <option key={role.id} value={role.id}>{role.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Action Buttons: Cancel and Register */}
                            <div className="flex items-center gap-3 pt-2">
                                <Button
                                    id="btn-register-cancel"
                                    type="button"
                                    variant="secondary"
                                    size="md"
                                    onClick={handleCancel}
                                    className="w-1/3"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    id="btn-register-submit"
                                    type="submit"
                                    variant="primary"
                                    size="md"
                                    loading={loading}
                                    loadingText="Creating account..."
                                    className="w-2/3"
                                >
                                    Register
                                </Button>
                            </div>
                        </form>

                        <div className="pt-4 border-t border-white/5 text-center text-xs text-slate-400">
                            Already have an account?{' '}
                            <Link to="/login" state={{ from: location.state?.from }} className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1">
                                Sign in <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default RegisterPage
