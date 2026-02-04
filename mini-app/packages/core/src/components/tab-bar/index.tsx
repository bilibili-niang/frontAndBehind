import { computed, defineComponent, PropType } from 'vue'
import './style.scss'
import Taro from '@tarojs/taro'
import { parseBorderRadius } from '@pkg/utils'
import { Button } from '@tarojs/components'
import { REQUEST_DOMAIN } from '../../api/request'

// 将相对路径转换为完整图片地址
const resolveIcon = (url?: string) => {
  if (!url) return url as any
  const lower = url.toLowerCase()
  if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('data:')) return url
  if (url.startsWith('/')) return `${REQUEST_DOMAIN}${url}`
  return `${REQUEST_DOMAIN}/${url}`
}

export interface ITabBarItem {
  /** 唯一标志 */
  key: string
  /** 文字内容 */
  text: string
  /** 默认图标url */
  icon: string
  /** 选中时图标url */
  activeIcon: string
  template?: string

  actionEnable?: boolean
  action?: any
  /** 图标放大倍率（单项） */
  iconScale?: number
  /** 图标宽高（单项，单位px） */
  iconWidth?: number
  iconHeight?: number
}

/** 样式风格 */
export type ITabTheme = 'default' | 'raised' | (string & {})

export default defineComponent({
  name: 'IndexTabBar',
  props: {
    /** Tab列表 */
    tabs: {
      type: Array as PropType<ITabBarItem[]>,
      required: true
    },
    current: {
      type: String,
      default: undefined
    },
    theme: {
      type: String as PropType<ITabTheme>,
      default: 'default'
    },
    /** 背景颜色 */
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    /** 默认文字颜色 */
    color: {
      type: String,
      default: '#999999'
    },
    /** 选中时文字颜色 */
    activeColor: {
      type: String,
      default: '#000000'
    },
    /** 圆角 */
    borderRadius: {
      type: [Number, Array] as PropType<number | number[]>,
      default: () => [0, 0, 0, 0]
    },
    /** 外边距 */
    margin: {
      type: [Number, Array] as PropType<number | number[]>,
      default: () => [0, 0, 0, 0]
    },
    /** 内边距 */
    padding: {
      type: [Number, Array] as PropType<number | number[]>,
      default: () => [0, 0, 0, 0]
    },
    /** 图标放大倍率 */
    iconScale: {
      type: Number,
      default: undefined
    }
  },
  emits: {
    /** 点击切换触发 */
    change: (key: string, index: number) => true,
    action: (action: any) => true
  },
  setup(props, { emit }) {
    const tabs = computed(() => {
      return Array.isArray(props.tabs) ? props.tabs : []
    })

    const toggle = (item: ITabBarItem) => {
      if (item.actionEnable) {
        if (openType(item)) {
          return void 0
        }
        emit('action', item.action)
      } else {
        emit('change', item.key, tabs.value.indexOf(item), item)
      }
    }

    const openType = (item: ITabBarItem) => {
      if (process.env.TARO_ENV === 'weapp') {
        if (item.actionEnable && item.action?.key === 'contact' && item.action.config?.type !== 'work') {
          return <Button class="index-tab__open-type" openType="contact"></Button>
        }
      }
    }

    return () => {
      const { backgroundColor, color, activeColor, theme, borderRadius, margin, padding, iconScale } = props
      const scale = iconScale ?? (theme === 'raised' ? 1.8 : 1)
      return (
        <div
          class={['index-tab', `index-tab--${theme}`]}
          style={{
            backgroundColor: backgroundColor,
            borderRadius: parseBorderRadius(borderRadius)
              .map(i => `${i}px`)
              .join(' '),
            margin: parseBorderRadius(margin)
              .map(i => `${i}px`)
              .join(' '),
            padding: parseBorderRadius(padding)
              .map(i => `${i}px`)
              .join(' ')
          }}
        >
          {tabs.value.map((item, index) => {
            const isActive = props.current === item.key
            const icon = isActive ? item.activeIcon ?? item.icon : item.icon
            const scale = (item.iconScale ?? props.iconScale) ?? (theme === 'raised' ? 1.8 : 1)
            const iconWidth = item.iconWidth ?? 35
            const iconHeight = item.iconHeight ?? 35
            return (
              <div
                key={index}
                class={['index-tab__item clickable', isActive && 'index-tab__item--active']}
                onClick={() => {
                  toggle(item)
                }}
                onTouchstart={
                  process.env.TARO_ENV !== 'h5'
                    ? () => {
                      Taro.vibrateShort({
                        type: 'medium'
                      })
                    }
                    : undefined
                }
              >
                <div class="index-tab__icon" style={{ width: iconWidth + 'px', height: iconHeight + 'px', transform: `scale(${scale})`, transformOrigin: 'bottom center' }}>
                  {icon ? <img class="index-tab__icon-image" src={resolveIcon(icon)}/>
                    :
                    <div class={
                      {
                        'tab-item-empty': true,
                        'tab-item-empty-active': isActive
                      }
                    } style={{ width: '100%', height: '100%' }}/>
                  }
                </div>
                <span
                  class="index-tab__name"
                  style={{
                    color: isActive ? activeColor : color
                  }}
                >
                  {isActive ? item.activeText :
                    item.text}
                </span>
                {openType(item)}
              </div>
            )
          })}
        </div>
      )
    }
  }
})
