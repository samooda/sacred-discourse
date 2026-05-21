export default function AuthPageLayout({ children, footer }) {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div
          className="rounded-2xl border p-8"
          style={{ backgroundColor: '#111118', borderColor: '#1f2937' }}
        >
          {children}
        </div>
        {footer}
      </div>
    </main>
  )
}
