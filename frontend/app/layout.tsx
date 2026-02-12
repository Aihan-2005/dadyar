import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "دادیار | پلتفرم مدیریت پرونده وکلا",
    template: "%s | دادیار",
  },
  description:
    "پلتفرم حرفه‌ای برای وکلا جهت مدیریت پرونده‌ها، قراردادهای مرحله‌ای و روند کاری",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50`}
      >
        {children}
      </body>
    </html>
  );
}
