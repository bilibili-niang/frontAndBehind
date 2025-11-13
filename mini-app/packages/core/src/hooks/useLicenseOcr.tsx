import { ref } from 'vue'
import uuid from '../utils/uuid'
import { message } from '@anteng/ui'

const useLicenseOcr = () => {
  const licenseStatus = ref<'loading' | 'success' | 'error' | null>(null)
  const licenseData = ref<any | null>(null)
  const clearLicense = () => {
    licenseStatus.value = null
    licenseData.value = null
  }
  const onLicenseImageChange = (url: string) => {
    if (url) {
      const msgId = uuid()
      message.loading({ key: msgId, content: '图片正在识别中，请稍候片刻！', duration: 0 })
      licenseStatus.value = 'loading'

    }

  }
  return {
    licenseStatus,
    licenseData,
    clearLicense,
    onLicenseImageChange
  }
}

export default useLicenseOcr
