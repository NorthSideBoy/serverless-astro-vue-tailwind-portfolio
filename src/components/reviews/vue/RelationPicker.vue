<script setup lang="ts">
import { computed } from 'vue'
import { usePreferences } from '@/composables/usePreferences'
import type { ReviewExperience, ReviewProject } from '@/data/testimonials'

const props = defineProps<{
  experiences: ReviewExperience[]
  projects: ReviewProject[]
  selectedExperiences: string[]
  selectedProjects: string[]
  max: number
  label: string
  hint: string
  optionalNote: string
  experienceGroup: string
  projectGroup: string
  maxMessage: string
}>()

const emit = defineEmits<{
  'toggle-experience': [id: string]
  'toggle-project': [slug: string]
}>()

const { locale } = usePreferences()

const total = computed(
  () => props.selectedExperiences.length + props.selectedProjects.length,
)
const atMax = computed(() => total.value >= props.max)
</script>

<template>
  <fieldset
    id="review-relations"
    tabindex="-1"
    class="min-w-0"
    aria-describedby="review-relations-hint review-relations-max"
  >
    <legend
       class="type-meta mb-2 block font-mono font-medium uppercase tracking-[0.1em] text-muted"
    >
      {{ label }}
    </legend>
     <p id="review-relations-hint" class="type-support leading-[1.6] text-muted">
      {{ hint }}
    </p>

    <div v-if="experiences.length" class="mt-5">
      <p class="font-mono text-[10px] uppercase tracking-[0.1em] text-soft">
        {{ experienceGroup }}
      </p>
      <div class="mt-2 grid gap-px border border-line bg-line sm:grid-cols-2">
        <label
          v-for="entry in experiences"
          :key="entry.id"
          class="flex cursor-pointer items-start gap-3 bg-page p-3 transition-colors focus-within:outline-2 focus-within:outline-soft"
          :class="[
            selectedExperiences.includes(entry.id)
              ? 'bg-panel/50'
              : atMax
                ? ''
                : 'hover:bg-panel/30',
            atMax && !selectedExperiences.includes(entry.id)
              ? 'cursor-not-allowed opacity-55'
              : '',
          ]"
        >
          <input
            type="checkbox"
            class="mt-0.5 h-4 w-4 shrink-0 accent-[var(--c-soft)]"
            :checked="selectedExperiences.includes(entry.id)"
            :disabled="atMax && !selectedExperiences.includes(entry.id)"
            @change="emit('toggle-experience', entry.id)"
          />
          <span class="min-w-0">
            <span class="type-support block leading-snug text-ink">{{ entry.org }}</span>
            <span
              class="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.08em] text-muted"
            >
              {{ entry.role }}
            </span>
          </span>
        </label>
      </div>
    </div>

    <div v-if="projects.length" class="mt-5">
      <p class="font-mono text-[10px] uppercase tracking-[0.1em] text-soft">
        {{ projectGroup }}
      </p>
      <div class="mt-2 grid gap-px border border-line bg-line sm:grid-cols-2">
        <label
          v-for="project in projects"
          :key="project.slug"
          class="flex cursor-pointer items-start gap-3 bg-page p-3 transition-colors focus-within:outline-2 focus-within:outline-soft"
          :class="[
            selectedProjects.includes(project.slug)
              ? 'bg-panel/50'
              : atMax
                ? ''
                : 'hover:bg-panel/30',
            atMax && !selectedProjects.includes(project.slug)
              ? 'cursor-not-allowed opacity-55'
              : '',
          ]"
        >
          <input
            type="checkbox"
            class="mt-0.5 h-4 w-4 shrink-0 accent-[var(--c-soft)]"
            :checked="selectedProjects.includes(project.slug)"
            :disabled="atMax && !selectedProjects.includes(project.slug)"
            @change="emit('toggle-project', project.slug)"
          />
          <span class="min-w-0">
            <span class="type-support block leading-snug text-ink">
              {{ project.title[locale] }}
            </span>
            <span
              class="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.08em] text-muted"
            >
              {{ project.context[locale] }}
            </span>
          </span>
        </label>
      </div>
    </div>

     <p id="review-relations-max" class="type-meta mt-3 font-mono uppercase tracking-[0.06em] text-muted">
      {{ atMax ? maxMessage : optionalNote }}
    </p>
  </fieldset>
</template>
