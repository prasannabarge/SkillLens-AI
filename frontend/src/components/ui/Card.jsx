import React from 'react'
import { cn } from '../../utils/cn'

export function Card({ className = '', children, hover = false, ...props }) {
    return (
        <div
            className={cn(
                'bg-surface-elevated/80 border border-white/[0.07] rounded-2xl shadow-card transition-all duration-200',
                hover && 'hover:border-cyan-500/30 hover:shadow-glow-cyan-sm hover:-translate-y-0.5',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

export function CardHeader({ className = '', children, ...props }) {
    return (
        <div className={cn('p-6 pb-4 border-b border-white/[0.04]', className)} {...props}>
            {children}
        </div>
    )
}

export function CardTitle({ className = '', children, ...props }) {
    return (
        <h3 className={cn('text-lg font-semibold text-white tracking-tight', className)} {...props}>
            {children}
        </h3>
    )
}

export function CardDescription({ className = '', children, ...props }) {
    return (
        <p className={cn('text-sm text-slate-400 mt-1', className)} {...props}>
            {children}
        </p>
    )
}

export function CardContent({ className = '', children, ...props }) {
    return (
        <div className={cn('p-6', className)} {...props}>
            {children}
        </div>
    )
}

export function CardFooter({ className = '', children, ...props }) {
    return (
        <div className={cn('p-6 pt-4 border-t border-white/[0.04] flex items-center', className)} {...props}>
            {children}
        </div>
    )
}

export default Card
