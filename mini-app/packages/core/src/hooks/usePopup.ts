import Taro from '@tarojs/taro'
import withScope from './withScope'
import { PopupConfig, PopupFunc } from '../components/base-page/popup'

/** 创建弹出层, 必须在 BasePage 内使用，且 BasePage 挂载后 */
export default function usePopup(config: PopupConfig) {
  const payload: PopupFunc = {
    close: () => {},
    update: () => {}
  }
  Taro.eventCenter.trigger(withScope('popup'), config, payload)
  return payload
}
