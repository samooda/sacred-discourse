export default function ErrorBanner({ children, className = '', preWrap = false }) {
  return (
    <div
      className={`rounded-lg px-4 py-3 text-sm border ${className}`}
      style={{
        backgroundColor: 'rgba(239,68,68,0.08)',
        borderColor: 'rgba(239,68,68,0.3)',
        color: '#fca5a5',
        ...(preWrap ? { whiteSpace: 'pre-line' } : {}),
      }}
    >
      {children}
    </div>
  )
}
