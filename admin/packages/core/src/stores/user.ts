import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import request from '../api/request'
import { message, Modal } from '@pkg/ui'
import router from '../router'
import useAppStore from './app'
import { SCENE_YESONG } from '@pkg/config'
import { $logout } from '../api/login'

interface IUserInfo {
  account: string
  avatar: string | null
  id: string
  name: string
  merchantName: string
  phone: string
  realName: string | null
  status: number
  merchantId: number | string
}

const useUserStore = defineStore('USER', () => {
  const userInfo = ref<IUserInfo | null>(null)
  const isLogin = computed(() => {
    return userInfo.value !== null
  })
  const getUserInfo = async () => {
    try {
      const res = await request({
        url: '/api/user/me',
        method: 'get'
      })
      userInfo.value = res.data
    } catch (err) {
      console.log('获取用户信息失败：', err)
    }
  }

  getUserInfo()

  const logout = () => {
    Modal.confirm({
      title: '退出登录',
      content: '您确定要退出登录吗？',
      onOk: () => {
        const msg = message.info('正在退出登录...')
        $logout()
          .then((e) => {
            console.log('退出登录')
          })
          .finally(() => {
            msg?.()
            setTimeout(() => {
              userInfo.value = null
              localStorage.removeItem('Blade-Auth')
              router.replace('/login')
              message.info('您已安全退出登录')
            }, 500)
          })
      }
    })
  }

  const merchantInfo = ref<any>()
  const getMerchantInfo = (merchantId: string | number) => {
    request({
      url: `/null-cornerstone-merchant/merchant/${merchantId}`
    })
      .then((res) => {
        merchantInfo.value = res.data
        if (useAppStore().scope === SCENE_YESONG) {
          if (merchantInfo.value.menuName) {
            document.title = merchantInfo.value.menuName
          }
          const favIcon = document.querySelector('[rel="icon"]') as any
          if (favIcon && merchantInfo.value.menuLogo) {
            favIcon.href = merchantInfo.value.menuLogo
          }
        }
      })
      .catch(() => {
        merchantInfo.value = {}
      })
  }

  return {
    userInfo,
    isLogin,
    getUserInfo,
    logout,
    merchantInfo
  }
})

export default useUserStore
