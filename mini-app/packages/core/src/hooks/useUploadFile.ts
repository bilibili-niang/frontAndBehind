import Taro from '@tarojs/taro'
import { getAuthHeaders, REQUEST_DOMAIN } from '../api/request'
import { safeParse } from '../utils'

/** 上传文件 */
const useUploadFile = (options: {
  /** 文件链接 */
  url: string
  name?: string
  onSuccess?: (url: string) => void
  onFail?: (error: any) => void
  onComplete?: () => void
}) => {
  const uploadTask = Taro.uploadFile({
    url: REQUEST_DOMAIN + '/null-cornerstone-system/upload/image',
    filePath: options.url,
    fileName: options.name,
    // fileType: 'image',
    header: {
      ...getAuthHeaders()
    },
    name: 'file',
    success: (res: any) => {
      let data = res.data
      if (typeof data == 'string') {
        data = safeParse(data)
      }

      if (data.code === 200) {
        options.onSuccess?.(data.data.url)
      } else {
        options.onFail?.(data.msg)
      }
    },
    fail: err => {
      options.onFail?.(err)
    },
    complete: () => {
      options?.onComplete?.()
    }
  })
  return uploadTask
}

export default useUploadFile
