import request from '../request'

type LoginRes = {
  openid: string
  status: 1 | 2
  directToken?: string
}

export const wxAuthLogin = (code: string) => {
  return request.post<LoginRes>('/api/auth/weapp/login', { code }, { noToken: true })
}

export const wxBind = (openId: string, code: string) => {
  return request.post<{ status: 1; directToken: string }>('/api/auth/weapp/bind', { openId, code }, { noToken: true })
}

export const loginWithToken = (token: string) => {
  // 兼容现有调用：直接把 token 存入本地，返回约定结构
  try {
    // 以 Blade-Auth 存储，契合拦截器
    // @ts-ignore
    const Taro = require('@tarojs/taro').default
    Taro.setStorageSync('Blade-Auth', token)
  } catch (_) {}
  return Promise.resolve({ code: 200, success: true, data: { token } })
}