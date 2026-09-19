/**
 * SkillLens App - Main Application Component
 * With authentication context, global shell dialogs, and protected routes
 */

import React, { createContext, useContext, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from './hooks/useAuth'
import CommandPalette from './components/ui/CommandPalette'
import ProfileModal from './components/ui/ProfileModal'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UploadPage from './pages/UploadPage'
import ResultPage from './pages/ResultPage'
import RoadmapPage from './pages/RoadmapPage'
import DashboardPage from './pages/DashboardPage'

// Global UI Shell Context
export const ShellContext = createContext({
    openCommandPalette: () => {},
    openProfile: () => {},
})

export const useShell = () => useContext(ShellContext)

// Protected Route Component
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="animate-spin w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto" />
                    <p className="text-xs font-medium text-slate-400">Authenticating session...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return children
}

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route path="/upload" element={
                <ProtectedRoute>
                    <UploadPage />
                </ProtectedRoute>
            } />
            <Route path="/results/:id" element={
                <ProtectedRoute>
                    <ResultPage />
                </ProtectedRoute>
            } />
            <Route path="/roadmap/:id" element={
                <ProtectedRoute>
                    <RoadmapPage />
                </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <DashboardPage />
                </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

function ShellProvider({ children }) {
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
    const [profileModalOpen, setProfileModalOpen] = useState(false)

    const value = {
        openCommandPalette: () => setCommandPaletteOpen(true),
        openProfile: () => setProfileModalOpen(true),
    }

    return (
        <ShellContext.Provider value={value}>
            {children}
            <CommandPalette
                open={commandPaletteOpen}
                setOpen={setCommandPaletteOpen}
                onOpenProfile={() => setProfileModalOpen(true)}
            />
            <ProfileModal
                open={profileModalOpen}
                onClose={() => setProfileModalOpen(false)}
            />
            <Toaster
                theme="dark"
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#0f172a',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#f8fafc',
                    },
                }}
            />
        </ShellContext.Provider>
    )
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <ShellProvider>
                    <div className="min-h-screen bg-background text-slate-100 flex flex-col">
                        <AppRoutes />
                    </div>
                </ShellProvider>
            </AuthProvider>
        </Router>
    )
}

export default App
