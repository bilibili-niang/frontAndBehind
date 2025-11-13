import request from '@/api/request'

export interface LoginParams {
  userName: string
  password: string
}

export interface LoginResponse {
  token: string
  userInfo: {
    id: string
    avatar: string | null
  }
}

// 登录
export const $login = (data: LoginParams) => {
  return request<LoginResponse>({
    method: 'post',
    url: '/user/login',
    data,
    // 登录前没有 token，不要带 Blade-Auth
    noToken: true,
  })
}
