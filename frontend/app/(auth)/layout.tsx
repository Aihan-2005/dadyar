// export default function AuthLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50">
//       {children}
//     </div>
//   )
// }
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      dir="rtl"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0f] px-4 py-10 text-white"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute top-[-15%] right-[-10%] h-[500px] w-[500px] rounded-full opacity-20 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(37,99,235,1) 0%, rgba(37,99,235,0) 70%)',
          }}
        />
        <div
          className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full opacity-20 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(124,58,237,1) 0%, rgba(124,58,237,0) 70%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-6xl">{children}</div>
    </div>
  )
}
