<script setup lang="ts">
import { computed } from 'vue'
import { hasThemeVariant } from '@/data/themeMedia'

const props = withDefaults(
  defineProps<{
    src: string
    darkSrc?: string
    alt: string
    width?: number
    height?: number
    fit?: 'cover' | 'contain'
    loading?: 'lazy' | 'eager'
    imgClass?: string
  }>(),
  { fit: 'contain', loading: 'lazy', imgClass: '' },
)

const hasVariant = computed(() => hasThemeVariant(props.src, props.darkSrc))
const classes = computed(() =>
  props.imgClass
    ? props.imgClass
    : [
        'w-full',
        props.width && props.height ? 'h-full' : 'h-auto',
        props.fit === 'cover' ? 'object-cover' : 'object-contain',
      ],
)
</script>

<template>
  <template v-if="hasVariant">
    <img
      :src="darkSrc"
      :alt="alt"
      :width="width"
      :height="height"
      :loading="loading"
      decoding="async"
      class="theme-media-dark"
      :class="classes"
    />
    <img
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :loading="loading"
      decoding="async"
      class="theme-media-light"
      :class="classes"
    />
  </template>
  <img
    v-else
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    :loading="loading"
    decoding="async"
    :class="classes"
  />
</template>
