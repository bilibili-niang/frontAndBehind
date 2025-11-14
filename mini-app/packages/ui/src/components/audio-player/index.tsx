import { computed, defineComponent, onUnmounted, PropType, ref, watch, withModifiers } from 'vue'
import './style.scss'
import { clamp } from 'lodash-es'
import Taro from '@tarojs/taro'
import Icon from '../icon'
import { uuid } from '@anteng/utils'

const secondsToString = (seconds: number) => {
  const mm = Math.floor(seconds / 60)
  const ss = Math.round(seconds % 60)
  const mmString = mm.toString().padStart(2, '0')
  const ssString = ss.toString().padStart(2, '0')
  return [mmString, ssString]
}

export default defineComponent({
  name: 'c_audio-player',
  props: {
    theme: {
      type: String as PropType<'light' | 'dark'>,
      default: 'light'
    },
    src: {
      type: String
    },
    name: {
      type: String
    }
  },
  setup(props) {
    const src = computed(() => props.src || '')
    const ratio = ref(0)
    const thumbnailStyle = computed(() => {
      const r = `${clamp(ratio.value * 100, 0, 100)}%`
      return {
        width: r,
        '--ratio': r
      }
    })

    const playerId = `audio-player-${uuid()}`
    const playerQuery = Taro.createSelectorQuery()
      .select(`#${playerId}`)
      .boundingClientRect()
      .select(`#${playerId} .c_audio-player__track`)
      .boundingClientRect()

    const trackLeft = ref(0)
    const trackWidth = ref(250)

    playerQuery.exec(res => {
      trackLeft.value = res[1].left
      trackWidth.value = res[1].width
    })

    // @ts-ignore
    const audio = Taro.createInnerAudioContext({ useWebAudioImplement: true })
    audio.autoplay = false
    audio.loop = false
    audio.src = src.value

    watch(
      () => props.src,
      () => {
        audio.src = props.src || ''
        duration.value = 0
        currentTime.value = 0
        isEnd.value = false
      }
    )

    /** 音频长度：秒 */
    const duration = ref<number>(0)
    /** 当前进度：秒 */
    const currentTime = ref<number>(0)

    // 音频加载完成，可以进行播放了
    audio.onCanplay(() => {
      // 获取时长
      duration.value = Math.round(audio.duration)
    })

    // 组件销毁时，销毁音频上下文
    onUnmounted(() => {
      audio.destroy()
    })

    // 音频播放进度发生变化，每间隔 1秒 左右
    audio.onTimeUpdate(() => {
      // 在拖动进度条时不计算，始终跟随手势
      if (isSliding.value) return void 0
      duration.value = Math.round(audio.duration)
      // 获取进度
      currentTime.value = Math.round(audio.currentTime)
      calcRatioByCurrentTime()
    })

    /** 通过播放进度计算进度条比例 */
    const calcRatioByCurrentTime = () => {
      // 在拖动进度条时不计算，始终跟随手势
      if (isSliding.value) return void 0
      ratio.value = clamp(currentTime.value / duration.value, 0, 1)
    }

    audio.onEnded(() => {
      isPlaying.value = false
      isEnd.value = true
      ratio.value = 1
    })

    /** 正在播放中 */
    const isPlaying = ref(false)
    const isEnd = ref(false)
    /**
     * 切换播放，如果当前音频已经播放结束，那么会重新开始播放
     */
    const togglePlay = (status?: boolean) => {
      isPlaying.value = status ?? !isPlaying.value
      if (isPlaying.value) {
        if (isEnd.value) {
          audio.currentTime = 0
        }
        isEnd.value = false
        play()
      } else {
        pause()
      }
    }
    const play = () => {
      audio.play()
    }
    const pause = () => {
      audio.pause()
    }

    const calcClientX = (e: any) => (e.touches?.[0].clientX ?? e.clientX ?? e.detail.x) - trackLeft.value

    const calcRatio = (x: number) => {
      return Math.floor(clamp(x / trackWidth.value, 0, 1) * duration.value) / duration.value
    }

    /** 进度条拖动中 */
    const isSliding = ref(false)

    /** 进度条点击，切换到对应为止 */
    const onTrackClick = (e: any) => {
      ratio.value = calcRatio(calcClientX(e))

      // 强制触发拖动结束逻辑
      isSliding.value = true
      onTrackSlideEnd()
    }

    /** 进度条拖动开始 */
    const onTrackSlideStart = () => {
      isSliding.value = true
    }

    /** 进度条拖动 */
    const onTrackSlide = (e: any) => {
      if (isSliding.value) {
        ratio.value = calcRatio(calcClientX(e))
        const current = Math.floor(ratio.value * duration.value)
        currentTime.value = current
      }
    }

    /** 进度条拖动结束 */
    const onTrackSlideEnd = () => {
      if (isSliding.value) {
        isSliding.value = false
        const current = Math.floor(ratio.value * duration.value)
        audio.currentTime = current
        currentTime.value = current
      }
    }

    const Duration = () => {
      const current = secondsToString(currentTime.value)
      const length = secondsToString(duration.value)
      return (
        <div class="c_audio-player__duration number-font">
          <div class="c_audio-player__current">
            <div class="value">{current[0]}</div>
            <div class="colon"></div>
            <div class="value">{current[1]}</div>
          </div>
          <div class="slash">／</div>
          <div class="c_audio-player__length">
            <div class="value">{length[0]}</div>
            <div class="colon"></div>
            <div class="value">{length[1]}</div>
          </div>
        </div>
      )
    }

    return () => {
      return (
        <div
          id={playerId}
          class={['c_audio-player', props.theme, isSliding.value && 'sliding']}
          onTouchmove={isSliding.value ? withModifiers(onTrackSlide, ['stop']) : undefined}
          onTouchend={onTrackSlideEnd}
        >
          <div class="c_audio-player__play" onClick={() => togglePlay()}>
            {isPlaying.value ? <Icon name="pause" /> : <Icon name="play" />}
          </div>
          <div class="c_audio-player__content">
            {props.name && <div class="c_audio-player__name">{props.name}</div>}
            <Duration />
            <div class="c_audio-player__track" onTouchstart={onTrackSlideStart} onClick={onTrackClick}>
              <div class="c_audio-player__thumbnail" style={thumbnailStyle.value}>
                <div class="c_audio-player__handle" onClick={withModifiers(() => {}, ['stop'])}></div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
})
