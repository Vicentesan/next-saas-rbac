import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

import { signInWithGithub } from '@/http/sign-in-with-github'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams

  const code = searchParams.get('code')

  if (!code)
    return NextResponse.json(
      {
        success: false,
        message: 'Github OAuth code was not found.',
        validationErrors: null,
      },
      { status: 400 },
    )

  const { jwtToken } = await signInWithGithub({ code })

  cookies().set('@saas:auth-1.0.0', jwtToken, {
    // i'ts always important to identify the application and versonize it
    path: '/', // all routes will have access to the cookie
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  const redirectUrl = req.nextUrl.clone()

  redirectUrl.pathname = '/'
  redirectUrl.search = ''

  return NextResponse.redirect(redirectUrl)
}
