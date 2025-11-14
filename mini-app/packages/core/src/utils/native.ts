import request from '../api/request'
import { useAppStore } from '../stores'
import { WebViewBridge } from './webview-bridge'

const $createShortLink = (originString: string) => {
  return request({
    url: '/anteng-cornerstone-system/short-url',
    method: 'post',
    data: {
      originString,
      expireTime: '2099-12-31 12:00:00'
    }
  })
}

export const useNativeToWeapp = (options: {
  appId?: string
  env?: 'develop' | 'trial' | 'release'

  type: 'navigateTo' | 'action'
  payload: any
}) => {
  // if (!useAppStore().isInNativeWebView) {
  //   return void 0
  // }

  const appId = options.appId || useAppStore().appId!
  const env = options.env || 'release'
  const path = 'pages/launch'

  $createShortLink(
    JSON.stringify({
      type: options.type,
      payload: options.payload
    })
  ).then(res => {
    const scene = `#${res.data.shortCode}`

    WebViewBridge.getInstance().openWeapp({
      appId,
      env,
      path,
      query: `scene=${scene}&fromNative=true`
    })
  })
}
