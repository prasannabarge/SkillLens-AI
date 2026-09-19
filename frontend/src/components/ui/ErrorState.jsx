import React from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'
import Button from './Button'
import { cn } from '../../utils/cn'

export function ErrorState({
    title = 'Something went wrong',
    message = 'We encountered an error processing your request. Please try again.',
    onRetry,
    retryText = 'Try again',
    secondaryAction,
    className = '',
}) {
    return (
        <div className={cn('p-8 text-center flex flex-col items-center justify-center max-w-md mx-auto', className)}>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center mb-4 text-rose-400">
                <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-white mb-1.5">{title}</h4>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">{message}</p>
            <div className="flex items-center gap-3">
                {onRetry && (
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={RotateCcw}
                        onClick={onRetry}
                    >
                        {retryText}
                    </Button>
                )}
                {secondaryAction}
            </div>
        </div>
    )
}

export default ErrorState
