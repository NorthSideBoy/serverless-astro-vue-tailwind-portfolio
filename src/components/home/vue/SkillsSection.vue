<script setup lang="ts">
import { computed, nextTick, ref, type ComponentPublicInstance } from 'vue'
import { usePreferences } from '@/composables/usePreferences'
import { useRevealCycle } from '@/composables/useRevealCycle'
import SectionHeader from '@/components/ui/vue/SectionHeader.vue'
import PlateFrame from '@/components/ui/vue/PlateFrame.vue'
import LayerPlate from '@/components/ui/vue/LayerPlate.vue'
import UiIcon from '@/components/ui/vue/UiIcon.vue'

const { copy } = usePreferences()

const layerIcons = ['database', 'terminal', 'api', 'layers']
const skillIcons = ['layers', 'database', 'shield', 'plug', 'check-circle', 'code']
const layerColors = ['var(--c-layer-1)', 'var(--c-layer-2)', 'var(--c-layer-3)', 'var(--c-layer-4)']
const selectedLayer = ref(1)
const selectedInfo = computed(() => copy.value.skills.layers[selectedLayer.value]!)
const layerTabRefs = ref<(HTMLButtonElement | null)[]>([])

const capabilityList = ref<HTMLElement | null>(null)
const { armed: capabilitiesArmed } = useRevealCycle(capabilityList, {
  mountThreshold: 0.9,
  threshold: 0.08,
})

function setLayerTabRef(element: Element | ComponentPublicInstance | null, index: number) {
  layerTabRefs.value[index] = element instanceof HTMLButtonElement ? element : null
}

function selectLayer(index: number) {
  selectedLayer.value = index
}

async function onLayerTabKeydown(event: KeyboardEvent) {
  const total = copy.value.skills.layers.length
  let next = selectedLayer.value

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      next = (selectedLayer.value + 1) % total
      break
    case 'ArrowLeft':
    case 'ArrowUp':
      next = (selectedLayer.value - 1 + total) % total
      break
    case 'Home':
      next = 0
      break
    case 'End':
      next = total - 1
      break
    default:
      return
  }

  event.preventDefault()
  selectedLayer.value = next
  await nextTick()
  layerTabRefs.value[next]?.focus()
}
</script>

