import { defineComponent, onBeforeUnmount, PropType, ref, toRaw, watch } from 'vue'
import { INearbyPoint, useChooseNearbyPoints } from './useChooseNearbyPoints'
import { $getLocationDetails } from './api'
import { Icon } from '@anteng/ui'
import './pin-view.scss'
import { debounce } from 'lodash-es'

const PinView = defineComponent({
  props: {
    map: {
      type: Object as PropType<TMap.Map>,
      required: true
    }
  },
  emits: {
    change: (currentPoint: INearbyPoint) => true
  },
  setup(props, { emit, expose }) {
    const modalLevel = ref(1)

    const isPinEnable = ref(true)
    const isMapTouched = ref(false)
    /** 地图是否移动中 */
    const isMapMoving = ref(false)
    const isPinLoading = ref(false)
    const isPinError = ref(false)
    const isPinLocked = ref(false)

    const unlockPin = debounce(() => {
      isPinLocked.value = false
    }, 32)

    const showPin = () => {
      isPinEnable.value = true
      getCurrentPoint()
    }

    const closePin = () => {
      isPinEnable.value = false
      const l = modalLevel.value
      if (modalLevel.value < 2) {
        modalLevel.value = 2
      }
      setTimeout(() => {
        modalLevel.value = Math.max(1, l)
      }, 2000)
    }

    const mapCenter = ref({
      lng: 0,
      lat: 0,
      x: 0,
      y: 0
    })

    const getMapCenter = () => {
      const center = props.map.getCenter()
      mapCenter.value.lng = center.lng
      mapCenter.value.lat = center.lat
    }

    const onCenterChange = () => {
      if (!isMapTouched.value) {
        isMapMoving.value = false
        if (!isPinLocked.value) {
          getCurrentPoint()
        }
      }
      unlockPin()
    }

    const setMapCenter = (lat: number, lng: number) => {
      // props.map.setCenter(new TMap.LatLng(lat, lng))
      props.map.easeTo({
        // @ts-ignore
        center: process.env.TARO_ENV === 'h5' ? new TMap.LatLng(lat, lng) : { lat, lng },
        zoom: Math.max(14, props.map.getZoom())
      })
    }

    /** 中心点逆解析详情（原始数据） */
    const mapCenterDetails = ref()
    /** 中心点位置信息 */
    const currentPoint = ref<INearbyPoint>()

    watch(
      () => mapCenterDetails.value,
      () => {
        currentPoint.value = calcCurrentPoint()
        emit('change', toRaw(currentPoint.value))
      }
    )

    /** 中心点详情 */
    const calcCurrentPoint = (): INearbyPoint => {
      const { formatted_addresses, address, location, address_reference, ad_info } = mapCenterDetails.value || {}
      return {
        title:
          address_reference?.landmark_l1?.title || formatted_addresses?.rough || formatted_addresses?.recommend || '',
        id: address_reference?.landmark_l2?.id,
        /** 地址 */
        address: formatted_addresses?.standard_address || address,
        /** 坐标 */
        location: address_reference?.landmark_l2?.location || location,
        /** 分类 */
        category: '',
        /** 距离 */
        _distance: address_reference?.landmark_l2?._distance || 0,
        /** 方位描述 */
        _dir_desc: address_reference?.landmark_l2?._dir_desc || '',
        ad_info: ad_info
      }
    }

    let getCurrentPointTimer: NodeJS.Timeout
    /** 获取当前点信息 */
    const getCurrentPoint = () => {
      if (!isPinEnable.value) return void 0
      clearTimeout(getCurrentPointTimer)
      getMapCenter()
      isPinLoading.value = true
      getCurrentPointTimer = setTimeout(() => {
        isPinLocked.value = false
        $getLocationDetails(mapCenter.value)
          .then((res: any) => {
            mapCenterDetails.value = res.result
            // onPinLocationClick()
          })
          .catch(() => {
            isPinError.value = true
          })
          .finally(() => {
            isPinLoading.value = false
          })
      }, 600)
    }

    /** 点击定位气泡 */
    const onPinLocationClick = () => {
      if (!currentPoint.value) return void 0
      useChooseNearbyPoints({
        lng: mapCenter.value.lng,
        lat: mapCenter.value.lat,
        currentPoint: currentPoint.value,
        points: mapCenterDetails.value.pois,
        onSuccess: v => {
          setTimeout(() => {
            pinToPoint(v)
          }, 300)
        }
      })
    }

    expose({ onPinLocationClick })

    const pinToPoint = (point: INearbyPoint, refresh?: boolean) => {
      if (!refresh) {
        isPinLocked.value = true
      }
      currentPoint.value = point
      setMapCenter(point.location.lat, point.location.lng)
      emit('change', toRaw(currentPoint.value))
    }

    watch(
      () => props.map,
      () => {
        if (!props.map) return void 0
        props.map.off('center_changed', onCenterChange)
        props.map.on('center_changed', onCenterChange)
        getCurrentPoint()
      },
      {
        immediate: true
      }
    )

    onBeforeUnmount(() => {
      props.map.off('center_changed', onCenterChange)
    })

    return () => (
      <div class="use-choose-address__pin-wrap">
        <div class={['use-choose-address__pin-view', !isPinEnable.value && 'view-hidden']}>
          <div class={['pin-loading', isMapMoving.value && 'visible', isPinLoading.value && 'loading']}></div>
          <div class={['pin-tip', !(isMapMoving.value || isPinLoading.value) && 'visible']}>
            <div class="pin-bubble" onClick={onPinLocationClick}>
              <div class="pin-text">{currentPoint.value?.title || '未知位置'}</div>
              <Icon name="right" />
            </div>
            <div class="pin-line"></div>
            <div class="pin-spot"></div>
          </div>
        </div>
      </div>
    )
  }
})

export default PinView
