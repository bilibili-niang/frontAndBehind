import { computed, defineComponent, onBeforeUnmount, type PropType, ref, watch } from 'vue'
import './style.scss'
import ActionImage from '../image'
import { DeckComponentConfig } from '../types'
import Taro from '@tarojs/taro'
import { Swiper, SwiperItem } from '@tarojs/components'
import { emitter } from '@pkg/core'

export interface ISwiperConfig {
  images: (any & {
    type: 'single' | 'hotspot'
    action: any
    spots: any[]
  })[]
  ratio: {
    width: number
    height: number
    objectFit: 'fill' | 'contain' | 'cover'
  }
  background: string
  borderRadius: [number, number, number, number]
  autoplay: boolean
  interval: number
  transition: number
  indicator: {
    enable: boolean
    size: {
      w: number
      h: number
    }
    activeSize: {
      w: number
      h: number
    }
    color: string
    activeColor: string
    placement: 'bottom' | 'top' | 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'
    offset: {
      x: number
      y: number
    }
  }
}

export default defineComponent({
  props: {
    config: {
      type: Object as PropType<DeckComponentConfig<ISwiperConfig>>,
      required: true
    }
  },
  setup(props) {
    // console.log(props)
    const imageList = computed(() => {
      const list = Array.isArray(props.config.images) ? props.config.images : []
      return list.map(item => {
        if (item.image) return item
        return {
          image: item
        }
      }) as typeof props.config.images
    })

    const current = ref(0)

    const swiperStyle = computed(() => {
      const { ratio = { width: 8, height: 5 } } = props.config
      const r = ratio.height / ratio.width || 5 / 8
      return {
        width: '100%',
        height: 0,
        paddingBottom: `calc(100% * ${r})`
      }
    })

    const swiperItemStyle = computed(() => {
      return {
        padding: 0
      }
    })

    const indocatorStyle = computed(() => {
      const { enable = true, placement = 'bottom', offset = { x: 0, y: 0 } } = props.config.indicator || {}
      if (!enable) {
        return undefined
      }
      const isTop = ['top', 'topLeft', 'topRight'].includes(placement)
      const isLeft = ['top', 'topLeft', 'bottom', 'bottomLeft'].includes(placement)
      const isCenter = ['top', 'bottom'].includes(placement)
      return {
        [isTop ? 'top' : 'bottom']: Taro.pxTransform(0),
        [isLeft ? 'left' : 'right']: isCenter ? '50%' : Taro.pxTransform(0),
        transform: `translate3d(calc(${Taro.pxTransform(offset.x)}${isCenter ? ' - 50%' : ''}), ${Taro.pxTransform(
          offset.y
        )}, 0)`
      }
    })
    const indicatorDotStyle = computed(() => {
      const { size, activeSize, color, activeColor } = props.config.indicator || {}
      return {
        style: {
          width: Taro.pxTransform(size.w),
          height: Taro.pxTransform(size.h),
          background: color
        },
        activeStyle: {
          width: Taro.pxTransform(activeSize.w),
          height: Taro.pxTransform(activeSize.h),
          background: activeColor
        }
      }
    })
    const imageStyle = computed(() => {
      return {
        width: '100%',
        height: '100%',
        borderRadius: props.config.borderRadius?.map(i => Taro.pxTransform(i)).join(' '),
        objectFit: props.config.ratio.objectFit,
        background: props.config.background
      }
    })

    /* -------------------------------- 导航栏动态样式联动 ------------------------------- */

    const isFirstSwiper = computed(() => {
      return true
    })

    const currentTheme = computed(() => {
      if (!isFirstSwiper.value) return null
      const { themeColorEnable = false, themeColor = '#ffffff' } = imageList.value[current.value]
      return themeColorEnable ? themeColor : null
    })

    // 事件通道：优先使用组件配置中的 channel/pageId/id
    const channel = computed(() => {
      const cfg: any = props.config || {}
      return cfg.dynamicColorChannel || cfg.pageId || cfg.id || ''
    })

    watch(
      () => currentTheme.value,
      () => {
        if (isFirstSwiper.value) {
          emitter.trigger(`nav-swiper-theme-color-${channel.value}`, currentTheme.value)
          // 兼容无通道的全局事件
          emitter.trigger(`nav-swiper-theme-color`, currentTheme.value)
        }
      },
      { immediate: true }
    )

    onBeforeUnmount(() => {
      emitter.trigger(`nav-swiper-theme-color-${channel.value}`, null)
      emitter.trigger(`nav-swiper-theme-color`, null)
    })

    /* -------------------------------- 导航栏动态样式联动 ------------------------------- */

    return () => {
      const { autoplay = true, interval = 3000, transition = 300 } = props.config ?? {}
      return (
        <div
          class="d_swiper"
          style={swiperStyle.value}
        >
          <div class="d_swiper-content">
            <Swiper
              circular={imageList.value?.length > 1}
              autoplay={autoplay && imageList.value?.length > 1}
              interval={interval}
              duration={transition}
              onChange={i => (current.value = i.detail.current)}
              lazy-render
              indicatorDots={false}
              style={'width:100%;height:100%' as any}
              stop-propagation
            >
              {imageList.value.map(item => {
                return (
                  <SwiperItem>
                    <div class="d_swiper__item" style={swiperItemStyle.value}>
                      <div class="d_swiper__item-content">
                        {item.image?.url ? (
                          // <img src={image.url} style={imageStyle.value} />
                          <ActionImage style={imageStyle.value} config={{ image: item.image }}/>
                        ) : (
                          <div class="d_swiper__item-placeholder" style={imageStyle.value}></div>
                        )}
                      </div>
                    </div>
                  </SwiperItem>
                )
              })}
            </Swiper>
            {imageList.value?.length > 1 && (
              <div class="d_swiper__indicator" style={indocatorStyle.value}>
                {imageList.value.map((image, index) => {
                  return (
                    <div
                      class="d_swiper__indicator-dot"
                      style={
                        index === current.value ? indicatorDotStyle.value.activeStyle : indicatorDotStyle.value.style
                      }
                    ></div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )
    }
  }
})
