// 海报创建/更新的数据处理逻辑
import { ref } from 'vue'
import { useResponseMessage, useToast } from '@anteng/core'
import { createPoster, updatePoster } from '../../../../api/posterMarking'
import { base64src } from '../PosterBuilder/utils/tools'
import { $getWxacodeUnlimit } from '@anteng/core/src/api'
import { utmStore } from '../../../../stores'

interface posterItem {
  name: 'string'
  id: string
  isEdit?: boolean
  tenantId: string
  merchantId: string
  userId: string
  url: string
  qrcode: {
    x: number
    y: number
    size: number
    page: string
    // 选择商品时才存在
    goodsId: string
    utm: string
    // 选择分类时才存在
    faId: string
    childrenId: string
    // 选择资讯时才存在
    infId: string
  }
  createTime: string
  updateTime: object
  isDeleted: number
}

// 当前海报信息
export const editorPoster = ref<posterItem>({
  name: '',
  url: '',
  qrcode: {
    id: 0,
    x: 500,
    y: 500,
    size: 200,
    utm: '',
    page: ''
  }
})
// 二维码的base64
export const qrcodeImage = ref('')
// 二维码的本地url
export const qrCodeUrl = ref('')

// 错误时的二维码
export const errorQrCode =
  'data:image/png;base64,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'
// 根据页面信息获取二维码
export const getQrcode = (code: string) => {
  const { env } = utmStore()
  return new Promise((resolve, reject) => {
    // 如果有传来的code,就用最新的code
    if (code) {
      if (!editorPoster.value?.qrcode) {
        editorPoster.value = {
          ...editorPoster.value,
          qrcode: { utm: code }
        }
      } else {
        editorPoster.value.qrcode.utm = code || editorPoster.value.qrcode?.utm
      }
      // 根据utm信息获取一下小程序码
      $getWxacodeUnlimit({
        // TODO page是写死的,他只是跳板页面
        page: 'pagesB/goodDetail/GoodDetail',
        scene: `utmCode=${code}`,
        env
      }).then(async res => {
        if (res.success) {
          qrcodeImage.value = `data:image/png;base64,${res.data}`
          // 需要将base64转成本地路径
          qrCodeUrl.value = await base64src(qrcodeImage.value)
          // 刷新
          return resolve()
        } else {
          console.log('获取小程序码失败:', res)
          useToast('获取小程序码失败，请重试')
          // 没有获取到小程序码
          qrcodeImage.value = errorQrCode
          return reject(res)
        }
      })
    } else {
      // 有utmCode
      // 根据utm信息获取一下小程序码
      $getWxacodeUnlimit({
        page: 'pagesB/goodDetail/GoodDetail',
        scene: `utmCode=${editorPoster.value?.qrcode?.utm}`,
        env
      }).then(async res => {
        if (res.success) {
          qrcodeImage.value = `data:image/png;base64,${res.data}`
          // 需要将base64转成本地路径
          qrCodeUrl.value = await base64src(qrcodeImage.value)
          // 刷新
          return resolve()
        } else {
          console.log('获取小程序码失败:', res)
          useToast('获取小程序码失败，请重试')
          // 没有获取到小程序码
          qrcodeImage.value = errorQrCode
          return reject(res)
        }
      })
    }
  })
}

// 提交 / 更新
export const submitData = (id?: string) => {
  if (id) {
    return new Promise((resolve, reject) => {
      updatePoster(id, editorPoster.value)
        .then(res => {
          if (res.success) {
            useToast('更新成功')
            // 更新成功后刷新二维码
            getQrcode(editorPoster.value?.qrcode?.utm)
              .then(() => resolve(res))
              .catch(e => {
                console.error('刷新二维码失败:', e)
                resolve(res)
              })
          } else {
            reject(res)
            useToast('更新失败')
          }
        })
        .catch(e => {
          useResponseMessage(e)
          reject(e)
        })
    })
  } else {
    return new Promise((resolve, reject) => {
      if (!editorPoster.value?.qrcode?.page) {
        useToast('请选择页面')
        return reject('用户未选择页面')
      }
      createPoster(editorPoster.value)
        .then(res => {
          if (res.success) {
            useToast('新建成功')
            // 新建成功后刷新二维码
            getQrcode(editorPoster.value?.qrcode?.utm)
              .then(() => resolve(res))
              .catch(e => {
                console.error('刷新二维码失败:', e)
                resolve(res)
              })
          } else {
            reject(res)
            useToast('新建失败')
          }
        })
        .catch(e => {
          useResponseMessage(e)
          reject(e)
        })
    })
  }
}
