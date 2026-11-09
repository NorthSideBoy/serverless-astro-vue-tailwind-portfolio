import { shallowRef } from 'vue'
import { publishErrorKey, type PublishErrorKey } from '@/lib/reviews/errors'

export type ReviewSubmissionState = 'idle' | 'publishing' | 'success' | 'error'

export function useReviewSubmission() {
  const state = shallowRef<ReviewSubmissionState>('idle')
  const error = shallowRef<PublishErrorKey | null>(null)

  async function run(action: () => Promise<void>): Promise<boolean> {
    state.value = 'publishing'
    error.value = null

    try {
      await action()
      state.value = 'success'
      return true
    } catch (cause) {
      error.value = publishErrorKey(cause)
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
