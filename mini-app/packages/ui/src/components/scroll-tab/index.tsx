import { ScrollView } from '@tarojs/components'
import { defineComponent, onMounted, ref, watch } from 'vue'
import './style.scss'
import Taro from '@tarojs/taro'
import { uuid } from '@pkg/utils'

export const ScrollTabItem = (props, { slots }) => {
  const cnt = slots.default?.()
  if (!cnt) return null
  return <div class="ice-scroll-tab__item">{cnt}</div>
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
    const id = `scroll-tab-${uuid()}`
    const containerRef = ref()
    const query = Taro.createSelectorQuery()
    query.select(`.${id}`).boundingClientRect()
    if (process.env.TARO_ENV === 'h5') {
      query.selectAll(`.${id} .ice-scroll-tab__item`).boundingClientRect()
    } else {
      // 小程序端 跨组件需要加 >>> 选择器
      query.selectAll(`.${id} >>> .ice-scroll-tab__item`).boundingClientRect()
    }
    query.select(`.${id} .ice-scroll-tab__scroll`).scrollOffset()

    const autoFit = () => {
      if (containerRef.value?.ctx) {
        query.in(containerRef.value.ctx)
      }
      query.exec(res => {
        const item = res[1]?.[props.current]
        // console.log(res[0], res[1], res[2].scrollLeft)
        if (!item) return void 0
        if (props.vertical) {
          const height = res[0].height
          const top = res[0].top
          const ratio = props.ratio
          const gap = ratio > 1 || ratio < -1 ? ratio : ratio * height
          scrollTop.value = res[2].scrollTop + item.top - gap - top
        } else {
          const width = res[0].width
          const left = res[0].left
          const item = res[1]?.[props.current]
          const ratio = props.ratio
          const gap = ratio > 1 || ratio < -1 ? ratio : ratio * width
          scrollLeft.value = res[2].scrollLeft + item.left - gap - left
        }
        // console.log(scrollLeft.value)
      })
    }

    onMounted(autoFit)

    watch(() => props.current, autoFit)

    const scrollLeft = ref(0)
    const scrollTop = ref(0)

    return () => {
      return (
        <div class={['ice-scroll-tab', id, props.vertical && 'ice-scroll-tab--vertical']} ref={containerRef}>
          <ScrollView
            class="ice-scroll-tab__scroll"
            scrollX={!props.vertical}
            scrollY={props.vertical}
            scrollLeft={scrollLeft.value}
            scrollTop={scrollTop.value}
            scrollWithAnimation
          >
            <div class="ice-scroll-tab__content">{slots.default?.()}</div>
          </ScrollView>
        </div>
      )
    }
  }
})
