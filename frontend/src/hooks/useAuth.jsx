/**
 * useAuth Hook
 * Enhanced authentication state management with context
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Check for existing auth on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                const storedUser = authService.getCurrentUser()
                if (storedUser && authService.isAuthenticated()) {
                    setUser(storedUser)
                    // Optionally verify token is still valid
                    try {
                        const { user: freshUser } = await authService.getProfile()
                        setUser(freshUser)
                        localStorage.setItem('user', JSON.stringify(freshUser))
                    } catch (err) {
                        // Token invalid, clear auth
                        if (err.status === 401) {
                            logout()
                        }
                    }
                }
            } catch (err) {
                console.error('Auth init error:', err)
            } finally {
                setLoading(false)
            }
        }

        initAuth()
    }, [])

    const login = useCallback(async (email, password) => {
        setError(null)
        setLoading(true)
        try {
            const response = await authService.login(email, password)
            setUser(response.user)
            return response
        } catch (err) {
            setError(err.message || 'Login failed')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const register = useCallback(async (userData) => {
        setError(null)
        setLoading(true)
        try {
            const response = await authService.register(userData)
            setUser(response.user)
            return response
        } catch (err) {
            setError(err.message || 'Registration failed')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const logout = useCallback(() => {
        setUser(null)
        setError(null)
        authService.logout()
    }, [])

    const updateProfile = useCallback(async (data) => {
        try {
            const response = await authService.updateProfile(data)
            setUser(response.user)
            localStorage.setItem('user', JSON.stringify(response.user))
            return response
        } catch (err) {
            setError(err.message || 'Profile update failed')
            throw err
        }
    }, [])

    const refreshUser = useCallback(async () => {
        try {
            const { user: freshUser } = await authService.getProfile()
            setUser(freshUser)
            localStorage.setItem('user', JSON.stringify(freshUser))
            return freshUser
        } catch (err) {
            console.error('Refresh user error:', err)
            throw err
        }
    }, [])

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        clearError: () => setError(null),
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export default useAuth
