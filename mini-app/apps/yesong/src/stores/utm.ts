import { ref } from 'vue'
import { defineStore } from 'pinia'
import { $getShortLink, $shortLink } from '../api/utm'
import { getDaysLater } from '../utils/date'
import { safeParse, useAppStore, useUserStore } from '@pkg/core'
import { editorPoster } from '../packageA/posterMaking/create/dataProcessing'
import Taro from '@tarojs/taro'
import { storeToRefs } from 'pinia'

interface UTMInterface {
  utmCampaign: string
  utmSource: string | number
  utmSourceName: string
  utmMedium: string
  utmKeyword: string
  utmContent: string
  page: string
  goodsId: string
  faId: string
  childrenId: string
  infId: string
  isNull: boolean
}

const useUTMStore = defineStore('utm', () => {
  const utm = ref<Partial<UTMInterface>>({
    utmSource: 0,
    utmSourceName: '海报生成',
    utmMedium: '',
    utmKeyword: '',
    utmContent: '',
    page: '',
    goodsId: '',
    faId: '',
    childrenId: '',
    infId: ''
  })
  const utmFromCode = ref<Partial<UTMInterface> | null>(null)
  // 开发版/体验版/正式版
  const env = ref('')

  const userStore = useUserStore()

  const { user } = storeToRefs(userStore)

  const initUTM = () => {
    utm.value.utmSource = 0
    utm.value.utmSourceName = '海报分享'
  }

  const appStore = useAppStore()
  const { accountInfo } = appStore
  const init = () => {
    env.value = accountInfo?.miniProgram?.envVersion
    initUTM()
  }

  init()

  const getUtmData = (obj: Partial<UTMInterface>) => {
    initUTM()
    if (typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        utm.value[key as keyof UTMInterface] = obj[key]
      })
    }
    return utm.value
  }

  /*
   * 根据内容生成短链
   * 前端需要做的只有：
    1、utm_source：默认写入【海报分享】这四个字
    2、utm_campaign：写入用户制作海报时填写的【海报名称】
    你不要把一堆内容放到某个utm 参数里面去，utm 就不是这样用的
   * */
  const getShortLink = async () => {
    return generateSpecifiedContentShortChain({
      utmSource: '海报分享',
      utmCampaign: editorPoster.value.name
    })
  }
  const generateSpecifiedContentShortChain = async (obj: Object) => {
    try {
      return await $shortLink({
        originString: JSON.stringify(obj),
        // 防止过期时间太短用户扫码失败
        expireTime: getDaysLater(120)
      })
    } catch (error) {
      console.error('获取短链失败辣:', error)
      throw error
    }
  }

  const setUtmFromCode = (data: Partial<UTMInterface>) => {
    utmFromCode.value = data
  }
  const initializationFromStorage = () => {
    if (utmFromCode.value?.page) {
      console.log('initializationFromStorage不再执行,已有参数')
    } else {
      const utmCode = Taro.getStorageSync('lastValidUtmCode') || ''
      if (utmCode) {
        $getShortLink(utmCode)
          .then(res => {
            if (res.code === 200 && res.data) {
              const data = safeParse(res.data)
              setUtmFromCode(data)
            }
          })
          .catch(() => {
            // 移除
            Taro.removeStorageSync('lastValidUtmCode')
          })
      }
    }
  }

  return {
    utm,
    getUtmData,
    getShortLink,
    utmFromCode,
    setUtmFromCode,
    env,
    initializationFromStorage,
    generateSpecifiedContentShortChain
  }
})

export default useUTMStore
