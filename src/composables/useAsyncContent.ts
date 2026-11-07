import { onBeforeUnmount, shallowRef, watch, type WatchSource } from 'vue'

export function useAsyncContent<T>(loader: () => Promise<T>, source?: WatchSource<unknown>) {
  const data = shallowRef<T | null>(null)
  const loading = shallowRef(true)
  const error = shallowRef<string | null>(null)
  let generation = 0

  async function reload() {
    const current = ++generation
    loading.value = true
    error.value = null
    data.value = null

    try {
      const result = await loader()
      if (current === generation) data.value = result
    } catch {
      if (current === generation) error.value = 'content-unavailable'
    } finally {
      if (current === generation) loading.value = false
    }
  }

  if (source) watch(source, () => void reload(), { immediate: true })
  else void reload()

  onBeforeUnmount(() => {
    generation++
  })

  return { data, loading, error, reload }
}
