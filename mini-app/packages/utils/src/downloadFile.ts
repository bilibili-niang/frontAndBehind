/**
 * 将base64数据下载为PNG图片文件,你可以用来下载小程序二维码
 * @param base64Data - base64格式的图片数据
 * @param fileName - 下载文件的名称，如果没有.png后缀会自动添加。若不传入则生成随机10位字符的文件名
 */
export const downloadBinaryToPng = (base64Data: string, fileName?: string) => {
  try {
    // 创建完整的data URL
    const dataUrl = `data:image/png;base64,${base64Data}`

    // 如果没有传入文件名，生成随机10位字符（数字和字母）的文件名
    const generateRandomFileName = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let result = ''
      for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    }

    const finalFileName = fileName
      ? fileName.endsWith('.png')
        ? fileName
        : `${fileName}.png`
      : `${generateRandomFileName()}.png`

    // 创建下载链接并触发下载
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = finalFileName
    document.body.appendChild(a)
    a.click()

    // 清理
    document.body.removeChild(a)
  } catch (e) {
    console.error('Error downloading PNG:', e)
  }
}
