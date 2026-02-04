import { ref } from 'vue'

import { message } from '@pkg/ui'

/** 复制文本 */
export const copyText = (content: string, successMsg?: string) => {
  const input = document.createElement('input')
  input.value = content
  document.body.appendChild(input)
  input.select()
  document.execCommand('Copy')
  document.body.removeChild(input)
  message.success(successMsg || '复制成功')
}

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
