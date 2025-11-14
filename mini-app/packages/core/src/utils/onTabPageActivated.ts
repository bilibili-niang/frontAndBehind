import { useAttrs, watch } from 'vue'

export const onTabPageActivated = (handler: () => void) => {
  const attrs = useAttrs()
  watch(
    () => attrs.activated,
    () => {
      if (attrs.activated) {
        handler()
      }
    }
  )
}
