import { onMounted, watch, type ComputedRef } from 'vue'

interface PageMeta {
  title: string
  description: string
}

export function usePageMeta(meta: ComputedRef<PageMeta>) {
  function apply() {
    if (typeof document === 'undefined') return

    document.title = meta.value.title

    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (description) description.content = meta.value.description
  }

  onMounted(apply)
  watch(meta, apply)
}
