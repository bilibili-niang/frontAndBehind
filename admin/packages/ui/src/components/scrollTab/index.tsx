import { defineComponent, onMounted, ref, watch } from 'vue'
import './style.scss'

export const ScrollTabItem = (props: any, { slots }: any) => {
  const cnt = slots.default?.()
  if (!cnt) return null
  return <div class="anteng-scroll-tab__item">{cnt}</div>
}

export default defineComponent({
  name: 'ScrollTab',
  props: {
    current: {
      type: Number,
      required: true
    },
    /** 范围 [-1, 1] 时作为百分比 * 滚动尺寸，否则直接作为距离 */
    ratio: {
      type: Number,
      default: 0.2
    },
    /** 纵向滚动 */
    vertical: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { slots }) {
    const id = `scroll-tab-${Math.round(Math.random() * 10000)}`
    const containerRef = ref()

    const autoFit = () => {
      ;(
        [].slice.call(containerRef.value.querySelectorAll('.anteng-scroll-tab__item'))[props.current] as HTMLElement
      )?.scrollIntoView({
        behavior: 'smooth',
        inline: props.vertical ? 'nearest' : 'center',
        block: props.vertical ? 'center' : 'nearest'
      })
    }

    onMounted(autoFit)

    watch(() => props.current, autoFit)

    return () => {
      return (
        <div class={['anteng-scroll-tab', id, props.vertical && 'anteng-scroll-tab--vertical']} ref={containerRef}>
          <div class="anteng-scroll-tab__scroll ui-scrollbar--hidden">
            <div class="anteng-scroll-tab__content">{slots.default?.()}</div>
          </div>
        </div>
      )
    }
  }
})
