<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { RouterLink } from '@/router/astroRouter'
import { prefersReducedMotion } from '@/router/scrollControl'
import { usePreferences } from '@/composables/usePreferences'
import { useReviewSession } from '@/composables/useReviewSession'
import { useReviewDraft } from '@/composables/useReviewDraft'
import { useReviewSubmission } from '@/composables/useReviewSubmission'
import { getReviewsDatabase } from '@/lib/firebase/client'
import {
  createReview,
  getOwnReview,
  updateReview,
  type ReviewRecord,
} from '@/lib/reviews/repository'
import { publishErrorKey, type PublishErrorKey } from '@/lib/reviews/errors'
import {
  initialsFromName,
  normalizeRoles,
  REVIEW_LIMITS,
  type ReviewDraft,
  type ReviewDraftIssue,
} from '@/data/reviews'
import { reviewsPath } from '@/data/paths'
import type { ReviewExperience, ReviewProject, Testimonial } from '@/data/testimonials'
import SealEyebrow from '@/components/ui/vue/SealEyebrow.vue'
import PlateFrame from '@/components/ui/vue/PlateFrame.vue'
import UiIcon from '@/components/ui/vue/UiIcon.vue'
import Avatar from '@/components/ui/vue/Avatar.vue'
import ReviewCard from '@/components/reviews/vue/ReviewCard.vue'
import RoleTagsInput from '@/components/reviews/vue/RoleTagsInput.vue'
import RelationPicker from '@/components/reviews/vue/RelationPicker.vue'

defineProps<{
  experiences: ReviewExperience[]
  projects: ReviewProject[]
}>()

const { copy, locale } = usePreferences()
const {
  status,
  user,
  error: authError,
  signIn,
  signOut,
  retry: retrySession,
} = useReviewSession()
const {
  draft,
  errors,
  isValid,
  isDirty,
  quoteLength,
  reset,
  markSaved,
  addRole,
  removeRole,
  toggleExperience,
  toggleProject,
} = useReviewDraft({ locale: locale.value })
const {
  state: submissionState,
  error: submissionError,
  run: runSubmission,
  reset: resetSubmission,
} = useReviewSubmission()

type Phase = 'loading' | 'guest' | 'error' | 'new' | 'pending' | 'approved' | 'submitted'

const phase = shallowRef<Phase>('loading')
const record = shallowRef<ReviewRecord | null>(null)
const recordError = shallowRef<PublishErrorKey | null>(null)
const showErrors = ref(false)
const showSignOutConfirm = ref(false)
const loadedUid = shallowRef<string | null>(null)

const DRAFT_KEY = 'sl-review-draft'

type StoredDraft = {
  version: 1
  uid: string
  savedAt: number
  draft: ReviewDraft
}

function readStoredDraft(uid: string): ReviewDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return null

    const stored = JSON.parse(raw) as Partial<StoredDraft>
    if (stored.version !== 1 || stored.uid !== uid || !stored.draft) return null
    const candidate = stored.draft
    if (
      typeof candidate.anchorId !== 'string' ||
      !Array.isArray(candidate.roles) ||
      !Array.isArray(candidate.experienceIds) ||
      !Array.isArray(candidate.projectSlugs) ||
      typeof candidate.quote !== 'string'
    ) {
      return null
    }

    return {
      anchorId: candidate.anchorId,
      roles: normalizeRoles(candidate.roles.filter((role): role is string => typeof role === 'string')),
      experienceIds: candidate.experienceIds.filter(
        (id): id is string => typeof id === 'string',
      ),
      projectSlugs: candidate.projectSlugs.filter(
        (slug): slug is string => typeof slug === 'string',
      ),
      quote: candidate.quote,
      locale: candidate.locale === 'en' ? 'en' : 'es',
    }
  } catch {
    return null
  }
}

function writeStoredDraft(uid: string): void {
  try {
    const payload: StoredDraft = {
      version: 1,
      uid,
      savedAt: Date.now(),
      draft: cloneDraft(draft.value),
    }
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(payload))
  } catch {
    // Storage may be disabled or full; the form keeps working in memory.
  }
}

