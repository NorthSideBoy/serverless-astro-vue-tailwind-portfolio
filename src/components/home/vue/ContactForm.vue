<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { usePreferences } from '@/composables/usePreferences'
import { useContactForm } from '@/composables/useContactForm'
import { useContactSubmission } from '@/composables/useContactSubmission'
import { prefersReducedMotion } from '@/router/scrollControl'
import {
  CONTACT_FIELDS,
  CONTACT_LIMITS,
  toContactMessage,
  type ContactField,
} from '@/data/contact'

const { copy, locale } = usePreferences()
const { draft, errors, isValid, showErrors, messageLength, revealErrors, reset } =
  useContactForm({ locale: locale.value })
const {
  state,
  error: submitError,
  run: runSubmission,
  reset: resetSubmission,
} = useContactSubmission()

const form = copy.value.contact.form
const messageMax = CONTACT_LIMITS.messageMax
const nameInput = ref<HTMLInputElement | null>(null)

const fieldIds: Record<ContactField, string> = {
  name: 'contact-name',
  email: 'contact-email',
  subject: 'contact-subject',
  message: 'contact-message',
}

const errorMessages = computed<Record<ContactField, string>>(() => {
  const messages: Record<ContactField, string> = {
    name: '',
    email: '',
    subject: '',
    message: '',
  }
  if (!showErrors.value) return messages

  for (const field of CONTACT_FIELDS) {
    const issue = errors.value[field]
    if (issue) messages[field] = form.errors[issue]
  }
  return messages
})

const invalidFields = computed<Record<ContactField, boolean>>(() => ({
  name: Boolean(errorMessages.value.name),
  email: Boolean(errorMessages.value.email),
  subject: Boolean(errorMessages.value.subject),
  message: Boolean(errorMessages.value.message),
}))

function describedBy(field: ContactField): string | undefined {
  const message = errorMessages.value[field]
  if (field === 'message') {
    return message
      ? 'contact-message-count contact-message-error'
      : 'contact-message-count'
  }
  return message ? `contact-${field}-error` : undefined
}

const submitErrorText = computed(() =>
  state.value === 'error' && submitError.value ? form.submitErrors[submitError.value] : '',
)

function focusFirstInvalid(): void {
  const field = CONTACT_FIELDS.find((name) => errors.value[name])
  if (field) document.getElementById(fieldIds[field])?.focus()
}

watch(
  state,
  (next) => {
    if (next !== 'error') return
    void nextTick(() => {
      const alert = document.getElementById('contact-form-error')
      alert?.focus({ preventScroll: true })
      alert?.scrollIntoView({
        block: 'center',
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      })
    })
  },
  { flush: 'post' },
)

async function submit(): Promise<void> {
  if (state.value === 'sending') return
  resetSubmission()
  revealErrors()

  if (!isValid.value) {
    focusFirstInvalid()
    return
  }

  const message = toContactMessage(draft.value)
  const ok = await runSubmission(async () => {
    // The SDK and the repository are imported on submit only: visiting the
    // page must not download or call Firebase.
    const [{ createContactMessage }, { getFirestoreDatabase }, { notifyContactMessage }] =
      await Promise.all([
        import('@/lib/forms/repository'),
        import('@/lib/firebase/client'),
        import('@/lib/notifications/emailjs'),
      ])
    await createContactMessage(await getFirestoreDatabase(), message)

    // The message is stored: success no longer depends on the notification.
    // A failed or slow email is reported as neither an error nor a retry.
    await notifyContactMessage(message)
  })

  if (!ok) {
    if (import.meta.env.DEV) {
      console.error('[contact] submit failed:', submitError.value)
    }
    return
  }

  reset()
  await nextTick()
  document.getElementById('contact-form-status')?.focus()
}

async function sendAnother(): Promise<void> {
  reset()
  resetSubmission()
  await nextTick()
  nameInput.value?.focus()
}
</script>

