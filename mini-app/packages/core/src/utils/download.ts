import { message } from '@anteng/ui'
// 文件下载
export const downloadFile = (url: string, fileName?: string) => {
  if (!url) return void 0
  const link = document.createElement('a')
  link.href = url
  link.target = '_blank'
  link.style.display = 'none'

  const _fileName = url.match(/\/([^/]+\.[^/]+)$/)?.[1] || fileName || 'example.xlsx'

  link.setAttribute('download', _fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  message.success('下载成功')
}
