import axios from 'axios'
import CryptoJS from 'crypto-js'
import { TRANSLATE_APP_ID, TRANSLATE_APP_KEY } from '@/constant' // 确保这些常量在 Node 环境可用

function truncate(q) {
  const len = q.length
  if (len <= 20) return q
  return q.substring(0, 10) + len + q.substring(len - 10, len)
}

export const $transform = async (value) => {
  const salt = Date.now().toString()
  const curtime = Math.round(Date.now() / 1000)
  const str1 = TRANSLATE_APP_ID + truncate(value) + salt + curtime + TRANSLATE_APP_KEY
  const sign = CryptoJS.SHA256(str1).toString(CryptoJS.enc.Hex)

  const params = {
    q: value,
    from: 'zh-CHS',
    to: 'en',
    appKey: TRANSLATE_APP_ID,
    signType: 'v3',
    curtime,
    salt,
    sign,
    vocabId: ''
  }

  try {
    const response = await axios.post('https://openapi.youdao.com/api', null, {
      params // 有道 API 使用 query string 传参
    })

    return response.data
  } catch (error) {
    console.error('翻译请求失败:', error.response?.data || error.message)
    throw error
  }
}