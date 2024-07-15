import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ForgotPasswordPage() {
  return (
    <form action="" className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email">E-mail</label>
        <Input name="email" type="email" id="email" />
      </div>

      <Button type="submit" className="w-full">
        Recover password
      </Button>

      <div className="h-px w-full bg-muted" />

      <Button variant="link" className="w-full" size="sm">
        <Link href="/auth/sign-in">Sign in instead</Link>
      </Button>
    </form>
  )
}
