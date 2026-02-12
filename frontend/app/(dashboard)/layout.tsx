import AuthGuard from '@/components/auth-guard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-800 p-6">
        {children}
      </div>
    </AuthGuard>
  )
}
