import Taro from '@tarojs/taro'
import { defaults } from 'lodash-es'

interface UseConfirmOptions {
  title?: string
  content?: string
  /** 确定 */
  onConfirm?: () => void
  /** 取消 */
  onCancel?: () => void
  /** 确定按钮颜色 */
  confirmColor?: string
  /** 确定按钮文本，默认 “确定” */
  confirmText?: string
  /** 取消按钮颜色 */
  cancelColor?: string
  /** 取消按钮文本，默认 “取消” */
  cancelText?: string
  /** 是否显示取消按钮，默认 true */
  showCancel?: boolean
  /** 点击蒙层可关闭 */
  maskCloseable?: boolean
  /** 是否显示蒙层 */
  maskVisible?: boolean
}

/** 询问模态框 */
const useConfirm = (options: UseConfirmOptions) => {
  const _options = defaults(options, {
    success(res: any) {
      if (res.confirm) {
        options.onConfirm?.()
      } else if (res.cancel) {
        options.onCancel?.()
      }
    }
  })

  // TODO 自行实现替代 Taro.showModal，统一样式，支持 maskCloseable，maskVisible

  Taro.showModal(_options)
}

export default useConfirm
