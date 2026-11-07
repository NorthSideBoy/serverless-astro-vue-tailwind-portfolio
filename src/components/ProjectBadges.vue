<script setup lang="ts">
import { computed } from 'vue'
import { usePreferences } from '@/composables/usePreferences'
import type { Project } from '@/data/projects'

const props = withDefaults(
  defineProps<{
    project: Project
    variant?: 'featured' | 'card'
  }>(),
  { variant: 'card' },
)

const { copy, locale } = usePreferences()

const isPublic = computed(() => props.project.visibility === 'public')
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
    <span
      v-if="variant === 'card' && project.featured"
      class="inline-flex items-center rounded-sm border border-line px-2 py-1 font-mono text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-muted"
    >
      {{ copy.projects.featuredLabel }}
    </span>

    <span
      v-if="project.collaboration"
      class="inline-flex items-center rounded-sm border border-line px-2 py-1 font-mono text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-muted"
    >
      {{ copy.projects.collaborationLabel }}
    </span>

    <span
      class="inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 font-mono text-[10px] font-medium uppercase leading-none tracking-[0.08em]"
      :class="isPublic ? 'border-soft/45 text-soft' : 'border-line text-muted'"
    >
      <span
        class="h-1 w-1 rounded-full"
        :class="isPublic ? 'bg-status' : 'bg-muted'"
        aria-hidden="true"
      />
      {{ isPublic ? copy.projects.publicLabel : copy.projects.privateLabel }}
    </span>

    <span
      v-if="variant === 'featured'"
      class="font-mono text-[10px] uppercase tracking-[0.08em] text-muted"
    >
      {{ project.context[locale] }}
    </span>

    <span
      v-if="variant === 'featured' && project.platforms?.length"
      class="font-mono text-[10px] uppercase tracking-[0.08em] text-muted"
    >
      {{ project.platforms.join(' · ') }}
    </span>
  </div>
</template>
