import type {
  Metadata,
} from 'next'

import './globals.css'

export const metadata:
  Metadata = {
    title: {
      default:
        'دادیار | مدیریت دفتر و خدمات حقوقی موکلین',

      template:
        '%s | دادیار',
    },

    description:
      'دادیار؛ پلتفرم یکپارچه مدیریت پرونده و دفتر وکالت، انتخاب وکیل، رزرو مشاوره، درخواست بررسی، قرارداد آنلاین، پیگیری خدمات حقوقی و تنظیم لایحه.',

    icons: {
      icon:
        '/faicon.ico',
    },
  }

export default function RootLayout({
  children,
}: {
  children:
    React.ReactNode
}) {
  return (
    <html
      lang="fa"
      dir="rtl"
      style={{
        colorScheme:
          'light',
      }}
    >
      <head>
        <meta
          name="enamad"
          content="61288267"
        />
      </head>

      <body className="min-h-screen bg-slate-100 text-slate-950 antialiased">
        {children}
      </body>
    </html>
  )
}