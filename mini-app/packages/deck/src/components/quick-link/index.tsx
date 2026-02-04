import { PropType, computed, defineComponent, onMounted, ref } from 'vue'
import './style.less'
import { DeckComponentConfig } from '../types'
import { BaseEventOrigFunction, ScrollView, ScrollViewProps, Swiper, SwiperItem } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { clamp } from 'lodash-es'
import { uuid, withUnit } from '@pkg/utils'
import { Action, useAction } from '../../hooks/useAction'

type ImageDefine = any

type QuickLinkConfig = {
  interaction: 'slide' | 'swipe'
  col: number
  swipeCol: number
  row: number
  visibleCol: number
  titleColor: string
  list: {
    title: string
    image: ImageDefine
    action: Action
    badge: {
      enable: boolean
      content: string
      color: string
      backgroundColor: string
    }
  }[]
  indicator: {
    enable: boolean
    color: string
    backgroundColor: string
    width: number
    height: number
  }
}

function chunkArray(arr: any[], size: number) {
  if (size > 0) {
    const result = [] as typeof arr
    for (let i = 0; i < arr.length; i += size) {
      const chunk = arr.slice(i, i + size)
      result.push(chunk)
    }
    return result
  }
  return [] as never
}

export default defineComponent({
  name: 'c_quick-link',
  props: {
    config: {
      type: Object as PropType<DeckComponentConfig<QuickLinkConfig>>,
      required: true
    }
  },
  setup(props) {
    const id = `quick-link-${uuid()}`

    const hasItem = ref(false)
    const list = computed(() => {
      if (props.config.list.length > 0) {
        return props.config.list
      }
      return Array(10)
        .fill('')
        .map((item, index) => {
          return {
            title: '标题内容',
            image: {
              url: `https://dev-cdn.cardcat.cn/anteng/example_${('0' + (index + 1)).slice(-2)}.png`,
              size: 256,
              height: 256
            },
            action: { key: '', remark: '', config: {} },
            badge: { enable: false, content: '', color: '', backgroundColor: '' }
          }
        })
    })

    const isSwipe = computed(() => props.config.interaction === 'swipe')

    const rowCount = computed(() => {
      return isSwipe.value ? props.config.swipeCol : props.config.col
    })

    const visibleCol = computed(() => {
      return clamp(props.config.visibleCol ?? 5, 4, 6)
    })

    const scrollAble = computed(() => {
      return props.config.col > visibleCol.value
    })

    const rows = computed(() => {
      return chunkArray(list.value, rowCount.value)
    })

    const pages = computed(() => {
      return chunkArray(list.value, rowCount.value * props.config.row)
    })

    const itemStyle = computed(() => {
      return {
        width: isSwipe.value
          ? `calc(100% / ${rowCount.value})`
          : `calc(100% / ${scrollAble.value ? visibleCol.value - 0.05 : rowCount.value})`,
        color: props.config.titleColor
      }
    })

    const scrollRatio = ref(0)
    const scrollerId = 'quick-link-' + uuid()
    let ScrollerWidth = 375
    onMounted(() => {
      Taro.createSelectorQuery()
        .select(`#${scrollerId}`)
        .boundingClientRect(res => {
          ScrollerWidth = res[0].width
        })
    })
    const onScroll: BaseEventOrigFunction<ScrollViewProps.onScrollDetail> = e => {
      const { scrollLeft, scrollWidth } = e.detail
      const scrollPercent = scrollLeft / (scrollWidth - ScrollerWidth)
      scrollRatio.value = clamp(scrollPercent, 0, 1)
      // const el = e.target as HTMLElement
      // scrollRatio.value = clamp(el.scrollLeft / (el.scrollWidth - el.offsetWidth), 0, 1)
    }

    const indicator = computed(() => {
      const { enable, width, height, backgroundColor } = props.config?.indicator ?? {}
      return {
        visible: (scrollAble.value || (isSwipe.value && pages.value.length > 1)) && enable,
        style: enable
          ? {
              width: withUnit(width),
              height: withUnit(height),
              backgroundColor
            }
          : undefined
      }
    })
    const indicatorThumbStyle = computed(() => {
      const { color } = props.config?.indicator ?? {}

      const ratio = isSwipe.value ? currentPage.value / (pages.value.length - 1) : scrollRatio.value
      const width = isSwipe.value ? 1 / pages.value.length : visibleCol.value / rowCount.value
      return {
        backgroundColor: color,
        width: `${width * 100}%`,
        left: `${ratio * 100}%`,
        transform: `translate3d(${-ratio * 100}%, 0, 0)`
      }
    })

    const pageRef = ref<HTMLElement>()
    const currentPage = ref(0)
    const onSwipeChange = e => {
      currentPage.value = e.detail.current
    }

    const pagesHeight = ref<number[]>([])
    const pageHeight = computed(() => {
      return pagesHeight.value[currentPage.value]
    })

    let retryCount = 0
    const getPagesHeight = () => {
      Taro.createSelectorQuery()
        .in(Taro.getCurrentInstance().page!)
        .selectAll(`.${id} >>> .c_quick-link__page`)
        .boundingClientRect((res: any[]) => {
          pagesHeight.value = res.map(item => item.height)
          if (retryCount < 5 && res.length < pages.value.length) {
            retryCount++
            setTimeout(getPagesHeight, 32)
          }
        })
        .exec()
    }

    onMounted(getPagesHeight)

    const Item = (item, index) => {
      return (
        <div
          class="c_quick-link__item"
          style={itemStyle.value}
          onClick={() => {
            useAction(item.action)
          }}
        >
          <div
            class="c_quick-link__image"
            style={{
              backgroundImage: `url(${item.image?.url})`,
              backgroundColor: !item.image?.url ? '#e8e8e8' : undefined,
              backgroundSize: hasItem.value ? 'contain' : '100% auto',
              backgroundPosition: hasItem.value ? 'center center' : `0 ${(index * 100) / 11}%`
            }}
          >
            {item.badge.enable && item.badge.content && (
              <span
                class="c_quick-link__badge"
                style={{
                  color: item.badge.color,
                  backgroundColor: item.badge.backgroundColor
                }}
              >
                {item.badge.content}
              </span>
            )}
          </div>
          <div class="c_quick-link__title">{item.title}</div>
        </div>
      )
    }

    return () => {
      if (isSwipe.value) {
        return (
          <div class={['c_quick-link', id]}>
            <div
              class="c_quick-link__page-wrapper"
              style={{
                height: `${pageHeight.value}px`
              }}
              ref={pageRef}
            >
              <Swiper
                circular={false}
                style={{
                  height: '100%'
                }}
                onChange={onSwipeChange}
              >
                {pages.value.map(page => {
                  return (
                    <SwiperItem>
                      <div class="c_quick-link__page">{page.map(Item)}</div>
                    </SwiperItem>
                  )
                })}
              </Swiper>
            </div>
            {indicator.value.visible && (
              <div class="c_quick-link__indicator">
                <div class="c_quick-link__track" style={indicator.value.style}>
                  <div class="c_quick-link__thumb" style={indicatorThumbStyle.value}></div>
                </div>
              </div>
            )}
          </div>
        )
      }
      return (
        <div class={['c_quick-link ', id, scrollAble.value && 'c_quick-link--scrollable']}>
          <ScrollView
            id={scrollerId}
            class={['c_quick-link__list', 'scroller--hidden']}
            scrollX={scrollAble.value}
            onScroll={onScroll}
            enhanced
            showScrollbar={false}
          >
            {rows.value.map(row => {
              return (
                <div class="c_quick-link__row-scroller">
                  <div class="c_quick-link__row">{row.map(Item)}</div>
                </div>
              )
            })}
          </ScrollView>
          {indicator.value.visible && (
            <div class="c_quick-link__indicator">
              <div class="c_quick-link__track" style={indicator.value.style}>
                <div class="c_quick-link__thumb" style={indicatorThumbStyle.value}></div>
              </div>
            </div>
          )}
        </div>
      )
    }
  }
})
