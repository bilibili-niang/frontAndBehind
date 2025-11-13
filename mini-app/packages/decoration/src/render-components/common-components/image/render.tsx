import { computed, defineComponent, type PropType } from 'vue'
import './style.scss'
import type { DeckComponent } from '../../../stores/canvas'
import { Empty } from '@anteng/ui'
import { ActionImageDefine } from '../../../widgets/action-image'
import { useAction } from '@anteng/core'

export { default as manifest } from './manifest'

export const ActionImage = defineComponent({
  props: {
    image: {
      type: Object as PropType<ActionImageDefine>,
      required: true
    },
    active: {
      type: Boolean
    }
  },
  setup(props) {
    const onClick = () => {
      useAction(props.image.action)
    }
    return () => {
      if (!props.image?.url) {
        return (
          <div class="c_image">
            <Empty/>
          </div>
        )
      }
      return (
        <div class={['c_image', props.active && '--active']}>
          <img onClick={onClick} src={props.image.url} draggable={false}/>
          {props.image.type === 'hotspot' && (
            <div class="c_image__spots">
              {props.image.spots.map((item, index) => {
                const style = {
                  width: `${item.w}%`,
                  height: `${item.h}%`,
                  left: `${item.x}%`,
                  top: `${item.y}%`
                }
                return (
                  <div
                    class="c_image__spot-item clickable"
                    style={style}
                    onClick={() => {
                      useAction(item.action)
                    }}
                  ></div>
                )
              })}
            </div>
          )}
        </div>
      )
    }
  }
})

export default defineComponent({
  props: {
    comp: {
      type: Object as PropType<
        DeckComponent<{
          image: ActionImageDefine
          borderRadius: [number, number, number, number]
        }>
      >,
      required: true
    },
    config: {
      type: Object,
      required: true
    },
    active: Boolean
  },
  setup(props) {
    const image = computed(() => props.config?.image)
    const onClick = () => {
      useAction(image.value.action)
    }
    const imageStyle = computed(() => {
      const { borderRadius = [0, 0, 0, 0] } = props.config
      return {
        borderRadius: borderRadius.map((i) => `${i}rem`).join(' ')
      }
    })
    return () => {
      if (!image.value?.url) {
        return (
          <div class="c_image">
            <Empty/>
          </div>
        )
      }
      return (
        <div class={['c_image', props.active && '--active']} style={imageStyle.value}>
          <img onClick={onClick} src={image.value.url} draggable={false}/>
          {image.value?.type === 'hotspot' && (
            <div class="c_image__spots">
              {image.value.spots.map((item) => {
                const style = {
                  width: `${item.w}%`,
                  height: `${item.h}%`,
                  left: `${item.x}%`,
                  top: `${item.y}%`
                }
                return (
                  <div
                    class="c_image__spot-item clickable"
                    style={style}
                    onClick={() => {
                      useAction(item.action)
                    }}
                  ></div>
                )
              })}
            </div>
          )}
        </div>
      )
    }
  }
})
