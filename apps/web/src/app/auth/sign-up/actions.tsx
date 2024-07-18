'use server'

import { HTTPError } from 'ky'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { signUpWithEmailAndPassword } from '@/http/sign-up'

type HandleSignUpWithEmailAndPassword =
  | {
      success: boolean
      message: null
      validationErrors: {
        name?: string[] | undefined
        email?: string[] | undefined
        password?: string[] | undefined
      }
    }
  | {
      success: boolean
      message: string | null
      validationErrors: null
    }

const signUpSchema = z
  .object({
    name: z.string().min(4, { message: 'Please, provide your full name.' }),
    email: z
      .string()
      .email({ message: 'Please, provide a valid email address.' }),
    password: z
      .string()
      .min(6, { message: 'Your password must have at least 6 characters.' }),
    password_confirmation: z
      .string()
      .min(6, { message: 'Your password must have at least 6 characters.' }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Password confirmation does not match.',
    path: ['password_confirmation'],
  })

export async function handleSignUpWithEmailAndPassword(
  data: FormData,
): Promise<HandleSignUpWithEmailAndPassword> {
  const result = signUpSchema.safeParse(Object.fromEntries(data))

  if (!result.success) {
    const validationErrors = result.error.flatten().fieldErrors

    return { success: false, message: null, validationErrors }
  }

  const { name, email, password } = result.data

  try {
    await signUpWithEmailAndPassword({
      name,
      email,
      password,
    })
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

  redirect('/')
}
