import Taro, { useRouter } from '@tarojs/taro'
import urlParse from 'url-parse'
import { useUserStore } from '../stores'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn' // 导入中文语言包
dayjs.locale('zh-cn') // 设置 dayjs 的语言为中文
dayjs.extend(relativeTime)

import { $getWechatJsSDKConfig } from '../api'
import { checkWxOauth } from '../hooks/useWxOauth'
import { buildUrl } from '../utils'
import isBetween from 'dayjs/plugin/isBetween';

dayjs.locale('zh-cn') // 设置 dayjs 的语言为中文
dayjs.extend(relativeTime)
dayjs.extend(isBetween)

if (process.env.TARO_ENV === 'h5') {
  window.dayjs = dayjs

  if (location.href.includes('debug=true')) {
    import('vconsole').then(res => {
      new res.default()
      console.log('调试链接：', window.location.href)
    })
  }

  const link = urlParse(window.location.href, true)
  if ('ba' in link.query) {
    const ba = `bearer ${link.query.ba}`

    // 删除连接上的 ba 参数
    delete link.query.ba
    // 替换链接，免刷新页面
    history.replaceState(null, '', link.toString())

    Taro.setStorageSync('Blade-Auth', ba)

    if (window.__wxjs_environment === 'miniprogram' && link.query.backToMiniProgram === 'true') {
      window.wx.miniProgram.navigateBack()
    }
  }

  // H5监听 Blade-Auth 变化 -> 进入小程序登录页 -> 登录成功 redirect H5 设置 Blade-Auth -> 返回H5
  if (window.__wxjs_environment === 'miniprogram') {
    window.addEventListener('storage', e => {
      if (e.key === 'Blade-Auth') {
        useUserStore().getUserInfo()
      }
    })
  }

  // 检测是否微信授权回调 => 登录
  checkWxOauth()
}

export const initWxJssdk = () => {
  if (process.env.TARO_ENV === 'h5' && window.wx) {
    setTimeout(() => {
      $getWechatJsSDKConfig().then((res: any) => {
        window.wx.config({
          appId: res.data.appId,
          timestamp: res.data.timestamp,
          nonceStr: res.data.nonceStr,
          signature: res.data.signature,
          jsApiList: [
            'checkJsApi',
            'updateTimelineShareData',
            'updateAppMessageShareData',
            'hideMenuItems',
            'showMenuItems',
            'chooseWXPay',
            'openAddress',
            'getLocation',
            'openLocation'
          ],
          openTagList: ['wx-open-launch-weapp'],

          debug: location.href.includes('debug=true') // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          // appId: '', // 必填，公众号的唯一标识
          // timestamp: '', // 必填，生成签名的时间戳
          // nonceStr: '', // 必填，生成签名的随机串
          // signature: '',// 必填，签名
          // jsApiList: [] // 必填，需要使用的JS接口列表
          // success: () => {
          //   console.log('.....')
          // },
          // fail: err => {
          //   console.log('.....', err)
          // }
        })

        window.wx.ready(res => {
          console.log('微信 jssdk ready', res)
        })
        window.wx.error(function (res) {
          console.log('微信 jssdk error', res)
        })
      })
    })
  }
}

if (process.env.TARO_ENV === 'weapp') {
  Taro.onUserCaptureScreen(() => {
    try {
      const params = { ...useRouter().params }
      const { $taroTimestamp, ..._params } = params
      const query = buildUrl('', { captureScreen: 'true', ..._params }).replace(/^\?/, '')
      console.log('用户截图了', query)
      return {
        query: query
      }
    } catch (err) {
      return {
        query: 'captureScreen=true'
      }
    }
  })
}
