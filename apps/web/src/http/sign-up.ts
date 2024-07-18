import { api } from './api-client'

interface signInWithPasswordRequest {
  name: string
  email: string
  password: string
}

type SignInWithPasswordResponse = void

export async function signUpWithEmailAndPassword({
  name,
  email,
  password,
}: signInWithPasswordRequest): Promise<SignInWithPasswordResponse> {
  await api.post('users', {
    json: {
      name,
      email,
      password,
    },
  })
}
