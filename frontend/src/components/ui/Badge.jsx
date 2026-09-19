import React from 'react'
import { cn } from '../../utils/cn'

export function Badge({
    children,
    variant = 'default',
    size = 'md',
    dot = false,
    className = '',
    ...props
}) {
    const variants = {
        default: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25',
        success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
        warning: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
        accent: 'bg-sky-500/10 text-sky-300 border-sky-500/25',
        secondary: 'bg-surface-hover text-slate-300 border-white/10',
        destructive: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
        outline: 'bg-transparent text-slate-400 border-white/15',
        info: 'bg-blue-500/10 text-blue-300 border-blue-500/25',
    }

    const dotColors = {
        default: 'bg-cyan-400',
        success: 'bg-emerald-400',
        warning: 'bg-amber-400',
        accent: 'bg-sky-400',
        secondary: 'bg-slate-400',
        destructive: 'bg-rose-400',
        outline: 'bg-slate-400',
        info: 'bg-blue-400',
    }

    const sizes = {
        sm: 'text-[11px] px-2 py-0.5 gap-1.5',
        md: 'text-xs px-2.5 py-1 gap-1.5',
    }

    return (
        <span
            className={cn(
                'inline-flex items-center font-medium rounded-full border tracking-wide select-none',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {dot && (
                <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />
            )}
            {children}
        </span>
    )
}

export default Badge
