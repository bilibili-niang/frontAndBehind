import urlParse from 'url-parse'
import { backToIndex } from '../router'
import Taro from '@tarojs/taro'
export * from './draw'
export * from './addressTranslation'

export { convertFenToYuanAndFen } from './moneyHandling'

export const parseLink = (link: string, params?: Record<string, string>) => {
  const url = urlParse(link, true)
  Object.assign(url.query, params)
  return url.toString()
}

// 返回
export const onBack = () => {
  const pages = Taro.getCurrentPages().filter(item => item.route !== 'pages/launch')
  if (pages.length > 1) {
    Taro.navigateBack({
      delta: 1,
      success(res) {
        console.log(res)
      },
      fail(err) {
        console.log(err)
        backToIndex()
      }
    })
  } else {
    backToIndex()
  }
}

export * from './test'