export default function LoadingSpinner({ color = '#4f46e5' }) {
  return (
    <div
      className="inline-block w-6 h-6 rounded-full border-2 animate-spin"
      style={{ borderColor: color, borderTopColor: 'transparent' }}
    />
  )
}
