import { loadTMap } from '@anteng/utils'
import useModal from '../useModal'
import './style.scss'
import { Button, message } from '@anteng/ui'
import useRequestErrorMessage from '../useRequestErrorMessage'
import { computed, ref, shallowRef, watch, type Ref } from 'vue'
import { anchorType, Marker, Scene } from '@antv/l7'
import { DrawEvent, DrawPoint, type IPointFeature } from '@antv/l7-draw'
import { TencentMap } from '@antv/l7-maps'
import uuid from '../../utils/uuid'

type MapCenterLocation = {
  lng: number
  lat: number
}

type UseCustomMarkersOptions = {
  location?: MapCenterLocation
  onSuccess?: (location: MapCenterLocation) => void
  getLocation?: (callback: (obj: { lat: number; lng: number }) => void) => void
}

export const useMapCenter = (options: UseCustomMarkersOptions) => {
  const endLoading = message.loading('地图加载中...')
  loadTMap()
    .then((res) => {
      fn(options, options.onSuccess)
    })
    .catch(useRequestErrorMessage)
    .finally(() => {
      endLoading()
    })
}

const fn = (options: UseCustomMarkersOptions, callback?: (location: MapCenterLocation) => void) => {
  const list = options.location?.lat && options.location?.lng ? [options.location] : []

  const mapEl = ref<HTMLElement>()
  const mapRef = shallowRef() as Ref<TMap.Map>
  const sceneRef = shallowRef<Scene>()
  const scaleRef = ref<number>()
  const mapViewMode = ref<TMap.ViewMode>('3D')
  //定义地图中心点坐标
  const center = new TMap.LatLng(24.621999, 118.038307)
  //定义map变量，调用 TMap.Map() 构造函数创建地图

  const mapId = `map-${uuid()}`

  const drawRectRef = shallowRef<DrawPoint>()
  const layers = ref(
    list.map((item, index) => {
      return {
        ...item,
        $id: uuid()
      }
    })
  )

  const centerPoint = computed(() => {
    if (!layers.value[0]?.lat || !layers.value[0]?.lng) return null
    return {
      lat: layers.value[0].lat,
      lng: layers.value[0].lng
    }
  })

  let markers: Record<string, Marker> = {}
  const renderMarkers = () => {
    const newMarkers: Record<string, Marker> = {}
    layers.value.forEach((item) => {
      const marker =
        markers[item.$id!] ||
        new Marker({
          element: document.getElementById('marker-' + item.$id)!,
          anchor: anchorType['TOP-LEFT']
        })

      marker.setLnglat({ lat: item.lat, lng: item.lng })
      newMarkers[item.$id!] = marker
      if (!markers[item.$id!]) {
        sceneRef.value?.addMarker(marker)
      }
    })
    markers = newMarkers
  }

  watch(
    () => layers.value,
    () => {
      renderMarkers()
    }
  )

  const formatData = () => {
    return layers.value.map((item) => {
      return {
        type: 'Feature',
        properties: {
          id: item.$id,
          name: item.$id
        },
        geometry: {
          type: 'Point',
          coordinates: [item.lng, item.lat]
        }
      }
    })
  }

  const initialData = formatData()

  const onConfirm = () => {
    callback?.(centerPoint.value as any)
    modal.destroy()
  }

  const modal = useModal({
    title: (
      <div class="use-map-center__header">
        选择地图中心点
        <div class="confirm">
          <Button
            onClick={() => {
              modal.destroy()
            }}
          >
            取消
          </Button>
          <Button type="primary" onClick={onConfirm}>
            完成
          </Button>
        </div>
      </div>
    ),
    centered: true,
    closable: false,
    content: () => {
      return (
        <div class="use-map-center">
          {centerPoint.value ? (
            <div class="map-scale">
              当前选择中心点：{centerPoint.value.lat.toFixed(4)}, {centerPoint.value.lng.toFixed(4)}
            </div>
          ) : (
            <div class="map-scale color-disabled">请选择中心点</div>
          )}
          <div class="map-view" id={mapId} ref={mapEl}>
            <div class="marker-view">
              {layers.value.map((item) => {
                return (
                  <div class="marker-item" id={'marker-' + item.$id}>
                    <div class="marker-image"></div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )
    }
  })

  watch(
    () => mapEl.value,
    () => {
      if (!mapEl.value) return void 0
      const map = new TMap.Map(mapEl.value!, {
        center: center, //设置地图中心点坐标
        zoom: 4, //设置地图缩放级别
        pitch: 0, //设置俯仰角
        rotation: 0, //设置地图旋转角度f
        // mapStyleId: 'style1',
        showControl: false,
        // boundary: bounds,
        rotatable: false,
        viewMode: mapViewMode.value
      })

      mapRef.value = map

      const scene = new Scene({
        id: mapEl.value as HTMLDivElement,
        map: new TencentMap({
          mapInstance: map
        }),
        logoVisible: false
      })

      sceneRef.value = scene

      scaleRef.value = scene.getZoom()
      scene.on('zoomchange', (e) => {
        scaleRef.value = scene.getZoom()
      })

      scene.on('loaded', () => {
        renderMarkers()
        const drawPoint = new DrawPoint(scene, {
          initialData: initialData,
          autoActive: true,
          editable: true,
          multiple: false,
          style: {
            point: {
              normal: {
                color: '#00ba77'
              }
            }
          }
        })

        drawRectRef.value = drawPoint

        drawPoint.enable()

        drawPoint.on(DrawEvent.Change, (allFeatures) => {
          const list = allFeatures.map((item: IPointFeature) => {
            const location = item.geometry.coordinates
            const id = item.properties.id
            const data = layers.value.find((item) => item.$id === id) || {
              $id: id,
              lat: location[1],
              lng: location[0]
            }
            data.lat = location[1]
            data.lng = location[0]
            return data
          })
          layers.value = list
        })
      })
    },
    {
      immediate: true
    }
  )
}