function clearStoredDraft(): void {
  try {
    sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    // Ignore disabled storage.
  }
}

let draftTimer: number | undefined
let draftWritesSuppressed = false

function scheduleDraftWrite(): void {
  if (draftWritesSuppressed) return
  const currentUser = user.value
  if (!currentUser) return
  if (phase.value !== 'new' && phase.value !== 'pending') return

  if (draftTimer) window.clearTimeout(draftTimer)
  draftTimer = window.setTimeout(() => writeStoredDraft(currentUser.uid), 450)
}

watch(draft, scheduleDraftWrite, { deep: true })

onBeforeUnmount(() => {
  if (draftTimer) window.clearTimeout(draftTimer)
})

const quoteMax = REVIEW_LIMITS.quoteMax
const roleMax = REVIEW_LIMITS.rolesMax
const relationMax = REVIEW_LIMITS.relationsMax

function redirectToAccess(): void {
  if (typeof window === 'undefined') return
  window.location.replace(reviewsPath(locale.value))
}

function focusHeading(id: string): void {
  nextTick(() => document.getElementById(id)?.focus())
}

function cloneDraft(source: ReviewDraft): ReviewDraft {
  return {
    ...source,
    roles: [...source.roles],
    experienceIds: [...source.experienceIds],
    projectSlugs: [...source.projectSlugs],
  }
}

async function loadOwnReview(uid: string): Promise<void> {
  phase.value = 'loading'
  recordError.value = null
  showErrors.value = false
  showSignOutConfirm.value = false
  resetSubmission()

  try {
    const db = await getReviewsDatabase()
    if (user.value?.uid !== uid) return
    const existing = await getOwnReview(db, uid)
    if (user.value?.uid !== uid) return
    record.value = existing

    if (existing) {
      reset(existing.draft)
      phase.value = existing.approved ? 'approved' : 'pending'
      if (existing.approved) clearStoredDraft()
    } else {
      reset(readStoredDraft(uid))
      phase.value = 'new'
    }
  } catch (cause) {
    if (user.value?.uid !== uid) return
    record.value = null
    recordError.value = publishErrorKey(cause)
    phase.value = 'error'
  }
}

watch(
  [status, user],
  ([currentStatus, currentUser]) => {
    if (currentStatus === 'loading') {
      phase.value = 'loading'
      return
    }

    if (currentStatus === 'guest') {
      phase.value = 'guest'
      redirectToAccess()
      return
    }

    if (currentStatus === 'error') {
      phase.value = 'error'
      return
    }

    if (!currentUser || loadedUid.value === currentUser.uid) return
    loadedUid.value = currentUser.uid
    void loadOwnReview(currentUser.uid)
  },
  { immediate: true },
)

const authErrorText = computed(() =>
  authError.value && authError.value !== 'cancelled'
    ? copy.value.reviews.panel.errors.auth[authError.value]
    : '',
)
const recordErrorText = computed(() => {
  if (!recordError.value) return ''
  if (recordError.value === 'permission-denied') return copy.value.ui.errorContent
  return copy.value.reviews.panel.errors.publish[recordError.value]
})
const publishErrorText = computed(() =>
  submissionState.value === 'error' && submissionError.value
    ? copy.value.reviews.panel.errors.publish[submissionError.value]
    : '',
)
const roleErrorMessage = computed(() =>
  showErrors.value && errors.value.roles
    ? copy.value.reviews.panel.errors.validation[errors.value.roles]
    : '',
)
const quoteErrorMessage = computed(() => {
  if (!errors.value.quote) return ''
  if (!showErrors.value && quoteLength.value <= quoteMax) return ''
  return copy.value.reviews.panel.errors.validation[errors.value.quote]
})
const relationErrorMessage = computed(() =>
  showErrors.value && errors.value.relations
    ? copy.value.reviews.panel.errors.validation[errors.value.relations]
    : '',
)
const formErrorMessages = computed(() => {
  if (!showErrors.value) return []
  return [errors.value.roles, errors.value.quote, errors.value.relations]
    .filter((issue): issue is ReviewDraftIssue => Boolean(issue))
    .map((issue) => copy.value.reviews.panel.errors.validation[issue])
})
const quoteInvalid = computed(
  () => quoteLength.value > quoteMax || (showErrors.value && Boolean(errors.value.quote)),
)
const quoteDescribedBy = computed(() => {
  const ids = ['review-quote-hint', 'review-quote-count']
  if (quoteErrorMessage.value) ids.push('review-quote-error')
  return ids.join(' ')
})

