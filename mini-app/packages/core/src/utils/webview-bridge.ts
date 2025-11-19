import { defaults } from 'lodash-es'
import { useAppStore } from '../stores'
import { useLoading, useLoadingEnd } from '../hooks/useLoading'

export class WebViewBridge {
  // 单例实例
  private static instance: WebViewBridge
  private constructor() {}

  static getInstance() {
    if (!WebViewBridge.instance) {
      WebViewBridge.instance = new WebViewBridge()
    }
    return WebViewBridge.instance
  }

  /**
   * 通过明文URLSchema 打开小程
   * 注意：需要在小程序后台添加允许被明文唤起页面路径
   */
  openWeapp(options: { appId: string; path: string; query?: string; env?: 'develop' | 'trial' | 'release' }) {
    if (!useAppStore().isInNativeWebView) {
      return void 0
    }

    const _options = defaults(options, {
      env: 'release',
      query: ''
    })

    _options.query = encodeURIComponent(
      _options.query.includes('&fromNative=true')
        ? _options.query
        : (options.query + '&fromNative=true').replace(/^\&/, '')
    )

    useLoading()
    setTimeout(() => {
      useLoadingEnd()
    }, 1000)
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: 'WEAPP',
        data: _options
      })
    )
  }
}
