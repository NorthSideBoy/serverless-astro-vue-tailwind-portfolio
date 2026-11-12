<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { usePreferences } from '@/composables/usePreferences'
import { useContactForm } from '@/composables/useContactForm'
import { useContactSubmission } from '@/composables/useContactSubmission'
import { useGoogleSession } from '@/composables/useGoogleSession'
import { prefersReducedMotion } from '@/router/scrollControl'
import {
  CONTACT_FIELDS,
  CONTACT_LIMITS,
  toContactMessage,
  type ContactField,
} from '@/data/contact'
import Avatar from '@/components/ui/vue/Avatar.vue'
import UiIcon from '@/components/ui/vue/UiIcon.vue'

const { copy, locale } = usePreferences()
const { draft, errors, isValid, showErrors, messageLength, revealErrors, reset } =
  useContactForm({ locale: locale.value })
const {
  status,
  user,
  error: sessionError,
  busy: sessionBusy,
  signIn,
  retry,
} = useGoogleSession()
const {
  state,
  error: submitError,
  run: runSubmission,
  reset: resetSubmission,
} = useContactSubmission()

const form = copy.value.contact.form
const messageMax = CONTACT_LIMITS.messageMax
const subjectInput = ref<HTMLInputElement | null>(null)

const fieldIds: Record<ContactField, string> = {
  subject: 'contact-subject',
  message: 'contact-message',
}

const sessionReady = computed(() => status.value === 'ready' && Boolean(user.value))
const canSubmit = computed(() => sessionReady.value && state.value !== 'sending')
const authErrorText = computed(() =>
  sessionError.value && sessionError.value !== 'cancelled'
    ? form.authErrors[sessionError.value]
    : '',
)

const errorMessages = computed<Record<ContactField, string>>(() => {
  const messages: Record<ContactField, string> = {
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
  if (state.value === 'sending' || !sessionReady.value) return
  const currentUser = user.value
  if (!currentUser) return

  resetSubmission()
  revealErrors()

  if (!isValid.value) {
    focusFirstInvalid()
    return
  }

  // Identity comes from the authenticated session, never from editable fields.
  const message = toContactMessage(draft.value, {
    uid: currentUser.uid,
    name: currentUser.displayName,
    email: currentUser.email,
  })

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
  subjectInput.value?.focus()
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
    <div class="mb-6 border-b border-line pb-5">
      <p class="mono-label text-soft">{{ form.sessionLabel }}</p>

      <p v-if="status === 'loading'" role="status" class="mt-3 text-[13px] leading-[1.65] text-muted">
        {{ form.sessionLoading }}
      </p>

      <div v-else-if="status === 'error'" class="mt-3" role="alert">
        <p class="text-[12.5px] leading-relaxed text-danger">
          {{ authErrorText || form.authErrors.unknown }}
        </p>
        <button
          type="button"
          class="mt-2 inline-flex min-h-11 items-center text-[13px] text-soft underline"
          @click="retry"
        >
          {{ copy.ui.retryContent }}
        </button>
      </div>

      <div v-else-if="user" class="mt-3 flex items-center gap-3">
        <Avatar :name="user.displayName" :photo="user.photoUrl" :size="38" eager />
        <div class="min-w-0 flex-1">
          <p class="truncate font-display text-[15px] font-semibold leading-tight text-ink">
            {{ user.displayName }}
          </p>
          <p class="truncate font-mono text-[10.5px] text-muted">{{ user.email }}</p>
        </div>
        <button
          type="button"
          class="inline-flex min-h-11 shrink-0 items-center text-[12px] text-soft underline"
          :disabled="sessionBusy"
          @click="signIn"
        >
          {{ form.changeAccount }}
        </button>
      </div>

      <div v-else>
        <p class="mt-2 text-[13px] leading-[1.65] text-muted">{{ form.sessionGuest }}</p>
        <p
          v-if="authErrorText"
          class="mt-3 border border-danger px-3 py-2 text-[12.5px] leading-relaxed text-danger"
          role="alert"
        >
          {{ authErrorText }}
        </p>
        <button
          type="button"
          data-contact-signin
          class="btn-ghost mt-3 w-full justify-center"
          :disabled="sessionBusy"
          :aria-busy="sessionBusy"
          @click="signIn"
        >
          <UiIcon name="google" :size="17" />
          {{ sessionBusy ? form.signingIn : form.signIn }}
        </button>
      </div>
    </div>

    <div class="grid gap-4">
      <div>
        <label
          for="contact-subject"
          class="mb-2 block font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-icon"
        >
          {{ form.subjectLabel }}
        </label>
        <input
          id="contact-subject"
          ref="subjectInput"
          v-model="draft.subject"
          type="text"
          name="subject"
          autocomplete="off"
          class="field"
          :placeholder="form.subjectPlaceholder"
          :maxlength="CONTACT_LIMITS.subjectMax"
          :disabled="!sessionReady"
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

      <div>
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
          :disabled="!sessionReady"
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
        :disabled="!canSubmit"
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
