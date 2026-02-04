import { computed, defineComponent, onMounted, onUnmounted, PropType, reactive, Ref, ref, shallowRef, toRaw } from 'vue'
import useModal from '../useModal'
import './style.scss'
import { Icon } from '@pkg/ui'
import { INearbyPoint } from './useChooseNearbyPoints'
import PinView from './pin-view'
import { loadTMap, uuid } from '@pkg/utils'
import useResponseMessage from '../useResponseMessage'
import Spin from '../../components/spin'
import EmptyStatus, { EmptyAction } from '../../components/empty-status'
import { useModalActions } from '../useModal/useModalActions'
import { useUserStore } from '../../stores'
import { Map } from '@tarojs/components'
import Taro from '@tarojs/taro'
import emitter from '../../utils/emitter'
import useToast from '../useToast'

export type IPinAddress = {
  province?: string
  city?: string
  district?: string
  title?: string
  address?: string
  code?: number
  latitude: number
  longitude: number
}

interface IUseChooseAddressOptions {
  latitude?: number
  longitude?: number
  scale?: number
  onSuccess?: (v: IPinAddress) => void
  onCancel?: () => void
}

const MapViewLoader = defineComponent({
  props: {
    options: {
      type: Object as PropType<IUseChooseAddressOptions>
    }
  },
  emits: {
    confirm: (v: IPinAddress) => true,
    cancel: () => true
  },
  setup(props, { emit }) {
    // 非 h5 不需要加载 js sdk
    if (process.env.TARO_ENV !== 'h5') {
      return () => (
        <MapView options={props.options} onConfirm={e => emit('confirm', e)} onCancel={() => emit('cancel')} />
      )
    }

    const state = reactive({
      status: 'loading'
    })
    const loadMap = () => [
      loadTMap()
        .then(() => {
          // state.status = 'error'
          state.status = 'success'
        })
        .catch(err => {
          useResponseMessage(err)
          state.status = 'error'
        })
    ]
    onMounted(() => {
      loadMap()
    })

    return () => (
      <div>
        {state.status === 'loading' ? (
          <div class="use-choose-address-loading">
            <Spin />
          </div>
        ) : state.status === 'error' ? (
          <div class="use-choose-address-loading">
            <EmptyStatus
              description="地图加载失败"
              actions={() => {
                return (
                  <>
                    {/* @ts-ignore */}
                    <EmptyAction onClick={navigateBack}>返回</EmptyAction>
                    {/* @ts-ignore */}
                    <EmptyAction primary onClick={loadMap}>
                      刷新试试
                    </EmptyAction>
                  </>
                )
              }}
            />
          </div>
        ) : (
          <MapView options={props.options} onConfirm={e => emit('confirm', e)} onCancel={() => emit('cancel')} />
        )}
      </div>
    )
  }
})

