/**
 * Card Component
 * Reusable card container
 */

function Card({ children, className = '', ...props }) {
    return (
        <div
            className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}

export default Card
