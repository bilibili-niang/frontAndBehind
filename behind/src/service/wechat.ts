import axios from 'axios'

let cachedToken = ''
let tokenExpire = 0

const APPID = process.env.WEAPP_APPID || ''
const APPSECRET = process.env.WEAPP_SECRET || ''

export const getAccessToken = async () => {
  const now = Date.now()
  if (cachedToken && now < tokenExpire - 60_000) {
    return cachedToken
  }
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`
  const { data } = await axios.get(url)
  if (data?.access_token) {
    cachedToken = data.access_token
    tokenExpire = now + (data.expires_in || 7200) * 1000
    return cachedToken
  }
  throw new Error(`获取 access_token 失败: ${data?.errmsg || 'unknown error'}`)
}

export const jscode2session = async (code: string) => {
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${APPSECRET}&js_code=${code}&grant_type=authorization_code`
  const { data } = await axios.get(url)
  if (data?.openid) return data
  throw new Error(`jscode2session 失败: ${data?.errmsg || 'unknown error'}`)
}

export const getUserPhoneNumber = async (code: string) => {
  const accessToken = await getAccessToken()
  const url = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`
  const { data } = await axios.post(url, { code })
  const phone = data?.phone_info?.phoneNumber || data?.phoneInfo?.phoneNumber
  if (phone) return phone
  throw new Error(`获取手机号失败: ${data?.errmsg || 'unknown error'}`)
}