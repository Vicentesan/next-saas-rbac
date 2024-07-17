import { type FormEvent, useState, useTransition } from 'react'

interface FormState {
  success: boolean
  message: string | null
  validationErrors: Record<string, string[]> | null
}

export function useFormState(
  action: (data: FormData) => Promise<FormState>,
  initialState?: FormState,
) {
  const [formState, setFormState] = useState<FormState>(
    initialState ?? {
      success: false,
      message: null,
      validationErrors: null,
    },
  )
  const [isPending, startTransition] = useTransition()

  async function handleAction(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = e.currentTarget
    const data = new FormData(form)

    startTransition(async () => {
      const state = await action(data)

      setFormState(state)
    })
  }

  return [formState, handleAction, isPending] as const
}
