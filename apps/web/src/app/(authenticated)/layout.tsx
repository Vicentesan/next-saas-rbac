import { redirect } from 'next/navigation'

import { isAuthenticated } from '@/auth'

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  if (!isAuthenticated()) redirect('/auth/sign-in')

  return <>{children}</>
}
