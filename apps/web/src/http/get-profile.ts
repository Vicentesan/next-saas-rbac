import { api } from './api-client'

interface getProfileResponse {
  user: {
    name: string | null
    id: string
    email: string
    avatarUrl: string | null
  }
}

export async function getProfile() {
  const result = await api.get('me').json<getProfileResponse>()

  return result
}