watch(
  [submissionState, submissionError],
  ([state]) => {
    if (state !== 'error') return
    void nextTick(() => {
      const alert = document.getElementById('review-publish-error')
      alert?.focus({ preventScroll: true })
      alert?.scrollIntoView({
        block: 'center',
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      })
    })
  },
  { flush: 'post' },
)

const previewDraft = computed(() =>
  (phase.value === 'approved' || phase.value === 'submitted') && record.value
    ? record.value.draft
    : draft.value,
)
const previewAuthor = computed(() => {
  if ((phase.value === 'approved' || phase.value === 'submitted') && record.value) {
    return record.value.author
  }
  return {
    name: user.value?.displayName ?? '',
    email: user.value?.email ?? '',
    photoUrl: user.value?.photoUrl ?? null,
  }
})
const previewReview = computed<Testimonial>(() => ({
  anchorId: previewDraft.value.anchorId,
  locale: previewDraft.value.locale,
  author: {
    provider: 'Google',
    name: previewAuthor.value.name,
    email: previewAuthor.value.email,
    photo: previewAuthor.value.photoUrl,
    initials: initialsFromName(previewAuthor.value.name),
    roles: previewDraft.value.roles,
  },
  quote: previewDraft.value.quote,
  experienceIds: previewDraft.value.experienceIds,
  projectSlugs: previewDraft.value.projectSlugs,
  createdAt: new Date(
    phase.value === 'approved' || phase.value === 'submitted'
      ? (record.value?.updatedAt ?? Date.now())
      : Date.now(),
  ).toISOString(),
}))

function focusFirstInvalid(): void {
  const id = errors.value.roles
    ? 'review-roles'
    : errors.value.quote
      ? 'review-quote'
      : errors.value.relations
        ? 'review-relations'
        : null
  if (id) document.getElementById(id)?.focus()
}

async function publish(): Promise<void> {
  showErrors.value = true
  resetSubmission()
  const currentUser = user.value

  if (!currentUser) {
    await signIn()
    return
  }

  if (!isValid.value) {
    focusFirstInvalid()
    return
  }

  const existing = record.value
  const wasEdited = Boolean(existing)
  const ok = await runSubmission(async () => {
    const db = await getReviewsDatabase()
    if (wasEdited) await updateReview(db, currentUser, draft.value)
    else await createReview(db, currentUser, draft.value)
  })

  if (ok) {
    const now = Date.now()
    record.value = {
      anchorId: draft.value.anchorId,
      approved: false,
      draft: cloneDraft(draft.value),
      author: {
        name: currentUser.displayName,
        email: currentUser.email,
        photoUrl: currentUser.photoUrl,
      },
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }
    markSaved()
    showErrors.value = false
    clearStoredDraft()
    phase.value = 'submitted'
    focusHeading('review-status-title')
    return
  }

  if (import.meta.env.DEV) {
    console.error('[review] publish failed:', submissionError.value)
  }

  if (submissionError.value === 'permission-denied') {
    try {
      const db = await getReviewsDatabase()
      const latest = await getOwnReview(db, currentUser.uid)
      if (latest?.approved) {
        record.value = latest
        reset(latest.draft)
        markSaved()
        resetSubmission()
        clearStoredDraft()
        phase.value = 'approved'
        focusHeading('review-status-title')
      }
    } catch {
      // Keep the form and its error message; the user can retry.
    }
  }
}

