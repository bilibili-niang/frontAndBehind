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
    url: '/api/user/login',
    data,
    // 登录前没有 token，不要带 Blade-Auth
    noToken: true,
  })
}

// 创建用户
export interface CreateUserParams {
  userName: string
  password: string
}

export interface CreateUserResponse {
  id?: string
  userName: string
  password?: string
}

export const $userCreate = (data: CreateUserParams) => {
  // 使用绝对地址以兼容提供的 Mock 接口
  // 若后端网关提供统一前缀，可改为 '/api/user/create'
  return request<CreateUserResponse>({
    method: 'post',
    url: '/api/user/create',
    data,
    // 创建接口需要登录态，默认会携带 Blade-Auth
  })
}
