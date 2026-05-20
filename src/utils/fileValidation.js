export const ALLOWED_ATTACHMENT_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

export const MAX_ATTACHMENT_SIZE = 50 * 1024 * 1024 // 50 MB

// Returns { valid: File[], errors: string[] }
export function validateFiles(files) {
  const errors = []
  const valid = []
  for (const file of files) {
    if (file.size > MAX_ATTACHMENT_SIZE) {
      errors.push(`"${file.name}": exceeds the 50 MB size limit`)
    } else if (!ALLOWED_ATTACHMENT_TYPES.has(file.type)) {
      errors.push(`"${file.name}": file type not allowed`)
    } else {
      valid.push(file)
    }
  }
  return { valid, errors }
}
