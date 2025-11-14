import Taro from '@tarojs/taro'
import useCoreStore from '../stores/core'
import { inject, provide } from 'vue'

/** 分享 */
const useShareAppMessage = (handler: Parameters<typeof Taro.useShareAppMessage>[0]) => {
  const coreStore = useCoreStore()

  const bus = inject('useShareAppMessageBus', null as unknown) as Function

  const _handler: typeof handler = payload => {
    let defaultRes = coreStore.globalShareHandler?.(payload)
    defaultRes = defaultRes instanceof Promise ? undefined : defaultRes
    const res = handler(payload)
    if (res instanceof Promise) {
      return new Promise((resolve, reject) => {
        res
          .then(data => {
            resolve({
              title: data?.title ?? defaultRes?.title,
              path: data?.path,
              imageUrl: data?.imageUrl ?? defaultRes?.imageUrl
            })
          })
          .catch(reject)
      })
    }
    return {
      title: res?.title ?? defaultRes?.title,
      path: res?.path,
      imageUrl: res?.imageUrl ?? defaultRes?.imageUrl
    }
  }

  const setShare = () => {
    if (bus) {
      bus(_handler)
    } else {
      Taro.useShareAppMessage(_handler)
    }
  }

  setShare()

  return setShare
}

const useShareAppMessageBus = () => {
  let handler: Parameters<typeof Taro.useShareAppMessage>[0] = () => {
    return {}
  }

  provide('useShareAppMessageBus', (fn: Parameters<typeof Taro.useShareAppMessage>[0]) => (handler = fn))

  Taro.useShareAppMessage(payload => handler(payload))
}

export { useShareAppMessage, useShareAppMessageBus }
