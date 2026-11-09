<script setup lang="ts">
import { computed, ref } from 'vue'
import UiIcon from '@/components/ui/vue/UiIcon.vue'

const props = withDefaults(
  defineProps<{
    roles: string[]
    label: string
    hint: string
    placeholder: string
    removeLabel: string
    fullMessage: string
    invalidMessage: string
    invalid?: boolean
    errorMessage?: string
    inputId?: string
    max?: number
    minLength?: number
    maxLength?: number
  }>(),
  {
    invalid: false,
    errorMessage: '',
    inputId: 'review-roles',
    max: 3,
    minLength: 2,
    maxLength: 60,
  },
)

const emit = defineEmits<{ add: [value: string]; remove: [index: number] }>()

const value = ref('')
const localMessage = ref('')
const messageId = computed(() => `${props.inputId}-message`)
const hintId = computed(() => `${props.inputId}-hint`)
const visibleMessage = computed(() =>
  props.invalid && props.errorMessage ? props.errorMessage : localMessage.value,
)

function commit(): void {
  const parts = value.value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  if (!parts.length) return

  let nextCount = props.roles.length
  for (const part of parts) {
    if (nextCount >= props.max) {
      localMessage.value = props.fullMessage
      break
    }

    if (part.length < props.minLength || part.length > props.maxLength) {
      localMessage.value = props.invalidMessage
      continue
    }

    const duplicate = props.roles.some(
      (role) => role.toLocaleLowerCase() === part.toLocaleLowerCase(),
    )
    if (duplicate) continue

    emit('add', part)
    nextCount += 1
  }

  value.value = ''
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    commit()
    return
  }

  if (event.key === 'Backspace' && !value.value && props.roles.length) {
    emit('remove', props.roles.length - 1)
  }
}

function remove(index: number): void {
  localMessage.value = ''
  emit('remove', index)
}
</script>

<template>
  <div>
    <label
      :for="inputId"
      class="mb-2 block font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-muted"
    >
      {{ label }}
    </label>
    <div class="mb-2 flex items-start justify-between gap-3">
      <p :id="hintId" class="text-[12px] leading-[1.6] text-muted">{{ hint }}</p>
      <span
        class="shrink-0 font-mono text-[10px] uppercase tracking-[0.06em]"
        :class="
          roles.length > max
            ? 'text-danger'
            : roles.length === max
              ? 'text-soft'
              : 'text-muted'
        "
      >
        {{ roles.length }}/{{ max }}
      </span>
    </div>

    <div
      class="flex min-h-13 flex-wrap items-center gap-2 rounded-[8px] border bg-sunken p-2 transition-colors focus-within:border-soft focus-within:outline-2 focus-within:outline-soft"
      :class="invalid ? 'border-danger' : 'border-line hover:border-line-strong'"
    >
      <ul class="contents" role="list" :aria-label="label">
        <li v-for="(role, index) in roles" :key="`${role}-${index}`">
          <span
            class="inline-flex min-h-8 items-center gap-1 border border-line bg-panel/30 py-1 pl-2.5 pr-1 text-[11.5px] leading-tight text-soft"
          >
            {{ role }}
            <button
              type="button"
              class="inline-flex h-6 w-6 items-center justify-center text-muted transition hover:text-ink"
              :aria-label="`${removeLabel}: ${role}`"
              @click="remove(index)"
            >
              <UiIcon name="x" :size="12" />
            </button>
          </span>
        </li>
      </ul>

      <input
        :id="inputId"
        v-model="value"
        type="text"
        class="min-h-8 min-w-[150px] flex-1 bg-transparent px-1.5 text-[14px] text-ink outline-none placeholder:text-muted"
        :placeholder="placeholder"
        :maxlength="maxLength"
        :aria-invalid="invalid"
        :aria-describedby="visibleMessage ? `${hintId} ${messageId}` : hintId"
        aria-required="true"
        autocomplete="off"
        @keydown="onKeydown"
        @blur="commit"
      />
    </div>

    <p
      v-if="visibleMessage"
      :id="messageId"
      class="mt-2 text-[12px] text-danger"
      role="alert"
    >
      {{ visibleMessage }}
    </p>
  </div>
</template>
