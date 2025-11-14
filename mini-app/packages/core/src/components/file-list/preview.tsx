import { useLoading, useLoadingEnd, useToast } from '../../hooks'
import Taro from '@tarojs/taro'

// TODO 需要优化,对于下载过的文件不应该重复下载,文件太大了
// 用来存储打开成功的文件
// let successUrlObject = {}
export const spPreview = (url: string) => {
  if (!url) {
    useToast('文件不存在')
  }
  
  if (process.env.TARO_ENV === 'h5') {
    window.location.href = url
    return
  }
  
  useLoading()
  Taro.downloadFile({
    url: url,
    success: function (res) {
      if (res.statusCode === 200) {
        Taro.getFileSystemManager().saveFile({
          tempFilePath: res.tempFilePath,
          filePath: Taro.env.USER_DATA_PATH + '/' + url.split('/').pop(),
          success: e => {
            Taro.openDocument({
              showMenu: true,
              filePath: e.savedFilePath,
              success: function (res) {
                /*console.log('文件预览打开成功')
                successUrlObject[url] = e.savedFilePath
                console.log('存储了:')
                console.log(successUrlObject)*/

                useLoadingEnd()
              },
              fail: () => {
                useToast('资源预览失败')
                useLoadingEnd()
              }
            })
          },
          fail: err => {
            useLoadingEnd()
            console.log('保存文件到本机失败', err)
          }
        })
      } else {
        useLoadingEnd()
        useToast('该资源不存在或已失效')
      }
    },
    fail: err => {
      useLoadingEnd()
      useToast('资源下载失败')
      console.log(err)
    }
  })
}
