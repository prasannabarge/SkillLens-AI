import React from 'react'
import { Sparkles, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { cn } from '../../utils/cn'

export function MatchScore({
    score = 0,
    size = 140,
    strokeWidth = 10,
    showLabel = true,
    subtitle,
    className = '',
}) {
    const radius = (size - strokeWidth * 2) / 2
    const circumference = 2 * Math.PI * radius
    const normalizedScore = Math.min(Math.max(Math.round(score), 0), 100)
    const strokeDashoffset = circumference - (normalizedScore / 100) * circumference

    // Determine status & color
    let colorClass = 'text-emerald-400'
    let gradientStart = '#10b981'
    let gradientEnd = '#34d399'
    let statusLabel = 'High Match'
    let StatusIcon = CheckCircle2

    if (normalizedScore < 40) {
        colorClass = 'text-rose-400'
        gradientStart = '#f43f5e'
        gradientEnd = '#fb7185'
        statusLabel = 'Significant Gap'
        StatusIcon = XCircle
    } else if (normalizedScore < 70) {
        colorClass = 'text-amber-400'
        gradientStart = '#f59e0b'
        gradientEnd = '#fbbf24'
        statusLabel = 'Moderate Gap'
        StatusIcon = AlertTriangle
    }

    const gradientId = `match-score-grad-${normalizedScore}`

    return (
        <div className={cn('flex flex-col items-center justify-center select-none', className)}>
            <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="transform -rotate-90"
                >
                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={gradientStart} />
                            <stop offset="100%" stopColor={gradientEnd} />
                        </linearGradient>
                    </defs>
                    {/* Track */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        className="text-surface-overlay/80"
                    />
                    {/* Animated Meter */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={`url(#${gradientId})`}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold font-numbers tracking-tight text-white leading-none">
                        {normalizedScore}%
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-1">
                        Match
                    </span>
                </div>
            </div>

            {showLabel && (
                <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-overlay/60 border border-white/5 text-xs font-medium">
                    <StatusIcon className={cn('w-3.5 h-3.5', colorClass)} />
                    <span className="text-slate-200">{subtitle || statusLabel}</span>
                </div>
            )}
        </div>
    )
}

export default MatchScore
