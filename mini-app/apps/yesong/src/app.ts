import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@anteng/styles'
import './app.scss'
import './style/varibules.scss'
import { buildUrl, getWeappQrcodeScene, SCENE_STORE, useAppStore, useUserStore } from '@anteng/core'
import Taro, { useRouter } from '@tarojs/taro'
import setup from './setup'
import { useGlobalStore } from './stores'
import useUTMStore from './stores/utm'
// 注册业务装修组件（搜索、商品列表、信息卡片等）
import './components/deck'

const App = createApp({
  onLaunch(options) {
    console.log('启动参数', options)

    const route = useRouter()
    if (!route.path.includes('pages/launch')) {
      // 小程序扫码进入时自带scene参数，解析scene还原，防止二次编码出现错误
      const query = { ...options.query, ...getWeappQrcodeScene(options.query?.scene) }
      const globalStore = useGlobalStore()
      globalStore.setLaunchRedirect(buildUrl(options.path, query))
      console.log('重定向启动页：', globalStore.launchRedirect)
      Taro.reLaunch({
        url: 'pages/launch'
      })
    }
    useUserStore()
      .getUserInfo()
      .catch(() => {})
    // 在这里对utm参数判断并初始化一下
    const { initializationFromStorage } = useUTMStore()
    setTimeout(() => {
      initializationFromStorage()
    }, 2000)
  },
  onShow(options) {
    console.log('热启动参数', options)
    useAppStore().parseCodeScan(options)
  },
  onError(err) {
    console.log(err)
  },
  errorCaptured(err: any, vm, info) {
    console.log('err, vm, info')
    console.log(err, vm, info)

    // TODO 在这里上报异常，添加埋点
    console.groupCollapsed(`%c底层异常捕获: ${err?.message ?? err?.msg}`, 'color: red;')
    console.error('Error captured:', err)
    console.error('Vue instance:', vm)
    console.error('Error info:', info)
    console.groupEnd()
    // 默认返回 true 将终止页面渲染
    // 返回 false 防止某些组件内部发生错误，导致整个页面不渲染
    return false
  }
})

Taro.onPageNotFound(() => {
  Taro.reLaunch({ url: 'pages/404' })
})

const pinia = createPinia()

pinia.use(() => {
  return {
    $scene: SCENE_STORE
  }
})

App.use(pinia)

setup()

export default App
