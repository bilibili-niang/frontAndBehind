import { computed, defineComponent, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { Tooltip } from '@pkg/ui'
import { clamp } from 'lodash'
import './style.scss'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { getWidgetConfig } from '../../../../utils/widget'
import type { ObjectSchema } from '../../../../types/schema'
import { getObjectOrderedPropetiesRef, useObjectFiled } from '../../../../utils/field'

export default defineComponent({
  name: 'Widget_Menu',
  props: CommonWidgetPropsDefine,
  setup(props, { slots }) {
    const container = ref<HTMLElement>()
    const tracker = ref<HTMLElement>()
    const top = ref(0)
    const offset = ref(0)
    const inner = ref(!getWidgetConfig(props.schema, 'outer'))
    const sticky = ref(false)

    const tabStyle = computed(() => {
      return `
        top: ${top.value - 48}px;
      `
    })

    const offsetStyle = computed(() => {
      return `
        transform: translate3d(-100%, -${offset.value}px, 0);
        max-height: calc(100vh - ${top.value}px + ${offset.value}px - 36px);
      `
    })

    // TODO 封装成解析 schema
    // 进行排序
    const propertiesRef = computed(() => {
      const schema = props.schema as ObjectSchema
      const list = getObjectOrderedPropetiesRef(props).value
      return list.map((key) => {
        return {
          key,
          title: (schema.properties![key] as any).title as string,
          icon: getWidgetConfig(schema.properties![key], 'icon')
        }
      })
    })

    // TODO 优化横向滚动，支持在滚动静止后一定时间回显active项

    onMounted(() => {
      const containerTop = container.value?.getBoundingClientRect().top
      top.value = containerTop ?? top.value
      const scroller = document.querySelector('.lego-config-content')

      const masOffset = (document.querySelector('.config-basic-attrs') as HTMLElement)?.offsetHeight ?? 100

      if (!inner.value && scroller) {
        const onContainerScroll = () => {
          offset.value = clamp(scroller.scrollTop, 0, masOffset)
        }
        scroller.addEventListener('scroll', onContainerScroll)
        onUnmounted(() => {
          scroller.removeEventListener('scroll', onContainerScroll)
        })
      }

      inner.value &&
      tracker.value!.addEventListener('mousewheel', function scrollHorizontally(e: any) {
        e = window.event || e
        const delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail))
        tracker.value!.style.scrollBehavior = 'auto'
        tracker.value!.scrollLeft -= delta * 4 // Multiplied by 40
        tracker.value!.style.scrollBehavior = 'smooth'
        e.preventDefault()
      })

      toggle(0)
    })

    const currentIndex = ref(0)
    const activeStyle = ref('')
    const toggle = (index: number) => {
      currentIndex.value = index
      nextTick(() => {
        const el = container.value?.querySelector('.widget-menu__item.--active') as HTMLElement

        if (inner.value) {
          activeStyle.value = `
            transform: translate3d(${el.offsetLeft}px, -50%, 0);
            width: ${el.offsetWidth}px;
          `
          tracker.value?.scrollTo(el.offsetLeft - 24, 0)
        } else {
          activeStyle.value = `
            transform: translate3d(-50%, ${el.offsetTop}px, 0);
            height: ${el.offsetHeight}px;
          `
          tracker.value?.scrollTo(0, el.offsetTop - 24)
        }
      })
    }

    const { CommonObjectFieldContent } = useObjectFiled(props)

    return () => {
      const properties = propertiesRef.value
      return (
        <div class={['jsf-widget-menu', inner.value && '--inner']} ref={container}>
          <div
            class={['widget-menu__tab ui-scrollbar--hidden', sticky.value && '--sticky']}
            ref={tracker}
            style={[tabStyle.value, offsetStyle.value]}
          >
            <div class="widget-menu__active-bar" style={activeStyle.value}></div>
            {properties.map((item, index) => {
              const isActive = index === currentIndex.value
              return (
                <Tooltip
                  open={isActive || inner.value ? false : undefined}
                  title={item.title}
                  mouseEnterDelay={0}
                  mouseLeaveDelay={0}
                  placement={inner.value ? 'bottom' : 'left'}
                >
                  <div class={['widget-menu__item clickable', isActive && '--active']} onClick={() => toggle(index)}>
                    {(!isActive || inner.value) && item.icon && (
                      <iconpark-icon class="jsf-icon" name={item.icon}></iconpark-icon>
                    )}
                    {(isActive || inner.value || !item.icon) && item.title.split('').map((word) => <span>{word}</span>)}
                  </div>
                </Tooltip>
              )
            })}
          </div>
          <div class="jsf-widget-menu__content">{CommonObjectFieldContent.value[currentIndex.value]}</div>
        </div>
      )
    }
  }
})
