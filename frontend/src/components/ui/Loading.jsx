import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

export function Loading({
    size = 'md',
    text,
    className = '',
}) {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-10 h-10',
        xl: 'w-14 h-14',
    }

    return (
        <div className={cn('flex flex-col items-center justify-center gap-3 p-6 text-slate-400', className)}>
            <Loader2 className={cn('animate-spin text-cyan-400', sizes[size])} />
            {text && <p className="text-sm font-medium text-slate-300 animate-pulse">{text}</p>}
        </div>
    )
}

export default Loading
