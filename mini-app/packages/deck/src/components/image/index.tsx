import { Image } from '@tarojs/components'
import { computed, defineComponent, PropType } from 'vue'
import './style.scss'
import { withUnit } from '@anteng/utils'
import { useAction } from '../../hooks/useAction'

export default defineComponent({
  name: 'd_image',
  props: {
    config: {
      type: Object,
      required: true
    },
    /** 拦截函数 */
    intercept: {
      type: Function as PropType<(fn: () => void) => void>
    }
  },
  emits: {
    action: (action: any) => true
  },
  setup(props, { emit }) {

    console.log('props.config===>')
    console.log(props)

    const styleRef = computed(() => {
      const { width = 10, height = 10 } = props.config?.image
      if (width > 0 && height > 0) {
        return {
          container: {
            height: 0,
            paddingBottom: `${(height / width) * 100}%`
          },
          image: {
            width: '100%',
            height: '100%',
            position: 'absolute' as any,
            borderRadius: props.config?.borderRadius?.map(i => withUnit(i)).join(' ')
          },
          imageMode: undefined
        }
      } else {
        return {
          container: {},
          image: {},
          imageMode: 'widthFix' as any
        }
      }
    })

    const onClick = (fn: () => void) => {
      props.intercept ? props.intercept(fn) : fn()
    }

    return () => {
      const { url, type, action, spots } = props.config?.image
      const longPress = props.config.longPress ?? false
      if (!url) {
        return {}
      }
      return (
        <div class="d_image" style={styleRef.value.container}>
          <Image
            class="d_image__image"
            style={styleRef.value.image}
            mode={styleRef.value.imageMode}
            src={url}
            showMenuByLongpress={longPress}
            onTap={() => {
              emit('action', action)
              onClick(() => useAction(action))
            }}
          />
          {type === 'hotspot' && (
            <div class="d_image__spots">
              {spots.map(spot => {
                const style = {
                  width: `${spot.w}%`,
                  height: `${spot.h}%`,
                  left: `${spot.x}%`,
                  top: `${spot.y}%`
                }
                return (
                  <div
                    class="d_image__spot-item"
                    key={spot.id}
                    style={style}
                    onClick={() => {
                      emit('action', spot.action)
                      onClick(() => useAction(spot.action))
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
