import { uuid } from '@anteng/utils'
import Taro from '@tarojs/taro'
import { defineComponent, onMounted, onUnmounted } from 'vue'
import { throttle } from 'lodash-es'

export default defineComponent({
  name: '',
  props: {
    threshold: {
      type: Number,
      default: 0.15
    }
  },
  emits: {
    reach: () => true
  },
  setup(props, { emit }) {
    const id = `scroll-anchor-${uuid()}`

    const observer = Taro.createIntersectionObserver(Taro.getCurrentInstance().page!)

    // FIXME h5 scrollView 貌似无法触发。

    onMounted(() => {
      observer.relativeToViewport({ bottom: 300 }).observe(`.${id}`, res => {
        if (res.intersectionRatio > 0) {
          onReach()
        }
        // console.log(res)
        // res.intersectionRatio // 相交区域占目标节点的布局区域的比例
        // res.intersectionRect // 相交区域
        // res.intersectionRect.left // 相交区域的左边界坐标
        // res.intersectionRect.top // 相交区域的上边界坐标
        // res.intersectionRect.width // 相交区域的宽度
        // res.intersectionRect.height // 相交区域的高度
      })
    })

    onUnmounted(() => {
      observer.disconnect()
    })

    const onReach = throttle(() => {
      emit('reach')
    }, 100)

    return () => {
      return (
        <div
          id={id}
          style={{
            height: '100px',
            marginTop: '-100px',
            opacity: 0,
            pointerEvents: 'none',
            position: 'relative',
            zIndex: -1
          }}
          class={['c_scroll-anchor', id]}
        >
          ...
        </div>
      )
    }
  }
})
