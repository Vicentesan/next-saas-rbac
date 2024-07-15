import Image from 'next/image'
import Link from 'next/link'

import githubIcon from '@/assets/github-icon.svg'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SingUpPage() {
  return (
    <form action="" className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="name">Name</label>
        <Input name="name" id="name" />
      </div>

      <div className="space-y-1">
        <label htmlFor="email">E-mail</label>
        <Input name="email" type="email" id="email" />
      </div>

      <div className="space-y-1">
        <label htmlFor="password">Password</label>
        <Input name="password" type="password" id="password" />
      </div>

      <div className="space-y-1">
        <label htmlFor="password-confirmation">Confirm your password</label>
        <Input
          name="password-confirmation"
          type="password"
          id="password-confirmation"
        />
      </div>

      <Button type="submit" className="w-full">
        Create account
      </Button>

      <div className="h-px w-full bg-muted" />

      <Button type="submit" className="w-full" variant="outline">
        <Image src={githubIcon} className="mr-2 size-4 dark:invert" alt="" />
        Sign Up with Github
      </Button>

      <Button variant="link" className="w-full" size="sm" asChild>
        <Link href="/auth/sign-in">Already registered? Sign in</Link>
      </Button>
    </form>
  )
}
