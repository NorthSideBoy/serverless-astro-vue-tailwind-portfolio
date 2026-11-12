import { shallowRef } from 'vue'
import { contactSubmitErrorKey, type ContactSubmitErrorKey } from '@/lib/forms/errors'

export type ContactSubmissionState = 'idle' | 'sending' | 'success' | 'error'

export function useContactSubmission() {
  const state = shallowRef<ContactSubmissionState>('idle')
  const error = shallowRef<ContactSubmitErrorKey | null>(null)

  async function run(action: () => Promise<void>): Promise<boolean> {
    state.value = 'sending'
    error.value = null

    try {
      await action()
      state.value = 'success'
      return true
    } catch (cause) {
      error.value = contactSubmitErrorKey(cause)
      state.value = 'error'
      return false
    }
  }

  function reset(): void {
    state.value = 'idle'
    error.value = null
  }

  return { state, error, run, reset }
}
