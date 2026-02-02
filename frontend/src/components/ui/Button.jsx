/**
 * Button Component
 * Reusable button with variants
 */

function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) {
    const baseClasses = 'font-semibold rounded-xl transition-all duration-300 transform hover:scale-105'

    const variants = {
        primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg hover:from-primary-600 hover:to-primary-700',
        secondary: 'bg-slate-700/50 backdrop-blur-sm text-white border border-slate-600 hover:bg-slate-600/50',
        ghost: 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-700/50',
    }

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3',
        lg: 'px-8 py-4 text-lg',
    }

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}

export default Button
