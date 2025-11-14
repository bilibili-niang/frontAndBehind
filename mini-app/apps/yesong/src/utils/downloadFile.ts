import Taro from '@tarojs/taro'

// 下载文件
export const downloadImage = (src: string) => {
  Taro.saveImageToPhotosAlbum({
    filePath: src,
    success: () => {
      Taro.showToast({
        title: '已保存到相册',
        icon: 'success'
      })
    },
    fail: () => {
      Taro.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  })
}
