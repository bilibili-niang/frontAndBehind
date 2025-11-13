import {
  PropType,
  computed,
  defineComponent,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch
} from 'vue'
import './style.scss'
import exampleImage from './example.png'
import { useAction, ActionItem, uuid } from '@anteng/core'
import { DeckComponent } from '../../../stores/canvas'
import { ImageDefine } from '@anteng/core'
import { clamp } from 'lodash'
import { withUnit } from '../../../canvas-components/utils'
import { Swipe, SwipeItem } from 'vant'
import 'vant/es/swipe/index.css'

export { default as manifest } from './manifest'

function chunkArray(arr: any[], size: number) {
  if (size > 0) {
    const result = []
    for (let i = 0; i < arr.length; i += size) {
      const chunk = arr.slice(i, i + size)
      result.push(chunk)
    }
    return result
  }
  return [] as never
}

type CompType = {
  interaction: 'slide' | 'swipe'
  col: number
  swipeCol: number
  row: number
  visibleCol: number
  titleColor: string
  list: {
    title: string
    image: ImageDefine
    action: ActionItem
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

export default defineComponent({
  name: 'C_QuickLink',
  props: {
    comp: {
      type: Object as PropType<DeckComponent<CompType>>,
      required: true
    }
  },
  setup(props) {
    const hasItem = computed(() => props.comp.config.list.length > 0)
    const list = computed(() => {
      if (hasItem.value) {
        return props.comp.config.list
      }
      return Array(10)
        .fill('')
        .map((item, index) => {
          return {
            title: '标题内容',
            image: { url: exampleImage, size: 256, height: 256 },
            action: { key: '', remark: '', config: {} },
            badge: { enable: false, content: '', color: '', backgroundColor: '' }
          }
        })
    })

    const isSwipe = computed(() => props.comp.config.interaction === 'swipe')

    const rowCount = computed(() => {
      return isSwipe.value ? props.comp.config.swipeCol : props.comp.config.col
    })

    const visibleCol = computed(() => {
      return clamp(props.comp.config.visibleCol ?? 5, 4, 6)
    })

    const scrollAble = computed(() => {
      return props.comp.config.col > visibleCol.value
    })

    const rows = computed(() => {
      return chunkArray(list.value, rowCount.value)
    })

    const pages = computed(() => {
      return chunkArray(list.value, rowCount.value * props.comp.config.row)
    })

    const itemStyle = computed(() => {
      return {
        width: isSwipe.value
          ? `calc(100% / ${rowCount.value})`
          : `calc(100% / ${scrollAble.value ? visibleCol.value - 0.05 : rowCount.value})`,
        color: props.comp.config.titleColor
      }
    })

    const scrollRatio = ref(0)
    const onScroll = (e: UIEvent) => {
      const el = e.target as HTMLElement
      scrollRatio.value = clamp(el.scrollLeft / (el.scrollWidth - el.offsetWidth), 0, 1)
    }

    const indicator = computed(() => {
      const { enable, width, height, backgroundColor } = props.comp.config?.indicator ?? {}
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
      const { color } = props.comp.config?.indicator ?? {}

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
    const pageHeight = ref<number>()
    const currentPage = ref(0)
    const onSwipeChange = (index: number) => {
      currentPage.value = index
      pageHeight.value = (
        pageRef.value?.querySelectorAll('.c_quick-link__page')[index] as HTMLElement
      )?.offsetHeight
    }

    watch(
      () => list.value.length,
      () => {
        nextTick(() => {
          onSwipeChange(currentPage.value)
        })
      }
    )

    const Item = (item: CompType['list'][number], index: number) => {
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

    const swipeKey = ref(uuid())
    const onResize = () => {
      swipeKey.value = uuid()
    }
    const a = new ResizeObserver(onResize)
    onMounted(() => {
      a.observe(document.querySelector('.deck-editor-render__viewport') as HTMLElement)
    })

    onUnmounted(() => {
      a.disconnect()
    })

    return () => {
      if (isSwipe.value) {
        return (
          <div class="c_quick-link" key={swipeKey.value}>
            <div
              class="c_quick-link__page-wrapper"
              style={{
                height: `${pageHeight.value}px`
              }}
              ref={pageRef}
            >
              <Swipe
                loop={false}
                showIndicators={false}
                style="width:100%;height:100%"
                stop-propagation
                onChange={onSwipeChange}
              >
                {pages.value.map((page) => {
                  return (
                    <SwipeItem>
                      <div class="c_quick-link__page">{page.map(Item)}</div>
                    </SwipeItem>
                  )
                })}
              </Swipe>
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
        <div class={['c_quick-link', scrollAble.value && 'c_quick-link--scrollable']}>
          <div class={['c_quick-link__list', 'scroller--hidden']} onScroll={onScroll}>
            {rows.value.map((row) => {
              return (
                <div class="c_quick-link__row-scroller">
                  <div class="c_quick-link__row">{row.map(Item)}</div>
                </div>
              )
            })}
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
  }
})
