/* eslint-disabled */
// @ts-nocheck

import { loadTMap } from '@anteng/utils'
import useModal from '../useModal'
import './style.scss'
import { Button, Input, message } from '@anteng/ui'
import useRequestErrorMessage from '../useRequestErrorMessage'
import { nextTick, ref, shallowRef, toRaw, watch, type Ref } from 'vue'
import { Scene } from '@antv/l7'
import { DrawEvent, DrawRect } from '@antv/l7-draw'
import { TencentMap } from '@antv/l7-maps'
import uuid from '../../utils/uuid'

type TMapBoundary = { nw: { lat?: number; lng?: number }; se: { lat?: number; lng?: number } }

export const useMpaBoundary = (options: { boundary?: TMapBoundary; onSuccess: (boundary: TMapBoundary) => void }) => {
  const endLoading = message.loading('地图加载中...')
  loadTMap()
    .then((res) => {
      fn(options.boundary, (value) => {
        options?.onSuccess(value)
      })
    })
    .catch(useRequestErrorMessage)
    .finally(() => {
      endLoading()
    })
}

const fn = (boundary, callback) => {
  const mapEl = ref<HTMLElement>()
  const centerEl = ref<HTMLElement>()
  const mapRef = shallowRef() as Ref<TMap.Map>
  const mapViewMode = ref<TMap.ViewMode>('3D')
  //定义地图中心点坐标
  const center = new TMap.LatLng(24.621999, 118.038307)
  //定义map变量，调用 TMap.Map() 构造函数创建地图

  const mapId = `map-${uuid()}`

  const sw = ref({ lat: boundary?.sw?.lat, lng: boundary?.sw?.lng })
  const ne = ref({ lat: boundary?.ne?.lat, lng: boundary?.ne?.lng })

  const initialData = sw.value.lat
    ? [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [getPoints([sw.value.lng, sw.value.lat], [ne.value.lng, ne.value.lat])]
          }
        }
      ]
    : []

  const onConfirm = () => {
    if (!sw.value.lat || !sw.value.lng || !ne.value.lat || !ne.value.lng) {
      message.info('请在地图上框选范围')
      return void 0
    }
    modal.destroy()

    callback({
      sw: toRaw(sw.value),
      ne: toRaw(ne.value)
    })
  }

  const modal = useModal({
    title: '框选地图范围',
    centered: true,
    closable: false,
    content: () => {
      return (
        <div class="use-map-boundary">
          <div class="map-view" id={mapId} ref={mapEl}></div>
          <div class="use-map-boundary__content">
            {/* <Input value={`${sw.value.lat},${sw.value.lng}`}></Input>
            <Input value={`${ne.value.lat},${ne.value.lng}`}></Input> */}
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

      try {
        map.fitBounds(
          new TMap.LatLngBounds(
            new TMap.LatLng(sw.value.lat, sw.value.lng),
            new TMap.LatLng(ne.value.lat, ne.value.lng)
          ),
          {
            padding: 48
          }
        )
      } catch (err) {
        err
      }

      mapRef.value = map

      const scene = new Scene({
        id: mapEl.value,
        map: new TencentMap({
          mapInstance: map
        }),
        logoVisible: false
      })

      scene.on('loaded', () => {
        const drawRect = new DrawRect(scene, {
          initialData
        })
        drawRect.enable()

        drawRect.on(DrawEvent.Change, (allFeatures) => {
          if (allFeatures.length > 1) {
            // 只保留最新的一个矩形
            allFeatures.slice(0, -1).forEach((item) => {
              drawRect.removeFeature(item)
            })
          } else {
            console.log(allFeatures)
          }
          const points = allFeatures.slice(-1)[0].geometry.coordinates[0]
          const { sw: _sw, ne: _ne } = getSwNe(points)
          sw.value.lat = _sw[1]
          sw.value.lng = _sw[0]
          ne.value.lat = _ne[1]
          ne.value.lng = _ne[0]
        })
      })
    },
    {
      immediate: true
    }
  )
}

type Point = [number, number]
type Points = Point[]
type Corner = { sw: Point; ne: Point }

// 根据 points 获取 sw、ne
function getSwNe(points: Points): Corner {
  let minX = Number.MAX_VALUE,
    maxX = Number.MIN_VALUE
  let minY = Number.MAX_VALUE,
    maxY = Number.MIN_VALUE

  points.forEach((point) => {
    const [x, y] = point
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  })

  const sw: Point = [minX, minY]
  const ne: Point = [maxX, maxY]

  return { sw, ne }
}

// 根据 sw、ne 计算出 points，顺序为 [sw, nw, ne, se, sw]
function getPoints(sw: Point, ne: Point): Points {
  const [minX, minY] = sw
  const [maxX, maxY] = ne

  const nw: Point = [minX, maxY]
  const nePoint: Point = [maxX, maxY]
  const se: Point = [maxX, minY]
  const swPoint: Point = [minX, minY]

  return [
    swPoint, // SW
    nw, // NW
    nePoint, // NE
    se, // SE
    swPoint // back to SW to close the rectangle
  ]
}
