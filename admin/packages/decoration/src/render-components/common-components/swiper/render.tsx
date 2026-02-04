import { computed, defineComponent, onBeforeUnmount, onMounted, type PropType, ref, watch } from 'vue'
import './style.scss'
import type { DeckComponent } from '../../../stores/canvas'
import useCanvasStore from '../../../stores/canvas'
import { withUnit } from '../../../canvas-components/utils'
import { Swipe, SwipeItem } from 'vant'
import 'vant/es/swipe/index.css'
import { Empty, Icon } from '@pkg/ui'
import { ActionImageDefine } from '../../../widgets/action-image'
import { ActionImage } from '../image/render'
import { emitter, uuid } from '@pkg/core'
import { firstSwiper } from './manifest'

export { default as manifest } from './manifest'

export interface ISwiperConfig {
  images: { image: ActionImageDefine; themeColor: string; themeColorEnable: boolean }[]
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
    comp: {
      type: Object as PropType<DeckComponent<ISwiperConfig>>,
      required: true
    },
    isActive: Boolean
  },
  setup(props) {
    // console.log(props.comp)
    const imageList = computed(() => {
      const list = Array.isArray(props.comp.config.images) ? props.comp.config.images : []
      return list.map((item) => {
        if (item.image) return item
        return {
          image: item
        }
      }) as typeof props.comp.config.images
    })

    const current = ref(0)
    const swipeRef = ref()
    const toPreviousOne = () => {
      // current.value = (current.value - 1 + imageList.value.length) % imageList.value.length
      swipeRef.value.prev()
    }
    const toNextOne = () => {
      // current.value = (current.value + 1) % imageList.value.length
      swipeRef.value.next()
    }

    const swiperStyle = computed(() => {
      const padding = props.comp.attrs?.padding ?? [0, 0, 0, 0]
      const ratio = props.comp.config?.ratio ?? { width: 8, height: 5 }
      const [top, right, bottom, left] = padding
      const r = ratio.height / ratio.width || 5 / 8
      return {
        width: '100%',
        height: 0,
        paddingBottom: `calc((100% - ${withUnit(left + right)}) * ${r} + ${withUnit(top + bottom)})`
      }
    })
    const swiperItemStyle = computed(() => {
      const padding = props.comp.attrs?.padding ?? [0, 0, 0, 0]
      return {
        padding: padding.map((i) => withUnit(i)).join(' ')
      }
    })

    const indocatorStyle = computed(() => {
      const {
        enable = true,
        placement = 'bottom',
        offset = { x: 0, y: 0 }
      } = props.comp.config.indicator || {}
      if (!enable) {
        return undefined
      }
      const padding = props.comp.attrs?.padding ?? [0, 0, 0, 0]
      const isTop = ['top', 'topLeft', 'topRight'].includes(placement)
      const isLeft = ['top', 'topLeft', 'bottom', 'bottomLeft'].includes(placement)
      const isCenter = ['top', 'bottom'].includes(placement)
      return {
        [isTop ? 'top' : 'bottom']: withUnit((isTop ? padding[0] : padding[2]) || 0),
        [isLeft ? 'left' : 'right']: isCenter
          ? '50%'
          : withUnit((isTop ? padding[3] : padding[1]) || 0),
        transform: `translate3d(calc(${withUnit(offset.x)}${isCenter ? ' - 50%' : ''}), ${withUnit(
          offset.y
        )}, 0)`
      }
    })
    const indicatorDotStyle = computed(() => {
      const { size, activeSize, color, activeColor } = props.comp.config.indicator || {}
      return {
        style: {
          width: withUnit(size.w),
          height: withUnit(size.h),
          background: color
        },
        activeStyle: {
          width: withUnit(activeSize.w),
          height: withUnit(activeSize.h),
          background: activeColor
        }
      }
    })
    const imageStyle = computed(() => {
      const br = props.comp.config?.borderRadius ?? [0, 0, 0, 0]
      // 当通用“背景填充”开关关闭时，强制透明，避免仍显示组件级“图片底色”造成误解
      const enabled = !!props.comp.attrs?.backgroundEnable
      const background = enabled
        ? (props.comp.config?.background ?? props.comp.attrs?.background)
        : 'transparent'
      return {
        width: '100%',
        height: '100%',
        borderRadius: br.map((i) => withUnit(i)).join(' '),
        objectFit: props.comp.config.ratio.objectFit,
        background
      }
    })

    const key = ref(uuid())

    onMounted(() => {
      key.value = uuid()
    })

    /* -------------------------------- 导航栏动态样式联动 ------------------------------- */

    const swiperDebug = typeof window !== 'undefined' && localStorage.getItem('swiperDebug') === '1'

    const isFirstSwiper = computed(() => {
      const res = firstSwiper.value?.id === props.comp.id
      if (swiperDebug) {
        console.log('[swiper(render)] isFirstSwiper', {
          selfId: props.comp.id,
          firstId: firstSwiper.value?.id,
          res
        })
      }
      return res
    })

    const currentTheme = computed(() => {
      if (!isFirstSwiper.value) return null
      const { themeColorEnable = false, themeColor = '#ffffff' } =
      imageList.value[current.value] ?? {}
      return themeColorEnable ? themeColor : null
    })

    const currentPageId = computed(() => useCanvasStore().id)

    watch(
      () => currentTheme.value,
      (val) => {
        if (swiperDebug) {
          console.log('[swiper(render)] theme change', {
            pageId: currentPageId.value,
            val,
            isFirst: isFirstSwiper.value
          })
        }
        if (isFirstSwiper.value) {
          emitter.emit(`nav-swiper-theme-color-${currentPageId.value}`, val)
          if (swiperDebug) {
            console.log('[swiper(render)] emit', `nav-swiper-theme-color-${currentPageId.value}`, val)
          }
        }
      },
      { immediate: true }
    )

    onBeforeUnmount(() => {
      emitter.emit(`nav-swiper-theme-color-${currentPageId.value}`, null)
    })

    /* -------------------------------- 导航栏动态样式联动 ------------------------------- */

    return () => {
      const { autoplay = true, interval = 3000, transition = 300 } = props.comp.config ?? {}
      return (
        <div class="c_swiper" style={swiperStyle.value}>
          <div class="c_swiper-content">
            <Swipe
              key={key.value}
              // 编辑时暂停自动播放
              autoplay={autoplay && !props.isActive ? interval : 0}
              duration={transition}
              ref={swipeRef}
              onChange={(i) => (current.value = i)}
              lazy-render
              showIndicators={false}
              style="width:100%;height:100%"
              stop-propagation
            >
              {imageList.value.map((item) => {
                return (
                  <SwipeItem>
                    <div class="c_swiper__item" style={swiperItemStyle.value}>
                      <div class="c_swiper__item-content">
                        {item.image.url ? (
                          // <img src={image.url} style={imageStyle.value} />
                          <ActionImage style={imageStyle.value} image={item.image}/>
                        ) : (
                          <div class="c_swiper__item-placeholder" style={imageStyle.value}>
                            <Empty description="请配置图片"/>
                          </div>
                        )}
                      </div>
                    </div>
                  </SwipeItem>
                )
              })}
              {imageList.value.length === 0 && (
                <>
                  <SwipeItem>
                    <div class="c_swiper__item" style={swiperItemStyle.value}>
                      <div class="c_swiper__item-content">
                        <div class="c_swiper__item-placeholder" style={imageStyle.value}>
                          <Empty description="请配置图片"/>
                        </div>
                      </div>
                    </div>
                  </SwipeItem>
                  <SwipeItem>
                    <div class="c_swiper__item" style={swiperItemStyle.value}>
                      <div class="c_swiper__item-content">
                        <div class="c_swiper__item-placeholder" style={imageStyle.value}>
                          <Empty description="请配置图片"/>
                        </div>
                      </div>
                    </div>
                  </SwipeItem>
                </>
              )}
            </Swipe>
            {props.comp.config.indicator?.enable && (
              <div class="c_swiper__indicator" style={indocatorStyle.value}>
                {imageList.value.map((image, index) => {
                  return (
                    <div
                      class="c_swiper__indicator-dot"
                      style={
                        index === current.value
                          ? indicatorDotStyle.value.activeStyle
                          : indicatorDotStyle.value.style
                      }
                    ></div>
                  )
                })}
              </div>
            )}

            {props.isActive && (
              <>
                <div class="previous clickable" onClick={toPreviousOne}>
                  <Icon name="left"/>
                </div>
                <div class="next clickable" onClick={toNextOne}>
                  <Icon name="right"/>
                </div>
              </>
            )}
          </div>
        </div>
      )
    }
  }
})
