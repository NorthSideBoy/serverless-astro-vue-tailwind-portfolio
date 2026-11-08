<script setup lang="ts">
import ScrambleNumber from '@/components/ui/vue/ScrambleNumber.vue'
import { usePreferences } from '@/composables/usePreferences'

const { copy } = usePreferences()

function statDelay(index: number) {
  return Math.min(index * 70, 210)
}
</script>

<template>
  <div class="border-b border-line bg-section">
    <div class="shell grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-2 md:gap-0 md:py-16">
      <div
        v-for="(stat, index) in copy.stats"
        :key="stat.value + stat.label"
        class="md:px-8"
        :class="[
          index > 0 ? 'md:border-l md:border-line' : 'md:pl-0',
          index === copy.stats.length - 1 ? 'md:pr-0' : '',
        ]"
      >
        <p
          class="font-display text-[38px] font-bold leading-none tracking-[-0.04em] md:text-[46px] xl:text-[54px]"
          :class="index === 1 ? 'text-soft' : 'text-ink'"
        >
          <ScrambleNumber :value="stat.value" :delay="statDelay(index)" />
        </p>
        <p
          class="mt-3 max-w-[220px] font-mono text-[10.5px] leading-[1.55] text-muted md:text-[11.5px]"
        >
          {{ stat.label }}
        </p>
      </div>
    </div>
  </div>
</template>
