import Taro from '@tarojs/taro'
// import useConfirm from './useConfirm'
import useToast from './useToast'
import { useLoading, useLoadingEnd } from './useLoading'

let loading = false

/** 小程序检测更新 */
const useUpdateManager = () => {
  if (loading) return void 0
  if (process.env.TARO_ENV === 'h5') {
    useToast('已是最新版本')
    return void 0
  }
  if (Taro.canIUse('getUpdateManager')) {
    loading = true
    const updateManager = Taro.getUpdateManager()
    useLoading()
    updateManager.onCheckForUpdate(res => {
      if (res.hasUpdate) {
        updateManager.onUpdateReady(() => {
          useLoadingEnd()
          loading = false
          updateManager.applyUpdate()
          // useConfirm({
          //   title: '更新提示',
          //   content: '即将重启小程序完成更新',
          //   showCancel: false,
          //   onConfirm: () => {
          //     updateManager.applyUpdate()
          //   },
          //   onCancel: () => {
          //     updateManager.applyUpdate()
          //   }
          // })
        })
        updateManager.onUpdateFailed(() => {
          loading = false
          useLoadingEnd()
          useToast('更新包下载失败')
        })
      } else {
        loading = false
        useLoadingEnd()
        useToast('已是最新版本')
      }
    })
  } else {
    useToast('微信版本过低，请升级')
  }
}
export default useUpdateManager
