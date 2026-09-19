/**
 * LoginPage Component
 * Clean, secure authentication with backend integration
 */

import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { toast } from 'sonner'

function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { login, loading, error, clearError } = useAuth()

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
    const [showPassword, setShowPassword] = useState(false)
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

        if (!formData.email || !formData.password) {
            setFormError('Please enter your email and password')
            return
        }

        try {
            await login(formData.email, formData.password)
            toast.success('Signed in successfully')
            navigate(from, { replace: true })
        } catch (err) {
            const friendlyMessage = err.status === 401
                ? 'Invalid email or password. Please check your credentials.'
                : err.message || 'Unable to sign in. Please try again later.'
            setFormError(friendlyMessage)
            toast.error(friendlyMessage)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-background text-slate-100">
            <Navbar />

            <main className="flex-1 flex items-center justify-center px-4 py-16 relative">
                {/* Background Ambient */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="w-full max-w-md relative z-10">
                    <div className="bg-surface-elevated/90 border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
                        <div className="text-center space-y-1.5">
                            <h1 className="text-2xl font-bold tracking-tight text-white">
                                Welcome Back
                            </h1>
                            <p className="text-xs text-slate-400">
                                Sign in to access your analyses, skills matrix, and roadmaps
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
                                label="Email Address"
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                icon={Mail}
                                placeholder="name@domain.com"
                                autoComplete="email"
                                required
                            />

                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                icon={Lock}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                required
                                rightSlot={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-slate-400 hover:text-slate-200 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                }
                            />

                            <div className="flex items-center justify-between text-xs pt-1">
                                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-3.5 h-3.5 rounded border-white/20 bg-surface-overlay text-cyan-500 focus:ring-cyan-500/30 focus:ring-offset-0"
                                    />
                                    <span>Remember session</span>
                                </label>
                                <span className="text-cyan-400/80 hover:text-cyan-300 transition-colors cursor-pointer" onClick={() => toast.info('Password reset instructions will be sent to registered accounts.')}>
                                    Forgot password?
                                </span>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                size="md"
                                loading={loading}
                                loadingText="Signing in..."
                                icon={LogIn}
                                className="w-full mt-2"
                            >
                                Sign In
                            </Button>
                        </form>

                        <div className="pt-4 border-t border-white/5 text-center text-xs text-slate-400">
                            Don't have an account yet?{' '}
                            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1">
                                Create account <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default LoginPage
