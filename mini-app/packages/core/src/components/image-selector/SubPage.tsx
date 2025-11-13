import { computed, defineComponent, onMounted, onUnmounted, type PropType, type Ref, ref } from 'vue'
import './sub-page.scss'
import test from '../../utils/test'
import { Icon } from '@anteng/ui'
import usePreviewImage from '../../hooks/useImagePreview'
import type { ImageDefine } from './Resource'
import useAudioPreview from '../../hooks/useAudioPreview'
import useVideoPreview from '../../hooks/useVideoPreview'
import { withImageResize } from '../../utils'
import { clamp } from 'lodash'
import { useComputedValue } from '../../hooks/useComputedValue'

function formatDuration(durationInSeconds: number): string {
  const minutes: number = Math.floor(durationInSeconds / 60)
  const seconds: number = Math.round(durationInSeconds % 60)

  // 使用 String.prototype.padStart() 方法确保分钟和秒钟始终是两位数
  const formattedMinutes: string = String(minutes).padStart(2, '0')
  const formattedSeconds: string = String(seconds).padStart(2, '0')

  return `${formattedMinutes}:${formattedSeconds}`
}

const SubPage = defineComponent({
  name: 'LegoResourceSubPage',
  props: {
    title: String,
    data: {
      type: [Array, Object] as PropType<
        | {
        url: string
        width: number
        height: number
        /** 资源路径（不含协议与域名） */
        uri?: string
        name?: string
        alias?: string
      }[]
        | Ref<any[]>
      >,
      default: () => []
    },
    col: {
      type: Number,
      default: 4
    }
  },
  emits: {
    select: (image: ImageDefine) => {
      return true
    }
  },
  setup(props, { emit }) {
    const gapRef = ref(12)
    const colRef = ref(clamp(props.col, 2, 6))
    const padding = 8

    const dataSource = useComputedValue(props.data)

    const size = clamp(colRef.value * 5, 20, 40)
    const current = ref(1)
    const total = computed(() => size * current.value)

    const loadMore = () => {
      !isEnd.value && current.value++
    }

    const isEnd = computed(() => {
      return total.value >= dataSource.value.length
    })

    const images = computed(() => {
      return dataSource.value.slice(0, current.value * size)
    })

    const anchorRef = ref<HTMLElement>()
    let observer: IntersectionObserver
    let resizeObserver: ResizeObserver

    onMounted(() => {
      // 创建 IntersectionObserver 实例
      const options = {
        root: scrollerRef.value!.parentElement, // 观察的根元素
        rootMargin: '0px', // 根元素的边距
        threshold: 0 // 当触发元素完全进入视口时触发
      }

      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadMore()
          }
        })
      }, options)

      // 获取触发元素并开始观察
      observer.observe(anchorRef.value!)

      scrollerWidth.value = (scrollerRef.value?.offsetWidth || 618) - 12

      resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.contentRect.width > 0) {
            reCalcLayout()
          }
        })
      })

      resizeObserver.observe(scrollerRef.value!)
    })

    onUnmounted(() => {
      observer.disconnect()
      resizeObserver.disconnect()
    })

    const scrollerRef = ref<HTMLElement>()

    const scrollerWidth = ref<number>(0)

    let reCalcTimer: NodeJS.Timeout
    const reCalcLayout = () => {
      clearTimeout(reCalcTimer)
      reCalcTimer = setTimeout(() => {
        scrollerWidth.value = (scrollerRef.value?.offsetWidth || 618) - 12
      }, 100)
    }

    const list = computed(() => {
      if (!scrollerRef.value) {
        return []
      }
      const gap = gapRef.value
      const col = colRef.value
      // FIXME 这里display:none 导致获取宽度为 0

      const heightMaps = new Array(col).fill(-gap)
      const rowMaps = new Array(col).fill(0)
      const itemWidth = (scrollerWidth.value - gap * (col - 1)) / col
      const xMaps = new Array(col).fill(0).map((_, i) => (itemWidth + gap) * i)
      return images.value.map((item) => {
        const c = heightMaps.indexOf(Math.min(...heightMaps))
        rowMaps[c]++
        const y = heightMaps[c] + gap
        const h = ((itemWidth - padding * 2) / (item.width || 50)) * (item.height || 50) + padding * 2
        heightMaps[c] += h + gap
        return {
          ...item,
          c,
          r: rowMaps[c],
          w: itemWidth,
          h,
          x: xMaps[c],
          y
        }
      })
    })

    const scrollerHeight = computed(() => {
      const lastOne = list.value[list.value.length - 1]
      if (!lastOne) {
        return ''
      }
      return lastOne.y + lastOne.h + gapRef.value
    })

    return () => (
      <div class="image-selector__sub-page ui-scrollbar" ref={scrollerRef}>
        {/* <button onClick={() => colRef.value++}>+</button>
        <button onClick={() => colRef.value--}>-</button> */}
        <div
          class="image-selector__waterfall"
          style={{
            height: `${scrollerHeight.value}px`
          }}
        >
          {list.value.map((item) => {
            const isVideo = test.video(item.url)
            const isAudio = test.audio(item.url)
            const style = {
              width: `${item.w}px`,
              height: `${item.h}px`,
              left: `${item.x}px`,
              top: `${item.y}px`
            }
            return (
              <div key={item.url} class="image-selector__item" style={style}>
                {isVideo && <div class="lego-resource__badge">视频</div>}
                {isAudio && <div class="lego-resource__badge">音频</div>}
                {isVideo ? (
                  <video src={item.url} autoplay={false}/>
                ) : isAudio ? (
                  <div class="lego-resource__audio">
                    <div class="play"></div>
                    <div class="cnt">
                      <div class="duration">{formatDuration(item.duration)}</div>
                      <div class="track"></div>
                    </div>
                  </div>
                ) : (
                  <img src={withImageResize(item.url, { w: 200, h: 200 })} alt=""/>
                )}
                <div class="lego-resource__layer">
                  <div
                    class="handler-button clickable"
                  onClick={() => {
                    emit('select', {
                      url: item.url,
                      width: item.width,
                      height: item.height,
                      uri: item.uri
                    })
                  }}
                >
                    <Icon class="icon" name="ok-bold"></Icon>
                    <span>{'选择'}</span>
                  </div>
                  <div
                    class="handler-button clickable"
                    onClick={() => {
                      if (isVideo) {
                        // TODO 优化视频预览
                        useVideoPreview({ url: item.url })
                        return void 0
                      }
                      if (isAudio) {
                        useAudioPreview({ url: item.url })
                        return void 0
                      }
                      usePreviewImage({ url: item.url })
                    }}
                  >
                    <Icon class="icon" name="preview"></Icon>
                    <span>预览</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div class="anchor" ref={anchorRef} onClick={loadMore}>
          {isEnd.value ? '没有更多了' : '点击加载更多'}
        </div>
      </div>
    )
  }
})

export default SubPage
