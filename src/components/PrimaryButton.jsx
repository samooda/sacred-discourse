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
      className={`bg-indigo-600 hover:bg-indigo-700 disabled:hover:bg-indigo-600 text-indigo-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  )
}
