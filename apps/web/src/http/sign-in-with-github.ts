import { api } from './api-client'

interface signInWithGithubRequest {
  code: string
}

interface signInWithGithubResponse {
  jwtToken: string
}

export async function signInWithGithub({ code }: signInWithGithubRequest) {
  const result = await api
    .post('sessions/github', {
      json: {
        code,
      },
    })
    .json<signInWithGithubResponse>()

  return result
}
