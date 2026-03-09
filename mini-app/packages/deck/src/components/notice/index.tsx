import { PropType, computed, defineComponent, onUnmounted, ref, watch } from 'vue'
import './style.scss'

import { DeckComponentConfig } from '../types'
import Taro from '@tarojs/taro'
import { useAction } from '../../hooks/useAction'

const DEFAULT_ICON = 'https://dev-cdn.cardcat.cn/ice/notice-default-icon.svg'

type ImageDefine = any
type Action = any

type NoticeItem = {
  icon: ImageDefine
  text: string
  color: string
  action?: Action
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
    icon: { url: 'https://dev-cdn.cardcat.cn/ice/example_04.png', width: 0, height: 0 },
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
    icon: { url: 'https://dev-cdn.cardcat.cn/ice/example_12.png', width: 0, height: 0 },
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
    config: {
      type: Object as PropType<DeckComponentConfig<NoticeConfig>>,
      required: true
    }
  },
  emits: {
    itemClick: (item: NoticeItem) => true
  },
  setup(props, { emit }) {
    const listRef = computed(() => {
      return props.config.list.length === 0 ? mockList : props.config.list
    })
    const count = computed(() => listRef.value.length)

    const unionIcon = computed(() => props.config.icon?.url || DEFAULT_ICON)
    const icons = computed(() => {
      return Array.from(new Set([unionIcon.value].concat(listRef.value.map(item => item.icon.url))))
    })

    const interval = computed(() => props.config.interval)

    const currentIndex = ref(0)
    const actualIndex = ref(0)
    const circular = ref(false)
    const locked = ref(false)
    const toggle = (nextIndex: number) => {
      if (locked.value) {
        return false
      }
      const isBack = nextIndex - currentIndex.value < 0
      const actualNextIndex = isBack ? (count.value + nextIndex) % count.value : nextIndex % count.value
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

    onUnmounted(() => {
      clearTimeout(autoplayTimer.value)
    })

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
      const { width, height, marginX, marginY } = props.config.iconLayout
      return {
        width: Taro.pxTransform(width),
        height: Taro.pxTransform(height),
        margin: `${Taro.pxTransform(marginY)} ${Taro.pxTransform(marginX)}`
      }
    })
    const splitStyle = computed(() => {
      const { enable, color, height, marginLeft, marginRight } = props.config.split
      if (!enable) {
        return { display: 'none' }
      }
      return {
        backgroundColor: color,
        height: Taro.pxTransform(height),
        marginLeft: Taro.pxTransform(marginLeft),
        marginRight: Taro.pxTransform(marginRight)
      }
    })
    const arrowStyle = (arrow: NoticeItem['arrow']) => {
      const { color, size } = arrow
      return {
        color,
        fontSize: Taro.pxTransform(size)
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
          class="d_notice__item"
          style={itemStyle(item, index)}
          onClick={() => {
            useAction(item.action)
            emit('itemClick', item)
          }}
        >
          <div class="d_notice__text">{item.text}</div>
          {item.arrow.enable && (
            <div class="d_notice__arrow" style={arrowStyle(item.arrow)}>
              {item.arrow.text.length > 0 && <span class="d_notice__arrow-text">{item.arrow.text}</span>}
              <div class="d_notice__arrow-icon iconfont icon-right"></div>
            </div>
          )}
        </div>
      )
    }

    return () => {
      const list = listRef.value
      const currentIcon = list[actualIndex.value].icon.url || unionIcon.value
      return (
        <div class="d_notice">
          <div class="d_notice__icon" style={iconStyle.value}>
            {icons.value.map(url => {
              return (
                <img
                  class={['d_notice__icon-image', url === currentIcon && 'd_notice__icon-image--active']}
                  src={url}
                />
              )
            })}
          </div>
          <div class="d_notice__split" style={splitStyle.value}></div>
          <div class="d_notice__content">
            <div class="d_notice__slider" style={sliderStyle.value}>
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
