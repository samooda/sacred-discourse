export default function PrimaryButton({
  loading = false,
  disabled = false,
  onClick,
  type = 'submit',
  className = '',
  children,
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      style={{ backgroundColor: '#4f46e5', color: '#e0e7ff' }}
      onMouseEnter={(e) => { if (!disabled && !loading) e.currentTarget.style.backgroundColor = '#4338ca' }}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
    >
      {children}
    </button>
  )
}
