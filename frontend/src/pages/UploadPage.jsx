/**
 * UploadPage Component
 * Resume upload with analysis flow - fully integrated with backend + NLP
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { useAnalysis } from '../hooks/useAnalysis'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

function UploadPage() {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const {
        analyzeResume,
        getRoles,
        roles,
        uploading,
        uploadProgress,
        error,
        clearError
    } = useAnalysis()

    const [file, setFile] = useState(null)
    const [targetRole, setTargetRole] = useState('')
    const [step, setStep] = useState(1) // 1: upload, 2: select role, 3: analyzing
    const [analysisError, setAnalysisError] = useState('')

    // Load available roles
    useEffect(() => {
        getRoles()
    }, [getRoles])

    // Handle file drop
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0]
            // Validate file size (5MB max)
            if (selectedFile.size > 5 * 1024 * 1024) {
                setAnalysisError('File size must be less than 5MB')
                return
            }
            setFile(selectedFile)
            setAnalysisError('')
            setStep(2)
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt'],
        },
        maxFiles: 1,
    })

    // Handle analysis submission
    const handleAnalyze = async () => {
        if (!file || !targetRole) {
            setAnalysisError('Please select a file and target role')
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
            // Navigate to results page with analysis ID
            navigate(`/results/${response.analysis._id}`)
        } catch (err) {
            setAnalysisError(err.message || 'Analysis failed. Please try again.')
            setStep(2)
        }
    }

    // Reset to start
    const handleReset = () => {
        setFile(null)
        setTargetRole('')
        setStep(1)
        setAnalysisError('')
        clearError()
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
            <Navbar />

            <main className="flex-1 container mx-auto px-6 py-12">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold mb-4 gradient-text">
                            Analyze Your Resume
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Upload your resume and discover your skill gaps
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center mb-10">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center font-bold
                                    ${step >= s ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-400'}
                                    transition-all duration-300
                                `}>
                                    {step > s ? '✓' : s}
                                </div>
                                {s < 3 && (
                                    <div className={`w-20 h-1 ${step > s ? 'bg-cyan-500' : 'bg-slate-700'} transition-all duration-300`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Error Display */}
                    {(analysisError || error) && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-center">
                            {analysisError || error}
                        </div>
                    )}

                    {/* Step 1: Upload */}
                    {step === 1 && (
                        <div className="card p-8">
                            <div
                                {...getRootProps()}
                                className={`
                                    border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
                                    transition-all duration-300
                                    ${isDragActive
                                        ? 'border-cyan-400 bg-cyan-500/10'
                                        : 'border-slate-600 hover:border-cyan-500/50 hover:bg-slate-800/50'
                                    }
                                `}
                            >
                                <input {...getInputProps()} />
                                <div className="text-6xl mb-4">📄</div>
                                {isDragActive ? (
                                    <p className="text-xl text-cyan-400">Drop your resume here...</p>
                                ) : (
                                    <>
                                        <p className="text-xl text-white mb-2">Drag & drop your resume</p>
                                        <p className="text-slate-400">or click to browse</p>
                                        <p className="text-sm text-slate-500 mt-4">
                                            Supports PDF, DOC, DOCX, TXT (Max 5MB)
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Select Role */}
                    {step === 2 && (
                        <div className="card p-8">
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">Selected File</h3>
                                    <button
                                        onClick={handleReset}
                                        className="text-sm text-cyan-400 hover:text-cyan-300"
                                    >
                                        Change file
                                    </button>
                                </div>
                                <div className="flex items-center p-4 bg-slate-800/50 rounded-lg">
                                    <span className="text-3xl mr-4">📄</span>
                                    <div>
                                        <p className="font-medium">{file?.name}</p>
                                        <p className="text-sm text-slate-400">
                                            {(file?.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <label className="block text-lg font-semibold mb-4">
                                    Select Target Role
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {roles.map(role => (
                                        <button
                                            key={role.id}
                                            onClick={() => setTargetRole(role.id)}
                                            className={`
                                                p-4 rounded-lg border text-left transition-all
                                                ${targetRole === role.id
                                                    ? 'border-cyan-500 bg-cyan-500/20 text-white'
                                                    : 'border-slate-600 hover:border-slate-500 text-slate-300'
                                                }
                                            `}
                                        >
                                            {role.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleAnalyze}
                                disabled={!targetRole}
                                className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                🔍 Analyze My Skills
                            </button>
                        </div>
                    )}

                    {/* Step 3: Analyzing */}
                    {step === 3 && (
                        <div className="card p-12 text-center">
                            <div className="relative w-24 h-24 mx-auto mb-6">
                                <svg className="animate-spin h-24 w-24 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">Analyzing Your Resume</h2>
                            <p className="text-slate-400 mb-6">
                                Our AI is extracting skills and comparing them with {roles.find(r => r.id === targetRole)?.label || 'your target role'} requirements...
                            </p>

                            {/* Upload Progress */}
                            {uploading && (
                                <div className="max-w-md mx-auto">
                                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                                        <span>Processing...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 space-y-3">
                                <div className="flex items-center justify-center text-slate-400">
                                    <span className="animate-pulse mr-2">⏳</span>
                                    Parsing resume content...
                                </div>
                                <div className="flex items-center justify-center text-slate-500">
                                    <span className="mr-2">🎯</span>
                                    Extracting skills...
                                </div>
                                <div className="flex items-center justify-center text-slate-500">
                                    <span className="mr-2">📊</span>
                                    Matching with role requirements...
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default UploadPage
