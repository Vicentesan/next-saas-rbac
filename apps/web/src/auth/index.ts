import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { getProfile } from '@/http/get-profile'

export function isAuthenticated() {
  return !!cookies().get('@nivo:auth-1.0.0')?.value
}

export async function auth() {
  const token = cookies().get('@nivo:auth-1.0.0')?.value

  if (!token) redirect('/auth/sign-in')

  try {
    const { user } = await getProfile()

    return { user }
  } catch (err) {
    console.error(err)

    redirect('/api/auth/sign-out')
  }
}
