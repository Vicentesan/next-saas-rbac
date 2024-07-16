import './globals.css'

import type { Metadata } from 'next'

import { Toaster } from '@/components/ui/sonner'

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
      <body>
        <main>{children}</main>
        <Toaster richColors theme="dark" expand closeButton dir="auto" />
      </body>
    </html>
  )
}
