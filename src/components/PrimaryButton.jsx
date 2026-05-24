const DEFAULT_BG = '#5c4ef8'

export default function PrimaryButton({
  loading = false,
  disabled = false,
  onClick,
  type = 'submit',
  className = '',
  accent = null,
  children,
}) {
  const bg = accent ?? DEFAULT_BG
  const isDisabled = disabled || loading
  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white ${className}`}
      style={{ backgroundColor: bg }}
      onMouseEnter={(e) => { if (!isDisabled) e.currentTarget.style.filter = 'brightness(0.88)' }}
      onMouseLeave={(e) => { e.currentTarget.style.filter = '' }}
    >
      {children}
    </button>
  )
}
