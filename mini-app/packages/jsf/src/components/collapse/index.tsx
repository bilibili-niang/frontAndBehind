import { defineComponent, nextTick, onMounted, ref, watch, withModifiers } from 'vue'
import './style.scss'
import { Icon } from '@anteng/ui'

export default defineComponent({
  name: 'jsf_collapse',
  props: {
    title: {},
    prefix: {},
    toolbar: {},
    header: {},
    visible: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
    // stickyTop: {
    //   type: Number,
    //   default: 0
    // }
  },
  // slots: ['prefix', 'title', 'header'],
  emits: ['change', 'click'],
  setup(props, { slots, emit }) {
    const visible = ref(props.disabled ? false : props.visible)

    const trigger = () => {
      if (visible.value !== props.visible) {
        emit('change', visible.value)
      }
    }

    // 因为可能存在禁用的冲突，立刻触发change
    trigger()

    onMounted(() => {
      // 默认展开？
      if (visible.value) {
        handleToggle()
      }
    })

    watch(
      () => props.visible,
      () => {
        visible.value = props.visible
      }
    )

    const rendered = ref(false)

    const toggle = (flag = !visible.value) => {
      emit('click')
      if (props.disabled) {
        return false
      }
      visible.value = flag
    }

    const contentRef = ref<HTMLDivElement>()
    let transitionFallbackTimer: number | null = null

    const clearFallbackTimer = () => {
      if (transitionFallbackTimer) {
        window.clearTimeout(transitionFallbackTimer)
        transitionFallbackTimer = null
      }
    }

    const handleTransitionend = () => {
      // FIXME 如果展开高度仍然为 0 则不会触发！
      contentRef.value?.removeAttribute('collapse-transition')
      rendered.value = visible.value
      nextTick(() => {
        if (contentRef.value) {
          contentRef.value.style.height = ''
        }
      })
      clearFallbackTimer()
    }

    const handleToggle = () => {
      trigger()
      if (visible.value) {
        rendered.value = true
        nextTick(() => {
          if (!contentRef.value) return
          contentRef.value.style.height = '0px'
          contentRef.value.setAttribute('collapse-transition', 'true')
          nextTick(() => {
            if (!contentRef.value) return
            const h = contentRef.value.scrollHeight
            contentRef.value.style.height = `${h}px`
            if (h === 0) {
              handleTransitionend()
            } else {
              // Fallback：某些情况下 transitionend 不触发，保证还原高度
              clearFallbackTimer()
              transitionFallbackTimer = window.setTimeout(() => {
                // 如果仍处于过渡状态，则手动完成
                if (contentRef.value && contentRef.value.getAttribute('collapse-transition') === 'true') {
                  handleTransitionend()
                }
              }, 300)
            }
          })
        })
      } else {
        if (!contentRef.value) return
        contentRef.value.style.height = `${contentRef.value.scrollHeight}px`
        contentRef.value.setAttribute('collapse-transition', 'true')
        nextTick(() => {
          // 读取一次触发布局
          contentRef.value!.offsetHeight
          contentRef.value!.style.height = '0px'
        })
      }
    }

    watch(visible, handleToggle)

    return () => {
      return (
        <div class={['jsf-collapse', !visible.value && 'jsf-collapse--collapsed', props.disabled && '--disabled']}>
          <div class="jsf-collapse__header">
            <div class="jsf-collapse__header-content clickable" onClick={() => toggle()}>
              <span class="jsf_form-item__prefix" onClick={withModifiers(() => {
              }, ['stop'])}>
               {slots.prefix?.() || props.prefix}
              </span>
              <span class="jsf-collapse__label jsf_form-item__label">{slots.title?.() || props.title}</span>
              <div class="jsf-collapse__toolbar" onClick={(e) => e.stopPropagation()}>
                {slots.toolbar?.() || props.toolbar}
              </div>
              <Icon
                class="jsf-collapse__drop-arrow"
                name="right-solid"
                style={`transform: rotate(${!visible.value ? 0 : 90}deg)`}
              />
            </div>
            <div class="jsf-collapse__header-slot">{slots.header?.() || props.header}</div>
          </div>
          {/* </Affix> */}
          {rendered.value && (
            <div ref={contentRef} class="jsf-collapse__content-wrapper" onTransitionend={handleTransitionend}>
              <div class="jsf-collapse__content" onTransitionend={(e) => e.stopPropagation()}>
                {slots.default?.()}
              </div>
            </div>
          )}
        </div>
      )
    }
  }
})
