/**
 * Input Component
 * Styled form input field
 */

function Input({ label, error, className = '', ...props }) {
    return (
        <div className="mb-4">
            {label && (
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    {label}
                </label>
            )}
            <input
                className={`w-full px-4 py-3 bg-slate-700/50 backdrop-blur-sm border border-slate-600 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-400">{error}</p>
            )}
        </div>
    )
}

export default Input
