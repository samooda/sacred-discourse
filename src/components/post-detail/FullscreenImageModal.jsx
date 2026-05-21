import { usePostDetail } from '../../pages/PostDetailPage'

export default function FullscreenImageModal() {
  const { fullscreenImage, setFullscreenImage } = usePostDetail()

  if (!fullscreenImage) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
      onClick={() => setFullscreenImage(null)}
    >
      <button
        onClick={() => setFullscreenImage(null)}
        className="absolute top-4 right-4 text-white text-3xl font-light leading-none hover:text-gray-300 transition-colors"
      >
        ×
      </button>
      <img
        src={fullscreenImage}
        alt=""
        style={{ maxWidth: '90%', maxHeight: '90vh', objectFit: 'contain' }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}
