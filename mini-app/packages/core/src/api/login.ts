import request from './request'

/** 发送短信验证码 */
export const sendMessageCode = (phone: string) => {
  return request({
    url: '/null-cornerstone-system/sms/validate',
    method: 'post',
    data: {
      phone
    }
  })
}

/** 给当前用户发送短信验证码 */
export const sendMessageCodeWithoutPhone = () => {
  return request({
    url: '/null-cornerstone-system/sms/validate/current-user',
    method: 'post'
  })
}

type AuthMessageCodeOptions = {
  /** 授权范围 */
  scope: string
  /** 手机号码 */
  phone: string
  /** 验证码id */
  smsId: string
  /** 验证码 */
  code: string
}

export type resetPasswordType = {
  /** 手机号码 */
  mobile: string
  /** 验证码id */
  smsId: string
  /** 新密码 */
  newPassword: string
  /** 验证码 */
  code: string
}

export const authMessageCode = (options: AuthMessageCodeOptions) => {
  const { scope, phone, smsId, code } = options
  return request({
    url: '/blade-auth/oauth/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: {
      grant_type: 'sms_code',
      scope,
      phone,
      sms_id: smsId,
      value: code
    }
  })
}

// 重置密码
export const resetPasswordRequest = (options: resetPasswordType) => {
  const { mobile, smsId, code, newPassword } = options
  return request({
    url: '/null-cornerstone-system/auth/account/password-reset',
    method: 'POST',
    data: {
      id: smsId,
      phone: mobile,
      value: code,
      newPassword
    }
  })
}
// 手机号密码登录
export const loginByAccountAndPassword = (data: { 
  account?: string;    // 通用账号（可以是用户名或手机号）
  userName?: string;   // 用户名
  phoneNumber?: string; // 手机号
  password: string;     // 密码
}) => {
  return request({
    url: '/api/user/login',
    method: 'POST',
    data
  })
}

export interface IAuthMerchant {
  /** 公司名称 */
  companyName: string
  /** 合作商说明 */
  desc: string
  /** 直接登录 token */
  directToken: string
  /** 合作商 id */
  id: string
  /** 是否管理员 */
  isAdmin: boolean
  /** logo */
  logoImgUri: string
  /** 合作商名称 */
  name: string
}

export const authMessageCodeThenChooseMerchant = (options: AuthMessageCodeOptions) => {
  return request<IAuthMerchant[]>({
    url: '/null-cornerstone-system/auth/merchant/sms',
    method: 'post',
    data: {
      phone: options.phone,
      id: options.smsId,
      value: options.code
    }
  })
}

export const authMerchantDirect = (options: { token: string; scope: string }) => {
  return request({
    url: '/blade-auth/oauth/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: {
      grant_type: 'merchant_direct',
      scope: options.scope,
      direct_token: options.token
    }
  })
}

/** 获取可切换商户列表 */
export const getSwitchableMerchantList = () => {
  return request<any[]>({
    url: '/null-cornerstone-system/me/merchant'
  })
}

// 用户退出登录
export const $logout = () => {
  // 使用http发出原始请求

  return request({
    url: '/blade-auth/oauth/logout',
    noBladeAuth: true
  } as any)
}
