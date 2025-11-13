import { PropType, computed, defineComponent, ref, watch } from 'vue'
import './style.scss'

export { default as manifest } from './manifest'
import images from '../../images.json'
import { DeckComponent } from '../../../stores/canvas'
import { ImageDefine } from '@anteng/core'
import { withUnit } from '../../../canvas-components/utils'
import { useAction, ActionItem } from '@anteng/core'
import { clamp } from 'lodash'

type NoticeItem = {
  icon: ImageDefine
  text: string
  color: string
  action?: ActionItem
  arrow: {
    enable: boolean
    color: string
    size: number
    text: string
  }
}

type NoticeConfig = {
  icon: ImageDefine
  iconLayout: {
    width: number
    height: number
    marginX: number
    marginY: number
  }
  split: {
    enable: boolean
    color: string
    height: number
    marginLeft: number
    marginRight: number
  }
  list: NoticeItem[]
  interval: number
}

const mockList = [
  {
    icon: { url: '', width: 0, height: 0 },
    text: '尚未配置，请添加内容节点',
    color: '#333333',
    arrow: {
      enable: true,
      color: '#bbbbbb',
      size: 16,
      text: '去配置'
    }
  },
  {
    icon: { url: 'https://dev-cdn.cardcat.cn/kacat/example_04.png', width: 0, height: 0 },
    text: '尚未配置，请添加内容节点',
    color: '#333333',
    arrow: {
      enable: false,
      color: '#bbbbbb',
      size: 16,
      text: ''
    }
  },
  {
    icon: { url: 'https://dev-cdn.cardcat.cn/kacat/example_12.png', width: 0, height: 0 },
    text: '尚未配置，请添加内容节点',
    color: '#333333',
    arrow: {
      enable: true,
      color: '#bbbbbb',
      size: 16,
      text: ''
    }
  }
]

export default defineComponent({
  props: {
    comp: {
      type: Object as PropType<DeckComponent<NoticeConfig>>,
      required: true
    },
    config: {
      type: Object as PropType<NoticeConfig>,
      required: true
    }
  },
  setup(props) {
    const listRef = computed(() => {
      return props.config?.list?.length > 0 ? props.config.list : mockList
    })
    const count = computed(() => listRef.value.length)

    const unionIcon = computed(() => props.config?.icon?.url || images.notice.url)
    const icons = computed(() => {
      return Array.from(
        new Set([unionIcon.value].concat(listRef.value.map((item) => item.icon.url)))
      )
    })

    const interval = computed(() => clamp(props.config?.interval ?? 3000, 1500, 10000))

    const currentIndex = ref(0)
    const actualIndex = ref(0)
    const circular = ref(false)
    const locked = ref(false)
    const toggle = (nextIndex: number) => {
      if (locked.value) {
        return false
      }
      const isBack = nextIndex - currentIndex.value < 0
      const actualNextIndex = isBack
        ? (count.value + nextIndex) % count.value
        : nextIndex % count.value
      currentIndex.value = nextIndex
      actualIndex.value = actualNextIndex
      locked.value = true
      const isCircular = actualNextIndex !== nextIndex
      setTimeout(
        () => {
          if (isCircular) {
            currentIndex.value = actualNextIndex
            circular.value = true
            setTimeout(() => {
              circular.value = false
              locked.value = false
            }, 64)
          } else {
            locked.value = false
          }
        },
        isCircular ? 332 : 400
      )
    }
    const next = () => {
      toggle(currentIndex.value + 1)
    }
    const last = () => {
      toggle(currentIndex.value - 1)
    }

    const autoplayTimer = ref()
    const autoplay = () => {
      clearTimeout(autoplayTimer.value)
      if (!(listRef.value.length > 1)) {
        return void 0
      }
      autoplayTimer.value = setTimeout(() => {
        next()
        autoplay()
      }, interval.value)
    }

    watch(
      () => listRef.value.length,
      () => {
        if (!listRef.value[actualIndex.value]) {
          currentIndex.value = 0
          actualIndex.value = 0
        }
        autoplay()
      },
      { immediate: true }
    )

    const sliderStyle = computed(() => {
      if (circular.value) {
        return {
          transform:
            currentIndex.value === count.value - 1
              ? `translate3d(0, ${-count.value * 100 + 100}%, 0)`
              : 'translate3d(0, 0, 0)',
          transition: 'all 0s'
        }
      }
      return {
        transform: `translate3d(0, ${-currentIndex.value * 100}%, 0)`
      }
    })
    const iconStyle = computed(() => {
      const { width, height, marginX, marginY } = props.config?.iconLayout ?? {}
      return {
        width: withUnit(width),
        height: withUnit(height),
        margin: `${withUnit(marginY)} ${withUnit(marginX)}`
      }
    })
    const splitStyle = computed(() => {
      const { enable, color, height, marginLeft, marginRight } = props.config?.split ?? {}
      if (!enable) {
        return { display: 'none' }
      }
      return {
        backgroundColor: color,
        height: withUnit(height),
        marginLeft: withUnit(marginLeft),
        marginRight: withUnit(marginRight)
      }
    })
    const arrowStyle = (arrow: NoticeItem['arrow']) => {
      const { color, size } = arrow
      return {
        color,
        fontSize: withUnit(size)
      }
    }
    const itemStyle = (item: NoticeItem, index: number) => {
      return {
        transform: `translate3d(0, ${index * 100}%, 0)`,
        color: item.color
      }
    }

    const SlideItem = (item: NoticeItem, index: number) => {
      return (
        <div
          class="c_notice__item"
          style={itemStyle(item, index)}
          onClick={() => useAction(item.action)}
        >
          <div class="c_notice__text">{item.text}</div>
          {item.arrow.enable && (
            <div class="c_notice__arrow" style={arrowStyle(item.arrow)}>
              {item.arrow.text.length > 0 && (
                <span class="c_notice__arrow-text">{item.arrow.text}</span>
              )}
              <div class="c_notice__arrow-icon iconfont icon-right"></div>
            </div>
          )}
        </div>
      )
    }

    return () => {
      const list = listRef.value
      const currentIcon = list[actualIndex.value].icon.url || unionIcon.value
      return (
        <div class="c_notice">
          <div class="c_notice__icon" style={iconStyle.value}>
            {icons.value.map((url) => {
              return (
                <img
                  class={[
                    'c_notice__icon-image',
                    url === currentIcon && 'c_notice__icon-image--active'
                  ]}
                  src={url}
                />
              )
            })}
          </div>
          <div class="c_notice__split" style={splitStyle.value}></div>
          <div class="c_notice__content">
            <div class="c_notice__slider" style={sliderStyle.value}>
              {SlideItem(list[count.value - 1], -1)}
              {list.map(SlideItem)}
              {SlideItem(list[0], count.value)}
            </div>
          </div>
        </div>
      )
    }
  }
})
