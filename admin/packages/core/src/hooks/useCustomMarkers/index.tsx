import { loadTMap } from '@anteng/utils'
import useModal from '../useModal'
import './style.scss'
import { Button, Empty, Icon, InputNumber, message, Slider, Tooltip } from '@anteng/ui'
import useRequestErrorMessage from '../useRequestErrorMessage'
import { computed, ref, type Ref, shallowRef, toRaw, watch } from 'vue'
import { anchorType, Marker, Scene } from '@antv/l7'
import { DrawEvent, DrawPoint, type IPointFeature } from '@antv/l7-draw'
import { TencentMap } from '@antv/l7-maps'
import uuid from '../../utils/uuid'
import useImageSelector from '../useImageSelector'
import { clamp } from 'lodash'
import type { ActionDefine } from '../useAction/utils'
import { Action } from '../../../lib'

// 图片， 宽度， 高度，经纬度， 锚点坐标 [[0, 1], [0, 1]] ， 点击动作
type ICustomMarker = {
  $id?: string
  image: string
  lat: number
  lng: number
  x: number
  y: number
  w: number
  h: number
  action?: ActionDefine
  scales?: [number, number]
  z?: number
}

/** 默认锚点 */
const defaultAnchor = {
  x: 0.5,
  y: 1
}

const defaultScales = [3, 20] as [number, number]

type UseCustomMarkersOptions = {
  markers?: ICustomMarker[]
  onSuccess?: (layers: ICustomMarker[]) => void
  getLocation?: (callback: (obj: { lat: number; lng: number }) => void) => void
}

