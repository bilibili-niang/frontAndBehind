/** 下载 txt 文件 */
export const downloadTxtFile = (fileName: string, content: string) => {
  // 创建文件内容
  const fileContent = content

  // 创建一个Blob对象
  const blob = new Blob([fileContent], { type: 'text/plain' })

  // 创建一个a标签
  const link = document.createElement('a')

  // 设置a标签的href属性为Blob URL
  link.href = window.URL.createObjectURL(blob)

  // 设置下载文件的名称
  link.download = fileName

  // 将a标签隐藏起来
  link.style.display = 'none'

  // 将a标签添加到页面中
  document.body.appendChild(link)

  // 触发点击事件以下载文件
  link.click()

  // 清理创建的元素和URL对象
  document.body.removeChild(link)
  window.URL.revokeObjectURL(link.href)
}

export function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type })
}

export async function canvasToFile(canvas: HTMLCanvasElement, fileName: string): Promise<File> {
  return new Promise<File>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blobToFile(blob, fileName))
      } else {
        reject(new Error('Canvas is empty or an error occurred.'))
      }
    }, 'image/png')
  })
}

/** 格式化文件大小，单位 B */
export function formatFileSize(size: number) {
  const kb = 1024
  const mb = kb * 1024

  if (size < kb) {
    return `${size} B`
  } else if (size < mb) {
    return `${Math.round((size / kb) * 100) / 100} KB`
  } else {
    return `${Math.round((size / mb) * 100) / 100} MB`
  }
}
