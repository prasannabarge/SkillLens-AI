/**
 * UploadPage Component
 * Precision resume upload & real-time career skill analysis pipeline
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import {
    UploadCloud,
    FileText,
    CheckCircle2,
    AlertCircle,
    ScanSearch,
    Compass,
    X,
    ArrowRight,
    RotateCcw,
    Loader2,
    ShieldCheck,
    Clock,
    Sparkles
} from 'lucide-react'
import { useAnalysis } from '../hooks/useAnalysis'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Progress from '../components/ui/Progress'
import { JOB_ROLES, MAX_FILE_SIZE } from '../utils/constants'
import { formatFileSize } from '../utils/helpers'
import { toast } from 'sonner'

function UploadPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { isAuthenticated } = useAuth()
    const {
        analyzeResume,
        getRoles,
        roles: apiRoles,
        uploading,
        uploadProgress,
        error: hookError,
        clearError
    } = useAnalysis()

    const [file, setFile] = useState(null)
    const [targetRole, setTargetRole] = useState('')
    const [step, setStep] = useState(1) // 1: upload, 2: select role, 3: analyzing
    const [analysisError, setAnalysisError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [cooldownSeconds, setCooldownSeconds] = useState(0)
    const [elapsedTime, setElapsedTime] = useState(0)

    // Cooldown countdown timer effect
    useEffect(() => {
        if (cooldownSeconds <= 0) return
        const timer = setInterval(() => {
            setCooldownSeconds((prev) => (prev <= 1 ? 0 : prev - 1))
        }, 1000)
        return () => clearInterval(timer)
    }, [cooldownSeconds])

    // Elapsed time timer for Step 3 loading screen
    useEffect(() => {
        if (step !== 3) {
            setElapsedTime(0)
            return
        }
        const timer = setInterval(() => {
            setElapsedTime((prev) => prev + 1)
        }, 1000)
        return () => clearInterval(timer)
    }, [step])

    // Load available roles & preselect from query parameter if available
    useEffect(() => {
        getRoles()
        const queryRole = searchParams.get('role')
        if (queryRole) {
            setTargetRole(queryRole)
        }
    }, [getRoles, searchParams])

    const availableRoles = (apiRoles && apiRoles.length > 0) ? apiRoles : JOB_ROLES

    // Handle file drop & validation
    const onDrop = useCallback((acceptedFiles, fileRejections) => {
        if (uploading || isSubmitting) return
        setAnalysisError('')
        setCooldownSeconds(0)
        clearError()

        if (fileRejections && fileRejections.length > 0) {
            const rejection = fileRejections[0]
            if (rejection.errors.some(e => e.code === 'file-too-large')) {
                setAnalysisError('File size exceeds the 5MB limit. Please upload a smaller file.')
            } else if (rejection.errors.some(e => e.code === 'file-invalid-type')) {
                setAnalysisError('Unsupported format. Please upload a PDF, DOC, DOCX, or TXT file.')
            } else {
                setAnalysisError('Unable to accept this file. Please try again.')
            }
            return
        }

        if (acceptedFiles.length > 0) {
            const selected = acceptedFiles[0]
            if (selected.size > MAX_FILE_SIZE) {
                setAnalysisError('File size exceeds the 5MB limit.')
                return
            }
            setFile(selected)
            setStep(2)
        }
    }, [clearError, uploading, isSubmitting])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt'],
        },
        maxFiles: 1,
        maxSize: MAX_FILE_SIZE,
        disabled: uploading || isSubmitting,
    })

    // Handle submission to backend API
    const handleAnalyze = async () => {
        if (cooldownSeconds > 0) return
        if (!file || !targetRole) {
            setAnalysisError('Please choose a file and designate a target role.')
            return
        }

        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: '/upload' } } })
            return
        }

        if (uploading || isSubmitting || step === 3) {
            console.warn('Analysis submission already in progress, ignoring duplicate trigger.')
            return
        }

        setIsSubmitting(true)
        setStep(3)
        clearError()
        setAnalysisError('')

        try {
            const response = await analyzeResume(file, targetRole)
            if (!response) {
                return
            }
            const analysisId = response?.analysis?._id || response?.analysis?.id || response?._id
            toast.success('Resume analysis completed!')
            navigate(`/results/${analysisId}`)
        } catch (err) {
            let friendlyMsg = err.message || 'Analysis could not be completed at this time. Please try again.'
            let cooldownTime = 0

            if (err.status === 429) {
                friendlyMsg = err.message && err.message.toLowerCase().includes('ip')
                    ? err.message
                    : 'The AI analysis engine is warming up its neural models. To prevent server throttling, please allow the timer to finish before retrying.'
                cooldownTime = 25
            } else if (err.status === 409) {
                friendlyMsg = 'An analysis for this resume is already in progress. Please wait a moment.'
                cooldownTime = 15
            } else if (err.status === 504 || err.status === 503) {
                friendlyMsg = err.message || 'The AI analysis engine is currently warming up. Please wait a few moments and try again.'
                cooldownTime = 20
            }
            setAnalysisError(friendlyMsg)
            toast.error(friendlyMsg)
            if (cooldownTime > 0) {
                setCooldownSeconds(cooldownTime)
            }
            setStep(2)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReset = () => {
        if (uploading || isSubmitting) return
        setFile(null)
        setTargetRole('')
        setStep(1)
        setAnalysisError('')
        setCooldownSeconds(0)
        clearError()
    }

    const steps = [
        { num: 1, label: 'Upload Document' },
        { num: 2, label: 'Target Role' },
        { num: 3, label: 'AI Extraction' },
    ]

    return (
        <div className="min-h-screen flex flex-col bg-background text-slate-100">
            <Navbar />

            <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full">
                {/* Header */}
                <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Analyze Your Resume
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400">
                        Upload your technical resume to benchmark against modern engineering standards.
                    </p>
                </div>

                {/* Stepper Indicator */}
                <div className="flex items-center justify-center max-w-md mx-auto mb-10">
                    {steps.map((s, index) => {
                        const isCompleted = step > s.num
                        const isCurrent = step === s.num
                        return (
                            <React.Fragment key={s.num}>
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                                            isCompleted
                                                ? 'bg-emerald-500 text-white shadow-glow-accent'
                                                : isCurrent
                                                ? 'bg-cyan-500 text-white shadow-glow-cyan ring-4 ring-cyan-500/20'
                                                : 'bg-surface-overlay text-slate-500 border border-white/5'
                                        }`}
                                    >
                                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                                    </div>
                                    <span className={`text-[11px] mt-1.5 font-medium select-none ${isCurrent ? 'text-cyan-400' : 'text-slate-500'}`}>
                                        {s.label}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`flex-1 h-[2px] mx-3 -mt-4 transition-colors duration-200 ${
                                            step > s.num ? 'bg-emerald-500/80' : 'bg-white/10'
                                        }`}
                                    />
                                )}
                            </React.Fragment>
                        )
                    })}
                </div>

                {/* Error & Cooldown Notice Banner */}
                {(analysisError || hookError) && (
                    <div className={`max-w-xl mx-auto mb-6 p-4 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200 ${
                        cooldownSeconds > 0
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}>
                        <div className="flex items-start gap-3">
                            {cooldownSeconds > 0 ? (
                                <Clock className="w-4 h-4 shrink-0 text-amber-400 mt-0.5 animate-pulse" />
                            ) : (
                                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                            )}
                            <div>
                                <p className={`font-semibold ${cooldownSeconds > 0 ? 'text-amber-300' : 'text-rose-200'}`}>
                                    {cooldownSeconds > 0 ? 'AI Engine Warming Up (Notice)' : 'Analysis Notice'}
                                </p>
                                <p className="mt-0.5 leading-relaxed text-slate-300">
                                    {analysisError || hookError}
                                </p>
                                {cooldownSeconds > 0 && (
                                    <p className="mt-1 text-[11px] text-amber-300/80 font-medium flex items-center gap-1.5">
                                        <span>⏳</span>
                                        <span>Cooldown active to let models load. Please wait for the timer before retrying.</span>
                                    </p>
                                )}
                            </div>
                        </div>
                        {file && targetRole && (
                            <div className="shrink-0 self-end sm:self-center mt-2 sm:mt-0">
                                <button
                                    type="button"
                                    onClick={handleAnalyze}
                                    disabled={isSubmitting || uploading || cooldownSeconds > 0}
                                    className={`px-3.5 py-1.5 rounded-lg font-medium text-xs transition-all flex items-center gap-1.5 border select-none ${
                                        cooldownSeconds > 0
                                            ? 'bg-amber-500/15 border-amber-500/30 text-amber-300/70 cursor-not-allowed opacity-80'
                                            : 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/40 text-cyan-200 shadow-glow-cyan-sm cursor-pointer'
                                    }`}
                                >
                                    {cooldownSeconds > 0 ? (
                                        <>
                                            <Clock className="w-3.5 h-3.5 animate-spin" />
                                            <span>Retry in {cooldownSeconds}s</span>
                                        </>
                                    ) : (
                                        <>
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            <span>Retry Now</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 1: Upload Zone */}
                {step === 1 && (
                    <div className="max-w-xl mx-auto">
                        <div
                            {...getRootProps()}
                            className={`p-10 sm:p-14 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all duration-200 bg-surface-elevated/80 ${
                                isDragActive
                                    ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
                                    : 'border-white/15 hover:border-cyan-500/50 hover:bg-surface-hover'
                            }`}
                        >
                            <input {...getInputProps()} />
                            <div className="w-14 h-14 rounded-2xl bg-surface-overlay border border-white/10 flex items-center justify-center mx-auto mb-5 text-cyan-400">
                                <UploadCloud className="w-7 h-7" />
                            </div>
                            <h3 className="text-base font-semibold text-white mb-1.5">
                                {isDragActive ? 'Drop your resume file here' : 'Click to select or drag and drop'}
                            </h3>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                                Supports standard technical formats: PDF, DOCX, DOC, or TXT
                            </p>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[11px] text-slate-400">
                                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                                <span>Maximum file size: 5 MB</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Role Selection & File Confirmation */}
                {step === 2 && (
                    <div className="max-w-2xl mx-auto space-y-6">
                        {/* File Card */}
                        <div className="p-4 rounded-2xl bg-surface-elevated border border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-white truncate max-w-xs sm:max-w-md">
                                        {file?.name}
                                    </h4>
                                    <p className="text-[11px] text-slate-400">
                                        {file && formatFileSize(file.size)} • Ready for analysis
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleReset}
                                className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-1"
                            >
                                <X className="w-3.5 h-3.5" />
                                <span>Change</span>
                            </button>
                        </div>

                        {/* Target Role Picker */}
                        <div className="p-6 sm:p-8 rounded-3xl bg-surface-elevated border border-white/10 space-y-6">
                            <div>
                                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                                    <Compass className="w-4 h-4 text-cyan-400" />
                                    Select Target Career Role
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    We benchmark your detected skills against the exact competency rubric for this role.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {availableRoles.map((role) => {
                                    const isSelected = targetRole === role.id
                                    return (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => setTargetRole(role.id)}
                                            className={`p-3.5 rounded-xl border text-left transition-all duration-150 flex items-center justify-between select-none ${
                                                isSelected
                                                    ? 'border-cyan-500 bg-cyan-500/15 text-white shadow-glow-cyan-sm'
                                                    : 'border-white/10 hover:border-white/20 bg-surface-base/50 text-slate-300 hover:text-white'
                                            }`}
                                        >
                                            <span className="text-xs font-medium">{role.label}</span>
                                            {isSelected && (
                                                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />
                                            )}
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={handleReset}
                                    className="w-full sm:w-auto"
                                >
                                    Back
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleAnalyze}
                                    disabled={!targetRole || uploading || isSubmitting || step === 3 || cooldownSeconds > 0}
                                    loading={uploading || isSubmitting}
                                    loadingText="Analyzing Resume..."
                                    icon={cooldownSeconds > 0 ? Clock : ScanSearch}
                                    className="w-full sm:w-auto"
                                >
                                    {cooldownSeconds > 0 ? `Wait (${cooldownSeconds}s)` : 'Analyze My Skills'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Real-Time Intelligence Pipeline Processing */}
                {step === 3 && (
                    <div className="max-w-xl mx-auto p-8 sm:p-12 rounded-3xl bg-surface-elevated border border-white/10 text-center space-y-6">
                        <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                            <div className="absolute inset-0 rounded-2xl bg-cyan-500/15 animate-ping" />
                            <div className="relative w-14 h-14 rounded-2xl bg-surface-overlay border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
                                <Loader2 className="w-7 h-7 animate-spin" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-mono text-cyan-400 mb-1">
                                <Clock className="w-3.5 h-3.5 animate-pulse" />
                                <span>Elapsed: {elapsedTime}s</span>
                            </div>
                            <h2 className="text-xl font-bold text-white">Analyzing Resume</h2>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                Parsing competencies and benchmarking against requirements for{' '}
                                <span className="text-cyan-400 font-medium">
                                    {availableRoles.find(r => r.id === targetRole)?.label || 'Target Role'}
                                </span>
                            </p>
                        </div>

                        {/* Upload Progress (if actively streaming bytes) */}
                        {uploading && uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="max-w-sm mx-auto space-y-1.5 pt-2">
                                <div className="flex justify-between text-xs font-mono text-slate-400">
                                    <span>Ingesting document</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <Progress value={uploadProgress} />
                            </div>
                        )}

                        {/* Dynamic Pipeline Phases with Live Progress Tracking */}
                        <div className="max-w-sm mx-auto space-y-3 pt-2 text-xs text-left bg-surface-base/50 p-4 rounded-2xl border border-white/5">
                            {/* Phase 1: Ingestion */}
                            <div className="flex items-center gap-2.5">
                                {elapsedTime >= 6 ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : (
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0 ml-1 mr-1" />
                                )}
                                <span className={elapsedTime >= 6 ? 'text-slate-400 line-through decoration-slate-600' : 'text-slate-200 font-medium'}>
                                    Extracting raw text & document metadata
                                </span>
                            </div>

                            {/* Phase 2: Neural Model Warming / Tokenization */}
                            <div className="flex items-center gap-2.5">
                                {elapsedTime >= 20 ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : elapsedTime >= 6 ? (
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0 ml-1 mr-1" />
                                ) : (
                                    <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0 ml-1 mr-1" />
                                )}
                                <span className={elapsedTime >= 20 ? 'text-slate-400 line-through decoration-slate-600' : elapsedTime >= 6 ? 'text-cyan-300 font-medium' : 'text-slate-500'}>
                                    Warming up PyTorch & NLP extraction engine
                                </span>
                            </div>

                            {/* Phase 3: Semantic Skill Extraction */}
                            <div className="flex items-center gap-2.5">
                                {elapsedTime >= 35 ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : elapsedTime >= 20 ? (
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0 ml-1 mr-1" />
                                ) : (
                                    <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0 ml-1 mr-1" />
                                )}
                                <span className={elapsedTime >= 35 ? 'text-slate-400 line-through decoration-slate-600' : elapsedTime >= 20 ? 'text-sky-300 font-medium' : 'text-slate-500'}>
                                    Identifying technical stacks & competency evidence
                                </span>
                            </div>

                            {/* Phase 4: Role Benchmarking & Roadmap */}
                            <div className="flex items-center gap-2.5">
                                {elapsedTime >= 35 ? (
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0 ml-1 mr-1" />
                                ) : (
                                    <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0 ml-1 mr-1" />
                                )}
                                <span className={elapsedTime >= 35 ? 'text-cyan-300 font-medium' : 'text-slate-500'}>
                                    Benchmarking against role rubric & synthesizing roadmap
                                </span>
                            </div>
                        </div>

                        {/* User Guidance Reassurance Box */}
                        <div className="max-w-sm mx-auto p-3.5 rounded-2xl bg-cyan-500/5 border border-cyan-500/15 text-left flex items-start gap-2.5">
                            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                                <p className="text-xs font-semibold text-cyan-200">Deep AI Benchmarking Active</p>
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                    Our NLP models evaluate each experience and project in depth (~30–45s). Please keep this tab open — results will appear automatically.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}

export default UploadPage
