import { computed, defineComponent, onBeforeUnmount, onMounted, PropType, ref } from 'vue'
import './style.scss'
import { DeckComponent } from '../../../stores/canvas'
import { ScrollTab, ScrollTabItem } from '@pkg/ui'
import { findLastIndex } from 'lodash'
import { withUnit } from '@pkg/decoration'

export { default as manifest } from './manifest'
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
    placement:string
    default: {
      color: string
      backgroundColor: string
      fontSize:number
    }
    active: {
      color: string
      backgroundColor: string
      fontSize:number
    }
  }
}
export default defineComponent({
  name: 'd_anchor',
  props: {
    comp: {
      type: Object as PropType<DeckComponent<AnchorComp>>,
      required: true
    },
    config: {
      type: Object as PropType<AnchorComp>,
      required: true
    }
  },
  setup(props) {
    const el = ref<HTMLElement>()
    onMounted(() => {
      const node = el.value?.parentElement?.parentElement!
      node.style.position = 'sticky'
      node.style.top = 'var(--nav-height)'
      node.style.zIndex = '20'
    })
    /** 误差尺寸 */
    const ERROR_VALUE = 2
    const list = computed(() => {
      return props.config.list || []
    })
    const current = ref(0)
    const onToggle = (index: number) => {
      current.value = index
      const viewport = document.querySelector('.deck-editor-render__viewport') as HTMLElement
      const nav = document
        .querySelector('.deck-editor-render__viewport .w_basic-nav')!
        .getBoundingClientRect()
      const target = (
        document.querySelector(`#deck-comp-${list.value[index].component}`) as HTMLElement
      ).getBoundingClientRect()
      const tab = el.value!.getBoundingClientRect()
      setTimeout(() => {
        const top = viewport.scrollTop + target.top - (nav.top + nav.height + tab.height) + 2
        viewport?.scrollTo({
          top: top,
          behavior: 'instant'
        })
      })
    }
    const iconPlacement = computed(() => {
      const v = props.config.style?.iconPlacement || 'none'
      if (v === 'above' && !list.value.some((i) => !!i.icon)) {
        // 上方 => 至少有一个设置了图标才显示
        return 'none'
      }
      return v
    })
    const style = computed(() => {
      const { color, backgroundColor } = props.config.itemStyle?.default || {}
      const { color: activeColor, backgroundColor: activeBackgroundColor } =
        props.config.itemStyle?.active || {}
      return {
        '--sticky-bg': props.config.style?.fixedBackgroundColor,
        '--item-color': color,
        '--item-color-active': activeColor,
        '--item-bg': backgroundColor,
        '--item-bg-active': activeBackgroundColor
      }
    })
    const isSticky = ref(false)
    onMounted(() => {
      document.querySelector('.deck-editor-render__viewport')?.addEventListener('scroll', onScroll)
    })
    const onScroll = (e: any) => {
      const nav = document
        .querySelector('.deck-editor-render__viewport .w_basic-nav')!
        .getBoundingClientRect()
      isSticky.value = nav.top - el.value!.getBoundingClientRect().top + nav.height >= 0
      calcIndex(nav.top + nav.height + el.value!.getBoundingClientRect().height)
    }
    const calcIndex = (offset: number) => {
      const items = list.value
        .map((item) => document.querySelector(`#deck-comp-${item.component}`) as HTMLElement)
        .filter((i) => i)
      const index = findLastIndex(items, (item: HTMLElement) => {
        return item.getBoundingClientRect().top - offset <= ERROR_VALUE
      })
      setTimeout(() => {
        current.value = index
      }, 32)
    }
    onBeforeUnmount(() => {
      document.querySelector('.deck-editor-render__viewport')?.addEventListener('scroll', onScroll)
    })
    /*
     * 顶部对齐方式的样式
     * */
    const topScrollTitleStyle = computed(() => {
      if (
        props.config.itemStyle.placement == 'left' ||
        props.config.itemStyle.placement == undefined
      ) {
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
        <div ref={el} class={['d_anchor', isSticky.value && 'sticky']} style={style.value}>
          <ScrollTab current={current.value}>
            <div
              style={topScrollTitleStyle.value}
              class={[
                'd_anchor__list',
                props.config.itemStyle?.placement == 'right' && 'hideAfterEle'
              ]}
            >
              {list.value.map((item, index) => {
                if (!item) {
                  return null
                }
                const iconVisible =
                  props.config.style.iconVisible === 'sticky' ? !!isSticky.value : true
                return (
                  <ScrollTabItem>
                    <div
                      class={['d_anchor__item clickable', index === current.value && 'active']}
                      onClick={() => {
                        onToggle(index)
                      }}
                    >
                      {iconPlacement.value === 'above' && iconVisible && (
                        <div
                          class="icon"
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
        </div>
      )
    }
  }
})
