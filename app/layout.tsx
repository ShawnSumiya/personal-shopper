import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Personal Shopper Service',
  description: 'Buy exclusive Japanese goods directly from Japan.',
  manifest: '/manifest.json', // ★これを追加
  icons: {
    apple: '/icon.png', // iPhone用アイコン
  },
}

// ★スマホで見やすくするための設定を追加
export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-dark-bg text-white`}>{children}</body>
    </html>
  )
}