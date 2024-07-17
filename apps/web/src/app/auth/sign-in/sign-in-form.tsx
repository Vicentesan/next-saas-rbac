'use client'

import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { type FormEvent, useState, useTransition } from 'react'
import { toast } from 'sonner'

import githubIcon from '@/assets/github-icon.svg'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { handleSignInWithEmailAndPassword } from './actions'

type FormState = {
  success: boolean
  message: string | null
  validationErrors: {
    email?: string[] | undefined
    password?: string[] | undefined
  } | null
}

export function SignInForm() {
  const [{ success, message, validationErrors }, setFormState] =
    useState<FormState>({
      success: false,
      message: null,
      validationErrors: null,
    })
  const [isPending, startTransition] = useTransition()

  async function handleFormAction(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = e.currentTarget
    const data = new FormData(form)

    startTransition(async () => {
      const state = await handleSignInWithEmailAndPassword(data)

      setFormState(state)
    })

    if (success === false && message) {
      toast.error('Sign in failed!', {
        description: message,
      })
    }
  }

  return (
    <form onSubmit={handleFormAction} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email">E-mail</label>
        <Input name="email" type="email" id="email" />

        {validationErrors?.email && (
          <p className="text-xs font-medium text-red-500 dark:text-red-400">
            {validationErrors.email[0].charAt(0).toUpperCase() +
              validationErrors.email[0].slice(1)}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="password">Password</label>
        <Input name="password" type="password" id="password" />

        {validationErrors?.password && (
          <p className="text-xs font-medium text-red-500 dark:text-red-400">
            {validationErrors.password[0].charAt(0).toUpperCase() +
              validationErrors.password[0].slice(1)}
          </p>
        )}

        <Link
          href="/auth/forgot-password"
          className="text-xs font-medium text-foreground underline-offset-4 hover:underline"
        >
          Forgot your password?
        </Link>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          'Sign In with e-mail'
        )}
      </Button>

      <div className="h-px w-full bg-muted" />

      <Button type="submit" className="w-full" variant="outline">
        <Image src={githubIcon} className="mr-2 size-4 dark:invert" alt="" />
        Sign In with Github
      </Button>

      <Button variant="link" className="w-full" size="sm" asChild>
        <Link href="/auth/sign-up">Create new account</Link>
      </Button>
    </form>
  )
}