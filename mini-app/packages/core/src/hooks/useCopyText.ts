import Taro from '@tarojs/taro'

/**
 * 复制文本
 * @param {String} text
 */
export default function useCopyText(text, tip = '内容已复制') {
  if (process.env.TARO_ENV === 'h5') {
    const input = document.createElement('input')
    input.value = text
    document.body.appendChild(input)
    input.select()
    document.execCommand('Copy')
    document.body.removeChild(input)
    Taro.showToast({
      title: tip,
      icon: 'none'
    })
  } else {
    Taro.setClipboardData({
      data: text,
      success: () => {
        Taro.showToast({
          title: tip,
          icon: 'none'
        })
      },
      fail: () => {
        Taro.showToast({
          title: tip,
          icon: 'none'
        })
      }
    })
  }
}
