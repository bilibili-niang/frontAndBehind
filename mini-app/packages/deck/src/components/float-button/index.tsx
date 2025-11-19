import { PropType, Ref, computed, defineComponent, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import './style.scss'
import { withUnit } from '@anteng/utils'
import { clamp } from 'lodash-es'
import { useAction } from '../../hooks/useAction'

export default defineComponent({
  name: 'c_float-button',
  props: {
    config: {
      type: Object as PropType<any>,
      required: true
    }
  },
  setup(props) {
    const list = computed<any[]>(() => {
      return props.config.list || []
    })
    const isHorizontal = computed(() => {
      return props.config.placement?.startsWith('bottom')
    })

    const style = computed(() => {
      return {
        padding: `${withUnit(props.config?.padding?.top)} ${withUnit(props.config?.padding?.right)}`,
        '--out-opacity': (props.config?.collapse?.opacity ?? 30) / 100,
        '--out-offset': `calc(${props.config?.collapse?.offset ?? 90}% + ${withUnit(
          isHorizontal.value ? props.config?.padding?.right || 0 : props.config?.padding?.top || 0
        )})`
      }
    })

    const itemStyle = computed(() => {
      const { x = 0, y = 0 } = props.config?.offset ?? {}
      return {
        width: withUnit(props.config.size),
        height: withUnit(props.config.size),
        borderRadius: props.config.borderRadius?.map((i: number) => withUnit(i)).join(' '),
        backgroundColor: props.config.backgroundColor,
        filter: `drop-shadow(0 0 ${withUnit(12 * ((props.config.shadow?.length || 30) / 100))} ${
          props.config.shadow?.color || 'rgba(0, 0, 0, 0.3)'
        })`,
        transform: `translate3d(${withUnit(x || 0)}, ${withUnit(y || 0)}, 0)`
      }
    })
    const gapStyle = computed(() => {
      return {
        width: withUnit(props.config.gap),
        height: withUnit(props.config.gap)
      }
    })

    onMounted(() => {
      document.querySelector('.deck-editor-render__viewport')?.addEventListener('scroll', onScroll)
    })

    const scrollTop: Ref<number> = inject('scrollTopRef') || ref(0)
    const isScrolling = ref(false)
    let scrollTimer: NodeJS.Timeout
    watch(
      () => scrollTop.value,
      () => {
        if (props.config.collapse?.enable === false) {
          return void 0
        }
        isScrolling.value = true
        clearTimeout(scrollTimer)
        scrollTimer = setTimeout(() => {
          isScrolling.value = false
        }, clamp(props.config.collapse?.delay * 1000, 1000, 3000))
      }
    )

    const onScroll = (e: any) => {
      scrollTop.value = (e.target as HTMLElement).scrollTop
    }

    const visible = computed(() => {
      const offset = props.config.scrollTop
      if (offset > 0) {
        return scrollTop.value >= offset
      }
      return true
    })

    onBeforeUnmount(() => {
      document.querySelector('.deck-editor-render__viewport')?.addEventListener('scroll', onScroll)
    })

    return () => {
      return (
        <div
          class={[
            'c_float-button',
            props.config.placement,
            isHorizontal.value && 'horizontal',
            !visible.value && 'c_float-button--hidden',
            isScrolling.value && 'c_float-button--scrolling'
          ]}
          style={style.value}
        >
          <div class={['c_float-button__content', props.config?.collapse?.mode]}>
            {list.value?.map((item, index, arr) => {
              const sizeStyle = item.customSizeEnable
                ? {
                    width: withUnit(item.customSize?.width || props.config.size),
                    height: withUnit(item.customSize?.height || props.config.size)
                  }
                : {}
              return (
                <>
                  <div
                    class="c_float-button__item"
                    style={{ ...itemStyle.value, ...sizeStyle }}
                    onClick={() => {
                      useAction(item?.action)
                    }}
                  >
                    {item?.image?.url && <img class="c_float-button__image" src={item.image.url} />}
                  </div>
                  {index < arr.length - 1 && <div class="c_float-button__gap" style={gapStyle.value}></div>}
                </>
              )
            })}
          </div>
        </div>
      )
    }
  }
})
