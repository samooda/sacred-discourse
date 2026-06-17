export default function LoadMoreButton({ onClick, loading = false }) {
  return (
    <div className="mt-6 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="px-5 py-2.5 text-xs font-medium rounded-lg border transition-colors text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ borderColor: '#374151', backgroundColor: 'transparent' }}
      >
        {loading ? 'Loading…' : 'Load more'}
      </button>
    </div>
  )
}
