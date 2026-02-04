import getSystemPagesVersion from '../../api/deck/getSystemPagesVersion'
import { defineStore } from 'pinia'

// 默认登录页装修
import defaultLoginPage from './pages/login.json'
import Taro from '@tarojs/taro'
import { h, Ref, ref, toRaw, watch } from 'vue'
import requestGetSystemPage from '../../api/deck/getSystemPage'
import { useLoginDeck } from '@pkg/core'
import { DeckRender } from '@pkg/deck'

const SYSTEM_PAGE_STORAGE_KEY = 'system-pages'

interface ISystemPage {
  key: string
  title: string
  version: null | string
  decorate: any
}

const useSystemPageStore = defineStore('system-page', () => {
  // 页面默认定义
  const loginPage = ref<ISystemPage>({ key: 'login', title: '登录页', decorate: defaultLoginPage, version: null })
  const profilePage = ref<ISystemPage>({ key: 'profile', title: '个人中心', decorate: null, version: null })
  const searchPage = ref<ISystemPage>({ key: 'search', title: '搜索页', decorate: null, version: null })

  const userAgreementPage = ref<ISystemPage>({
    key: 'user-agreement',
    title: '用户协议',
    decorate: null,
    version: null
  })

  const systemPages: Ref<ISystemPage>[] = [loginPage, profilePage, searchPage, userAgreementPage]

  watch(
    () => [loginPage.value, userAgreementPage.value],
    () => {
      useLoginDeck({
        pageConfig: loginPage.value?.decorate?.payload?.page,
        userAgreement: userAgreementPage.value?.decorate?.payload?.page,
        deckRender: () => {
          const comps = loginPage.value?.decorate?.payload.components
          if (comps?.length > 0) {
            return h(DeckRender, { components: comps })
          }
        }
      })
    },
    { immediate: true, deep: true }
  )

  // 获取系统页面配置
  const getSystemPage = (key: string) => {
    return systemPages.find(item => item.value.key === key)
  }

  /** 从本地恢复缓存数据 */
  const retrieveStorageData = () => {
    try {
      const cacheData: ISystemPage[] = JSON.parse(Taro.getStorageSync(SYSTEM_PAGE_STORAGE_KEY))
      cacheData.forEach(item => {
        if (item.version !== null && item.decorate) {
          const targetPage = getSystemPage(item.key)?.value

          // 找不到对应的页面，略过
          if (!targetPage) return void 0

          if (targetPage.version === null) {
            // 当前的版本号为空，说明使用的是默认数据，直接用缓存的数据覆盖
            targetPage.version = item.version
            targetPage.decorate = item.decorate
          } else {
            // 缓存的版本号和当前的版本号不一致，从服务器获取最新版本
            retrieveFromServer(item.key)
          }
        }
      })
      // console.log('SystemPage：恢复本地缓存成功')
    } catch (err) {
      console.error('SystemPage：恢复本地缓存失败')
      return void 0
    }
  }

  // 立即从本地恢复
  retrieveStorageData()

  /** 更新本地缓存页面数据（剔除 version 为 null 的） */
  const updateStorageData = () => {
    const list = systemPages.filter(item => item.value.version !== null).map(item => toRaw(item.value))
    Taro.setStorageSync(SYSTEM_PAGE_STORAGE_KEY, JSON.stringify(list))
  }

  /** 从服务器获取最新数据 */
  const retrieveFromServer = (key: string) => {
    const targetPage = getSystemPage(key)?.value
    if (!targetPage) return void 0
    requestGetSystemPage(key)
      .then(res => {
        // 替换版本号，装修数据
        const { version, decorate } = res.data
        targetPage.version = version
        targetPage.decorate = decorate

        // 将最新的数据更新到本地缓存
        updateStorageData()
      })
      .catch(err => {
        console.error(`获取 ${key} 页面失败`, err)
      })
  }

  /** 检测系统页面版本，注意：如果需要实时获取最新版本可以调用 retrieveFromServer */
  const checkSystemPagesVersion = () => {
    getSystemPagesVersion().then(res => {
      res.data.forEach(item => {
        // 存在版本号，说明在后台进行过装修配置
        if (item.version?.length > 0) {
          const targetPage = getSystemPage(item.key)?.value

          // 找不到对应的页面，略过
          if (!targetPage) return void 0

          // 当前版本和服务器版本不一致，请求获取最新版本数据覆盖
          if (targetPage.version !== item.version) {
            retrieveFromServer(item.key)
          }
        }
      })
    })
  }

  return {
    systemPages,
    checkSystemPagesVersion,

    loginPage,
    profilePage,
    searchPage,
    userAgreementPage
  }
})

export default useSystemPageStore
