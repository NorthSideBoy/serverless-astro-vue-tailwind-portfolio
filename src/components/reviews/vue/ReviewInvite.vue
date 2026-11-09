<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from '@/router/astroRouter'
import { usePreferences } from '@/composables/usePreferences'
import UiIcon from '@/components/ui/vue/UiIcon.vue'

const props = withDefaults(defineProps<{ variant?: 'footer' | 'empty' }>(), {
  variant: 'footer',
})

const { copy } = usePreferences()

const content = computed(() =>
  props.variant === 'empty'
    ? {
        eyebrow: copy.value.reviews.invite.emptyEyebrow,
        title: copy.value.reviews.invite.emptyTitle,
        body: copy.value.reviews.invite.emptyBody,
      }
    : {
        eyebrow: copy.value.reviews.invite.eyebrow,
        title: copy.value.reviews.invite.title,
        body: copy.value.reviews.invite.body,
      },
)
</script>

<template>
  <div
    :class="
      variant === 'empty'
        ? 'border border-line bg-panel/10 p-6 md:p-8'
        : 'mt-10 border-t border-line pt-8'
    "
  >
    <div
      class="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10"
    >
      <div class="max-w-[640px]">
        <p class="mono-label text-soft">{{ content.eyebrow }}</p>
        <p
          class="mt-3 font-display text-[22px] font-semibold leading-[1.15] tracking-[-0.02em] text-ink md:text-[26px]"
        >
          {{ content.title }}
        </p>
        <p class="mt-2 text-[13.5px] leading-[1.7] text-muted md:text-[14px]">
          {{ content.body }}
        </p>
      </div>
      <div class="flex shrink-0 flex-col items-start gap-2 md:items-end">
        <RouterLink :to="{ name: 'reviews' }" class="btn-ghost w-full sm:w-auto">
          {{ copy.reviews.invite.action }}
          <UiIcon name="arrow-up-right" :size="15" />
        </RouterLink>
      </div>
    </div>
  </div>
</template>
