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
