import { message } from '@anteng/ui'
import { formatDate } from './date'

/**
 * 生成JSON文件并下载
 * @param {*} data
 * @param {String} filename 文件名
 * @returns false
 */
export function saveAsJSONFile(data: JSON, filename?: string) {
  if (!data) {
    message.error('数据为空，生成 JSON 文件失败！')
    return false
  }
  const _filename =
    `${filename?.replace(/\.json$/, '')}.json` ||
    `file_${formatDate(new Date(), 'yyyyMMddHHmmss')}.json`
  let dataStr
  if (typeof data === 'object') {
    dataStr = JSON.stringify(data, undefined, 2)
  } else {
    dataStr = data as string
  }
  const blob = new Blob([dataStr], { type: 'text/json' }),
    e = document.createEvent('MouseEvents'),
    a = document.createElement('a')
  a.download = _filename
  a.href = window.URL.createObjectURL(blob)
  a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
  e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  a.dispatchEvent(e)
  message.success('JSON文件已生成，请等待下载完成!')
}

/**
 * 读取JSON文件
 * @returns {Object} 数据
 */
export function importJSONFile() {
  return new Promise((resolve, reject) => {
    // 新建文件input
    const input = document.createElement('input')
    // 添加类名 => 隐藏于页面
    input.className = 'n-hidden-file-input'
    input.style.width = '0px'
    input.style.height = '0px'
    input.style.opacity = '0'
    input.style.overflow = 'hidden'
    input.style.display = 'none'
    input.type = 'file'
    input.id = 'n-hidden-file-input'
    // 设置仅允许 .json 文件
    input.accept = 'application/json'
    document.body.appendChild(input)
    function handle() {
      message.loading({
        content: '正在读取文件...',
        key: 'json-file-input'
      })
      try {
        const selectedFile = input.files![0]
        // const name = selectedFile.name // 文件名
        // const size = selectedFile.size // 文件大小
        // console.log('文件名: ', name)
        // console.log('文件大小: ', size)
        const reader = new FileReader()
        reader.readAsText(selectedFile) // 读取文件的内容、URL
        reader.onload = function () {
          try {
            const result = JSON.parse(this.result as string)
            // 读取成功回调
            message.success({
              content: '文件读取成功!',
              key: 'json-file-input',
              duration: 2
            })
            resolve(result)
          } catch (err) {
            message.error({
              content: '文件读取失败!',
              key: 'json-file-input',
              duration: 2
            })
          }
        }
        reader.onabort = function () {
          reject(new Error('cancel'))
        }
      } catch (err) {
        reject(err)
      } finally {
        discardInput()
      }
    }

    const discardInput = () => {
      // 移除监听，浏览器无法自行回收
      input.removeEventListener('change', handle)
      input.removeEventListener('cancel', discardInput)
      // 移除节点
      document.body.removeChild(input)
    }

    input.addEventListener('change', handle)
    input.addEventListener('cancel', discardInput)
    // 自点击事件 呼出文件选择
    input.click()
  })
}
