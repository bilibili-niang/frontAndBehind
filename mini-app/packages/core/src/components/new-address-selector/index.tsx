import { defineComponent, onMounted, type PropType, ref, shallowRef, watch } from 'vue'
import './style.scss'
import { Button, Empty, Icon, Input, message, Textarea } from '@anteng/ui'
import { PREFIX_CLS } from '@anteng/config'
import { formatDistance, loadTMap } from '@anteng/utils'
import PinView, { type INearbyPoint } from './pin-view'
import { $searchNearbyPoints } from '../../api/tmap'
import uuid from '../../utils/uuid'

export type AddressData = {
  /** 地名 */
  name: string
  /** 地址 */
  address: string
  /** 地址 */
  city: string
  /** 经度 */
  longitude: number
  /** 维度 */
  latitude: number
}

export default defineComponent({
  name: 'AddressSelector',
  props: {
    latitude: {
      type: [String, Number]
    },
    longitude: {
      type: [String, Number]
    }
  },
  emits: ['success', 'close'],
  setup(props, { emit }) {
    const onConfirm = () => {
      if (!currentPoint.value) {
        message.info('请先在地图上选择点位')
        return void 0
      }
      emit('success', {
        name: currentPoint.value?.title,
        address: currentPoint.value?.address,
        longitude: currentPoint.value?.location.lng,
        latitude: currentPoint.value?.location.lat
      })
    }

    const mapLoading = ref(true)
    const mapError = ref(false)
    const mapEl = ref<HTMLElement>()
    const mapRef = shallowRef<TMap.Map>()
    const pinViewRef = ref()

    const load = () => {
      loadTMap()
        .then(() => {
          initMap()
        })
        .catch((err) => {
          mapError.value = true
        })
        .finally(() => {
          mapLoading.value = false
        })
    }

    onMounted(load)

    const initMap = () => {
      const center =
        props.latitude && props.latitude
          ? new TMap.LatLng(Number(props.latitude), Number(props.longitude))
          : new TMap.LatLng(24.865671, 118.607339)
      const map = new TMap.Map(mapEl.value!, {
        center: center, //设置地图中心点坐标
        zoom: 10, //设置地图缩放级别
        pitch: 0, //设置俯仰角
        rotation: 0, //设置地图旋转角度f
        // mapStyleId: 'style1',
        showControl: false,
        // boundary: bounds,
        rotatable: false,
        viewMode: '2D'
      })
      mapRef.value = map
    }

    const currentPoint = ref<INearbyPoint>()
    const mapCenterDetails = ref()
    const onPinViewChange = (data: { currentPoint: INearbyPoint; mapCenterDetails: any }) => {
      currentPoint.value = data.currentPoint
      mapCenterDetails.value = data.mapCenterDetails
    }

    return () => {
      const coord = props.latitude && props.longitude && `${props.latitude},${props.longitude}`
      return (
        <div class={`${PREFIX_CLS}-address-selector`}>
          {mapLoading.value && (
            <div class="map-loading">
              <div class="map-loading-icon"></div>
              地图加载中...
            </div>
          )}
          <div class={`${PREFIX_CLS}-address-selector__map`}>
            <div class="map-container" ref={mapEl}></div>
            {mapRef.value && (
              <PinView
                ref={pinViewRef}
                map={mapRef.value}
                currentPoint={currentPoint.value}
                onChange={onPinViewChange}
              />
            )}
          </div>
          <div class={`${PREFIX_CLS}-address-selector__view`}>
            {currentPoint.value && (
              <NearbyPoints
                lat={currentPoint.value!.location.lat}
                lng={currentPoint.value!.location.lng}
                currentPoint={currentPoint.value}
                points={mapCenterDetails.value.pois}
                onSelect={(d) => {
                  pinViewRef.value.pinToPoint(d)
                }}
              />
            )}
          </div>
          <div class={`${PREFIX_CLS}-address-selector__actions`}>
            <Button
              onClick={() => {
                emit('close')
              }}
            >
              取消
            </Button>
            <Button type="primary" onClick={onConfirm}>
              确定
            </Button>
          </div>
        </div>
      )
    }
  }
})

