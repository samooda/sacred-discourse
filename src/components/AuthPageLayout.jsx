export default function AuthPageLayout({ children, footer }) {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div
          className="rounded-2xl border p-8 relative overflow-hidden"
          style={{ backgroundColor: '#111118', borderColor: '#1f2937' }}
        >
          <span className="absolute -top-3 -right-1 text-8xl select-none pointer-events-none" style={{ opacity: 0.04 }}>✝</span>
          <span className="absolute -bottom-5 -left-1 text-8xl select-none pointer-events-none" style={{ opacity: 0.04 }}>☪</span>
          {children}
        </div>
        {footer}
      </div>
    </main>
  )
}
