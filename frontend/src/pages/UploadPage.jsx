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
    ShieldCheck
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
        setAnalysisError('')
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
    }, [clearError])

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
    })

    // Handle submission to backend API
    const handleAnalyze = async () => {
        if (!file || !targetRole) {
            setAnalysisError('Please choose a file and designate a target role.')
            return
        }

        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: '/upload' } } })
            return
        }

        setStep(3)
        clearError()
        setAnalysisError('')

        try {
            const response = await analyzeResume(file, targetRole)
            const analysisId = response?.analysis?._id || response?.analysis?.id || response?._id
            toast.success('Resume analysis completed!')
            navigate(`/results/${analysisId}`)
        } catch (err) {
            const friendlyMsg = err.message || 'Analysis could not be completed at this time. Please try again.'
            setAnalysisError(friendlyMsg)
            toast.error(friendlyMsg)
            setStep(2)
        }
    }

    const handleReset = () => {
        setFile(null)
        setTargetRole('')
        setStep(1)
        setAnalysisError('')
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

                {/* Error Banner */}
                {(analysisError || hookError) && (
                    <div className="max-w-xl mx-auto mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-3 animate-in fade-in duration-150">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-semibold text-rose-200">Unable to proceed</p>
                            <p className="mt-0.5 text-rose-300/90">{analysisError || hookError}</p>
                        </div>
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
                                    disabled={!targetRole}
                                    icon={ScanSearch}
                                    className="w-full sm:w-auto"
                                >
                                    Analyze My Skills
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Real-Time Intelligence Pipeline Processing */}
                {step === 3 && (
                    <div className="max-w-xl mx-auto p-10 sm:p-14 rounded-3xl bg-surface-elevated border border-white/10 text-center space-y-6">
                        <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                            <div className="absolute inset-0 rounded-2xl bg-cyan-500/15 animate-ping" />
                            <div className="relative w-14 h-14 rounded-2xl bg-surface-overlay border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
                                <Loader2 className="w-7 h-7 animate-spin" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
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

                        {/* Deterministic Pipeline Phases */}
                        <div className="max-w-xs mx-auto space-y-2.5 pt-4 text-xs text-left">
                            <div className="flex items-center gap-2.5 text-slate-300">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                <span>Extracting technical entities & experiences</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-slate-400">
                                <span className="w-2 h-2 rounded-full bg-sky-400" />
                                <span>Benchmarking against role rubric</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-slate-500">
                                <span className="w-2 h-2 rounded-full bg-slate-600" />
                                <span>Synthesizing skill gap breakdown</span>
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
