import { computed, defineComponent, inject, PropType, Ref, ref, watch } from 'vue'
import './style.scss'
import { ScrollTab, ScrollTabItem } from '@pkg/ui'
import { DeckComponentConfig } from '../types'
import Taro from '@tarojs/taro'
import { uuid, withUnit } from '@pkg/utils'
import { emitter, useAppStore } from '@pkg/core'
import { findLastIndex } from 'lodash-es'

type AnchorComp = {
  list: {
    title: string
    icon: string
    component: string
  }[]
  style: {
    fixedBackgroundColor: string
    iconPlacement: string
    iconVisible: string
  }
  itemStyle: {
    placement: string
    default: {
      color: string
      backgroundColor: string
      fontSize: number
    }
    active: {
      color: string
      backgroundColor: string
      fontSize: number
    }
  }
}

export default defineComponent({
  name: 'd_anchor',
  props: {
    comp: {
      type: Object as PropType<DeckComponentConfig<AnchorComp>>,
      required: true
    },
    config: {
      type: Object as PropType<AnchorComp>,
      required: true
    }
  },
  setup(props) {
    const id = `anchor-${uuid()}`

    const appStore = useAppStore()
    const commonNavigatorHeight = appStore.commonNavigatorHeight

    const tabHeight = ref(44)
    const stickyTop = computed(() => commonNavigatorHeight + tabHeight.value)

    /** 误差值 */
    const ERROR_VALUE = -2

    const list = computed(() => {
      return props.config.list || []
    })

    const current = ref(0)
    const onToggle = (index: number) => {
      onAnchorClick(index)
      Taro.vibrateShort?.({
        type: 'light'
      })
    }

    const iconPlacement = computed(() => {
      const v = props.config.style?.iconPlacement || 'none'
      if (v === 'above' && !list.value.some(i => !!i.icon)) {
        // 上方 => 至少有一个设置了图标才显示
        return 'none'
      }
      return v
    })

    const style = computed(() => {
      const { color, backgroundColor } = props.config.itemStyle?.default || {}
      const { color: activeColor, backgroundColor: activeBackgroundColor } = props.config.itemStyle?.active || {}
      return {
        '--sticky-bg': props.config.style?.fixedBackgroundColor,
        '--item-color': color,
        '--item-color-active': activeColor,
        '--item-bg': backgroundColor,
        '--item-bg-active': activeBackgroundColor
      }
    })

    const scrollTop: Ref<number> = inject('scrollTopRef') || ref(0)

    const isSticky = ref(false)

    const tabQuery = Taro.createSelectorQuery()
      .select(`#${id} .d_anchor__tab.fixed`)
      .boundingClientRect((res: any) => {
        tabHeight.value = res.height
      })
      .select(`#${id}`)
      .boundingClientRect((res: any) => {
        isSticky.value = res.top <= commonNavigatorHeight + tabHeight.value - res.height
      })

    const onScroll = () => {
      tabQuery.exec()
      calcTabIndex()
    }

    watch(() => scrollTop.value, onScroll)

    const anchorQuery = Taro.createSelectorQuery()
    list.value.forEach(i => {
      i.component && anchorQuery.select(`#deck-comp-${i.component}`).boundingClientRect()
    })

    anchorQuery.selectViewport().scrollOffset()
    const ignoreScrollAnchor = ref(false)

    const basePageKey = inject('basePageKey')
    const onAnchorClick = (index: number) => {
      ignoreScrollAnchor.value = true
      setTimeout(() => {
        ignoreScrollAnchor.value = false
      }, 600)
      current.value = index

      anchorQuery.exec(res => {
        const top = res[current.value].top + res[res.length - 1].scrollTop - stickyTop.value - ERROR_VALUE
        // console.log('滚动到', scrollTop.value + top)
        emitter.trigger(`basePageScrollTo:${basePageKey}`, scrollTop.value + top)
      })
    }
    const calcTabIndex = () => {
      if (ignoreScrollAnchor.value) return void 0
      anchorQuery.exec(res => {
        let index = findLastIndex(res, (item: any) => item?.top - stickyTop.value <= ERROR_VALUE)
        index = index > 0 ? index : 0
        current.value = index
      })
    }

    /*
     * 顶部对齐方式的样式
     * */
    const topScrollTitleStyle = computed(() => {
      if (props.config.itemStyle.placement == 'left' || props.config.itemStyle.placement == undefined) {
        return {
          marginRight: 'auto'
        }
      } else if (props.config.itemStyle.placement == 'center') {
        return {
          marginLeft: 'auto',
          marginRight: 'auto'
        }
      } else {
        return {
          marginLeft: 'auto'
        }
      }
    })

    return () => {
      return (
        <div id={id} class={['d_anchor', isSticky.value && 'sticky']} style={style.value}>
          {['relative', 'fixed'].map(type => {
            return (
              <ScrollTab current={current.value} class={['d_anchor__tab', type]}>
                <div
                  class={['d_anchor__list', props.config.itemStyle?.placement == 'right' && 'hideAfterEle']}
                  style={topScrollTitleStyle.value}
                >
                  {list.value.map((item, index) => {
                    if (!item) {
                      return null
                    }

                    const iconVisible = props.config.style?.iconVisible ?? 'always'

                    const _iconVisible = iconVisible === 'always' ? true : type === 'fixed'

                    return (
                      <ScrollTabItem>
                        <div
                          class={['d_anchor__item clickable', index === current.value && 'active']}
                          onClick={() => {
                            onToggle(index)
                          }}
                        >
                          {iconPlacement.value === 'above' && (
                            <div
                              class={['icon', !_iconVisible && 'icon-hidden']}
                              style={{
                                backgroundImage: `url(${item.icon})`
                              }}
                            ></div>
                          )}
                          <div
                            class="title"
                            style={{
                              fontSize:
                                index === current.value
                                  ? `${withUnit(props.config.itemStyle.active.fontSize)}`
                                  : `${withUnit(props.config.itemStyle.default.fontSize)}`
                            }}
                          >
                            {iconPlacement.value === 'inner' && item.icon && (
                              <div
                                class="inner-icon"
                                style={{
                                  backgroundImage: `url(${item.icon})`
                                }}
                              ></div>
                            )}
                            {item.title}
                          </div>
                        </div>
                      </ScrollTabItem>
                    )
                  })}
                </div>
              </ScrollTab>
            )
          })}
        </div>
      )
    }
  }
})
