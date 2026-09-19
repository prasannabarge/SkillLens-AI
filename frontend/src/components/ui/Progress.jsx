import React from 'react'
import { cn } from '../../utils/cn'

export function Progress({
    value = 0,
    max = 100,
    variant = 'gradient',
    size = 'md',
    showLabel = false,
    className = '',
    ...props
}) {
    const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100)

    const sizes = {
        xs: 'h-1',
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-3.5',
    }

    const variants = {
        gradient: 'bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 shadow-glow-cyan-sm',
        cyan: 'bg-cyan-500',
        emerald: 'bg-emerald-500',
        amber: 'bg-amber-500',
        rose: 'bg-rose-500',
    }

    return (
        <div className={cn('w-full space-y-1.5', className)} {...props}>
            {showLabel && (
                <div className="flex justify-between text-xs font-mono-numbers">
                    <span className="text-slate-400">Progress</span>
                    <span className="font-semibold text-slate-200">{percentage}%</span>
                </div>
            )}
            <div
                className={cn('w-full bg-surface-overlay/80 rounded-full overflow-hidden border border-white/5', sizes[size])}
                role="progressbar"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div
                    className={cn('h-full rounded-full transition-all duration-500 ease-out', variants[variant])}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}

export default Progress
