export function isAllowedImageFormat(url: string) {
  if (!url) return false
  // 定义允许的图片格式（不区分大小写）
  const allowedExtensions = ['jpg', 'png', 'bmp', 'gif', 'webp', 'tiff', 'heic']
  // 获取URL中的文件扩展名
  const lastDotIndex = url.lastIndexOf('.')
  if (lastDotIndex === -1) {
    // 没有找到扩展名
    return false
  }

  // 提取扩展名并转换为小写
  const extension = url.substring(lastDotIndex + 1).toLowerCase()

  // 检查扩展名是否在允许的列表中
  return allowedExtensions.includes(extension)
}