<template>
  <div v-if="state === 'success'" role="status" class="px-5 py-7 md:px-6 md:py-8">
    <h3
      id="contact-form-status"
      tabindex="-1"
      class="font-display text-[22px] font-semibold leading-[1.2] tracking-[-0.02em] text-ink md:text-[26px]"
    >
      {{ form.successTitle }}
    </h3>
    <p class="mt-3 max-w-[46ch] text-[14px] leading-[1.7] text-muted md:text-[15px]">
      {{ form.successBody }}
    </p>
    <button type="button" class="btn-ghost mt-6 w-full" @click="sendAnother">
      {{ form.sendAnother }}
    </button>
  </div>
  <form
    v-else
    class="px-5 py-5 md:px-6 md:py-6"
    aria-labelledby="contact-form-title"
    novalidate
    @submit.prevent="submit"
  >
    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label
          for="contact-name"
          class="mb-2 block font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-icon"
        >
          {{ form.nameLabel }}
        </label>
        <input
          id="contact-name"
          ref="nameInput"
          v-model="draft.name"
          type="text"
          name="name"
          autocomplete="name"
          class="field"
          :placeholder="form.namePlaceholder"
          :maxlength="CONTACT_LIMITS.nameMax"
          :aria-invalid="invalidFields.name"
          :aria-describedby="describedBy('name')"
          required
        />
        <p
          v-if="errorMessages.name"
          id="contact-name-error"
          class="mt-2 text-[12px] text-danger"
          role="alert"
        >
          {{ errorMessages.name }}
        </p>
      </div>

      <div>
        <label
          for="contact-email"
          class="mb-2 block font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-icon"
        >
          {{ form.emailLabel }}
        </label>
        <input
          id="contact-email"
          v-model="draft.email"
          type="email"
          name="email"
          autocomplete="email"
          inputmode="email"
          class="field"
          :placeholder="form.emailPlaceholder"
          :maxlength="CONTACT_LIMITS.emailMax"
          :aria-invalid="invalidFields.email"
          :aria-describedby="describedBy('email')"
          required
        />
        <p
          v-if="errorMessages.email"
          id="contact-email-error"
          class="mt-2 text-[12px] text-danger"
          role="alert"
        >
          {{ errorMessages.email }}
        </p>
      </div>

      <div class="sm:col-span-2">
        <label
          for="contact-subject"
          class="mb-2 block font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-icon"
        >
          {{ form.subjectLabel }}
        </label>
        <input
          id="contact-subject"
          v-model="draft.subject"
          type="text"
          name="subject"
          autocomplete="off"
          class="field"
          :placeholder="form.subjectPlaceholder"
          :maxlength="CONTACT_LIMITS.subjectMax"
          :aria-invalid="invalidFields.subject"
          :aria-describedby="describedBy('subject')"
          required
        />
        <p
          v-if="errorMessages.subject"
          id="contact-subject-error"
          class="mt-2 text-[12px] text-danger"
          role="alert"
        >
          {{ errorMessages.subject }}
        </p>
      </div>

      <div class="sm:col-span-2">
        <label
          for="contact-message"
          class="mb-2 block font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-icon"
        >
          {{ form.messageLabel }}
        </label>
        <textarea
          id="contact-message"
          v-model="draft.message"
          name="message"
          rows="4"
          class="field min-h-[104px] resize-y"
          :placeholder="form.messagePlaceholder"
          :maxlength="messageMax"
          :aria-invalid="invalidFields.message"
          :aria-describedby="describedBy('message')"
          required
        />
        <div class="mt-2 flex flex-wrap items-start justify-between gap-2">
          <p
            id="contact-message-count"
            class="font-mono text-[10px] uppercase tracking-[0.06em]"
            :class="messageLength > messageMax ? 'text-danger' : 'text-muted'"
          >
            {{ messageLength }} / {{ messageMax }}
          </p>
          <p
            v-if="errorMessages.message"
            id="contact-message-error"
            class="text-[12px] text-danger"
            role="alert"
          >
            {{ errorMessages.message }}
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="state === 'error' && submitErrorText"
      id="contact-form-error"
      tabindex="-1"
      class="mt-5 border border-danger p-4"
      role="alert"
    >
      <p class="font-mono text-[10px] uppercase tracking-[0.1em] text-danger">
        {{ form.errorTitle }}
      </p>
      <p class="mt-1 text-[13px] leading-relaxed text-danger">{{ submitErrorText }}</p>
      <div class="mt-3 flex flex-wrap items-center gap-4">
        <button
          type="button"
          class="inline-flex min-h-11 items-center text-[13px] text-soft underline"
          @click="submit"
        >
          {{ copy.ui.retryContent }}
        </button>
        <a
          :href="`mailto:${copy.seo.email}`"
          class="inline-flex min-h-11 items-center text-[13px] text-muted underline"
        >
          {{ copy.seo.email }}
        </a>
      </div>
    </div>

    <div class="mt-6 border-t border-line pt-5">
      <button
        type="submit"
        class="btn-primary w-full"
        :disabled="state === 'sending'"
        :aria-busy="state === 'sending'"
        :aria-describedby="
          state === 'error' && submitErrorText ? 'contact-form-error' : undefined
        "
      >
        {{ state === 'sending' ? form.sending : form.submit }}
      </button>
    </div>
  </form>
</template>
