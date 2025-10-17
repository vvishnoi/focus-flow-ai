import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FocusFlow AI',
  description: 'Gamified therapeutic tool for visual tracking and attention skills',
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
