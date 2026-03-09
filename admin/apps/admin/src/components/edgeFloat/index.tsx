import type { PropType } from 'vue'
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import { EdgeFloatProps } from './types'
import {
  combineStyles,
  getPositionStyles,
  getRoundedStyles,
  getShadowStyles,
  getThemeStyles,
  isMouseAtEdge
} from './utils'

/**
 * EdgeFloat - 边缘浮现组件
 *
 * 支持四个方向的边缘浮现效果，可配置为浮动或静态模式
 */
export default defineComponent({
  name: 'EdgeFloat',
  props: {
    direction: {
      type: String as PropType<EdgeFloatProps['direction']>,
      required: true
    },
    mode: {
      type: String as PropType<EdgeFloatProps['mode']>,
      default: 'float'
    },
    defaultVisible: {
      type: Boolean,
      default: false
    },
    threshold: {
      type: Object as PropType<EdgeFloatProps['threshold']>,
      // 默认触发距离和隐藏延迟
      default: () => ({ triggerDistance: 80, hideDelay: 300 })
    },
    className: {
      type: String,
      default: ''
    },
    animationDuration: {
      type: Number,
      default: 300
    },
    backdrop: {
      type: Boolean,
      default: false
    },
    rounded: {
      type: String as PropType<EdgeFloatProps['rounded']>,
      default: 'md'
    },
    shadow: {
      type: String as PropType<EdgeFloatProps['shadow']>,
      default: 'lg'
    },
    theme: {
      type: String as PropType<EdgeFloatProps['theme']>,
      default: 'light'
    },
    // 边缘提示（光晕）相关
    hint: { type: Boolean, default: true },
    hintLength: { type: Number, default: undefined },
    hintThickness: { type: Number, default: undefined },
    hintColor: { type: String, default: 'bg-blue-500' },
    hintCoverage: { type: Number, default: 30 },
    hintBlur: { type: Number, default: 14 },
    hintAnimationDuration: { type: Number, default: 2800 },
    onVisibilityChange: {
      type: Function as PropType<EdgeFloatProps['onVisibilityChange']>,
      default: undefined
    }
  },
  setup(props, { slots, emit }) {
    // 初始化可见性：静态模式默认可见，浮动模式由 defaultVisible 控制
    const isVisible = ref(props.mode === 'static' ? true : props.defaultVisible)
    const isHovered = ref(false)
    const hideTimeoutRef = ref<NodeJS.Timeout>()
    const containerRef = ref<HTMLDivElement>()

    // 使用更新后的默认值作为回退
    const triggerDistance = computed(() => props.threshold?.triggerDistance || 80)
    const hideDelay = computed(() => props.threshold?.hideDelay || 300)

    // 获取样式配置
    const positionStyles = computed(() => getPositionStyles(props.direction))
    const themeStyles = computed(() => getThemeStyles(props.theme))
    const roundedStyles = computed(() => getRoundedStyles(props.rounded))
    const shadowStyles = computed(() => getShadowStyles(props.shadow))

    // 显示组件
    const showComponent = () => {
      if (hideTimeoutRef.value) {
        clearTimeout(hideTimeoutRef.value)
        hideTimeoutRef.value = undefined
      }
      if (!isVisible.value) {
        isVisible.value = true
        props.onVisibilityChange?.(true)
        emit('visibility-change', true)
      }
    }

    // 隐藏组件
    const hideComponent = () => {
      if (props.mode === 'static') return
      hideTimeoutRef.value = setTimeout(() => {
        isVisible.value = false
        props.onVisibilityChange?.(false)
        emit('visibility-change', false)
      }, hideDelay.value)
    }

    // 鼠标移动事件处理
    const handleMouseMove = (event: MouseEvent) => {
      if (props.mode !== 'float') return
      const { clientX, clientY } = event
      const atEdge = isMouseAtEdge(props.direction, clientX, clientY, triggerDistance.value)
      if (atEdge) {
        showComponent()
      } else if (!isHovered.value) {
        hideComponent()
      }
    }

    // 组件悬停事件处理
    const handleMouseEnter = () => {
      isHovered.value = true
      if (props.mode === 'float') {
        showComponent()
      }
    }

    const handleMouseLeave = () => {
      isHovered.value = false
      if (props.mode === 'float') {
        hideComponent()
      }
    }

    // 背景点击处理
    const handleBackdropClick = () => {
      if (props.mode === 'float') {
        hideComponent()
      }
    }

    // 设置事件监听器
    onMounted(() => {
      if (props.mode === 'float') {
        document.addEventListener('mousemove', handleMouseMove)
      }
    })

    onUnmounted(() => {
      if (props.mode === 'float') {
        document.removeEventListener('mousemove', handleMouseMove)
        if (hideTimeoutRef.value) {
          clearTimeout(hideTimeoutRef.value)
        }
      }
    })

    // 静态模式下的可见性控制
    watch(() => [props.mode, props.defaultVisible], () => {
      if (props.mode === 'static') {
        isVisible.value = props.defaultVisible
      }
    })

    // 容器样式
    const containerClasses = computed(() => combineStyles(
      props.mode === 'float' ? positionStyles.value.container : 'relative',
      props.mode === 'float' && isVisible.value ? positionStyles.value.transform.visible : '',
      props.mode === 'float' && !isVisible.value ? positionStyles.value.transform.hidden : '',
      props.className
    ))

    // 内容样式
    const contentClasses = computed(() => combineStyles(
      props.mode === 'float' ? positionStyles.value.content : 'w-full h-auto',
      themeStyles.value,
      roundedStyles.value,
      shadowStyles.value,
      'p-4 transition-all',
      props.backdrop ? 'backdrop-blur-sm' : ''
    ))

    // 动画样式
    const animationStyle = computed(() => ({
      transitionDuration: `${props.animationDuration}ms`
    }))

    // 视口尺寸用于百分比覆盖
    const viewportW = ref(typeof window !== 'undefined' ? window.innerWidth : 0)
    const viewportH = ref(typeof window !== 'undefined' ? window.innerHeight : 0)

    // 提示光晕尺寸：优先使用显式像素长度，否则按覆盖百分比计算
    const hintLength = computed(() => {
      const isHorizontal = props.direction === 'top' || props.direction === 'bottom'
      if (props.hintLength) return props.hintLength
      const base = isHorizontal ? viewportW.value : viewportH.value
      return Math.round((props.hintCoverage ?? 30) / 100 * base)
    })
    const hintThickness = computed(() => props.hintThickness ?? 8)

    // 光晕定位样式
    const hintClasses = computed(() => {
      const common = combineStyles('fixed z-[9999] pointer-events-none rounded-full', props.hintColor)
      switch (props.direction) {
        case 'top':
          return combineStyles(common, 'top-0 left-1/2 -translate-x-1/2')
        case 'bottom':
          return combineStyles(common, 'bottom-0 left-1/2 -translate-x-1/2')
        case 'left':
          return combineStyles(common, 'left-0 top-1/2 -translate-y-1/2')
        case 'right':
          return combineStyles(common, 'right-0 top-1/2 -translate-y-1/2')
        default:
          return common
      }
    })

    // 光晕样式（宽高 + 低速脉动动画 + 模糊）
    const hintStyle = computed(() => {
      const isHorizontal = props.direction === 'top' || props.direction === 'bottom'
      return {
        width: isHorizontal ? `${hintLength.value}px` : `${hintThickness.value}px`,
        height: isHorizontal ? `${hintThickness.value}px` : `${hintLength.value}px`,
        animation: `edge-hint-pulse ${props.hintAnimationDuration ?? 2800}ms ease-in-out infinite`,
        opacity: 0.4,
        filter: `blur(${props.hintBlur ?? 14}px)`
      } as any
    })

    // 视口尺寸监听（用于百分比覆盖）
    let onResize: (() => void) | null = null
    onMounted(() => {
      onResize = () => {
        viewportW.value = window.innerWidth
        viewportH.value = window.innerHeight
      }
      onResize()
      window.addEventListener('resize', onResize)
      if (props.mode === 'float') {
        document.addEventListener('mousemove', handleMouseMove)
      }
    })

    onUnmounted(() => {
      if (onResize) {
        window.removeEventListener('resize', onResize)
        onResize = null
      }
      if (props.mode === 'float') {
        document.removeEventListener('mousemove', handleMouseMove)
      }
    })

    return () => (
      <>
        {/* 注入一次 keyframes */}
        <style>
          {`
          @keyframes edge-hint-pulse {
            0%, 100% { opacity: 0.32; }
            50% { opacity: 0.52; }
          }
          `}
        </style>

        {/* 背景遮罩 (仅浮动模式且启用backdrop时显示) */}
        {props.mode === 'float' && props.backdrop && isVisible.value && (
          <div
            class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={handleBackdropClick}
          />
        )}

        {/* 边缘提示条：仅浮动模式且当前不可见时显示 */}
        {props.mode === 'float' && props.hint && !isVisible.value && (
            <div
              class={hintClasses.value}
              style={{
                ...hintStyle.value,
                background:
                  props.direction === 'top'
                    ? `linear-gradient(to bottom, color-mix(in oklab, var(--ice-color-primary-500, var(--v-theme-primary, #3b82f6)) 60%, transparent) 0%, transparent 100%)`
                    : props.direction === 'bottom'
                      ? `linear-gradient(to top, color-mix(in oklab, var(--ice-color-primary-500, var(--v-theme-primary, #3b82f6)) 60%, transparent) 0%, transparent 100%)`
                      : props.direction === 'left'
                        ? `linear-gradient(to right, color-mix(in oklab, var(--ice-color-primary-500, var(--v-theme-primary, #3b82f6)) 60%, transparent) 0%, transparent 100%)`
                        : `linear-gradient(to left, color-mix(in oklab, var(--ice-color-primary-500, var(--v-theme-primary, #3b82f6)) 60%, transparent) 0%, transparent 100%)`
              }}
            />
          )}

        {/* 主容器 */}
        <div
          ref={containerRef}
          class={containerClasses.value}
          style={animationStyle.value}
          onMouseenter={handleMouseEnter}
          onMouseleave={handleMouseLeave}
        >
          <div class={contentClasses.value}>
            {slots.default?.()}
          </div>
        </div>
      </>
    )
  }
})