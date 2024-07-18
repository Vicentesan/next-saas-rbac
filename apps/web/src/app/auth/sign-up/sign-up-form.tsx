'use client'

import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useTransition } from 'react'
import { toast } from 'sonner'

import githubIcon from '@/assets/github-icon.svg'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFormState } from '@/hooks/use-form-state'

import { signInWithGithubAction } from '../actions'
import { handleSignUpWithEmailAndPassword } from './actions'

export function SignUpForm() {
  const [
    { success, message, validationErrors, hasBeenCalled },
    handleSubmit,
    isPending,
  ] = useFormState(handleSignUpWithEmailAndPassword)

  useEffect(() => {
    if (success === false && message) {
      toast.error('Sign up failed!', {
        description: message,
      })
    }
  }, [success, message, validationErrors, hasBeenCalled])

  const [isSignInWithGithubActionPending, startTransaction] = useTransition()

  function handleSignInWithGithub() {
    startTransaction(() => {
      signInWithGithubAction()
    })
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="name">Name</label>
          <Input name="name" id="name" />

          {validationErrors?.name && (
            <p className="text-xs font-medium text-red-500 dark:text-red-400">
              {validationErrors.name[0].charAt(0).toUpperCase() +
                validationErrors.name[0].slice(1)}
            </p>
          )}
        </div>

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
        </div>

        <div className="space-y-1">
          <label htmlFor="password_confirmation">Confirm your password</label>
          <Input
            name="password_confirmation"
            type="password"
            id="password_confirmation"
          />

          {validationErrors?.password_confirmation && (
            <p className="text-xs font-medium text-red-500 dark:text-red-400">
              {validationErrors.password_confirmation[0]
                .charAt(0)
                .toUpperCase() +
                validationErrors.password_confirmation[0].slice(1)}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      <div className="h-px w-full bg-muted" />

      <form action={handleSignInWithGithub}>
        <Button
          type="submit"
          className="w-full"
          variant="outline"
          disabled={isSignInWithGithubActionPending}
        >
          {isSignInWithGithubActionPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Image
                src={githubIcon}
                className="mr-2 size-4 dark:invert"
                alt=""
              />
              Sign Up with Github
            </>
          )}
        </Button>
      </form>

      <Button variant="link" className="w-full" size="sm" asChild>
        <Link href="/auth/sign-in">Already registered? Sign in</Link>
      </Button>
    </div>
  )
}
