import './globals.css'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nivo',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark ">
      <body>{children}</body>
    </html>
  )
}
