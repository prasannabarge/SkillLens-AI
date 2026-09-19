import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

const Button = React.forwardRef(({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    loading = false,
    loadingText,
    icon: Icon,
    iconPosition = 'left',
    disabled,
    ...props
}, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'

    const variants = {
        primary: 'bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white shadow-glow-cyan shadow-lg border border-cyan-400/20',
        secondary: 'bg-surface-elevated hover:bg-surface-hover text-slate-200 border border-white/10 hover:border-white/20',
        outline: 'bg-transparent text-slate-200 border border-white/15 hover:bg-white/5 hover:border-white/25',
        ghost: 'bg-transparent text-slate-300 hover:text-white hover:bg-white/5',
        destructive: 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30',
        link: 'bg-transparent text-cyan-400 hover:text-cyan-300 underline-offset-4 hover:underline p-0 h-auto',
    }

    const sizes = {
        xs: 'text-xs px-2.5 py-1 gap-1.5 rounded-lg',
        sm: 'text-xs px-3 py-1.5 gap-1.5',
        md: 'text-sm px-4 py-2.5 gap-2',
        lg: 'text-base px-6 py-3 gap-2.5',
        icon: 'h-9 w-9 p-0',
    }

    return (
        <button
            ref={ref}
            disabled={disabled || loading}
            className={cn(baseClasses, variants[variant], sizes[size], className)}
            {...props}
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin text-current" />
                    {loadingText || children}
                </>
            ) : (
                <>
                    {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
                    {children}
                    {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
                </>
            )}
        </button>
    )
})

Button.displayName = 'Button'

export default Button
