'use server'

import { HTTPError } from 'ky'
import { z } from 'zod'

import { signInWithPassword } from '@/http/sign-in-with-password'

const signInSchema = z.object({
  email: z
    .string()
    .email({ message: 'Please, provide a valid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Your password must have at least 6 characters.' }),
})

type HandleSignInWithEmailAndPasswordResponse =
  | {
      success: boolean
      message: null
      validationErrors: {
        email?: string[] | undefined
        password?: string[] | undefined
      }
    }
  | {
      success: boolean
      message: string | null
      validationErrors: null
    }

export async function handleSignInWithEmailAndPassword(
  _: unknown,
  data: FormData,
): Promise<HandleSignInWithEmailAndPasswordResponse> {
  const result = signInSchema.safeParse(Object.fromEntries(data))

  if (!result.success) {
    const validationErrors = result.error.flatten().fieldErrors

    return { success: false, message: null, validationErrors }
  }

  const { email, password } = result.data

  try {
    const { jwtToken } = await signInWithPassword({
      email,
      password,
    })

    console.log(jwtToken)
  } catch (err) {
    if (err instanceof HTTPError) {
      const { message } = await err.response.json()

      return { success: false, message, validationErrors: null }
    }

    console.error(err)

    return {
      success: false,
      message:
        'An unexpected error occurred. Please, try again in a few minutes.',
      validationErrors: null,
    }
  }

  return { success: true, message: null, validationErrors: null }
}
