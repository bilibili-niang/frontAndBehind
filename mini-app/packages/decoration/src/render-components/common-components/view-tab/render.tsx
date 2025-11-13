import { computed, defineComponent, onBeforeUnmount, onMounted, PropType, ref, watch, withModifiers } from 'vue'
import './style.scss'
import useCanvasStore, { DeckComponent } from '../../../stores/canvas'
import { Empty, ScrollTab, ScrollTabItem } from '@anteng/ui'
import { storeToRefs } from 'pinia'
import ComponentItem from '../../../views/editor/canvas/component-item'
import { withUnit } from '@anteng/decoration'

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
  name: 'd_view-tab',
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

    const canvasStore = useCanvasStore()
    const { currentSelectedComponent, layerTree } = storeToRefs(canvasStore)
    const childComponents = computed(() => {
      return (
        layerTree.value
          .getNode(props.comp.id)
          ?.children.map((childNode) => {
          return childNode.$component
        })
          .filter((item) => item.key === 'view-tab-container' && !item.hidden) ?? []
      )
    })

    watch(
      () => currentSelectedComponent.value,
      () => {
        const parentId = currentSelectedComponent.value?.parent

        if (!parentId) return void 0

        let node: any = currentSelectedComponent.value
        let parentNode = canvasStore.layerTree.getComponent(parentId)

        while (parentNode) {
          if (parentNode.id === props.comp.id) {
            const index = childComponents.value.findIndex((item) => item.id === node.id)
            current.value = index >= 0 ? index : 0
            break
          }
          node = parentNode
          parentNode = canvasStore.layerTree.getComponent(parentNode.parent!)
        }
      }
    )

    const list = computed(() => {
      return childComponents.value.map((item) => {
        return item.config as {
          title: string
          icon: string
        }
      })
    })

    const current = ref(0)
    const onToggle = (index: number) => {
      current.value = index
      canvasStore.selectComponent(childComponents.value[index].id, false)
    }

    const scrollToTop = () => {
      const viewport = document.querySelector('.deck-editor-render__viewport')!
      const nav = document
        .querySelector('.deck-editor-render__viewport .w_basic-nav')!
        .getBoundingClientRect()

      canvasStore.disableComponentScrollIntoView()
      setTimeout(() => {
        viewport.scrollBy({
          top: el.value!.getBoundingClientRect().top - nav.height - nav.top
          // 'behavior': 'instant'
        })
      })
    }

    watch(() => current.value, scrollToTop)

    watch(
      () => childComponents.value,
      () => {
        if (!childComponents.value[current.value]) {
          current.value = 0
        }
      }
    )

    const currentView = computed(() => {
      const comp = childComponents.value[current.value]
      return {
        ...comp,
        name: comp.config?.title || comp.name
      }
    })

    const iconPlacement = computed(() => {
      const v = props.config.style?.iconPlacement || 'none'
      if (v === 'above' && !list.value.some((i) => !!i.icon)) {
        // 上方 => 至少有一个设置了图标才显示
        return 'none'
      }
      return v
    })

    const style = computed(() => {
      const { color, backgroundColor } = props.config?.itemStyle?.default || {}
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
      // 立即计算是否吸顶
      onScroll()
    })

    const onScroll = () => {
      const nav = document
        .querySelector('.deck-editor-render__viewport .w_basic-nav')!
        .getBoundingClientRect()

      isSticky.value = nav.top - el.value!.getBoundingClientRect().top + nav.height >= 0
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
      if (childComponents.value.length === 0) {
        return (
          <div ref={el} class="d_view-tab">
            <Empty description="请添加分页，并向其中添加组件" />
          </div>
        )
      }
      return (
        <div ref={el} class="d_view-tab">
          <div class={['d_view-tab__tab', isSticky.value && 'sticky']} style={style.value}>
            <ScrollTab current={current.value}>
              <div
                style={topScrollTitleStyle.value}
                class={[
                  'd_view-tab__list',
                  props.config.itemStyle?.placement == 'right' && 'hideAfterEle'
                ]}
              >
                {list.value.map((item, index) => {
                  if (!item) {
                    return null
                  }

                  const iconVisible =
                    props.config.style.iconVisible === 'sticky'
                      ? !!isSticky.value
                      : true

                  return (
                    <ScrollTabItem>
                      <div
                        class={['d_view-tab__item clickable', index === current.value && 'active']}
                        onClick={withModifiers(() => {
                          onToggle(index)
                        }, ['stop'])}
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
          <div class="d_view-tab__view">
            {currentView.value && (
              <ComponentItem pure comp={currentView.value} config={currentView.value.config} />
            )}
          </div>
        </div>
      )
    }
  }
})
