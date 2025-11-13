import useWebView from './useWebView'
import { TENCENT_MAP_KEY } from '@anteng/config'

export interface IUseMapViewOptions {
  name: string
  address: string
  longitude: number | string
  latitude: number | string
}

/** 打开地图展示弹窗 */
const useMapView = (options: IUseMapViewOptions) => {
  return useWebView({
    width: 600,
    height: 800,
    link: `https://mapapi.qq.com/web/mapComponents/locationMarker/v/index.html?type=0&marker=coord:${
      options.latitude
    },${options.longitude};title:${options.name || ''};addr:${
      options.address || ''
    }&key=${TENCENT_MAP_KEY}&referer=myapp`
  })
}

export default useMapView
