import { api } from './api-client'

interface signInWithPasswordRequest {
  email: string
  password: string
}

interface signInWithPasswordResponse {
  jwtToken: string
}

export async function signInWithPassword({
  email,
  password,
}: signInWithPasswordRequest) {
  const result = await api
    .post('sessions/password', {
      json: {
        email: email.toLowerCase(),
        password,
      },
    })
    .json<signInWithPasswordResponse>()

  return result
}
