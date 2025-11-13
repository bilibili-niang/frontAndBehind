import { loadTMap } from '@anteng/utils'
import useModal from '../useModal'
import './style.scss'
import { Button, Empty, Icon, Input, InputNumber, message, Slider, Switch } from '@anteng/ui'
import useRequestErrorMessage from '../useRequestErrorMessage'
import { computed, ref, shallowRef, toRaw, watch, type Ref } from 'vue'
import { ImageLayer, Scene } from '@antv/l7'
import { DrawEvent, DrawRect, type IPolygonFeature } from '@antv/l7-draw'
import { TencentMap } from '@antv/l7-maps'
import uuid from '../../utils/uuid'
import useImageSelector from '../useImageSelector'
import { cloneDeep, defaults, isEqual } from 'lodash'
import { VueDraggable } from 'vue-draggable-plus'
import { useImageSlice } from './slice'
import { requestUploadFile } from '../../api/uploadImage'
import { withModifiers } from 'vue'
import { SchemaForm } from '@anteng/jsf'
import { data } from '../../../../../apps/cs/tongbao/src/api/receiver/data'
import CommonSelector from '../../components/common-selector'
import { ImageWidget } from '@anteng/jsf/src/theme/default/widgets/image'

type TMapBoundary = { ne: { lat?: number; lng?: number }; sw: { lat?: number; lng?: number } }

type SliceItem = { url?: string; isBlank?: boolean; file?: File; tempPath?: string } & TMapBoundary

type ILayer = {
  $id?: string
  image: string
  slices?: SliceItem[][]
} & TMapBoundary

export const useMapImageLayers = (options: { layers?: ILayer[]; onSuccess?: (layers: ILayer[]) => void }) => {
  const endLoading = message.loading('地图加载中...')
  loadTMap()
    .then((res) => {
      fn(cloneDeep(options.layers || []), options.onSuccess)
    })
    .catch(useRequestErrorMessage)
    .finally(() => {
      endLoading()
    })
}

const defaultLayerValue = () => ({ scales: [3, 20], z: 0 })

