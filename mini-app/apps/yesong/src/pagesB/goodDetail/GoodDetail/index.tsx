import './style.scss'
import { defineComponent, ref } from 'vue'
import Taro, { useRouter } from '@tarojs/taro'
import { redirectTo, safeParse, Spin, useToast } from '@pkg/core'
import { $getShortLink } from '../../../api/utm'
import { ROUTE_INFORMATION_DETAIL } from '../../../router/routes'
import { utmStore } from '../../../stores'
import { backToIndex } from '../../../router'
import { HOME_PAGE } from '../../../constants'
import { useGlobalStore } from '../../../stores'
import { storeToRefs } from 'pinia'

definePageConfig({
  navigationStyle: 'custom',
  disableScroll: true
})

export default defineComponent({
  name: 'SpringboardPage',
  setup() {
    const appStore = useGlobalStore()
    const { tabs, currentTab, loadedTab, indexTabConfig } = storeToRefs(appStore)
    const errorMsg = ref('')
    const { setUtmFromCode } = utmStore()
    // 如果是扫码进来的,需要解析一下utm参数
    const query = useRouter().params
    // 如果小程序没有关闭,在第二次扫码时进来,可能获取不到 query.utmCode
    const utmCode = query.utmCode || query.scene.replace('utmCode%3D', '')
    console.log('扫码进入的参数', utmCode)
    const init = () => {
      // 如果没有 utmCode，尝试从 storage 中获取
      const currentUtmCode = utmCode || Taro.getStorageSync('lastValidUtmCode')
      if (currentUtmCode) {
        $getShortLink(currentUtmCode)
          .then(res => {
            if (res.code === 200 && res.data) {
              // 将有效的utmCode存储到本地
              Taro.setStorageSync('lastValidUtmCode', currentUtmCode)
              const data = safeParse(res.data)
              // 解析返回的utm参数,预留了很多字段
              setUtmFromCode(data)

              console.log('二维码解析data:')
              console.log(data)

              setTimeout(() => {
                if (data.page === HOME_PAGE) {
                  // 0 只能是首页,不是首页我跳哪?
                  appStore.toggleTab(tabs.value[0]?.key)
                  redirectTo({
                    url: '/packageMain/index'
                  })
                  return void 0
                }
                if (data?.goodsId) {
                  redirectTo({
                    url: '/packageA/goods/detail' + `?gid=${data?.goodsId}`
                  })
                } else if (data?.infId) {
                  redirectTo({
                    url: ROUTE_INFORMATION_DETAIL + `?id=${data?.infId}`
                  })
                } else if (data?.faId) {
                  if (data?.childrenId) {
                    redirectTo({
                      url: `/packageA/category/index?id=${data.faId}&childrenId=${data.childrenId}`
                    })
                  } else {
                    redirectTo({
                      url: '/packageA/category/index?' + `id=${data.faId}`
                    })
                  }
                } else {
                  useToast('二维码无效或已过期')
                  // 如果都没有参数,就跳转首页
                  try {
                    Taro.reLaunch({
                      url: '/packageMain/index'
                    })
                  } catch (e) {
                    console.log(e)
                  }
                }
              }, 500)
            }
          })
          .catch(e => {
            // useToast(e.response.data.msg || '二维码无效或已过期')
            errorMsg.value = e.response?.data?.msg || '二维码无效或已过期'
            Taro.removeStorageSync('lastValidUtmCode')
            backToIndex()
          })
      } else {
        backToIndex()
      }
    }
    init()
    return () => {
      return (
        <div class="qrCode" onClick={init}>
          <Spin />
          {errorMsg.value ? errorMsg.value : ''}
        </div>
      )
    }
  }
})
