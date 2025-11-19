import { getGeoDistance } from '@anteng/utils'
import { useUserStore } from '../stores'

export default (
  options?: { longitude?: number | string; latitude?: number | string; unit?: 'km' | 'm' | 'auto' } | null
) => {
  if (!options) {
    return ''
  }
  const userStore = useUserStore()
  const userLocation = userStore.userLocation
  const { longitude, latitude } = options || {}
  if (!longitude || !latitude || !userLocation) {
    return ''
  }

  const dis = getGeoDistance(longitude, latitude, userLocation.longitude, userLocation.latitude)

  if (options.unit === 'km') {
    return `${Math.round(dis * 100) / 100} km`
  } else if (options.unit === 'm') {
    return `${Math.round(dis * 1000)} m`
  }

  return dis < 1 ? `${Math.round(dis * 1000)} m` : `${Math.round(dis * 100) / 100} km`
}
