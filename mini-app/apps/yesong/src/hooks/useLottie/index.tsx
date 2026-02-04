import { uuid } from '@pkg/utils'
import { Canvas } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { defineComponent, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import './style.scss'

let lottie
if (process.env.TARO_ENV === 'weapp') {
  lottie = require('lottie-miniprogram')
} else if (process.env.TARO_ENV === 'h5') {
  lottie = require('lottie-web')
}

export const Lottie = defineComponent({
  name: 'Lottie',
  props: {
    animationData: {
      type: Object,
      required: true
    },

    autoplay: {
      type: Boolean,
      default: false
    },
    loop: {
      type: Boolean,
      default: false
    },
    segments: {
      type: Array as unknown as () => [number, number]
    }
  },
  emits: {
    load: (ani: any) => true
  },
  setup(props, { expose, emit }) {
    const canvasId = `lottie_${uuid()}`

    const load = () => {
      if (process.env.TARO_ENV === 'weapp') {
        Taro.createSelectorQuery()
          .select(`#${canvasId}`)
          .node()
          .exec(res => {
            const canvas = res[0].node
            canvas.width = 375 * 4
            canvas.height = 375 * 4
            const ctx = canvas.getContext('2d')
            lottie.setup(canvas)
            const ani = lottie.loadAnimation({
              autoplay: props.autoplay,
              loop: props.loop,
              animationData: props.animationData,
              rendererSettings: {
                context: ctx
              }
            })
            commonHandler(ani)
          })
      } else if (process.env.TARO_ENV === 'h5') {
        const ani = lottie.loadAnimation({
          container: document.getElementById(canvasId),
          autoplay: props.autoplay,
          loop: props.loop,
          animationData: props.animationData
        })
        commonHandler(ani)
      }
    }

    const commonHandler = (ani: any) => {
      try {
        emit('load', ani)
      } catch (err) {}
      if (props.segments) {
        ani.setSegment(...props.segments)
      }
    }

    onMounted(() => {
      load()
    })

    expose({})

    return () => {
      return (
        <div class="c_lottie">
          {process.env.TARO_ENV === 'weapp' ? (
            <Canvas class={['c_lottie__canvas', canvasId]} id={canvasId} canvasId={canvasId} type="2d" />
          ) : (
            <div class={['c_lottie__canvas', canvasId]} id={canvasId} />
          )}
        </div>
      )
    }
  }
})

const useLottie = (
  options: ({ path?: string; animationData: any } | { path: string; animationData?: any }) & {
    loop?: boolean
    autoplay?: boolean
  }
) => {
  const animationRef = shallowRef()

  const LottieCanvas = defineComponent({
    setup() {
      const canvasRef = ref()

      onUnmounted(() => {
        // 组件卸载时销毁动画，释放内存
        animationRef.value?.destroy()
      })

      return () => {
        return (
          <Lottie
            ref={canvasRef}
            animationData={options.animationData}
            loop={options.loop}
            autoplay={options.autoplay}
            onLoad={ani => {
              animationRef.value = ani
            }}
          />
        )
      }
    }
  })

  return {
    LottieCanvas,
    animationRef
  }
}

export default useLottie
