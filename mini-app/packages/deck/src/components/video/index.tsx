import { PropType, computed, defineComponent } from 'vue'
import './style.scss'
import { DeckComponentConfig } from '../types'
import { Video } from '@tarojs/components'

export default defineComponent({
  name: 'C_Video',
  props: {
    config: {
      type: Object as PropType<
        DeckComponentConfig<{
          url?: string
          ratio: {
            width: number
            height: number
            objectFit: 'fill' | 'cover' | 'contain'
          }
        }>
      >,
      required: true
    }
  },
  setup(props) {
    const styleRef = computed(() => {
      const { width, height } = props.config.ratio
      return {
        paddingBottom: Math.round((height / width) * 10000) / 100 + '%'
      }
    })
    return () => {
      const url = props.config.url
      if (!url) return null
      return (
        <div class="c_video" style={styleRef.value}>
          <Video
            style={{ objectFit: props.config.ratio.objectFit }}
            objectFit={props.config.ratio.objectFit}
            src={url}
            autoplay={true}
            muted={true}
            // @ts-ignore
            playsinline={true}
            controls={true}
            showCenterPlayBtn={true}
            loop={true}
            direction={90}
          ></Video>
        </div>
      )
    }
  }
})
