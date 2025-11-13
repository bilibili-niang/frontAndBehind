import request from './request'

interface IUploadFileResponeData {
  /** 链接 */
  url: string
  /** 文件名称 */
  uri: string
}
export const requestUploadFile = (
  binaryFile: any
): Promise<{
  code: number
  data: IUploadFileResponeData
  msg: string
  success: boolean
}> => {
  return request({
    url: '/api/upload/image',
    method: 'POST',
    timeout: 30 * 1000 * 60,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: {
      file: binaryFile
    }
  })
}

export const $uploadFileMany = (files: any[]) => {
  return request<IUploadFileResponeData[]>({
    url: '/api/upload/batch',
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 30 * 1000 * 60,
    data: {
      files: files
    }
  })
}
