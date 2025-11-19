import { useModal } from '../../../hooks'
import { defineComponent } from 'vue'
import { useAppStore } from '../../../stores'
import { storeToRefs } from 'pinia'

export const onDev = () => {
  useModal({
    title: '调试',
    content: <Dev />
  })
}

const Dev = defineComponent({
  setup({}) {
    const appStore = useAppStore()
    const {} = storeToRefs(appStore)
    return () => {
      return <div>...</div>
    }
  }
})
