// 虚假的请求
export const $fake = () => {
  return new Promise((resolve, reject) => {
    resolve({
      code: 200,
      success: true,
      data: {}
    })
  })
}

export const $getOpenAppId = $fake
export const $getShortLinkContent = $fake
export const $updateUserProfile = $fake
export const getServerTime = $fake
export const $getCities = $fake
export const $getWxacodeUnlimit = $fake
export const $bindWechat = $fake
export const getPayParams = $fake
export const sendMessageCode = $fake
export const authMessageCode = $fake
export const $getWxOauthURL = $fake
// 保留假实现的导出名称，但建议在具体调用处改用真实实现
export const loginWithToken = $fake
export const wxBind = $fake
export const wxAuthLogin = $fake
export const $postWxOauthBind = $fake
export const $postWxOauthLogin = $fake
export const WX_OAUTH_KEY = 0