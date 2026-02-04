import { TENCENT_MAP_KEY, TENCENT_MAP_REFERER } from '@pkg/config'
import Taro from '@tarojs/taro'
import useToast from './useToast'

interface UseOpenLocationOptions {
  /** 经度 */
  longitude?: number | string
  /** 纬度 */
  latitude?: number | string
  /** 地点名称 */
  name?: string
  /** 详细地址 */
  address?: string
  /** 缩放等级（仅小程序），默认18 */
  scale?: number
}

/** 打开地图导航 */
const useOpenLocation = (options: UseOpenLocationOptions) => {
  const longitude = Number(options.longitude)
  const latitude = Number(options.latitude)

  if (!longitude || !latitude) {
    useToast('定位坐标缺失')
    return void 0
  }

  if (process.env.TARO_ENV === 'h5') {
    const marker = `coord:${latitude},${longitude};title:${options.name};addr:${options.address}`
    window.location.href = `https://apis.map.qq.com/tools/poimarker?type=0&marker=${marker}&key=${TENCENT_MAP_KEY}&referer=${TENCENT_MAP_REFERER}`
  } else {
    Taro.openLocation({
      longitude,
      latitude,
      name: options.name,
      address: options.address,
      scale: options.scale
    })
  }
}

export default useOpenLocation
