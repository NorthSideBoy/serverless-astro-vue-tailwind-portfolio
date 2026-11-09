import { computed, ref } from 'vue'
import {
  createReviewAnchorId,
  normalizeRoles,
  validateReviewDraft,
  REVIEW_LIMITS,
  type ReviewDraft,
} from '@/data/reviews'
import type { Locale } from '@/data/schemas/primitives'

export function createEmptyReviewDraft(locale: Locale): ReviewDraft {
  return {
    anchorId: createReviewAnchorId(),
    roles: [],
    experienceIds: [],
    projectSlugs: [],
    quote: '',
    locale,
  }
}

export function useReviewDraft(options: {
  locale: Locale
  initial?: ReviewDraft | null
}) {
  const draft = ref<ReviewDraft>(
    options.initial
      ? { ...options.initial, locale: options.locale }
      : createEmptyReviewDraft(options.locale),
  )
  const baseline = ref(JSON.stringify(draft.value))

  const errors = computed(() => validateReviewDraft(draft.value))
  const isValid = computed(() => Object.keys(errors.value).length === 0)
  const isDirty = computed(() => JSON.stringify(draft.value) !== baseline.value)
  const quoteLength = computed(() => draft.value.quote.length)
  const relationCount = computed(
    () => draft.value.experienceIds.length + draft.value.projectSlugs.length,
  )
  const relationsAtMax = computed(() => relationCount.value >= REVIEW_LIMITS.relationsMax)

  function reset(next?: ReviewDraft | null): void {
    draft.value = next
      ? { ...next, locale: options.locale }
      : createEmptyReviewDraft(options.locale)
    baseline.value = JSON.stringify(draft.value)
  }

  function markSaved(): void {
    baseline.value = JSON.stringify(draft.value)
  }

  function addRole(value: string): boolean {
    const role = value.trim()
    if (!role) return false
    if (role.length < REVIEW_LIMITS.roleMin || role.length > REVIEW_LIMITS.roleMax) {
      return false
    }

    const next = normalizeRoles([...draft.value.roles, role])
    if (next.length > REVIEW_LIMITS.rolesMax) return false
    if (next.length === draft.value.roles.length) return false

    draft.value = { ...draft.value, roles: next }
    return true
  }

  function removeRole(index: number): void {
    draft.value = {
      ...draft.value,
      roles: draft.value.roles.filter((_, roleIndex) => roleIndex !== index),
    }
  }

  function toggleExperience(id: string): void {
    const selected = draft.value.experienceIds.includes(id)
    if (selected) {
      draft.value = {
        ...draft.value,
        experienceIds: draft.value.experienceIds.filter((entry) => entry !== id),
      }
      return
    }

    if (relationsAtMax.value) return
    draft.value = {
      ...draft.value,
      experienceIds: [...draft.value.experienceIds, id],
    }
  }

  function toggleProject(slug: string): void {
    const selected = draft.value.projectSlugs.includes(slug)
    if (selected) {
      draft.value = {
        ...draft.value,
        projectSlugs: draft.value.projectSlugs.filter((entry) => entry !== slug),
      }
      return
    }

    if (relationsAtMax.value) return
    draft.value = {
      ...draft.value,
      projectSlugs: [...draft.value.projectSlugs, slug],
    }
  }

  return {
    draft,
    errors,
    isValid,
    isDirty,
    quoteLength,
    relationCount,
    relationsAtMax,
    reset,
    markSaved,
    addRole,
    removeRole,
    toggleExperience,
    toggleProject,
  }
}
