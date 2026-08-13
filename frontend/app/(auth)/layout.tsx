export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main
      dir="rtl"
      className="relative flex min-h-dvh items-center justify-center overflow-x-hidden bg-slate-100 px-3 py-6 text-slate-950 sm:px-6 sm:py-8"
    >
      {/* Background */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-blue-300/35 blur-[110px]" />

        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-emerald-200/20 blur-[110px]" />

        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(rgba(100,116,139,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.08) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        {children}
      </div>
    </main>
  )
}