const NearbyPoints = defineComponent({
  props: {
    lng: {
      type: Number,
      required: true
    },
    lat: {
      type: Number,
      required: true
    },
    currentPoint: {
      type: Object as PropType<INearbyPoint>
    },
    points: {
      type: Array as PropType<INearbyPoint[]>
    }
  },
  emits: {
    select: (point: INearbyPoint) => true
  },
  setup(props, { emit }) {
    const list = ref<INearbyPoint[]>(props.points || [])
    const keywords = ref('')
    const listKey = ref(uuid())

    watch(
      () => props.points,
      () => {
        list.value = props.points || []
        listKey.value = uuid()
      }
    )

    const onSearch = (e: any) => {
      const k = e.target.value
      searchFocus.value = false
      keywords.value = k
      if (keywords.value) {
        $searchNearbyPoints({
          keywords: keywords.value,
          lng: props.currentPoint?.location.lng || props.lng,
          lat: props.currentPoint?.location.lat || props.lat
        })
          .then((res: any) => {
            list.value = res.data
            listKey.value = uuid()
          })
          .catch((err) => {
            message.error('搜索出错了')
            console.log(err)
          })
      }
    }

    const onSelect = (index: number) => {
      emit('select', list.value[index])
      // options.onSuccess?.(list.value[index])
    }

    const searchFocus = ref(false)

    return () => {
      return (
        <div class="use-poi-choose">
          {props.currentPoint && (
            <>
              <h3>当前选点</h3>
              <div class="use-poi-choose__current">
                <div class="item">
                  <div class="text">
                    地名<small>（可编辑）</small>
                  </div>
                  <Textarea
                    class="value"
                    autoSize
                    value={props.currentPoint.title}
                    onChange={(e: any) => {
                      const c = props.currentPoint!
                      c.title = e.target.value
                    }}
                  />
                </div>
                <div class="item">
                  <div class="text">
                    地址<small>（可编辑）</small>
                  </div>
                  <Textarea
                    class="value"
                    autoSize
                    value={props.currentPoint.address}
                    onChange={(e: any) => {
                      const c = props.currentPoint!
                      c.address = e.target.value
                    }}
                  />
                </div>
                <div class="item">
                  <div class="text">
                    坐标<small>（ 纬度, 经度 ）</small>
                  </div>
                  <Textarea
                    class="value"
                    value={`${props.currentPoint.location.lat} , ${props.currentPoint.location.lng}`}
                    autoSize
                    readonly
                  />
                </div>
              </div>
            </>
          )}
          <h3>周边地点</h3>
          <div class="use-poi-choose__list ui-scrollbar" key={listKey.value}>
            <div class="use-poi-choose__search-wrap">
              <Input
                class="use-poi-choose__search"
                type="search"
                prefix={<Icon name="search"/>}
                placeholder=" 搜索周边地点试试?"
                allowClear
                onPressEnter={onSearch}
              />
            </div>
            {list.value.map((item, index) => {
              return (
                <div
                  class="use-poi-choose__item clickable"
                  onClick={() => {
                    onSelect(index)
                  }}
                >
                  <div class="icon">
                    <Icon name="location"/>
                  </div>
                  <div class="content">
                    <div class="name">{item.title}</div>
                    <div class="address">
                      <div class="text">{item.address}</div>
                      {item._distance > 2 ? (
                        <div class="distance">{formatDistance(item._distance)}</div>
                      ) : (
                        <div class="distance">≤ 2m</div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {list.value.length === 0 && (
              <Empty
                style="margin-top:32px;"
                description={
                  <>
                    <div>未查询到相关地点</div>
                    <div>换个关键词试试？</div>
                  </>
                }
              />
            )}
          </div>
        </div>
      )
    }
  }
})
