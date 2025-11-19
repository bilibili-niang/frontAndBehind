import { TENCENT_MAP_KEY } from '@anteng/config'

/**
 * 异步加载腾讯地图jssdk
 * @returns TMap
 */
export const loadTMap = () => {
  if (process.env.TARO_ENV === 'h5') {
    const TMap_URL =
      'https://map.qq.com/api/gljs?v=1.exp&libraries=tools,service&key=' + TENCENT_MAP_KEY + '&callback=onMapCallback'
    return new Promise((resolve, reject) => {
      try {
        // 如果已加载直接返回
        if (typeof (<any>window).TMap !== 'undefined') {
          resolve((<any>window).TMap)
          return true
        }
        // 地图异步加载回调处理
        ;(<any>window).onMapCallback = function () {
          resolve((<any>window).TMap)
        }

        // 插入script脚本
        const scriptNode = document.createElement('script')
        scriptNode.setAttribute('type', 'text/javascript')
        scriptNode.setAttribute('src', TMap_URL)
        document.body.appendChild(scriptNode)
      } catch (err) {
        reject(err)
      }
    })
  }
  return Promise.reject(new Error('非H5环境使用Map组件代替'))
}

/** 获取两坐标之间的地理距离，单位 km */
export const getGeoDistance = (
  lng1: number | string,
  lat1: number | string,
  lng2: number | string,
  lat2: number | string
) => {
  lng1 = +lng1
  lat1 = +lat1
  lng2 = +lng2
  lat2 = +lat2
  const radLat1 = (lat1 * Math.PI) / 180.0
  const radLat2 = (lat2 * Math.PI) / 180.0
  const a = radLat1 - radLat2
  const b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0
  let s =
    2 *
    Math.asin(
      Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2))
    )
  s = s * 6378.137
  s = Math.round(s * 100) / 100
  return s
}

/** 格式化距离文本 */
export const formatDistance = (m: number, space?: boolean) => {
  const _m = Math.round(m)
  if (Number.isNaN(_m)) return ''
  return _m >= 1000 ? `${Math.round(_m) / 1000}${space ? ' ': ''}km` : `${_m}${space ? ' ': ''}m`
}
