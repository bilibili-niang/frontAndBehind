import { useAppStore, useUserStore } from '../stores'
import { buildUrl, navigateTo, redirectTo, usePopup, useToast } from '@anteng/core'
import Login from '../views/common-login'
import Taro, { useRouter } from '@tarojs/taro'

export { useLoginDeck } from '../views/common-login'

let loginPopup: any
let loginPopupRoute: any

let customLogin: null | ((options: Parameters<typeof useLogin>[0]) => Promise<any>) = null

/** 自行实现登录逻辑 */
export const registerCustomLogin = (customLoginImplementation: typeof customLogin) => {
  customLogin = customLoginImplementation
}

const useLogin = async (options?: { reload?: boolean }) => {
  if (useUserStore().isLogin) {
    return Promise.resolve('已登录')
  }

  const route = useRouter()

  if (loginPopup && loginPopupRoute === route) {
    return loginPopup
  }

  if (useAppStore().initialized) {
    loginPopupRoute = route
  }

  const reload = options?.reload ?? true

  if (process.env.TARO_ENV === 'h5' && window.__wxjs_environment === 'miniprogram') {
    return new Promise((resolve, reject) => {
      window.wx.miniProgram.navigateTo({
        url: `/pages/login?callbackURL=${encodeURIComponent(window.location.href)}`,
        success: resolve,
        fail: reject
      })
    })
  }

  const callbackURL = decodeURIComponent(useRouter().params.callbackURL || '')
  const callback = (token: string) => {
    setTimeout(() => {
      const isLoginPath = useRouter().path.includes('login')
      ;(isLoginPath ? redirectTo : navigateTo)({
        url: `/packageMain/web?url=${encodeURIComponent(`${callbackURL}?ba=${token}&backToMiniProgram=true`)}`
      })
    }, 300)
  }

  const commonLoginSuccess = (res: any) => {
    console.log('commonLoginSuccess：', res)

    Taro.setStorageSync('Blade-Auth', `${res.token_type} ${res.access_token}`)
    return useUserStore()
      .getUserInfo()
      .then(userInfo => {
        Taro.hideLoading()
        useToast('登录成功')

        if (userInfo?.phone) {
          Taro.setStorageSync('last-login-mobile', userInfo.phone)
        }

        if (reload) {
          // 重载此页面
          if (process.env.TARO_ENV === 'h5') {
            window.location.reload()
          } else {
            const router = useRouter()
            Taro.redirectTo({
              url: buildUrl(router.path, router.params)
            })
          }
        } else if (callbackURL) {
          callback(res.access_token)
        }

        return userInfo
      })
      .catch(err => {
        Taro.hideLoading()
        useToast(err.response?.data?.msg || err.message || '登录失败，请重试')
      })
  }

  loginPopup = new Promise((resolve, reject) => {
    if (customLogin) {
      customLogin?.(options)
        ?.then(res => {
          if (res) {
            commonLoginSuccess(res).then(() => {
              if (useUserStore().isLogin) {
                resolve('登录成功')
              } else {
                reject(new Error('未登录'))
              }
            })
          }
        })
        ?.catch(err => {
          console.log(err)
          reject(new Error('取消登录'))
        })
        ?.finally?.(() => {
          loginPopup = undefined
        })
    } else {
      const popup = usePopup({
        content: (
          <Login
            reload={reload}
            onCancel={() => {
              popup.close()
              reject(new Error('取消登录'))
            }}
          />
        ),
        onClose: () => {
          loginPopup = undefined
          if (useUserStore().isLogin) {
            resolve('登录成功')
          } else {
            reject(new Error('取消登录'))
          }
        },
        placement: 'bottom'
      })
    }
  })
  return loginPopup
}

export default useLogin

export interface ICheckLoginParams {
  message?: string | null
}

/**
 * 登录检查
 * @param options
 */
export const useCheckLogin = async (options?: ICheckLoginParams) => {
  if (useUserStore().isLogin) {
    return Promise.resolve()
  }
  console.log('没有用户登录')
  const message = options?.message ?? '请您先登录'
  if (message) {
    useToast(message)
  }
  return await useLogin({ reload: false })
}

export const withLogin = <T extends (...args: any[]) => any>(handler: T, options?: ICheckLoginParams) => {
  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve, reject) => {
      useCheckLogin(options)
        .then(() => {
          try {
            const result = handler(...args)
            if (result instanceof Promise) {
              result.then(resolve).catch(reject)
            } else {
              resolve(result)
            }
          } catch (err) {
            reject(err)
          }
        })
        .catch(error => {
          // 在这里可以处理登录检查失败的情况
          reject(error)
        })
    })
  }
}