const fn = (list: ILayer[], callback?: (layers: ILayer[]) => void) => {
  const mapEl = ref<HTMLElement>()
  const centerEl = ref<HTMLElement>()
  const mapRef = shallowRef() as Ref<TMap.Map>
  const sceneRef = shallowRef<Scene>()
  const scaleRef = ref<number>()
  const mapViewMode = ref<TMap.ViewMode>('3D')
  //定义地图中心点坐标
  const center = new TMap.LatLng(24.621999, 118.038307)
  //定义map变量，调用 TMap.Map() 构造函数创建地图

  const mapId = `map-${uuid()}`

  const drawRectRef = shallowRef<DrawRect>()
  const layers = ref<ILayer[]>([])
  const imageLayers = ref<any[]>([])

  layers.value = cloneDeep(list).map((item) => {
    return defaults(item, defaultLayerValue())
  })

  const initialData = list.map((item) => {
    return {
      type: 'Feature',
      properties: {
        id: item.$id,
        name: item.$id
      },
      geometry: {
        type: 'Polygon',
        coordinates: [getPoints([item.sw.lng!, item.sw.lat!], [item.ne.lng!, item.ne.lat!])]
      }
    }
  })

  /** 上传切片 */
  const uploadSplices = () => {
    const list = [] as SliceItem[]
    layers.value.forEach((layer) => {
      layer.slices?.forEach((row) => {
        row.forEach((item) => {
          if (!item.isBlank && item.file) {
            list.push(item)
          }
        })
      })
    })
    return new Promise((resolve, reject) => {
      if (list.length === 0) return resolve(undefined)
      return Promise.allSettled(
        list.map((item) => {
          return requestUploadFile(item.file)
            .then((res) => {
              item.url = res.data.url
            })
            .finally(() => {
              delete item.file
              delete item.tempPath
            })
        })
      ).then((res) => {
        resolve(undefined)
      })
    })
  }

  const confirmLoading = ref(false)
  const onConfirm = () => {
    if (confirmLoading.value) return void 0
    confirmLoading.value = true
    const closeLoading = message.loading('图层上传中，请稍后...')
    uploadSplices()
      .then(() => {
        const data = toRaw(layers.value).filter((item) => item.image)
        console.log(data)
        modal.destroy()
        callback?.(data)
      })
      .then(() => {
        confirmLoading.value = false
        closeLoading()
      })
  }

  const onfocus = (index: number) => {
    const target = layers.value[index]
    if (!target) return void 0
    mapRef.value.fitBounds(
      new TMap.LatLngBounds(
        new TMap.LatLng(target.sw.lat!, target.sw.lng!),
        new TMap.LatLng(target.ne.lat!, target.ne.lng!)
      ),
      { padding: 48 }
    )
  }

  const renderImages = () => {
    const list: any[] = []
    layers.value.forEach((item) => {
      const _layer = imageLayers.value.find((l) => l.name === `image-${item.$id}`)

      // 没有图片，删除图层
      if (!item.image) {
        _layer && sceneRef.value?.removeLayer(_layer)
        return void 0
      }

      const points = (_layer as any)?.encodedData?.[0].coordinates
      if (points) {
        const { sw, ne } = getSwNe(points)

        // 图片未变更、位置未变化，不处理
        if (
          _layer!.sourceOption.data === item.image &&
          isEqual(sw, [item.sw.lng, item.sw.lat]) &&
          isEqual(ne, [item.ne.lng, item.ne.lat])
        ) {
          list.push(_layer)
          return void 0
        }
      }

      _layer && sceneRef.value?.removeLayer(_layer)

      const layer = new ImageLayer({
        name: `image-${item.$id}`,
        zIndex: -1000
      })

      let _image = item.image
      if (import.meta.env.DEV) {
        _image = _image.replace('https://dev-cdn.null.cn', '')
      }

      layer.source(_image, {
        parser: {
          type: 'image',
          extent: [item.sw.lng, item.sw.lat, item.ne.lng, item.ne.lat]
        }
      })

      sceneRef.value?.addLayer(layer)

      list.push(layer)
    })

    // console.log(list)

    // 删除掉已删除的图层
    const imageLayersNames = list.map((item) => item.name)
    imageLayers.value.forEach((item) => {
      if (!imageLayersNames.includes(item.name)) {
        sceneRef.value?.removeLayer(item)
      }
    })

    imageLayers.value = list
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

  watch(
    () => activeId.value,
    () => {
      setTimeout(() => {
        document.getElementById(activeId.value)?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start'
        })
      }, 1000)
    }
  )

  const onSelect = (id: string) => {
    drawRectRef.value?.setActiveFeature(id)
    onfocus(layers.value.findIndex((item) => item.$id === id))
  }

  const onSlice = (item: ILayer) => {
    // if (!item.slices || item.slices.length === 0) {

    // }
    useImageSlice({
      url: item.image,
      slices: item.slices,
      onSuccess: (slices) => {
        item.slices = slices
      }
    })
  }

  const modal = useModal({
    title: '绘制自定义图层',
    centered: true,
    closable: false,
    content: () => {
      return (
        <div class="use-map-image-layers">
          <div class="map-scale">当前地图缩放级别：{scaleRef.value?.toFixed(2)}</div>
          <div class="map-view" id={mapId} ref={mapEl}></div>
          <div class="use-map-image-layers__content">
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
                const isActive = item.$id === activeId.value
                return (
                  <div
                    class={['item', isActive && 'active']}
                    key={item.$id}
                    id={item.$id}
                    onClick={() => {
                      onSelect(item.$id!)
                    }}
                  >
                    <SchemaForm
                      class="use-map-image-layers__jsf"
                      theme="compact"
                      value={item}
                      onChange={() => {}}
                      schema={{
                        type: 'object',
                        properties: {
                          sw: {
                            title: '西南角',
                            type: 'object',
                            widget: 'suite',
                            hidden: true,
                            properties: {
                              lat: {
                                title: '纬度',
                                type: 'number',
                                config: {
                                  min: -90,
                                  max: 90,
                                  suffix: '°',
                                  flex: 12
                                }
                              },
                              lng: {
                                title: '经度',
                                type: 'number',
                                config: {
                                  min: -180,
                                  max: 180,
                                  suffix: '°',
                                  flex: 12
                                }
                              }
                            }
                          },
                          ne: {
                            title: '东北角',
                            type: 'object',
                            widget: 'suite',
                            hidden: true,
                            properties: {
                              lat: {
                                title: '纬度',
                                type: 'number',
                                config: {
                                  min: -90,
                                  max: 90,
                                  suffix: '°',
                                  flex: 12
                                }
                              },
                              lng: {
                                title: '经度',
                                type: 'number',
                                config: {
                                  min: -180,
                                  max: 180,
                                  suffix: '°',
                                  flex: 12
                                }
                              }
                            }
                          },
                          image: {
                            title: '图片',
                            type: 'string',
                            widget: (props) => {
                              return (
                                <ImageWidget
                                  style={{
                                    pointerEvents: isActive ? undefined : 'none'
                                  }}
                                  image={{ url: props.value, height: 0, width: 0 }}
                                  onChange={(v) => {
                                    props.onChange(v.url)
                                    // 图片变化之后删除切片
                                    delete item.slices
                                  }}
                                />
                              )
                            }
                          },
                          slices: {
                            title: '图层切片',
                            type: 'array',
                            widget: (props) => {
                              return (
                                <CommonSelector
                                  icon="add-picture"
                                  placeholder="图层未切片"
                                  onClick={() => onSlice(item)}
                                  onClean={() => delete item.slices}
                                  text={
                                    item.slices?.length! > 0 ? (
                                      <div class="w_common-selector__title">
                                        已生成{' '}
                                        <span class="color-primary">
                                          {item.slices?.[0]?.length}&times;{item.slices?.length}
                                        </span>{' '}
                                        个切片
                                      </div>
                                    ) : undefined
                                  }
                                />
                              )
                            }
                          },
                          scales: {
                            title: '显示级别',
                            type: 'array',
                            widget: 'slider',
                            config: {
                              min: 3,
                              max: 20,
                              step: 0.2,
                              range: 'true'
                            }
                          },
                          z: {
                            title: '显示层级',
                            type: 'number',
                            config: {
                              min: 0,
                              max: 999,
                              placeholder: 0
                            }
                          }
                        }
                      }}
                    />
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
        const drawRect = new DrawRect(scene, {
          initialData: initialData,
          autoActive: true,
          trigger: 'click',
          bbox: true,
          multiple: true,
          style: {
            line: {
              normal: {
                color: 'transparent'
              },
              hover: {
                color: 'transparent'
              }
            },
            polygon: {
              normal: {
                color: 'red'
              }
            }
          }
        })

        renderImages()

        drawRectRef.value = drawRect

        drawRect.enable()

        drawRect.on(DrawEvent.Select, (e) => {
          activeId.value = e?.properties?.id
        })
        drawRect.on(DrawEvent.Change, (allFeatures) => {
          // if (allFeatures.length > 1) {
          //   // 只保留最新的一个矩形
          //   allFeatures.slice(0, -1).forEach((item) => {
          //     drawRect.removeFeature(item)
          //   })
          // } else {
          //   console.log(allFeatures)
          // }

          const list = allFeatures.map((item: IPolygonFeature) => {
            const points = item.geometry.coordinates[0]
            const { sw, ne } = getSwNe(points)
            const id = item.properties.id
            const _sw = { lat: sw[1], lng: sw[0] }
            const _ne = { lat: ne[1], lng: ne[0] }
            const data =
              layers.value.find((item) => item.$id === id) ||
              defaults(
                {
                  $id: id,
                  sw: _sw,
                  ne: _ne,
                  image: ''
                },
                defaultLayerValue()
              )

            data.sw = _sw
            data.ne = _ne
            return data
          })
          layers.value = list
        })

        // drawRect.on(DrawEvent., () => {
        //   console.log('...')
        // })
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