<template>
  <section
    id="skills"
    class="section-pad border-y border-line bg-page"
    aria-labelledby="skills-title"
  >
    <div class="shell">
      <SectionHeader
        seal="三"
        :eyebrow="copy.skills.eyebrow"
        :title="copy.skills.title"
        :lead="copy.skills.lead"
        title-id="skills-title"
        signal
      />

      <PlateFrame>
        <div class="p-5 md:p-8 xl:p-10">
          <section
            aria-labelledby="skills-capabilities-title"
            class="skills-capabilities grid gap-7 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-12"
          >
            <div>
              <h3 id="skills-capabilities-title" class="mono-label text-soft">
                {{ copy.skills.capabilitiesLabel }}
              </h3>
              <p class="mt-3 max-w-[34ch] text-[13px] leading-[1.7] text-muted md:text-[14px]">
                {{ copy.skills.capabilitiesNote }}
              </p>
            </div>

            <ul
              ref="capabilityList"
              class="capabilities grid gap-px bg-line md:grid-cols-2"
              :class="{ 'is-armed': capabilitiesArmed }"
            >
              <li
                v-for="(item, index) in copy.skills.items"
                :key="item.title"
                class="capability-card bg-section p-5 md:p-6"
                :style="{ '--capability-delay': `${Math.min(index * 50, 250)}ms` }"
              >
                <div class="flex items-start gap-3">
                  <UiIcon :name="skillIcons[index] ?? 'code'" :size="18" class="mt-0.5 text-icon" />
                  <div class="min-w-0">
                    <h4
                      class="font-display text-[17px] font-semibold leading-snug tracking-[-0.01em] text-ink md:text-[18px]"
                    >
                      {{ item.title }}
                    </h4>
                    <p class="mt-2.5 text-[13px] leading-[1.65] text-muted md:text-[13.5px]">
                      {{ item.description }}
                    </p>
                    <p
                      class="mt-3.5 font-mono text-[10px] uppercase tracking-[0.07em] text-muted md:text-[10.5px]"
                    >
                      {{ item.tags }}
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </section>

          <section
            aria-labelledby="skills-layers-title"
            class="mt-10 border-t border-line pt-9 md:mt-12 md:pt-10"
          >
            <div class="max-w-[72ch]">
              <h3 id="skills-layers-title" class="mono-label text-soft">
                {{ copy.skills.layersLabel }}
              </h3>
              <p class="mt-3 text-[13px] leading-[1.7] text-muted md:text-[14px]">
                {{ copy.skills.layersNote }}
              </p>
              <p id="skills-layers-hint" class="mt-3 font-mono text-[10px] text-muted">
                {{ copy.skills.layersHint }}
              </p>
            </div>

            <div class="layer-layout mt-7">
              <LayerPlate
                :layers="copy.skills.layers"
                :active="selectedLayer"
                class="layer-plate"
              />

              <div
                class="layer-controls"
                role="tablist"
                aria-labelledby="skills-layers-title"
                aria-orientation="horizontal"
                aria-describedby="skills-layers-hint"
                @keydown="onLayerTabKeydown"
              >
                <button
                  v-for="(layer, index) in copy.skills.layers"
                  :id="`skills-layer-tab-${index}`"
                  :key="layer.label"
                  :ref="(element) => setLayerTabRef(element, index)"
                  type="button"
                  role="tab"
                  :aria-selected="selectedLayer === index"
                  :aria-controls="'skills-layer-detail'"
                  :tabindex="selectedLayer === index ? 0 : -1"
                  :data-selected="selectedLayer === index"
                  class="block p-4 text-left transition-colors duration-200 md:p-5"
                  @click="selectLayer(index)"
                >
                  <span class="flex items-center justify-between gap-3">
                    <span
                      class="font-mono text-[10px] tracking-[0.08em]"
                      :class="selectedLayer === index ? 'text-soft' : 'text-soft/80'"
                    >
                      {{ layer.index }}
                    </span>
                    <UiIcon
                      :name="layerIcons[index] ?? 'layers'"
                      :size="18"
                      :class="selectedLayer === index ? 'text-soft' : 'text-muted'"
                    />
                  </span>
                  <span
                    class="mt-6 block font-display text-[15px] font-semibold uppercase tracking-[0.04em] text-ink md:text-[16px]"
                  >
                    {{ layer.label }}
                  </span>
                  <span
                    class="mt-1.5 block font-mono text-[10px] uppercase tracking-[0.07em] text-muted"
                  >
                    {{ layer.detail }}
                  </span>
                </button>
              </div>

              <aside
                id="skills-layer-detail"
                role="tabpanel"
                tabindex="-1"
                class="layer-detail border border-line bg-panel/15 p-5 md:p-6"
                :aria-labelledby="`skills-layer-tab-${selectedLayer}`"
              >
                <div :key="selectedLayer" class="detail-body">
                  <div class="flex items-center justify-between gap-3">
                    <span
                      class="font-mono text-[10px] uppercase tracking-[0.1em]"
                      :style="`color: ${layerColors[selectedLayer % layerColors.length]}`"
                    >
                      {{ selectedInfo.index }} · {{ copy.skills.layersAction }}
                    </span>
                    <UiIcon
                      :name="layerIcons[selectedLayer % layerIcons.length] ?? 'layers'"
                      :size="18"
                      class="text-muted"
                    />
                  </div>
                  <h4
                    class="mt-3 font-display text-[17px] font-semibold uppercase tracking-[0.04em] text-ink md:text-[18px]"
                  >
                    {{ selectedInfo.label }}
                  </h4>
                  <p class="mt-1.5 font-mono text-[10px] uppercase tracking-[0.07em] text-muted">
                    {{ selectedInfo.detail }}
                  </p>
                  <p class="mt-4 text-[14px] leading-[1.7] text-muted md:text-[15px]">
                    {{ selectedInfo.what }}
                  </p>
                </div>
              </aside>
            </div>
          </section>
        </div>
      </PlateFrame>
    </div>
  </section>
</template>

<style scoped>
.layer-layout {
  display: grid;
  grid-template-areas:
    'plate'
    'tabs'
    'detail';
  gap: 24px;
}

.layer-plate {
  grid-area: plate;
  min-width: 0;
}

.layer-controls {
  grid-area: tabs;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1px;
  background-color: var(--c-line);
}

.layer-controls button {
  background-color: var(--c-section);
}

.layer-controls button:hover {
  background-color: color-mix(in srgb, var(--c-panel) 30%, transparent);
}

.layer-controls button[data-selected='true'] {
  background-color: color-mix(in srgb, var(--c-panel) 60%, transparent);
  box-shadow: inset 0 1px var(--c-soft);
}

.layer-detail {
  grid-area: detail;
}

.detail-body {
  animation: detail-enter 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes detail-enter {
  from {
    opacity: 0;
    transform: translate3d(8px, 5px, 0);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (min-width: 640px) {
  .layer-controls {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .layer-layout {
    grid-template-columns: minmax(0, 1fr) 340px;
    grid-template-areas:
      'plate detail'
      'tabs tabs';
    align-items: center;
    column-gap: 40px;
  }

  .detail-body {
    animation: detail-enter 300ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }
}

@media (min-width: 1280px) {
  .layer-controls {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .layer-controls button,
  .detail-body {
    transition: none;
    animation: none;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .capability-card {
    transition:
      opacity 520ms cubic-bezier(0.16, 1, 0.3, 1),
      transform 520ms cubic-bezier(0.16, 1, 0.3, 1);
    transition-delay: var(--capability-delay, 0ms);
  }

  .capabilities.is-armed .capability-card {
    opacity: 0;
    transform: translate3d(0, 10px, 0);
    transition: none;
  }
}
</style>
