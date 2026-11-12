import { computed, ref } from 'vue'
import {
  createEmptyContactDraft,
  validateContactDraft,
  type ContactDraft,
  type ContactFormErrors,
} from '@/data/contact'
import type { Locale } from '@/data/schemas/primitives'

export function useContactForm(options: { locale: Locale }) {
  const draft = ref<ContactDraft>(createEmptyContactDraft(options.locale))
  const showErrors = ref(false)

  const errors = computed<ContactFormErrors>(() => validateContactDraft(draft.value))
  const isValid = computed(() => Object.keys(errors.value).length === 0)
  const messageLength = computed(() => Array.from(draft.value.message).length)

  function revealErrors(): ContactFormErrors {
    showErrors.value = true
    return errors.value
  }

  function reset(): void {
    draft.value = createEmptyContactDraft(options.locale)
    showErrors.value = false
  }

  return {
    draft,
    errors,
    isValid,
    showErrors,
    messageLength,
    revealErrors,
    reset,
  }
}