function discard(): void {
  reset(record.value?.draft ?? null)
  resetSubmission()
  showErrors.value = false
}

function startEdit(): void {
  if (!record.value || record.value.approved) return
  reset(record.value.draft)
  markSaved()
  resetSubmission()
  showErrors.value = false
  phase.value = 'pending'
  void nextTick(() => document.getElementById('review-quote')?.focus())
}

function requestSignOut(): void {
  if (isDirty.value) {
    showSignOutConfirm.value = true
    return
  }
  void completeSignOut()
}

async function completeSignOut(): Promise<void> {
  showSignOutConfirm.value = false
  draftWritesSuppressed = true
  clearStoredDraft()
  reset(null)
  await signOut()
  if (authError.value) {
    draftWritesSuppressed = false
    return
  }
  redirectToAccess()
}

function retryPhase(): void {
  if (recordError.value && user.value) {
    loadedUid.value = null
    void loadOwnReview(user.value.uid)
    return
  }
  void retrySession()
}
</script>

<template>
  <main id="main">
    <section
      class="dot-field dot-field--quiet relative overflow-hidden border-b border-line bg-section"
      aria-labelledby="review-panel-title"
    >
      <div class="shell relative py-12 md:py-16 xl:py-20">
        <RouterLink
          :to="{ name: 'home', hash: '#testimonials' }"
          class="inline-flex min-h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted transition hover:text-soft"
        >
          <UiIcon name="arrow-left" :size="14" />
          {{ copy.reviews.panel.back }}
        </RouterLink>

        <div class="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-[760px]">
            <p class="mono-label text-soft">
              <SealEyebrow seal="十" :label="copy.reviews.panel.eyebrow" />
            </p>
            <h1
              id="review-panel-title"
              class="mt-4 font-display text-[38px] font-bold leading-[1.05] tracking-[-0.03em] text-ink md:text-[50px] xl:text-[58px]"
            >
              {{ copy.reviews.panel.title }}
            </h1>
            <p class="mt-4 max-w-[680px] text-[15px] leading-[1.7] text-muted md:text-base">
              {{ copy.reviews.panel.lead }}
            </p>
            <a
              v-if="phase === 'new' || phase === 'pending'"
              href="#review-preview"
              class="mt-4 inline-flex min-h-11 items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-soft lg:hidden"
            >
              {{ copy.reviews.panel.preview.jump }}
              <UiIcon name="arrow-down" :size="14" />
            </a>
          </div>

          <div v-if="user" class="w-full max-w-[430px] border border-line bg-panel/10 p-4">
            <div class="flex items-start gap-3">
              <Avatar
                :name="user.displayName"
                :photo="user.photoUrl"
                :size="44"
                eager
              />
              <div class="min-w-0 flex-1">
                <p class="font-mono text-[10px] uppercase tracking-[0.1em] text-soft">
                  {{ copy.reviews.panel.sessionLabel }}
                </p>
                <p
                  class="mt-1 truncate font-display text-[16px] font-semibold leading-tight text-ink"
                >
                  {{ user.displayName }}
                </p>
                <p class="truncate font-mono text-[10.5px] text-muted">{{ user.email }}</p>
              </div>
            </div>
            <button
              type="button"
              class="mt-3 inline-flex min-h-11 items-center text-[12px] text-soft underline"
              @click="requestSignOut"
            >
              {{ copy.reviews.panel.switchAccount }}
            </button>

            <div
              v-if="showSignOutConfirm"
              class="mt-3 border border-line bg-panel/20 p-4"
              role="group"
              aria-labelledby="review-signout-title"
            >
              <p
                id="review-signout-title"
                class="font-display text-[15px] font-semibold text-ink"
              >
                {{ copy.reviews.panel.signOut.title }}
              </p>
              <p class="mt-1 text-[12.5px] leading-relaxed text-muted">
                {{ copy.reviews.panel.signOut.body }}
              </p>
              <div class="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  class="btn-ghost min-h-11 px-4 text-[13px]"
                  @click="completeSignOut"
                >
                  {{ copy.reviews.panel.signOut.confirm }}
                </button>
                <button
                  type="button"
                  class="inline-flex min-h-11 items-center px-2 text-[13px] text-muted underline"
                  @click="showSignOutConfirm = false"
                >
                  {{ copy.reviews.panel.signOut.cancel }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-pad bg-page">
      <div class="shell">
        <noscript
          class="mb-6 block border border-line bg-panel/20 p-4 text-[13px] text-ink"
        >
          {{ copy.reviews.panel.noscript }}
        </noscript>

        <div
          v-if="phase === 'loading' || phase === 'guest' || phase === 'error'"
          class="mx-auto max-w-[680px] border border-line bg-panel/10 p-6 md:p-8"
        >
          <p v-if="phase === 'loading'" class="text-[13.5px] text-muted" role="status">
            {{ copy.reviews.panel.checking }}
          </p>
          <p v-else-if="phase === 'guest'" class="text-[13.5px] text-muted" role="status">
            {{ copy.reviews.panel.redirecting }}
          </p>
          <div v-else role="alert">
            <p class="text-[13.5px] leading-relaxed text-danger">
              {{ authErrorText || recordErrorText || copy.ui.errorContent }}
            </p>
            <button
              type="button"
              class="mt-4 inline-flex min-h-11 items-center text-[13px] text-soft underline"
              @click="retryPhase"
            >
              {{ copy.ui.retryContent }}
            </button>
          </div>
        </div>

        <div
          v-else-if="phase === 'approved' || phase === 'submitted'"
          class="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start"
        >
          <div class="border border-line bg-panel/10 p-6 md:p-8">
            <UiIcon name="circle-check" :size="28" class="text-status" />
            <h2
              id="review-status-title"
              tabindex="-1"
              class="mt-4 font-display text-[26px] font-semibold leading-tight tracking-[-0.02em] text-ink focus:outline-none md:text-[30px]"
            >
              {{
                phase === 'approved'
                  ? copy.reviews.panel.status.approvedTitle
                  : copy.reviews.panel.status.submittedTitle
              }}
            </h2>
            <p class="mt-3 text-[14px] leading-[1.7] text-muted">
              {{
                phase === 'approved'
                  ? copy.reviews.panel.status.approvedBody
                  : copy.reviews.panel.status.submittedBody
              }}
            </p>
            <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <RouterLink
                :to="{ name: 'home', hash: '#testimonials' }"
                class="btn-ghost w-full sm:w-auto"
              >
                {{
                  phase === 'approved'
                    ? copy.reviews.panel.status.approvedAction
                    : copy.reviews.panel.actions.home
                }}
              </RouterLink>
              <button
                v-if="phase === 'submitted'"
                type="button"
                class="btn-ghost w-full sm:w-auto"
                @click="startEdit"
              >
                {{ copy.reviews.panel.actions.edit }}
              </button>
              <a
                v-if="phase === 'approved'"
                :href="`mailto:${copy.seo.email}`"
                class="inline-flex min-h-11 items-center text-[13px] text-soft underline"
              >
                {{ copy.reviews.panel.contact }}
              </a>
            </div>
          </div>

          <aside class="lg:sticky lg:top-28 xl:top-36">
            <p class="mono-label text-soft">{{ copy.reviews.panel.preview.title }}</p>
            <p class="mt-2 text-[12.5px] leading-relaxed text-muted">
              {{ copy.reviews.panel.preview.note }}
            </p>
            <div class="mt-4">
              <ReviewCard
                :review="previewReview"
                :experiences="experiences"
                :projects="projects"
                preview
              />
            </div>
            <p
              v-if="phase === 'submitted'"
              class="mt-4 inline-flex border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted"
            >
              {{ copy.reviews.panel.preview.pending }}
            </p>
          </aside>
        </div>

        <div
          v-else
          class="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start xl:gap-16"
        >
          <form novalidate @submit.prevent="publish">
            <div
              v-if="record && !record.approved"
              class="mb-5 border border-line bg-panel/20 p-4"
            >
              <p class="font-mono text-[10px] uppercase tracking-[0.1em] text-soft">
                {{ copy.reviews.panel.status.pendingTitle }}
              </p>
              <p class="mt-1 text-[13px] leading-relaxed text-muted">
                {{ copy.reviews.panel.status.pendingBody }}
              </p>
            </div>

            <div
              v-if="formErrorMessages.length"
              class="mb-5 border border-danger p-4"
              role="alert"
            >
              <p class="font-mono text-[10px] uppercase tracking-[0.1em] text-danger">
                {{ copy.reviews.panel.status.invalidTitle }}
              </p>
              <ul class="mt-2 list-disc space-y-1 pl-5 text-[13px] text-danger">
                <li v-for="message in formErrorMessages" :key="message">{{ message }}</li>
              </ul>
            </div>

            <PlateFrame>
              <div class="divide-y divide-line">
                <section class="p-5 md:p-7">
                  <div class="flex items-baseline gap-3">
                    <span class="font-mono text-[10px] tracking-[0.12em] text-soft">01</span>
                    <h2 class="mono-label text-soft">
                      {{ copy.reviews.panel.sections.relations }}
                    </h2>
                  </div>
                  <div class="mt-5 space-y-7">
                    <RoleTagsInput
                      :roles="draft.roles"
                      :label="copy.reviews.panel.fields.rolesLabel"
                      :hint="copy.reviews.panel.fields.rolesHint"
                      :placeholder="copy.reviews.panel.fields.rolesPlaceholder"
                      :remove-label="copy.reviews.panel.fields.rolesRemove"
                      :full-message="copy.reviews.panel.fields.rolesFull"
                      :invalid-message="copy.reviews.panel.fields.rolesInvalid"
                      :max="roleMax"
                      :invalid="Boolean(showErrors && errors.roles)"
                      :error-message="roleErrorMessage"
                      @add="addRole"
                      @remove="removeRole"
                    />
                    <div>
                      <RelationPicker
                        :experiences="experiences"
                        :projects="projects"
                        :selected-experiences="draft.experienceIds"
                        :selected-projects="draft.projectSlugs"
                        :max="relationMax"
                        :label="copy.reviews.panel.fields.relationLabel"
                        :hint="copy.reviews.panel.fields.relationHint"
                        :optional-note="copy.reviews.panel.fields.relationOptional"
                        :experience-group="copy.reviews.panel.fields.experienceGroup"
                        :project-group="copy.reviews.panel.fields.projectGroup"
                        :max-message="copy.reviews.panel.fields.relationMax"
                        @toggle-experience="toggleExperience"
                        @toggle-project="toggleProject"
                      />
                      <p
                        v-if="relationErrorMessage"
                        class="mt-2 text-[12px] text-danger"
                        role="alert"
                      >
                        {{ relationErrorMessage }}
                      </p>
                    </div>
                  </div>
                </section>

                <section class="p-5 md:p-7">
                  <div class="flex items-baseline gap-3">
                    <span class="font-mono text-[10px] tracking-[0.12em] text-soft">02</span>
                    <h2 class="mono-label text-soft">
                      {{ copy.reviews.panel.sections.testimonial }}
                    </h2>
                  </div>

                  <label
                    for="review-quote"
                    class="mt-5 mb-2 block font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-muted"
                  >
                    {{ copy.reviews.panel.fields.quoteLabel }}
                  </label>
                  <p id="review-quote-hint" class="mb-2 text-[12px] leading-[1.6] text-muted">
                    {{ copy.reviews.panel.fields.quoteHint }}
                  </p>
                  <textarea
                    id="review-quote"
                    v-model="draft.quote"
                    rows="8"
                    class="field min-h-[180px] resize-y"
                    :lang="draft.locale"
                    :placeholder="copy.reviews.panel.fields.quotePlaceholder"
                    :aria-invalid="quoteInvalid"
                    :aria-describedby="quoteDescribedBy"
                    spellcheck="true"
                    :maxlength="quoteMax"
                    required
                  />
                  <div class="mt-2 flex flex-wrap items-start justify-between gap-2">
                    <p
                      id="review-quote-count"
                      class="font-mono text-[10px] uppercase tracking-[0.06em]"
                      :class="quoteLength > quoteMax ? 'text-danger' : 'text-muted'"
                    >
                      {{ quoteLength }} / {{ quoteMax }}
                    </p>
                    <p
                      v-if="quoteErrorMessage"
                      id="review-quote-error"
                      class="text-[12px] text-danger"
                      role="alert"
                    >
                      {{ quoteErrorMessage }}
                    </p>
                  </div>
                </section>

                <section class="p-5 md:p-7">
                  <div class="flex items-baseline gap-3">
                    <span class="font-mono text-[10px] tracking-[0.12em] text-soft">03</span>
                    <h2 class="mono-label text-soft">
                      {{ copy.reviews.panel.sections.publish }}
                    </h2>
                  </div>
                  <p class="mt-4 max-w-[640px] text-[12.5px] leading-[1.65] text-muted">
                    {{ copy.reviews.panel.consent }}
                  </p>
                  <div
                    v-if="submissionState === 'error' && publishErrorText"
                    id="review-publish-error"
                    tabindex="-1"
                    class="mt-5 border border-danger p-4"
                    role="alert"
                  >
                    <p class="font-mono text-[10px] uppercase tracking-[0.1em] text-danger">
                      {{ copy.reviews.panel.status.errorTitle }}
                    </p>
                    <p class="mt-1 text-[13px] leading-relaxed text-danger">
                      {{ publishErrorText }}
                    </p>
                    <div class="mt-3 flex flex-wrap items-center gap-4">
                      <button
                        type="button"
                        class="inline-flex min-h-11 items-center text-[13px] text-soft underline"
                        @click="publish"
                      >
                        {{ copy.ui.retryContent }}
                      </button>
                      <a
                        :href="`mailto:${copy.seo.email}`"
                        class="inline-flex min-h-11 items-center text-[13px] text-muted underline"
                      >
                        {{ copy.reviews.panel.contact }}
                      </a>
                    </div>
                  </div>
                  <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      type="submit"
                      class="btn-primary w-full sm:w-auto"
                      :disabled="submissionState === 'publishing'"
                      :aria-busy="submissionState === 'publishing'"
                      :aria-describedby="
                        submissionState === 'error' && publishErrorText
                          ? 'review-publish-error'
                          : undefined
                      "
                    >
                      {{
                        submissionState === 'publishing'
                          ? record
                            ? copy.reviews.panel.actions.saving
                            : copy.reviews.panel.actions.publishing
                          : record
                            ? copy.reviews.panel.actions.save
                            : copy.reviews.panel.actions.publish
                      }}
                    </button>
                    <button
                      v-if="isDirty"
                      type="button"
                      class="btn-ghost w-full sm:w-auto"
                      @click="discard"
                    >
                      {{ copy.reviews.panel.actions.discard }}
                    </button>
                  </div>
                </section>
              </div>
            </PlateFrame>
          </form>

          <aside id="review-preview" class="lg:sticky lg:top-28 xl:top-36">
            <div class="flex items-baseline justify-between gap-4">
              <p class="mono-label text-soft">{{ copy.reviews.panel.preview.title }}</p>
            </div>
            <p class="mt-2 text-[12.5px] leading-relaxed text-muted">
              {{ copy.reviews.panel.preview.note }}
            </p>
            <div class="mt-4">
              <ReviewCard
                :review="previewReview"
                :experiences="experiences"
                :projects="projects"
                preview
              />
            </div>
            <p
              class="mt-4 inline-flex border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted"
            >
              {{ copy.reviews.panel.preview.pending }}
            </p>
          </aside>
        </div>
      </div>
    </section>
  </main>
</template>
