import { defineStore } from 'pinia'
import pkg from '../../package.json'
import { computed, reactive, readonly, ref } from 'vue'
import useBasicLayoutStore from './basic-layout'
import request from '../api/request'
import { PREFIX_CLS } from '@anteng/config'
import useUserStore from './user'
import { Modal as AntModal } from '@anteng/ui'
import router from '../router'
import { setThemeMode, setPrimaryColor } from '@anteng/utils'

export type ThemeMode = 'light' | 'dark'
export type PrimaryColor = string
export type Layout = 'layoutA' | 'layoutB' | 'layoutC'

const layouts: Layout[] = ['layoutA', 'layoutB', 'layoutC']

const useAppStore = defineStore('APP', () => {
  /** 项目名称 */
  const name = pkg.name
  /** 项目版本号 */
  const version = pkg.version
  /** 项目作用域 */
  const scope = ref('')
  /** 应用场景值 */
  const scene = ref('')
  const requestBaseURL = ref('/')

  const initialZIndex = AntModal.$__zIndex__
  const modalZIndex = ref(AntModal.$__zIndex__)

  const getGlobalModalZIndex = () => {
    modalZIndex.value = ++AntModal.$__zIndex__
    return modalZIndex.value
  }

  router.afterEach(() => {
    AntModal.$__zIndex__ = initialZIndex
    modalZIndex.value = initialZIndex
  })

  const previewURL = computed(() => {
    return `${import.meta.env.VITE_APP_PREVIEW_URL}?m=${useUserStore().userInfo?.merchantId}`
  })

  // 初始化
  const init = (options: IInitializeOptions) => {
    // 设置作用域
    scope.value = options.scope
    scene.value = options.scene
    // 设置请求基础路径
    requestBaseURL.value = options.requestBaseURL ?? requestBaseURL.value
    request.defaults.baseURL = requestBaseURL.value

    // 设置基础布局配置
    if (options.basicLayout) {
      const basicLayout = options.basicLayout
      const basicLayoutStore = useBasicLayoutStore()
      basicLayoutStore.setConfig(basicLayout)
    }
  }

  /** 是否显示设置弹窗 */
  const settingsVisible = ref(false)
  const settingsKey = ref('')
  /** 切换设置弹窗显隐 */
  const toggleSettingsVisible = (visible?: boolean) => {
    settingsVisible.value = visible ?? !settingsVisible.value
  }

  /** 主题 */
  const theme = reactive({
    layout: layouts[0],
    /** 主题模式 */
    mode: (localStorage.getItem(`${PREFIX_CLS}-theme-mode`) || 'gray') as ThemeMode,
    /** 主题色 */
    primaryColor: (localStorage.getItem(`${PREFIX_CLS}-theme-primary-color`) || 'green') as PrimaryColor
  })
  /** 设置主题 */
  const setTheme = (cfg: { layout?: Layout; mode?: ThemeMode | string; primaryColor?: PrimaryColor | string }) => {
    theme.layout = cfg.layout || theme.layout
    theme.mode = (cfg.mode || theme.mode) as ThemeMode
    theme.primaryColor = cfg.primaryColor || theme.primaryColor
    
    // 使用统一的主题工具写入 DOM 与存储并派发事件
    setThemeMode(theme.mode as ThemeMode)
    setPrimaryColor(theme.primaryColor)

    localStorage.setItem(`${PREFIX_CLS}-theme-layout`, theme.layout)
    localStorage.setItem(`${PREFIX_CLS}-theme-mode`, theme.mode)
    localStorage.setItem(`${PREFIX_CLS}-theme-primary-color`, theme.primaryColor)
  }
  setTheme({
    layout: (localStorage.getItem(`${PREFIX_CLS}-theme-layout`) || 'layoutA') as Layout,
    mode: (localStorage.getItem(`${PREFIX_CLS}-theme-mode`) || 'light') as ThemeMode,
    primaryColor: (localStorage.getItem(`${PREFIX_CLS}-theme-primary-color`) || 'blue') as PrimaryColor
  })

  return {
    name,
    version,
    scope: readonly(scope),
    scene: readonly(scene),
    requestBaseURL: readonly(requestBaseURL),
    previewURL,
    init,

    getGlobalModalZIndex,

    settingsVisible: readonly(settingsVisible),
    settingsKey,
    toggleSettingsVisible,

    theme: readonly(theme),
    setTheme
  }
})

export default useAppStore

interface IInitializeOptions {
  /** 应用作用域: 如 cs、su 等*/
  scope: string
  /** 应用场景：如 home、microstore 等 */
  scene: string
  /** 请求基础路径，默认 为 / ，如果请求域名和当前页面域名不一致，可以使用完整http链接。 */
  requestBaseURL?: string
  /** 基本布局 */
  basicLayout?: {
    /** 导航栏logo，可以是文本、组件 */
    logo?: any
    /** 自定义按钮，可以是文本、组件 */
    customButtons?: () => any
  }
}
export const initApp = (options: IInitializeOptions) => {
  const appStore = useAppStore()
  appStore.init(options)
}

/** 打开设置面板 */
export const openSettings = (key?: string) => {
  const appStore = useAppStore()
  if (key) {
    appStore.settingsKey = key
  }
  appStore.toggleSettingsVisible(true)
}

/** 关闭设置面板 */
export const closeSettings = () => {
  useAppStore().toggleSettingsVisible(false)
}
