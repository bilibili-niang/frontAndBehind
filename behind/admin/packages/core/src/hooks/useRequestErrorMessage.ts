import { notifyError } from '@pkg/ui'

export default function useRequestErrorMessage(error: any) {
  const errorMessage = error?.message || error?.msg || '请求失败，请稍后重试'
  notifyError(errorMessage)
  return errorMessage
}
