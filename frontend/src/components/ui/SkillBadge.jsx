import React from 'react'
import { Check, Plus, AlertCircle, Sparkles } from 'lucide-react'
import { cn } from '../../utils/cn'

export function SkillBadge({
    skill,
    type = 'neutral',
    showLevel = false,
    className = '',
    onClick,
}) {
    const name = typeof skill === 'string' ? skill : skill?.name || 'Skill'
    const level = typeof skill === 'object' ? skill?.level : null
    const category = typeof skill === 'object' ? skill?.category : null

    const typeStyles = {
        matched: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/15',
        gap: 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/15',
        extracted: 'bg-surface-elevated text-slate-300 border-white/10 hover:border-white/20',
        neutral: 'bg-surface-elevated text-slate-300 border-white/10 hover:border-white/20',
        priority: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    }

    const Icons = {
        matched: Check,
        gap: AlertCircle,
        extracted: Sparkles,
        neutral: null,
        priority: Plus,
    }

    const Icon = Icons[type]

    return (
        <span
            onClick={onClick}
            className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border transition-all duration-150 select-none',
                typeStyles[type] || typeStyles.neutral,
                onClick && 'cursor-pointer active:scale-95',
                className
            )}
        >
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />}
            <span className="truncate">{name}</span>
            {showLevel && level && (
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-black/20 text-slate-400">
                    {level}
                </span>
            )}
        </span>
    )
}

export default SkillBadge
