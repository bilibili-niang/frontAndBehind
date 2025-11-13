import { PropType, computed, defineComponent } from 'vue'
import './style.scss'
import { DeckComponent } from '../../../stores/canvas'

export { default as manifest } from './manifest'

export default defineComponent({
  name: 'C_Video',
  props: {
    comp: {
      type: Object as PropType<
        DeckComponent<{
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
      const { width, height, objectFit } = props.comp.config.ratio
      return {
        paddingBottom: Math.round((height / width) * 10000) / 100 + '%'
      }
    })
    return () => {
      const url = props.comp.config.url
      return (
        <div class="c_video" style={styleRef.value}>
          {url ? (
            <video
              style={{ objectFit: props.comp.config.ratio.objectFit }}
              src={url}
              autoplay={true}
              muted={true}
              playsinline={true}
              controls={false}
              loop={true}
            ></video>
          ) : (
            <div class="c_video__empty flex-center">请在右侧编辑区域添加视频链接</div>
          )}
        </div>
      )
    }
  }
})
