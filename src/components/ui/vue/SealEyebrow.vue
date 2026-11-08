<script setup lang="ts">
/**
 * SealEyebrow — the dossier's section index: a kanji numeral stamped in the
 * seal face inside a hairline box, then the double slash, then the label.
 * Compound numerals stack vertically so the box stays square and the seal
 * still reads as one impression. The numeral and the slash are decorative for
 * assistive tech; the label carries the meaning.
 */
import { computed } from 'vue'

const props = withDefaults(defineProps<{ label: string; seal?: string }>(), { seal: '' })

const isCompound = computed(() => Array.from(props.seal).length > 1)
</script>

<template>
  <span>
    <span v-if="seal" class="seal-mark" aria-hidden="true">
      <span class="seal-mark__box">
        <span
          class="seal-glyph seal-mark__glyph"
          :class="{ 'seal-mark__glyph--stacked': isCompound }"
          >{{ seal }}</span
        >
      </span>
      <span class="seal-mark__slash">//</span>
    </span>
    {{ label }}
  </span>
</template>

<style scoped>
.seal-mark {
  display: inline-flex;
  align-items: center;
  gap: 0.45em;
  margin-right: 0.45em;
  vertical-align: middle;
}

.seal-mark__box {
  display: inline-flex;
  width: 1.85em;
  height: 1.85em;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, currentColor 38%, transparent);
}

.seal-mark__glyph {
  font-size: 1.3em;
  line-height: 1;
}

.seal-mark__glyph--stacked {
  font-size: 1.01em;
  line-height: 0.88;
  letter-spacing: 0;
  writing-mode: vertical-rl;
  text-orientation: upright;
}

.seal-mark__slash {
  font-size: 0.86em;
  opacity: 0.72;
}
</style>
