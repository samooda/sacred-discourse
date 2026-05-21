import { usePostDetail } from '../../pages/PostDetailPage'
import { formatFileSize } from '../../utils/format'
import { getFileIcon } from '../../utils/fileIcons'

export default function AttachmentViewer() {
  const { attachments, expandedAttachment, setExpandedAttachment, setFullscreenImage } = usePostDetail()

  if (attachments.length === 0) return null

  return (
    <div className="mt-6 pt-6 border-t" style={{ borderColor: '#1f2937' }}>
      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
        Attachments
      </h3>
      <div className="space-y-2">
        {attachments.map((attachment) => {
          const icon = getFileIcon(attachment.mime_type)
          const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/post-attachments/${attachment.file_path}`
          return (
            <div key={attachment.id}>
              <div
                className="flex items-center gap-3 rounded-lg border px-4 py-3"
                style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748' }}
              >
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: icon.color }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon.path} />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 truncate">{attachment.file_name}</p>
                  <p className="text-xs text-gray-600">{formatFileSize(attachment.file_size)}</p>
                </div>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors border-[#2d3748] hover:border-gray-600 bg-transparent text-gray-500 hover:text-gray-300"
                >
                  Download
                </a>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedAttachment(
                      expandedAttachment === attachment.id ? null : attachment.id
                    )
                  }
                  className="flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors border-gray-600 hover:border-indigo-500 bg-transparent text-gray-300 hover:text-white"
                >
                  {expandedAttachment === attachment.id ? 'Close' : 'Preview'}
                </button>
              </div>
              {expandedAttachment === attachment.id && (
                attachment.mime_type === 'application/pdf' ? (
                  <div
                    className="rounded-lg border overflow-hidden"
                    style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748', marginTop: '8px' }}
                  >
                    <p className="text-xs text-gray-600 px-3 pt-2 pb-1">Loading PDF…</p>
                    <iframe
                      src={url}
                      style={{ width: '100%', height: '500px', border: 'none' }}
                    />
                  </div>
                ) : attachment.mime_type.startsWith('image/') ? (
                  <div
                    className="rounded-lg border p-4"
                    style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748', marginTop: '8px' }}
                  >
                    <img
                      src={url}
                      alt={attachment.file_name}
                      className="rounded-lg"
                      style={{ maxWidth: '100%', height: 'auto', cursor: 'pointer' }}
                      onClick={() => setFullscreenImage(url)}
                    />
                  </div>
                ) : attachment.mime_type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || attachment.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
                  <div
                    className="rounded-lg border overflow-hidden"
                    style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748', marginTop: '8px' }}
                  >
                    <iframe
                      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
                      style={{ width: '100%', height: '500px', border: 'none' }}
                    />
                  </div>
                ) : (
                  <div
                    className="rounded-lg border flex items-center justify-center"
                    style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748', marginTop: '8px', padding: '24px' }}
                  >
                    <p className="text-gray-600 text-sm">Preview not available for this file type</p>
                  </div>
                )
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
