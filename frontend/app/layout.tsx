import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'دادیار | پلتفرم مدیریت پرونده وکلا',
    template: '%s | دادیار',
  },
  description:
    'پلتفرم حرفه‌ای برای وکلا جهت مدیریت پرونده‌ها، قراردادهای مرحله‌ای و روند کاری',
  icons: {
    icon: '/faicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="fa"
      dir="rtl"
      style={{
        colorScheme: 'light',
      }}
    >
      <head>
        <meta name="enamad" content="61288267" />
      </head>

      <body className="min-h-screen bg-slate-100 text-slate-950 antialiased">
        {children}
      </body>
    </html>
  )
}