const MapView = defineComponent({
  props: {
    options: {
      type: Object as PropType<IUseChooseAddressOptions>
    }
  },
  emits: {
    confirm: (v: IPinAddress) => true,
    cancel: () => true
  },
  setup(props, { emit }) {
    const mapId = `map-${uuid()}`

    const pinPoint = ref<INearbyPoint>()
    const isPinEnable = ref(true)
    const isPinLoading = ref(false)
    const isPinError = ref(false)

    const onPinChange = (point: INearbyPoint) => {
      pinPoint.value = point
      isPinLoading.value = false
      isPinError.value = false
    }

    const pinViewRef = ref()
    const onPinLocationClick = () => {
      pinViewRef.value.onPinLocationClick()
    }

    const moveToLocation = () => {
      // 定位用户坐标
      useUserStore()
        .getUserLocation({
          denyTip: true
        })
        .then(res => {
          emitter.trigger(mapId, res)
        })
        .catch(useResponseMessage)
    }

    const Tools = () => {
      if (isPinEnable.value) {
        return (
          <>
            <div class="use-choose-address__toolbar left"></div>
            <div class="use-choose-address__toolbar">
              {process.env.TARO_ENV === 'weapp' && (
                <div
                  class="button"
                  onClick={() => {
                    moveToLocation()
                  }}
                >
                  <Icon name="navigate-fill" />
                </div>
              )}
              <div class="button" onClick={onPinLocationClick}>
                <Icon style="transform:scale(0.8);" name="location" />
                <div class="text">搜索周边</div>
              </div>
            </div>
          </>
        )
      }
    }

    const data = computed<IPinAddress | null>(() => {
      if (!pinPoint.value) return null
      return {
        latitude: pinPoint.value.location.lat,
        longitude: pinPoint.value.location.lng,
        address: pinPoint.value.address,
        province: pinPoint.value.ad_info.province,
        city: pinPoint.value.ad_info.city,
        district: pinPoint.value.ad_info.district,
        title: pinPoint.value.title,
        code: pinPoint.value.ad_info.adcode
      }
    })

    const { Actions } = useModalActions([
      // {
      //   text: '取消',
      //   onClick: () => {
      //     emit('cancel')
      //   }
      // },
      {
        text: '确定',
        primary: true,
        onClick: () => {
          if (!pinPoint.value) {
            useToast('请重新选择')
            return void 0
          }
          emit('confirm', toRaw(data.value)!)
        }
      }
    ])

    /* ----------------------------------- H5 ----------------------------------- */
    /* ----------------------------------- H5 ----------------------------------- */
    /* ----------------------------------- H5 ----------------------------------- */
    /* ----------------------------------- H5 ----------------------------------- */
    if (process.env.TARO_ENV === 'h5') {
      const mapEl = ref<HTMLElement>()
      const centerEl = ref<HTMLElement>()
      const mapRef = shallowRef() as Ref<TMap.Map>
      const mapViewMode = ref<TMap.ViewMode>('2D')
      onMounted(() => initMap())

      const initMap = () => {
        //定义地图中心点坐标
        let center = new TMap.LatLng(props?.options?.latitude || 24.621999, props?.options?.longitude || 118.038307)
        //定义map变量，调用 TMap.Map() 构造函数创建地图

        const map = new TMap.Map(mapEl.value!, {
          center: center, //设置地图中心点坐标
          zoom: 16, //设置地图缩放级别
          pitch: 0, //设置俯仰角
          rotation: 0, //设置地图旋转角度f
          mapStyleId: 'style1',
          showControl: false,
          // boundary: bounds,
          rotatable: false,
          offset: {
            x: 0,
            y:
              centerEl.value!.getBoundingClientRect().top -
              (mapEl.value!.offsetHeight / 2 + mapEl.value!.getBoundingClientRect().top)
          },
          viewMode: mapViewMode.value
        })

        mapRef.value = map
      }
      return () => {
        return (
          <div class="use-choose-address">
            <div class="use-choose-address__map-view">
              <div id={mapId} ref={mapEl} class="use-choose-address__map"></div>
              <div ref={centerEl} class="use-choose-address__center">
                {/* 中心点，需要和 <PinView /> 吸取点位 保持对应 */}
              </div>
              <div class="use-choose-address__gui">
                <div
                  /** 这一个节点是用来观测地图中心的 */
                  class="use-choose-address__view-port"
                >
                  {isPinEnable.value && <PinView ref={pinViewRef} map={mapRef.value} onChange={onPinChange} />}
                </div>
              </div>
              {/* @ts-ignore */}
              <Tools />
            </div>
            <Actions />
          </div>
        )
      }
    } else {
      /* ----------------------------------- 小程序 ---------------------------------- */
      /* ----------------------------------- 小程序 ---------------------------------- */
      /* ----------------------------------- 小程序 ---------------------------------- */
      /* ----------------------------------- 小程序 ---------------------------------- */

      const mapState = reactive({
        longitude: props?.options?.longitude || 118.038307,
        latitude: props?.options?.latitude || 24.621999,
        scale: props.options?.scale || 9
      })

      const mapSettings = ref({
        skew: 0,
        rotate: 0,
        showLocation: false,
        showScale: false,
        subKey: '',
        layerStyle: 1,
        enableZoom: true,
        enableScroll: true,
        enableRotate: false,
        showCompass: false,
        enable3D: false,
        enableOverlooking: false,
        enableSatellite: false,
        enableTraffic: false,
        ...mapState
      })

      const mapContext = ref<Taro.MapContext>()
      const mapSelector = Taro.createSelectorQuery()
        .in(Taro.getCurrentInstance().page!)
        .select(`#${mapId}`)
        .boundingClientRect()
        .select('.use-choose-address__center')
        .boundingClientRect()

      onMounted(() => initMap())

      const initMap = () => {
        mapContext.value = Taro.createMapContext(mapId, Taro.getCurrentInstance().page!)
        mapContext.value.setCenterOffset({
          offset: [0.5, 0]
        })
        mapContext.value.setLocMarkerIcon({
          iconPath: 'https://dev-cdn.null.cn/upload/523e3747829405b4743bed9985f5ba6b.png'
        })
        mapSelector.exec(res => {
          const y = (res[1].top - res[0].top) / res[0].height
          if (y > 0 && y < 1) {
            mapContext.value!.setCenterOffset({
              offset: [0.5, y]
            })
          }
        })
      }

      const events = {
        center_changed: () => {}
      }

      const mapRef = {
        on: (eventName: string, handler: () => void) => {
          events[eventName] = handler
        },
        off: (eventName: string) => {
          events[eventName] = () => {}
        },
        getCenter: () => {
          return {
            lng: mapState.longitude,
            lat: mapState.latitude
          }
        },
        getZoom: () => {
          return mapState.scale
        },
        easeTo: (options: { center: { lng: number; lat: number }; zoom: number }) => {
          mapState.latitude = options.center.lat
          mapState.longitude = options.center.lng
          mapState.scale = options.zoom
          Object.assign(mapSettings.value, mapState)
        }
      }

      const onRegionchange = e => {
        if (e.detail.centerLocation) {
          mapState.latitude = e.detail.centerLocation.latitude
          mapState.longitude = e.detail.centerLocation.longitude
          mapState.scale = e.detail.scale
          if (e.causedBy === 'drag' || e.detail.causedBy === 'drag') {
            events.center_changed?.()
          }
        }
      }

      emitter.on(mapId, (res: any) => {
        mapRef.easeTo({
          center: {
            lat: res.latitude + (Math.random() * 10) / 10000000,
            lng: res.longitude + (Math.random() * 10) / 10000000
          },
          zoom: mapState.scale
        })
        events.center_changed?.()
      })

      onUnmounted(() => {
        emitter.off(mapId)
      })

      return () => {
        return (
          <div class="use-choose-address">
            <div class="use-choose-address__map-view">
              <div class="use-choose-address__map">
                <Map
                  class="use-choose-address__weapp-map"
                  id={mapId}
                  setting={mapSettings.value}
                  latitude={mapSettings.value.latitude}
                  longitude={mapSettings.value.longitude}
                  scale={mapSettings.value.scale}
                  onRegionchange={onRegionchange}
                  showLocation
                ></Map>
              </div>
              <div class="use-choose-address__center">{/* 中心点，需要和 <PinView /> 吸取点位 保持对应 */}</div>
              <div class="use-choose-address__gui">
                <div
                  /** 这一个节点是用来观测地图中心的 */
                  class="use-choose-address__view-port"
                >
                  {isPinEnable.value && <PinView ref={pinViewRef} map={mapRef as any} onChange={onPinChange} />}
                </div>
              </div>
              {/* @ts-ignore */}
              <Tools />
            </div>
            <Actions />
          </div>
        )
      }
    }
  }
})

export const useChooseAddress = (options?: IUseChooseAddressOptions) => {
  const modal = useModal({
    height: 'auto',
    scrollViewDisabled: true,
    className: 'use-choose-address-modal',
    catchMove: false,
    content: () => {
      return (
        <MapViewLoader
          options={options}
          onConfirm={v => {
            modal.close()
            options?.onSuccess?.(v)
          }}
          onCancel={() => {
            modal.close()
            options?.onCancel?.()
          }}
        />
      )
    }
  })
}
