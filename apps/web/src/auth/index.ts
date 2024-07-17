import { cookies } from 'next/headers'

export function isAuthenticated() {
  return !!cookies().get('@nivo:auth-1.0.0')?.value
}