export const useCustomMarkers = (options: UseCustomMarkersOptions) => {
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

const fn = (options: UseCustomMarkersOptions, callback?: (layers: ICustomMarker[]) => void) => {
  const list = options.markers || []

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
  const layers = ref<ICustomMarker[]>([])
  const imageLayers = ref<any[]>([])

  layers.value = list.map((item, index) => {
    if (!item.scales) {
      item.scales = [...defaultScales]
    }
    return {
      ...item,
      $id: item.$id || uuid()
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
    const data = toRaw(layers.value)
      .filter((item) => item.image)
      .map((item) => {
        return {
          ...item,
          $id: uuid()
        }
      })
    callback?.(data)
    modal.destroy()
  }

  const transformSize = (width: number, height: number) => {
    if (!width || !height) {
      return { w: 60, h: 60 }
    }
    const w = 60
    const h = clamp((height / width) * w, 1, 200)
    return {
      w,
      h
    }
  }

  const onAddImage = (index: number) => {
    useImageSelector({
      type: 'image',
      onSuccess: (res) => {
        if (import.meta.env.DEV) {
          layers.value[index].image = res.url.replace('https://dev-cdn.null.cn', '')
        } else {
          layers.value[index].image = res.url
        }
        const { w, h } = transformSize(res.width, res.height)
        layers.value[index].w = w
        layers.value[index].h = h
      }
    })
  }

  const onfocus = (index: number) => {
    const target = layers.value[index]
    if (!target) return void 0
    setTimeout(() => {
      document.querySelector(`#item-${target.$id}`)?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      })
      mapRef.value.setCenter(new TMap.LatLng(target.lat!, target.lng!))
      mapRef.value.setZoom(14)
    })
  }

  const renderImages = () => {
  }

  watch(
    () => layers.value,
    () => {
      renderImages()
    },
    { deep: true, immediate: true }
  )

  const activeId = ref('')
  const activeIndex = computed(() => {
    return layers.value.findIndex((item) => item.$id === activeId.value)
  })
  const onSelect = (id: string) => {
    activeId.value = id
    drawRectRef.value?.setActiveFeature(id)
    onfocus(layers.value.findIndex((item) => item.$id === id))
  }

  const onSelectLocation = (item: ICustomMarker) => {
  }

  const updateData = () => {
    drawRectRef.value?.setData(formatData())
    layers.value = layers.value.slice(0)
  }

  const modal = useModal({
    title: '绘制自定义 POI',
    centered: true,
    closable: false,
    content: () => {
      return (
        <div class="use-map-custom-markers">
          <div class="map-scale">当前地图缩放级别：{scaleRef.value?.toFixed(2)}</div>
          <div class="map-view" id={mapId} ref={mapEl}>
            <div class="marker-view">
              {layers.value.map((item) => {
                return (
                  <div class="marker-item" id={'marker-' + item.$id} style={{ zIndex: item.z! + 5 }}>
                    <div
                      class="marker-image"
                      style={{
                        width: item.w + 'px',
                        height: item.h + 'px',
                        backgroundImage: `url(${item.image})`,
                        transform: `translate3d(-${item.x * 100}%, -${item.y * 100}%, 0)`,
                        opacity: scaleRef.value! < item.scales![0] || scaleRef.value! > item.scales![1] ? 0 : undefined
                      }}
                    ></div>
                  </div>
                )
              })}
            </div>
          </div>
          <div class="use-map-custom-markers__content">
            <div class="header">
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
            <div class="list ui-scrollbar">
              {layers.value.length === 0 && (
                <Empty
                  style="margin-top:124px;"
                  description={
                    <div style="opacity:0.4;">
                      <h3>无图层</h3>
                      <div>请在左侧地图中框选</div>
                    </div>
                  }
                />
              )}

              {layers.value.map((item, index) => {
                return (
                  <div
                    id={`item-${item.$id}`}
                    class={['item', item.$id === activeId.value && 'active']}
                    key={item.$id}
                    onClick={() => {
                      onSelect(item.$id!)
                    }}
                  >
                    <div class="main-content">
                      <div class="thumbnail clickable" onClick={() => onAddImage(index)}>
                        {item.image ? <img src={item.image}/> : <Icon name="image-add"/>}
                      </div>
                      <div class="info">
                        {/* <small>{item.$id} </small> */}
                        <div class="u_location-picker number-font">
                          坐标：{item.lat?.toFixed(4)},{item.lng?.toFixed(4)}
                          {options.getLocation && (
                            <Tooltip title="从数据源中获取坐标">
                              <Icon
                                class="button clickable"
                                name="location"
                                onClick={() => {
                                  options.getLocation?.((o) => {
                                    item.lat = o.lat
                                    item.lng = o.lng
                                    updateData()
                                    onSelect(item.$id!)
                                  })
                                }}
                              />
                            </Tooltip>
                          )}
                        </div>
                        <div class="u_anchor-picker number-font disabled">
                          尺寸：{item.image ? `${Math.round(item.w)} × ${Math.round(item.h)}` : '请先设置图片'}
                          <Tooltip title="编辑尺寸、锚点">
                            <div
                              class="button clickable"
                              onClick={() => {
                                onSetAnchor(item)
                              }}
                            >
                              <div
                                class="anchor"
                                style={{
                                  top: `${item.y * 100}%`,
                                  left: `${item.x * 100}%`
                                }}
                              ></div>
                            </div>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                    <div class="config">
                      <div class="config-item">
                        <div class="label">点击动作</div>
                        <div class="value">
                          {/* @ts-ignore */}
                          <Action
                            value={item.action}
                            onChange={(v) => {
                              item.action = v
                            }}
                          />
                        </div>
                      </div>
                      <div class="config-item">
                        <div class="label">显示级别</div>
                        <div class="value slider">
                          <Slider
                            style="width:100%"
                            range
                            step={0.2}
                            min={3}
                            max={20}
                            value={item.scales}
                            onChange={(v) => {
                              item.scales = v as [number, number]
                            }}
                          />
                        </div>
                      </div>
                      <div class="config-item">
                        <div class="label">层级</div>
                        <div class="value slider">
                          <InputNumber
                            style="width:100%"
                            min={0}
                            max={999}
                            value={item.z}
                            placeholder="0"
                            onChange={(v) => {
                              item.z = v as number
                            }}
                          />
                        </div>
                      </div>
                    </div>
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

      // try {
      //   map.fitBounds(
      //     new TMap.LatLngBounds(
      //       new TMap.LatLng(sw.value.lat, sw.value.lng),
      //       new TMap.LatLng(ne.value.lat, ne.value.lng)
      //     ),
      //     {
      //       padding: 48
      //     }
      //   )
      // } catch (err) {
      //   err
      // }

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
        const drawRect = new DrawPoint(scene, {
          initialData: initialData,
          autoActive: true,
          editable: true,
          multiple: true,
          style: {
            point: {
              normal: {
                color: '#00ba77'
              }
            }
          }
        })

        renderImages()

        drawRectRef.value = drawRect

        drawRect.enable()

        drawRect.on(DrawEvent.Select, (e) => {
          onSelect(e?.properties?.id)
        })
        drawRect.on(DrawEvent.Change, (allFeatures) => {
          const list = allFeatures.map((item: IPointFeature) => {
            const location = item.geometry.coordinates
            const id = item.properties.id
            const data = layers.value.find((item) => item.$id === id) || {
              $id: id,
              lat: location[1],
              lng: location[0],
              image: '',
              ...defaultAnchor,
              scales: [...defaultScales],
              action: null
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

const onSetAnchor = (item: ICustomMarker) => {
  if (!item.image) {
    message.info('请先设置图片！')
    return void 0
  }

  const w = ref(item.w)
  const h = ref(item.h)
  const x = ref(item.x)
  const y = ref(item.y)

  const setX = (v: number) => {
    x.value = clamp(+v.toFixed(4), 0, 1)
  }
  const setY = (v: number) => {
    y.value = clamp(+v.toFixed(4), 0, 1)
  }

  const onMousedown = (e: MouseEvent) => {
    // 防止拖动时选中文字
    e.preventDefault()
    const el = e.target as HTMLElement
    const width = el.offsetWidth
    const height = el.offsetHeight
    setX(e.offsetX / width)
    setY(e.offsetY / height)

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      setX((e.clientX - rect.x) / width)
      setY((e.clientY - rect.y) / height)
    }
    const onRelease = (e: MouseEvent) => {
      window.removeEventListener('mousemove', onMove, true)
      window.removeEventListener('mouseup', onRelease, true)
    }

    window.addEventListener('mousemove', onMove, true)
    window.addEventListener('mouseup', onRelease, true)
  }

  const anchorStyle = computed(() => {
    return {
      top: `${y.value * 100}%`,
      left: `${x.value * 100}%`
    }
  })

  const onAnchorCancel = () => {
    anchorModal.destroy()
  }
  const onAnchorConfirm = () => {
    item.w = w.value
    item.h = h.value
    item.x = x.value
    item.y = y.value
    anchorModal.destroy()
  }

  const anchorModal = useModal({
    title: 'POI 锚点',
    closable: false,
    centered: true,
    content: () => {
      return (
        <div class="use-map-custom-markers-anchor">
          <div class="thumbnail">
            <img
              style={{
                width: w.value + 'px',
                height: h.value + 'px'
              }}
              src={item.image}
            />
          </div>
          <div class="actions">
            尺寸：
            <InputNumber
              class="input"
              prefix="宽"
              min={30}
              max={200}
              value={Math.round(w.value)}
              onChange={(v) => {
                w.value = (v as any) || 1
                h.value = (item.h / item.w) * w.value
              }}
            />
            &nbsp; &times; &nbsp;
            <InputNumber
              class="input"
              prefix="高"
              min={30}
              max={200}
              value={Math.round(h.value)}
              onChange={(v) => {
                h.value = (v as any) || 1
                w.value = (item.w / item.h) * h.value
              }}
            />
            &emsp;锚点：
            {Math.round(x.value * 100)}%, {Math.round(y.value * 100)}%<i class="gap"></i>
            <Button onClick={onAnchorCancel}>取消</Button>
            <Button type="primary" onClick={onAnchorConfirm}>
              完成
            </Button>
          </div>
          <div class="content-view">
            <div class="image-wrap" onMousedown={onMousedown}>
              <img src={item.image}/>
              <div class="anchor" style={anchorStyle.value}></div>
            </div>
          </div>
        </div>
      )
    }
  })
}

export const useCustomMarkerAnchor = () => {
  const Anchor = (props: { item: any }) => {
    const item = props.item || {}
    return (
      <div class="u_anchor-picker widget number-font disabled">
        {item.image ? (
          `${Math.round(item.w)} × ${Math.round(item.h)}`
        ) : (
          <span class="color-disabled">请先设置图片</span>
        )}
        <Tooltip title="编辑尺寸、锚点">
          <div
            class="button clickable"
            onClick={() => {
              onSetAnchor(item)
            }}
          >
            <div
              class="anchor"
              style={{
                top: `${item.y * 100}%`,
                left: `${item.x * 100}%`
              }}
            ></div>
          </div>
        </Tooltip>
      </div>
    )
  }

  return {
    Anchor
  }
}
