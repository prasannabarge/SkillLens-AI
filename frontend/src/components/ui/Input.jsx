import React from 'react'
import { cn } from '../../utils/cn'

const Input = React.forwardRef(({
    label,
    error,
    hint,
    icon: Icon,
    rightSlot,
    className = '',
    id,
    disabled,
    required,
    ...props
}, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
        <div className="w-full space-y-1.5">
            {label && (
                <div className="flex items-center justify-between">
                    <label htmlFor={inputId} className="block text-xs font-medium text-slate-300">
                        {label} {required && <span className="text-cyan-400">*</span>}
                    </label>
                    {hint && <span className="text-xs text-slate-500">{hint}</span>}
                </div>
            )}
            <div className="relative flex items-center">
                {Icon && (
                    <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
                        <Icon className="w-4 h-4" />
                    </div>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    disabled={disabled}
                    required={required}
                    aria-invalid={Boolean(error)}
                    className={cn(
                        'w-full px-3.5 py-2.5 bg-surface-elevated/90 border rounded-xl text-sm text-white placeholder:text-slate-500 transition-all duration-150',
                        'focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/80',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        Icon ? 'pl-10' : 'pl-3.5',
                        rightSlot ? 'pr-10' : 'pr-3.5',
                        error ? 'border-rose-500/70 focus:ring-rose-500/30' : 'border-white/10 hover:border-white/20',
                        className
                    )}
                    {...props}
                />
                {rightSlot && (
                    <div className="absolute right-3 flex items-center">
                        {rightSlot}
                    </div>
                )}
            </div>
            {error && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1 font-medium animate-in fade-in duration-150">
                    <span>•</span> {error}
                </p>
            )}
        </div>
    )
})

Input.displayName = 'Input'

export default Input
