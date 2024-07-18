import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const redirectUrl = req.nextUrl.clone()

  redirectUrl.pathname = '/auth/sign-in'
  redirectUrl.search = ''

  cookies().delete('@nivo:auth-1.0.0')

  return NextResponse.redirect(redirectUrl)
}
