import { ref } from 'vue'
import { copyText } from '@/utils/copy'

export function useCopy() {
  const snackbar = ref(false)
  const snackbarText = ref('')
  const snackbarTimeout = ref(2000)

  const copy = async (text: string) => {
    const ok = await copyText(text)
    snackbarText.value = ok ? '已复制到剪贴板' : '复制失败'
    snackbar.value = true
    return ok
  }

  return { copy, snackbar, snackbarText, snackbarTimeout }
}
