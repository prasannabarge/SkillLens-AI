import React, { useState, useEffect } from 'react'
import { X, User, Briefcase, Mail, Check, AlertCircle } from 'lucide-react'
import Button from './Button'
import Input from './Input'
import { useAuth } from '../../hooks/useAuth'
import { JOB_ROLES } from '../../utils/constants'
import { toast } from 'sonner'

export function ProfileModal({ open, onClose }) {
    const { user, updateProfile } = useAuth()
    const [name, setName] = useState('')
    const [currentRole, setCurrentRole] = useState('')
    const [targetRole, setTargetRole] = useState('')
    const [bio, setBio] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (user) {
            setName(user.name || '')
            setCurrentRole(user.currentRole || '')
            setTargetRole(user.targetRole || '')
            setBio(user.bio || '')
        }
    }, [user, open])

    if (!open) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSaving(true)

        try {
            await updateProfile({
                name,
                currentRole,
                targetRole,
                bio,
            })
            toast.success('Profile updated successfully')
            onClose()
        } catch (err) {
            setError(err.message || 'Failed to update profile')
            toast.error(err.message || 'Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="fixed inset-0" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-surface-elevated border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="p-6 pb-4 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-white">Profile & Career Settings</h3>
                            <p className="text-xs text-slate-400">Manage your identity and career target</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <Input
                        label="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        required
                    />

                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                            Email Address
                        </label>
                        <div className="px-3.5 py-2.5 bg-surface-overlay/50 border border-white/5 rounded-xl text-sm text-slate-400 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-500" />
                            <span>{user?.email}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Email cannot be changed directly.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                Current Role
                            </label>
                            <select
                                value={currentRole}
                                onChange={(e) => setCurrentRole(e.target.value)}
                                className="w-full px-3 py-2.5 bg-surface-elevated border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all"
                            >
                                <option value="">Select current role</option>
                                {JOB_ROLES.map((r) => (
                                    <option key={r.id} value={r.id}>{r.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                Target Role
                            </label>
                            <select
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                className="w-full px-3 py-2.5 bg-surface-elevated border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all"
                            >
                                <option value="">Select target role</option>
                                {JOB_ROLES.map((r) => (
                                    <option key={r.id} value={r.id}>{r.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                            Professional Bio (Optional)
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={3}
                            placeholder="A brief overview of your background and career goals..."
                            className="w-full px-3.5 py-2.5 bg-surface-elevated border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all resize-none"
                        />
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={saving}
                            loadingText="Saving..."
                        >
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ProfileModal
