import React from 'react'
import { cn } from '../../utils/cn'

export function Skeleton({ className = '', ...props }) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-xl bg-surface-overlay/60 border border-white/5',
                className
            )}
            {...props}
        />
    )
}

export function SkeletonCard() {
    return (
        <div className="p-6 bg-surface-elevated/80 border border-white/[0.06] rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-8 w-12 rounded-lg" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="pt-2 flex gap-2">
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-16 rounded-full" />
            </div>
        </div>
    )
}

export default Skeleton
