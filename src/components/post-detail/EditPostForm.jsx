import ErrorBanner from '../ErrorBanner'
import PrimaryButton from '../PrimaryButton'
import { usePostDetail } from '../../pages/PostDetailPage'
import { formatFileSize } from '../../utils/format'
import { validateFiles } from '../../utils/fileValidation'

export default function EditPostForm() {
  const {
    editTitle, setEditTitle,
    editDescription, setEditDescription,
    editExistingAttachments, setEditExistingAttachments,
    editNewFiles, setEditNewFiles,
    editFileError, setEditFileError,
    editSubmitting, editError,
    handleSaveEdit, cancelEdit,
  } = usePostDetail()

  function handleEditFileChange(e) {
    setEditFileError(null)
    const { valid, errors } = validateFiles(Array.from(e.target.files))
    if (errors.length > 0) setEditFileError(errors.join('\n'))
    if (valid.length > 0) setEditNewFiles((prev) => [...prev, ...valid])
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">Edit post</h3>

      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Title</label>
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full rounded-lg border border-[#2d3748] focus:border-indigo-600 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 bg-[#0a0a0f] focus:outline-none transition-colors"
          maxLength={100}
        />
        <p
          className="text-xs text-right mt-1"
          style={{ color: 100 - editTitle.length < 20 ? '#ef4444' : '#6b7280' }}
        >
          {100 - editTitle.length} / 100
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="w-full rounded-lg border border-[#2d3748] focus:border-indigo-600 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 bg-[#0a0a0f] focus:outline-none transition-colors resize-none"
          style={{ minHeight: '120px' }}
          maxLength={750}
        />
        <p
          className="text-xs text-right mt-1"
          style={{ color: 750 - editDescription.length < 75 ? '#ef4444' : '#6b7280' }}
        >
          {750 - editDescription.length} / 750
        </p>
      </div>

      {/* Existing attachments */}
      {editExistingAttachments.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            Existing attachments
          </label>
          <ul className="space-y-1">
            {editExistingAttachments.map((att) => (
              <li
                key={att.id}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-xs border"
                style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748' }}
              >
                <span className="text-gray-300 truncate mr-2">{att.file_name}</span>
                <button
                  type="button"
                  onClick={() =>
                    setEditExistingAttachments((prev) => prev.filter((a) => a.id !== att.id))
                  }
                  className="text-xs font-medium flex-shrink-0 transition-colors text-red-400 hover:text-red-500"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* New file picker */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">
          Add attachments <span className="text-gray-600 font-normal">(optional)</span>
        </label>
        {editFileError && <ErrorBanner preWrap className="mb-2">{editFileError}</ErrorBanner>}
        <label
          className="flex items-center gap-2 w-full rounded-lg border border-[#2d3748] hover:border-indigo-600 px-3 py-2.5 text-sm cursor-pointer transition-colors bg-[#0a0a0f] text-gray-500"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <span>Choose files…</span>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.gif,.pptx,.docx"
            onChange={handleEditFileChange}
            className="sr-only"
          />
        </label>
        {editNewFiles.length > 0 && (
          <ul className="mt-2 space-y-1">
            {editNewFiles.map((file, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-xs border"
                style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748' }}
              >
                <span className="text-gray-300 truncate mr-2">{file.name}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-gray-600">{formatFileSize(file.size)}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setEditNewFiles((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="text-gray-600 hover:text-gray-300 transition-colors leading-none"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Save / Cancel */}
      {editError && <ErrorBanner>{editError}</ErrorBanner>}
      <div className="flex items-center gap-3 pt-2">
        <PrimaryButton type="button" onClick={handleSaveEdit} loading={editSubmitting} className="px-5 py-2">
          {editSubmitting ? 'Saving…' : 'Save changes'}
        </PrimaryButton>
        <button
          type="button"
          onClick={cancelEdit}
          className="text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
