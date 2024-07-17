import { type FormEvent, useState, useTransition } from 'react'

interface ActionResponse {
  success: boolean
  message: string | null
  validationErrors: Record<string, string[]> | null
}

interface FormState extends ActionResponse {
  hasBeenCalled: number
}

export function useFormState(
  action: (data: FormData) => Promise<ActionResponse>,
  initialState?: FormState,
) {
  const [formState, setFormState] = useState<FormState>(
    initialState ?? {
      success: false,
      message: null,
      validationErrors: null,
      hasBeenCalled: 0,
    },
  )
  const [isPending, startTransition] = useTransition()

  async function handleAction(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = e.currentTarget
    const data = new FormData(form)

    startTransition(async () => {
      const state = await action(data)

      setFormState((prevState) => ({
        ...state,
        hasBeenCalled: prevState.hasBeenCalled + 1,
      }))
    })
  }

  return [formState, handleAction, isPending] as const
}
