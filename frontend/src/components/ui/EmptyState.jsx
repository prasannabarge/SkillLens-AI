import React from 'react'
import { FolderSearch } from 'lucide-react'
import { cn } from '../../utils/cn'

export function EmptyState({
    icon: Icon = FolderSearch,
    title = 'No records found',
    description = 'Get started by running your first resume analysis.',
    action,
    className = '',
}) {
    return (
        <div className={cn('p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto', className)}>
            <div className="w-14 h-14 rounded-2xl bg-surface-overlay/80 border border-white/10 flex items-center justify-center mb-4 text-slate-400 shadow-inner">
                <Icon className="w-6 h-6 text-cyan-400/80" />
            </div>
            <h4 className="text-base font-semibold text-white mb-1.5">{title}</h4>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">{description}</p>
            {action && (
                <div className="flex items-center gap-3">
                    {action}
                </div>
            )}
        </div>
    )
}

export default EmptyState
